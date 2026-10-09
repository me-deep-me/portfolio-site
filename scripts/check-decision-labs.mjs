import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Exercise the same pure public models used by the browser. No production code.
const source = readFileSync(new URL('../src/data/lab-models.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const modelExports = {};
new Function('exports', compiled)(modelExports);
const { sheetModel, freightModel, loadModel, crateModel, scheduleModel, contactModel, reportModel } = modelExports;
let cases = 0;

for (let quantity = 4; quantity <= 32; quantity++) for (const rotate of [false, true]) for (const gap of [0, 5, 20]) {
  const model = sheetModel(quantity, rotate, gap);
  assert.equal(model.placements.length, quantity);
  assert(model.utilisation > 0 && model.utilisation <= 100);
  for (const panel of model.placements) {
    assert(panel.x >= 0 && panel.y >= 0 && panel.x + panel.width <= model.sheetWidth && panel.y + panel.height <= model.sheetHeight);
    for (const other of model.placements.filter(item => item.sheet === panel.sheet && item.id > panel.id)) {
      assert(panel.x + panel.width <= other.x || other.x + other.width <= panel.x || panel.y + panel.height <= other.y || other.y + other.height <= panel.y, 'Panels must not overlap');
    }
  }
  cases++;
}
for (const quantity of [5, 30, 80]) for (const large of [false, true]) for (const allowance of [0, 10, 30]) {
  const model = freightModel(quantity, large, allowance);
  assert(model.volume <= model.containers * model.containerVolume * 0.8);
  assert(model.utilisation <= 80);
  cases++;
}
for (const quantity of [5, 18, 40]) for (const large of [false, true]) for (const oversized of [false, true]) {
  const model = loadModel(quantity, large, oversized);
  assert.equal(model.rows.length, quantity);
  assert.equal(model.included, model.rows.filter(item => item.included).length);
  assert(model.weight <= 24000 && model.utilisation <= 80);
  if (oversized && !large) assert(model.rows.some(item => item.reason === 'Length check failed'));
  cases++;
}
for (const quantity of [4, 14, 30]) for (const maxWeight of [100, 230, 400]) for (const pallet of [false, true]) {
  const model = crateModel(quantity, maxWeight, pallet);
  assert.equal(model.packages.reduce((sum, item) => sum + item.units, 0), quantity);
  assert(model.packages.every(item => item.weight <= maxWeight && item.units <= model.slots));
  cases++;
}
for (const capacity of [4, 8, 12]) for (const urgent of [false, true]) for (const due of [2, 5, 10]) {
  const model = scheduleModel(capacity, urgent, due);
  assert(model.load > 0 && model.load <= 100);
  assert.equal(model.late, Math.max(0, model.priorityEnd - due));
  if (urgent) assert(model.priorityEnd <= scheduleModel(capacity, false, due).priorityEnd);
  cases++;
}
for (const normalise of [false, true]) for (const duplicates of [false, true]) {
  const model = contactModel(normalise, duplicates);
  assert.equal(model.rows.length, 24);
  assert(model.readiness >= 0 && model.readiness <= 100);
  assert.equal(model.ready, model.rows.filter(item => item.status === 'Ready for review').length);
  cases++;
}
assert(contactModel(true, true).duplicates > 0);
assert(contactModel(true, false).ready > contactModel(false, false).ready);
for (let batches = 1; batches <= 12; batches++) {
  const model = reportModel(batches);
  assert.equal(model.input, model.clean + model.duplicates + model.exceptions);
  assert.equal(model.clean, model.groups.reduce((sum, group) => sum + group.count, 0));
  cases++;
}
console.log(`Decision labs: ${cases} scenarios passed; geometry, conservation, capacities and bounds verified.`);
