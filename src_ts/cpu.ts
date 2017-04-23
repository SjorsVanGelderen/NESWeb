/*
  Copyright 2017, Sjors van Gelderen
*/

import Immutable = require("immutable")
import * as Debug from "./debug"
import * as State from "./state"
import * as ASM from "./asm"

// Status register bitmasks
export const status_mask_sign: number       = 0b10000000
export const status_mask_overflow: number   = 0b01000000
// There is an unused bit here
export const status_mask_breakpoint: number = 0b00010000
// The decimal mode is not supported on the 2A03
//export const status_mask_decimal: number  = 0b00001000
export const status_mask_interrupt: number  = 0b00000100
export const status_mask_zero: number       = 0b00000010
export const status_mask_carry: number      = 0b00000001

// The CPU state
export type CPU = {
    A:   number,
    X:   number,
    Y:   number,
    SP:  number,
    PC:  number,
    SR:  number,
    MEM: Immutable.List<number>
};

/*
    Currently the memory is represented inefficiently
    A single JS number may contain 8 bytes,
    but for now I'd like to avoid inaccuracy issues
    relating to floating point representations
*/
export function mem_zero_generator(amount: number, accumulator: {
        list: Immutable.List<number>,
        count: number
    }): Immutable.List<number> {
    if(accumulator.count < amount) {
        return mem_zero_generator(amount, {
            list: accumulator.list.push(0),
            count: accumulator.count + 1
        })
    }
    else {
        return accumulator.list
    }
}

// Base MEM state
const mem_zero: Immutable.List<number> = mem_zero_generator(65535, {
    list: Immutable.List<number>(),
    count: 0
})

// Base CPU state
export const cpu_zero: CPU = {
    A:   0,
    X:   0,
    Y:   0,
    SP:  0,
    PC:  0,
    SR:  0,
    MEM: mem_zero
}

// Reset the CPU state
export function cpu_reset(cpu: CPU): CPU {
    return cpu_zero
}

// Increase the PC by 1
export function cpu_increase_pc(cpu: CPU): CPU {
    return { ...cpu, PC: cpu.PC + 1 }
}

// Branch depending on the predicate
export const cpu_branch = (predicate: boolean, offset: number) => (cpu: CPU) => {
    return { ...cpu, PC: predicate ? (cpu.PC + offset) : (cpu.PC + 1) }
}

// Manipulate a flag in the SR
export const cpu_manipulate_sr = (enable: boolean, mask: number) => (cpu: CPU) => {
    return { ...cpu, SR: enable ? (cpu.SR | mask) : (cpu.SR & (~ mask)) }
}

// Transfer a value between registers
export const cpu_transfer =
    (left: "A" | "X" | "Y" | "SP", right: "A" | "X" | "Y" | "SP") => (cpu: CPU) => {
    const register_value: number =
        left == "A" ? cpu.A : (
        left == "X" ? cpu.X : (
        left == "Y" ? cpu.Y : 
                      cpu.SP
        ))

    const result: CPU =
        right == "A" ? { ...cpu, A:  register_value } : (
        right == "X" ? { ...cpu, X:  register_value } : (
        right == "Y" ? { ...cpu, Y:  register_value } : 
                       { ...cpu, SP: register_value }
        ))
    
    return result
}

// Push a value onto the stack
export const cpu_push_stack = (value: number) => (cpu: CPU) => {
    const sp_prime: number = (cpu.SP - 1) % 0xFF
    return { ...cpu,
        SP: cpu.SP + 1,
        MEM: cpu.MEM.set(cpu.SP, value)
    }
}

// Pop a value from the stack
export function cpu_pop_stack(cpu: CPU): CPU {
    const sp_prime: number = (cpu.SP + 1) % 0xFF
    return { ...cpu,
        SP: sp_prime,
        MEM: cpu.MEM.set(cpu.SP, 0)
    }
}

// Peek a value on the stack
export function cpu_peek_stack(cpu: CPU): number {
    return cpu.MEM.get(cpu.SP)
}

// Retrieves a value from an address as determined by an addressing mode
// TODO: Extensively review and test
export const cpu_retrieve_from_operand =
    (operand:
    | ASM.Accumulator
    | ASM.Immediate
    | ASM.ZeroPage
    | ASM.ZeroPageIndexed
    | ASM.Absolute
    | ASM.AbsoluteIndexed
    | ASM.Indirect
    | ASM.IndexedIndirect
    | ASM.IndirectIndexed
    | ASM.Relative
    | ASM.Label) => (cpu: CPU) => {
    switch(operand.kind) {
        case "accumulator":
            return cpu.A

        case "immediate":
            return operand.arguments
        
        case "absolute":
        case "indirect":
        case "zeropage":
            return cpu.MEM.get(operand.arguments)

        case "absolute_indexed":
        case "zeropage_indexed":
            return cpu.MEM.get(operand.arguments[0] + (operand.arguments[1] == "X" ? cpu.X : cpu.Y))

        case "indexed_indirect":
            return cpu.MEM.get((operand.arguments + cpu.X) % 0b11111111)

        case "indirect_indexed":
            return cpu.MEM.get(operand.arguments) + cpu.Y
        
        case "relative":
            return cpu.MEM.get(cpu.PC + operand.arguments)
    }
}

// Stores a value to an address as determined by an addressing mode
// TODO: Extensively review and test
export const cpu_store_from_operand =
    (operand:
    | ASM.Accumulator
    | ASM.ZeroPage
    | ASM.ZeroPageIndexed
    | ASM.Absolute
    | ASM.AbsoluteIndexed
    | ASM.Indirect
    | ASM.IndexedIndirect
    | ASM.IndirectIndexed
    | ASM.Relative,
    value: number) => (cpu: CPU) => {
    switch (operand.kind) {
        case "accumulator":
            return { ...cpu, A: value }

        case "absolute":
        case "indirect":
        case "zeropage":
            return { ...cpu, MEM: cpu.MEM.set(operand.arguments, value) }

        default:
            // TODO: Implement missing cases
            Debug.log("error", "Missing implementation for storing with operand: "
                               + JSON.stringify(operand))
            return cpu
    }
}

// Process a single statement according to the PC
// TODO: Extensively review and test
export function process_statement(state: State.State): State.State {
    const statement: ASM.Statement = state.AST.get(state.CPU.PC)
    Debug.log_statement(state)

    if(statement.kind == "operation") {
        const operation: ASM.Operation = statement.operation

        switch(operation.opcode) {
            case "ADC": { // Add with carry
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)
                const result: number = state.CPU.A + value

                // TODO: Fix incorrect flag manipulations
                Debug.log("warning", "ADC flag manipulation is still incorrect")

                if(result > 0b11111111) {
                    const cpu_prime: CPU =
                        cpu_increase_pc(
                        cpu_manipulate_sr((result & 0b10000000) > 0, status_mask_overflow)(
                        cpu_manipulate_sr((result & 0b10000000) > 0, status_mask_sign)(
                        cpu_manipulate_sr(result == 0,               status_mask_zero)(
                        cpu_manipulate_sr(true,                      status_mask_carry)(
                            { ...state.CPU, A: result - 0b11111111 }
                        )))))
                    
                    return { ...state, CPU: cpu_prime }
                }
                else {
                    const cpu_prime: CPU =
                        cpu_increase_pc(
                        cpu_manipulate_sr(result == 0, status_mask_zero)(
                            { ...state.CPU, A: result }
                        ))
                    
                    return { ...state, CPU: cpu_prime }
                }
            }

            case "AND": { // Logical AND
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)
                const result: number = state.CPU.A & value

                const cpu_prime: CPU =
                    cpu_increase_pc(
                    cpu_manipulate_sr((result & 0b10000000) > 0, status_mask_sign)(
                    cpu_manipulate_sr(result == 0,               status_mask_zero)(
                        { ...state.CPU, A: result }
                    )))

                return { ...state, CPU: cpu_prime }
            }

            case "ASL": { // Arithmetic shift left
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)
                const result: number = (value << 1) % 0b11111111

                const cpu_prime: CPU =
                    cpu_increase_pc(
                    cpu_manipulate_sr(result == 0,               status_mask_zero)(
                    cpu_manipulate_sr((result & 0b10000000) > 0, status_mask_sign)(
                    cpu_manipulate_sr((value & 0b10000000) > 0,  status_mask_carry)(
                    cpu_store_from_operand(operation.operands, result)(
                        state.CPU
                    )))))

                return {...state, CPU: cpu_prime }
            }

            case "BCC": { // Branch if carry clear
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)

                const cpu_prime: CPU =
                    cpu_branch((state.CPU.SR & status_mask_carry) == 0, value)(state.CPU)

                return { ...state, CPU: cpu_prime }
            }

            case "BCS": { // Branch if carry set
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)

                const cpu_prime: CPU =
                    cpu_branch((state.CPU.SR & status_mask_carry) > 0, value)(state.CPU)

                return { ...state, CPU: cpu_prime }
            }

            case "BEQ": { // Branch if equal
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)

                const cpu_prime: CPU =
                    cpu_branch((state.CPU.SR & status_mask_zero) > 0, value)(state.CPU)

                return { ...state, CPU: cpu_prime }
            }
            
            case "BIT": { // Bit test
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)
                const result: number = value & state.CPU.A

                const cpu_prime: CPU =
                    cpu_increase_pc(
                    cpu_manipulate_sr((result & 0b10000000) > 0, status_mask_sign)(
                    cpu_manipulate_sr((result & 0b01000000) > 0, status_mask_overflow)(
                    cpu_manipulate_sr(result == 0,               status_mask_zero)(
                        state.CPU
                    ))))

                return { ...state, CPU: cpu_prime }
            }

            case "BMI": { // Branch if minus
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)

                const cpu_prime: CPU =
                    cpu_branch((state.CPU.SR & status_mask_sign) > 0, value)(state.CPU)

                return { ...state, CPU: cpu_prime }
            }

            case "BNE": { // Branch if not equal
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)

                const cpu_prime: CPU =
                    cpu_branch((state.CPU.SR & status_mask_zero) == 0, value)(state.CPU)

                return { ...state, CPU: cpu_prime }
            }

            case "BPL": { // Branch if positive
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)

                const cpu_prime: CPU =
                    cpu_branch((state.CPU.SR & status_mask_sign) == 0, value)(state.CPU)

                return { ...state, CPU: cpu_prime }
            }

            case "BRK": { // Force interrupt
                Debug.log("warning", "BRK operation is not completely implemented!")
                
                /*
                    It's questionable whether the SR and PC should be pushed
                    onto the stack as a singular unit, since they are both really
                    composed of two bytes rather than a single 16-bit value
                */

                const cpu_prime: CPU =
                    cpu_increase_pc(
                    cpu_manipulate_sr(true, status_mask_breakpoint)(
                    cpu_push_stack(state.CPU.SR)(
                    cpu_push_stack(state.CPU.PC)(
                        state.CPU
                    ))))

                return { ...state, CPU: cpu_prime }
            }

            case "BVC": { // Branch if overflow clear
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)

                const cpu_prime: CPU =
                    cpu_branch((state.CPU.SR & status_mask_overflow) == 0, value)(state.CPU)

                return { ...state, CPU: cpu_prime }
            }

            case "BVS": { // Branch if overflow set
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)

                const cpu_prime: CPU =
                    cpu_branch((state.CPU.SR & status_mask_overflow) > 0, value)(state.CPU)

                return { ...state, CPU: cpu_prime }
            }
            
            case "CLC": { // Clear carry
                const cpu_prime: CPU =
                    cpu_increase_pc(
                    cpu_manipulate_sr(false, status_mask_carry)(
                        state.CPU
                    ))

                return { ...state, CPU: cpu_prime }
            }

            case "CLI": { // Clear interrupt disable
                const cpu_prime: CPU =
                    cpu_increase_pc(
                    cpu_manipulate_sr(false, status_mask_interrupt)(
                        state.CPU
                    ))

                return { ...state, CPU: cpu_prime }
            }

            case "CLV": { // Clear overflow
                const cpu_prime: CPU =
                    cpu_increase_pc(
                    cpu_manipulate_sr(false, status_mask_overflow)(
                        state.CPU
                    ))

                return { ...state, CPU: cpu_prime }
            }

            case "CMP": { // Compare accumulator
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)
                
                const cpu_prime: CPU =
                    cpu_increase_pc(
                    cpu_manipulate_sr(value >= state.CPU.A,     status_mask_carry)(
                    cpu_manipulate_sr(value == state.CPU.A,     status_mask_zero)(
                    cpu_manipulate_sr((value & 0b10000000) > 0, status_mask_sign)(
                        state.CPU
                    ))))

                return { ...state, CPU: cpu_prime }
            }

            case "CPX": { // Compare X register
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)
                
                const cpu_prime: CPU =
                    cpu_increase_pc(
                    cpu_manipulate_sr(value >= state.CPU.X,     status_mask_carry)(
                    cpu_manipulate_sr(value == state.CPU.X,     status_mask_zero)(
                    cpu_manipulate_sr((value & 0b10000000) > 0, status_mask_sign)(
                        state.CPU
                    ))))

                return { ...state, CPU: cpu_prime }
            }

            case "CPY": { // Compare Y register
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)

                const cpu_prime: CPU =
                    cpu_increase_pc(
                    cpu_manipulate_sr(value >= state.CPU.Y,     status_mask_carry)(
                    cpu_manipulate_sr(value == state.CPU.Y,     status_mask_zero)(
                    cpu_manipulate_sr((value & 0b10000000) > 0, status_mask_sign)(
                        state.CPU
                    ))))
                
                return { ...state, CPU: cpu_prime }
            }

            case "DEC": { // Decrement memory
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)
                const result: number = value - 1

                const cpu_prime: CPU =
                    cpu_increase_pc(
                    cpu_manipulate_sr(result == 0,              status_mask_zero)(
                    cpu_manipulate_sr((result & 0b1000000) > 0, status_mask_sign)(
                    cpu_store_from_operand(operation.operands, result % 0b11111111)(
                        state.CPU
                    ))))

                return { ...state, CPU: cpu_prime }
            }
            
            case "DEX": // Decrement X register
                return { ...state, cpu: cpu_increase_pc({ ...state.CPU, X: state.CPU.X - 1 }) }

            case "DEY": // Decrement Y register
                return { ...state, cpu: cpu_increase_pc({ ...state.CPU, Y: state.CPU.Y - 1 }) }

            case "EOR": { // Exclusive OR
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)
                const result: number = state.CPU.A ^ value

                const cpu_prime: CPU =
                    cpu_increase_pc(
                    cpu_manipulate_sr(result == 0,               status_mask_zero)(
                    cpu_manipulate_sr((result & 0b10000000) > 0, status_mask_sign)(
                            state.CPU
                    )))

                return { ...state, CPU: { ...cpu_prime, A: result } }
            }

            case "INC": { // Increment memory
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)
                const result: number = value + 1

                const cpu_prime: CPU =
                    cpu_increase_pc(
                    cpu_manipulate_sr(result == 0,              status_mask_zero)(
                    cpu_manipulate_sr((result & 0b1000000) > 0, status_mask_sign)(
                    cpu_store_from_operand(operation.operands, result % 0b11111111)(
                        state.CPU
                    ))))

                return { ...state, CPU: cpu_prime }
            }
            
            case "INX": // Increment X register
                return { ...state, CPU: cpu_increase_pc({ ...state.CPU, X: state.CPU.X + 1 }) }

            case "INY": // Increment Y register
                return { ...state, CPU: cpu_increase_pc({ ...state.CPU, Y: state.CPU.Y + 1 }) }

            /*
            case "JMP": // Jump
                // TODO: Implement this
                return state

            case "JSR": // Jump to subroutine
                // TODO: Implement this
                return state
            */

            case "LDA": // Load accumulator
                return { ...state, CPU: cpu_increase_pc({ ...state.CPU,
                    A: cpu_retrieve_from_operand(operation.operands)(state.CPU)
                }) }

            case "LDX": // Load X register
                return { ...state, CPU: cpu_increase_pc({ ...state.CPU,
                    X: cpu_retrieve_from_operand(operation.operands)(state.CPU)
                }) }

            case "LDY": // Load Y register
                return { ...state, CPU: cpu_increase_pc({ ...state.CPU,
                    Y: cpu_retrieve_from_operand(operation.operands)(state.CPU)
                }) }

            case "LSR": { // Logical shift right
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)
                const result: number = (value >> 1) % 0b11111111

                const cpu_prime: CPU =
                    cpu_increase_pc(
                    cpu_manipulate_sr((value & 0b10000000) > 0, status_mask_carry)(
                    cpu_store_from_operand(operation.operands, result)(
                        state.CPU
                    )))

                return {...state, CPU: cpu_prime }
            }

            case "NOP": // No operation
                // Possibly the NOP shouldn't be in the AST to begin with?
                return { ...state, CPU: cpu_increase_pc(state.CPU) }

            case "ORA": { // Inclusive OR
                const value: number = cpu_retrieve_from_operand(operation.operands)(state.CPU)
                const result: number = value | state.CPU.A

                const cpu_prime: CPU =
                    cpu_increase_pc(
                    cpu_manipulate_sr(result == 0,               status_mask_zero)(
                    cpu_manipulate_sr((result & 0b10000000) > 0, status_mask_sign)(
                        state.CPU
                    )))

                return {...state, CPU: cpu_prime }
            }

            /*
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
            */

            case "SEC": // Set carry
                return { ...state, CPU: cpu_increase_pc(
                    cpu_manipulate_sr(true, status_mask_carry)(state.CPU)
                ) }

            case "SEI": // Set interrupt disable
                return { ...state, CPU: cpu_increase_pc(
                    cpu_manipulate_sr(true, status_mask_interrupt)(state.CPU)
                ) }

            case "STA": // Store accumulator
                return { ...state, CPU: cpu_increase_pc(
                    cpu_store_from_operand(operation.operands, state.CPU.A)(
                        state.CPU
                )) }

            case "STX": // Store X register
                return { ...state, CPU: cpu_increase_pc(
                    cpu_store_from_operand(operation.operands, state.CPU.X)(
                        state.CPU
                )) }

            case "STY": // Store Y register
                return { ...state, CPU: cpu_increase_pc(
                    cpu_store_from_operand(operation.operands, state.CPU.Y)(
                        state.CPU
                )) }
            
            case "TAX": // Transfer accumulator to X register
                return { ...state, CPU: cpu_increase_pc(cpu_transfer("A", "X")(state.CPU)) }

            case "TAY": // Transfer accumulator to Y register
                return { ...state, CPU: cpu_increase_pc(cpu_transfer("A", "Y")(state.CPU)) }

            case "TSX": // Transfer stack pointer to X register
                return { ...state, CPU: cpu_increase_pc(cpu_transfer("SP", "X")(state.CPU)) }

            case "TXA": // Transfer X register to accumulator
                return { ...state, CPU: cpu_increase_pc(cpu_transfer("X", "A")(state.CPU)) }

            case "TXS": // Transfer X register to stack pointer
                return { ...state, CPU: cpu_increase_pc(cpu_transfer("X", "SP")(state.CPU)) }

            case "TYA": // Transfer Y register to accumulator
                return { ...state, CPU: cpu_increase_pc(cpu_transfer("Y", "A")(state.CPU)) }

            /*
            // Decimal mode isn't supported on 2A03
            case "CLD": { // Clear decimal mode
                const cpu_0: CPU = cpu_manipulate_sr(state.cpu, false, status_mask_carry)
                const cpu_1: CPU = cpu_increase_pc(cpu_0)
                return { ...state, cpu: cpu_1 }
            }
            
            case "SED": { // Set decimal mode
                const cpu_0: CPU = cpu_manipulate_sr(state.cpu, true, status_mask_carry)
                const cpu_1: CPU = cpu_increase_pc(cpu_0)
                return { ...state, cpu: cpu_1 }
            }
            */
            
            default:
                Debug.log("error", "Unrecognized opcode: " + JSON.stringify(operation.opcode))
                return { ...state,
                    flags: { ...state.flags, valid: false }
                }
        }
    }
    else if(statement.kind == "EOF") {
        return { ...state,
            flags: { ...state.flags, eof: true }
        }
    }
}

// Process a single statement
export function step(state: State.State): State.State {
    if(state.CPU.PC >= 0 && state.CPU.PC < state.AST.count()) {
        // Process the statement
        Debug.log_statement(state)
        const state_prime = process_statement(state)
        Debug.cpu_log(state_prime.CPU)
        return state_prime
    }
    else {
        Debug.log("error", "PC out of bounds of the AST!")
        return { ...state,
            flags: { ...state.flags, valid: false }
        }
    }
}