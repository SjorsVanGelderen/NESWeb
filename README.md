# NESWeb
Browser-based simulator for the Nintendo Entertainment System

## Technologies
* Node.JS
* TypeScript
* TS-loader
* Immutable
* Webpack

## Build
Just run
```
npm install
webpack
```
in the root folder of the project.
Then in the *./dist* subdirectory, you will find *index.html* and *bundle.js*.
Open the *index.html* file in your JavaScript-enabled browser to run the program.
This will be simplified in the future; the program will then support the `npm run` command.
If there is a problem, let me know :)

## Future
I might write code to support more peripherals, plugins and cartridges.
Also I have not paid much attention to the Famicom variants as of yet.

## Bonus

**CPU**  
The CPUs emulated here are the *Ricoh 2A03(NTSC) / 2A07(PAL)*.
Since these are really just modified *MOS Technology 6502* CPUs,
it's easy to reuse much of this code to write an emulator for compatible systems.
These would include the *Apple ][*, *Commodore 64*, *Atari 2600* and more.

**Development kit**  
I'm considering building a simple browser-based development kit for NES games,
since much of the code already supports the logic of such a system.