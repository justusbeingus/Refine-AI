const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function findWorkingModel() {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();

    if (!data.models) {
        console.log("Failed to fetch models");
        return;
    }

    const supported = data.models
        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
        .map(m => m.name.replace("models/", ""));

    console.log(`Found ${supported.length} supported models. Testing...`);

    for (const modelName of supported) {
        try {
            console.log(`Testing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test");
            console.log(`✅ SUCCESS: ${modelName} works!`);
            break; // Stop when we find one
        } catch (error) {
            console.log(`❌ FAILED: ${modelName} - ${error.message.split('\n')[0]}`);
        }
    }
}

findWorkingModel();
