const DEFAULT_YOUR_LANGUAGE = "Portuguese";
const DEFAULT_CONTACT_LANGUAGE = "English";
const yourLanguageSelect = document.getElementById("your-language");
const contactLanguageSelect = document.getElementById("contact-language");
const translationEnabledInput = document.getElementById("translation-enabled");
const saveButton = document.getElementById("save");
const statusText = document.getElementById("status");

document.addEventListener("DOMContentLoaded", restoreSettings);
saveButton.addEventListener("click", saveSettings);

async function restoreSettings() {
  const {
    targetLanguage,
    yourLanguage,
    contactLanguage,
    translationEnabled
  } = await chrome.storage.sync.get({
    targetLanguage: DEFAULT_CONTACT_LANGUAGE,
    yourLanguage: DEFAULT_YOUR_LANGUAGE,
    contactLanguage: DEFAULT_CONTACT_LANGUAGE,
    translationEnabled: true
  });

  yourLanguageSelect.value = yourLanguage || DEFAULT_YOUR_LANGUAGE;
  contactLanguageSelect.value = contactLanguage || targetLanguage || DEFAULT_CONTACT_LANGUAGE;
  translationEnabledInput.checked = Boolean(translationEnabled);
}

async function saveSettings() {
  const yourLanguage = yourLanguageSelect.value || DEFAULT_YOUR_LANGUAGE;
  const contactLanguage = contactLanguageSelect.value || DEFAULT_CONTACT_LANGUAGE;
  const translationEnabled = translationEnabledInput.checked;

  await chrome.storage.sync.set({
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
