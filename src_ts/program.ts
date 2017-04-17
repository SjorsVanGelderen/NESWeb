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
// TODO: Extensively review and test
function process_statement(state: State): State {
    const statement: ASM.Statement = state.ast[state.cpu.PC]
    log_statement(state)

    if(statement.kind == "operation") {
        const operation: ASM.Operation = statement.operation

        switch(operation.opcode) {
            case "ADC": // Add with carry
                const adc_value: number = CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                const adc_result: number = state.cpu.A + adc_value
                
                if(adc_result > 0b11111111) {
                    return { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr({ ...state.cpu,
                        A: adc_result - 0b11111111
                    }, true, CPU.status_mask_carry)) }
                }
                else {
                    return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu, A: adc_result }) }
                }

            case "AND": // Logical AND
                const and_value: number = CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                const and_result: number = state.cpu.A & and_value
                return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu, A: and_result }) }

            case "ASL": // Arithmetic shift left
                const asl_value: number = CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                const asl_result: number = (asl_value << 1) % 0b11111111
                const asl_carry: boolean = (asl_value & 0b10000000) > 0

                return {...state, cpu: CPU.cpu_increase_pc(
                    CPU.cpu_manipulate_sr(
                        CPU.cpu_store_from_operand(
                            state.cpu,
                            operation.operands,
                            asl_result),
                        asl_carry,
                        CPU.status_mask_carry
                    )
                ) }

            case "BCC": // Branch if carry clear
                return { ...state, cpu: { ...state.cpu, cpu: 
                    CPU.cpu_branch(
                        state.cpu,
                        (state.cpu.SR & CPU.status_mask_carry) == 0,
                        CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                    )
                } }

            case "BCS": // Branch if carry set
                return { ...state, cpu: { ...state.cpu, cpu: 
                    CPU.cpu_branch(
                        state.cpu,
                        (state.cpu.SR & CPU.status_mask_carry) > 0,
                        CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                    )
                } }

            case "BEQ": // Branch if equal
                return { ...state, cpu: { ...state.cpu, cpu: 
                    CPU.cpu_branch(
                        state.cpu,
                        (state.cpu.SR & CPU.status_mask_zero) > 0,
                        CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                    )
                } }

            case "BIT": // Bit test
                const bit_value: number = CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                const bit_result: number = bit_value & state.cpu.A

                return { ...state, cpu: CPU.cpu_increase_pc(
                    CPU.cpu_manipulate_sr(
                        CPU.cpu_manipulate_sr(
                            CPU.cpu_manipulate_sr(
                                state.cpu,
                                bit_result == 0,
                                CPU.status_mask_zero
                            ),
                            (bit_result & 0b00000010) > 0,
                            CPU.status_mask_overflow
                        ),
                        (bit_result & 0b10000001) > 0,
                        CPU.status_mask_sign
                    )
                ) }

            case "BMI": // Branch if minus
                return { ...state, cpu: { ...state.cpu, cpu: 
                    CPU.cpu_branch(
                        state.cpu,
                        (state.cpu.SR & CPU.status_mask_sign) > 0,
                        CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                    )
                } }

            case "BNE": // Branch if not equal
                return { ...state, cpu: { ...state.cpu, cpu: 
                    CPU.cpu_branch(
                        state.cpu,
                        (state.cpu.SR & CPU.status_mask_zero) == 0,
                        CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                    )
                } }

            case "BPL": // Branch if positive
                return { ...state, cpu: { ...state.cpu, cpu: 
                    CPU.cpu_branch(
                        state.cpu,
                        (state.cpu.SR & CPU.status_mask_sign) == 0,
                        CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                    )
                } }

            case "BRK": // Force interrupt
                return state

            case "BVC": // Branch if overflow clear
                return { ...state, cpu: { ...state.cpu, cpu: 
                    CPU.cpu_branch(
                        state.cpu,
                        (state.cpu.SR & CPU.status_mask_overflow) == 0,
                        CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                    )
                } }

            case "BVS": // Branch if overflow set
                return { ...state, cpu: { ...state.cpu, cpu: 
                    CPU.cpu_branch(
                        state.cpu,
                        (state.cpu.SR & CPU.status_mask_overflow) > 0,
                        CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                    )
                } }
            
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

            case "CMP": // Compare accumulator
                // TODO: Implement this
                return state

            case "CPX": // Compare X register
                // TODO: Implement this
                return state

            case "CPY": // Compare Y register
                // TODO: Implement this
                return state

            case "DEC": // Decrement memory
                // TODO: Implement this
                return state
            
            case "DEX": // Decrement X register
                return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu, X: state.cpu.X - 1 }) }

            case "DEY": // Decrement Y register
                return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu, Y: state.cpu.Y - 1 }) }

            case "EOR": // Exclusive OR
                // TODO: Implement this
                return state

            case "INC": // Increment memory
                const inc_value: number = CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                const inc_result: number = inc_value + 1
                const inc_sign: boolean = (inc_result & 0b1000000) > 0
                const inc_zero: boolean = inc_result == 0
                return { ...state, cpu: CPU.cpu_increase_pc(
                    CPU.cpu_manipulate_sr(
                        CPU.cpu_manipulate_sr(
                            CPU.cpu_store_from_operand(
                                state.cpu,
                                operation.operands,
                                inc_result % 0b11111111
                            ),
                            inc_sign,
                            CPU.status_mask_sign
                        ),
                        inc_zero,
                        CPU.status_mask_zero
                    )
                ) }
            
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

            case "LSR": // Logical shift right
                const lsr_value: number = CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                const lsr_result: number = (lsr_value >> 1) % 0b11111111
                const lsr_carry: boolean = (lsr_value & 0b10000000) > 0

                return {...state, cpu: CPU.cpu_increase_pc(
                    CPU.cpu_manipulate_sr(
                        CPU.cpu_store_from_operand(
                            state.cpu,
                            operation.operands,
                            lsr_result),
                        lsr_carry,
                        CPU.status_mask_carry
                    )
                ) }

            case "NOP": // No operation
                // Possibly the NOP shouldn't be in the AST to begin with?
                return { ...state, cpu: CPU.cpu_increase_pc(state.cpu) }

            case "ORA": // Inclusive OR
                const ora_value: number = CPU.cpu_retrieve_from_operand(state.cpu, operation.operands)
                const ora_result: number = ora_value | state.cpu.A
                const ora_sign: boolean = (ora_result & 0b10000000) > 0
                const ora_zero: boolean = ora_result == 0

                return {...state, cpu: CPU.cpu_increase_pc(
                    CPU.cpu_manipulate_sr(
                        CPU.cpu_manipulate_sr(
                            { ...state.cpu, A: ora_result },
                            ora_sign,
                            CPU.status_mask_sign
                        ),
                        ora_zero,
                        CPU.status_mask_zero
                    )
                ) }

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
                return { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_store_from_operand(
                    state.cpu,
                    operation.operands,
                    state.cpu.A
                )) }

            case "STX": // Store X register
                return { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_store_from_operand(
                    state.cpu,
                    operation.operands,
                    state.cpu.X
                )) }

            case "STY": // Store Y register
                return { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_store_from_operand(
                    state.cpu,
                    operation.operands,
                    state.cpu.Y
                )) }
            
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
            case "CLD": // Clear decimal mode
                const cpu_0: CPU.CPU = CPU.cpu_manipulate_sr(state.cpu, false, CPU.status_mask_carry)
                const cpu_1: CPU.CPU = CPU.cpu_increase_pc(cpu_0)
                return { ...state, cpu: cpu_1 }
            
            case "SED": // Set decimal mode
                const cpu_0: CPU.CPU = CPU.cpu_manipulate_sr(state.cpu, true, CPU.status_mask_carry)
                const cpu_1: CPU.CPU = CPU.cpu_increase_pc(cpu_0)
                return { ...state, cpu: cpu_1 }
            */
            
            default:
                // Should never happen, this indicates an unknown opcode
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
    if(state.cpu.PC >= 0 && state.cpu.PC < state.ast.length) {
        // Process the statement
        log_statement(state)
        const state_prime = process_statement(state)
        CPU.cpu_log(state_prime.cpu)
        return state_prime
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
    const seeded_mem: Immutable.List<number> = CPU.cpu_zero.MEM.set(0, 0b00010001)

    const seeded_ast: ASM.AST = [
        { kind: "operation", operation: { opcode: "LDA", operands: { kind: "absolute", arguments: 0b00000000 } } },
        { kind: "operation", operation: { opcode: "STA", operands: { kind: "absolute", arguments: 0b00000001 } } },
        { kind: "operation", operation: { opcode: "INC", operands: { kind: "absolute", arguments: 0b00000000 } } },
        { kind: "operation", operation: { opcode: "ADC", operands: { kind: "immediate", arguments: 0b11111111 } } },
        { kind: "operation", operation: { opcode: "ADC", operands: { kind: "immediate", arguments: 0b11110000 } } },
        { kind: "operation", operation: { opcode: "INX", operands: { kind: "implied" } } },
        { kind: "EOF" }
    ]

    const state: State = state_zero
    state.ast = seeded_ast // Dirty? Should try to avoid mutation
    state.cpu.MEM = seeded_mem

    // Log initial CPU state
    CPU.cpu_log(state.cpu)

    // Process all steps until EOF
    step_all(state)
}