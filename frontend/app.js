// Algo Visualizer — runs entirely in the browser (no backend required).
// If you want to use the optional Java backend via Node, see backend/README.

const ALGOS = {
  sorting: [
    { value: "merge", label: "Merge Sort" },
    { value: "quick", label: "Quick Sort" },
    { value: "bubble", label: "Bubble Sort" },
  ],
  searching: [
    { value: "linear", label: "Linear Search" },
    { value: "binary", label: "Binary Search (auto-sorts)" },
    { value: "jump", label: "Jump Search (auto-sorts)" },
  ],
};

const $ = (id) => document.getElementById(id);
const categoryEl = $("category");
const algoEl = $("algorithm");
const targetEl = $("target");
const targetField = document.querySelector(".target-field");
const sizeEl = $("size");
const speedEl = $("speed");
const sizeVal = $("sizeVal");
const speedVal = $("speedVal");
const manualEl = $("manual");
const runBtn = $("runBtn");
const randomBtn = $("randomBtn");
const board = $("board");
const legend = $("legend");
const algoLabel = $("algoLabel");
const stepCount = $("stepCount");
const statusEl = $("status");
const hint = $("hint");

let currentArray = [];
let running = false;

// ---------- UI plumbing ----------
function refreshAlgos() {
  const cat = categoryEl.value;
  algoEl.innerHTML = ALGOS[cat]
    .map((a) => `<option value="${a.value}">${a.label}</option>`)
    .join("");
  // Hide target field unless searching
  targetField.hidden = cat !== "searching";
  updateHint();
  renderArray(currentArray);
  renderLegend();
}
function updateHint() {
  const cat = categoryEl.value;
  const algo = algoEl.value;
  if (cat === "searching" && (algo === "binary" || algo === "jump")) {
    hint.textContent = `${ALGOS[cat].find(a => a.value === algo).label} needs a sorted array — it will be sorted automatically before searching.`;
  } else if (cat === "searching") {
    hint.textContent = "Enter the value you want to find in the Target box.";
  } else {
    hint.textContent = "Watch the array get sorted step by step.";
  }
}

// Speed slider 1..100  →  delay 800ms..30ms (higher = faster)
function delayMs() {
  const s = +speedEl.value; // 1..100
  return Math.round(800 - (s - 1) * (770 / 99));
}

sizeEl.addEventListener("input", () => {
  sizeVal.textContent = sizeEl.value;
  generateRandom(+sizeEl.value);
});
speedEl.addEventListener("input", () => (speedVal.textContent = speedEl.value));
categoryEl.addEventListener("change", refreshAlgos);
algoEl.addEventListener("change", () => { updateHint(); renderLegend(); });

manualEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const arr = parseManual(manualEl.value);
    if (arr) {
      currentArray = arr;
      renderArray(currentArray);
      flashStatus(`Loaded ${arr.length} numbers`);
    }
  }
});
function parseManual(text) {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return null;
  const nums = [];
  for (const p of parts) {
    const n = Number(p);
    if (!Number.isFinite(n)) {
      flashStatus(`Invalid number: "${p}"`, true);
      return null;
    }
    nums.push(n);
  }
  if (nums.length > 100) {
    flashStatus("Max 100 numbers", true);
    return null;
  }
  return nums;
}

randomBtn.addEventListener("click", () => generateRandom(+sizeEl.value));
function generateRandom(n) {
  const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10);
  currentArray = arr;
  manualEl.value = arr.join(" ");
  renderArray(arr);
}

runBtn.addEventListener("click", run);

// ---------- Rendering ----------
function renderArray(arr, marks = [], opts = {}) {
  renderRows([{ values: arr, marks, label: opts.label, active: opts.active, merged: opts.merged }]);
}

function renderRows(rows) {
  board.innerHTML = "";
  // With the new bar chart, we ideally have only 1 row.
  // Calculate max across all rows to scale heights consistently.
  let maxVal = 1;
  rows.forEach(r => {
    (r.values || []).forEach(v => {
      if (v > maxVal) maxVal = v;
    });
  });

  rows.forEach((r) => {
    const row = document.createElement("div");
    row.className = "array-row" + (r.active ? " active" : "") + (r.merged ? " merged" : "");
    if (r.label) {
      const l = document.createElement("div");
      l.className = "row-label";
      l.textContent = r.label;
      row.appendChild(l);
    }
    const cells = document.createElement("div");
    cells.className = "cells";
    (r.values || []).forEach((v, i) => {
      const c = document.createElement("div");
      c.className = "cell";
      // Dynamic height for bar chart
      c.style.height = Math.max(5, (v / maxVal) * 100) + "%";
      
      const m = (r.marks || []).find((mk) => mk.i === i);
      if (m) c.classList.add(m.cls);
      
      // Hide text if there are too many elements
      if ((r.values || []).length <= 40) {
        c.textContent = v;
      }
      
      if (m && m.ptr) {
        const p = document.createElement("span");
        p.className = "ptr";
        p.textContent = m.ptr;
        c.appendChild(p);
      }
      cells.appendChild(c);
    });
    row.appendChild(cells);
    board.appendChild(row);
  });
}

function renderLegend() {
  const cat = categoryEl.value;
  const items = cat === "searching"
    ? [["in-range","search range"],["compare","checking"],["found","match"],["dim","excluded"]]
    : [["compare","compare"],["swap","swap / write"],["pivot","pivot"],["sorted","sorted"]];
  legend.innerHTML = items
    .map(([cls,label]) => `<span class="chip"><span class="swatch cell ${cls}"></span>${label}</span>`)
    .join("");
}

function flashStatus(msg, isErr = false) {
  statusEl.textContent = msg;
  statusEl.style.color = isErr ? "var(--bad)" : "var(--ok)";
  setTimeout(() => (statusEl.style.color = ""), 1400);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Run ----------
async function run() {
  if (running) return;
  if (!currentArray.length) {
    const parsed = parseManual(manualEl.value);
    if (parsed) currentArray = parsed;
    else generateRandom(+sizeEl.value);
  }
  const cat = categoryEl.value;
  const algo = algoEl.value;
  let target = null;
  if (cat === "searching") {
    target = Number(targetEl.value);
    if (!Number.isFinite(target)) {
      flashStatus("Enter a target number to search", true);
      return;
    }
  }

  running = true;
  runBtn.disabled = true;
  algoLabel.textContent = ALGOS[cat].find((a) => a.value === algo).label;
  statusEl.textContent = "running…";
  stepCount.textContent = "—";
  renderLegend();

  const frames = [];
  const arrCopy = currentArray.slice();
  try {
    if (cat === "sorting" && algo === "merge") mergeSortFrames(arrCopy, frames);
    else if (cat === "sorting" && algo === "quick") quickSortFrames(arrCopy, frames);
    else if (cat === "sorting" && algo === "bubble") bubbleSortFrames(arrCopy, frames);
    else if (cat === "searching" && algo === "linear") linearSearchFrames(arrCopy, target, frames);
    else if (cat === "searching" && algo === "binary") binarySearchFrames(arrCopy, target, frames);
    else if (cat === "searching" && algo === "jump") jumpSearchFrames(arrCopy, target, frames);

    stepCount.textContent = frames.length;
    for (const f of frames) {
      renderRows(f);
      await sleep(delayMs());
    }
    statusEl.textContent = "done";
  } catch (err) {
    console.error(err);
    flashStatus("Error: " + err.message, true);
    statusEl.textContent = "error";
  } finally {
    running = false;
    runBtn.disabled = false;
  }
}

// ---------- Algorithms (produce frames) ----------
// Each frame is an array of rows: [{ values, marks:[{i,cls,ptr?}], label, active, merged }]

function mergeSortFrames(arr, frames) {
  const a = arr.slice();
  frames.push([{ values: a.slice(), label: "Initial", active: true }]);

  function sort(lo, hi) {
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    sort(lo, mid);
    sort(mid + 1, hi);
    merge(lo, mid, hi);
  }

  function merge(lo, mid, hi) {
    const tmp = [];
    let i = lo, j = mid + 1;
    while (i <= mid && j <= hi) {
      frames.push([{
        values: a.slice(), label: `Merge [${lo}..${hi}]`, active: true,
        marks: [
          ...range(lo, hi).map(k => ({ i: k, cls: "in-range" })),
          { i, cls: "compare", ptr: "L" },
          { j, cls: "compare", ptr: "R" }
        ]
      }]);
      if (a[i] <= a[j]) {
        tmp.push(a[i++]);
      } else {
        // Need to visualize shifting elements if taking from right
        const val = a[j];
        for (let k = j; k > i; k--) a[k] = a[k - 1];
        a[i] = val;
        
        frames.push([{
          values: a.slice(), label: "Swap & Shift", active: true,
          marks: [
            ...range(lo, hi).map(k => ({ i: k, cls: "in-range" })),
            { i, cls: "swap", ptr: "placed" }
          ]
        }]);
        
        i++;
        mid++;
        j++;
      }
    }
  }

  sort(0, a.length - 1);
  frames.push([{
    values: a.slice(), label: "Sorted", merged: true,
    marks: a.map((_, i) => ({ i, cls: "sorted" }))
  }]);
}

function quickSortFrames(arr, frames) {
  const a = arr.slice();
  frames.push([{ values: a.slice(), label: "Initial", active: true }]);
  const sorted = new Set();

  function qs(lo, hi) {
    if (lo >= hi) { if (lo === hi) sorted.add(lo); return; }
    const pivot = a[hi];
    let i = lo;
    // pivot frame
    frames.push([{
      values: a.slice(),
      label: `Partition [${lo}..${hi}], pivot=${pivot}`,
      active: true,
      marks: [
        ...range(lo, hi - 1).map((k) => ({ i: k, cls: "in-range" })),
        { i: hi, cls: "pivot", ptr: "P" },
      ],
    }]);
    for (let j = lo; j < hi; j++) {
      frames.push([{
        values: a.slice(),
        label: "Compare with pivot",
        active: true,
        marks: [
          { i: hi, cls: "pivot", ptr: "P" },
          { i: j, cls: "compare", ptr: "j" },
          { i: i, cls: "in-range", ptr: "i" },
        ],
      }]);
      if (a[j] < pivot) {
        if (i !== j) [a[i], a[j]] = [a[j], a[i]];
        frames.push([{
          values: a.slice(), label: "Swap", active: true,
          marks: [
            { i: hi, cls: "pivot", ptr: "P" },
            { i: i, cls: "swap" },
            { i: j, cls: "swap" },
          ],
        }]);
        i++;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    sorted.add(i);
    frames.push([{
      values: a.slice(), label: `Pivot in place at ${i}`, active: true,
      marks: [{ i, cls: "sorted" }],
    }]);
    qs(lo, i - 1);
    qs(i + 1, hi);
  }
  qs(0, a.length - 1);
  for (let k = 0; k < a.length; k++) sorted.add(k);
  frames.push([{
    values: a.slice(), label: "Sorted", merged: true,
    marks: a.map((_, i) => ({ i, cls: "sorted" })),
  }]);
}

function linearSearchFrames(arr, target, frames) {
  const a = arr.slice();
  frames.push([{ values: a.slice(), label: `Linear Search for ${target}`, active: true }]);
  for (let i = 0; i < a.length; i++) {
    frames.push([{
      values: a.slice(), label: `Check index ${i}`, active: true,
      marks: [
        ...range(0, i - 1).map((k) => ({ i: k, cls: "dim" })),
        { i, cls: "compare", ptr: "i" },
      ],
    }]);
    if (a[i] === target) {
      frames.push([{
        values: a.slice(), label: `Found at index ${i}`, merged: true,
        marks: [{ i, cls: "found", ptr: "✓" }],
      }]);
      return;
    }
  }
  frames.push([{
    values: a.slice(), label: "Not found",
    marks: a.map((_, i) => ({ i, cls: "dim" })),
  }]);
}

function binarySearchFrames(arr, target, frames) {
  const a = arr.slice().sort((x, y) => x - y);
  frames.push([{
    values: a.slice(), label: "Sorted (required for Binary Search)", active: true,
    marks: a.map((_, i) => ({ i, cls: "sorted" })),
  }]);
  let lo = 0, hi = a.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    frames.push([{
      values: a.slice(), label: `lo=${lo}, mid=${mid}, hi=${hi}`, active: true,
      marks: [
        ...range(0, lo - 1).map((k) => ({ i: k, cls: "dim" })),
        ...range(lo, hi).map((k) => ({ i: k, cls: "in-range" })),
        ...range(hi + 1, a.length - 1).map((k) => ({ i: k, cls: "dim" })),
        { i: lo, cls: "in-range", ptr: "lo" },
        { i: hi, cls: "in-range", ptr: "hi" },
        { i: mid, cls: "compare", ptr: "mid" },
      ],
    }]);
    if (a[mid] === target) {
      frames.push([{
        values: a.slice(), label: `Found at index ${mid}`, merged: true,
        marks: [{ i: mid, cls: "found", ptr: "✓" }],
      }]);
      return;
    }
    if (a[mid] < target) lo = mid + 1; else hi = mid - 1;
  }
  frames.push([{
    values: a.slice(), label: "Not found",
    marks: a.map((_, i) => ({ i, cls: "dim" })),
  }]);
}

function bubbleSortFrames(arr, frames) {
  const a = arr.slice();
  frames.push([{ values: a.slice(), label: "Initial", active: true }]);
  let n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      frames.push([{
        values: a.slice(), label: "Compare", active: true,
        marks: [
          ...range(n - i, n - 1).map(k => ({ i: k, cls: "sorted" })),
          { i: j, cls: "compare", ptr: "j" },
          { i: j + 1, cls: "compare" }
        ]
      }]);
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        frames.push([{
          values: a.slice(), label: "Swap", active: true,
          marks: [
            ...range(n - i, n - 1).map(k => ({ i: k, cls: "sorted" })),
            { i: j, cls: "swap" },
            { i: j + 1, cls: "swap" }
          ]
        }]);
      }
    }
    frames.push([{
      values: a.slice(), label: "Locked in place", active: true,
      marks: [
        ...range(n - i - 1, n - 1).map(k => ({ i: k, cls: "sorted" }))
      ]
    }]);
  }
  frames.push([{
    values: a.slice(), label: "Sorted", merged: true,
    marks: a.map((_, i) => ({ i, cls: "sorted" }))
  }]);
}

function jumpSearchFrames(arr, target, frames) {
  const a = arr.slice().sort((x, y) => x - y);
  frames.push([{
    values: a.slice(), label: "Sorted (required for Jump Search)", active: true,
    marks: a.map((_, i) => ({ i, cls: "sorted" })),
  }]);
  
  let n = a.length;
  let step = Math.floor(Math.sqrt(n));
  let prev = 0;

  // Jumping
  while (a[Math.min(step, n) - 1] < target) {
    frames.push([{
      values: a.slice(), label: `Jump step ${step}`, active: true,
      marks: [
        ...range(0, prev - 1).map(k => ({ i: k, cls: "dim" })),
        { i: prev, cls: "in-range", ptr: "prev" },
        { i: Math.min(step, n) - 1, cls: "compare", ptr: "step" }
      ]
    }]);
    prev = step;
    step += Math.floor(Math.sqrt(n));
    if (prev >= n) {
      frames.push([{
        values: a.slice(), label: "Not found",
        marks: a.map((_, i) => ({ i, cls: "dim" }))
      }]);
      return;
    }
  }

  frames.push([{
    values: a.slice(), label: `Block found [${prev}..${Math.min(step, n) - 1}]`, active: true,
    marks: [
      ...range(0, prev - 1).map(k => ({ i: k, cls: "dim" })),
      ...range(prev, Math.min(step, n) - 1).map(k => ({ i: k, cls: "in-range" }))
    ]
  }]);

  // Linear search in block
  while (a[prev] < target) {
    frames.push([{
      values: a.slice(), label: `Linear search from ${prev}`, active: true,
      marks: [
        ...range(0, prev - 1).map(k => ({ i: k, cls: "dim" })),
        ...range(prev, Math.min(step, n) - 1).map(k => ({ i: k, cls: "in-range" })),
        { i: prev, cls: "compare", ptr: "check" }
      ]
    }]);
    prev++;
    if (prev === Math.min(step, n)) {
      frames.push([{
        values: a.slice(), label: "Not found",
        marks: a.map((_, i) => ({ i, cls: "dim" }))
      }]);
      return;
    }
  }

  frames.push([{
    values: a.slice(), label: `Check ${prev}`, active: true,
    marks: [
      ...range(0, prev - 1).map(k => ({ i: k, cls: "dim" })),
      ...range(prev, Math.min(step, n) - 1).map(k => ({ i: k, cls: "in-range" })),
      { i: prev, cls: "compare", ptr: "check" }
    ]
  }]);

  if (a[prev] === target) {
    frames.push([{
      values: a.slice(), label: `Found at index ${prev}`, merged: true,
      marks: [{ i: prev, cls: "found", ptr: "✓" }]
    }]);
    return;
  }

  frames.push([{
    values: a.slice(), label: "Not found",
    marks: a.map((_, i) => ({ i, cls: "dim" }))
  }]);
}

function range(a, b) {
  const out = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
}

// ---------- Init ----------
refreshAlgos();
generateRandom(+sizeEl.value);
renderLegend();
