export const DIFFICULTIES = {
  EASY: { xp: 20, credits: 5 },
  STANDARD: { xp: 50, credits: 15 },
  HARD: { xp: 100, credits: 35 }
};

export const ATTRIBUTES = ["BODY","MIND","TECH","COOL"];

export const RANKS = [
  { min: 1, name: "SELLSWORD" },
  { min: 3, name: "SWORN SHIELD" },
  { min: 6, name: "KNIGHT ERRANT" },
  { min: 10, name: "LORD COMMANDER" }
];

export function xpForLevel(level) {
  return Math.round(80 * Math.pow(level, 1.6));
}

export function rankFor(level) {
  return RANKS.reduce((rank, candidate) => level >= candidate.min ? candidate.name : rank, "SELLSWORD");
}

export function calculateProgress(totalXp) {
  let level = 1;
  let remaining = Math.max(0, totalXp);
  while (remaining >= xpForLevel(level) && level < 1000) {
    remaining -= xpForLevel(level);
    level++;
  }
  return { level, xpIntoLevel: remaining, need: xpForLevel(level) };
}

export function streakFor(lastActivity, today = new Date()) {
  if (!lastActivity) return 1;
  const previous = new Date(lastActivity + "T00:00:00");
  const current = new Date(today);
  previous.setHours(0,0,0,0);
  current.setHours(0,0,0,0);
  const days = Math.round((current - previous) / 86400000);
  if (days === 0) return null;
  if (days === 1) return null;
  return 1;
}
