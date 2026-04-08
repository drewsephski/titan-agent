import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
});

const languageModels = {
	"openrouter/free": openrouter("openrouter/free"),
};

export const workflowModel = {
	languageModel: (modelId: keyof typeof languageModels) => languageModels[modelId],
};

export const WORKFLOW_MODELS = Object.keys(languageModels) as workflowModelID[];

export type workflowModelID = keyof typeof languageModels;
