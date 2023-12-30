import {RealRoll} from "./app";
import { getSetting } from "./settings";

export async function _evaluate(wrapped, ...args) {

    if (getSetting("manualRollMode") == 0) return wrapped(...args);
    
    // Unpack arguments

    const { minimize, maximize } = args[0] || {};


    // Step 1 - Replace intermediate terms with evaluated numbers
    const intermediate = [];
    for (let term of this.terms) {
        if (!(term instanceof RollTerm)) {
            throw new Error("Roll evaluation encountered an invalid term which was not a RollTerm instance");
        }
        if (term.isIntermediate) {
            await term.evaluate({ minimize, maximize, async: true });
            this._dice = this._dice.concat(term.dice);
            term = new NumericTerm({ number: term.total, options: term.options });
        }
        intermediate.push(term);
    }
    this.terms = intermediate;

    // Step 2 - Simplify remaining terms
    this.terms = this.constructor.simplifyTerms(this.terms);

    // Step 3 - Manually evaluate Die terms

    await RealRoll.prompt(this.terms);

    // Step 4 - Evaluate remaining terms
    for (let term of this.terms) {
        if (!term._evaluated) await term.evaluate({ minimize, maximize, async: true });
    }

    // Step 5 - Evaluate the final expression
    this._total = this._evaluateTotal();
    return this;
}