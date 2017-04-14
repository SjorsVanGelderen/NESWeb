/*
    Copyright 2017, Sjors van Gelderen
*/

import * as APU from "./apu"
import * as ASM from "./asm"
import * as CPU from "./cpu"
import * as PPU from "./ppu"

type Flags = {
    ppu_dirty: boolean
}

const flags_zero = {
    ppu_dirty: false
}

type State = {
    ast:   ASM.AST,
    cpu:   CPU.CPU,
    ppu:   PPU.PPU,
    apu:   APU.APU,
    flags: Flags
}

const state_zero: State = {
    ast:   ASM.ast_zero,
    cpu:   CPU.cpu_zero,
    ppu:   PPU.ppu_zero,
    apu:   APU.apu_zero,
    flags: flags_zero
}

function step(state: State): State {
    if(state.cpu.PC >= 0 && state.cpu.PC < state.ast.length) {
        console.log(state.ast[state.cpu.PC])
    }
    else {
        console.log("Error: PC out of bounds!")
    }

    return state
}
    
const state: State = {
    ast: { opcode: "INX", operands: {kind: "implied"} },
    ...state_zero
}
    
document.body.onload = function(): void {
    step(state)
}

document.body.innerHTML += "Program loaded<br>"