/*
  Copyright 2017, Sjors van Gelderen
*/

// Addressing modes
type Implied = { kind: "implied" }
type Accumulator = { kind: "accumulator" }
type Immediate = { kind: "immediate", arguments: number }
type ZeroPage = { kind: "zeropage", arguments: number }
type ZeroPageIndexed = { kind: "zeropage_indexed", arguments: [number, "X" | "Y"] }
type Absolute = { kind: "absolute", arguments: number }
type AbsoluteIndexed = { kind: "absolute_indexed", arguments: [number, "X" | "Y"] }
type Indirect = { kind: "indirect", arguments: number }
type IndexedIndirect = { kind: "indexed_indirect", arguments: number } // X register
type IndirectIndexed = { kind: "indirect_indexed", arguments: number } // Y register
type Relative = { kind: "relative", arguments: number }
type Label = { kind: "label", arguments: string }

// CPU operations
type Operation =
    | { opcode: | "BRK"
        | "CLC"
        | "CLI"
        | "CLV"
        | "DEX"
        | "DEY"
        | "INX"
        | "INY"
        | "NOP"
        | "PHA"
        | "PLA"
        | "PLP"
        | "RTI"
        | "RTS"
        | "SEC"
        | "SED"
        | "SEI"
        | "TAX"
        | "TAY"
        | "TSX"
        | "TXA"
        | "TXS"
        | "TYA",
        operands: Implied }
    | { opcode: | "BCC"
        | "BCS"
        | "BEQ"
        | "BMI"
        | "BNE"
        | "BPL"
        | "BVC"
        | "BVS",
        operands: Label }
    | { opcode: | "JSR",
        operands: Absolute }
    | { opcode: | "JMP",
        operands: Absolute | Indirect }
    | { opcode: | "BIT",
        operands: ZeroPage | Absolute }
    | { opcode: | "CPX"
        | "CPY",
        operands: Immediate | ZeroPage | Absolute }
    | { opcode: | "DEC"
        | "STX"
        | "STY",
        operands: ZeroPage | ZeroPageIndexed | Absolute }
    | { opcode: | "LDX"
        | "LDY",
        operands: Immediate | ZeroPage | Absolute | AbsoluteIndexed }
    | { opcode: | "INC",
        operands: ZeroPage | ZeroPageIndexed | Absolute | AbsoluteIndexed }
    | { opcode: | "ASL"
        | "LSR"
        | "ROL"
        | "ROR",
        operands: Accumulator | ZeroPage | ZeroPageIndexed | Absolute | AbsoluteIndexed }
    | { opcode: | "STA",
        operands: ZeroPage | ZeroPageIndexed | Absolute | AbsoluteIndexed | IndirectIndexed }
    | { opcode: | "ADC"
        | "AND"
        | "CMP"
        | "EOR"
        | "LDA"
        | "ORA"
        | "SBC",
        operands: Immediate | ZeroPage | ZeroPageIndexed | Absolute | AbsoluteIndexed | IndirectIndexed | IndexedIndirect }

type Statement = Operation // | Label

// Abstract syntax tree
// TODO: Make this into an Immutable.List
export type AST = Statement[]

export const ast_zero: AST = []

document.body.innerHTML += "ASM loaded<br>"