/*
    Copyright 2017, Sjors van Gelderen
*/

namespace NES {

    type Flags = {
        ppu_dirty: boolean
    }

    const flags_zero = {
        ppu_dirty: false
    }

    type State = {
        ast:   AST,
        cpu:   CPU,
        ppu:   PPU,
        apu:   APU,
        flags: Flags
    }

    const state_zero = {
        ast:   ast_zero,
        cpu:   cpu_zero,
        ppu:   ppu_zero,
        apu:   apu_zero,
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
        console.log("well then")
    }

    document.body.innerHTML = "OK!"

}