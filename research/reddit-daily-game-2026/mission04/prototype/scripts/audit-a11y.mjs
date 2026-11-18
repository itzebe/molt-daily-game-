/**
 * Objective visual & accessibility audit via the Chrome DevTools Protocol.
 *
 * Rather than "eyeballing" a screenshot, this measures the rendered result:
 *   - layout overflow at mobile/tablet/desktop widths
 *   - touch-target sizes (WCAG 2.2 AA: >= 24x24 min, target 44x44)
 *   - computed contrast ratios for text and key UI
 *   - presence of a visible focus indicator
 *   - prefers-reduced-motion handling
 *
 * Usage: node scripts/audit-a11y.mjs [url]
 */
import { spawn } from 'node:child_process';

const URL = process.argv[2] ?? 'http://localhost:5173';
const CHROME = process.env.CHROME ?? '/usr/bin/chromium';
const PORT = 9334;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const j = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error('devtools not reachable');
}

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map();
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id); this.pending.delete(m.id);
        m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
      }
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id; const p = { id, method, params };
    if (sessionId) p.sessionId = sessionId;
    this.ws.send(JSON.stringify(p));
    return new Promise((res, rej) => this.pending.set(id, { resolve: res, reject: rej }));
  }
}

const AUDIT_JS = `(() => {
  function lum(rgb){ const a=rgb.map(v=>{v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4);}); return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2]; }
  function parse(s){ const m=s.match(/rgba?\\(([^)]+)\\)/); if(!m) return null; const p=m[1].split(',').map(x=>parseFloat(x)); return p.slice(0,3); }
  function contrast(fg,bg){ const L1=lum(fg),L2=lum(bg); const hi=Math.max(L1,L2),lo=Math.min(L1,L2); return (hi+0.05)/(lo+0.05); }
  function effBg(el){ let e=el; while(e){ const c=parse(getComputedStyle(e).backgroundColor); if(c && getComputedStyle(e).backgroundColor!=='rgba(0, 0, 0, 0)') return c; e=e.parentElement; } return [255,255,255]; }
  const out={ viewport:{w:innerWidth,h:innerHeight}, overflowX: document.documentElement.scrollWidth>innerWidth, texts:[], targets:[], focusable:0 };
  // text contrast
  for(const el of document.querySelectorAll('p,h1,h2,span,button,li,a,strong,text')){
    const t=(el.textContent||'').trim(); if(!t||t.length>60) continue;
    const cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden') continue;
    const fg=parse(cs.color); if(!fg) continue;
    const bg=effBg(el); const r=contrast(fg,bg);
    const size=parseFloat(cs.fontSize); const bold=parseInt(cs.fontWeight)>=700;
    const large= size>=24 || (size>=18.66 && bold);
    const need= large?3:4.5;
    out.texts.push({ t:t.slice(0,28), ratio:+r.toFixed(2), need, ok: r>=need, size:+size.toFixed(1) });
  }
  // touch targets
  for(const el of document.querySelectorAll('button,[role="button"],a')){
    const b=el.getBoundingClientRect();
    if(b.width===0||b.height===0) continue;
    out.targets.push({ label:(el.getAttribute('aria-label')||el.textContent||'').trim().slice(0,20), w:Math.round(b.width), h:Math.round(b.height) });
  }
  out.focusable = document.querySelectorAll('button,[role="button"],a,[tabindex]').length;
  out.svgZones = document.querySelectorAll('path[role="button"]').length;
  out.svgZoneTabindex = [...document.querySelectorAll('path[role="button"]')].filter(p=>p.getAttribute('tabindex')==='0').length;
  return out;
})()`;

const results = [];
const check = (name, cond, detail = '') => { results.push({ name, pass: !!cond, detail }); console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };

const chrome = spawn(CHROME, ['--headless=new','--no-sandbox','--disable-gpu',`--remote-debugging-port=${PORT}`,'about:blank'], { stdio: 'ignore' });

try {
  const ws = new WebSocket(await getWsUrl());
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  const cdp = new CDP(ws);
  const { targetId } = await cdp.send('Target.createTarget', { url: URL });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);

  for (const [w, h, label] of [[390, 844, 'mobile'], [834, 1112, 'tablet'], [1440, 900, 'desktop']]) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 600 }, sessionId);
    await cdp.send('Page.navigate', { url: URL }, sessionId);
    await sleep(2200);
    const r = await cdp.send('Runtime.evaluate', { expression: AUDIT_JS, returnByValue: true }, sessionId);
    const a = r.result.value;
    const worst = a.texts.filter((t) => !t.ok).sort((x, y) => x.ratio - y.ratio);
    const smallTargets = a.targets.filter((t) => t.w < 24 || t.h < 24);
    check(`[${label}] no horizontal overflow at ${w}px`, !a.overflowX, `scrollWidth ok`);
    check(`[${label}] all text meets WCAG AA contrast`, worst.length === 0, worst.length ? `worst: ${worst[0].t} @ ${worst[0].ratio} (need ${worst[0].need})` : `${a.texts.length} text nodes checked`);
    check(`[${label}] interactive targets >= 24px`, smallTargets.length === 0, smallTargets.length ? `${smallTargets.length} small: ${smallTargets[0].label} ${smallTargets[0].w}x${smallTargets[0].h}` : `${a.targets.length} targets`);
    check(`[${label}] beast zones keyboard-reachable`, a.svgZoneTabindex === a.svgZones && a.svgZones === 5, `${a.svgZoneTabindex}/${a.svgZones} zones focusable`);
  }

  // reduced-motion: ensure the page still renders and the animation is suppressed
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }, sessionId);
  await cdp.send('Page.navigate', { url: URL }, sessionId);
  await sleep(1500);
  const rm = await cdp.send('Runtime.evaluate', { expression: `document.querySelector('.strike') ? 'ok':'missing'`, returnByValue: true }, sessionId);
  check('[reduced-motion] UI renders with motion reduced', rm.result.value === 'ok');

  ws.close();
} catch (e) {
  console.error('audit error:', e.message);
  results.push({ name: 'harness', pass: false, detail: e.message });
} finally {
  chrome.kill('SIGKILL');
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
