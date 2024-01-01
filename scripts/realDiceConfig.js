import { MODULE_ID } from "./main.js";

export class RealDiceConfig extends FormApplication {
    constructor() {
        super();
    }

    static get APP_ID() {
        return this.name
            .split(/(?=[A-Z])/)
            .join("-")
            .toLowerCase();
    }

    get APP_ID() {
        return this.constructor.APP_ID;
    }

    static get SETTING_KEY() {
        return this.name.charAt(0).toLowerCase() + this.name.slice(1);
    }

    get SETTING_KEY() {
        return this.constructor.SETTING_KEY;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: this.APP_ID,
            template: `modules/${MODULE_ID}/templates/${this.APP_ID}.hbs`,
            popOut: true,
            minimizable: true,
            title: game.i18n.localize(`${MODULE_ID}.settings.${this.SETTING_KEY}.name`),
            closeOnSubmit: true,
        });
    }

    async getData() {
        return game.settings.get(MODULE_ID, this.SETTING_KEY);
    }

    activateListeners(html) {
        super.activateListeners(html);
        html = html[0] ?? html;
    }

    async _updateObject(event, formData) {
        formData = foundry.utils.expandObject(formData);
        return game.settings.set(MODULE_ID, this.SETTING_KEY, formData);
    }

    static register() {
        game.settings.registerMenu(MODULE_ID, this.APP_ID, {
            name: game.i18n.localize(`${MODULE_ID}.settings.${this.SETTING_KEY}.name`),
            label: game.i18n.localize(`${MODULE_ID}.settings.${this.SETTING_KEY}.label`),
            hint: game.i18n.localize(`${MODULE_ID}.settings.${this.SETTING_KEY}.hint`),
            icon: "fas fa-cogs",
            type: this,
            restricted: true,
            scope: "world",
        });

        game.settings.register(MODULE_ID, this.SETTING_KEY, {
            scope: "world",
            config: false,
            default: {
                d4: true,
                d6: true,
                d8: true,
                d10: true,
                d12: true,
                d20: true,
                d100: true,
                other: false,
            },
            type: Object,
        });
    }
}
