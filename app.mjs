import { calculateThreat, formatThreat } from "./calc.mjs";

const elements = {
  spellPower: document.querySelector("#spell-power"),
  spellPowerOutput: document.querySelector("#spell-power-output"),
  spellDial: document.querySelector("#spell-dial"),
  spellPowerMinus: document.querySelector("#spell-power-minus"),
  spellPowerPlus: document.querySelector("#spell-power-plus"),
  members: document.querySelector("#class-members"),
  membersOutput: document.querySelector("#class-members-output"),
  enemies: document.querySelector("#active-enemies"),
  enemiesOutput: document.querySelector("#active-enemies-output"),
  rf: document.querySelector("#righteous-fury"),
  leaderMethod: document.querySelector("#leader-method"),
  leaderThreat: document.querySelector("#leader-threat"),
  kingsThreat: document.querySelector("#kings-threat"),
  consecrationThreat: document.querySelector("#consecration-threat"),
  judgementThreat: document.querySelector("#judgement-threat"),
  kingsDetail: document.querySelector("#kings-detail"),
  kingsBar: document.querySelector("#kings-bar"),
  consecrationBar: document.querySelector("#consecration-bar"),
  judgementBar: document.querySelector("#judgement-bar"),
  raceRows: [...document.querySelectorAll("[data-method]")],
  leadAnalysis: document.querySelector("#lead-analysis"),
  crossoverAnalysis: document.querySelector("#crossover-analysis"),
  kingsEquation: document.querySelector("#kings-equation"),
  consecrationEquation: document.querySelector("#consecration-equation"),
  judgementEquation: document.querySelector("#judgement-equation"),
  note: document.querySelector("#encounter-note"),
  reset: document.querySelector("#reset-button"),
  presets: [...document.querySelectorAll("[data-preset]")],
};

const presets = {
  hakkar: { classMembers: 4, activeEnemies: 1, spellPower: 200, righteousFury: true },
  flamegor: { classMembers: 8, activeEnemies: 1, spellPower: 200, righteousFury: true },
};

let selectedPreset = "hakkar";

function setRangeProgress(input) {
  const progress = ((Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min))) * 100;
  input.style.setProperty("--range-progress", `${progress}%`);
  return progress;
}

function setActivePreset(name) {
  selectedPreset = name;
  elements.presets.forEach((button) => {
    const active = button.dataset.preset === name;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function clearPreset() {
  selectedPreset = null;
  elements.presets.forEach((button) => {
    button.classList.remove("is-active");
    button.setAttribute("aria-pressed", "false");
  });
}

function crossoverMessage(result) {
  const cons = result.consecrationCrossoverSP;
  const judge = result.judgementCrossoverSP;
  const consText = cons === 0 ? "Consecration already leads GBoK at 0 SP" : `Consecration passes GBoK at ${cons} SP`;
  const judgeText = judge === 0 ? "Judgement already leads GBoK at 0 SP" : `Judgement passes GBoK at ${judge} SP`;
  return `${consText}. ${judgeText}.`;
}

function updateNote(result) {
  if (selectedPreset === "hakkar") {
    elements.note.innerHTML = '<span aria-hidden="true">◆</span>Hakkar style at 200 SP: Consecration leads at 857 threat, ahead of Judgement at 513 and GBoK at 456.';
    return;
  }
  if (selectedPreset === "flamegor") {
    elements.note.innerHTML = '<span aria-hidden="true">◆</span>Flamegor style at 200 SP: eight Warriors put GBoK narrowly ahead at 912 threat; Consecration takes over from 286 SP.';
    return;
  }
  if (result.enemies > 1) {
    elements.note.innerHTML = `<span aria-hidden="true">◆</span>GBoK still creates ${formatThreat(result.totalThreat)} total threat, but only ${formatThreat(result.threatPerEnemy)} reaches each of the ${result.enemies} active enemies.`;
    return;
  }
  elements.note.innerHTML = `<span aria-hidden="true">◆</span>At ${result.spellPower} SP with ${result.members} players buffed, ${result.leader.label} is the strongest of these three actions.`;
}

function render() {
  const result = calculateThreat({
    classMembers: elements.members.value,
    activeEnemies: elements.enemies.value,
    spellPower: elements.spellPower.value,
    righteousFury: elements.rf.checked,
  });

  elements.spellPowerOutput.value = String(result.spellPower);
  elements.membersOutput.value = String(result.members);
  elements.enemiesOutput.value = String(result.enemies);
  elements.leaderMethod.textContent = result.leader.label;
  elements.leaderThreat.textContent = formatThreat(result.leader.threat);
  elements.kingsThreat.textContent = formatThreat(result.threatPerEnemy);
  elements.consecrationThreat.textContent = formatThreat(result.consecrationThreat);
  elements.judgementThreat.textContent = formatThreat(result.judgementThreat);
  elements.kingsDetail.textContent = `${result.members} ${result.members === 1 ? "player" : "players"} · ${result.enemies} ${result.enemies === 1 ? "enemy" : "enemies"}`;

  const maximum = Math.max(result.threatPerEnemy, result.consecrationThreat, result.judgementThreat);
  elements.kingsBar.style.width = `${(result.threatPerEnemy / maximum) * 100}%`;
  elements.consecrationBar.style.width = `${(result.consecrationThreat / maximum) * 100}%`;
  elements.judgementBar.style.width = `${(result.judgementThreat / maximum) * 100}%`;
  elements.raceRows.forEach((row) => row.classList.toggle("is-leading", row.dataset.method === result.leader.key));

  const margin = result.leader.threat - result.runnerUp.threat;
  elements.leadAnalysis.textContent = `${result.leader.label} leads ${result.runnerUp.label} by ${formatThreat(margin)} threat.`;
  elements.crossoverAnalysis.textContent = crossoverMessage(result);

  elements.kingsEquation.textContent = `(${result.members} × 60 × ${result.rfMultiplier}) ÷ ${result.enemies} = ${formatThreat(result.threatPerEnemy)}`;
  elements.consecrationEquation.textContent = `(384 + 0.336 × ${result.spellPower}) × ${result.rfMultiplier} = ${formatThreat(result.consecrationThreat)}`;
  elements.judgementEquation.textContent = `(170 + 0.5 × ${result.spellPower}) × ${result.rfMultiplier} = ${formatThreat(result.judgementThreat)}`;

  const dialProgress = setRangeProgress(elements.spellPower);
  elements.spellDial.style.setProperty("--dial-angle", `${dialProgress * 3.6}deg`);
  setRangeProgress(elements.members);
  setRangeProgress(elements.enemies);
  updateNote(result);
}

function applyPreset(name) {
  const preset = presets[name];
  elements.spellPower.value = String(preset.spellPower);
  elements.members.value = String(preset.classMembers);
  elements.enemies.value = String(preset.activeEnemies);
  elements.rf.checked = preset.righteousFury;
  setActivePreset(name);
  render();
}

function stepSpellPower(amount) {
  const next = Math.min(Number(elements.spellPower.max), Math.max(Number(elements.spellPower.min), Number(elements.spellPower.value) + amount));
  elements.spellPower.value = String(next);
  clearPreset();
  render();
}

elements.presets.forEach((button) => button.addEventListener("click", () => applyPreset(button.dataset.preset)));
[elements.spellPower, elements.members, elements.enemies, elements.rf].forEach((input) => {
  input.addEventListener("input", () => {
    clearPreset();
    render();
  });
});

elements.spellPowerMinus.addEventListener("click", () => stepSpellPower(-10));
elements.spellPowerPlus.addEventListener("click", () => stepSpellPower(10));
elements.reset.addEventListener("click", () => applyPreset("hakkar"));

render();
