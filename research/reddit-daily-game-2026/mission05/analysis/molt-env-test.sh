#!/usr/bin/env bash
set -u
B=http://localhost:8787
S() { curl -s -X POST "$B/api/strike" -H 'content-type: application/json' -d "$1"; }
reset=$(curl -s -X POST "$B/api/reset"); echo "reset: $reset"
echo "--- 8 distinct participants strike day 1 (one combo each) ---"
# Deliberately concentrate on crown to force an armour molt, leave tail untouched (raw).
S '{"userId":"P01","zone":"crown","tool":"cleave"}' >/dev/null
S '{"userId":"P02","zone":"crown","tool":"cleave"}' >/dev/null
S '{"userId":"P03","zone":"crown","tool":"pierce"}' >/dev/null
S '{"userId":"P04","zone":"crown","tool":"burn"}'   >/dev/null
S '{"userId":"P05","zone":"hide","tool":"cleave"}'  >/dev/null
S '{"userId":"P06","zone":"gut","tool":"pierce"}'   >/dev/null
S '{"userId":"P07","zone":"claw","tool":"cleave"}'  >/dev/null
S '{"userId":"P08","zone":"tail","tool":"pierce"}'  >/dev/null
echo "state after 8 strikes:"
curl -s "$B/api/state?userId=P01" | python3 -c "import sys,json; d=json.load(sys.stdin); print('  day',d['day'],'strikers',d['strikerCount']); [print('   ',z['id'],z['state'],'band='+str(z['crowdBand'])) for z in d['zones']]"
echo "--- duplicate strike by P01 must be refused (409) ---"
curl -s -o /dev/null -w "  HTTP %{http_code}\n" -X POST "$B/api/strike" -H 'content-type: application/json' -d '{"userId":"P01","zone":"tail","tool":"burn"}'
echo "--- advance the day (genuine molt from the 8 real submissions) ---"
curl -s -X POST "$B/api/advance" | python3 -c "import sys,json; d=json.load(sys.stdin); print('  outcome',d['outcome'],'totalDamage',d['totalDamage'],'integrity',d['integrity'],'n',d['n'],'topTool',d['topTool'])"
echo "--- day 2 state (molt result) ---"
curl -s "$B/api/state?userId=P01" | python3 -c "import sys,json; d=json.load(sys.stdin); print('  day',d['day']); [print('   ',z['id'],z['state']) for z in d['zones']]; print('  moltNote:',d['moltNote']); print('  fatiguedTool:',d['fatiguedTool'])"
echo "--- history ---"
curl -s "$B/api/history" | python3 -m json.tool
