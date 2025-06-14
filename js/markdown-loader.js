// Get post name from URL, e.g., ?post=vae-intro
const urlParams = new URLSearchParams(window.location.search);
const postFile = urlParams.get('post');

fetch(`posts/${postFile}.markdown`)
  .then(res => res.text())
  .then(data => {
    // Separar front matter YAML del contenido
    const match = data.match(/^---([\s\S]+?)---([\s\S]*)$/);
    if (!match) throw new Error("Invalid markdown front matter format");

    const rawMeta = match[1].trim();
    const content = match[2].trim();

    // Parse YAML front matter (simple parser)
    const meta = {};
    rawMeta.split('\n').forEach(line => {
      const [key, val] = line.split(/:\s+(.*)/);
      if (!key || !val) return;
      if (val.startsWith('[')) {
        meta[key] = JSON.parse(val);
      } else {
        meta[key] = val.replace(/^"|"$/g, '');
      }
    });

    // Construir HTML
    let html = `
      <h1>${meta.title}</h1>
      <div class="post-meta">
        <img src="flags/${meta.country}.png" alt="${meta.country}" style="width:16px;vertical-align:middle;margin-right:4px;">
        ${meta.date} · ${meta.tags.map(t => `<span class="tag">${t}</span>`).join(', ')}
      </div>
      <p><em>${meta.excerpt}</em></p>
    `;

    html += marked.parse(content);

    document.getElementById('post-content').innerHTML = html;
    renderMathInElement(document.getElementById('post-content'));
  })
  .catch(err => {
    document.getElementById('post-content').innerHTML = "<p>Error al cargar el post.</p>";
    console.error(err);
  });
