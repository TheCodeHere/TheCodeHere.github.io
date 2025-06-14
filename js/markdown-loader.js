const urlParams = new URLSearchParams(window.location.search);
const postFile = urlParams.get('post');

fetch(`posts/${postFile}.markdown`)
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return res.text();
  })
  .then(data => {
    const match = data.match(/^---([\s\S]+?)---([\s\S]*)$/);
    if (!match) throw new Error("Front matter no encontrado o malformado.");

    const rawMeta = match[1].trim();
    const content = match[2].trim();

    const meta = {};
    rawMeta.split('\n').forEach(line => {
      const [key, val] = line.split(/:\s+(.*)/);
      if (!key || !val) return;
      if (val.startsWith('[')) {
        try {
          meta[key] = JSON.parse(val);
        } catch (e) {
          console.error(`Error al parsear lista YAML: ${val}`);
        }
      } else {
        meta[key] = val.replace(/^"|"$/g, '');
      }
    });

    let html = `
      <h1>${meta.title}</h1>
      <div class="post-meta">
        <img src="flags/${meta.country}.png" style="width:16px;vertical-align:middle;">
        ${meta.date} · ${meta.tags.map(t => `<span>${t}</span>`).join(', ')}
      </div>
      <p><em>${meta.excerpt}</em></p>
    `;
    html += marked.parse(content);

    document.getElementById('post-content').innerHTML = html;
    renderMathInElement(document.getElementById('post-content'));
  })
  .catch(err => {
    document.getElementById('post-content').innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    console.error(err);
  });