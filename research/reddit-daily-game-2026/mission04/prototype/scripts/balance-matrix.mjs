import { TOOLS, ZONES } from '../src/engine/rules.ts';
import { damageFor, resolveDay } from '../src/engine/resolve.ts';
import { genesisState, molt } from '../src/engine/molt.ts';
const C=(z,t)=>z+':'+t;
function bestResp(state,sh){let b={zone:"crown",tool:"cleave",d:-1};for(const z of ZONES)for(const t of TOOLS){const d=damageFor({zone:z,tool:t},state,sh[C(z,t)]??0);if(d>b.d)b={zone:z,tool:t,d};}return b;}
function leastUsed(state,sh){let bz=ZONES[0],bv=Infinity;for(const z of ZONES){let v=0;for(const t of TOOLS)v+=sh[C(z,t)]??0;if(v<bv){bv=v;bz=z;}}let bt=TOOLS[0],bd=-1;for(const t of TOOLS){const d=damageFor({zone:bz,tool:t},state,0);if(d>bd){bd=d;bt=t;}}return {zone:bz,tool:bt};}
// Define strategies as functions of (state,shares)
const STRAT={
  chaser:(st,sh)=>bestResp(st,sh),
  loyal:(st,sh)=>({zone:'crown',tool:'cleave'}),
  contrarian:(st,sh)=>leastUsed(st,sh),
  crownPierce:(st,sh)=>({zone:'crown',tool:'pierce'}),
  gutCleave:(st,sh)=>({zone:'gut',tool:'cleave'}),
};
const names=Object.keys(STRAT);
// A crowd = 80 players all playing strategy `crowdName` with 20% noise.
let rng=7; const rand=()=>(rng=(rng*1103515245+12345)&0x7fffffff)/0x7fffffff;
function run(crowdName, days=90){
  let state=genesisState(1), sh={};
  const totals=Object.fromEntries(names.map(n=>[n,0]));
  for(let d=1;d<=days;d++){
    const subs=[];let k=0;
    for(let i=0;i<80;i++){let p=STRAT[crowdName](state,sh);let z=p.zone,t=p.tool;if(rand()<0.2){z=ZONES[Math.floor(rand()*5)];t=TOOLS[Math.floor(rand()*3)];}subs.push({userId:'c'+k++,strike:{zone:z,tool:t}});}
    const probes={}; for(const n of names){const p=STRAT[n](state,sh);probes[n]=p; subs.push({userId:'p_'+n,strike:p});}
    const res=resolveDay(d,state,subs);
    sh={};for(const kk of Object.keys(res.aggregate.comboCount))sh[kk]=res.aggregate.comboCount[kk]/res.n;
    for(const n of names){const p=probes[n];totals[n]+=damageFor({zone:p.zone,tool:p.tool},state,sh[C(p.zone,p.tool)]??0);}
    state=molt({nextDay:d+1,resolution:res,recentZoneShares:[res.zoneShare],previousState:state});
  }
  return totals;
}
console.log('Payoff matrix: rows = probe strategy, cols = crowd strategy (90 days, 80 players)');
const header=['probe'.padEnd(12), ...names.map(n=>n.padStart(11))].join('');
console.log(header);
for(const probe of names){
  const row=[probe.padEnd(12)];
  for(const crowd of names){ const t=run(crowd); row.push(String(t[probe]).padStart(11)); }
  console.log(row.join(''));
}
console.log('\n(diagonal-agnostic: a healthy minority game shows each strategy winning in SOME column)');
