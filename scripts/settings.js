import {MODULE_ID} from "./main.js";
import { updateRealRollMode } from "./config.js";

export function registerSettings() {

    Hooks.on("renderSettingsConfig", (app, html, data) => {
        colorPicker("messageColor", html);
        colorPicker("themeColor", html);
    });


    const settings = {
        "manualRollMode": {
            name: `${MODULE_ID}.settings.manualRollMode.name`,
            hint: `${MODULE_ID}.settings.manualRollMode.hint`,
            scope: "client",
            config: true,
            type: Number,
            default: 0,
            choices: {
                0: `${MODULE_ID}.settings.manualRollMode.choices.0`,
                1: `${MODULE_ID}.settings.manualRollMode.choices.1`,
                2: `${MODULE_ID}.settings.manualRollMode.choices.2`,
            },
            onChange: () => updateRealRollMode(),
        },
        "showMessage": {
            name: `${MODULE_ID}.settings.showMessage.name`,
            hint: `${MODULE_ID}.settings.showMessage.hint`,
            scope: "world",
            config: true,
            type: Boolean,
            default: true,
        },
        "messageColor": {
            name: `${MODULE_ID}.settings.messageColor.name`,
            hint: `${MODULE_ID}.settings.messageColor.hint`,
            scope: "world",
            config: true,
            type: String,
            default: "#ff007a",
            onChange: () => updateColorVar(),
        },
        "useTheme": {
            name: `${MODULE_ID}.settings.useTheme.name`,
            hint: `${MODULE_ID}.settings.useTheme.hint`,
            scope: "world",
            config: true,
            type: Boolean,
            default: true,
        },
        "themeColor": {
            name: `${MODULE_ID}.settings.themeColor.name`,
            hint: `${MODULE_ID}.settings.themeColor.hint`,
            scope: "world",
            config: true,
            type: String,
            default: "#ffa200",
            onChange: () => updateColorVar(),
        },
    };

    registerSettingsArray(settings);

    updateColorVar();
}

export function getSetting(key) {
    return game.settings.get(MODULE_ID, key);
}

export async function setSetting(key, value) {
    return await game.settings.set(MODULE_ID, key, value);
}

function registerSettingsArray(settings) {
    for(const [key, value] of Object.entries(settings)) {
        game.settings.register(MODULE_ID, key, value);
    }
}

//Color Picker by kaelad02
//License: MIT
//Documentation: https://github.com/kaelad02/adv-reminder/blob/54207ec1ef0500439e57521f15956c07e4c02af4/src/settings.js#L91-L104

function colorPicker(settingId, html) {
    const colorPickerElement = document.createElement("input");
    colorPickerElement.setAttribute("type", "color");
    colorPickerElement.setAttribute("data-edit", MODULE_ID + "." + settingId);
    colorPickerElement.value = game.settings.get(MODULE_ID, settingId);

    // Add color picker
    const stringInputElement = html[0].querySelector(`input[name="${MODULE_ID}.${settingId}"]`);
    stringInputElement.classList.add("color");
    stringInputElement.after(colorPickerElement);
}

function updateColorVar() {
    const color = game.settings.get(MODULE_ID, "messageColor");
    document.documentElement.style.setProperty("--real-roll-message-color", color);
    const themeColor = game.settings.get(MODULE_ID, "themeColor");
    document.documentElement.style.setProperty("--real-roll-theme-accent", themeColor);
}