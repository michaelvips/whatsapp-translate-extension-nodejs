# WhatsApp Web Translator

Extensao do Chrome que traduz o rascunho atual da mensagem no WhatsApp Web antes do envio.
Ela tenta aplicar a traducao direto no campo e usa a area de transferencia como fallback.

<img src="docs/popup-screenshot.png" alt="Popup da extensao WhatsApp Translator">

## Instalacao

1. Abra o Chrome e acesse `chrome://extensions`.
2. Ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactacao**.
4. Selecione esta pasta do projeto.
5. Abra o popup da extensao.
6. Escolha OpenAI ou Google Cloud Translation.
7. Informe a chave de API do provedor escolhido.
8. Escolha seu idioma, escolha o idioma do contato e ative a traducao.
9. Abra ou recarregue `https://web.whatsapp.com`.

## Como usar

1. Digite uma mensagem no WhatsApp Web.
2. Pressione `Alt + T`.
3. A extensao tenta substituir o rascunho pela traducao diretamente no campo.
4. Se o WhatsApp bloquear a substituicao direta, a traducao sera copiada para a area de transferencia.
5. Revise o texto e envie manualmente.

A extensao nao envia mensagens automaticamente.
Ela nao usa APIs internas de envio do WhatsApp Web.

## Configuracoes

- **Tradutor** escolhe entre OpenAI e Google Cloud Translation.
- **Chave OpenAI** e **Chave Google API** salvam a chave usada pelo provedor escolhido.
- **Modelo OpenAI** define o modelo usado quando o tradutor for OpenAI.
- **Seu Idioma** define o idioma em que voce normalmente escreve.
- **Idioma do Contato** define o idioma usado para traduzir o rascunho.
- **Ativar Traducao** ativa ou pausa o atalho `Alt + T`.

## Traducao

A extensao nao usa Node.js, build ou dependencias externas. Ela chama diretamente a API oficial da OpenAI ou a API oficial Google Cloud Translation pelo `background.js` da extensao.
