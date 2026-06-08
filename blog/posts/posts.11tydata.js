// Dados aplicados a todos os posts em blog/posts/
module.exports = {
  layout: "post.njk",
  // Rascunhos (draft: true) NÃO geram página (permalink false) — ficam invisíveis no site,
  // acessíveis só pelo painel /admin. Posts normais vão para /blog/<slug>/.
  eleventyComputed: {
    permalink: (data) => (data.draft ? false : `/blog/${data.page.fileSlug}/`)
  }
};
