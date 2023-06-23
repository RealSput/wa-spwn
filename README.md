# wa-spwn
Write C &amp; WAT that can interact with SPWN, or convert WASM directly to SPWN

# Requirements
- Node.js

# Installation
```
npm i -g wa-spwn
```

# Usage
```
wa-spwn (version 1.0) 
A tool for converting WASM, WAT and C to SPWN 

Usage: wa-spwn [options]
Options:
--wasmbin (short: -w): Inputs a WASM binary
--c (short: -c): Inputs a C file
--output (short: -o): Outputs the result to a file
--input (short: -i): File to input (default: a WASM text file)
```

# Examples
Compiling a WAT file:
```
wa-spwn -i my_file.wat -o output.spwn
```

Compiling a WASM file:
```
wa-spwn -wi my_file.wasm -o output.spwn
```

Compiling a C file:
```
wa-spwn -ci my_file.c -o output.spwn
```
