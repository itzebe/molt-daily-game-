/**
 * Independent browser verification of the MOLT prototype via the Chrome DevTools
 * Protocol. This is an *independent* verification harness: it drives the real UI
 * in a real browser and asserts on the resulting DOM, rather than trusting the
 * implementation agent's claims.
 *
 * Usage: node scripts/verify-ui.mjs [url]
 * Requires a running client (vite) and server.
 */
import { spawn } from 'node:child_process';

const URL = process.argv[2] ?? 'http://localhost:5173';
const CHROME = process.env.CHROME ?? '/usr/bin/chromium';
const PORT = 9333;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const j = await r.json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error('chrome devtools not reachable');
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    this.ws.send(JSON.stringify(payload));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
}

const results = [];
function check(name, cond, detail = '') {
  results.push({ name, pass: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

const chrome = spawn(CHROME, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--remote-debugging-port=' + PORT,
  '--window-size=430,900',
  'about:blank',
], { stdio: 'ignore' });

try {
  const wsUrl = await getWsUrl();
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res);
    ws.addEventListener('error', rej);
  });
  const cdp = new CDP(ws);

  const { targetId } = await cdp.send('Target.createTarget', { url: URL });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);

  // Reset the game so the run is deterministic.
  await cdp.send('Runtime.evaluate', {
    expression: `fetch('/api/reset',{method:'POST'})`,
    awaitPromise: true,
  }, sessionId);

  // reload to pick up the reset state
  await cdp.send('Page.navigate', { url: URL }, sessionId);
  await sleep(2500);

  const evalJs = async (expr) => {
    const r = await cdp.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    }, sessionId);
    return r.result?.value;
  };

  // 1. Beast + zones rendered
  const svgPaths = await evalJs(`document.querySelectorAll('svg[role="group"] path[role="button"]').length`);
  check('beast renders 5 selectable zones', svgPaths === 5, `found ${svgPaths}`);

  // 2. Primary action present
  const strikeText = await evalJs(`[...document.querySelectorAll('button')].map(b=>b.textContent).join('|')`);
  check('primary STRIKE action present', /STRIKE/.test(strikeText), strikeText.slice(0, 80));

  // 3. Click a zone (crown = first selectable path)
  await evalJs(`document.querySelectorAll('svg[role="group"] path[role="button"]')[0].dispatchEvent(new MouseEvent('click',{bubbles:true}))`);
  await sleep(200);
  const readout = await evalJs(`document.querySelector('.readout')?.textContent ?? ''`);
  check('selecting a zone updates the readout', /Crown/.test(readout), readout.trim());

  // 4. Select a tool (first tool button)
  await evalJs(`[...document.querySelectorAll('.tool')][0].click()`);
  await sleep(200);
  const toolOn = await evalJs(`document.querySelectorAll('.tool-on').length`);
  check('a tool can be selected', toolOn === 1, `tool-on count ${toolOn}`);

  // 5. Strike and read the result
  await evalJs(`document.querySelector('.strike').click()`);
  await sleep(900);
  const resultText = await evalJs(`document.querySelector('.result')?.textContent ?? ''`);
  check('strike produces a result card with damage', /−\d+/.test(resultText), resultText.replace(/\s+/g,' ').trim().slice(0, 90));

  // 6. Duplicate strike is blocked (button disabled / label changes)
  const afterStrike = await evalJs(`document.querySelector('.strike')?.textContent ?? ''`);
  check('second strike is blocked after the first', /back tomorrow|Struck/i.test(afterStrike), afterStrike.trim());

  // 7. Server rejects a duplicate at the API level too
  const uid = await evalJs(`localStorage.getItem('molt-uid')`);
  const dup = await evalJs(`fetch('/api/strike',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:${JSON.stringify(uid)},zone:'tail',tool:'burn'})}).then(r=>r.status)`);
  check('server rejects duplicate strike (409)', dup === 409, `status ${dup}`);

  // 8. Advance day → molt note appears
  await evalJs(`fetch('/api/advance',{method:'POST'}).then(r=>r.json())`);
  await cdp.send('Page.navigate', { url: URL }, sessionId);
  await sleep(2000);
  const dayText = await evalJs(`document.querySelector('.sub')?.textContent ?? ''`);
  check('day advanced after molt', /day 2/.test(dayText), dayText.trim());
  const moltNote = await evalJs(`document.querySelector('.molt-note')?.textContent ?? ''`);
  check('molt explanation is shown to the player', moltNote.length > 0, moltNote.trim().slice(0, 100));

  // 9. Bestiary shows the resolved day
  const bestiary = await evalJs(`document.querySelector('.bestiary')?.textContent ?? ''`);
  check('bestiary records the previous round', /day 1/.test(bestiary), bestiary.replace(/\s+/g,' ').trim().slice(0, 90));

  // 10. Accessibility: zones have accessible names
  const ariaLabels = await evalJs(`[...document.querySelectorAll('path[role="button"]')].map(p=>p.getAttribute('aria-label')).join('|')`);
  check('zones expose accessible names/states', /Crown:/.test(ariaLabels), ariaLabels.slice(0, 80));

  ws.close();
} catch (e) {
  console.error('verification error:', e.message);
  results.push({ name: 'harness', pass: false, detail: e.message });
} finally {
  chrome.kill('SIGKILL');
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
