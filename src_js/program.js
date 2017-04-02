var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var NES;
(function (NES) {
    var flags_zero = {
        ppu_dirty: false
    };
    var state_zero = {
        ast: NES.ast_zero,
        cpu: NES.cpu_zero,
        ppu: NES.ppu_zero,
        apu: NES.apu_zero,
        flags: flags_zero
    };
    function step(state) {
        if (state.cpu.PC >= 0 && state.cpu.PC < state.ast.length) {
            console.log(state.ast[state.cpu.PC]);
        }
        else {
            console.log("Error: PC out of bounds!");
        }
        return state;
    }
    var state = __assign({ ast: { opcode: "INX", operands: { kind: "implied" } } }, state_zero);
    document.body.onload = function () {
        step(state);
        console.log("well then");
    };
    document.body.innerHTML = "OK!";
})(NES || (NES = {}));
//# sourceMappingURL=program.js.map