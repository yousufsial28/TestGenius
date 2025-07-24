import {createNextApi} from 'genkit/next';
import '@/ai/flows/generate-guess-paper-templates';
import '@/ai/flows/optimize-test-layout';

export const {GET, POST} = createNextApi();
