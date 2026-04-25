const crypto = require("crypto");
function uuid() { return crypto.randomUUID(); }
function rng(min, max) { return Math.random() * (max - min) + min; }
function rngInt(min, max) { return Math.floor(rng(min, max + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function round2(n) { return Math.round(n * 100) / 100; }

const locations = [
  { id: "loc_home",   name: "Home Game",      created_at: "2024-04-01T00:00:00.000Z", updated_at: "2024-04-01T00:00:00.000Z" },
  { id: "loc_lc",     name: "Lucky Chances",  created_at: "2024-04-01T00:00:00.000Z", updated_at: "2024-04-01T00:00:00.000Z" },
  { id: "loc_mgm",    name: "MGM Grand",      created_at: "2024-04-01T00:00:00.000Z", updated_at: "2024-04-01T00:00:00.000Z" },
  { id: "loc_bellagio", name: "Bellagio",     created_at: "2024-04-01T00:00:00.000Z", updated_at: "2024-04-01T00:00:00.000Z" },
  { id: "loc_aria",   name: "Aria",           created_at: "2024-04-01T00:00:00.000Z", updated_at: "2024-04-01T00:00:00.000Z" },
  { id: "loc_wynn",   name: "Wynn",           created_at: "2024-04-01T00:00:00.000Z", updated_at: "2024-04-01T00:00:00.000Z" },
  { id: "loc_gn",     name: "Golden Nugget",  created_at: "2024-04-01T00:00:00.000Z", updated_at: "2024-04-01T00:00:00.000Z" },
];

const stakes = [
  { id: "stk_025_050", label: "0.25/0.50", small_blind: 0.25, big_blind: 0.50, created_at: "2024-04-01T00:00:00.000Z", updated_at: "2024-04-01T00:00:00.000Z" },
  { id: "stk_1_2",     label: "1/2",       small_blind: 1,    big_blind: 2,    created_at: "2024-04-01T00:00:00.000Z", updated_at: "2024-04-01T00:00:00.000Z" },
  { id: "stk_1_3",     label: "1/3",       small_blind: 1,    big_blind: 3,    created_at: "2024-04-01T00:00:00.000Z", updated_at: "2024-04-01T00:00:00.000Z" },
  { id: "stk_2_5",     label: "2/5",       small_blind: 2,    big_blind: 5,    created_at: "2024-04-01T00:00:00.000Z", updated_at: "2024-04-01T00:00:00.000Z" },
];

const vegasTrips = [
  { start: "2024-09-06", days: 5, sessions: 5 },
  { start: "2025-01-10", days: 5, sessions: 6 },
  { start: "2025-05-23", days: 4, sessions: 4 },
  { start: "2025-08-08", days: 6, sessions: 7 },
  { start: "2025-11-28", days: 5, sessions: 5 },
  { start: "2026-02-13", days: 5, sessions: 5 },
];

const vegasLocations = [
  { id: "loc_mgm",      name: "MGM Grand" },
  { id: "loc_bellagio", name: "Bellagio" },
  { id: "loc_aria",     name: "Aria" },
  { id: "loc_wynn",     name: "Wynn" },
  { id: "loc_gn",       name: "Golden Nugget" },
];

const vegasDates = new Set();
for (const trip of vegasTrips) {
  const d = new Date(trip.start + "T00:00:00Z");
  for (let i = 0; i < trip.days; i++) {
    vegasDates.add(d.toISOString().split("T")[0]);
    d.setUTCDate(d.getUTCDate() + 1);
  }
}

// ---- PASS 1: determine counts per game type using fixed stake selection ----
// Use a seeded stake selection so pass 1 and pass 2 agree:
// casino session stake: 65% 1/2, 22% 1/3, 13% 2/5
// Vegas session stake:  45% 1/2, 35% 1/3, 20% 2/5
const casinoStakeSeq = [];
const vegasStakeSeq = [];

function casinoStake() {
  const r = Math.random();
  if (r < 0.65) return "1/2";
  if (r < 0.87) return "1/3";
  return "2/5";
}
function vegasStake() {
  const r = Math.random();
  if (r < 0.45) return "1/2";
  if (r < 0.80) return "1/3";
  return "2/5";
}

// Count sessions per type
const counts = { home: 0, "1/2": 0, "1/3": 0, "2/5": 0 };

const vegasSessionMeta = [];
for (const trip of vegasTrips) {
  const tripDates = [];
  const d = new Date(trip.start + "T00:00:00Z");
  for (let i = 0; i < trip.days; i++) { tripDates.push(d.toISOString().split("T")[0]); d.setUTCDate(d.getUTCDate() + 1); }
  for (let i = 0; i < trip.sessions; i++) {
    const dateStr = tripDates[Math.floor(i * tripDates.length / trip.sessions)];
    const loc = pick(vegasLocations);
    const type = vegasStake();
    vegasStakeSeq.push(type);
    counts[type]++;
    vegasSessionMeta.push({ dateStr, loc, type });
  }
}

const weeklySessionMeta = [];
const start = new Date("2024-04-27T00:00:00Z");
const end   = new Date("2026-04-19T00:00:00Z");
let current = new Date(start);
const monthHomeGameDone = {};
while (current <= end) {
  const dateStr = current.toISOString().split("T")[0];
  const monthKey = dateStr.slice(0, 7);
  if (!vegasDates.has(dateStr)) {
    if (!monthHomeGameDone[monthKey]) {
      monthHomeGameDone[monthKey] = true;
      counts["home"]++;
      weeklySessionMeta.push({ dateStr, type: "home" });
    } else {
      const type = casinoStake();
      casinoStakeSeq.push(type);
      counts[type]++;
      weeklySessionMeta.push({ dateStr, type });
    }
  }
  current.setUTCDate(current.getUTCDate() + 7);
}

// ---- Generate realistic P&L arrays with exact target averages ----
// Target avgs: home=-25, 1/2=+42, 1/3=+50, 2/5=-85
const targets = { home: -25, "1/2": 42, "1/3": 50, "2/5": -85 };

function rawPokerResult(type) {
  const r = Math.random();
  if (type === "home") {
    const buyIn = rngInt(50, 150);
    let pl;
    if (r < 0.40) pl = rng(-buyIn, -buyIn * 0.5);
    else if (r < 0.62) pl = rng(-buyIn * 0.5, -buyIn * 0.05);
    else if (r < 0.80) pl = rng(0, buyIn * 0.8);
    else pl = rng(buyIn * 0.8, 300);
    return { buyIn, pl: round2(pl) };
  }
  if (type === "2/5") {
    const buyIn = 1000;
    let pl;
    if (r < 0.32) pl = rng(-1000, -700);
    else if (r < 0.58) pl = rng(-700, -100);
    else if (r < 0.72) pl = rng(-100, 200);
    else if (r < 0.87) pl = rng(200, 1500);
    else pl = rng(1500, 2000);
    return { buyIn, pl: round2(pl) };
  }
  // 1/2 or 1/3
  const buyIn = Math.random() < 0.15 ? 1000 : 600;
  let pl;
  if (r < 0.32) pl = rng(-buyIn, -buyIn * 0.55);
  else if (r < 0.54) pl = rng(-buyIn * 0.55, -buyIn * 0.08);
  else if (r < 0.66) pl = rng(-buyIn * 0.08, buyIn * 0.18);
  else if (r < 0.82) pl = rng(buyIn * 0.18, buyIn * 1.2);
  else if (r < 0.93) pl = rng(buyIn * 1.2, buyIn * 2.0);
  else pl = rng(buyIn * 2.0, buyIn * 2.5);
  return { buyIn, pl: round2(pl) };
}

// Generate raw results then shift to hit exact target total
function generatePLArray(type, count) {
  const results = Array.from({ length: count }, () => rawPokerResult(type));
  const currentAvg = results.reduce((s, r) => s + r.pl, 0) / count;
  const shift = targets[type] - currentAvg;
  for (const r of results) {
    r.pl = round2(r.pl + shift);
    r.pl = round2(Math.max(-r.buyIn, r.pl)); // cashout >= 0
  }
  // Shuffle so sessions aren't grouped by result size
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [results[i], results[j]] = [results[j], results[i]];
  }
  return results;
}

const plArrays = {};
for (const type of ["home", "1/2", "1/3", "2/5"]) {
  plArrays[type] = generatePLArray(type, counts[type]);
}
const plIdx = { home: 0, "1/2": 0, "1/3": 0, "2/5": 0 };
function nextPL(type) {
  return plArrays[type][plIdx[type]++];
}

// ---- PASS 2: build sessions ----
function makeSession({ locationId, locationName, stakesId, stakesLabel, bigBlind, buyIn, pl, startedAt, endedAt }) {
  const cashOut = round2(Math.max(0, buyIn + pl));
  const actualPl = round2(cashOut - buyIn);
  const dur = Math.floor((new Date(endedAt) - new Date(startedAt)) / 60000);
  const ratings = ["good", "neutral", "bad", null];
  const w = actualPl > 200 ? [0.6,0.3,0.05,0.05] : actualPl > 0 ? [0.3,0.5,0.1,0.1] : actualPl > -200 ? [0.1,0.4,0.4,0.1] : [0.05,0.2,0.65,0.1];
  let rr = Math.random(), rating = null, acc = 0;
  for (let i = 0; i < ratings.length; i++) { acc += w[i]; if (rr < acc) { rating = ratings[i]; break; } }
  const now = new Date().toISOString();
  return { id: uuid(), started_at: startedAt, ended_at: endedAt, duration_mins: dur, location_id: locationId, location_name: locationName, stakes_id: stakesId, stakes_label: stakesLabel, big_blind: bigBlind, game_type: "NLH", buy_in: buyIn, cash_out: cashOut, profit_loss: actualPl, notes: null, rating, status: "closed", created_at: now, updated_at: now };
}

const stkMap = {
  "1/2": { id: "stk_1_2", label: "1/2", bb: 2 },
  "1/3": { id: "stk_1_3", label: "1/3", bb: 3 },
  "2/5": { id: "stk_2_5", label: "2/5", bb: 5 },
};

const sessions = [];

for (const { dateStr, loc, type } of vegasSessionMeta) {
  const stk = stkMap[type];
  const { buyIn, pl } = nextPL(type);
  const startHour = rngInt(11, 20);
  const startedAt = `${dateStr}T${String(startHour).padStart(2,"0")}:${String(rngInt(0,59)).padStart(2,"0")}:00.000Z`;
  const endedAt = new Date(new Date(startedAt).getTime() + rng(2.5, 7) * 3600000).toISOString();
  sessions.push(makeSession({ locationId: loc.id, locationName: loc.name, stakesId: stk.id, stakesLabel: stk.label, bigBlind: stk.bb, buyIn, pl, startedAt, endedAt }));
}

for (const { dateStr, type } of weeklySessionMeta) {
  if (type === "home") {
    const { buyIn, pl } = nextPL("home");
    const startedAt = `${dateStr}T19:00:00.000Z`;
    const endedAt = new Date(new Date(startedAt).getTime() + rng(3, 5.5) * 3600000).toISOString();
    sessions.push(makeSession({ locationId: "loc_home", locationName: "Home Game", stakesId: "stk_025_050", stakesLabel: "0.25/0.50", bigBlind: 0.50, buyIn, pl, startedAt, endedAt }));
  } else {
    const stk = stkMap[type];
    const { buyIn, pl } = nextPL(type);
    const startHour = rngInt(12, 19);
    const startedAt = `${dateStr}T${String(startHour).padStart(2,"0")}:${String(rngInt(0,59)).padStart(2,"0")}:00.000Z`;
    const endedAt = new Date(new Date(startedAt).getTime() + rng(3, 7) * 3600000).toISOString();
    sessions.push(makeSession({ locationId: "loc_lc", locationName: "Lucky Chances", stakesId: stk.id, stakesLabel: stk.label, bigBlind: stk.bb, buyIn, pl, startedAt, endedAt }));
  }
}

sessions.sort((a, b) => new Date(a.started_at) - new Date(b.started_at));

const payload = {
  version: "1",
  exported_at: new Date().toISOString(),
  sessions,
  locations,
  stakes,
  settings: { currency_symbol: "$", default_location_id: "loc_lc", default_stakes_id: "stk_1_2" },
};

// Stats
const byStakes = {};
for (const s of sessions) {
  if (!byStakes[s.stakes_label]) byStakes[s.stakes_label] = { count: 0, pl: 0 };
  byStakes[s.stakes_label].count++;
  byStakes[s.stakes_label].pl += s.profit_loss;
}
console.error(`Total: ${sessions.length} sessions`);
for (const [label, d] of Object.entries(byStakes))
  console.error(`  ${label}: ${d.count} sessions | net $${d.pl.toFixed(2)} | avg $${(d.pl/d.count).toFixed(2)}/session`);
console.error(`  OVERALL net: $${sessions.reduce((s,x)=>s+x.profit_loss,0).toFixed(2)}`);

console.log(JSON.stringify(payload, null, 2));
