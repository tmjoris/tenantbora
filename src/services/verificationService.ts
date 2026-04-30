import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function verifyEmploymentDocument(base64Image: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `You are an expert rental verification assistant for Nairobi landlords on the TenantBora platform. 
            Analyze this employment document (payslip or contract) and extract key details.
            Be skeptical of fraud (check for alignment issues, font inconsistencies).
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
          company: { type: Type.STRING },
          position: { type: Type.STRING },
          salaryRange: { type: Type.STRING, description: "Extract the monthly net or gross salary" },
          isLikelyFraud: { type: Type.BOOLEAN, description: "True if you detect inconsistencies in the document structure" },
          fraudReason: { type: Type.STRING, description: "Explanation if fraud is suspected" },
          confidence: { type: Type.NUMBER, description: "Confidence score 0-1" }
        },
        required: ["company", "position", "salaryRange", "isLikelyFraud", "confidence"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function verifyMpesaReceipt(base64Image: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `You are an expert M-Pesa transaction verifier for TenantBora. 
            Analyze this screenshot of an M-Pesa confirmation message. 
            Extract the Transaction Code (e.g., RJL234...), Amount, Date, Time, and Sender/Recipient name.
            Check for signs of digital manipulation (photoshop, font mismatch, incorrect KES formatting).
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
          transactionCode: { type: Type.STRING },
          amount: { type: Type.NUMBER, description: "Numeric value of the KES amount" },
          date: { type: Type.STRING, description: "Format: DD/MM/YYYY" },
          time: { type: Type.STRING },
          sender: { type: Type.STRING },
          isLegit: { type: Type.BOOLEAN, description: "Confidence that the screenshot is original and unedited" },
          anomalyDetected: { type: Type.STRING, description: "Brief description if forgery is suspected" }
        },
        required: ["transactionCode", "amount", "date", "isLegit"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

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
