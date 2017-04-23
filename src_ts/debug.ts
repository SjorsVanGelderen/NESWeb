/*
    Copyright 2017, Sjors van Gelderen
*/

import * as State from "./state"
import * as ASM from "./asm"
import * as CPU from "./cpu"

export type DebugLevel =
    | "info"
    | "warning"
    | "error"

// General logging functionality
export function log(level: DebugLevel, message: string) {
    switch(level) {
        case "info":
            console.log("INFO:   | " + message)
            break

        case "warning":
            console.log("WARNING | " + message)
            break

        case "error":
            console.log("ERROR:  | " + message)
            break

        default:
            log("error", "Unrecognized debug level specified: " + JSON.stringify(level))
    }
}

// Log the current statement according to the PC
export function log_statement(state: State.State): void {
    const pc: number = state.CPU.PC
    const statement: ASM.Statement = state.AST.get(state.CPU.PC)
    console.log("PC: "
                + pc
                + " | "
                + JSON.stringify(statement))
}

// Log the CPU state
export function cpu_log(cpu: CPU.CPU): void {
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