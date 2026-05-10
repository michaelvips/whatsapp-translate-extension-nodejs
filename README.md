# Tradutor para WhatsApp Web

Extensao do Chrome que traduz o rascunho atual da mensagem no WhatsApp Web antes do envio.
Ela usa um fluxo baseado na area de transferencia para que voce possa revisar o texto traduzido antes de enviar.

## Instalacao

1. Instale as dependencias com `npm install`.
2. Gere o background empacotado com `npm run build`.
3. Abra o Chrome e acesse `chrome://extensions`.
4. Ative o **Modo do desenvolvedor**.
5. Clique em **Carregar sem compactacao**.
6. Selecione esta pasta do projeto.
7. Abra o popup da extensao.
8. Escolha seu idioma, escolha o idioma do contato e ative a traducao.
9. Abra ou recarregue `https://web.whatsapp.com`.

## Desenvolvimento

Depois de alterar `src/background.js`, rode `npm run build` novamente para atualizar `dist/background.js`.

## Como usar

1. Digite uma mensagem no WhatsApp Web.
2. Pressione `Alt + T`.
3. A extensao copia o texto traduzido para a area de transferencia.
4. A extensao limpa o campo da mensagem quando o WhatsApp permite.
5. Pressione `Ctrl + V` no campo da mensagem.
6. Revise o texto e envie manualmente.

A extensao nao envia mensagens automaticamente.
Ela nao usa APIs internas de envio do WhatsApp Web.

## Configuracoes

- **Seu Idioma** define o idioma em que voce normalmente escreve.
- **Idioma do Contato** define o idioma usado para traduzir o rascunho.
- **Ativar Traducao** ativa ou pausa o atalho `Alt + T`.

## Traducao

A extensao usa `@vitalets/google-translate-api` empacotado no background script. Essa biblioteca usa um endpoint nao oficial do Google Translate, entao pode haver limite de requisicoes ou mudancas futuras no servico.
