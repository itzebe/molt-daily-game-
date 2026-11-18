// Reproduce the §4 worked example of GAME_MECHANICS_SPECIFICATION.md exactly.
import { damageFor, crowdFactor } from '../src/engine/resolve.ts';
import { genesisState } from '../src/engine/molt.ts';
import { ZONE_VALUE } from '../src/engine/rules.ts';
const s = genesisState(1);
console.log('gut:pierce @2% share (exposed):', damageFor({zone:'gut',tool:'pierce'}, s, 0.02), 'spec says 53');
const armoured = {...s, zoneState:{...s.zoneState, crown:'armoured'}};
console.log('crown:cleave @40% share (armoured):', damageFor({zone:'crown',tool:'cleave'}, armoured, 0.40), 'spec says 34');
console.log('tail base value:', ZONE_VALUE.tail, '(spec §1.1 says 16)');
