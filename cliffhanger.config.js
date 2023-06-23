const { wat_to_spwn, c_to_wat } = require("./src/generate_spwn");
const globalPaths = require('module').globalPaths;
const path = require('path');
const fs = require("fs");

function resolve(filename) {
  for (const globalPath of globalPaths) {
    const filePath = path.join(globalPath, filename);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
}

let isWASM = false;
let isC = false;
let out = "";

async function wasm2wat(file) {
  return new Promise((resolve) => {
    require("wabt")().then((wabt) => {
      var wasm = new Uint8Array(fs.readFileSync(file));

      var myModule = wabt.readWasm(wasm, { readDebugNames: true });
      myModule.applyNames();

      var wast = myModule.toText({ foldExprs: false, inlineExport: false });

      resolve(wast);
    });
  });
}

function trim(input) {
  const trimPattern = /(^\s*)(.*?)(\s*$)/;
  const [, leftPadding, content, rightPadding] = input.match(trimPattern);
  return { leftPadding, content, rightPadding };u
}

function process(inp) {
  let first_res = inp
    .split("\n")
    .map((x) => {
      if (!/^[^a-zA-Z0-9\s]+$/.test(x)) {
        let full_res = trim(x);
        let trimmed = full_res.content;
        if (!trimmed.startsWith("(") && !trimmed.startsWith(")")) {
          return (
            full_res.leftPadding + "(" + trimmed + ")" + full_res.rightPadding
          );
        } else {
          return full_res.leftPadding + trimmed + full_res.rightPadding;
        }
      } else {
        return x;
      }
    })
    .join("\n");

  let second_res = first_res.split("\n").map(x => {
    let trimmed = trim(x);
    x = trimmed.content.split(' ');
    if (x[0] == "(data") {
      x = x.filter((e) => !/\$.+/.test(e));
    }
    return trimmed.leftPadding + x.join(' ') + trimmed.rightPadding;
  }).join('\n').replaceAll("()", "");

  console.log(second_res);

  return second_res;
}

module.exports = {
  name: "wa-spwn",
  version: "1.0",
  description: "A tool for converting WASM, WAT and C to SPWN",
  flags: {
    wasmbin: {
      short: "-w",
      description: "Inputs a WASM binary",
      init: () => {
        isWASM = true;
      },
    },
    c: {
      short: "-c",
      description: "Inputs a C file",
      init: () => {
        isC = true;
      },
    },
    output: {
      short: "-o",
      required: true,
      amount_of_args: 1,
      description: "Outputs the result to a file",
      init: (b) => {
        out = b;
      },
    },
    input: {
      short: "-i",
      description: "File to input (default: a WASM text file)",
      required: true,
      amount_of_args: 1,
      init: async (filename) => {
        if (isWASM) {
          // WASM binary processing code here
          let wat = await wasm2wat(filename);
          wat = process(
            wat.replace(/\(\;(\d+)\;\)/g, (_, match) => `$${match}`)
          );
          let spwn = wat_to_spwn(wat);
          fs.writeFileSync(out, spwn);
        } else if (isC) {
          // C processing code here
          let wat = await c_to_wat(fs.readFileSync(filename).toString());
          let spwn = wat_to_spwn(wat);
          fs.writeFileSync(out, spwn);
        } else {
          let spwn = wat_to_spwn(fs.readFileSync(filename).toString());
          fs.writeFileSync(out, spwn);
        }
      },
    },
  },
};
