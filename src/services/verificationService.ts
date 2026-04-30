import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.GEMINI_API_KEY });


export async function verifyBankReceipt(base64Image: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `You are an expert bank transaction verifier for TenantBora. 
            Analyze this screenshot of a bank transfer receipt or confirmation. 
            Extract the Reference Number, Amount, Date, and Payer/Payee name.
            Check for signs of digital manipulation.
            Return the data in the specified JSON format.`
          },
          {
            inlineData: {
              data: base64Image,
              mimeType: "image/jpeg"
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          transactionCode: { type: Type.STRING, description: "The bank reference number" },
          amount: { type: Type.NUMBER },
          date: { type: Type.STRING },
          isLegit: { type: Type.BOOLEAN },
          anomalyDetected: { type: Type.STRING }
        },
        required: ["transactionCode", "amount", "date", "isLegit"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
