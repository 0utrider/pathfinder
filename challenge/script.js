// ===============================
// DOM REFERENCES
// ===============================
const levelMin = document.getElementById("levelMin");
const levelMax = document.getElementById("levelMax");
const levelRangeDisplay = document.getElementById("levelRangeDisplay");

const numPlayers = document.getElementById("numPlayers");
const numPlayersDisplay = document.getElementById("numPlayersDisplay");

const numPregens = document.getElementById("numPregens");
const numPregensDisplay = document.getElementById("numPregensDisplay");

const playerLevelContainer = document.getElementById("playerLevelContainer");

const cpFromPCs = document.getElementById("cpFromPCs");
const cpPregens = document.getElementById("cpPregens");
const cpHardmode = document.getElementById("cpHardmode");
const hardmodeRow = document.getElementById("hardmodeRow");
const totalCP = document.getElementById("totalCP");

const appendixToggle = document.getElementById("appendixToggle");
const appendixContent = document.getElementById("appendixContent");

// Footnotes
const footnote1 = document.getElementById("footnote1");
const footnote2 = document.getElementById("footnote2");
const footnote3 = document.getElementById("footnote3");
const footnote4 = document.getElementById("footnote4");

// ===============================
// INITIAL SETUP
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    generatePlayerLevelInputs(numPlayers.value);
    updateLevelRangeDisplay();
    updateNumPlayersDisplay();
    updateNumPregensDisplay();
    validateAll();
});

// ===============================
// APPENDIX TOGGLE
// ===============================
appendixToggle.addEventListener("click", () => {
    appendixContent.classList.toggle("open");
});

// ===============================
// PLAYER LEVEL INPUT GENERATION
// ===============================
function generatePlayerLevelInputs(count) {
    playerLevelContainer.innerHTML = "";

    for (let i = 1; i <= count; i++) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("player-level-row");

        const label = document.createElement("label");
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
}

// ===============================
// SLIDER DISPLAY UPDATES
// ===============================
function updateLevelRangeDisplay() {
    levelRangeDisplay.textContent = `${levelMin.value} – ${levelMax.value}`;
}

function updateNumPlayersDisplay() {
    numPlayersDisplay.textContent = `${numPlayers.value} Players`;
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
    generatePlayerLevelInputs(numPlayers.value);
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
// - spread can be 0 (single-level scenario)
function enforceLevelRangeRules() {
    let min = parseInt(levelMin.value);
    let max = parseInt(levelMax.value);

    // Ensure min ≤ max
    if (min > max) {
        max = min;
        levelMax.value = max;
    }

    // Ensure spread ≤ 3
    if (max > min + 3) {
        max = min + 3;
        levelMax.value = max;
    }
}

// ===============================
// VALIDATION + INVALID STATE HANDLING
// ===============================
function validateAll() {
    const min = parseInt(levelMin.value);
    const max = parseInt(levelMax.value);

    let valid = true;

    // Validate player levels
    const playerInputs = document.querySelectorAll(".player-level-input");
    playerInputs.forEach(input => {
        const val = parseInt(input.value);
        if (val < min || val > max) {
            input.classList.add("invalid");
            valid = false;
        } else {
            input.classList.remove("invalid");
        }
    });

    // If invalid, show red "--" and fast pulse
    if (!valid) {
        showInvalidState();
        return;
    }

    // If valid so far, proceed to CP calculation (in Part 2)
    // For now, just clear invalid state
    clearInvalidState();
}

// ===============================
// INVALID STATE DISPLAY
// ===============================
function showInvalidState() {
    totalCP.textContent = "--";
    totalCP.classList.add("invalid-total");
    totalCP.classList.remove("valid-total");
}

// ===============================
// CLEAR INVALID STATE
// ===============================
function clearInvalidState() {
    totalCP.classList.remove("invalid-total");
    // CP calculation will set valid-total later
}
// ===============================
// PART 2: FOOTNOTES, PARTY RULES, HARDMODE
// ===============================

// Helper: get numeric values
function getMinLevel() {
    return parseInt(levelMin.value);
}

function getMaxLevel() {
    return parseInt(levelMax.value);
}

function getNumPlayers() {
    return parseInt(numPlayers.value);
}

function getNumPregens() {
    return parseInt(numPregens.value);
}

// ===============================
// FOOTNOTE HIGHLIGHT LOGIC
// ===============================
function updateFootnotes() {
    const min = getMinLevel();
    const players = getNumPlayers();
    const pregens = getNumPregens();

    // Reset classes
    [footnote1, footnote2, footnote3, footnote4].forEach(fn => {
        fn.classList.remove("fn-purple", "fn-red");
    });
    levelRangeDisplay.classList.remove("fn-red");
    levelMin.classList.remove("fn-red");
    levelMax.classList.remove("fn-red");

    // Footnote 1:
    // "Parties of 2 Players are only legal in scenarios with a minimum level of 5 or lower."
    // Purple if players = 2
    // Red (footnote + level range text + slider) if players = 2 AND min ≥ 7
    if (players === 2) {
        if (min >= 7) {
            footnote1.classList.add("fn-red");
            levelRangeDisplay.classList.add("fn-red");
            levelMin.classList.add("fn-red");
            levelMax.classList.add("fn-red");
        } else {
            footnote1.classList.add("fn-purple");
        }
    }

    // Footnote 2:
    // "For parties with only 2-3 Players, 1-2 NPC Pregens may be played..."
    // Purple if players ≤ 3, normal if ≥ 4
    if (players <= 3) {
        footnote2.classList.add("fn-purple");
    }

    // Footnote 3:
    // "Scenarios are designed for 4 PCs; in Scenarios with a minimum level of 6 or higher
    // 3 PCs are allowed to play in hardmode if all players agree..."
    // Purple if players = 3 and pregens = 0 and min ≥ 6
    // 2 players with no pregens is never allowed (handled by legality)
    if (players === 3 && pregens === 0 && min >= 6) {
        footnote3.classList.add("fn-purple");
    }

    // Footnote 4 is informational; we’ll highlight it later if desired based on CP bands.
}

// ===============================
// PARTY LEGALITY & HARDMODE
// ===============================
function checkPartyLegality() {
    const min = getMinLevel();
    const players = getNumPlayers();
    const pregens = getNumPregens();

    let legal = true;
    let hardmodeActive = false;

    // 2 players only legal if min ≤ 5
    if (players === 2 && min > 5) {
        legal = false;
    }

    // 2 players with no pregens is never allowed
    if (players === 2 && pregens === 0) {
        legal = false;
    }

    // 3 players with no pregens and min ≥ 6 is allowed only as hardmode
    if (players === 3 && pregens === 0 && min >= 6) {
        hardmodeActive = true;
    }

    return { legal, hardmodeActive };
}

// ===============================
// HARDMODE DISPLAY
// ===============================
function updateHardmodeDisplay(hardmodeActive) {
    if (hardmodeActive) {
        hardmodeRow.style.display = "flex";
        cpHardmode.textContent = "+0"; // CP modifier for hardmode itself is 0; it's a flag
        cpHardmode.classList.add("hardmode-active");
    } else {
        hardmodeRow.style.display = "none";
        cpHardmode.classList.remove("hardmode-active");
    }
}

// ===============================
// EXTEND validateAll WITH PARTY + FOOTNOTES
// ===============================
const _originalValidateAll = validateAll;
validateAll = function () {
    const min = getMinLevel();
    const max = getMaxLevel();

    let valid = true;

    // Level range rules already enforced structurally, but we can sanity check
    if (max < min || max > min + 3) {
        valid = false;
    }

    // Validate player levels
    const playerInputs = document.querySelectorAll(".player-level-input");
    playerInputs.forEach(input => {
        const val = parseInt(input.value);
        if (isNaN(val) || val < min || val > max) {
            input.classList.add("invalid");
            valid = false;
        } else {
            input.classList.remove("invalid");
        }
    });

    // Party legality + hardmode
    const { legal, hardmodeActive } = checkPartyLegality();
    if (!legal) {
        valid = false;
    }

    updateHardmodeDisplay(hardmodeActive);
    updateFootnotes();

    if (!valid) {
        showInvalidState();
        return;
    }

    clearInvalidState();
    calculateCP(hardmodeActive);
};
// ===============================
// PART 3: CP CALCULATION ENGINE
// ===============================

// ===============================
// CP FROM PC LEVELS
// ===============================
// Challenge Point Table:
// Lowest allowed level → +2
// +1 → +3
// +2 → +4
// +3 → +6
// PCs cannot exceed the scenario level range; validation already prevents that.

function getCPForPC(level, minLevel) {
    const diff = level - minLevel;

    switch (diff) {
        case 0: return 2;
        case 1: return 3;
        case 2: return 4;
        case 3: return 6;
        default:
            // Should never happen due to validation
            return 0;
    }
}

// ===============================
// NPC PREGEN MODIFIER LOOKUP
// ===============================
// Table is encoded exactly as in your FINAL FORM

function getPregenModifier(baseCP, scenarioMin, players) {
    // Only used when players = 2 or 3
    if (players >= 4) return 0;

    // Rows encoded as objects for clarity
    const table = [
        // Scenario Min 1
        { min: 1, players: 2, cp: "<8", mod: 4 },
        { min: 1, players: 2, cp: "8+", mod: 8 },
        { min: 1, players: 3, cp: "<12", mod: 2 },
        { min: 1, players: 3, cp: "12+", mod: 4 },

        // Scenario Min 3
        { min: 3, players: 2, cp: "<8", mod: 4 },
        { min: 3, players: 2, cp: "8+", mod: 8 },
        { min: 3, players: 3, cp: "<12", mod: 2 },
        { min: 3, players: 3, cp: "12+", mod: 4 },

        // Scenario Min 5
        { min: 5, players: 2, cp: "Any", mod: 4 },
        { min: 5, players: 3, cp: "Any", mod: 2 },

        // Scenario Min 7+
        { min: 7, players: 3, cp: "<12", mod: 2 },
        { min: 7, players: 3, cp: "12+", mod: 4 }
    ];

    // Find matching rows
    const matches = table.filter(row => {
        // Scenario min level match (7+ means >=7)
        if (row.min === 7 && scenarioMin < 7) return false;
        if (row.min !== 7 && row.min !== scenarioMin) return false;

        // Player count match
        if (row.players !== players) return false;

        // CP condition match
        if (row.cp === "Any") return true;
        if (row.cp === "<8" && baseCP < 8) return true;
        if (row.cp === "8+" && baseCP >= 8) return true;
        if (row.cp === "<12" && baseCP < 12) return true;
        if (row.cp === "12+" && baseCP >= 12) return true;

        return false;
    });

    if (matches.length === 0) return 0;

    // Only one row should match
    return matches[0].mod;
}

// ===============================
// MAIN CP CALCULATION
// ===============================
function calculateCP(hardmodeActive) {
    const min = getMinLevel();
    const players = getNumPlayers();
    const pregens = getNumPregens();

    // -------------------------------
    // 1. CP FROM PCs
    // -------------------------------
    let cpPCs = 0;
    const playerInputs = document.querySelectorAll(".player-level-input");

    playerInputs.forEach(input => {
        const lvl = parseInt(input.value);
        cpPCs += getCPForPC(lvl, min);
    });

    cpFromPCs.textContent = cpPCs;

    // -------------------------------
    // 2. NPC PREGEN MODIFIER
    // -------------------------------
    let pregenMod = 0;

    if (pregens > 0 && players <= 3) {
        pregenMod = getPregenModifier(cpPCs, min, players);
        cpPregens.textContent = `+${pregenMod}`;
        cpPregens.classList.remove("greyed");
        cpPregens.classList.add("pregen-active");
    } else {
        cpPregens.textContent = "--";
        cpPregens.classList.add("greyed");
        cpPregens.classList.remove("pregen-active");
    }

    // -------------------------------
    // 3. HARDMODE MODIFIER
    // -------------------------------
    // Hardmode does not add CP; it's a flag only.
    const hardmodeMod = 0;

    // -------------------------------
    // 4. TOTAL CP
    // -------------------------------
    const total = cpPCs + pregenMod + hardmodeMod;

    totalCP.textContent = total;

    // -------------------------------
    // 5. VALID STATE PULSE
    // -------------------------------
    totalCP.classList.remove("invalid-total");
    totalCP.classList.add("valid-total");
}
// ===============================
// PART 4: ANIMATION + UTILITY HELPERS
// ===============================

// These classes will be defined in CSS:
// .valid-total   → slow pulse (breathing)
// .invalid-total → fast pulse (urgent)

// ===============================
// ANIMATION HELPERS
// ===============================

function setValidPulse() {
    totalCP.classList.remove("invalid-total");
    void totalCP.offsetWidth; // restart animation
    totalCP.classList.add("valid-total");
}

function setInvalidPulse() {
    totalCP.classList.remove("valid-total");
    void totalCP.offsetWidth; // restart animation
    totalCP.classList.add("invalid-total");
}

// ===============================
// OVERRIDE INVALID STATE HANDLER
// ===============================
function showInvalidState() {
    totalCP.textContent = "--";
    setInvalidPulse();
}

// ===============================
// OVERRIDE CLEAR INVALID STATE
// ===============================
function clearInvalidState() {
    totalCP.classList.remove("invalid-total");
    // valid pulse will be applied after CP calculation
}

// ===============================
// UTILITY: FORCE REPAINT
// ===============================
// Used to restart CSS animations cleanly
function restartAnimation(el) {
    el.classList.remove("valid-total", "invalid-total");
    void el.offsetWidth;
}

// ===============================
// HOOK INTO CP CALCULATION
// ===============================
// Modify calculateCP to apply valid pulse after computing total

const _originalCalculateCP = calculateCP;
calculateCP = function (hardmodeActive) {
    _originalCalculateCP(hardmodeActive);

    // If we got here, the state is valid
    setValidPulse();
};
// ===============================
// PART 5: FOOTNOTE 4 + FINAL GLUE
// ===============================

// Footnote 4 logic:
// - CP ≤ 15 → lower range
// - CP ≥ 19 → higher range
// - CP 16–18 → higher range only if PCs ≤ 4
// - PCs ≥ 5 → always lower range for 16–18

function updateFootnote4(totalCPValue) {
    footnote4.classList.remove("fn-purple");

    const players = getNumPlayers();

    if (totalCPValue <= 15) {
        footnote4.classList.add("fn-purple");
        return;
    }

    if (totalCPValue >= 19) {
        footnote4.classList.add("fn-purple");
        return;
    }

    // CP 16–18 band
    if (totalCPValue >= 16 && totalCPValue <= 18) {
        if (players <= 4) {
            footnote4.classList.add("fn-purple");
        }
    }
}

// ===============================
// FINAL HOOK: EXTEND calculateCP AGAIN
// ===============================
const _calculateCP_final = calculateCP;
calculateCP = function (hardmodeActive) {
    _calculateCP_final(hardmodeActive);

    // After total CP is displayed, apply Footnote 4 logic
    const total = parseInt(totalCP.textContent);
    if (!isNaN(total)) {
        updateFootnote4(total);
    }
};

// ===============================
// GLOBAL SAFETY GUARD
// ===============================
// Ensures recalculation happens whenever ANY input changes

document.addEventListener("input", () => {
    validateAll();
});

// ===============================
// END OF SCRIPT
// ===============================
console.log("Challenge Point Calculator script loaded.");
