import { GoogleGenAI } from "@google/genai";

// Helper to convert File to Base64 string (stripping the data URL prefix for the API if needed, 
// but the SDK handles raw base64 data in inlineData)
const fileToGenerativePart = async (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Extract the base64 data part (remove "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        data: base64Data,
        mimeType: file.type,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateLandscapeDesign = async (
  imageFile: File,
  prompt: string
): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API Key is missing");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare the image part
    const imagePart = await fileToGenerativePart(imageFile);

    // Construct a specialized prompt for landscaping
    const enhancedPrompt = `
      Act as a professional landscape architect for "OnThymeLandscapes" in Australia. 
      Edit the provided image to transform the outdoor space according to the user's request.
      Maintain a photorealistic style. 
      User Request: ${prompt}.
      
      Ensure the lighting and perspective match the original photo perfectly.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imagePart.data,
              mimeType: imagePart.mimeType,
            },
          },
          {
            text: enhancedPrompt,
          },
        ],
      },
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error("No content generated");
    }

    for (const part of parts) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        // We assume PNG is returned or match the mimeType if provided, 
        // though usually it's image/png or image/jpeg from the model.
        // The SDK typing for inlineData includes mimeType.
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${base64EncodeString}`;
      }
    }

    throw new Error("No image generated in response");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};