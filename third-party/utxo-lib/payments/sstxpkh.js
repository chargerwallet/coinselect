"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sstxpkh = sstxpkh;
const tslib_1 = require("tslib");
const bs58check = tslib_1.__importStar(require("../bs58check"));
const networks_1 = require("../networks");
const bscript = tslib_1.__importStar(require("../script"));
const lazy = tslib_1.__importStar(require("./lazy"));
const types_1 = require("../types");
const { OPS } = bscript;
function sstxpkh(a, opts) {
    if (!a.address && !a.hash && !a.output)
        throw new TypeError('Not enough data');
    opts = Object.assign({ validate: true }, opts || {});
    (0, types_1.typeforce)({
        network: types_1.typeforce.maybe(types_1.typeforce.Object),
        address: types_1.typeforce.maybe(types_1.typeforce.String),
        hash: types_1.typeforce.maybe(types_1.typeforce.BufferN(20)),
        output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
    }, a);
    const _address = lazy.value(() => bs58check.decodeAddress(a.address, a.network));
    const network = a.network || networks_1.decred;
    const o = { name: 'sstxpkh', network };
    lazy.prop(o, 'address', () => {
        if (!o.hash)
            return;
        return bs58check.encodeAddress(o.hash, network.pubKeyHash, network);
    });
    lazy.prop(o, 'hash', () => {
        if (a.output)
            return a.output.subarray(4, 24);
        if (a.address)
            return _address().hash;
    });
    lazy.prop(o, 'output', () => {
        if (!o.hash)
            return;
        return bscript.compile([
            OPS.OP_SSTX,
            OPS.OP_DUP,
            OPS.OP_HASH160,
            o.hash,
            OPS.OP_EQUALVERIFY,
            OPS.OP_CHECKSIG,
        ]);
    });
    if (opts.validate) {
        let hash = Buffer.from([]);
        if (a.address) {
            const { version, hash: aHash } = _address();
            if (version !== network.pubKeyHash)
                throw new TypeError('Invalid version or Network mismatch');
            if (aHash.length !== 20)
                throw new TypeError('Invalid address');
            hash = aHash;
        }
        if (a.hash) {
            if (hash.length > 0 && !hash.equals(a.hash))
                throw new TypeError('Hash mismatch');
            else
                hash = a.hash;
        }
        if (a.output) {
            if (a.output.length !== 26 ||
                a.output[0] !== OPS.OP_SSTX ||
                a.output[1] !== OPS.OP_DUP ||
                a.output[2] !== OPS.OP_HASH160 ||
                a.output[3] !== 0x14 ||
                a.output[24] !== OPS.OP_EQUALVERIFY ||
                a.output[25] !== OPS.OP_CHECKSIG)
                throw new TypeError('sstxpkh output is invalid');
            const hash2 = a.output.subarray(4, 24);
            if (hash.length > 0 && !hash.equals(hash2))
                throw new TypeError('Hash mismatch');
        }
    }
    return Object.assign(o, a);
}
//# sourceMappingURL=sstxpkh.js.map