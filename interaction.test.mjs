import test from "node:test";
import assert from "node:assert/strict";

class Element {
  constructor(data = {}) {
    Object.assign(this, data);
    this.listeners = {};
    this.attributes = {};
    this.classes = new Set(data.classes || []);
    this.classList = {
      add: (name) => this.classes.add(name),
      remove: (name) => this.classes.delete(name),
      toggle: (name, force) => force ? this.classes.add(name) : this.classes.delete(name),
      contains: (name) => this.classes.has(name),
    };
    this.style = { setProperty: (key, value) => { this.style[key] = value; } };
  }
  addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
  setAttribute(name, value) { this.attributes[name] = value; }
  async trigger(name) { for (const fn of this.listeners[name] || []) await fn(); }
}

test("dial, presets, sliders and RF toggle update the comparison", async () => {
  const selectors = [
    "#spell-power-output", "#spell-dial", "#spell-power-minus", "#spell-power-plus",
    "#class-members-output", "#active-enemies-output", "#leader-method", "#leader-threat",
    "#kings-threat", "#consecration-threat", "#judgement-threat", "#kings-detail",
    "#kings-bar", "#consecration-bar", "#judgement-bar", "#lead-analysis",
    "#crossover-analysis", "#kings-equation", "#consecration-equation",
    "#judgement-equation", "#encounter-note", "#reset-button",
  ];
  const map = Object.fromEntries(selectors.map((selector) => [selector, new Element()]));
  map["#spell-power"] = new Element({ value: "200", min: "0", max: "800" });
  map["#class-members"] = new Element({ value: "4", min: "1", max: "15" });
  map["#active-enemies"] = new Element({ value: "1", min: "1", max: "20" });
  map["#righteous-fury"] = new Element({ checked: true });

  const presets = [
    new Element({ dataset: { preset: "hakkar" }, classes: ["is-active"] }),
    new Element({ dataset: { preset: "flamegor" } }),
  ];
  const methods = ["kings", "consecration", "judgement"].map((method) => new Element({ dataset: { method } }));
  globalThis.document = {
    querySelector: (selector) => map[selector],
    querySelectorAll: (selector) => selector === "[data-preset]" ? presets : methods,
  };

  await import(`./app.mjs?test=${Date.now()}`);
  assert.equal(map["#leader-method"].textContent, "Consecration");
  assert.equal(map["#leader-threat"].textContent, "857");

  await presets[1].trigger("click");
  assert.equal(map["#leader-method"].textContent, "GBoK");
  assert.equal(map["#leader-threat"].textContent, "912");
  assert.match(map["#crossover-analysis"].textContent, /286 SP/);

  map["#spell-power"].value = "300";
  await map["#spell-power"].trigger("input");
  assert.equal(map["#leader-method"].textContent, "Consecration");
  assert.equal(map["#consecration-threat"].textContent, "921");

  map["#class-members"].value = "15";
  await map["#class-members"].trigger("input");
  assert.equal(map["#kings-threat"].textContent, "1,710");
  assert.equal(map["#leader-method"].textContent, "GBoK");

  map["#active-enemies"].value = "3";
  await map["#active-enemies"].trigger("input");
  assert.equal(map["#kings-threat"].textContent, "570");
  assert.equal(map["#leader-method"].textContent, "Consecration");

  map["#righteous-fury"].checked = false;
  await map["#righteous-fury"].trigger("input");
  assert.equal(map["#consecration-threat"].textContent, "485");

  await map["#reset-button"].trigger("click");
  assert.equal(map["#spell-power"].value, "200");
  assert.equal(map["#class-members"].value, "4");
  assert.equal(map["#leader-method"].textContent, "Consecration");
});
