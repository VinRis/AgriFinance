
'use server';
/**
 * @fileOverview AI Advisor for Farm Management.
 * - getAdvisorTips - Analyzes farm data and provides expert advice.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AdvisorInputSchema = z.object({
  livestockType: z.enum(['dairy', 'poultry']),
  farmName: z.string(),
  productionHistory: z.array(z.object({
    date: z.string(),
    amount: z.number(),
    unit: z.string()
  })),
  financeSummary: z.object({
    totalIncome: z.number(),
    totalExpenses: z.number(),
    netProfit: z.number()
  }),
});

const AdvisorOutputSchema = z.object({
  summary: z.string().describe('A concise overview of the current status.'),
  advice: z.array(z.object({
    title: z.string(),
    action: z.string(),
    impact: z.string()
  })).describe('Actionable advice for the farmer.'),
  alert: z.string().optional().describe('A critical warning if data looks worrying.'),
});

export async function getAdvisorTips(input: z.infer<typeof AdvisorInputSchema>) {
  return advisorFlow(input);
}

const advisorFlow = ai.defineFlow(
  {
    name: 'advisorFlow',
    inputSchema: AdvisorInputSchema,
    outputSchema: AdvisorOutputSchema,
  },
  async (input) => {
    const personality = input.livestockType === 'dairy' 
      ? 'expert Dairy Consultant and Bovine Nutritionist' 
      : 'professional Poultry Management Specialist';

    const promptText = `You are a ${personality} advising ${input.farmName}.
    
    Analyze the following data:
    - Livestock: ${input.livestockType}
    - Recent Production: ${JSON.stringify(input.productionHistory.slice(-7))}
    - Financial Status: Income: ${input.financeSummary.totalIncome}, Expenses: ${input.financeSummary.totalExpenses}, Profit: ${input.financeSummary.netProfit}

    Provide specialized advice. If it is Dairy, focus on milk yield, herd health, and silage. If it is Poultry, focus on egg laying rates, coop temperature, and biosecurity.
    
    Be supportive but professional. Return the response in the specified JSON format.`;

    try {
      const { output } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: promptText,
        output: { schema: AdvisorOutputSchema },
      });

      if (!output) {
        throw new Error('AI failed to generate a response.');
      }

      return output;
    } catch (error) {
      console.error('Advisor Flow Error:', error);
      return {
        summary: "I'm having a bit of trouble connecting to my knowledge base right now. Please try again in a moment.",
        advice: [
          {
            title: "Data Check",
            action: "Ensure your production and finance records are up to date.",
            impact: "Helps me provide more accurate advice."
          }
        ],
        alert: "Service temporarily unavailable."
      };
    }
  }
);
