import { describe, expect, it } from 'vitest';
import { createApp } from '../src/server/app.ts';
import { MemoryStore } from '../src/server/store.ts';

describe('server API — submission rules', () => {
  it('accepts a valid strike and rejects a duplicate for the same user (409)', async () => {
    const app = createApp(new MemoryStore());
    const r1 = await app.request('/api/strike', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'u1', zone: 'crown', tool: 'cleave' }),
    });
    expect(r1.status).toBe(200);
    const b1 = await r1.json();
    expect(b1.ok).toBe(true);
    expect(b1.damage).toBeGreaterThan(0);

    const r2 = await app.request('/api/strike', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'u1', zone: 'tail', tool: 'pierce' }),
    });
    expect(r2.status).toBe(409);
    const b2 = await r2.json();
    expect(b2.reason).toBe('duplicate');
  });

  it('rejects invalid zone and tool (400)', async () => {
    const app = createApp(new MemoryStore());
    const bad = await app.request('/api/strike', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'u1', zone: 'elbow', tool: 'cleave' }),
    });
    expect(bad.status).toBe(400);
    expect((await bad.json()).reason).toBe('invalid-zone');

    const bad2 = await app.request('/api/strike', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'u1', zone: 'crown', tool: 'laser' }),
    });
    expect(bad2.status).toBe(400);
    expect((await bad2.json()).reason).toBe('invalid-tool');
  });

  it('state reflects the shared crowd and your lock status', async () => {
    const store = new MemoryStore();
    const app = createApp(store);
    for (let i = 0; i < 6; i++) {
      await app.request('/api/strike', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: `u${i}`, zone: 'crown', tool: 'cleave' }),
      });
    }
    const s = await (await app.request('/api/state?userId=u0')).json();
    expect(s.strikerCount).toBe(6);
    expect(s.alreadyStruck).toBe(true);
    expect(s.yourStrike).toEqual({ zone: 'crown', tool: 'cleave' });
    const crown = s.zones.find((z: { id: string }) => z.id === 'crown');
    expect(crown.crowdBand).toBe('herd'); // 6/6 = 100%
  });

  it('a strike that is contrarian and effective is flagged as a read', async () => {
    const store = new MemoryStore();
    const app = createApp(store);
    // 100 herd strikes on crown:cleave to set the split, then one contrarian read.
    for (let i = 0; i < 100; i++) {
      await app.request('/api/strike', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: `herd${i}`, zone: 'crown', tool: 'cleave' }),
      });
    }
    const r = await app.request('/api/strike', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'reader', zone: 'gut', tool: 'pierce' }),
    });
    const b = await r.json();
    expect(b.crowdLabel).toBe('read'); // <3% chose gut:pierce
    expect(b.isRead).toBe(true); // pierce vs exposed = 1.0 (effective) and contrarian
  });
});

describe('server API — day advance & history', () => {
  it('advance resolves the day, molts the beast, and records history', async () => {
    const store = new MemoryStore();
    const app = createApp(store);
    for (let i = 0; i < 60; i++) {
      await app.request('/api/strike', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: `u${i}`, zone: 'crown', tool: 'cleave' }),
      });
    }
    const adv = await (await app.request('/api/advance', { method: 'POST' })).json();
    expect(adv.ok).toBe(true);
    expect(adv.day).toBe(1);
    expect(adv.n).toBe(60);
    // 60 herd strikes: crown 100% → armoured next day
    const s = await (await app.request('/api/state?userId=newbie')).json();
    expect(s.day).toBe(2);
    expect(s.zones.find((z: { id: string }) => z.id === 'crown').state).toBe('armoured');
    expect(s.moltNote).toMatch(/armoured/);

    const hist = await (await app.request('/api/history')).json();
    expect(hist.entries.length).toBe(1);
    expect(hist.entries[0].day).toBe(1);
  });

  it('new day accepts a fresh strike from a user who struck yesterday', async () => {
    const store = new MemoryStore();
    const app = createApp(store);
    await app.request('/api/strike', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'u1', zone: 'crown', tool: 'cleave' }),
    });
    await app.request('/api/advance', { method: 'POST' });
    const r = await app.request('/api/strike', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'u1', zone: 'tail', tool: 'pierce' }),
    });
    expect(r.status).toBe(200);
  });
});
