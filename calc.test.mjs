import test from "node:test";
import assert from "node:assert/strict";
import {
  BASE_BLESSING_THREAT,
  CONSECRATION_RANK_5_BASE_DAMAGE,
  CONSECRATION_SPELL_POWER_COEFFICIENT,
  GLOBAL_COOLDOWN_SECONDS,
  IMPROVED_RIGHTEOUS_FURY_MULTIPLIER,
  JUDGEMENT_RANK_8_BASE_DAMAGE,
  JUDGEMENT_SPELL_POWER_COEFFICIENT,
  calculateThreat,
} from "./calc.mjs";

test("constants match the Classic GBoK threat model", () => {
  assert.equal(BASE_BLESSING_THREAT, 60);
  assert.equal(IMPROVED_RIGHTEOUS_FURY_MULTIPLIER, 1.9);
  assert.equal(GLOBAL_COOLDOWN_SECONDS, 1.5);
  assert.equal(CONSECRATION_RANK_5_BASE_DAMAGE, 384);
  assert.equal(CONSECRATION_SPELL_POWER_COEFFICIENT, 0.336);
  assert.equal(JUDGEMENT_RANK_8_BASE_DAMAGE, 170);
  assert.equal(JUDGEMENT_SPELL_POWER_COEFFICIENT, 0.5);
});

test("Hakkar-style 20-player example: four buffed players", () => {
  const result = calculateThreat({ classMembers: 4, activeEnemies: 1, righteousFury: true });
  assert.equal(result.threatPerPlayer, 114);
  assert.equal(result.totalThreat, 456);
  assert.equal(result.threatPerEnemy, 456);
  assert.equal(result.threatPerSecond, 304);
});

test("Flamegor-style 40-player example: eight buffed Warriors", () => {
  const result = calculateThreat({ classMembers: 8, activeEnemies: 1, spellPower: 200, righteousFury: true });
  assert.equal(result.totalThreat, 912);
  assert.equal(result.threatPerEnemy, 912);
  assert.equal(result.threatPerSecond, 608);
  assert.equal(result.consecrationThreat, 857.28);
  assert.equal(result.judgementThreat, 513);
  assert.equal(result.leader.key, "kings");
  assert.equal(result.consecrationCrossoverSP, 286);
  assert.equal(result.judgementCrossoverSP, 620);
});

test("Hakkar-style spell-power methods lead at 200 spell power", () => {
  const result = calculateThreat({ classMembers: 4, activeEnemies: 1, spellPower: 200, righteousFury: true });
  assert.equal(result.threatPerEnemy, 456);
  assert.equal(result.consecrationThreat, 857.28);
  assert.equal(result.judgementThreat, 513);
  assert.equal(result.leader.key, "consecration");
  assert.equal(result.judgementCrossoverSP, 140);
});

test("calculator supports up to fifteen buffed Warriors", () => {
  const result = calculateThreat({ classMembers: 15, activeEnemies: 1, spellPower: 800, righteousFury: true });
  assert.equal(result.threatPerEnemy, 1710);
  assert.equal(result.leader.key, "kings");
});

test("threat is divided across active enemies", () => {
  const result = calculateThreat({ classMembers: 8, activeEnemies: 4, righteousFury: true });
  assert.equal(result.totalThreat, 912);
  assert.equal(result.threatPerEnemy, 228);
  assert.equal(result.threatPerSecond, 152);
});

test("Righteous Fury can be disabled", () => {
  const result = calculateThreat({ classMembers: 4, activeEnemies: 1, righteousFury: false });
  assert.equal(result.threatPerPlayer, 60);
  assert.equal(result.totalThreat, 240);
  assert.equal(result.threatPerEnemy, 240);
  assert.equal(result.threatPerSecond, 160);
});

test("spell-power values reproduce the guide thresholds", () => {
  const at100 = calculateThreat({ classMembers: 7, activeEnemies: 1, spellPower: 100 });
  const at200 = calculateThreat({ classMembers: 8, activeEnemies: 1, spellPower: 200 });
  const at300 = calculateThreat({ classMembers: 9, activeEnemies: 1, spellPower: 300 });
  assert.equal(Math.round(at100.consecrationThreat), 793);
  assert.equal(Math.round(at100.judgementThreat), 418);
  assert.equal(Math.round(at200.consecrationThreat), 857);
  assert.equal(Math.round(at200.judgementThreat), 513);
  assert.equal(Math.round(at300.consecrationThreat), 921);
  assert.equal(Math.round(at300.judgementThreat), 608);
});

test("invalid combat counts are rejected", () => {
  assert.throws(() => calculateThreat({ classMembers: 0, activeEnemies: 1 }), RangeError);
  assert.throws(() => calculateThreat({ classMembers: 4, activeEnemies: 0 }), RangeError);
});
