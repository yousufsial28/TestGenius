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
  testTitle: z.string().describe('The title of the test.'),
  sections: z.array(
    z.object({
      title: z.string().describe('The title of the section.'),
      questions: z.array(z.string()).describe('The questions in the section.'),
    })
  ).describe('The sections of the test, each with a title and questions.'),
});

export type OptimizeTestLayoutOutput = z.infer<typeof OptimizeTestLayoutOutputSchema>;

export async function optimizeTestLayout(input: OptimizeTestLayoutInput): Promise<OptimizeTestLayoutOutput> {
  return optimizeTestLayoutFlow(input);
}

const optimizeTestLayoutPrompt = ai.definePrompt({
  name: 'optimizeTestLayoutPrompt',
  input: {schema: OptimizeTestLayoutInputSchema},
  output: {schema: OptimizeTestLayoutOutputSchema},
  prompt: `You are an expert layout designer specializing in creating test papers.

  Given the following test paper content, you will return a structured JSON object.
  The goal is to refine the content if necessary but primarily structure it for a clean layout. 
  For example, you might slightly rephrase questions for clarity or brevity to fit a layout better.
  
  Do not perform the layout yourself. Simply return the structured data.
  The output should contain the test title and the sections with their titles and questions.

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
  
  Return ONLY the structured JSON that conforms to the output schema.
  `,
});

const optimizeTestLayoutFlow = ai.defineFlow(
  {
    name: 'optimizeTestLayoutFlow',
    inputSchema: OptimizeTestLayoutInputSchema,
    outputSchema: OptimizeTestLayoutOutputSchema,
  },
  async input => {
    // For this use case, we are mostly just restructuring the data,
    // so we can pass the relevant parts of the input directly to the output schema.
    // The LLM will refine the content.
    const llmResponse = await optimizeTestLayoutPrompt(input);
    const output = llmResponse.output;

    if (!output) {
      // Fallback in case LLM fails to return valid JSON.
      return {
        testTitle: input.testTitle,
        sections: input.sections,
      };
    }
    
    // Ensure the output from the LLM is used, but also contains the essential structure.
    return {
      testTitle: output.testTitle || input.testTitle,
      sections: output.sections && output.sections.length > 0 ? output.sections : input.sections,
    };
  }
);
