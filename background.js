import {
  DEFAULT_CONTACT_LANGUAGE,
  DEFAULT_YOUR_LANGUAGE,
  getLanguageCode
} from "./src/languages.js";

const DEFAULT_PROVIDER = "openai";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== "TRANSLATE_TEXT") {
    return false;
  }

  translateMessage(message.text)
    .then((translatedText) => {
      sendResponse({ ok: true, translatedText });
    })
    .catch((error) => {
      sendResponse({
        ok: false,
        error: getFriendlyTranslationError(error)
      });
    });

  return true;
});

async function translateMessage(text) {
  const normalizedText = String(text || "").trim();
  if (!normalizedText) {
    throw new Error("EMPTY_TEXT");
  }

  const settings = await chrome.storage.sync.get({
    provider: DEFAULT_PROVIDER,
    openaiApiKey: "",
    openaiModel: DEFAULT_OPENAI_MODEL,
    googleApiKey: "",
    targetLanguage: DEFAULT_CONTACT_LANGUAGE,
    yourLanguage: DEFAULT_YOUR_LANGUAGE,
    contactLanguage: DEFAULT_CONTACT_LANGUAGE
  });

  const sourceLanguage = getLanguageCode(settings.yourLanguage, DEFAULT_YOUR_LANGUAGE);
  const targetLanguage = getLanguageCode(
    settings.contactLanguage || settings.targetLanguage,
    DEFAULT_CONTACT_LANGUAGE
  );

  if (settings.provider === "google") {
    return translateWithGoogle({
      text: normalizedText,
      sourceLanguage,
      targetLanguage,
      apiKey: settings.googleApiKey
    });
  }

  return translateWithOpenAI({
    text: normalizedText,
    sourceLanguage,
    targetLanguage,
    apiKey: settings.openaiApiKey,
    model: settings.openaiModel || DEFAULT_OPENAI_MODEL
  });
}

async function translateWithOpenAI({ text, sourceLanguage, targetLanguage, apiKey, model }) {
  if (!apiKey) {
    throw new Error("MISSING_OPENAI_KEY");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      instructions: "Translate the user's message. Return only the translated text, with no quotes or explanations.",
      input: `Translate from ${sourceLanguage} to ${targetLanguage}:\n\n${text}`
    })
  });

  const data = await readJsonResponse(response);
  const translatedText = extractOpenAIText(data);
  if (!translatedText) {
    throw new Error("EMPTY_TRANSLATION");
  }

  return translatedText;
}

async function translateWithGoogle({ text, sourceLanguage, targetLanguage, apiKey }) {
  if (!apiKey) {
    throw new Error("MISSING_GOOGLE_KEY");
  }

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: "text"
      })
    }
  );

  const data = await readJsonResponse(response);
  const translatedText = String(data?.data?.translations?.[0]?.translatedText || "").trim();
  if (!translatedText) {
    throw new Error("EMPTY_TRANSLATION");
  }

  return decodeHtmlEntities(translatedText);
}

async function readJsonResponse(response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.error?.message || `${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return data;
}

function extractOpenAIText(data) {
  if (typeof data?.output_text === "string") {
    return data.output_text.trim();
  }

  const textParts = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === "output_text" && content?.text) {
        textParts.push(content.text);
      }
    }
  }

  return textParts.join("").trim();
}

function decodeHtmlEntities(text) {
  const namedEntities = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: "\"",
    apos: "'",
    nbsp: " "
  };

  return String(text).replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, value) => {
    const normalizedValue = value.toLowerCase();
    if (normalizedValue[0] === "#") {
      const codePoint = normalizedValue[1] === "x"
        ? Number.parseInt(normalizedValue.slice(2), 16)
        : Number.parseInt(normalizedValue.slice(1), 10);

      return Number.isFinite(codePoint) && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : entity;
    }

    return namedEntities[normalizedValue] || entity;
  });
}

function getFriendlyTranslationError(error) {
  const message = error instanceof Error ? error.message : String(error || "");
  const lowerMessage = message.toLowerCase();

  if (message === "EMPTY_TEXT") {
    return "Digite uma mensagem antes de traduzir.";
  }

  if (message === "EMPTY_TRANSLATION") {
    return "O tradutor não retornou texto. Tente reformular a mensagem.";
  }

  if (message === "MISSING_OPENAI_KEY") {
    return "Informe sua chave da OpenAI no popup da extensão.";
  }

  if (message === "MISSING_GOOGLE_KEY") {
    return "Informe sua chave da Google Cloud Translation no popup da extensão.";
  }

  if (lowerMessage.includes("failed to fetch") || lowerMessage.includes("networkerror")) {
    return "Não consegui acessar o serviço de tradução. Verifique sua conexão.";
  }

  if (lowerMessage.includes("incorrect api key") || lowerMessage.includes("invalid api key")) {
    return "A chave de API parece inválida. Confira a chave salva no popup.";
  }

  if (lowerMessage.includes("quota") || lowerMessage.includes("billing")) {
    return "A API recusou a tradução por limite, cota ou cobrança. Verifique sua conta.";
  }

  if (lowerMessage.includes("too many requests") || lowerMessage.includes("429")) {
    return "O serviço de tradução limitou as tentativas. Aguarde um pouco e tente novamente.";
  }

  if (lowerMessage.includes("403") || lowerMessage.includes("blocked")) {
    return "O serviço de tradução bloqueou a solicitação no momento. Confira permissões e chave da API.";
  }

  return "Falha ao traduzir. Tente novamente em alguns instantes.";
}
