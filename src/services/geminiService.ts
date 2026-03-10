import { GoogleGenerativeAI, Part } from "@google/generative-ai";

// Use environment variables for security. Replace with your actual key if needed for testing.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

if (!API_KEY) {
  console.error("VITE_GEMINI_API_KEY is not set. AI features will not work.");
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Helper to centralize model configuration with fallback models
const getModel = (instruction?: string) => {
  if (!genAI) {
    throw new Error("Gemini AI is not initialized. Please check your API key.");
  }

  // Use gemini-pro which is stable with v1beta API
  return genAI.getGenerativeModel({
    model: "gemini-pro",
    systemInstruction: instruction,
  });
};

export async function askNatureAI(prompt: string, context: string = "General") {
  try {
    const systemInstruction = `You are the "Internet of Nature" AI assistant for Project Genie - the world's most advanced ecosystem intelligence platform.
    
Context: ${context}

You help users and industries understand:
- Real-time environmental sensor data (temperature, humidity, air quality, soil conditions)
- Biodiversity metrics and ecosystem health scores
- Species identification and habitat analysis
- Conservation strategies and ecological best practices
- IoT sensor networks and environmental monitoring
- Industrial ESG compliance and carbon tracking
- Ecosystem simulations and predictive analytics

Your responses should be:
- Clear and actionable
- Data-driven with specific numbers when possible
- Professional yet accessible
- Helpful for both scientists and general users
- Focused on practical solutions

If you don't have specific data, provide general ecological knowledge and suggest what data would be helpful.`;

    const model = getModel(systemInstruction);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini API Error:", error);

    // Detailed error handling
    if (
      error.message?.includes("API key") ||
      error.message?.includes("API_KEY_INVALID")
    ) {
      return "⚠️ AI service configuration error. Please verify your API key is correct and active. You can get a free API key from https://makersuite.google.com/app/apikey";
    }
    if (
      error.message?.includes("quota") ||
      error.message?.includes("RESOURCE_EXHAUSTED")
    ) {
      return "⚠️ API quota exceeded. Please try again later or upgrade your API plan at https://console.cloud.google.com/";
    }
    if (
      error.message?.includes("404") ||
      error.message?.includes("not found")
    ) {
      return "⚠️ Model not available. The AI service is being updated. Please try again in a few moments.";
    }
    if (error.message?.includes("PERMISSION_DENIED")) {
      return "⚠️ Permission denied. Please check that your API key has the necessary permissions enabled.";
    }

    // Generic fallback with helpful information
    return `⚠️ I'm having trouble connecting to the AI service right now. 

**Possible solutions:**
1. Check your internet connection
2. Verify your API key is valid
3. Try again in a few moments
4. Contact support if the issue persists

**Error details:** ${error.message || "Unknown error"}`;
  }
}

export async function* askNatureAIStream(prompt: string) {
  if (!genAI) {
    yield "⚠️ AI service not configured. Please check your API key.";
    return;
  }

  const model = getModel();
  try {
    const result = await model.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      yield chunkText;
    }
  } catch (error: any) {
    console.error("Streaming error:", error);
    yield "\n\n⚠️ Connection interrupted. Please try again.";
  }
}

export async function identifySpecies(imageData: string, mimeType: string) {
  const systemInstruction = `You are an expert taxonomist and ecologist specializing in species identification.

When identifying species:
1. Provide the scientific name (genus and species)
2. Common name(s)
3. Key identifying features visible in the image
4. Habitat and geographic distribution
5. Conservation status if notable
6. One interesting ecological fact

Be specific and confident when identification is clear. If uncertain, mention similar species and distinguishing features.`;

  const model = getModel(systemInstruction);
  try {
    const data = imageData.includes(",") ? imageData.split(",")[1] : imageData;
    const result = await model.generateContent([
      { inlineData: { data, mimeType } },
      {
        text: "Identify this species and provide detailed ecological information.",
      },
    ]);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Species identification error:", error);
    return (
      "⚠️ I couldn't identify the species. Please ensure the image is clear and try again. Error: " +
      (error.message || "Unknown error")
    );
  }
}

export async function analyzeFile(
  fileData: string,
  mimeType: string,
  prompt: string,
) {
  const model = getModel();
  try {
    const isImage = mimeType.startsWith("image/");
    const data = fileData.includes(",") ? fileData.split(",")[1] : fileData;

    const parts: Part[] = isImage
      ? [{ inlineData: { data, mimeType } }]
      : [{ text: `File Content: ${fileData}` }];

    parts.push({ text: prompt || "Analyze this file." });
    const result = await model.generateContent(parts);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("File analysis error:", error);
    return (
      "⚠️ I couldn't analyze this file. Error: " +
      (error.message || "Unknown error")
    );
  }
}

export async function generateEcologicalReport(sensorData: any) {
  const systemInstruction = `You are an environmental data analyst generating professional ecological reports.

Report structure:
1. Executive Summary - Key findings and overall health assessment
2. Data Analysis - Detailed breakdown of sensor readings with trends
3. Environmental Indicators - Temperature, humidity, air quality, soil conditions
4. Biodiversity Assessment - Species diversity and ecosystem health
5. Alerts & Anomalies - Any concerning patterns or outliers
6. Recommendations - Actionable conservation strategies
7. Conclusion - Summary and next steps

Use clear headings, bullet points, and data-driven insights. Be professional but accessible.`;

  const model = getModel(systemInstruction);
  try {
    const prompt = `Generate a comprehensive ecological report based on this sensor data:\n\n${JSON.stringify(sensorData, null, 2)}\n\nProvide detailed analysis with specific numbers and trends.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Report generation error:", error);
    return (
      "⚠️ Failed to generate report. Please check the sensor data format and try again. Error: " +
      (error.message || "Unknown error")
    );
  }
}

export async function simulateEcosystemResponse(
  scenario: string,
  currentData: any,
) {
  const systemInstruction = `You are an advanced ecosystem simulator using ecological modeling principles.

When simulating scenarios:
1. Analyze current baseline conditions from sensor data
2. Apply ecological principles (succession, trophic cascades, feedback loops)
3. Predict short-term (1-6 months) and long-term (1-5 years) impacts
4. Consider multiple factors: climate, species interactions, human activity
5. Quantify predicted changes with percentages and metrics
6. Identify risks and opportunities
7. Suggest mitigation or enhancement strategies

Be specific with predictions. Use scientific reasoning. Acknowledge uncertainties.`;

  const model = getModel(systemInstruction);
  try {
    const prompt = `Scenario: ${scenario}

Current Ecosystem Data:
${JSON.stringify(currentData, null, 2)}

Simulate and predict the ecological impacts of this scenario. Provide detailed analysis with:
- Immediate effects (0-6 months)
- Long-term impacts (1-5 years)
- Affected species and habitats
- Quantified predictions (use percentages and metrics)
- Risk assessment
- Recommended actions`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Simulation error:", error);
    return (
      "⚠️ Simulation failed. Please provide more details about the scenario and ensure data is properly formatted. Error: " +
      (error.message || "Unknown error")
    );
  }
}
