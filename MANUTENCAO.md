# Manutenção — Site + Blog · Carolina Vaz Falcon

Documento de referência (runbook) do que foi construído: site institucional **estático**
+ **blog** gerado por Eleventy + **CMS** Sveltia. **Sem WordPress, sem banco de dados, sem servidor.**
Conteúdo = arquivos Markdown versionados no Git. Publicar = `git push` → a Cloudflare Pages builda e publica.

> Este arquivo **não** é publicado no site (o Eleventy o ignora), mas fica versionado no repositório.

---

## 1. Endereços e contas (inventário)

| O quê | Onde |
|---|---|
| Site (produção) | https://carolina-vaz-falcon.pages.dev |
| Repositório (código + conteúdo) | github.com/ricardodsgoes-sudo/carolina-vaz-falcon · branch de produção: **main** |
| Hospedagem + build | Cloudflare **Pages** → projeto `carolina-vaz-falcon` |
| Painel de conteúdo (CMS) | `<site>/admin` |
| Worker de login do CMS | https://sveltia-cms-auth.ricardo-ds-goes.workers.dev (Cloudflare **Worker**) |
| GitHub OAuth App | "Carolina Vaz Falcon — CMS" → github.com/settings/developers |

---

## 2. Stack técnica

- **Eleventy 3** (gerador de site estático). Requer **Node 18+**.
- **Templates:** Nunjucks (`_includes/`). **Posts:** Markdown (`blog/posts/`).
- **Estilo:** `css/style.css` (tokens + site institucional) + `css/blog.css` (só o blog). Fontes
  **Cormorant Garamond** + **Jost** (Google Fonts).
- **Animação:** GSAP + ScrollTrigger + Lenis (via CDN).
- **CMS:** **Sveltia** (git-based) em `/admin`.

O site institucional (`index.html`, `css`, `js`, `assets`) é **copiado intacto** pelo build — o Eleventy
**só gera o blog**. Ou seja, a home não depende do Eleventy para nada.

---

## 3. Estrutura de arquivos

```
02-site/
├── index.html              # Home (site institucional) — copiada verbatim no build
├── css/
│   ├── style.css           # Tokens (:root) + estilos do site
│   └── blog.css            # Estilos só do blog (herda os tokens do style.css)
├── js/main.js              # Animações/navbar do site (usado também no blog)
├── assets/images/          # Imagens; blog usa assets/images/blog/
│
├── blog/
│   ├── index.njk           # Página /blog/ (listagem dos posts)
│   └── posts/
│       ├── posts.11tydata.json   # Define layout + URL (/blog/<slug>/) dos posts
│       └── *.md             # 1 arquivo = 1 post (escritos pelo CMS ou à mão)
├── _includes/
│   ├── base.njk            # Layout base (header + footer + <head>/SEO)
│   └── post.njk            # Layout do post (artigo + JSON-LD)
├── _data/site.json         # Dados globais (nome, CRP, WhatsApp, etc.)
│
├── admin/
│   ├── index.html          # Carrega o Sveltia CMS
│   └── config.yml          # Config do CMS (backend, campos, etc.)
│
├── .eleventy.js            # Config do build (passthrough + geração do blog)
├── package.json            # Dependência: @11ty/eleventy
├── MANUTENCAO.md           # ESTE arquivo
└── _site/                  # Saída do build (gerada; NÃO versionar)
```

---

## 4. Como o site é publicado (deploy)

A Cloudflare Pages está conectada ao GitHub:

- **Push na `main`** → build de **produção** → publica em `carolina-vaz-falcon.pages.dev`.
- **Push em qualquer outra branch** → **preview** (URL própria, ex.: `feature-blog.carolina-vaz-falcon.pages.dev`).

**Configuração de build** (em Settings → Build, nos ambientes **Produção** e **Pré-produção**):

| Campo | Valor |
|---|---|
| Comando da build | `npm run build` |
| Diretório de saída | `_site` |
| Predefinição de framework | Nenhum / None |
| Versão do sistema de build | Versão 3 |

---

## 5. Publicar / editar posts (fluxo da Carolina)

1. Acessar **`<site>/admin`** → **“Sign In with GitHub”** (login só na 1ª vez).
2. Abrir a coleção **“Blog”** → **“New”** (novo) ou clicar num post para editar.
3. Preencher: **Título**, **Data**, **Resumo** (texto do Google/cards), **Imagem de capa**, **Conteúdo**.
4. Deixar **“Rascunho” DESLIGADO** para publicar (ligado = salvo, mas não vai pro ar).
5. **Publicar / Salvar** → o CMS faz um commit no GitHub → a Cloudflare publica em ~1–2 min.

**Regras de conteúdo (Código de Ética do Psicólogo / CFP):** sem depoimentos de pacientes, sem promessa
de cura/resultado, CRP sempre visível.

**Quem pode editar:** apenas **colaboradores do repositório** no GitHub. Para dar acesso à Carolina:
convidá-la como colaboradora do repo e ela loga no `/admin` com a conta dela.

---

## 6. Login do CMS — como funciona

```
Navegador (/admin, Sveltia)  →  Worker sveltia-cms-auth  →  GitHub (OAuth)  →  token  →  commits no repo
```

- **Worker** `sveltia-cms-auth` (Cloudflare) — variáveis (em Settings → Variables and Secrets):
  - `GITHUB_CLIENT_ID` (texto)
  - `GITHUB_CLIENT_SECRET` (**secret** 🔒 — fica **só** aqui, nunca no repositório)
  - `ALLOWED_DOMAINS` = `carolina-vaz-falcon.pages.dev,*.carolina-vaz-falcon.pages.dev`
- **GitHub OAuth App** — callback: `https://sveltia-cms-auth.ricardo-ds-goes.workers.dev/callback`
- **`admin/config.yml`** — `backend: github`, `repo`, `branch`, `base_url` = URL do Worker.

> Por que existe o Worker: o navegador não pode guardar o segredo do GitHub com segurança. O Worker faz
> essa troca. Custo zero, sem servidor para manter.

---

## 7. Rodar localmente (desenvolvimento)

```bash
npm install        # 1ª vez
npm run dev        # servidor local com reload (abre em http://localhost:8080)
npm run build      # gera o site em _site/
```

**Editar conteúdo localmente pelo painel (sem GitHub):** o `config.yml` tem `local_backend: true`.
No **Chrome**, abra `http://localhost:8080/admin/` → **“Work with Local Repository”** → selecione a pasta
do repositório (a que contém a `.git`, ou seja, `02-site`). Os posts são gravados direto nos arquivos locais.

---

## 8. Tarefas comuns de manutenção

| Quero… | Onde mexer |
|---|---|
| Adicionar/editar post | Pelo `/admin` (recomendado). Ou manual: criar `blog/posts/<slug>.md` com front matter (`title`, `date`, `description`, `cover`, `draft`). |
| Trocar/adicionar imagem do blog | `assets/images/blog/` |
| Mudar cores ou tipografia | `css/style.css` → bloco `:root` (variáveis) |
| Editar header/footer do blog | `_includes/base.njk` ⚠️ (ver aviso de duplicação abaixo) |
| Mudar a listagem do blog | `blog/index.njk` |
| Mudar o layout do post | `_includes/post.njk` |
| Adicionar campo no editor do CMS | `admin/config.yml` (lista `fields`) + renderizar no layout se for exibir |
| Trocar de domínio | Atualizar `ALLOWED_DOMAINS` (Worker), Homepage/callback (OAuth App) e, se usar URL absoluta, `_data/site.json` |

> ⚠️ **Duplicação header/footer:** o header e o footer do blog (`_includes/base.njk`) são uma **cópia** dos
> do `index.html`. Se alterar um, altere o outro para manter a consistência. (Refatorar para um partial
> compartilhado é uma melhoria futura possível.)

---

## 9. Pendências e pontos de atenção (estado atual)

- ⚠️ **`admin/config.yml` está com `branch: feature/blog`** (TEMPORÁRIO, para ensaio no preview).
  **Ao fazer o merge para produção, voltar para `branch: main`.**
- ⚠️ **A home ainda não tem link “Blog” no menu** (Fase 2 — edição de 1 linha no `index.html`).
  O blog é acessível por `/blog/`.
- ⚠️ **Posts de teste do ensaio** (ex.: `blog/posts/titulo-teste.md`) devem ser **apagados antes/na hora
  do merge** para não irem ao ar. Apague pelo `/admin` ou removendo o arquivo `.md`.
- O post `cuidar-da-saude-emocional-no-dia-a-dia.md` é **exemplo/placeholder**. Textos das fases, dos 4
  pilares e do FAQ estão marcados **“a validar”** com a cliente.

---

## 10. Resolução de problemas (checklist)

**Build falhou na Cloudflare** → abrir o deploy → **Log de build**. Conferir: `package.json` presente na
branch; comando `npm run build`; saída `_site`; Versão do sistema de build = 3.

**Login do `/admin` falha** → callback da OAuth App = `<worker>/callback`? Nomes das variáveis do Worker
**exatos** (MAIÚSCULAS, `_`)? `ALLOWED_DOMAINS` inclui o domínio que você está acessando? `base_url` no
`config.yml` correto? Logado no GitHub no mesmo navegador?

**“This collection has no entries yet”** → a `branch` no `config.yml` aponta para onde os posts realmente
estão? (Ex.: posts na `feature/blog`, mas config lendo `main`.)

**Post não aparece no `/blog/`** → “Rascunho” está desligado? A data não está no futuro? O build já
terminou (~1 min)?

---

## 11. Reverter o blog (se algum dia precisar)

O blog é **aditivo** e não altera a home. Para remover do ar: `git revert` do(s) commit(s) do blog **ou**
voltar a configuração de build da Cloudflare para preset **None** / saída `/`. O código e o conteúdo
continuam no histórico do Git.
