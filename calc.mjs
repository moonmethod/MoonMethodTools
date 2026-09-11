export const BASE_BLESSING_THREAT = 60;
export const IMPROVED_RIGHTEOUS_FURY_MULTIPLIER = 1.9;
export const GLOBAL_COOLDOWN_SECONDS = 1.5;
export const CONSECRATION_RANK_5_BASE_DAMAGE = 384;
export const CONSECRATION_SPELL_POWER_COEFFICIENT = 0.336;
export const JUDGEMENT_RANK_8_BASE_DAMAGE = 170;
export const JUDGEMENT_SPELL_POWER_COEFFICIENT = 0.5;

export function calculateThreat({ classMembers, activeEnemies, spellPower = 200, righteousFury = true }) {
  const members = Number(classMembers);
  const enemies = Number(activeEnemies);
  const power = Number(spellPower);

  if (!Number.isInteger(members) || members < 1) {
    throw new RangeError("classMembers must be a positive integer");
  }
  if (!Number.isInteger(enemies) || enemies < 1) {
    throw new RangeError("activeEnemies must be a positive integer");
  }
  if (!Number.isFinite(power) || power < 0) {
    throw new RangeError("spellPower must be a non-negative number");
  }

  const rfMultiplier = righteousFury ? IMPROVED_RIGHTEOUS_FURY_MULTIPLIER : 1;
  const threatPerPlayer = BASE_BLESSING_THREAT * rfMultiplier;
  const totalThreat = threatPerPlayer * members;
  const threatPerEnemy = totalThreat / enemies;
  const threatPerSecond = threatPerEnemy / GLOBAL_COOLDOWN_SECONDS;
  const consecrationThreat = (
    CONSECRATION_RANK_5_BASE_DAMAGE + CONSECRATION_SPELL_POWER_COEFFICIENT * power
  ) * rfMultiplier;
  const judgementThreat = (
    JUDGEMENT_RANK_8_BASE_DAMAGE + JUDGEMENT_SPELL_POWER_COEFFICIENT * power
  ) * rfMultiplier;

  const methods = [
    { key: "kings", label: "GBoK", threat: threatPerEnemy },
    { key: "consecration", label: "Consecration", threat: consecrationThreat },
    { key: "judgement", label: "Judgement", threat: judgementThreat },
  ].sort((a, b) => b.threat - a.threat);

  const kingsBeforeRf = BASE_BLESSING_THREAT * members / enemies;
  const consecrationCrossoverSP = Math.max(0, Math.ceil(
    (kingsBeforeRf - CONSECRATION_RANK_5_BASE_DAMAGE) / CONSECRATION_SPELL_POWER_COEFFICIENT
  ));
  const judgementCrossoverSP = Math.max(0, Math.ceil(
    (kingsBeforeRf - JUDGEMENT_RANK_8_BASE_DAMAGE) / JUDGEMENT_SPELL_POWER_COEFFICIENT
  ));

  return {
    members,
    enemies,
    spellPower: power,
    rfMultiplier,
    threatPerPlayer,
    totalThreat,
    threatPerEnemy,
    threatPerSecond,
    consecrationThreat,
    judgementThreat,
    leader: methods[0],
    runnerUp: methods[1],
    consecrationCrossoverSP,
    judgementCrossoverSP,
  };
}

export function formatThreat(value) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 0,
  }).format(value);
}
