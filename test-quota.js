const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function testModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    // List of models to try, prioritizing standard/older ones that might have better free tiers
    const candidates = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-001",
        "gemini-flash-latest",
        "gemini-pro-latest",
        "gemini-1.5-flash-latest" // Sometimes this alias works even if versioned doesn't
    ];

    console.log("Testing models for availability...");

    for (const modelName of candidates) {
        try {
            console.log(`\nTesting ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, just checking availability.");
            console.log(`✅ SUCCESS: ${modelName} is working!`);
            console.log(`Response: ${result.response.text().substring(0, 50)}...`);
            return; // Stop at the first working one
        } catch (error) {
            console.log(`❌ FAILED: ${modelName}`);
            console.log(`Error: ${error.message}`);
        }
    }
    console.log("\n❌ All candidates failed.");
}

testModels();
