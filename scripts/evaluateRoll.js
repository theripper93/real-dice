import {RealRoll} from "./app";
import {getSetting} from "./settings";

export async function _evaluate(wrapped, ...args) {
    if (getSetting("manualRollMode") != 0) await RealRoll.prompt(this.terms, this);
    return wrapped(...args);
}