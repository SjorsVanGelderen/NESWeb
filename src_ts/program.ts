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
    apu_dirty: boolean,
    ppu_dirty: boolean,
    eof: boolean
}

const flags_zero = {
    apu_dirty: false,
    ppu_dirty: true, //false,
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
    const statement: ASM.Statement = state.ast.get(state.cpu.PC)
    console.log("PC: "
                + pc
                + " | "
                + JSON.stringify(statement))
}

// Process a single statement according to the PC
// TODO: Extensively review and test
function process_statement(state: State): State {
    const statement: ASM.Statement = state.ast.get(state.cpu.PC)
    log_statement(state)

    if(statement.kind == "operation") {
        const operation: ASM.Operation = statement.operation

        switch(operation.opcode) {
            case "ADC": { // Add with carry
                const value: number = CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                const result: number = state.cpu.A + value
                
                if(result > 0b11111111) {
                    return { ...state, cpu:
                        CPU.cpu_increase_pc(
                            CPU.cpu_manipulate_sr(
                                CPU.cpu_manipulate_sr(
                                    CPU.cpu_manipulate_sr(
                                        CPU.cpu_manipulate_sr(
                                            { ...state.cpu, A: result - 0b11111111},
                                            true,
                                            CPU.status_mask_carry
                                        ),
                                        result == 0,
                                        CPU.status_mask_zero
                                    ),
                                    (result & 0b10000000) > 0,
                                    CPU.status_mask_sign
                                ),
                                (result & 0b10000000) > 0, // Might be incorrect
                                CPU.status_mask_overflow
                            )
                        )
                    }
                }
                else {
                    return { ...state, cpu:
                        CPU.cpu_increase_pc(
                            CPU.cpu_manipulate_sr(
                                { ...state.cpu, A: result },
                                result == 0,
                                CPU.status_mask_zero
                            )
                        )
                    }
                }
            }

            case "AND": { // Logical AND
                const value: number = CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                const result: number = state.cpu.A & value
                return { ...state, cpu:
                    CPU.cpu_increase_pc(
                        CPU.cpu_manipulate_sr(
                            CPU.cpu_manipulate_sr(
                                { ...state.cpu, A: result },
                                result == 0,
                                CPU.status_mask_zero
                            ),
                            (result & 0b10000000) > 0,
                            CPU.status_mask_sign
                        )
                    )
                }
            }

            case "ASL": { // Arithmetic shift left
                const value: number = CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                const result: number = (value << 1) % 0b11111111
                const carry: boolean = (value & 0b10000000) > 0

                return {...state, cpu:
                    CPU.cpu_increase_pc(
                        CPU.cpu_manipulate_sr(
                            CPU.cpu_manipulate_sr(
                                CPU.cpu_manipulate_sr(
                                    CPU.cpu_store_from_operand(
                                        state.cpu,
                                        operation.operands,
                                        result),
                                    carry,
                                    CPU.status_mask_carry
                                ),
                                (result & 0b10000000) > 0,
                                CPU.status_mask_sign
                            ),
                            result == 0,
                            CPU.status_mask_zero
                        )
                    )
                }
            }

            case "BCC": // Branch if carry clear
                return { ...state, cpu:
                    CPU.cpu_branch(
                        state.cpu,
                        (state.cpu.SR & CPU.status_mask_carry) == 0,
                        CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                    )
                }

            case "BCS": // Branch if carry set
                return { ...state, cpu:
                    CPU.cpu_branch(
                        state.cpu,
                        (state.cpu.SR & CPU.status_mask_carry) > 0,
                        CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                    )
                }

            case "BEQ": // Branch if equal
                return { ...state, cpu:
                    CPU.cpu_branch(
                        state.cpu,
                        (state.cpu.SR & CPU.status_mask_zero) > 0,
                        CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                    )
                }

            case "BIT": { // Bit test
                const value: number = CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                const result: number = value & state.cpu.A

                return { ...state, cpu:
                    CPU.cpu_increase_pc(
                        CPU.cpu_manipulate_sr(
                            CPU.cpu_manipulate_sr(
                                CPU.cpu_manipulate_sr(
                                    state.cpu,
                                    result == 0,
                                    CPU.status_mask_zero
                                ),
                                (result & 0b01000000) > 0,
                                CPU.status_mask_overflow
                            ),
                            (result & 0b10000000) > 0,
                            CPU.status_mask_sign
                        )
                    )
                }
            }

            case "BMI": // Branch if minus
                return { ...state, cpu:
                    CPU.cpu_branch(
                        state.cpu,
                        (state.cpu.SR & CPU.status_mask_sign) > 0,
                        CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                    )
                }

            case "BNE": // Branch if not equal
                return { ...state, cpu:
                    CPU.cpu_branch(
                        state.cpu,
                        (state.cpu.SR & CPU.status_mask_zero) == 0,
                        CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                    )
                }

            case "BPL": // Branch if positive
                return { ...state, cpu:
                    CPU.cpu_branch(
                        state.cpu,
                        (state.cpu.SR & CPU.status_mask_sign) == 0,
                        CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                    )
                }

            case "BRK": // Force interrupt
                return state

            case "BVC": // Branch if overflow clear
                return { ...state, cpu:
                    CPU.cpu_branch(
                        state.cpu,
                        (state.cpu.SR & CPU.status_mask_overflow) == 0,
                        CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                    )
                }

            case "BVS": // Branch if overflow set
                return { ...state, cpu:
                    CPU.cpu_branch(
                        state.cpu,
                        (state.cpu.SR & CPU.status_mask_overflow) > 0,
                        CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                    )
                }
            
            case "CLC": // Clear carry
                return { ...state,
                    cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, false, CPU.status_mask_carry)) 
                }

            case "CLI": // Clear interrupt disable
                return { ...state, 
                    cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, false, CPU.status_mask_interrupt)) 
                }

            case "CLV": // Clear overflow
                return { ...state,
                    cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, false, CPU.status_mask_overflow)) 
                }

            case "CMP": { // Compare accumulator
                const value: number = CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                
                return { ...state, cpu:
                    CPU.cpu_increase_pc(
                        CPU.cpu_manipulate_sr(
                            CPU.cpu_manipulate_sr(
                                CPU.cpu_manipulate_sr(
                                    state.cpu,
                                    (value & 0b10000000) > 0,
                                    CPU.status_mask_sign
                                ),
                                value == state.cpu.A,
                                CPU.status_mask_zero
                            ),
                            value >= state.cpu.A,
                            CPU.status_mask_carry
                        )
                    )
                }
            }

            case "CPX": { // Compare X register
                const value: number = CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                
                return { ...state, cpu:
                    CPU.cpu_increase_pc(
                        CPU.cpu_manipulate_sr(
                            CPU.cpu_manipulate_sr(
                                CPU.cpu_manipulate_sr(
                                    state.cpu,
                                    (value & 0b10000000) > 0,
                                    CPU.status_mask_sign
                                ),
                                value == state.cpu.X,
                                CPU.status_mask_zero
                            ),
                            value >= state.cpu.X,
                            CPU.status_mask_carry
                        )
                    )
                }
            }

            case "CPY": { // Compare Y register
                const value: number = CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                
                return { ...state, cpu:
                    CPU.cpu_increase_pc(
                        CPU.cpu_manipulate_sr(
                            CPU.cpu_manipulate_sr(
                                CPU.cpu_manipulate_sr(
                                    state.cpu,
                                    (value & 0b10000000) > 0,
                                    CPU.status_mask_sign
                                ),
                                value == state.cpu.Y,
                                CPU.status_mask_zero
                            ),
                            value >= state.cpu.Y,
                            CPU.status_mask_carry
                        )
                    )
                }
            }

            case "DEC": { // Decrement memory
                const value: number = CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                const result: number = value - 1
                const sign: boolean = (result & 0b1000000) > 0
                const zero: boolean = result == 0
                return { ...state, cpu:
                    CPU.cpu_increase_pc(
                        CPU.cpu_manipulate_sr(
                            CPU.cpu_manipulate_sr(
                                CPU.cpu_store_from_operand(
                                    state.cpu,
                                    operation.operands,
                                    result % 0b11111111
                                ),
                                sign,
                                CPU.status_mask_sign
                            ),
                            zero,
                            CPU.status_mask_zero
                        )
                    )
                }
            }
            
            case "DEX": // Decrement X register
                return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu, X: state.cpu.X - 1 }) }

            case "DEY": // Decrement Y register
                return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu, Y: state.cpu.Y - 1 }) }

            case "EOR": // Exclusive OR
                // TODO: Implement this
                return state

            case "INC": { // Increment memory
                const value: number = CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                const result: number = value + 1
                const sign: boolean = (result & 0b1000000) > 0
                const zero: boolean = result == 0
                return { ...state, cpu:
                    CPU.cpu_increase_pc(
                        CPU.cpu_manipulate_sr(
                            CPU.cpu_manipulate_sr(
                                CPU.cpu_store_from_operand(
                                    state.cpu,
                                    operation.operands,
                                    result % 0b11111111
                                ),
                                sign,
                                CPU.status_mask_sign
                            ),
                            zero,
                            CPU.status_mask_zero
                        )
                    )
                }
            }
            
            case "INX": // Increment X register
                return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu, X: state.cpu.X + 1 }) }

            case "INY": // Increment Y register
                return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu, Y: state.cpu.Y + 1 }) }

            case "JMP": // Jump
                // TODO: Implement this
                return state

            case "JSR": // Jump to subroutine
                // TODO: Implement this
                return state

            case "LDA": // Load accumulator
                return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu,
                    A: CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                }) }

            case "LDX": // Load X register
                return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu,
                    X: CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                }) }

            case "LDY": // Load Y register
                return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu,
                    Y: CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                }) }

            case "LSR": { // Logical shift right
                const value: number = CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                const result: number = (value >> 1) % 0b11111111
                const carry: boolean = (value & 0b10000000) > 0

                return {...state, cpu:
                    CPU.cpu_increase_pc(
                        CPU.cpu_manipulate_sr(
                            CPU.cpu_store_from_operand(
                                state.cpu,
                                operation.operands,
                                result),
                            carry,
                            CPU.status_mask_carry
                        )
                    )
                }
            }

            case "NOP": // No operation
                // Possibly the NOP shouldn't be in the AST to begin with?
                return { ...state, cpu: CPU.cpu_increase_pc(state.cpu) }

            case "ORA": { // Inclusive OR
                const value: number = CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                const result: number = value | state.cpu.A
                const sign: boolean = (result & 0b10000000) > 0
                const zero: boolean = result == 0

                return {...state, cpu:
                    CPU.cpu_increase_pc(
                        CPU.cpu_manipulate_sr(
                            CPU.cpu_manipulate_sr(
                                { ...state.cpu, A: result },
                                sign,
                                CPU.status_mask_sign
                            ),
                            zero,
                            CPU.status_mask_zero
                        )
                    )
                }
            }

            case "PHA": // Push accumulator
                // TODO: Implement this
                return state

            case "PHP": // Push processor status
                // TODO: Implement this
                return state

            case "PLA": // Pull accumulator
                // TODO: Implement this
                return state

            case "PLP": // Pull processor status
                // TODO: Implement this
                return state

            case "ROL": // Rotate left
                // TODO: Implement this
                return state

            case "ROR": // Rotate right
                // TODO: Implement this
                return state

            case "RTI": // Return from interrupt
                // TODO: Implement this
                return state

            case "RTS": // Return from subroutine
                // TODO: Implement this
                return state

            case "SBC": // Subtract with carry
                // TODO: Implement this
                return state

            case "SEC": // Set carry
                return { ...state,
                    cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, true, CPU.status_mask_carry)) 
                }

            case "SEI": // Set interrupt disable
                return { ...state,
                    cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr(state.cpu, true, CPU.status_mask_interrupt)) 
                }

            case "STA": // Store accumulator
                return { ...state, cpu:
                    CPU.cpu_increase_pc(
                        CPU.cpu_store_from_operand(
                            state.cpu,
                            operation.operands,
                            state.cpu.A
                        )
                    )
                }

            case "STX": // Store X register
                return { ...state, cpu:
                    CPU.cpu_increase_pc(
                        CPU.cpu_store_from_operand(
                            state.cpu,
                            operation.operands,
                            state.cpu.X
                        )
                    )
                }

            case "STY": // Store Y register
                return { ...state, cpu:
                    CPU.cpu_increase_pc(
                        CPU.cpu_store_from_operand(
                            state.cpu,
                            operation.operands,
                            state.cpu.Y
                        )
                    )
                }
            
            case "TAX": // Transfer accumulator to X register
                return { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "A", "X")) }

            case "TAY": // Transfer accumulator to Y register
                return { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "A", "Y")) }

            case "TSX": // Transfer stack pointer to X register
                return { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "SP", "X")) }

            case "TXA": // Transfer X register to accumulator
                return { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "X", "A")) }

            case "TXS": // Transfer X register to stack pointer
                return { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "X", "SP")) }

            case "TYA": // Transfer Y register to accumulator
                return { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_transfer(state.cpu, "Y", "A")) }

            /*
            // Unsupported operations on 2A03?
            // Decimal mode doesn't seem to be implemented on this modified 6502
            case "CLD": { // Clear decimal mode
                const cpu_0: CPU.CPU = CPU.cpu_manipulate_sr(state.cpu, false, CPU.status_mask_carry)
                const cpu_1: CPU.CPU = CPU.cpu_increase_pc(cpu_0)
                return { ...state, cpu: cpu_1 }
            }
            
            case "SED": { // Set decimal mode
                const cpu_0: CPU.CPU = CPU.cpu_manipulate_sr(state.cpu, true, CPU.status_mask_carry)
                const cpu_1: CPU.CPU = CPU.cpu_increase_pc(cpu_0)
                return { ...state, cpu: cpu_1 }
            }
            */
            
            default:
                // Should never happen, this indicates an unknown opcode
                return state
        }
    }
    else if(statement.kind == "EOF") {
        return { ...state, flags: { ...state.flags, eof: true } }
    }
    
    // Should be unreachable?
    return state
}

// Process a single statement
function step(state: State): State {
    if(state.cpu.PC >= 0 && state.cpu.PC < state.ast.count()) {
        // Process the statement
        log_statement(state)
        const state_prime = process_statement(state)
        CPU.cpu_log(state_prime.cpu)
        return state_prime
    }

    return state
}

// Recursively execute all statements
function step_all(state: State, context: CanvasRenderingContext2D): void {
    //const state_prime: State = step(state)
    const state_prime: State = state
    //if(!state_prime.flags.eof) {
        if(state_prime.flags.ppu_dirty) {
            //TODO: Perhaps prevent mutation of the canvas? Investigation required
            let image_data = context.getImageData(0, 0, 256, 240)
            image_data.data.forEach(
                function (value: number, index: number, array: Uint8ClampedArray) {
                    image_data.data[index] = Math.floor(Math.random() * 256)
                }
            )
            context.putImageData(image_data, 0, 0)
        }

        window.requestAnimationFrame(function () { step_all(state_prime, context) })
    //}
}

document.body.onload = function(): void {
    const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas")
    const context: CanvasRenderingContext2D = canvas.getContext("2d")

    const seeded_mem: Immutable.List<number> = CPU.cpu_zero.MEM.set(0, 0b00010001)

    const seeded_ast: ASM.AST = Immutable.List<ASM.Statement>([
        { kind: "operation", operation: { opcode: "LDA", operands: { kind: "absolute", arguments: 0b00000000 } } },
        { kind: "operation", operation: { opcode: "STA", operands: { kind: "absolute", arguments: 0b00000001 } } },
        { kind: "operation", operation: { opcode: "INC", operands: { kind: "absolute", arguments: 0b00000000 } } },
        { kind: "operation", operation: { opcode: "ADC", operands: { kind: "immediate", arguments: 0b11111111 } } },
        { kind: "operation", operation: { opcode: "ADC", operands: { kind: "immediate", arguments: 0b11110000 } } },
        { kind: "operation", operation: { opcode: "INX", operands: { kind: "implied" } } },
        { kind: "EOF" }
    ])

    const state: State = state_zero
    state.ast = seeded_ast // Dirty? Should try to avoid mutation
    state.cpu.MEM = seeded_mem

    // Log initial CPU state
    CPU.cpu_log(state.cpu)

    // Process all steps until EOF
    step_all(state, context)
}