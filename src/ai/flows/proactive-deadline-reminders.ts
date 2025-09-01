'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing proactive deadline reminders to students.
 *
 * The flow takes student tasks and events as input and returns a personalized reminder message.
 * - `proactiveDeadlineReminders` - A function that takes task details and returns a proactive reminder message.
 * - `ProactiveDeadlineRemindersInput` - The input type for the proactiveDeadlineReminders function.
 * - `ProactiveDeadlineRemindersOutput` - The return type for the proactiveDeadlineReminders function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProactiveDeadlineRemindersInputSchema = z.object({
  taskName: z.string().describe('The name of the task or event.'),
  deadline: z.string().describe('The deadline for the task or event (e.g., YYYY-MM-DD).'),
  description: z.string().optional().describe('A brief description of the task or event.'),
});
export type ProactiveDeadlineRemindersInput = z.infer<typeof ProactiveDeadlineRemindersInputSchema>;

const ProactiveDeadlineRemindersOutputSchema = z.object({
  reminderMessage: z.string().describe('A personalized reminder message for the upcoming deadline.'),
});
export type ProactiveDeadlineRemindersOutput = z.infer<typeof ProactiveDeadlineRemindersOutputSchema>;

export async function proactiveDeadlineReminders(input: ProactiveDeadlineRemindersInput): Promise<ProactiveDeadlineRemindersOutput> {
  return proactiveDeadlineRemindersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'proactiveDeadlineRemindersPrompt',
  input: {schema: ProactiveDeadlineRemindersInputSchema},
  output: {schema: ProactiveDeadlineRemindersOutputSchema},
  prompt: `You are a personalized AI assistant for college students. Your goal is to proactively remind students about upcoming deadlines and events in a helpful and encouraging manner.

  Task/Event: {{{taskName}}}
  Deadline: {{{deadline}}}
  Description: {{{description}}}

  Please generate a reminder message that is personalized and includes the task name, deadline, and description (if available). Make the message concise, friendly, and actionable, encouraging the student to take necessary steps to complete the task before the deadline.
`,
});

const proactiveDeadlineRemindersFlow = ai.defineFlow(
  {
    name: 'proactiveDeadlineRemindersFlow',
    inputSchema: ProactiveDeadlineRemindersInputSchema,
    outputSchema: ProactiveDeadlineRemindersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
