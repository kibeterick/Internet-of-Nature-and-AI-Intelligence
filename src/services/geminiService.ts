import { GoogleGenerativeAI, Part } from "@google/generative-ai";

// Use environment variables for security
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

if (!API_KEY) {
  console.warn(
    "⚠️ VITE_GEMINI_API_KEY is not set. AI features will use fallback responses.",
  );
}

let genAI: GoogleGenerativeAI | null = null;

try {
  if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
  }
} catch (error) {
  console.error("Failed to initialize Gemini AI:", error);
}

// Helper to centralize model configuration with fallback models
const getModel = (instruction?: string) => {
  if (!genAI) {
    throw new Error(
      "Gemini AI is not initialized. Please check your API key in .env file.",
    );
  }

  try {
    // Use gemini-1.5-flash for better compatibility and reliability
    // This is the current stable model as of 2024
    return genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: instruction,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    });
  } catch (error) {
    console.error("Error creating model:", error);
    throw error;
  }
};

export async function askNatureAI(prompt: string, context: string = "General") {
  // Fallback response if AI is not available
  if (!genAI || !API_KEY) {
    return `🌿 **Genie AI (Offline Mode)**

I'm currently running in offline mode. To enable full AI capabilities:

1. Get a free API key from: https://makersuite.google.com/app/apikey
2. Add it to your .env file as: VITE_GEMINI_API_KEY=your_key_here
3. Restart the development server

**Your question:** "${prompt}"

**General guidance:** I can help you with environmental monitoring, species identification, ecosystem analysis, and conservation strategies. Please configure the API key to get personalized AI responses!`;
  }

  try {
    const systemInstruction = `You are "Genie" 🌿 - the Internet of Nature AI assistant for the world's most advanced ecosystem intelligence platform.
    
Context: ${context}

You help users understand:
- Real-time environmental data (temperature, humidity, air quality, soil)
- Biodiversity metrics and ecosystem health
- Species identification and habitat analysis
- Conservation strategies and best practices
- IoT sensor networks and environmental monitoring
- Industrial ESG compliance and carbon tracking
- Ecosystem simulations and predictive analytics

Your responses should be:
- Clear, friendly, and actionable
- Data-driven with specific numbers when available
- Professional yet accessible
- Helpful for both scientists and general users
- Focused on practical solutions
- Use emojis sparingly for emphasis 🌿

Always be encouraging and supportive of environmental conservation efforts!`;

    const model = getModel(systemInstruction);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error("Empty response from AI");
    }

    return text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);

    // Detailed error handling with helpful messages
    if (
      error.message?.includes("API key") ||
      error.message?.includes("API_KEY_INVALID")
    ) {
      return `⚠️ **API Key Error**

Your API key appears to be invalid. Please:

1. Get a new API key from: https://makersuite.google.com/app/apikey
2. Update your .env file: VITE_GEMINI_API_KEY=your_new_key
3. Restart the server: npm run dev

**Your question:** "${prompt}"`;
    }

    if (
      error.message?.includes("quota") ||
      error.message?.includes("RESOURCE_EXHAUSTED")
    ) {
      return `⚠️ **API Quota Exceeded**

You've reached your API usage limit. Options:

1. Wait for quota reset (usually daily)
2. Upgrade your plan at: https://console.cloud.google.com/
3. Use a different API key

**Your question:** "${prompt}"

I'll be ready to help once the quota is restored!`;
    }

    if (
      error.message?.includes("404") ||
      error.message?.includes("not found")
    ) {
      return `⚠️ **Model Unavailable**

The AI model is temporarily unavailable. This usually resolves quickly.

**What you can do:**
- Try again in a few moments
- Check your internet connection
- Verify the API key is active

**Your question:** "${prompt}"`;
    }

    if (error.message?.includes("PERMISSION_DENIED")) {
      return `⚠️ **Permission Denied**

Your API key doesn't have the necessary permissions.

**Fix this by:**
1. Go to: https://console.cloud.google.com/
2. Enable the "Generative Language API"
3. Ensure your API key has proper permissions

**Your question:** "${prompt}"`;
    }

    // Generic fallback with helpful information
    return `⚠️ **Connection Issue**

I'm having trouble connecting right now.

**Possible solutions:**
✓ Check your internet connection
✓ Verify API key in .env file
✓ Try again in a few moments
✓ Check browser console for details

**Your question:** "${prompt}"

**Error:** ${error.message || "Unknown error"}

Don't worry - I'll be back online soon! 🌿`;
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
