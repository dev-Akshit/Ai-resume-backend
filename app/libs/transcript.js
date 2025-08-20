import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const extractDataFromTranscript = async (transcript, type) => {
  let prompt;

  if (type === "earlyLife") {
    prompt = `
From the transcript below, extract the following details in strict JSON format only (no explanations, no markdown wrappers):

{
  "birthCity": "",
  "hometownCity": "",
  "schools": [{"name": "", "location": ""}],
  "colleges": [{"name": "", "course": "", "location": ""}],
  "tags": []
}

Transcript:
${transcript}
    `;
  } else if (type === "professionalLife") {
    prompt = `
Extract the following details in strict JSON format only:

{
  "firstJob": { "company": "", "role": "" },
  "otherJobs": [{ "company": "", "role": "" }],
  "tags": []
}

Transcript:
${transcript}
    `;
  } else if (type === "currentLife") {
    prompt = `
Extract the following details in strict JSON format only:

{
  "summary": "",
  "currentCities": [],
  "currentOrganizations": [],
  "currentRoles": [],
  "frequentTravelCities": [],
  "tags": []
}

Transcript:
${transcript}
    `;
  }

  const result = await model.generateContent({
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  });

  const rawText = result.response.text();

  const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/);
  const cleanText = jsonMatch ? jsonMatch[1].trim() : rawText.trim();

  try {
    return { data: JSON.parse(cleanText) };
  } catch (err) {
    console.error("Failed to parse AI output:", cleanText);
    return { data: {} };
  }
};


// import axios from "axios";
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// export const runGeminiPrompt = async (prompt) => {
//   const requestBody = {
//     contents: [{ parts: [{ text: prompt }] }],
//   };

//   try {
//     const response = await axios.post(
//       `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
//       requestBody,
//       { headers: { "Content-Type": "application/json" } }
//     );

//     let rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
//     let cleaned = rawText.trim();

//     if (cleaned.startsWith("json")) {
//       cleaned = cleaned.replace(/^json\s*/, "").replace(/\s*$/, "");
//     } else if (cleaned.startsWith("")) {
//       cleaned = cleaned.replace(/^\s*/, "").replace(/\s*$/, "");
//     }

//     return JSON.parse(cleaned);
//   } catch (err) {
//     console.error("Gemini parsing error:", err.response?.data || err.message);
//     throw new Error("Failed to extract structured life data");
//   }
// };