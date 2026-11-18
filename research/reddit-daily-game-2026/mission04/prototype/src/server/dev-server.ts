/**
 * Local dev server for the MOLT prototype.
 *
 * This is the LOCAL stand-in for the Devvit runtime. In the Devvit deployment the
 * same `createApp()` Hono app is mounted by Devvit Web; here we serve it over
 * plain HTTP and also serve the built client from `dist/` when present.
 *
 * Run:  node --experimental-strip-types src/server/dev-server.ts
 */
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { createApp } from './app.ts';

const port = Number(process.env.PORT ?? 8787);
const app = createApp();

// Serve the built client if it exists (production preview).
app.use('/*', serveStatic({ root: './dist' }));

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`MOLT dev server on http://localhost:${info.port}`);
});
