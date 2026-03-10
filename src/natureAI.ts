import { GoogleGenerativeAI, Part } from "@google/generative-ai";

// Use Vite environment variables for production security
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Helper to get the model with specific instructions
 */
const getNatureModel = (systemRole: string = "General") => {
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You are the "Internet of Nature" AI assistant. 
    Expertise: Ecology, biodiversity, and environmental sensors.
    Tone: Scientific yet accessible.
    Context: ${systemRole}`,
  });
};

export async function askNatureAI(prompt: string, context?: string) {
  const model = getNatureModel(context);
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to the nature network.";
  }
}

export async function* askNatureAIStream(prompt: string) {
  const model = getNatureModel();
  try {
    const result = await model.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  } catch (error) {
    yield "Connection interrupted...";
  }
}

export async function identifySpecies(imageData: string, mimeType: string) {
  const model = getNatureModel("Species Identification Expert");
  try {
    // Strips metadata from base64 string if present
    const base64Data = imageData.split(',')[1] || imageData;
    const result = await model.generateContent([
      { inlineData: { data: base64Data, mimeType } },
      { text: "Identify this species and provide its role in the ecosystem." },
    ]);
    return result.response.text();
  } catch (error) {
    return "Species identification failed.";
  }
}

export async function analyzeFile(fileData: string, mimeType: string, prompt: string) {
  const model = getNatureModel("Environmental Data Analyst");
  try {
    const isImage = mimeType.startsWith('image/');
    const base64Data = fileData.split(',')[1] || fileData;

    const parts: Part[] = isImage 
      ? [{ inlineData: { data: base64Data, mimeType } }]
      : [{ text: `Document Content: ${fileData}` }];
    
    parts.push({ text: prompt || "Analyze this for ecological insights." });
    
    const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
    return result.response.text();
  } catch (error) {
    return "Analysis failed.";
  }
}

export async function generateEcologicalReport(sensorData: any) {
  const model = getNatureModel("Eco-Report Generator");
  try {
    const prompt = `Convert this raw sensor data into a structured ecological health report: ${JSON.stringify(sensorData)}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "Report generation failed.";
  }
}

export async function simulateEcosystemResponse(scenario: string, currentData: any) {
  const model = getNatureModel("Predictive Ecology Simulator");
  try {
    const prompt = `Predict outcomes for this scenario: "${scenario}" based on current data: ${JSON.stringify(currentData)}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "Simulation error.";
  }
}
