import { HfInference } from '@huggingface/inference';

const hfToken = import.meta.env.VITE_HF_TOKEN || '';

export const hf = new HfInference(hfToken);
export const hasHfConfig = Boolean(hfToken);
