/*
    Copyright 2017, Sjors van Gelderen
*/

import * as APU from "./apu"
import * as ASM from "./asm"
import * as CPU from "./cpu"
import * as PPU from "./ppu"

// Hints for signaling requested program behaviour
type Flags = {
    ppu_dirty: boolean,
    eof: boolean
}

const flags_zero = {
    ppu_dirty: false,
    eof: false
}

// Global program state
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

// Log the current statement according to the PC
function log_statement(state: State): void {
    const pc: number = state.cpu.PC
    const statement: ASM.Statement = state.ast[state.cpu.PC]
    console.log("PC: "
                + pc
                + " | "
                + JSON.stringify(statement))
}

// Process a single statement according to the PC
function process_statement(state: State): State {
    const statement: ASM.Statement = state.ast[state.cpu.PC]

    if(statement.kind == "operation") {
        const operation: ASM.Operation = statement.operation

        switch(operation.opcode) {
            case "ADC":
                switch(operation.operands.kind) {
                    case "immediate":
                        const result: number = (state.cpu.A + operation.operands.arguments)

                        if(result > 0b11111111) {
                            return { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr({ ...state.cpu,
                                A: result - 0b11111111
                            }, true, CPU.status_mask_carry)) }
                        } else {
                            return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu,
                                A: result
                            }) }
                        }
                    
                    default:
                        console.log("Not yet implemented: " + JSON.stringify(statement))
                        return state
                }

            case "AND":
                switch(operation.operands.kind) {
                    case "immediate":
                        const result: number = state.cpu.A & operation.operands.arguments
                        return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu, A: result }) }
                    
                    default:
                        console.log("Not yet implemented: " + JSON.stringify(statement))
                        return state
                }

            case "ASL":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "BCC":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "BCS":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "BEQ":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "BIT":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "BMI":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "BNE":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "BPL":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "BRK":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "BVC":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "BVS":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state
            
            case "CLC":
                return { ...state,
                    cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, false, CPU.status_mask_carry)) 
                }

            case "CLI":
                return { ...state, 
                    cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, false, CPU.status_mask_interrupt)) 
                }

            case "CLV":
                return { ...state,
                    cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, false, CPU.status_mask_overflow)) 
                }

            case "CMP":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "CPX":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "CPY":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "DEC":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state
            
            case "DEX":
                return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu, X: state.cpu.X - 1 }) }

            case "DEY":
                return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu, Y: state.cpu.Y - 1 }) }

            case "EOR":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "INC":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state
            
            case "INX":
                return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu, X: state.cpu.X + 1 }) }

            case "INY":
                return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu, Y: state.cpu.Y + 1 }) }

            case "JMP":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "JSR":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "LDA":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "LDX":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "LDY":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "LSR":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "NOP":
                // Possibly the NOP shouldn't be in the AST to begin with?
                return { ...state, cpu: CPU.cpu_increase_pc(state.cpu) }

            case "ORA":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "PHA":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "PHP":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "PLA":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "PLP":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "ROL":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "ROR":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "RTI":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "RTS":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "SBC":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "SEC":
                return { ...state,
                    cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, true, CPU.status_mask_carry)) 
                }

            case "SEI":
                return { ...state,
                    cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, true, CPU.status_mask_interrupt)) 
                }

            case "STA":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "STY":
                console.log("Not yet implemented: " + JSON.stringify(statement))
                return state

            case "TAX":
                return { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "A", "X")) }

            case "TAY":
                return { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "A", "Y")) }

            case "TXS":
                return { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "X", "SP")) }

            case "TXA":
                return { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "X", "A")) }

            case "TSX":
                return { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "SP", "X")) }

            case "TYA":
                return { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "Y", "A")) }

            /*
            // Unsupported operations on 2A03?
            // Decimal mode doesn't seem to be implemented on this modified 6502
            case "CLD":
                const cpu_0: CPU.CPU = CPU.cpu_manipulate_sr(state.cpu, false, CPU.status_mask_carry)
                const cpu_1: CPU.CPU = CPU.cpu_increase_pc(cpu_0)
                return { ...state, cpu: cpu_1 }
            
            case "SED":
                const cpu_0: CPU.CPU = CPU.cpu_manipulate_sr(state.cpu, true, CPU.status_mask_carry)
                const cpu_1: CPU.CPU = CPU.cpu_increase_pc(cpu_0)
                return { ...state, cpu: cpu_1 }
            */
            
            default:
                console.log("Unrecognized statement: "
                            + statement.operation.opcode
                            + "!")
        }
    }
    else if(statement.kind == "EOF") {
        return { ...state, flags: { ...state.flags, eof: true } }
    }
    
    return state
}

// Process a single statement
function step(state: State): State {
    if(state.cpu.PC >= 0 && state.cpu.PC < state.ast.length) {
        // Process the statement
        log_statement(state)
        const state_prime = process_statement(state)
        CPU.cpu_log(state_prime.cpu)
        return state_prime
    }
    else {
        // Out of bounds
        console.log("Error: PC("
                    + state.cpu.PC
                    + ") out of "
                    + "bounds(0 - "
                    + state.ast.length
                    + ")!")
    }

    return state
}

// Recursively execute all statements
function step_all(state: State): void {
    const state_prime: State = step(state)
    if(!state_prime.flags.eof) {
        step_all(state_prime)
    }
}

document.body.onload = function(): void {
    const seeded_ast: ASM.AST = [
        { kind: "operation", operation: { opcode: "INX", operands: { kind: "implied" } } },
        { kind: "operation", operation: { opcode: "ADC", operands: { kind: "immediate", arguments: 0b11111111 } } },
        { kind: "operation", operation: { opcode: "ADC", operands: { kind: "immediate", arguments: 0b11110000 } } },
        { kind: "EOF" }
    ]

    const state: State = state_zero
    state.ast = seeded_ast // Dirty?

    // Process all steps until EOF
    step_all(state)
}