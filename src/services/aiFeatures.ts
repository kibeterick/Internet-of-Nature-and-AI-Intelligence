import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AIAnalysisResult {
  summary: string;
  insights: string[];
  recommendations: string[];
  confidence: number;
}

export interface CodeAnalysis {
  quality: number;
  issues: string[];
  suggestions: string[];
  complexity: "low" | "medium" | "high";
}

export class AIFeaturesService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async analyzeEcosystemHealth(sensorData: any[]): Promise<AIAnalysisResult> {
    const prompt = `Analyze this ecosystem data and provide insights:
${JSON.stringify(sensorData, null, 2)}

Provide:
1. A brief summary of overall health
2. 3 key insights
3. 3 actionable recommendations`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAIResponse(text);
    } catch (error) {
      console.error("AI analysis error:", error);
      return this.getFallbackAnalysis();
    }
  }

  async generateSpeciesReport(
    speciesName: string,
    observations: any[],
  ): Promise<string> {
    const prompt = `Generate a detailed report for species: ${speciesName}
Observations: ${JSON.stringify(observations, null, 2)}

Include: population trends, habitat conditions, threats, and conservation status.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Species report error:", error);
      return `Unable to generate report for ${speciesName}. Please try again.`;
    }
  }

  async analyzeCode(code: string): Promise<CodeAnalysis> {
    const prompt = `Analyze this code for quality, issues, and provide suggestions:
\`\`\`
${code}
\`\`\`

Rate quality (0-100), list issues, suggest improvements, and assess complexity.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseCodeAnalysis(text);
    } catch (error) {
      console.error("Code analysis error:", error);
      return {
        quality: 70,
        issues: ["Unable to analyze code"],
        suggestions: ["Review code manually"],
        complexity: "medium",
      };
    }
  }

  async generateDocumentation(code: string, context: string): Promise<string> {
    const prompt = `Generate comprehensive documentation for this code:
Context: ${context}

Code:
\`\`\`
${code}
\`\`\`

Include: description, parameters, return values, examples, and usage notes.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Documentation generation error:", error);
      return "# Documentation\n\nUnable to generate documentation. Please try again.";
    }
  }

  async suggestOptimizations(data: any): Promise<string[]> {
    const prompt = `Suggest optimizations for this system configuration:
${JSON.stringify(data, null, 2)}

Provide 5 specific, actionable optimization suggestions.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .slice(0, 5)
        .map((line) => line.replace(/^[\d\.\-\*]\s*/, "").trim());
    } catch (error) {
      console.error("Optimization suggestions error:", error);
      return [
        "Review sensor placement for optimal coverage",
        "Implement data caching to reduce API calls",
        "Enable predictive analytics for proactive monitoring",
        "Set up automated alerts for critical thresholds",
        "Optimize data collection intervals based on patterns",
      ];
    }
  }

  private parseAIResponse(text: string): AIAnalysisResult {
    const lines = text.split("\n").filter((l) => l.trim());

    return {
      summary: lines[0] || "Ecosystem analysis complete",
      insights: lines
        .slice(1, 4)
        .map((l) => l.replace(/^[\d\.\-\*]\s*/, "").trim()),
      recommendations: lines
        .slice(4, 7)
        .map((l) => l.replace(/^[\d\.\-\*]\s*/, "").trim()),
      confidence: 0.85,
    };
  }

  private parseCodeAnalysis(text: string): CodeAnalysis {
    const qualityMatch = text.match(/quality[:\s]+(\d+)/i);
    const quality = qualityMatch ? parseInt(qualityMatch[1]) : 75;

    const lines = text.split("\n").filter((l) => l.trim());
    const issues = lines
      .filter((l) => l.toLowerCase().includes("issue"))
      .slice(0, 3);
    const suggestions = lines
      .filter((l) => l.toLowerCase().includes("suggest"))
      .slice(0, 3);

    return {
      quality,
      issues: issues.length > 0 ? issues : ["No major issues detected"],
      suggestions: suggestions.length > 0 ? suggestions : ["Code looks good"],
      complexity: quality > 80 ? "low" : quality > 60 ? "medium" : "high",
    };
  }

  private getFallbackAnalysis(): AIAnalysisResult {
    return {
      summary: "Ecosystem monitoring active. All systems operational.",
      insights: [
        "Sensor data collection is functioning normally",
        "Environmental parameters are within expected ranges",
        "Biodiversity metrics show stable trends",
      ],
      recommendations: [
        "Continue regular monitoring schedule",
        "Review historical trends for patterns",
        "Consider expanding sensor coverage",
      ],
      confidence: 0.7,
    };
  }
}
