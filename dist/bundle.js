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
for (var i = 0; i < 65535; i++) {
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
    else if (right == "Y") {
        return __assign({}, cpu, { Y: register_value });
    }
    else {
        return __assign({}, cpu, { SP: register_value });
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
function retrieve_from_operand(cpu, operand) {
    switch (operand.kind) {
        case "immediate":
            return operand.arguments;
        case "absolute":
        case "indirect":
        case "zeropage":
            return cpu.MEM[operand.arguments];
        case "absolute_indexed":
        case "zeropage_indexed":
            return cpu.MEM[operand.arguments[0] + (operand.arguments[1] == "X" ? cpu.X : cpu.Y)];
        case "indexed_indirect":
            return cpu.MEM[(operand.arguments + cpu.X) % 255];
        case "indirect_indexed":
            return cpu.MEM[operand.arguments] + cpu.Y;
        case "relative":
            return cpu.PC + operand.arguments;
        default:
            return 0;
    }
}
function store_from_operand(cpu, operand, value) {
    switch (operand.kind) {
        case "absolute":
        case "indirect":
        case "zeropage":
            var memory_prime = cpu.MEM.slice();
            memory_prime[cpu.MEM[operand.arguments]] = value;
            return __assign({}, cpu, { MEM: memory_prime });
        default:
            return cpu;
    }
}
function process_statement(state) {
    var statement = state.ast[state.cpu.PC];
    if (statement.kind == "operation") {
        var operation = statement.operation;
        switch (operation.opcode) {
            case "ADC":
                var adc_value = retrieve_from_operand(state.cpu, operation.operands);
                var adc_result = state.cpu.A + adc_value;
                if (adc_result > 255) {
                    return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(__assign({}, state.cpu, { A: adc_result - 255 }), true, CPU.status_mask_carry)) });
                }
                else {
                    return __assign({}, state, { cpu: CPU.cpu_increase_pc(__assign({}, state.cpu, { A: adc_result })) });
                }
            case "AND":
                var and_value = retrieve_from_operand(state.cpu, operation.operands);
                var and_result = state.cpu.A & and_value;
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(__assign({}, state.cpu, { A: and_result })) });
            case "ASL":
                if (operation.operands.kind == "accumulator") {
                    var asl_accumulator_result = (state.cpu.A << 1) % 255;
                    var asl_accumulator_carry = (state.cpu.A & 128) > 0;
                    return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(__assign({}, state.cpu, { A: asl_accumulator_result }), asl_accumulator_carry, CPU.status_mask_carry)) });
                }
                else {
                    return state;
                }
            case "BCC":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "BCS":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "BEQ":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "BIT":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "BMI":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "BNE":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "BPL":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "BRK":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "BVC":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "BVS":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "CLC":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, false, CPU.status_mask_carry)) });
            case "CLI":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, false, CPU.status_mask_interrupt)) });
            case "CLV":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, false, CPU.status_mask_overflow)) });
            case "CMP":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "CPX":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "CPY":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "DEC":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "DEX":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(__assign({}, state.cpu, { X: state.cpu.X - 1 })) });
            case "DEY":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(__assign({}, state.cpu, { Y: state.cpu.Y - 1 })) });
            case "EOR":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "INC":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "INX":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(__assign({}, state.cpu, { X: state.cpu.X + 1 })) });
            case "INY":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(__assign({}, state.cpu, { Y: state.cpu.Y + 1 })) });
            case "JMP":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "JSR":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "LDA":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "LDX":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "LDY":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "LSR":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "NOP":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(state.cpu) });
            case "ORA":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "PHA":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "PHP":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "PLA":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "PLP":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "ROL":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "ROR":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "RTI":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "RTS":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "SBC":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "SEC":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, true, CPU.status_mask_carry)) });
            case "SEI":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, true, CPU.status_mask_interrupt)) });
            case "STA":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "STY":
                console.log("Not yet implemented: " + JSON.stringify(statement));
                return state;
            case "TAX":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "A", "X")) });
            case "TAY":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "A", "Y")) });
            case "TXS":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "X", "SP")) });
            case "TXA":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "X", "A")) });
            case "TSX":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "SP", "X")) });
            case "TYA":
                return __assign({}, state, { cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "Y", "A")) });
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