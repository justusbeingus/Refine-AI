const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const modelsToTest = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-pro"
];

async function testModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    for (const modelName of modelsToTest) {
        console.log(`Testing ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`✅ ${modelName} SUCCESS!`);
            return; // Stop if one works
        } catch (e) {
            console.log(`❌ ${modelName} FAILED: ${e.message}`);
        }
    }
}

testModels();
