/*
    Copyright 2017, Sjors van Gelderen
*/

import Immutable = require("immutable")
import * as Debug from "./debug"
import * as State from "./state"
import * as APU from "./apu"
import * as ASM from "./asm"
import * as CPU from "./cpu"
import * as PPU from "./ppu"

// Entry point
document.body.onload = function(): void {
    const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas")

    if(canvas == null) {
        Debug.log("warning", "Canvas could not be found")
        initialize()
    }
    else {
        initialize(canvas)
    }
}

function initialize(canvas?: HTMLCanvasElement): void {
    // Seed memory with some data
    const seeded_mem: Immutable.List<number> = CPU.cpu_zero.MEM.set(0, 0b00010001)

    // Seed the AST with a dummy program
    const seeded_ast: ASM.AST = Immutable.List<ASM.Statement>([
        { kind: "operation", operation: { opcode: "LDA", operands: { kind: "absolute", arguments: 0b00000000 } } },
        { kind: "operation", operation: { opcode: "STA", operands: { kind: "absolute", arguments: 0b00000001 } } },
        { kind: "operation", operation: { opcode: "INC", operands: { kind: "absolute", arguments: 0b00000000 } } },
        { kind: "operation", operation: { opcode: "ADC", operands: { kind: "immediate", arguments: 0b11111111 } } },
        { kind: "operation", operation: { opcode: "ADC", operands: { kind: "immediate", arguments: 0b11110000 } } },
        { kind: "operation", operation: { opcode: "INX", operands: { kind: "implied" } } },
        { kind: "EOF" }
    ])

    // Set the initial state with the specified memory and program
    const state: State.State = { ...State.state_zero,
        AST: seeded_ast,
        CPU: { ...State.state_zero.CPU, MEM: seeded_mem }
    }

    // Log initial CPU state
    Debug.cpu_log(state.CPU)

    if(canvas) {
        const context: CanvasRenderingContext2D = canvas.getContext("2d")
        run(state, context)
    }
    else {
        run(state)
    }
}

// Run the program by traversing the AST recursively
function run(state: State.State, context?: CanvasRenderingContext2D): void {
    const state_prime: State.State = CPU.step(state)

    if(state_prime.flags.valid) {
        if(!state_prime.flags.eof) {
            if(state_prime.flags.ppu_dirty) {
                if(context) {
                    PPU.ppu_flush_dirty_pixels(context)(state.PPU)
                }
            }

            window.requestAnimationFrame(function () { 
                if(context) {
                    run(state_prime, context) 
                }
                else {
                    run(state_prime)
                }
            })
        }
    }
    else {
        Debug.log("error", "State flagged as invalid!")
    }
}