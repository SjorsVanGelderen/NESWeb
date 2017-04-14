/*
  Copyright 2017, Sjors van Gelderen
*/

// Status register bitmasks
const status_mask_sign: number       = 0b10000000
const status_mask_overflow: number   = 0b01000000
// There is an unused bit here
const status_mask_breakpoint: number = 0b00010000
//const status_mask_decimal: number  = 0b00001000
const status_mask_interrupt: number  = 0b00000100
const status_mask_zero: number       = 0b00000010
const status_mask_carry: number      = 0b00000001

export type CPU = {
    A:  number,
    X:  number,
    Y: number,
    SP: number,
    PC: number,
    SR: number
};

export const cpu_zero: CPU = {
    A:  0,
    X:  0,
    Y:  0,
    SP: 0,
    PC: 0,
    SR: 0
}

function cpu_increase_pc(cpu: CPU): CPU {
    return { PC: cpu.PC + 1, ...cpu }
}

document.body.innerHTML += "CPU loaded<br>"