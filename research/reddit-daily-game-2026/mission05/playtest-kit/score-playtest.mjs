#!/usr/bin/env node
/**
 * MISSION 05 — MOLT playtest scorer.
 *
 * Reads an observation sheet (CSV, one row per participant) and computes the
 * seven P-criteria from MOLT_PLAYTEST_PROTOCOL.md §5 plus the Mission 05 metrics
 * (enjoyment per group, replay intention per group), reporting raw counts and
 * percentages separately for the non-gamer (N) and gamer (G) groups.
 *
 * Usage:  node playtest-kit/score-playtest.mjs <sheet.csv>
 *
 * It makes NO statistical-significance claim (n=4/group). It refuses to invent
 * data: missing cells are reported as missing, never defaulted to a pass.
 */
import { readFileSync } from 'node:fs';

const path = process.argv[2];
if (!path) {
  console.error('usage: node score-playtest.mjs <sheet.csv>');
  process.exit(2);
}

const raw = readFileSync(path, 'utf8').trim().split(/\r?\n/);
const header = raw[0].split(',');
const rows = raw.slice(1).map((line) => {
  const cells = line.split(',');
  const o = {};
  header.forEach((h, i) => (o[h] = (cells[i] ?? '').trim()));
  return o;
});

const yes = (v) => /^(y|yes|true|1)$/i.test(v);
const num = (v) => (v === '' || v == null ? NaN : Number(v));
const N = rows.filter((r) => r.group === 'N');
const G = rows.filter((r) => r.group === 'G');
const all = rows;

const pct = (k, d) => (d === 0 ? 'n/a' : `${Math.round((100 * k) / d)}%`);
const pctStr = (k, d) => `${k}/${d} = ${pct(k, d)}`;
const avg = (arr) => {
  const v = arr.filter((x) => Number.isFinite(x));
  return v.length ? (v.reduce((a, b) => a + b, 0) / v.length) : NaN;
};

console.log('================================================================');
console.log('MOLT — PLAYTEST SCORER');
console.log(`sheet: ${path}`);
console.log(`participants: ${rows.length}  (N=${N.length}, G=${G.length})`);
console.log('================================================================\n');

if (rows.length < 8) {
  console.log(`WARNING: only ${rows.length} participants. The protocol targets 8 (4+4).`);
  console.log('         Percentages at n=4 are coarse and carry NO statistical significance.\n');
}

const results = [];

// P1 — non-gamers complete a first strike unaided
const p1 = N.filter((r) => Number.isFinite(num(r.first_strike_seconds))).length;
results.push(['P1', 'Non-gamers complete a first strike', p1, N.length, p1 >= 3, '≥3/4']);

// P2 — non-gamers can name ≥3 zones after 30 s
const p2 = N.filter((r) => yes(r.could_name_3_zones)).length;
results.push(['P2', 'Non-gamers name ≥3 zones', p2, N.length, p2 >= 3, '≥3/4']);

// P3 — any participant explains the crowd factor unaided
const p3 = all.filter((r) => yes(r.explained_crowd_factor)).length;
results.push(['P3', 'Any explains the crowd factor', p3, all.length, p3 >= 5, '≥5/8']);

// P4 — any participant forms a day-2 plan
const p4 = all.filter((r) => yes(r.formed_day2_plan)).length;
results.push(['P4', 'Any forms a day-2 plan', p4, all.length, p4 >= 5, '≥5/8']);

// P5 — any participant connects crowd → molt
const p5 = all.filter((r) => yes(r.connected_crowd_to_molt)).length;
results.push(['P5', 'Any connects crowd → molt', p5, all.length, p5 >= 4, '≥4/8']);

// P6 — voluntary replay intention
const p6 = all.filter((r) => yes(r.would_return_tomorrow)).length;
results.push(['P6', 'Would return tomorrow', p6, all.length, p6 >= 5, '≥5/8']);

// P7 — median time to first strike (group N) ≤ 60 s
const times = N.map((r) => num(r.first_strike_seconds)).filter(Number.isFinite).sort((a, b) => a - b);
const median = times.length === 0 ? NaN : (times.length % 2 ? times[(times.length - 1) / 2] : (times[times.length / 2 - 1] + times[times.length / 2]) / 2);
results.push(['P7', 'Median time to first strike (N)', Number.isFinite(median) ? median : NaN, 60, Number.isFinite(median) && median <= 60, '≤60 s']);

console.log('--- Mission 05 acceptance thresholds (P1–P7) ---');
for (const [id, label, got, denom, pass, target] of results) {
  const shown = id === 'P7' ? `${Number.isFinite(got) ? got + ' s' : 'n/a'} (${target})` : `${pctStr(got, denom)} (${target})`;
  console.log(`  ${id}  ${pass ? 'PASS' : 'FAIL'}  ${label.padEnd(34)} ${shown}`);
}

// Mission 05 metrics — enjoyment + replay, per group
console.log('\n--- Enjoyment (five-point scale), per group ---');
for (const [name, grp] of [['non-gamers (N)', N], ['gamers (G)', G]]) {
  const e = avg(grp.map((r) => num(r.enjoyment_1to5)));
  const n = grp.map((r) => num(r.enjoyment_1to5)).filter(Number.isFinite).length;
  console.log(`  ${name.padEnd(15)} average = ${Number.isFinite(e) ? e.toFixed(2) : 'n/a'} / 5   (n=${n})   threshold ≥4/5  -> ${Number.isFinite(e) && e >= 4 ? 'PASS' : 'FAIL'}`);
}

console.log('\n--- Voluntary replay intention, per group ---');
for (const [name, grp] of [['non-gamers (N)', N], ['gamers (G)', G]]) {
  const k = grp.filter((r) => yes(r.would_return_tomorrow)).length;
  const d = grp.length;
  console.log(`  ${name.padEnd(15)} ${pctStr(k, d)}   threshold ≥70%  -> ${d > 0 && k / d >= 0.7 ? 'PASS' : 'FAIL'}`);
}

// Secondary signals
console.log('\n--- Secondary signals (mean / 5, where collected) ---');
for (const [key, label] of [['agency_1to5', 'perceived agency'], ['fairness_1to5', 'fairness of scoring'], ['curiosity_1to5', 'curiosity about next molt'], ['social_prediction_1to5', 'enjoyed social prediction']]) {
  const e = avg(all.map((r) => num(r[key])));
  console.log(`  ${label.padEnd(28)} ${Number.isFinite(e) ? e.toFixed(2) : 'n/a'} / 5`);
}

// First-strike completion + within-30s, whole sample
const completed = all.filter((r) => Number.isFinite(num(r.first_strike_seconds))).length;
const within30 = all.filter((r) => Number.isFinite(num(r.first_strike_seconds)) && num(r.first_strike_seconds) <= 30).length;
console.log('\n--- Mission 05 completion metrics (whole sample) ---');
console.log(`  first-strike completion   ${pctStr(completed, all.length)}   threshold ≥90% -> ${all.length > 0 && completed / all.length >= 0.9 ? 'PASS' : 'FAIL'}`);
console.log(`  first strike within 30 s  ${pctStr(within30, all.length)}   threshold ≥80% -> ${all.length > 0 && within30 / all.length >= 0.8 ? 'PASS' : 'FAIL'}`);

// Overall
const pPass = results.filter((r) => r[4]).length;
console.log(`\n--- Overall: ${pPass}/${results.length} P-criteria pass ---`);
console.log(pPass === results.length ? 'ALL THRESHOLDS MET (subject to the n=4 caveat)' : 'SOME THRESHOLDS FAILED — see FAIL rows above');
console.log('\nReminder: a small qualitative sample cannot prove broad market demand even if all thresholds pass.');
