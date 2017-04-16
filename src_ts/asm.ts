/*
  Copyright 2017, Sjors van Gelderen
*/

// Addressing modes
export type Implied = { kind: "implied" }
export type Accumulator = { kind: "accumulator" }
export type Immediate = { kind: "immediate", arguments: number }
export type ZeroPage = { kind: "zeropage", arguments: number }
export type ZeroPageIndexed = { kind: "zeropage_indexed", arguments: [number, "X" | "Y"] }
export type Absolute = { kind: "absolute", arguments: number }
export type AbsoluteIndexed = { kind: "absolute_indexed", arguments: [number, "X" | "Y"] }
export type Indirect = { kind: "indirect", arguments: number }
export type IndexedIndirect = { kind: "indexed_indirect", arguments: number } // X register
export type IndirectIndexed = { kind: "indirect_indexed", arguments: number } // Y register
export type Relative = { kind: "relative", arguments: number }
export type Label = { kind: "label", arguments: string }

export type AddressingMode =
    | Implied
    | Accumulator
    | Immediate
    | ZeroPage
    | ZeroPageIndexed
    | Absolute
    | AbsoluteIndexed
    | Indirect
    | IndexedIndirect
    | IndirectIndexed
    | Relative
    | Label

// CPU operations
export type Operation =
    | { opcode:
        | "BRK"
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
        | "PHP"
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
    | { opcode:
        | "BCC"
        | "BCS"
        | "BEQ"
        | "BMI"
        | "BNE"
        | "BPL"
        | "BVC"
        | "BVS",
        operands: Label }
    | { opcode:
        | "JSR",
        operands: Absolute }
    | { opcode:
        | "JMP",
        operands: Absolute | Indirect }
    | { opcode:
        | "BIT",
        operands: ZeroPage | Absolute }
    | { opcode:
        | "CPX"
        | "CPY",
        operands: Immediate | ZeroPage | Absolute }
    | { opcode:
        | "DEC"
        | "STX"
        | "STY",
        operands: ZeroPage | ZeroPageIndexed | Absolute }
    | { opcode:
        | "LDX"
        | "LDY",
        operands: Immediate | ZeroPage | Absolute | AbsoluteIndexed }
    | { opcode:
        | "INC",
        operands: ZeroPage | ZeroPageIndexed | Absolute | AbsoluteIndexed }
    | { opcode:
        | "ASL"
        | "LSR"
        | "ROL"
        | "ROR",
        operands: Accumulator | ZeroPage | ZeroPageIndexed | Absolute | AbsoluteIndexed }
    | { opcode:
        | "STA",
        operands: ZeroPage | ZeroPageIndexed | Absolute | AbsoluteIndexed | IndirectIndexed }
    | { opcode: 
        | "ADC"
        | "AND"
        | "CMP"
        | "EOR"
        | "LDA"
        | "ORA"
        | "SBC",
        operands: Immediate | ZeroPage | ZeroPageIndexed | Absolute | AbsoluteIndexed | IndirectIndexed | IndexedIndirect }

// The AST is comprised of statements
export type Statement = 
    | { kind: "operation", operation: Operation }
    | { kind: "EOF" }

// Abstract syntax tree
// TODO: Make this into an Immutable.List
export type AST = Statement[]

export const ast_zero: AST = []