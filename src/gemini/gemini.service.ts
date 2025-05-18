import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GeminiService {
  private ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  async getGeminiStream(prompt: string | string[]) {
    const stream = await this.ai.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    return stream;
  }

  async getGemini(prompt: string | string[]) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    return response;
  }
}
