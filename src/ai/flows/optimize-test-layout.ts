// OptimizeTestLayout.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to optimize the layout of a test paper.
 *
 * - optimizeTestLayout - A function that takes test content and settings, and returns an optimized layout.
 * - OptimizeTestLayoutInput - The input type for the optimizeTestLayout function.
 * - OptimizeTestLayoutOutput - The return type for the optimizeTestLayout function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeTestLayoutInputSchema = z.object({
  testTitle: z.string().describe('The title of the test.'),
  instructions: z.string().describe('Instructions for the test.'),
  sections: z.array(
    z.object({
      title: z.string().describe('The title of the section.'),
      questions: z.array(z.string()).describe('The questions in the section.'),
    })
  ).describe('The sections of the test, each with a title and questions.'),
  fontSize: z.number().min(1).max(72).describe('The font size for the test content.'),
  pageWidthPx: z.number().describe('The page width in pixels.'),
  pageHeightPx: z.number().describe('The page height in pixels.'),
  pageWidthCm: z.number().optional().describe('The page width in centimeters, optional.'),
  pageHeightCm: z.number().optional().describe('The page height in centimeters, optional.'),
});

export type OptimizeTestLayoutInput = z.infer<typeof OptimizeTestLayoutInputSchema>;

const OptimizeTestLayoutOutputSchema = z.object({
  optimizedLayout: z.string().describe('The optimized layout of the test paper as a string.'),
});

export type OptimizeTestLayoutOutput = z.infer<typeof OptimizeTestLayoutOutputSchema>;

export async function optimizeTestLayout(input: OptimizeTestLayoutInput): Promise<OptimizeTestLayoutOutput> {
  return optimizeTestLayoutFlow(input);
}

const optimizeTestLayoutPrompt = ai.definePrompt({
  name: 'optimizeTestLayoutPrompt',
  input: {schema: OptimizeTestLayoutInputSchema},
  output: {schema: OptimizeTestLayoutOutputSchema},
  prompt: `You are an expert layout designer specializing in creating test papers that fit within one or two pages.

  Given the following test paper content and settings, optimize the layout to ensure it fits within the specified page dimensions.
  Consider adjusting spacing, font sizes, and section arrangements to achieve the most efficient use of space while maintaining readability.
  Return the optimized layout as a string.

  Test Title: {{{testTitle}}}
  Instructions: {{{instructions}}}
  Sections:
  {{#each sections}}
  Section Title: {{{title}}}
  Questions:
  {{#each questions}}
  - {{{this}}}
  {{/each}}
  {{/each}}
  Font Size: {{{fontSize}}}px
  Page Width: {{{pageWidthPx}}}px
  Page Height: {{{pageHeightPx}}}px
  Page Width (cm, optional): {{{pageWidthCm}}}cm
  Page Height (cm, optional): {{{pageHeightCm}}}cm

  Optimized Layout:`, // No function calls, NO Asynchronous Operations! (Handlebars logic-less templates)
});

const optimizeTestLayoutFlow = ai.defineFlow(
  {
    name: 'optimizeTestLayoutFlow',
    inputSchema: OptimizeTestLayoutInputSchema,
    outputSchema: OptimizeTestLayoutOutputSchema,
  },
  async input => {
    const {output} = await optimizeTestLayoutPrompt(input);
    return output!;
  }
);
