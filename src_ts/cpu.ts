/*
  Copyright 2017, Sjors van Gelderen
*/

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
    MEM: number[]
};

/*
    Currently the memory is represented inefficiently
    A single JS number may contain 8 bytes,
    but for now I'd like to avoid inaccuracy issues
    relating to floating point representations
*/
const mem_zero: number[] = []
for(var i = 0; i < 65535; i++) {
    mem_zero[i] = 0
}

export const cpu_zero: CPU = {
    A:   0,
    X:   0,
    Y:   0,
    SP:  0,
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

// Increase the PC by 1
export function cpu_increase_pc(cpu: CPU): CPU {
    return { ...cpu, PC: cpu.PC + 1 }
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