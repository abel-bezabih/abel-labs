import Groq from 'groq-sdk';
import { ProjectType, ConversationMessage } from '@abel-labs/types';
import { z } from 'zod';

const projectBriefSchema = z.object({
  projectType: z.nativeEnum(ProjectType),
  businessType: z.string().optional(),
  features: z.array(z.string()),
  designPreferences: z.string().optional(),
  timeline: z.string().optional(),
  budgetRange: z.string().optional(),
  exampleWebsites: z.array(z.string()).optional(),
  summary: z.string(),
});

export type ProjectBriefData = z.infer<typeof projectBriefSchema>;

export class AbelBot {
  private groq: Groq;
  private systemPrompt: string;
  private readonly model = 'llama-3.3-70b-versatile';

  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('Groq API key is required. Please set GROQ_API_KEY in your .env file.');
    }
    this.groq = new Groq({ apiKey });
    this.systemPrompt = `You are Abel, a professional consultant for Abel Labs, a software company in Burnaby, BC, Canada.

CRITICAL RULES:
1. Keep responses SHORT and STRUCTURED (2-3 sentences max)
2. Be DIRECT and PROFESSIONAL - no fluff or unnecessary conversation
3. ALWAYS end every response with contact information:
   - Phone: (604) 977-6878
   - Email: hello@abellabs.ca
4. Focus on QUALIFYING leads and DIRECTING to human contact
5. Answer questions concisely, then guide to phone/email for details

CONTACT INFO COLLECTION (PRIORITY):
- In your FIRST or SECOND response, ask for: "What's your name, email, and phone number?"
- Extract and remember: name, email, phone from the conversation
- If they provide contact info, acknowledge it briefly: "Thanks [Name]! I've got your contact info."

Your role:
- Answer questions about services, pricing, and process BRIEFLY
- COLLECT contact info early: name, email, phone number
- Gather basic project requirements (type, budget, timeline)
- Detect project intent: Website, Mobile App, E-commerce, Portfolio, or Custom System
- Direct serious inquiries to phone/email for custom quotes

Response format:
[Brief answer to question]
[Next step/action]
Contact us: (604) 977-6878 or hello@abellabs.ca

Tone: Professional, helpful, direct. No small talk. Get to the point quickly.

When you have enough information, provide a structured summary in JSON format matching the project brief schema.`;
  }

  async detectIntent(messages: ConversationMessage[]): Promise<ProjectType | null> {
    const intentPrompt = `Based on this conversation, detect the project intent. Return only one of: WEBSITE, MOBILE_APP, ECOMMERCE, PORTFOLIO, CUSTOM_SYSTEM, or null if unclear.

Conversation:
${messages.map((m) => `${m.role}: ${m.content}`).join('\n')}

Intent:`;

    try {
      const response = await this.groq.chat.completions.create({
        model: this.model,
        messages: [{ role: 'system', content: intentPrompt }],
        temperature: 0.3,
        max_tokens: 50,
      });

      const intent = response.choices[0]?.message?.content?.trim().toUpperCase();
      if (intent && Object.values(ProjectType).includes(intent as ProjectType)) {
        return intent as ProjectType;
      }
      return null;
    } catch (error) {
      console.error('Intent detection error:', error);
      return null;
    }
  }

  async generateResponse(
    messages: ConversationMessage[],
    _language: 'en' | 'am' = 'en'
  ): Promise<string> {
    const conversationMessages = [
      { role: 'system' as const, content: this.systemPrompt },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
    ];

    try {
      const response = await this.groq.chat.completions.create({
        model: this.model,
        messages: conversationMessages,
        temperature: 0.5,
        max_tokens: 200,
      });

      let aiResponse = response.choices[0]?.message?.content || 'I apologize, I encountered an error.';
      
      // Ensure contact info is included if not already present
      const contactInfo = '\n\n📞 Call us: (604) 977-6878\n✉️ Email: hello@abellabs.ca';
      if (!aiResponse.includes('(604)') && !aiResponse.includes('hello@abellabs.ca')) {
        aiResponse = aiResponse.trim() + contactInfo;
      }

      return aiResponse;
    } catch (error: any) {
      console.error('AI response generation error:', error);
      const errorMessage = error?.message || 'Unknown error';
      if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
        return 'I apologize, there is an issue with the AI service configuration. Please contact us directly at (604) 977-6878 or hello@abellabs.ca';
      }
      return `I apologize, I encountered an error. Please contact us directly: (604) 977-6878 or hello@abellabs.ca`;
    }
  }

  async generateProjectBrief(messages: ConversationMessage[]): Promise<ProjectBriefData | null> {
    const briefPrompt = `Based on this conversation, generate a structured project brief in JSON format. Extract:
- projectType (WEBSITE, MOBILE_APP, ECOMMERCE, PORTFOLIO, or CUSTOM_SYSTEM)
- businessType (if mentioned)
- features (array of strings)
- designPreferences (if mentioned)
- timeline (if mentioned)
- budgetRange (if mentioned)
- exampleWebsites (if mentioned, array of URLs or app names)
- summary (comprehensive summary of the project requirements)

Conversation:
${messages.map((m) => `${m.role}: ${m.content}`).join('\n')}

Return ONLY valid JSON matching this schema:
{
  "projectType": "WEBSITE" | "MOBILE_APP" | "ECOMMERCE" | "PORTFOLIO" | "CUSTOM_SYSTEM",
  "businessType": "string (optional)",
  "features": ["string"],
  "designPreferences": "string (optional)",
  "timeline": "string (optional)",
  "budgetRange": "string (optional)",
  "exampleWebsites": ["string"] (optional),
  "summary": "string"
}`;

    try {
      const response = await this.groq.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: briefPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return null;

      const parsed = JSON.parse(content);
      return projectBriefSchema.parse(parsed);
    } catch (error) {
      console.error('Project brief generation error:', error);
      return null;
    }
  }

  async shouldCreateBrief(messages: ConversationMessage[]): Promise<boolean> {
    const checkPrompt = `Has the client provided enough information to create a project brief? 
Consider: project type, key features, and basic requirements.

Conversation:
${messages.map((m) => `${m.role}: ${m.content}`).join('\n')}

Respond with only "YES" or "NO".`;

    try {
      const response = await this.groq.chat.completions.create({
        model: this.model,
        messages: [{ role: 'system', content: checkPrompt }],
        temperature: 0.2,
        max_tokens: 10,
      });

      const answer = response.choices[0]?.message?.content?.trim().toUpperCase();
      return answer === 'YES';
    } catch (error) {
      console.error('Brief readiness check error:', error);
      return false;
    }
  }
}

