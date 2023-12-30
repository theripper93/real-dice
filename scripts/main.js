import {initConfig} from "./config.js";
import { registerSettings } from "./settings.js";

export const MODULE_ID = "real-dice";

Hooks.on("init", () => {
    registerSettings();
});

Hooks.on("setup", () => {
    initConfig();
});