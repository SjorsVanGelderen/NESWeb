/*
  Copyright 2017, Sjors van Gelderen
*/

import Immutable = require("immutable")
import * as ASM from "./asm"

// Status register bitmasks
export const status_mask_sign: number       = 0b10000000
export const status_mask_overflow: number   = 0b01000000
// There is an unused bit here
export const status_mask_breakpoint: number = 0b00010000
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
function mem_zero_generator(accumulator: {
        list: Immutable.List<number>,
        count: number
    }): Immutable.List<number> {
    if(accumulator.count < 65535) {
        return mem_zero_generator({
            list: accumulator.list.push(0),
            count: accumulator.count + 1
        })
    }
    else {
        return accumulator.list
    }
}

const mem_zero: Immutable.List<number> = mem_zero_generator({
    list: Immutable.List<number>(),
    count: 0
})

export const cpu_zero: CPU = {
    A:   0,
    X:   0,
    Y:   0,
    SP:  0xFF,
    PC:  0,
    SR:  0,
    MEM: mem_zero
}

// Log the CPU state
export function cpu_log(cpu: CPU): void {
    // Replacer to remove memory from the string representation
    function replacer(key: any, value: any): any {
        if(key == "MEM") {
            return undefined
        }
        else {
            return value
        }
    }
    //console.log(JSON.stringify(cpu, replacer)) // Without memory
    console.log(JSON.stringify(cpu)) // With memory
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
export function cpu_branch(cpu: CPU, predicate: boolean, offset: number) {
    if(predicate) {
        return { ...cpu, PC: cpu.PC + offset }
    }
    else {
        return cpu_increase_pc(cpu)
    }
}

// Manipulate a flag in the SR
export function cpu_manipulate_sr(cpu: CPU, enable: boolean, mask: number): CPU {
    if(enable) {
        return { ...cpu, SR: cpu.SR | mask }
    }
    else {
        return { ...cpu, SR: cpu.SR & (~ mask) }
    }
}

// Transfer a value between registers
export function cpu_transfer(cpu: CPU, left: "A" | "X" | "Y" | "SP", right: "A" | "X" | "Y" | "SP") : CPU {
    const register_value: number = left == "A" ? cpu.A : (left == "X" ? cpu.X : cpu.Y)

    if(right == "A") {
        return { ...cpu, A: register_value }
    }
    else if(right == "X") {
        return { ...cpu, X: register_value }
    }
    else if(right == "Y") {
        return { ...cpu, Y: register_value }
    }
    else {
        return { ...cpu, SP: register_value }
    }
}

// Push a value onto the stack
export function cpu_push_stack(cpu: CPU, value: number): CPU {
    if(cpu.SP > 0) {
        return { ...cpu,
            SP: sp_prime
            MEM: cpu.MEM.set(sp_prime, )
        }
    }
    const sp_prime: number = cpu.SP > 0 ? cpu.SP - 1 : cpu.SP
    
}

// Pop a value from the stack
export function cpu_pop_stack(cpu: CPU, value: number): CPU {
    const sp_prime: number = cpu.SP < 0xFF ? cpu.SP + 1 : cpu.SP
    return { ...cpu, SP: sp_prime }
}

// Peek a value on the stack
export function cpu_peek_stack(cpu: CPU): number {
    // TODO: Implement this
    return 0
}

// Retrieves a value from an address as determined by an addressing mode
// TODO: Extensively review and test
export function cpu_retrieve_from_operand(cpu: CPU,
                               operand:
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
                               | ASM.Label): number {
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
            return cpu.PC + operand.arguments
        
        default:
            // Should never happen
            return 0
    }
}

// Stores a value to an address as determined by an addressing mode
export function cpu_store_from_operand(cpu: CPU,
                            operand:
                            | ASM.Accumulator
                            | ASM.ZeroPage
                            | ASM.ZeroPageIndexed
                            | ASM.Absolute
                            | ASM.AbsoluteIndexed
                            | ASM.Indirect
                            | ASM.IndexedIndirect
                            | ASM.IndirectIndexed
                            | ASM.Relative,
                            value: number): CPU {
    switch (operand.kind) {
        case "accumulator":
            return { ...cpu, A: value }

        case "absolute":
        case "indirect":
        case "zeropage":
            return { ...cpu, MEM: cpu.MEM.set(operand.arguments, value) }

        default:
            // TODO: Implement missing cases
            return cpu
    }
}