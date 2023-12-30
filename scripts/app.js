import { MODULE_ID } from "./main";
import { getSetting } from "./settings";
export class RealRoll extends FormApplication {
    constructor(dieTerms) {
        super();
        this.dieTerms = dieTerms;
        this.dieTerms.forEach((term) => {
            term.exploding = (term.modifiers ?? []).includes("x");
            term.inputs = Array.from({ length: term.number }, () => term.faces);
            if (term.number > 1 && getSetting("enableTotalBox")) {
                term.totalInput = {
                    min: term.number,
                    max: term.number * term.faces,
                };
            }
            term.index = this.dieTerms.indexOf(term);
        });
        this.promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    static async prompt(terms, roll) {
        if(roll.realRollRollMode == CONST.DICE_ROLL_MODES.BLIND || roll.options?.rollMode == CONST.DICE_ROLL_MODES.BLIND ) return true;
        const dieTerms = terms.filter((term) => term instanceof Die);
        if (!dieTerms.length || getSetting("manualRollMode") == 0) return true;
        const realRoll = new RealRoll(dieTerms);
        return realRoll.prompt();
    }

    async prompt() {
        if (getSetting("manualRollMode") === 2) {
            const manual = await this.askForManual();
            if (!manual) {
                this._resolve(true);
                return this.promise;
            }
        }
        await this.render(true);
        return this.promise;
    }

    async askForManual() {
        await new Promise((resolve, reject) => setTimeout(resolve, 200));
        const res = await Dialog.confirm({
            title: "Manual Roll",
            content: "Would you like to roll manually?",
            yes: () => {
                return true;
            },
            no: () => {
                return false;
            },
            defaultYes: false,
            close: () => {
                return false;
            },
        });
        return res;
    }

    static get APP_ID() {
        return "real-roll";
    }

    get id() {
        return RealRoll.APP_ID + randomID();
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: this.APP_ID,
            template: `modules/${MODULE_ID}/templates/${this.APP_ID}.hbs`,
            popOut: true,
            resizable: false,
            minimizable: true,
            title: game.i18n.localize(`${MODULE_ID}.${this.APP_ID}.title`),
            classes: getSetting("useTheme") ? ["themed-mode", this.APP_ID] : [this.APP_ID],
        });
    }

    async getData() {
        return { dieTerms: this.dieTerms, multiRow: this.dieTerms.length > 1 };
    }

    activateListeners(html) {
        super.activateListeners(html);
        html = html[0] ?? html;
        const defaultPosition = getSetting("position");
        if (defaultPosition == "chat") {
            const chat = document.getElementById("chat-log");
            //position at the bottom left of the chat log
            const chatRect = chat.getBoundingClientRect();
            const left = chatRect.left - Math.max(200, this.element[0].offsetWidth) - 10;
            const top = chatRect.top + chatRect.height - this.element[0].offsetHeight / 2;
            this.setPosition({
                left,
                top,
            });
        }
    }

    async _updateObject(event, formData) {
        const data = foundry.utils.expandObject(formData);

        for (const [key, value] of Object.entries(data)) {
            if (!value.total) continue;
            const dieTerm = this.dieTerms[parseInt(key)];
            if (!dieTerm) continue;
            const total = parseInt(value.total);
            const diceCount = dieTerm.number;
            const faceMax = dieTerm.faces;
            //generate N rolls so that the total is correct
            const rolls = [];
            let remaining = total;
            for (let i = 0; i < diceCount; i++) {
                const min = Math.max(1, remaining - (diceCount - i - 1) * faceMax);
                const max = Math.min(faceMax, remaining - (diceCount - i - 1));
                const roll = Math.floor(Math.random() * (max - min + 1)) + min;
                rolls.push(roll);
                remaining -= roll;
            }
            delete value.total;
            for (let i = 0; i < diceCount; i++) {
                value[i] = rolls[i];
            }
        }

        let hasRolledManually = false;
        for (let it = 0; it < this.dieTerms.length; it++) {
            const term = this.dieTerms[it];
            const termData = data[`${it}`];
            if (!termData) continue;
            term.inputs = term.inputs.map((input, index) => {
                return termData[`${index}`] ?? null;
            });
            if (term.inputs.some((input) => input !== null)) hasRolledManually = true;
            const rollOverride = function ({ minimize = false, maximize = false } = {}) {
                const roll = { result: undefined, active: true };
                if (minimize) roll.result = Math.min(1, this.faces);
                else if (maximize) roll.result = this.faces;
                else roll.result = this.inputs[this.results.length] ?? Math.ceil(CONFIG.Dice.randomUniform() * this.faces);
                this.results.push(roll);
                return roll;
            };
            term.roll = rollOverride.bind(term);
        }
        if (hasRolledManually) this.displayGmMessage();
    }

    async displayGmMessage() {
        if (game.user.isGM || !getSetting("showMessage")) return;
        ChatMessage.create({
            content: `<div class="real-roll-message">${game.user.name} ${game.i18n.localize(`${MODULE_ID}.${RealRoll.APP_ID}.realRollMessage`)}</div>`,
            speaker: { alias: "Real Dice" },
            whisper: ChatMessage.getWhisperRecipients("GM"),
        });
    }

    async close(...args) {
        this._resolve(true);
        return super.close(...args);
    }
}
