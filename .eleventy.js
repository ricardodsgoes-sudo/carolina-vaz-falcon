/* =================================================================
   Eleventy — apenas o BLOG é gerado; o site institucional é copiado
   verbatim (index.html, css, js, assets ficam intactos).
   Saída: _site/  ·  Entrada: raiz do repositório
   ================================================================= */

/** Converte valor de front matter em Date (datas YAML já vêm como Date). */
function toDate(value) {
  return value instanceof Date ? value : new Date(value);
}

module.exports = function (eleventyConfig) {
  // Só Markdown e Nunjucks são tratados como templates.
  // HTML/CSS/JS/imagens do site atual NÃO são processados — só copiados.
  eleventyConfig.setTemplateFormats(["md", "njk"]);

  // ---- Site institucional atual: cópia byte-a-byte (zero alteração) ----
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin"); // painel do CMS (estático)

  // Documentos do repositório que NÃO devem virar páginas
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("MANUTENCAO.md");

  // ---- Coleção de posts (mais recentes primeiro, sem rascunhos) ----
  eleventyConfig.addCollection("posts", function (api) {
    return api
      .getFilteredByGlob("blog/posts/*.md")
      .filter(function (post) { return !post.data.draft; })
      .sort(function (a, b) { return toDate(b.date) - toDate(a.date); });
  });

  // ---- Filtros de data (pt-BR) ----
  eleventyConfig.addFilter("dataPt", function (value) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit", month: "long", year: "numeric", timeZone: "UTC"
    }).format(toDate(value));
  });
  eleventyConfig.addFilter("isoData", function (value) {
    return toDate(value).toISOString();
  });

  return {
    dir: { input: ".", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
