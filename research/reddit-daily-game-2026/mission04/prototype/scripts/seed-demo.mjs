// Seed a realistic multi-day history so screenshots show an evolved beast.
const BASE = process.env.BASE ?? 'http://localhost:8787';
const post = (p, b) => fetch(BASE + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json());
await fetch(BASE + '/api/reset', { method: 'POST' });
// Day 1: crowd piles on crown (cleave), neglects tail
const d1 = [['crown','cleave',48],['gut','cleave',22],['hide','cleave',14],['claw','cleave',10],['tail','burn',6]];
let i = 0;
for (const [z,t,n] of d1) for (let k=0;k<n;k++) await post('/api/strike',{userId:`seed${i++}`,zone:z,tool:t});
console.log('day1 advance:', await post('/api/advance',{}));
// Day 2: crowd shifts, spreads a bit
const d2 = [['gut','pierce',40],['crown','cleave',18],['claw','cleave',16],['hide','pierce',14],['tail','burn',12]];
for (const [z,t,n] of d2) for (let k=0;k<n;k++) await post('/api/strike',{userId:`seed${i++}`,zone:z,tool:t});
console.log('day2 advance:', await post('/api/advance',{}));
// Day 3: leave OPEN with a partial crowd so the live UI has data
const d3 = [['tail','pierce',9],['hide','cleave',7],['gut','pierce',5],['crown','cleave',4],['claw','burn',3]];
for (const [z,t,n] of d3) for (let k=0;k<n;k++) await post('/api/strike',{userId:`seed${i++}`,zone:z,tool:t});
console.log('seeded. state:', await (await fetch(BASE+'/api/state?userId=fresh')).json());
