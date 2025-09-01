'use server';
/**
 * @fileOverview This file defines a Genkit flow for answering questions about college life using the Cera.AI chatbot.
 *
 * - answerCollegeLifeQuestions - A function that accepts a question and returns an answer.
 * - AnswerCollegeLifeQuestionsInput - The input type for the answerCollegeLifeQuestions function.
 * - AnswerCollegeLifeQuestionsOutput - The return type for the answerCollegeLifeQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerCollegeLifeQuestionsInputSchema = z.object({
  question: z.string().describe('The question about college life.'),
});
export type AnswerCollegeLifeQuestionsInput = z.infer<typeof AnswerCollegeLifeQuestionsInputSchema>;

const AnswerCollegeLifeQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AnswerCollegeLifeQuestionsOutput = z.infer<typeof AnswerCollegeLifeQuestionsOutputSchema>;

export async function answerCollegeLifeQuestions(input: AnswerCollegeLifeQuestionsInput): Promise<AnswerCollegeLifeQuestionsOutput> {
  return answerCollegeLifeQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerCollegeLifeQuestionsPrompt',
  input: {schema: AnswerCollegeLifeQuestionsInputSchema},
  output: {schema: AnswerCollegeLifeQuestionsOutputSchema},
  prompt: `You are Cera.AI, a helpful AI chatbot designed to answer questions about college life. Please answer the following question:

Question: {{{question}}}`,
});

const answerCollegeLifeQuestionsFlow = ai.defineFlow(
  {
    name: 'answerCollegeLifeQuestionsFlow',
    inputSchema: AnswerCollegeLifeQuestionsInputSchema,
    outputSchema: AnswerCollegeLifeQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
