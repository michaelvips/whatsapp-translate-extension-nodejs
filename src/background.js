import { translate } from "@vitalets/google-translate-api";

const DEFAULT_CONTACT_LANGUAGE = "English";
const DEFAULT_YOUR_LANGUAGE = "Portuguese";
const LANGUAGE_CODES = {
  "Portuguese": "pt",
  "English": "en",
  "Spanish": "es",
  "French": "fr",
  "German": "de",
  "Italian": "it",
  "Japanese": "ja",
  "Korean": "ko",
  "Mandarin Chinese": "zh-CN",
  "Arabic": "ar"
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== "TRANSLATE_TEXT") {
    return false;
  }

  translateMessage(message.text)
    .then((translatedText) => {
      sendResponse({ ok: true, translatedText });
    })
    .catch(() => {
      sendResponse({
        ok: false,
        error: "Falha ao traduzir. Tente novamente."
      });
    });

  return true;
});

async function translateMessage(text) {
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
  const result = await translate(String(text || ""), {
    from: sourceLanguage,
    to: language
  });

  const translatedText = String(result?.text || "").trim();
  if (!translatedText) {
    throw new Error("Empty translation.");
  }

  return translatedText;
}

function getLanguageCode(language, fallbackLanguage) {
  const candidate = String(language || "").trim();
  return LANGUAGE_CODES[candidate] || LANGUAGE_CODES[fallbackLanguage];
}
