const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const inputFilePath = path.join(__dirname, 'dist', 'index.js');
const outputFilePath = path.join(__dirname, 'dist', 'index.js');

const code = fs.readFileSync(inputFilePath, 'utf8');

const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 1,
    numbersToExpressions: true,
    simplify: true,
    stringArrayShuffle: true,
    splitStrings: true,
    stringArrayThreshold: 1,
});

fs.writeFileSync(outputFilePath, obfuscationResult.getObfuscatedCode(), 'utf8');
