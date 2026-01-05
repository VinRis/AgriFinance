'use server';
/**
 * @fileOverview Generates a financial insight summary using GenAI.
 *
 * - getFinancialInsights: A function that generates a concise summary of financial transactions.
 * - FinancialInsightsInputSchema: The Zod schema for the input.
 * - FinancialInsightsInput: The TypeScript type for the input.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit/zod';

const TransactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  livestockType: z.enum(['dairy', 'poultry']),
  transactionType: z.enum(['income', 'expense']),
  category: z.string(),
  amount: z.number(),
  description: z.string(),
});

export const FinancialInsightsInputSchema = z.object({
  currency: z.string().describe('The currency symbol (e.g., USD, EUR).'),
  transactions: z.array(TransactionSchema).describe('A list of recent financial transactions.'),
});
export type FinancialInsightsInput = z.infer<typeof FinancialInsightsInputSchema>;

export async function getFinancialInsights(input: FinancialInsightsInput): Promise<string> {
  // If there are no transactions, return a default message immediately.
  if (!input.transactions || input.transactions.length === 0) {
    return 'There is no transaction data to analyze.';
  }
  return financialInsightsFlow(input);
}

const financialInsightsFlow = ai.defineFlow(
  {
    name: 'financialInsightsFlow',
    inputSchema: FinancialInsightsInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    
    const transactionsJson = JSON.stringify(input.transactions, null, 2);

    const { text } = await ai.generate({
      prompt: `You are a financial analyst for a farming business. Analyze the following list of recent transactions and provide a short, insightful summary (2-3 sentences) of the farm's financial health.

      Your analysis should be concise and easy to understand for a busy farmer.
      
      - Identify the total income, total expenses, and net profit.
      - Mention the category with the highest expense.
      - Conclude with a brief, encouraging, and forward-looking statement.
      - All monetary values should be prefixed with the currency symbol: ${input.currency}
      
      Here are the transactions:
      ${transactionsJson}
      `,
    });
    return text;
  }
);
