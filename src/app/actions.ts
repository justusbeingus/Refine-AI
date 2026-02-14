"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

export interface ImprovementResult {
    improvedPrompt: string;
    explanation: string;
}

export async function generateImprovedPrompt(prompt: string): Promise<ImprovementResult> {
    if (!process.env.GOOGLE_API_KEY) {
        throw new Error("Missing GOOGLE_API_KEY environment variable");
    }

    const systemPrompt = `
    You are an Expert Prompt Engineer. Your goal is to take a vague prompt and rewrite it into a 'Golden Prompt' using the C-R-E-F Framework (Context, Role, Explicit Instructions, Format).

    Input Prompt: "${prompt}"

    Instructions:
    1. Analyze the intent of the input.
    2. Diagnose missing variables (Context, Persona, Format).
    3. Inject logical defaults for missing variables (e.g., if audience is missing, infer the most logical one).
    4. Output the result in JSON format with two keys: "improvedPrompt" and "explanation".
       - "improvedPrompt": The rewritten prompt MUST use the following Markdown structure with exact headers:
         # ROLE
         ...
         # CONTEXT
         ...
         # TASK
         ...
         # INSTRUCTIONS
         ...
         # FORMAT
         ...
       - "explanation": A "Why I Changed This" explanation card content (max 3 sentences).

    Return ONLY raw JSON.
  `;

    try {
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanText);

        // Ensure improvedPrompt is a string (handle potential object return like before, though system prompt should enforce string)
        let improvedPrompt = parsed.improvedPrompt;
        if (typeof improvedPrompt === 'object') {
            improvedPrompt = Object.entries(improvedPrompt)
                .map(([key, value]) => `# ${key.toUpperCase()}\n${value}`)
                .join('\n\n');
        }

        return {
            improvedPrompt: improvedPrompt || "Failed to generate prompt",
            explanation: parsed.explanation || "No explanation provided"
        };
    } catch (error: any) {
        console.error("FULL ERROR DETAILS:", error);
        const errorMessage = error.message || "Unknown error occurred";
        throw new Error(`Generation failed: ${errorMessage}`);
    }
}

export async function generateClarifyingQuestions(currentPrompt: string): Promise<string[]> {
    const systemPrompt = `
    You are an Expert Prompt Engineer.
    Input Prompt: "${currentPrompt}"

    Your task is to identify 3 missing variables or ambiguities in the prompt that, if clarified, would significantly improve the output quality (e.g., Audience, Tone, Platform, Goal).

    Output ONLY a JSON array of 3 specific questions strings.
    Example: ["Who is the target audience?", "What is the desired tone?", "What platform is this for?"]
  `;

    try {
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanText) as string[];
    } catch (error) {
        console.error("Error generating questions:", error);
        return ["Who is the target audience?", "What is the tone?", "What is the specific goal?"];
    }
}

export async function generateRefinedPrompt(originalPrompt: string, questions: string[], answers: string[]): Promise<ImprovementResult> {
    const qaPairs = questions.map((q, i) => `Q: ${q}\nA: ${answers[i]}`).join("\n");

    const systemPrompt = `
    You are an Expert Prompt Engineer.
    Original Prompt: "${originalPrompt}"
    
    User Clarifications:
    ${qaPairs}

    Instructions:
    1. Rewrite the original prompt into a 'Golden Prompt' incorporating the user's clarifications.
    2. Use the C-R-E-F Framework.
    3. Output JSON with "improvedPrompt" and "explanation".
       - "improvedPrompt": The rewritten prompt MUST use the following Markdown structure with exact headers:
         # ROLE
         ...
         # CONTEXT
         ...
         # TASK
         ...
         # INSTRUCTIONS
         ...
         # FORMAT
         ...
       - "explanation": Mention specifically how the user's answers were used.

    Return ONLY raw JSON.
  `;

    try {
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanText);

        let improvedPrompt = parsed.improvedPrompt;
        if (typeof improvedPrompt === 'object') {
            improvedPrompt = Object.entries(improvedPrompt)
                .map(([key, value]) => `# ${key.toUpperCase()}\n${value}`)
                .join('\n\n');
        }

        return {
            improvedPrompt: improvedPrompt || "Failed to refine prompt",
            explanation: parsed.explanation || "No explanation provided"
        };
    } catch (error) {
        console.error("Error generating refined prompt:", error);
        throw new Error("Failed to refine prompt");
    }
}
