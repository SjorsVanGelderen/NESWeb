/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
exports.apu_zero = {};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
exports.ast_zero = [];


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
exports.__esModule = true;
exports.status_mask_sign = 128;
exports.status_mask_overflow = 64;
exports.status_mask_breakpoint = 16;
exports.status_mask_interrupt = 4;
exports.status_mask_zero = 2;
exports.status_mask_carry = 1;
var mem_zero = [];
for (var i = 0; i < 100; i++) {
    mem_zero[i] = 0;
}
exports.cpu_zero = {
    A: 0,
    X: 0,
    Y: 0,
    SP: 0,
    PC: 0,
    SR: 0,
    MEM: mem_zero
};
function cpu_log(cpu) {
    function replacer(key, value) {
        if (key == "MEM") {
            return undefined;
        }
        else {
            return value;
        }
    }
    console.log(JSON.stringify(cpu, replacer));
}
exports.cpu_log = cpu_log;
function cpu_increase_pc(cpu) {
    return __assign({}, cpu, { PC: cpu.PC + 1 });
}
exports.cpu_increase_pc = cpu_increase_pc;
function cpu_manipulate_sr(cpu, enable, mask) {
    if (enable) {
        return __assign({}, cpu, { SR: cpu.SR | mask });
    }
    else {
        return __assign({}, cpu, { SR: cpu.SR & (~mask) });
    }
}
exports.cpu_manipulate_sr = cpu_manipulate_sr;
function cpu_transfer(cpu, left, right) {
    var register_value = left == "A" ? cpu.A : (left == "X" ? cpu.X : cpu.Y);
    if (right == "A") {
        return __assign({}, cpu, { A: register_value });
    }
    else if (right == "X") {
        return __assign({}, cpu, { X: register_value });
    }
    else {
        return __assign({}, cpu, { Y: register_value });
    }
}
exports.cpu_transfer = cpu_transfer;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
exports.ppu_zero = {};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
exports.__esModule = true;
var APU = __webpack_require__(0);
var ASM = __webpack_require__(1);
var CPU = __webpack_require__(2);
var PPU = __webpack_require__(3);
var flags_zero = {
    ppu_dirty: false,
    eof: false
};
var state_zero = {
    ast: ASM.ast_zero,
    cpu: CPU.cpu_zero,
    ppu: PPU.ppu_zero,
    apu: APU.apu_zero,
    flags: flags_zero
};
function log_statement(state) {
    var pc = state.cpu.PC;
    var statement = state.ast[state.cpu.PC];
    console.log("PC: "
        + pc
        + " | "
        + JSON.stringify(statement));
}
function process_statement(state) {
    var statement = state.ast[state.cpu.PC];
    if (statement.kind == "operation") {
        switch (statement.operation.opcode) {
            case "ADC":
                switch (statement.operation.operands.kind) {
                    case "immediate":
                        var result = state.cpu.A + statement.operation.operands.arguments;
                        if (result > 255) {
                            return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(__assign({}, state.cpu, { A: result - 255 }), true, CPU.status_mask_carry)) });
                        }
                        else {
                            return __assign({}, state, { cpu: CPU.cpu_increase_pc(__assign({}, state.cpu, { A: result })) });
                        }
                    default:
                        return state;
                }
            case "CLC":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, false, CPU.status_mask_carry)) });
            case "SEC":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, true, CPU.status_mask_carry)) });
            case "CLI":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, false, CPU.status_mask_interrupt)) });
            case "SEI":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, true, CPU.status_mask_interrupt)) });
            case "CLV":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, false, CPU.status_mask_overflow)) });
            case "NOP":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(state.cpu) });
            case "TAX":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "A", "X")) });
            case "TXA":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "X", "A")) });
            case "DEX":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(__assign({}, state.cpu, { X: state.cpu.X - 1 })) });
            case "INX":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(__assign({}, state.cpu, { X: state.cpu.X + 1 })) });
            case "TAY":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "A", "Y")) });
            case "TYA":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "Y", "A")) });
            case "DEY":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(__assign({}, state.cpu, { Y: state.cpu.Y - 1 })) });
            case "INY":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(__assign({}, state.cpu, { Y: state.cpu.Y + 1 })) });
            default:
                console.log("Unrecognized statement: "
                    + statement.operation.opcode
                    + "!");
        }
    }
    else if (statement.kind == "EOF") {
        return __assign({}, state, { flags: __assign({}, state.flags, { eof: true }) });
    }
    return state;
}
function step(state) {
    if (state.cpu.PC >= 0 && state.cpu.PC < state.ast.length) {
        log_statement(state);
        var state_prime = process_statement(state);
        CPU.cpu_log(state_prime.cpu);
        return state_prime;
    }
    else {
        console.log("Error: PC("
            + state.cpu.PC
            + ") out of "
            + "bounds(0 - "
            + state.ast.length
            + ")!");
    }
    return state;
}
function step_all(state) {
    var state_prime = step(state);
    if (!state_prime.flags.eof) {
        step_all(state_prime);
    }
}
document.body.onload = function () {
    var seeded_ast = [
        { kind: "operation", operation: { opcode: "INX", operands: { kind: "implied" } } },
        { kind: "operation", operation: { opcode: "ADC", operands: { kind: "immediate", arguments: 255 } } },
        { kind: "operation", operation: { opcode: "ADC", operands: { kind: "immediate", arguments: 240 } } },
        { kind: "EOF" }
    ];
    var state = state_zero;
    state.ast = seeded_ast;
    step_all(state);
};


/***/ })
/******/ ]);