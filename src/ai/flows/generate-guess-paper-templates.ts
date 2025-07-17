// src/ai/flows/generate-guess-paper-templates.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating guess paper templates.
 *
 * The flow takes a subject and difficulty level as input, and generates a guess paper
 * template with questions and answers. It exports:
 *   - generateGuessPaperTemplate: The main function to generate a guess paper template.
 *   - GenerateGuessPaperTemplateInput: The input type for the function.
 *   - GenerateGuessPaperTemplateOutput: The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGuessPaperTemplateInputSchema = z.object({
  subject: z.string().describe('The subject for which to generate the guess paper.'),
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty level of the guess paper.'),
});
export type GenerateGuessPaperTemplateInput = z.infer<
  typeof GenerateGuessPaperTemplateInputSchema
>;

const GenerateGuessPaperTemplateOutputSchema = z.object({
  title: z.string().describe('Title of the guess paper'),
  introduction: z.string().describe('Introduction of the guess paper'),
  sections: z.array(
    z.object({
      title: z.string().describe('The title of the section'),
      questions: z.array(z.string()).describe('The questions in the section'),
      answers: z.array(z.string()).describe('The answers to the questions'),
    })
  ),
});

export type GenerateGuessPaperTemplateOutput = z.infer<
  typeof GenerateGuessPaperTemplateOutputSchema
>;

export async function generateGuessPaperTemplate(
  input: GenerateGuessPaperTemplateInput
): Promise<GenerateGuessPaperTemplateOutput> {
  return generateGuessPaperTemplateFlow(input);
}

const generateGuessPaperTemplatePrompt = ai.definePrompt({
  name: 'generateGuessPaperTemplatePrompt',
  input: {schema: GenerateGuessPaperTemplateInputSchema},
  output: {schema: GenerateGuessPaperTemplateOutputSchema},
  prompt: `You are an expert educator specializing in generating guess paper templates for students.

You will generate a guess paper template for the subject of {{{subject}}} with a difficulty level of {{{difficulty}}}.

The guess paper template should include multiple sections, each with a title, a list of questions, and a list of corresponding answers.

Make sure the questions and answers are appropriate for the specified subject and difficulty level.

Ensure that the output is well-formatted and easy to read.

Output:
{{outputFormatInstructions}}`,
});

const generateGuessPaperTemplateFlow = ai.defineFlow(
  {
    name: 'generateGuessPaperTemplateFlow',
    inputSchema: GenerateGuessPaperTemplateInputSchema,
    outputSchema: GenerateGuessPaperTemplateOutputSchema,
  },
  async input => {
    const {output} = await generateGuessPaperTemplatePrompt(input);
    return output!;
  }
);
