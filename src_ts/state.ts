/*
    Copyright 2017, Sjors van Gelderen
*/

import Immutable = require("immutable")
import * as APU from "./apu"
import * as ASM from "./asm"
import * as CPU from "./cpu"
import * as PPU from "./ppu"

// Hints for signaling requested program behaviour
type Flags = {
    apu_dirty: boolean
    ppu_dirty: boolean
    eof:       boolean
    valid:     boolean
}

// Base flags state
const flags_zero = {
    apu_dirty: false,
    ppu_dirty: true, //false,
    eof: false,
    valid: true
}

// Global program state
export type State = {
    AST:   ASM.AST,
    CPU:   CPU.CPU,
    PPU:   PPU.PPU,
    APU:   APU.APU,
    flags: Flags
}

// Base program state
export const state_zero: State = {
    AST:   ASM.ast_zero,
    CPU:   CPU.cpu_zero,
    PPU:   PPU.ppu_zero,
    APU:   APU.apu_zero,
    flags: flags_zero
}