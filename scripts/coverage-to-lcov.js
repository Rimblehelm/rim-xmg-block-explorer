#!/usr/bin/env node
// Minimal converter from Istanbul/coverage-final.json -> LCOV (coverage/lcov.info)
// Usage: node scripts/coverage-to-lcov.js [input.json] [output.lcov]

const fs = require('fs');
const path = require('path');

const [,, input = 'coverage/coverage-final.json', output = 'coverage/lcov.info'] = process.argv;

if (!fs.existsSync(input)) {
  console.error(`No coverage JSON found at ${input}`);
  process.exit(0); // not an error for CI; nothing to convert
}

const data = JSON.parse(fs.readFileSync(input, 'utf8'));
let out = '';

function esc(str) {
  return ('' + str).replace(/\r?\n/g, '\\n');
}

for (const filePath of Object.keys(data)) {
  const file = data[filePath];
  const absPath = file.path || filePath;
  out += `SF:${absPath}\n`;

  // Functions
  const fnMap = file.fnMap || {};
  const fCounts = file.f || {};
  for (const id of Object.keys(fnMap)) {
    const fn = fnMap[id];
    const name = fn.name || `fn_${id}`;
    const line = (fn.decl && fn.decl.start && fn.decl.start.line) || (fn.loc && fn.loc.start && fn.loc.start.line) || 0;
    out += `FN:${line},${esc(name)}\n`;
  }
  for (const id of Object.keys(fCounts)) {
    const cnt = fCounts[id];
    const name = (fnMap[id] && fnMap[id].name) || `fn_${id}`;
    out += `FNDA:${cnt},${esc(name)}\n`;
  }
  const fnTotal = Object.keys(fnMap).length;
  const fnHit = Object.keys(fCounts).filter(k => (fCounts[k]||0) > 0).length;
  out += `FNF:${fnTotal}\nFNH:${fnHit}\n`;

  // Statements
  const stmtMap = file.statementMap || {};
  const sCounts = file.s || {};
  let lf = 0; let lh = 0;
  for (const id of Object.keys(stmtMap)) {
    const stmt = stmtMap[id];
    const line = (stmt.start && stmt.start.line) || 0;
    const cnt = sCounts[id] || 0;
    out += `DA:${line},${cnt}\n`;
    lf += 1; if (cnt > 0) lh += 1;
  }

  // Branches
  const branchMap = file.branchMap || {};
  const bCounts = file.b || {};
  let brTotal = 0; let brHit = 0;
  for (const id of Object.keys(branchMap)) {
    const br = branchMap[id];
    const locations = br.locations || [];
    const counts = bCounts[id] || [];
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      const line = (loc && loc.start && loc.start.line) || (br.line) || 0;
      const taken = (typeof counts[i] === 'number') ? counts[i] : 0;
      const takenStr = (taken > 0) ? taken : 0;
      out += `BRDA:${line},${id},${i},${takenStr}\n`;
      brTotal += 1; if (taken > 0) brHit += 1;
    }
  }
  out += `BRF:${brTotal}\nBRH:${brHit}\n`;

  out += `LF:${lf}\nLH:${lh}\n`;
  out += `end_of_record\n`;
}

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, out, 'utf8');
console.log(`Wrote LCOV to ${output}`);
process.exit(0);
