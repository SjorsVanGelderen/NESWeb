/*
    Copyright 2017, Sjors van Gelderen
*/

import Immutable = require("immutable")
import * as CPU from "./cpu"

// The PPU state
export type PPU = {
    CTRL:    number
    MASK:    number
    STATUS:  number
    OAMADDR: number
    OAMDATA: number
    SCROLL:  number
    ADDR:    number
    OAMDMA:  number
    MEM: Immutable.List<number>
    dirty_pixels: Immutable.List<number>
}

// 10 kibibytes of memory
const mem_zero: Immutable.List<number> = CPU.mem_zero_generator(10240, {
    list: Immutable.List<number>(),
    count: 0
})

// Base PPU state
export const ppu_zero: PPU = {
    CTRL:    0,
    MASK:    0,
    STATUS:  0,
    OAMADDR: 0,
    OAMDATA: 0,
    SCROLL:  0,
    ADDR:    0,
    OAMDMA:  0,
    MEM: mem_zero,
    dirty_pixels: Immutable.List<number>()
}

// Store a value in the memory of the PPU
export function ppu_store(ppu: PPU, index: number, value: number): PPU {
    return { ...ppu,
        MEM: ppu.MEM.set(index, value),
        dirty_pixels: ppu.dirty_pixels.push(index)
    }
}

// Retrieve a value from the memory of the PPU
export function ppu_retrieve(ppu: PPU, index: number): number {
    return ppu.MEM.get(index)
}

// Update the canvas buffer to match the PPU state
export function ppu_flush_dirty_pixels(ppu: PPU, context: CanvasRenderingContext2D): void {
    let context_data = context.getImageData(0, 0, 256, 240)
    ppu.dirty_pixels.forEach(function(index: number) {
        context_data.data[index] = 0
    })
    context.putImageData(context_data, 0, 0)
}