// Public teaching models over synthetic fixtures. No production rules or client data.
export type PanelPlacement = { id: number; x: number; y: number; width: number; height: number; sheet: number };

export function sheetModel(quantity: number, rotate: boolean, gap: number) {
  const sheetWidth = 2440, sheetHeight = 1220;
  const sizes = [[1100, 500], [750, 400], [500, 350], [900, 550]];
  const placements: PanelPlacement[] = [];
  let sheet = 0, x = 0, y = 0, rowHeight = 0;
  for (let id = 0; id < quantity; id++) {
    const [a, b] = sizes[id % sizes.length];
    let width = a, height = b;
    if (rotate && b <= sheetWidth - x && a <= rowHeight && a > b) [width, height] = [b, a];
    if (x + width > sheetWidth) { x = 0; y += rowHeight + gap; rowHeight = 0; }
    if (y + height > sheetHeight) { sheet++; x = 0; y = 0; rowHeight = 0; }
    placements.push({ id, x, y, width, height, sheet });
    x += width + gap;
    rowHeight = Math.max(rowHeight, height);
  }
  const sheets = sheet + 1;
  const area = placements.reduce((sum, panel) => sum + panel.width * panel.height, 0);
  return { placements, sheets, sheetWidth, sheetHeight, utilisation: area / (sheets * sheetWidth * sheetHeight) * 100 };
}

export function freightModel(quantity: number, large: boolean, allowance: number) {
  const containerVolume = large ? 67 : 33;
  const volume = quantity * 1.35 * (1 + allowance / 100);
  const usable = containerVolume * 0.8;
  const containers = Math.ceil(volume / usable);
  return { volume, containers, containerVolume, utilisation: volume / (containers * containerVolume) * 100, reserve: containers * containerVolume - volume };
}

export function loadModel(quantity: number, large: boolean, oversized: boolean) {
  const capacity = large ? 67 : 33, maxLength = large ? 12 : 5.9;
  const crates = Array.from({ length: quantity }, (_, i) => ({ id: `C${String(i + 1).padStart(2, '0')}`, length: oversized && i % 5 === 0 ? 7 : 1.2, volume: oversized && i % 5 === 0 ? 7 : 1.8, weight: 650 }));
  let volume = 0, weight = 0;
  const rows = crates.map(crate => {
    const reason = crate.length > maxLength ? 'Length check failed' : weight + crate.weight > 24000 ? 'Payload limit' : volume + crate.volume > capacity * 0.8 ? 'Volume budget' : 'Within screening limits';
    const included = reason === 'Within screening limits';
    if (included) { volume += crate.volume; weight += crate.weight; }
    return { ...crate, included, reason };
  });
  return { rows, volume, weight, included: rows.filter(row => row.included).length, utilisation: volume / capacity * 100 };
}

export function crateModel(quantity: number, maxWeight: number, pallet: boolean) {
  const slots = pallet ? 6 : 4;
  const tare = pallet ? 30 : 50;
  const perPackage = Math.max(1, Math.min(slots, Math.floor((maxWeight - tare) / 45)));
  const packages = Array.from({ length: Math.ceil(quantity / perPackage) }, (_, i) => {
    const units = Math.min(perPackage, quantity - i * perPackage);
    return { units, weight: units * 45 + tare };
  });
  return { packages, perPackage, totalWeight: packages.reduce((sum, row) => sum + row.weight, 0), slots };
}

export function scheduleModel(capacity: number, urgentFirst: boolean, dueDay: number) {
  const jobs = [{ id: 'Job A', hours: 24, resource: 0 }, { id: 'Job B', hours: 32, resource: 1 }, { id: 'Job C', hours: 16, resource: 2 }, { id: 'Priority job', hours: 20, resource: 0 }, { id: 'Job E', hours: 28, resource: 1 }, { id: 'Job F', hours: 12, resource: 2 }];
  const ordered = urgentFirst ? [jobs[3], ...jobs.filter(job => job !== jobs[3])] : jobs;
  const ends = [0, 0, 0];
  const rows = ordered.map(job => {
    const start = ends[job.resource];
    const end = start + Math.ceil(job.hours / capacity);
    ends[job.resource] = end;
    return { ...job, start, end };
  });
  const priorityEnd = rows.find(job => job.id === 'Priority job')!.end;
  return { rows, ends, finish: Math.max(...ends), priorityEnd, late: Math.max(0, priorityEnd - dueDay), load: jobs.reduce((sum, job) => sum + job.hours, 0) / (Math.max(...ends) * capacity * 3) * 100 };
}

export function contactModel(normalise: boolean, deduplicate: boolean) {
  const source = Array.from({ length: 24 }, (_, i) => ({ id: `R${i + 1}`, company: `Organisation ${String(i % 20 + 1).padStart(2, '0')}`, email: i % 7 === 0 ? '' : i % 6 === 0 ? ' REVIEW@EXAMPLE.TEST ' : `contact${i % 20 + 1}@example.test` }));
  const seen = new Set<string>();
  const rows = source.map(row => {
    const email = normalise ? row.email.trim().toLowerCase() : row.email;
    const duplicate = !!email && seen.has(email);
    if (email) seen.add(email);
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return { ...row, email, status: !valid ? 'Needs review' : duplicate && deduplicate ? 'Duplicate candidate' : 'Ready for review' };
  });
  const ready = rows.filter(row => row.status === 'Ready for review').length;
  return { rows, ready, missing: rows.filter(row => !row.email).length, duplicates: rows.filter(row => row.status === 'Duplicate candidate').length, readiness: ready / rows.length * 100 };
}

export function reportModel(batches: number) {
  const input = Array.from({ length: batches }, (_, batch) => Array.from({ length: 12 }, (_, i) => ({ id: `B${batch + 1}-${i === 11 ? 0 : i}`, team: ['Production', 'Logistics', 'Commercial'][i % 3], amount: i % 5 === 0 ? null : 120 + i * 35 }))).flat();
  const seen = new Set<string>();
  let duplicates = 0, exceptions = 0;
  const clean = input.filter(row => {
    if (seen.has(row.id)) { duplicates++; return false; }
    seen.add(row.id);
    if (row.amount === null) { exceptions++; return false; }
    return true;
  });
  const groups = ['Production', 'Logistics', 'Commercial'].map(team => ({ team, count: clean.filter(row => row.team === team).length, amount: clean.filter(row => row.team === team).reduce((sum, row) => sum + (row.amount ?? 0), 0) }));
  return { input: input.length, clean: clean.length, duplicates, exceptions, groups };
}
