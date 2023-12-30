import {initConfig} from "./config.js";
import { registerSettings } from "./settings.js";
import { RealRoll } from "./app.js";

export const MODULE_ID = "real-dice";

const messageCss = `
.chat-message:has(.real-roll-message){
    display: none;
}`

const messageStyle = document.createElement("style");
messageStyle.appendChild(document.createTextNode(messageCss));

//add style to head
document.head.appendChild(messageStyle);

Hooks.on("init", () => {
    registerSettings();
});

Hooks.on("setup", () => {
    initConfig();
    CONFIG.Dice.RealRoll = RealRoll;
});

Hooks.on("ready", () => {
    if (game.user.isGM) {
        document.head.removeChild(messageStyle);
    }
});