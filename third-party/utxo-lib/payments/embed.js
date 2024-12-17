"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.p2data = p2data;
const tslib_1 = require("tslib");
const networks_1 = require("../networks");
const bscript = tslib_1.__importStar(require("../script"));
const lazy = tslib_1.__importStar(require("./lazy"));
const types_1 = require("../types");
const { OPS } = bscript;
function stacksEqual(a, b) {
    if (a.length !== b.length)
        return false;
    return a.every((x, i) => x.equals(b[i]));
}
function p2data(a, opts) {
    if (!a.data && !a.output)
        throw new TypeError('Not enough data');
    opts = Object.assign({ validate: true }, opts || {});
    (0, types_1.typeforce)({
        network: types_1.typeforce.maybe(types_1.typeforce.Object),
        output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
        data: types_1.typeforce.maybe(types_1.typeforce.arrayOf(types_1.typeforce.Buffer)),
    }, a);
    const network = a.network || networks_1.bitcoin;
    const o = { name: 'embed', network };
    lazy.prop(o, 'output', () => {
        if (!a.data)
            return;
        return bscript.compile([OPS.OP_RETURN].concat(a.data));
    });
    lazy.prop(o, 'data', () => {
        if (!a.output)
            return;
        return bscript.decompile(a.output).slice(1);
    });
    if (opts.validate) {
        if (a.output) {
            const chunks = bscript.decompile(a.output);
            if (chunks[0] !== OPS.OP_RETURN)
                throw new TypeError('Output is invalid');
            if (!chunks.slice(1).every(types_1.typeforce.Buffer))
                throw new TypeError('Output is invalid');
            if (a.data && !stacksEqual(a.data, o.data))
                throw new TypeError('Data mismatch');
        }
    }
    return Object.assign(o, a);
}
//# sourceMappingURL=embed.js.map