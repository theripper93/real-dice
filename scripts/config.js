import {MODULE_ID} from "./main.js";
import {_evaluate} from "./evaluateRoll.js";
import { getSetting, setSetting } from "./settings.js";

const rollModeToggleEl = document.createElement("a");

const REAL_ROLL_MODE_ICONS = {
    0: "fas fa-square-xmark",
    1: "fas fa-dice",
    2: "fas fa-square-question",
};

export function initConfig() {

    libWrapper.register(MODULE_ID, 'Roll.prototype._evaluate', _evaluate, "MIXED");

    rollModeToggleEl.setAttribute("role", "button");
    rollModeToggleEl.setAttribute("tooltip-direction", "UP");
    rollModeToggleEl.classList.add("real-roll-mode-toggle");

    updateRealRollMode();

    rollModeToggleEl.addEventListener("click", () => {
        const currentRollMode = getSetting("manualRollMode");
        const realRollMode = (currentRollMode + 1) % 3;
        setSetting("manualRollMode", realRollMode);
    });

    Hooks.on("renderSidebarTab", (app, html, data) => {
        if (app.tabName !== "chat") return;
        const controls = html[0].querySelector(".control-buttons");
        if (!controls) {
            const div = document.createElement("div");
            div.classList.add("control-buttons");
            div.style.maxWidth = "25px";
            html[0].querySelector(".roll-type-select").after(div);
        }
        html[0].querySelector(".control-buttons").prepend(rollModeToggleEl);
    });

}

export function updateRealRollMode() {
    const realRollMode = getSetting("manualRollMode");
    const tooltipText = game.i18n.localize(`${MODULE_ID}.buttons.realRollToggle.tooltips.${realRollMode}`);
    rollModeToggleEl.setAttribute("data-tooltip", tooltipText);
    rollModeToggleEl.setAttribute("aria-label", tooltipText);

    rollModeToggleEl.innerHTML = `<i class="${REAL_ROLL_MODE_ICONS[realRollMode]}"></i>`;
}