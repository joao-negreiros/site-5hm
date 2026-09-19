# 5HM Telecom

Site institucional em HTML/CSS/JS puro, página única (`index.html`), sem dependências de build.

## Como visualizar

```bash
python -m http.server 8000
```

e acesse `http://localhost:8000`.

## Estrutura

```
index.html      → Página principal (copy, SVG sprite de ícones, preloader)
css/styles.css  → Tokens, componentes, seções e responsivo
js/main.js      → Preloader, globo em canvas, carrossel, reveal, contadores
assets/         → Logo e referência de layout
```

## Pontos de edição

- WhatsApp: buscar `5541992806732` no `index.html`.
- Planos e preços: seção `#planos`.
- Lojas de aplicativos (Google Play / App Store): hoje sem link, ver comentário na seção `#contato`.
- Cores da marca: variáveis no topo de `css/styles.css`.
