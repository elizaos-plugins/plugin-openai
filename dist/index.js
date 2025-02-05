// src/actions/action.ts
import axios from "axios";
var DEFAULT_MODEL = process.env.OPENAI_DEFAULT_MODEL || "text-davinci-003";
var DEFAULT_MAX_TOKENS = Number.parseInt(process.env.OPENAI_MAX_TOKENS || "200", 10);
var DEFAULT_TEMPERATURE = Number.parseFloat(process.env.OPENAI_TEMPERATURE || "0.7");
var DEFAULT_TIMEOUT = 3e4;
function validatePrompt(prompt) {
  if (!prompt.trim()) {
    throw new Error("Prompt cannot be empty");
  }
  if (prompt.length > 4e3) {
    throw new Error("Prompt exceeds maximum length of 4000 characters");
  }
}
function validateApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key is not set");
  }
  return apiKey;
}
async function callOpenAiApi(url, data, apiKey) {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: DEFAULT_TIMEOUT
    };
    const response = await axios.post(url, data, config);
    return response.data;
  } catch (error) {
    console.error("Error communicating with OpenAI API:", error instanceof Error ? error.message : String(error));
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
    }
    throw new Error("Failed to communicate with OpenAI API");
  }
}
function buildRequestData(prompt, model = DEFAULT_MODEL, maxTokens = DEFAULT_MAX_TOKENS, temperature = DEFAULT_TEMPERATURE) {
  return {
    model,
    prompt,
    max_tokens: maxTokens,
    temperature
  };
}

// src/actions/generateTextAction.ts
var generateTextAction = {
  name: "generateText",
  description: "Generate text using OpenAI",
  similes: [],
  async handler(_runtime, message, _state) {
    const prompt = message.content.text?.trim() || "";
    validatePrompt(prompt);
    const apiKey = validateApiKey();
    const requestData = buildRequestData(
      String(message.content.model),
      prompt,
      typeof message.content.maxTokens === "number" ? message.content.maxTokens : void 0,
      typeof message.content.temperature === "number" ? message.content.temperature : void 0
    );
    const response = await callOpenAiApi(
      "https://api.openai.com/v1/completions",
      requestData,
      apiKey
    );
    return { text: response.choices[0].text.trim() };
  },
  validate: async (runtime, _message) => {
    return !!runtime.getSetting("OPENAI_API_KEY");
  },
  examples: []
};

// src/actions/generateEmbeddingAction.ts
var generateEmbeddingAction = {
  name: "generateEmbedding",
  description: "Generate embeddings using OpenAI",
  similes: [],
  async handler(_runtime, message, _state) {
    const input = message.content.text?.trim() || "";
    validatePrompt(input);
    const apiKey = validateApiKey();
    const requestData = buildRequestData(
      "text-embedding-ada-002",
      input
    );
    const response = await callOpenAiApi(
      "https://api.openai.com/v1/embeddings",
      requestData,
      apiKey
    );
    return response.data.map((item) => item.embedding);
  },
  validate: async (runtime, _message) => {
    return !!runtime.getSetting("OPENAI_API_KEY");
  },
  examples: []
};

// src/actions/analyzeSentimentAction.ts
var analyzeSentimentAction = {
  name: "analyzeSentiment",
  description: "Analyze sentiment using OpenAI",
  similes: [],
  // Added missing required property
  async handler(_runtime, message, _state) {
    const prompt = `Analyze the sentiment of the following text: "${message.content.text?.trim() || ""}"`;
    validatePrompt(prompt);
    const apiKey = validateApiKey();
    const requestData = buildRequestData(prompt);
    const response = await callOpenAiApi(
      "https://api.openai.com/v1/completions",
      requestData,
      apiKey
    );
    return response.choices[0].text.trim();
  },
  validate: async (runtime, _message) => {
    return !!runtime.getSetting("OPENAI_API_KEY");
  },
  examples: []
};

// src/actions/transcribeAudioAction.ts
var transcribeAudioAction = {
  name: "transcribeAudio",
  description: "Transcribe audio using OpenAI Whisper",
  similes: [],
  async handler(_runtime, message, _state) {
    const file = message.content.file;
    if (!file) {
      throw new Error("No audio file provided");
    }
    const apiKey = validateApiKey();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", "whisper-1");
    const response = await callOpenAiApi(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      apiKey
    );
    return response.text;
  },
  validate: async (runtime, _message) => {
    return !!runtime.getSetting("OPENAI_API_KEY");
  },
  examples: []
};

// src/actions/moderateContentAction.ts
var moderateContentAction = {
  name: "moderateContent",
  description: "Moderate content using OpenAI",
  similes: [],
  async handler(_runtime, message, _state) {
    const input = message.content.text?.trim() || "";
    validatePrompt(input);
    const apiKey = validateApiKey();
    const requestData = buildRequestData(
      "text-moderation-latest",
      input
    );
    const response = await callOpenAiApi(
      "https://api.openai.com/v1/moderations",
      requestData,
      apiKey
    );
    return response.results;
  },
  validate: async (runtime, _message) => {
    return !!runtime.getSetting("OPENAI_API_KEY");
  },
  examples: []
};

// src/actions/editTextAction.ts
var editTextAction = {
  name: "editText",
  description: "Edit text using OpenAI",
  similes: [],
  async handler(_runtime, message, _state) {
    const input = message.content.input?.trim() || "";
    const instruction = message.content.instruction?.trim() || "";
    validatePrompt(input);
    validatePrompt(instruction);
    const apiKey = validateApiKey();
    const requestData = {
      model: "text-davinci-edit-001",
      input,
      instruction,
      max_tokens: 1e3,
      temperature: 0.7
    };
    const response = await callOpenAiApi(
      "https://api.openai.com/v1/edits",
      requestData,
      apiKey
    );
    return response.choices[0].text.trim();
  },
  validate: async (runtime, _message) => {
    return !!runtime.getSetting("OPENAI_API_KEY");
  },
  examples: []
};

// src/index.ts
console.log("\n===============================");
console.log("      OpenAI Plugin Loaded      ");
console.log("===============================");
console.log("Name      : openai-plugin");
console.log("Version   : 0.1.0");
console.log("X Account : https://x.com/Data0x88850");
console.log("GitHub    : https://github.com/0xrubusdata");
console.log("Actions   :");
console.log("  - generateTextAction");
console.log("  - generateEmbeddingAction");
console.log("  - analyzeSentimentAction");
console.log("  - transcribeAudioAction");
console.log("  - moderateContentAction");
console.log("  - editTextAction");
console.log("===============================\n");
var openaiPlugin = {
  name: "openai",
  description: "OpenAI integration plugin for various AI capabilities",
  actions: [
    generateTextAction,
    generateEmbeddingAction,
    analyzeSentimentAction,
    transcribeAudioAction,
    moderateContentAction,
    editTextAction
  ],
  evaluators: [],
  providers: []
};
var index_default = openaiPlugin;
export {
  index_default as default,
  openaiPlugin
};
