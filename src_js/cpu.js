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
    var CPU;
    (function (CPU) {
        var status_mask_sign = 128;
        var status_mask_overflow = 64;
        var status_mask_breakpoint = 16;
        var status_mask_interrupt = 4;
        var status_mask_zero = 2;
        var status_mask_carry = 1;
        cpu_zero = {
            A: 0,
            X: 0,
            Y: 0,
            SP: 0,
            PC: 0,
            SR: 0
        };
        function cpu_increase_pc(cpu) {
            return __assign({ PC: PC + 1 }, cpu);
        }
    })(CPU || (CPU = {}));
})(NES || (NES = {}));
//# sourceMappingURL=js.map