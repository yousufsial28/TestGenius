import { createGenkitAPIRoute } from '@genkit-ai/next';
import '@/ai/flows/generate-guess-paper-templates';
import '@/ai/flows/optimize-test-layout';

export const { GET, POST } = createGenkitAPIRoute();
