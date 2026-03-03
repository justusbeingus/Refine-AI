const apiKey = require('dotenv').config({ path: '.env.local' }).parsed.GOOGLE_API_KEY;

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
    .then(res => res.json())
    .then(data => {
        if (data.models) {
            console.log("SUPPORTED MODELS FOR GENERATE CONTENT:");
            data.models.filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")).forEach(m => {
                console.log(m.name);
            });
        } else {
            console.log("Error fetching models:", data);
        }
    });
