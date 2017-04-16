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

// Retrieves a value from an address as determined by an addressing mode
// TODO: Extensively review and test
function retrieve_from_operand(cpu: CPU.CPU,
                               operand:
                               | ASM.Immediate
                               | ASM.ZeroPage
                               | ASM.ZeroPageIndexed
                               | ASM.Absolute
                               | ASM.AbsoluteIndexed
                               | ASM.Indirect
                               | ASM.IndexedIndirect
                               | ASM.IndirectIndexed
                               | ASM.Relative): number {
    switch(operand.kind) {
        case "immediate":
            return operand.arguments
        
        case "absolute":
        case "indirect":
        case "zeropage":
            return cpu.MEM[operand.arguments]

        case "absolute_indexed":
        case "zeropage_indexed":
            return cpu.MEM[operand.arguments[0] + (operand.arguments[1] == "X" ? cpu.X : cpu.Y)]

        case "indexed_indirect":
            return cpu.MEM[(operand.arguments + cpu.X) % 0b11111111]

        case "indirect_indexed":
            return cpu.MEM[operand.arguments] + cpu.Y
        
        case "relative":
            return cpu.PC + operand.arguments
        
        default:
            // Should never happen
            return 0
    }
}

// Stores a value to an address as determined by an addressing mode
function store_from_operand(cpu: CPU.CPU,
                            operand:
                            | ASM.ZeroPage
                            | ASM.ZeroPageIndexed
                            | ASM.Absolute
                            | ASM.AbsoluteIndexed
                            | ASM.Indirect
                            | ASM.IndexedIndirect
                            | ASM.IndirectIndexed
                            | ASM.Relative,
                            value: number): CPU.CPU {
    switch (operand.kind) {
        case "absolute":
        case "indirect":
        case "zeropage":
            // TODO: Clean up this dirty mutation
            console.log("TEST")
            const memory_prime: number[] = cpu.MEM.slice() // Copy the memory
            memory_prime[operand.arguments] = value // Mutate the new memory
            return { ...cpu, MEM: memory_prime } // Return a fresh CPU state

        default:
            // Should never happen
            return cpu
    }
}

// Process a single statement according to the PC
// TODO: Extensively review and test
function process_statement(state: State): State {
    const statement: ASM.Statement = state.ast[state.cpu.PC]
    log_statement(state)

    if(statement.kind == "operation") {
        const operation: ASM.Operation = statement.operation

        switch(operation.opcode) {
            case "ADC":
                const adc_value: number = retrieve_from_operand(state.cpu, operation.operands)
                const adc_result: number = state.cpu.A + adc_value
                
                if(adc_result > 0b11111111) {
                    return { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr({ ...state.cpu,
                        A: adc_result - 0b11111111
                    }, true, CPU.status_mask_carry)) }
                }
                else {
                    return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu, A: adc_result }) }
                }

            case "AND":
                const and_value: number = retrieve_from_operand(state.cpu, operation.operands)
                const and_result: number = state.cpu.A & and_value
                return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu, A: and_result }) }

            case "ASL":
                if(operation.operands.kind == "accumulator") {
                    const asl_accumulator_result: number = (state.cpu.A << 1) % 0b11111111
                    const asl_accumulator_carry: boolean = (state.cpu.A & 0b10000000) > 0
                    return  { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_manipulate_sr({ ...state.cpu,
                        A: asl_accumulator_result
                    }, asl_accumulator_carry, CPU.status_mask_carry)) } // Might incorrectly reset the carry flag
                }
                else {
                    //const asl_value: number = retrieve_from_operand(state.cpu, operation.operands)
                    // TODO: Not yet implemented (can't store values yet)
                    return state
                    //return { ...state, cpu: CPU.cpu_increase_pc(CPU.cpu_)}
                }

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
                return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu,
                    A: retrieve_from_operand(state.cpu, operation.operands)
                }) }

            case "LDX":
                return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu,
                    X: retrieve_from_operand(state.cpu, operation.operands)
                }) }

            case "LDY":
                return { ...state, cpu: CPU.cpu_increase_pc({ ...state.cpu,
                    Y: retrieve_from_operand(state.cpu, operation.operands)
                }) }

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
                return { ...state, cpu: CPU.cpu_increase_pc(store_from_operand(state.cpu, operation.operands, state.cpu.A)) }

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
    /*
    const seeded_ast: ASM.AST = [
        { kind: "operation", operation: { opcode: "INX", operands: { kind: "implied" } } },
        { kind: "operation", operation: { opcode: "ADC", operands: { kind: "immediate", arguments: 0b11111111 } } },
        { kind: "operation", operation: { opcode: "ADC", operands: { kind: "immediate", arguments: 0b11110000 } } },
        { kind: "EOF" }
    ]
    */

    const seeded_mem: number[] = CPU.cpu_zero.MEM
    seeded_mem[0] = 0b00010001

    const seeded_ast: ASM.AST = [
        { kind: "operation", operation: { opcode: "LDA", operands: { kind: "absolute", arguments: 0b00000000 } } },
        { kind: "operation", operation: { opcode: "STA", operands: { kind: "absolute", arguments: 0b00000001 } } },
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