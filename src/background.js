import { translate } from "@vitalets/google-translate-api";
import {
  DEFAULT_CONTACT_LANGUAGE,
  DEFAULT_YOUR_LANGUAGE,
  getLanguageCode
} from "./languages.js";

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

  const {
    targetLanguage,
    yourLanguage,
    contactLanguage
  } = await chrome.storage.sync.get({
    targetLanguage: DEFAULT_CONTACT_LANGUAGE,
    yourLanguage: DEFAULT_YOUR_LANGUAGE,
    contactLanguage: DEFAULT_CONTACT_LANGUAGE
  });

  const sourceLanguage = getLanguageCode(yourLanguage, DEFAULT_YOUR_LANGUAGE);
  const language = getLanguageCode(contactLanguage || targetLanguage, DEFAULT_CONTACT_LANGUAGE);
  const result = await translate(normalizedText, {
    from: sourceLanguage,
    to: language
  });

  const translatedText = String(result?.text || "").trim();
  if (!translatedText) {
    throw new Error("EMPTY_TRANSLATION");
  }

  return translatedText;
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

  if (lowerMessage.includes("failed to fetch") || lowerMessage.includes("networkerror")) {
    return "Não consegui acessar o serviço de tradução. Verifique sua conexão.";
  }

  if (lowerMessage.includes("too many requests") || lowerMessage.includes("429")) {
    return "O serviço de tradução limitou as tentativas. Aguarde um pouco e tente novamente.";
  }

  if (lowerMessage.includes("403") || lowerMessage.includes("blocked")) {
    return "O serviço de tradução bloqueou a solicitação no momento. Tente novamente mais tarde.";
  }

  return "Falha ao traduzir. Tente novamente em alguns instantes.";
}
