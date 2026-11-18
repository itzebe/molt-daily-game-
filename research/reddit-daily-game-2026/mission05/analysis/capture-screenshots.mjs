/**
 * MISSION 05 — capture screenshots of the frozen MOLT build.
 *
 * Drives the real UI in headless Chromium via CDP and captures the beast after a
 * genuine 8-participant molt (Crown armoured). This documents the tested build
 * visually. Requires the server (:8787) and vite client (:5173) running, and that
 * the 8-participant molt has already been applied (see analysis/molt-env-test.sh).
 *
 * Usage: node analysis/capture-screenshots.mjs
 */
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const CHROME = process.env.CHROME ?? '/usr/bin/chromium';
const PORT = 9334;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wsUrl() {
  // Page-level target (browser-level endpoint does not expose Page.*).
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error('devtools unreachable');
}

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map();
    ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && this.pending.has(m.id)) { this.pending.get(m.id)(m); this.pending.delete(m.id); } }); }
  send(method, params = {}) { const id = ++this.id; return new Promise((res) => { this.pending.set(id, res); this.ws.send(JSON.stringify({ id, method, params })); }); }
}

async function shot(cdp, width, height, file) {
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 500 });
  await cdp.send('Page.navigate', { url: 'http://localhost:5173' });
  await sleep(2500);
  const r = await cdp.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(file, Buffer.from(r.result.data, 'base64'));
  console.log(`  wrote ${file} (${width}x${height})`);
}

const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, '--no-sandbox', '--disable-gpu', '--window-size=1440,900', 'about:blank'], { stdio: 'ignore' });
try {
  const cdp = new CDP(await new Promise((res, rej) => {
    wsUrl().then((u) => { const ws = new WebSocket(u); ws.addEventListener('open', () => res(ws)); ws.addEventListener('error', rej); }).catch(rej);
  }));
  await cdp.send('Page.enable');
  console.log('Capturing frozen build:');
  await shot(cdp, 1440, 900, 'evidence/screenshots/desktop.png');
  await shot(cdp, 834, 1112, 'evidence/screenshots/tablet.png');
  await shot(cdp, 390, 844, 'evidence/screenshots/mobile.png');
} finally {
  proc.kill('SIGKILL');
}
console.log('done');
