import {
  DEFAULT_CONTACT_LANGUAGE,
  DEFAULT_YOUR_LANGUAGE,
  LANGUAGES
} from "./src/languages.js";

const yourLanguageSelect = document.getElementById("your-language");
const contactLanguageSelect = document.getElementById("contact-language");
const providerSelect = document.getElementById("provider");
const openaiSettings = document.getElementById("openai-settings");
const googleSettings = document.getElementById("google-settings");
const openaiApiKeyInput = document.getElementById("openai-api-key");
const openaiModelInput = document.getElementById("openai-model");
const googleApiKeyInput = document.getElementById("google-api-key");
const translationEnabledInput = document.getElementById("translation-enabled");
const saveButton = document.getElementById("save");
const statusText = document.getElementById("status");

document.addEventListener("DOMContentLoaded", initializePopup);
providerSelect.addEventListener("change", updateProviderFields);
saveButton.addEventListener("click", saveSettings);

const DEFAULT_PROVIDER = "openai";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

async function initializePopup() {
  fillLanguageSelect(yourLanguageSelect, DEFAULT_YOUR_LANGUAGE);
  fillLanguageSelect(contactLanguageSelect, DEFAULT_CONTACT_LANGUAGE);
  await restoreSettings();
}

function fillLanguageSelect(select, preferredLanguage) {
  const sortedLanguages = [
    ...LANGUAGES.filter(({ value }) => value === preferredLanguage),
    ...LANGUAGES.filter(({ value }) => value !== preferredLanguage)
  ];

  select.replaceChildren(...sortedLanguages.map((language) => {
    const option = document.createElement("option");
    option.value = language.value;
    option.textContent = language.label;
    return option;
  }));
}

async function restoreSettings() {
  const {
    targetLanguage,
    yourLanguage,
    contactLanguage,
    translationEnabled,
    provider,
    openaiApiKey,
    openaiModel,
    googleApiKey
  } = await chrome.storage.sync.get({
    targetLanguage: DEFAULT_CONTACT_LANGUAGE,
    yourLanguage: DEFAULT_YOUR_LANGUAGE,
    contactLanguage: DEFAULT_CONTACT_LANGUAGE,
    translationEnabled: true,
    provider: DEFAULT_PROVIDER,
    openaiApiKey: "",
    openaiModel: DEFAULT_OPENAI_MODEL,
    googleApiKey: ""
  });

  providerSelect.value = provider || DEFAULT_PROVIDER;
  openaiApiKeyInput.value = openaiApiKey || "";
  openaiModelInput.value = openaiModel || DEFAULT_OPENAI_MODEL;
  googleApiKeyInput.value = googleApiKey || "";
  yourLanguageSelect.value = yourLanguage || DEFAULT_YOUR_LANGUAGE;
  contactLanguageSelect.value = contactLanguage || targetLanguage || DEFAULT_CONTACT_LANGUAGE;
  translationEnabledInput.checked = Boolean(translationEnabled);
  updateProviderFields();
}

async function saveSettings() {
  const provider = providerSelect.value || DEFAULT_PROVIDER;
  const yourLanguage = yourLanguageSelect.value || DEFAULT_YOUR_LANGUAGE;
  const contactLanguage = contactLanguageSelect.value || DEFAULT_CONTACT_LANGUAGE;
  const translationEnabled = translationEnabledInput.checked;

  await chrome.storage.sync.set({
    provider,
    openaiApiKey: openaiApiKeyInput.value.trim(),
    openaiModel: openaiModelInput.value.trim() || DEFAULT_OPENAI_MODEL,
    googleApiKey: googleApiKeyInput.value.trim(),
    targetLanguage: contactLanguage,
    yourLanguage,
    contactLanguage,
    translationEnabled
  });

  statusText.textContent = "Configurações salvas.";
  window.setTimeout(() => {
    statusText.textContent = "";
  }, 2200);
}

function updateProviderFields() {
  const useGoogle = providerSelect.value === "google";
  openaiSettings.hidden = useGoogle;
  googleSettings.hidden = !useGoogle;
}
