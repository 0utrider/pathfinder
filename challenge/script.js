// ===============================
// DOM REFERENCES
// ===============================

// Sliders
const levelMin = document.getElementById("levelMin");
const levelMax = document.getElementById("levelMax");
const levelRangeDisplay = document.getElementById("levelRangeDisplay");

const numPlayers = document.getElementById("numPlayers");
const numPlayersDisplay = document.getElementById("numPlayersDisplay");

const numPregens = document.getElementById("numPregens");
const numPregensDisplay = document.getElementById("numPregensDisplay");

// Player grid container
const playerLevelContainer = document.getElementById("playerLevelContainer");

// Output fields
const cpFromPCs = document.getElementById("cpFromPCs");
const cpPregens = document.getElementById("cpPregens");
const pregenLabel = document.getElementById("pregenLabel");
const cpHardmode = document.getElementById("cpHardmode");
const hardmodeRow = document.getElementById("hardmodeRow");
const totalCP = document.getElementById("totalCP");
const playDirection = document.getElementById("playDirection");

// Footnotes
const footnote1 = document.getElementById("footnote1");
const footnote2 = document.getElementById("footnote2");
const footnote3 = document.getElementById("footnote3");
const footnote4 = document.getElementById("footnote4");

// Footnote 4 spans
const fn4_low = document.getElementById("fn4_low");
const fn4_mid_up = document.getElementById("fn4_mid_up");
const fn4_mid_down = document.getElementById("fn4_mid_down");
const fn4_high = document.getElementById("fn4_high");

// Appendix
const appendixToggle = document.getElementById("appendixToggle");
const appendixContent = document.getElementById("appendixContent");

// Theme toggle
const themeToggle = document.getElementById("themeToggle");
const themeToggleLabel = document.getElementById("themeToggleLabel");


// ===============================
// INITIAL SETUP
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    generatePlayerGrid();
    updateLevelRangeDisplay();
    updateNumPlayersDisplay();
    updateNumPregensDisplay();
    applyThemeFromStorage();
    validateAll();
});


// ===============================
// THEME TOGGLE (Dark by default)
// ===============================
themeToggle.addEventListener("change", () => {
    const light = themeToggle.checked;
    document.body.classList.toggle("dark-mode", !light);
    localStorage.setItem("cpcalc-theme", light ? "light" : "dark");
});

function applyThemeFromStorage() {
    const saved = localStorage.getItem("cpcalc-theme");

    if (saved === "light") {
        themeToggle.checked = true;
        document.body.classList.remove("dark-mode");
    } else {
        themeToggle.checked = false;
        document.body.classList.add("dark-mode");
    }
}


// ===============================
// APPENDIX TOGGLE
// ===============================
appendixToggle.addEventListener("click", () => {
    appendixContent.classList.toggle("open");
});


// ===============================
// PLAYER GRID GENERATION (3×2)
// ===============================
function generatePlayerGrid() {
    playerLevelContainer.innerHTML = "";

    for (let i = 1; i <= 6; i++) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("player-box");

        const label = document.createElement("div");
        label.classList.add("player-box-label");
        label.textContent = `P${i}`;

        const input = document.createElement("input");
        input.type = "number";
        input.min = 1;
        input.max = 20;
        input.value = 1;
        input.id = `player${i}`;
        input.classList.add("player-level-input");

        input.addEventListener("input", () => validateAll());

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        playerLevelContainer.appendChild(wrapper);
    }

    updatePlayerGridVisibility();
}

function updatePlayerGridVisibility() {
    const count = parseInt(numPlayers.value);
    const boxes = playerLevelContainer.querySelectorAll(".player-box");

    boxes.forEach((box, index) => {
        box.style.display = index < count ? "flex" : "none";
    });
}


// ===============================
// SLIDER DISPLAY UPDATES
// ===============================
function updateLevelRangeDisplay() {
    levelRangeDisplay.textContent = `${levelMin.value} – ${levelMax.value}`;
}

function updateNumPlayersDisplay() {
    numPlayersDisplay.textContent = `${numPlayers.value} Players`;
    updatePlayerGridVisibility();
}

function updateNumPregensDisplay() {
    numPregensDisplay.textContent = `${numPregens.value} Pregens`;
}


// ===============================
// EVENT LISTENERS
// ===============================
levelMin.addEventListener("input", () => {
    enforceLevelRangeRules();
    updateLevelRangeDisplay();
    validateAll();
});

levelMax.addEventListener("input", () => {
    enforceLevelRangeRules();
    updateLevelRangeDisplay();
    validateAll();
});

numPlayers.addEventListener("input", () => {
    updateNumPlayersDisplay();
    validateAll();
});

numPregens.addEventListener("input", () => {
    updateNumPregensDisplay();
    validateAll();
});


// ===============================
// LEVEL RANGE RULES
// ===============================
// Must satisfy:
// - min ≤ max
// - max ≤ min + 3
function enforceLevelRangeRules() {
    let min = parseInt(levelMin.value);
    let max = parseInt(levelMax.value);

    if (min > max) {
        max = min;
        levelMax.value = max;
    }

    if (max > min + 3) {
        max = min + 3;
        levelMax.value = max;
    }
}


// ===============================
// VALIDATION WRAPPER (logic added later)
// ===============================
function validateAll() {
    totalCP.textContent = "--";
    playDirection.textContent = "--";
}


// ===============================
// PART 2 — VALIDATION + FOOTNOTES + PARTY RULES
// ===============================

// Convenience getters
function getMinLevel() { return parseInt(levelMin.value); }
function getMaxLevel() { return parseInt(levelMax.value); }
function getNumPlayers() { return parseInt(numPlayers.value); }
function getNumPregens() { return parseInt(numPregens.value); }


// ===============================
// PLAYER LEVEL VALIDATION
// ===============================
function validatePlayerLevels() {
    const min = getMinLevel();
    const max = getMaxLevel();
    let valid = true;

    const boxes = playerLevelContainer.querySelectorAll(".player-box");
    boxes.forEach((box, index) => {
        if (index >= getNumPlayers()) return;

        const input = box.querySelector("input");
        const val = parseInt(input.value);

        if (isNaN(val) || val < min || val > max) {
            input.classList.add("invalid");
            valid = false;
        } else {
            input.classList.remove("invalid");
        }
    });

    return valid;
}


// ===============================
// PARTY LEGALITY + HARDMODE
// ===============================
function checkPartyLegality() {
    const min = getMinLevel();
    const players = getNumPlayers();
    const pregens = getNumPregens();

    let legal = true;
    let hardmode = false;

    if (players === 2 && min > 5) legal = false;
    if (players === 2 && pregens === 0) legal = false;

    if (players === 3 && pregens === 0 && min >= 6) {
        hardmode = true;
    }

    return { legal, hardmode };
}


// ===============================
// FOOTNOTE 1–3 LOGIC
// ===============================
function updateFootnotesBasic() {
    const min = getMinLevel();
    const players = getNumPlayers();
    const pregens = getNumPregens();

    [footnote1, footnote2, footnote3].forEach(fn =>
        fn.classList.remove("fn-purple", "fn-red")
    );

    if (players === 2) {
        if (min >= 7) footnote1.classList.add("fn-red");
        else footnote1.classList.add("fn-purple");
    }

    if (players <= 3) {
        footnote2.classList.add("fn-purple");
    }

    if (players === 3 && pregens === 0 && min >= 6) {
        footnote3.classList.add("fn-purple");
    }
}


// ===============================
// FOOTNOTE 4 DYNAMIC SPANS
// ===============================
function updateFootnote4(totalCPValue) {
    [fn4_low, fn4_mid_up, fn4_mid_down, fn4_high].forEach(span => {
        span.style.display = "none";
        span.classList.remove("fn-purple");
    });

    if (isNaN(totalCPValue)) return;

    const players = getNumPlayers();

    if (totalCPValue <= 15) {
        fn4_low.style.display = "inline";
        fn4_low.classList.add("fn-purple");
        return;
    }

    if (totalCPValue >= 19) {
        fn4_high.style.display = "inline";
        fn4_high.classList.add("fn-purple");
        return;
    }

    if (totalCPValue >= 16 && totalCPValue <= 18) {
        if (players <= 4) {
            fn4_mid_up.style.display = "inline";
            fn4_mid_up.classList.add("fn-purple");
        } else {
            fn4_mid_down.style.display = "inline";
            fn4_mid_down.classList.add("fn-purple");
        }
    }
}


// ===============================
// INVALID STATE HANDLING
// ===============================
function showInvalidState() {
    totalCP.textContent = "--";
    playDirection.textContent = "--";
    totalCP.classList.remove("valid-total");
    totalCP.classList.add("invalid-total");
}

function clearInvalidState() {
    totalCP.classList.remove("invalid-total");
}


// ===============================
// EXTEND validateAll WITH LOGIC
// ===============================
const validateAll_base = validateAll;
validateAll = function () {
    const levelsOK = validatePlayerLevels();
    const { legal, hardmode } = checkPartyLegality();

    updateFootnotesBasic();

    if (!levelsOK || !legal) {
        showInvalidState();
        return;
    }

    clearInvalidState();

    // Part 3 will compute CP and update Footnote 4 + Play Direction
};


// ===============================
// PART 3 — CP CALCULATION ENGINE
// ===============================

// -------------------------------
// CP FROM PC LEVELS
// -------------------------------
function getCPForPC(level, minLevel) {
    const diff = level - minLevel;
    switch (diff) {
        case 0: return 2;
        case 1: return 3;
        case 2: return 4;
        case 3: return 6;
        default: return 0;
    }
}


// -------------------------------
// NPC PREGEN TABLE (WITH LEVELS)
// -------------------------------
const pregenTable = [
    // Scenario Min 1
    { min: 1, players: 2, cp: "<8",    pregens: "2 lvl 1", mod: 4 },
    { min: 1, players: 2, cp: "8+",    pregens: "2 lvl 3", mod: 8 },
    { min: 1, players: 3, cp: "<12",   pregens: "1 lvl 1", mod: 2 },
    { min: 1, players: 3, cp: "12+",   pregens: "1 lvl 3", mod: 4 },

    // Scenario Min 3
    { min: 3, players: 2, cp: "<8",    pregens: "2 lvl 3", mod: 4 },
    { min: 3, players: 2, cp: "8+",    pregens: "2 lvl 5", mod: 8 },
    { min: 3, players: 3, cp: "<12",   pregens: "1 lvl 3", mod: 2 },
    { min: 3, players: 3, cp: "12+",   pregens: "1 lvl 5", mod: 4 },

    // Scenario Min 5
    { min: 5, players: 2, cp: "Any",   pregens: "2 lvl 5", mod: 4 },
    { min: 5, players: 3, cp: "Any",   pregens: "1 lvl 5", mod: 2 },

    // Scenario Min 7+
    { min: 7, players: 3, cp: "<12",   pregens: "none",    mod: 2 },
    { min: 7, players: 3, cp: "12+",   pregens: "none",    mod: 4 }
];


// -------------------------------
// PREGEN LOOKUP
// -------------------------------
function lookupPregenRow(baseCP, scenarioMin, players) {
    return pregenTable.find(row => {
        if (row.min === 7 && scenarioMin < 7) return false;
        if (row.min !== 7 && row.min !== scenarioMin) return false;
        if (row.players !== players) return false;

        if (row.cp === "Any") return true;
        if (row.cp === "<8" && baseCP < 8) return true;
        if (row.cp === "8+" && baseCP >= 8) return true;
        if (row.cp === "<12" && baseCP < 12) return true;
        if (row.cp === "12+" && baseCP >= 12) return true;

        return false;
    });
}


// -------------------------------
// MAIN CP CALCULATION
// -------------------------------
function calculateCP(hardmodeActive) {
    const min = getMinLevel();
    const players = getNumPlayers();
    const pregens = getNumPregens();

    // -------------------------------
    // 1. CP FROM PCs
    // -------------------------------
    let cpPCs = 0;
    const boxes = playerLevelContainer.querySelectorAll(".player-box");

    boxes.forEach((box, index) => {
        if (index >= players) return;
        const lvl = parseInt(box.querySelector("input").value);
        cpPCs += getCPForPC(lvl, min);
    });

    cpFromPCs.textContent = cpPCs;


    // -------------------------------
    // 2. NPC PREGEN MODIFIER + LEVEL
    // -------------------------------
    let pregenMod = 0;
    let pregenLevel = null;

    if (pregens > 0 && players <= 3) {
        const row = lookupPregenRow(cpPCs, min, players);

        if (row) {
            pregenMod = row.mod;

            if (row.pregens !== "none") {
                const parts = row.pregens.split("lvl");
                pregenLevel = parts[1].trim();
            }
        }

        if (pregenLevel) {
            pregenLabel.textContent = `${pregens} Pregens, level ${pregenLevel}:`;
        } else {
            pregenLabel.textContent = `${pregens} Pregens:`;
        }

        cpPregens.textContent = `+${pregenMod}`;
        cpPregens.classList.remove("greyed");
        cpPregens.classList.add("pregen-active");

    } else {
        pregenLabel.textContent = `${pregens} Pregens:`;
        cpPregens.textContent = "--";
        cpPregens.classList.add("greyed");
        cpPregens.classList.remove("pregen-active");
    }


    // -------------------------------
    // 3. HARDMODE MODIFIER
    // -------------------------------
    const hardmodeMod = 0;

    if (hardmodeActive) {
        hardmodeRow.style.display = "flex";
        cpHardmode.textContent = "+0";
    } else {
        hardmodeRow.style.display = "none";
    }


    // -------------------------------
    // 4. TOTAL CP
    // -------------------------------
    const total = cpPCs + pregenMod + hardmodeMod;
    totalCP.textContent = total;

    totalCP.classList.remove("invalid-total");
    totalCP.classList.add("valid-total");


    // -------------------------------
    // 5. FOOTNOTE 4
    // -------------------------------
    updateFootnote4(total);


    // -------------------------------
    // 6. PLAY UP / PLAY DOWN
    // -------------------------------
    if (total <= 15) {
        playDirection.textContent = "Play Down";
    } else if (total >= 19) {
        playDirection.textContent = "Play Up";
    } else {
        playDirection.textContent = (players <= 4) ? "Play Up" : "Play Down";
    }
}


// -------------------------------
// FINAL VALIDATION HOOK
// -------------------------------
const validateAll_part2 = validateAll;
validateAll = function () {
    const levelsOK = validatePlayerLevels();
    const { legal, hardmode } = checkPartyLegality();

    updateFootnotesBasic();

    if (!levelsOK || !legal) {
        showInvalidState();
        return;
    }

    clearInvalidState();
    calculateCP(hardmode);
};


