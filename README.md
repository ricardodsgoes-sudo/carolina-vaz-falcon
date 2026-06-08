# Carolina Vaz Falcon — Psicóloga

Site institucional da psicóloga clínica **Carolina Vaz N. S. Falcon** (CRP 09/20609)
— atendimento presencial em Aparecida de Goiânia/GO e online.

Site estático, sem etapa de build: **HTML + CSS + JavaScript vanilla**.

## Estrutura

```
.
├── index.html        ← página única
├── css/style.css     ← estilos (CSS custom properties, mobile-first)
├── js/main.js        ← animações e interatividade
└── assets/images/    ← imagens, ícones e SVGs
```

## Rodar localmente

Basta abrir `index.html` no navegador. Para servir via HTTP local:

```bash
python -m http.server 8000
# acesse http://localhost:8000
```

## Deploy na Cloudflare Pages

Como o site não tem build, a configuração é mínima:

1. No painel da Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Selecione este repositório.
3. Configurações de build:
   - **Framework preset:** `None`
   - **Build command:** *(deixe em branco)*
   - **Build output directory:** `/`
4. **Save and Deploy**.

A cada `git push` na branch `main`, a Cloudflare publica automaticamente.
