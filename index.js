const fs = require('fs');
const bs58 = require('bs58');
const solanaWeb3 = require("@solana/web3.js");

// Set up Solana connection
const Solana = new solanaWeb3.Connection("https://ssc-dao.genesysgo.net/");

// Configuration parameters
const wordsStart = []; // Words to look for at the beginning of the address
const wordsInclude = ["ygt"]; // Words to look for in the complete address
const stopAfter = 100; // Setting this to 0 deactivates the limit
const outputDirectory = "./output"; // Output directory WITHOUT "/" at the end
const outputFile = "keys.txt"; // Output file for all base58 private keys

// Ensure output directory exists
if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
}

// Write key to file with private key conversion
const writeSolKey = async (keyPair) => {
    const privateKeyBuffer = Buffer.from(keyPair.secretKey);
    const privateKeyBase58 = bs58.encode(privateKeyBuffer);

    // Append base58 private key to the output file
    fs.appendFileSync(outputDirectory + "/" + outputFile, privateKeyBase58 + '\n');
}

const solKeyGen = async () => {
    console.log('Solana Keypair Generator started with the following filters:');
    
    let count = 0;
    
    if (wordsStart.length > 0) { console.log('--> Starting or ending with', wordsStart); }
    if (wordsInclude.length > 0) { console.log('--> Including', wordsInclude); }
    
    console.log('Please be patient while the computer does its thing. This can take a while!');
    console.log('Usually a 3-digit word at the beginning will be found within a minute, 4-digit can take longer!');

    // Remove existing output file to start fresh
    if (fs.existsSync(outputDirectory + "/" + outputFile)) {
        fs.unlinkSync(outputDirectory + "/" + outputFile);
    }

    while ((count < stopAfter) || stopAfter === 0) {
        // Generate new keypair
        const keyPair = solanaWeb3.Keypair.generate();
        const checkKey = keyPair.publicKey.toString().toLowerCase();
        
        // Test for match - if match found, output the keypair to a file
        let isMatch = false;
        
        for (let i = 0; i < wordsStart.length && !isMatch; i++) {
            if (checkKey.startsWith(wordsStart[i]) || checkKey.endsWith(wordsStart[i])) {
                isMatch = true;
            }
        }

        for (let i = 0; i < wordsInclude.length && !isMatch; i++) {
            if (checkKey.includes(wordsInclude[i])) {
                isMatch = true;
            }
        }

        if (isMatch) {
            count++;
            console.log(`[${count}] New Match - Public Key: ${keyPair.publicKey.toString()}`);
            writeSolKey(keyPair);
        }
    }
};

solKeyGen();
