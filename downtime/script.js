// ============================================================
//  CONFIG
// ============================================================

const PF2 = "pf2";
const SF2 = "sf2";

let currentSystem = PF2;
let pf2Table = null;
let sf2Table = null;

document.addEventListener("DOMContentLoaded", () => {
  initBackground();
  initThemeToggle();
  initSystemToggle();
  initDateInput();
  initCharacters();
  initSummaryCopy();
  initAppendixToggle();
  loadCSVs();
});

// ============================================================
//  BACKGROUND HANDLING
// ============================================================

function initBackground() {
  const bgLayer = document.getElementById("background-layer");
  const img = new Image();
  img.src = "img/background.webp";
  img.onload = () => bgLayer.classList.add("loaded");
  img.onerror = () => document.body.classList.add("no-background");
}

// ============================================================
//  THEME TOGGLE
// ============================================================

function initThemeToggle() {
  const toggle = document.getElementById("lightModeToggle");
  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      document.body.classList.remove("theme-dark");
      document.body.classList.add("theme-light");
    } else {
      document.body.classList.remove("theme-light");
      document.body.classList.add("theme-dark");
    }
  });
}

// ============================================================
//  SYSTEM TOGGLE (PF2 / SF2)
// ============================================================

function initSystemToggle() {
  const radios = document.querySelectorAll('input[name="system"]');
  radios.forEach((r) => {
    r.addEventListener("change", () => {
      if (r.checked) {
        currentSystem = r.value;
        handleSystemChange();
      }
    });
  });
}

function handleSystemChange() {
  const rows = document.querySelectorAll(".character-card");

  rows.forEach((row) => {
    const hhstRow = row.querySelector(".hhst-row");
    if (hhstRow) {
      hhstRow.style.display = currentSystem === PF2 ? "flex" : "none";
    }

    const profPills = row.querySelectorAll(".prof-pill");
    profPills.forEach((pill) => {
      const value = pill.dataset.value;
      const input = pill.querySelector("input[type=radio]");
      if (currentSystem === SF2 && value === "L") {
        pill.classList.add("disabled");
        input.checked = false;
      } else {
        pill.classList.remove("disabled");
      }
    });

    recalcRow(row);
  });

  renderDowntimeTable();
  updateSummary();
}

// ============================================================
//  DATE INPUT (native only)
// ============================================================

function initDateInput() {
  const dateInput = document.getElementById("dateInput");

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const isoToday = `${yyyy}-${mm}-${dd}`;

  dateInput.placeholder = isoToday;
  dateInput.value = isoToday;

  // Optional: light validation on blur
  dateInput.addEventListener("blur", () => {
    const v = dateInput.value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      dateInput.value = isoToday;
    }
  });
}

// ============================================================
//  CHARACTER ROWS
// ============================================================

function initCharacters() {
  const container = document.getElementById("character-rows");
  for (let i = 0; i < 7; i++) {
    const row = createCharacterRow(i);
    if (i > 0) row.style.display = "none";
    container.appendChild(row);
  }
}

function createCharacterRow(index) {
  const card = document.createElement("div");
  card.className = "character-card";
  card.dataset.index = index;

  // HEADER
  const header = document.createElement("div");
  header.className = "character-header";

  // Name
  const nameRow = document.createElement("div");
  nameRow.className = "form-row";
  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Name";
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.maxLength = 50;
  nameInput.id = `char-name-${index}`;
  nameInput.addEventListener("input", () => {
    sanitizeTextInput(nameInput);
    handleRowVisibility(index);
    recalcRow(card);
    updateSummary();
  });
  const nameError = document.createElement("div");
  nameError.className = "field-error";
  nameError.dataset.errorFor = nameInput.id;
  nameRow.append(nameLabel, nameInput, nameError);

  // Level
  const levelRow = document.createElement("div");
  levelRow.className = "form-row";
  const levelLabel = document.createElement("label");
  levelLabel.textContent = "Level";
  const levelInput = document.createElement("input");
  levelInput.type = "number";
  levelInput.min = 1;
  levelInput.max = 20;
  levelInput.classList.add("level-input");
  levelInput.id = `char-level-${index}`;
  levelInput.addEventListener("input", () => {
    sanitizeNumericInput(levelInput);
    validateLevel(levelInput);
    recalcRow(card);
    updateSummary();
  });
  const levelError = document.createElement("div");
  levelError.className = "field-error";
  levelError.dataset.errorFor = levelInput.id;
  levelRow.append(levelLabel, levelInput, levelError);

  // Proficiency
  const profRow = document.createElement("div");
  profRow.className = "form-row";
  const profLabel = document.createElement("label");
  profLabel.textContent = "Proficiency";
  const profGroup = document.createElement("div");
  profGroup.className = "radio-group";
  ["T", "E", "M", "L"].forEach((p) => {
    const pill = document.createElement("label");
    pill.className = "radio-pill prof-pill";
    pill.dataset.value = p;

    const input = document.createElement("input");
    input.type = "radio";
    input.name = `char-prof-${index}`;
    input.value = p;
    input.addEventListener("change", () => {
      recalcRow(card);
      updateSummary();
    });

    const x = document.createElement("span");
    x.className = "x-mark";

    const text = document.createElement("span");
    text.className = "label-text";
    text.textContent = p;

    pill.append(input, x, text);
    profGroup.appendChild(pill);
  });
  const profError = document.createElement("div");
  profError.className = "field-error";
  profError.dataset.errorFor = `char-prof-${index}`;
  profRow.append(profLabel, profGroup, profError);

  // HHST
  const hhstRow = document.createElement("div");
  hhstRow.className = "form-row hhst-row";
  const hhstLabel = document.createElement("label");
  hhstLabel.textContent = "HHST Boon";
  const hhstWrap = document.createElement("div");
  hhstWrap.className = "checkbox-row";
  const hhstInput = document.createElement("input");
  hhstInput.type = "checkbox";
  hhstInput.id = `char-hhst-${index}`;
  const hhstBox = document.createElement("span");
  hhstBox.className = "checkbox-custom";

  hhstWrap.append(hhstInput, hhstBox);

  // Entire row clickable
  hhstWrap.addEventListener("click", () => {
    hhstInput.checked = !hhstInput.checked;
    recalcRow(card);
    updateSummary();
  });

  hhstRow.append(hhstLabel, hhstWrap);

  header.append(nameRow, levelRow, profRow, hhstRow);

  // DC DISPLAY
  const middle = document.createElement("div");
  middle.className = "character-middle";
  const dcSpan = document.createElement("span");
  dcSpan.textContent = "DC: —";
  dcSpan.id = `char-dc-${index}`;
  middle.appendChild(dcSpan);

  // FOOTER
  const footer = document.createElement("div");
  footer.className = "character-footer";
  // Result
  const resultRow = document.createElement("div");
  resultRow.className = "form-row";
  const resultLabel = document.createElement("label");
  resultLabel.textContent = "Result";
  const resultGroup = document.createElement("div");
  resultGroup.className = "radio-group";

  const resultOptions = [
    { value: "crit-fail", label: "Crit Fail" },
    { value: "fail", label: "Fail" },
    { value: "success", label: "Success" },
    { value: "crit-success", label: "Crit Success" }
  ];

  resultOptions.forEach((opt) => {
    const pill = document.createElement("label");
    pill.className = "radio-pill";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = `char-result-${index}`;
    input.value = opt.value;
    input.addEventListener("change", () => {
      recalcRow(card);
      updateSummary();
    });

    const x = document.createElement("span");
    x.className = "x-mark";

    const text = document.createElement("span");
    text.className = "label-text";
    text.textContent = opt.label;

    pill.append(input, x, text);
    resultGroup.appendChild(pill);
  });

  const resultError = document.createElement("div");
  resultError.className = "field-error";
  resultError.dataset.errorFor = `char-result-${index}`;
  resultRow.append(resultLabel, resultGroup, resultError);

  // Days
  const daysRow = document.createElement("div");
  daysRow.className = "form-row";
  const daysLabel = document.createElement("label");
  daysLabel.textContent = "Days";
  const daysInput = document.createElement("input");
  daysInput.type = "number";
  daysInput.min = 1;
  daysInput.max = 24;
  daysInput.value = 8;
  daysInput.classList.add("days-input");
  daysInput.id = `char-days-${index}`;
  daysInput.title = "Quests, Scenarios, and Adventures grant 2 days per 1 XP; Bounties grant 0 days.";
  daysInput.addEventListener("input", () => {
    sanitizeNumericInput(daysInput);
    validateDays(daysInput);
    recalcRow(card);
    updateSummary();
  });

  const daysError = document.createElement("div");
  daysError.className = "field-error";
  daysError.dataset.errorFor = daysInput.id;
  daysRow.append(daysLabel, daysInput, daysError);

  // Income
  const incomeRow = document.createElement("div");
  incomeRow.className = "form-row";
  const incomeLabel = document.createElement("label");
  incomeLabel.textContent = "Income";
  const incomeDisplay = document.createElement("input");
  incomeDisplay.type = "text";
  incomeDisplay.readOnly = true;
  incomeDisplay.classList.add("income-display");
  incomeDisplay.id = `char-income-${index}`;
  incomeDisplay.title = "Income per downtime in gp/cr based on system.";
  incomeRow.append(incomeLabel, incomeDisplay);

  footer.append(resultRow, daysRow, incomeRow);

  card.append(header, middle, footer);
  return card;
}

function handleRowVisibility(index) {
  const container = document.getElementById("character-rows");
  const currentRow = container.querySelector(`.character-card[data-index="${index}"]`);
  const nameInput = currentRow.querySelector(`#char-name-${index}`);

  if (nameInput.value.trim() !== "" && index < 6) {
    const nextRow = container.querySelector(`.character-card[data-index="${index + 1}"]`);
    if (nextRow && nextRow.style.display === "none") {
      nextRow.style.display = "";
    }
  }
}

// ============================================================
//  SANITIZATION
// ============================================================

function sanitizeTextInput(input) {
  const allowed = /[a-zA-Z0-9 \-:(),]/g;
  const value = input.value;
  const matches = value.match(allowed);
  input.value = matches ? matches.join("") : "";
}

function sanitizeNumericInput(input) {
  input.value = input.value.replace(/[^0-9]/g, "");
}

// ============================================================
//  VALIDATION
// ============================================================

function setFieldError(id, message) {
  const err = document.querySelector(`.field-error[data-error-for="${id}"]`);
  if (err) err.textContent = message || "";
}

function validateLevel(input) {
  const id = input.id;
  if (!input.value) {
    setFieldError(id, "");
    return;
  }
  const val = parseInt(input.value, 10);

  if (currentSystem === PF2) {
    if (val < 1 || val > 20) setFieldError(id, "Level must be between 1 and 20.");
    else setFieldError(id, "");
  } else {
    if (val < 1 || val > 10) setFieldError(id, "Level must be between 1 and 10.");
    else setFieldError(id, "");
  }
}

function validateDays(input) {
  const id = input.id;
  if (!input.value) {
    setFieldError(id, "");
    return;
  }
  const val = parseInt(input.value, 10);

  if (val < 1 || val > 24) setFieldError(id, "Days must be between 1 and 24.");
  else setFieldError(id, "");
}

// ============================================================
//  CSV LOADING
// ============================================================

function loadCSVs() {
  Promise.all([
    fetch("pf2-downtime.csv").then((r) => (r.ok ? r.text() : Promise.reject())),
    fetch("sf2-downtime.csv").then((r) => (r.ok ? r.text() : Promise.reject()))
  ])
    .then(([pf2Text, sf2Text]) => {
      pf2Table = parseCSV(pf2Text);
      sf2Table = parseCSV(sf2Text);
      renderDowntimeTable();
    })
    .catch(() => {
      showErrorBanner();
    });
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",");
  const rows = lines.slice(1).map((line) => {
    const cols = line.split(",");
    const obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = cols[i] !== undefined ? cols[i].trim() : "";
    });
    return obj;
  });
  return { headers, rows };
}

function showErrorBanner() {
  const banner = document.getElementById("error-banner");
  banner.classList.remove("hidden");
  banner.classList.add("visible");
}
// ============================================================
//  CALCULATIONS
// ============================================================

function recalcRow(card) {
  if (!pf2Table || !sf2Table) return;

  const index = card.dataset.index;
  const nameInput = card.querySelector(`#char-name-${index}`);
  const levelInput = card.querySelector(`#char-level-${index}`);
  const daysInput = card.querySelector(`#char-days-${index}`);
  const dcSpan = card.querySelector(`#char-dc-${index}`);
  const incomeDisplay = card.querySelector(`#char-income-${index}`);

  const profInputs = card.querySelectorAll(`input[name="char-prof-${index}"]`);
  const resultInputs = card.querySelectorAll(`input[name="char-result-${index}"]`);
  const hhstInput = card.querySelector(`#char-hhst-${index}`);

  // Reset display
  dcSpan.textContent = "DC: —";
  dcSpan.style.color = "var(--dc-default)";
  incomeDisplay.value = "";
  let modifiedELDisplay = "—";

  const name = nameInput.value.trim();
  if (!name) {
    card.dataset.modifiedEl = modifiedELDisplay;
    return;
  }

  const levelVal = parseInt(levelInput.value || "0", 10);
  const daysVal = parseInt(daysInput.value || "0", 10);
  const prof = Array.from(profInputs).find((i) => i.checked)?.value || null;
  const result = Array.from(resultInputs).find((i) => i.checked)?.value || null;

  const levelErr = document.querySelector(`.field-error[data-error-for="${levelInput.id}"]`)?.textContent;
  const daysErr = document.querySelector(`.field-error[data-error-for="${daysInput.id}"]`)?.textContent;

  // If level invalid, stop early
  if (!levelVal || levelErr) {
    card.dataset.modifiedEl = modifiedELDisplay;
    return;
  }

  // ------------------------------------------------------------
  // INITIAL EL CALCULATION
  // ------------------------------------------------------------
  let initialEL = 0;

  if (currentSystem === PF2) {
    if (hhstInput && hhstInput.checked) {
      initialEL = levelVal;
    } else {
      initialEL = Math.max(0, levelVal - 2);
    }
    if (initialEL > 20) initialEL = 20;
  } else {
    initialEL = Math.max(0, levelVal - 2);
    if (initialEL > 10) initialEL = 10;
  }

  const table = currentSystem === PF2 ? pf2Table : sf2Table;
  const rowForInitial = table.rows.find((r) => parseInt(r.EL, 10) === initialEL);

  // ------------------------------------------------------------
  // SHOW DC AS SOON AS NAME + LEVEL ARE VALID
  // ------------------------------------------------------------
  if (rowForInitial && rowForInitial.DC && rowForInitial.DC !== "-") {
    dcSpan.textContent = `DC: ${rowForInitial.DC}`;
  }

  // ------------------------------------------------------------
  // If no result yet, stop here (DC is already shown)
  // ------------------------------------------------------------
  if (!prof || !result || daysErr || !daysVal) {
    card.dataset.modifiedEl = modifiedELDisplay;
    return;
  }

  // ------------------------------------------------------------
  // MODIFIED EL BASED ON RESULT
  // ------------------------------------------------------------
  let modifiedEL = null;

  if (result === "crit-fail") {
    modifiedEL = null;
  } else if (result === "fail" || result === "success") {
    modifiedEL = initialEL;
  } else if (result === "crit-success") {
    modifiedEL = initialEL + 1;
    if (currentSystem === PF2 && modifiedEL > 21) modifiedEL = 21;
    if (currentSystem === SF2 && modifiedEL > 10) modifiedEL = 10;
  }

  // ------------------------------------------------------------
  // DC COLORING BASED ON RESULT
  // ------------------------------------------------------------
  if (result === "crit-fail") {
    dcSpan.style.color = "var(--dc-crit-fail)";
  } else if (result === "fail") {
    dcSpan.style.color = "var(--dc-fail)";
  } else if (result === "success") {
    dcSpan.style.color = "var(--dc-success)";
  } else if (result === "crit-success") {
    dcSpan.style.color = "var(--dc-crit-success)";
  } else {
    dcSpan.style.color = "var(--dc-default)";
  }

  // ------------------------------------------------------------
  // INCOME CALCULATION
  // ------------------------------------------------------------
  if (modifiedEL === null) {
    modifiedELDisplay = "—";
    incomeDisplay.value = formatCurrency(0);
  } else {
    modifiedELDisplay = String(modifiedEL);

    const rowForModified = table.rows.find((r) => parseInt(r.EL, 10) === modifiedEL);
    let perDay = 0;

    if (rowForModified) {
      if (result === "fail") {
        perDay = parseFloat(rowForModified.Fail || "0") || 0;
      } else {
        const col = prof;
        const val = rowForModified[col] || "0";
        perDay = parseFloat(val) || 0;
      }
    }

    const total = perDay * daysVal;
    incomeDisplay.value = formatCurrency(total);
  }

  card.dataset.modifiedEl = modifiedELDisplay;
}

function formatCurrency(value) {
  if (currentSystem === PF2) {
    return `${value} gp`;
  } else {
    const intVal = Math.round(value);
    return `${intVal} cr`;
  }
}
// ============================================================
//  SUMMARY
// ============================================================

function initSummaryCopy() {
  const btn = document.getElementById("copy-summary-btn");
  btn.addEventListener("click", () => {
    const text = document.getElementById("summary-output").textContent;
    if (!text.trim()) return;

    navigator.clipboard.writeText(text).then(() => {
      showCopyBanner();
    });
  });
}

function showCopyBanner() {
  const banner = document.getElementById("copy-banner");
  banner.classList.remove("hidden");
  banner.classList.add("visible");

  setTimeout(() => {
    banner.classList.remove("visible");
    setTimeout(() => banner.classList.add("hidden"), 400);
  }, 3000);
}

function updateSummary() {
  const date = document.getElementById("dateInput").value || "";
  const scenario = document.getElementById("scenarioInput").value || "";
  const rows = document.querySelectorAll(".character-card");

  const lines = [];
  lines.push(`${date} ${scenario}`.trim());

  rows.forEach((card) => {
    const index = card.dataset.index;

    const nameInput = card.querySelector(`#char-name-${index}`);
    const levelInput = card.querySelector(`#char-level-${index}`);
    const daysInput = card.querySelector(`#char-days-${index}`);
    const incomeDisplay = card.querySelector(`#char-income-${index}`);
    const hhstInput = card.querySelector(`#char-hhst-${index}`);

    const profInputs = card.querySelectorAll(`input[name="char-prof-${index}"]`);
    const resultInputs = card.querySelectorAll(`input[name="char-result-${index}"]`);

    const name = nameInput.value.trim();
    if (!name) return;

    const levelVal = parseInt(levelInput.value || "0", 10);
    const daysVal = parseInt(daysInput.value || "0", 10);
    const prof = Array.from(profInputs).find((i) => i.checked)?.value || null;
    const resultVal = Array.from(resultInputs).find((i) => i.checked)?.value || null;

    const levelErr = document.querySelector(`.field-error[data-error-for="${levelInput.id}"]`)?.textContent;
    const daysErr = document.querySelector(`.field-error[data-error-for="${daysInput.id}"]`)?.textContent;

    if (!levelVal || !daysVal || !prof || !resultVal || levelErr || daysErr) {
      return;
    }

    const modifiedELDisplay = card.dataset.modifiedEl || "—";
    const incomeText = incomeDisplay.value || "";

    let resultLabel = "";
    if (resultVal === "crit-fail") resultLabel = "Crit Fail";
    else if (resultVal === "fail") resultLabel = "Fail";
    else if (resultVal === "success") resultLabel = "Success";
    else if (resultVal === "crit-success") resultLabel = "Crit Success";

    let line = `${name}: ${resultLabel}, EL = ${modifiedELDisplay}`;

    if (currentSystem === PF2 && hhstInput && hhstInput.checked) {
      line += " (HHST)";
    }

    const parts = incomeText.split(" ");
    const amount = parts[0] || "0";
    const unit = parts[1] || (currentSystem === PF2 ? "gp" : "cr");

    line += `     +${amount} ${unit}`;

    lines.push(line);
  });

  document.getElementById("summary-output").textContent = lines.join("\n");
}

// ============================================================
//  APPENDIX
// ============================================================

function initAppendixToggle() {
  const btn = document.getElementById("appendix-toggle");
  const content = document.getElementById("appendix-content");

  btn.addEventListener("click", () => {
    const isHidden = content.classList.contains("hidden");

    if (isHidden) {
      content.classList.remove("hidden");
      btn.textContent = "Hide Appendix";
    } else {
      content.classList.add("hidden");
      btn.textContent = "Show Appendix";
    }
  });
}

function renderDowntimeTable() {
  const container = document.getElementById("downtime-table-container");
  container.innerHTML = "";

  const tableData = currentSystem === PF2 ? pf2Table : sf2Table;
  if (!tableData) return;

  const table = document.createElement("table");
  table.className = "downtime-table";

  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");

  tableData.headers.forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h;
    trHead.appendChild(th);
  });

  thead.appendChild(trHead);

  const tbody = document.createElement("tbody");

  tableData.rows.forEach((row) => {
    const tr = document.createElement("tr");

    tableData.headers.forEach((h) => {
      const td = document.createElement("td");
      td.textContent = row[h] || "";
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.append(thead, tbody);
  container.appendChild(table);
}

// END OF FILE