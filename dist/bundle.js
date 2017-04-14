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
exports.test = 0;
exports.apu_zero = {};
document.body.innerHTML += "APU loaded<br>";


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
exports.ast_zero = [];
document.body.innerHTML += "ASM loaded<br>";


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
var status_mask_sign = 128;
var status_mask_overflow = 64;
var status_mask_breakpoint = 16;
var status_mask_interrupt = 4;
var status_mask_zero = 2;
var status_mask_carry = 1;
exports.cpu_zero = {
    A: 0,
    X: 0,
    Y: 0,
    SP: 0,
    PC: 0,
    SR: 0
};
function cpu_increase_pc(cpu) {
    return __assign({ PC: cpu.PC + 1 }, cpu);
}
document.body.innerHTML += "CPU loaded<br>";


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
exports.ppu_zero = {};
document.body.innerHTML += "PPU loaded<br>";


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
    ppu_dirty: false
};
var state_zero = {
    ast: ASM.ast_zero,
    cpu: CPU.cpu_zero,
    ppu: PPU.ppu_zero,
    apu: APU.apu_zero,
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
    console.log("OK!");
};
document.body.innerHTML += "Program loaded<br>";


/***/ })
/******/ ]);