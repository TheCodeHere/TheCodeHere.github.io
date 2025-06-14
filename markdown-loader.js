// Extrae el parámetro 'post' de la URL
const urlParams = new URLSearchParams(window.location.search);
const postFile = urlParams.get('post');

const contentContainer = document.getElementById('post-content');

if (!contentContainer) {
  console.error("Elemento con ID 'post-content' no encontrado en el DOM.");
  alert("Error crítico: no se encontró el contenedor de contenido.");
} else if (!postFile) {
  contentContainer.innerHTML = "<p style='color:red;'>No se especificó ningún post en la URL.</p>";
  console.warn("Falta el parámetro ?post= en la URL.");
} else {
  // Intenta cargar el archivo markdown
  fetch(`./posts/${postFile}.markdown`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} — ${response.statusText}`);
      }
      return response.text();
    })
    .then(text => {
      // Separa front matter y contenido markdown
      const match = text.match(/^---([\s\S]+?)---([\s\S]*)$/);
      if (!match) {
        throw new Error("El archivo markdown no contiene front matter válido (--- delimitadores).");
      }

      const rawMeta = match[1].trim();
      const rawContent = match[2].trim();
      const meta = {};

      rawMeta.split('\n').forEach(line => {
        const [key, ...rest] = line.split(':');
        const value = rest.join(':').trim();

        // Detecta listas tipo YAML como [tag1, tag2]
        if (value.startsWith('[') && value.endsWith(']')) {
          try {
            meta[key.trim()] = JSON.parse(value);
          } catch (e) {
            console.warn(`No se pudo parsear la lista de etiquetas en front matter: "${value}"`);
            meta[key.trim()] = value;
          }
        } else {
          meta[key.trim()] = value.replace(/^"|"$/g, '').trim();
        }
      });

      console.log("Metadatos extraídos:", meta);

      // Genera HTML con los metadatos
      let html = `<h1>${meta.title || "Sin título"}</h1>`;

      if (meta.cover_image) {
        html += `<img src="${meta.cover_image}" alt="Cover Image" style="max-width:100%;margin-bottom:1rem;">`;
      }

      html += `<div class="post-meta">`;

      if (meta.country) {
        html += `<img src="flags/${meta.country}.png" alt="${meta.country}" style="width:16px;vertical-align:middle;margin-right:0.5em;">`;
      }

      html += `${meta.date || "Fecha desconocida"}`;

      if (meta.tags && Array.isArray(meta.tags)) {
        html += ` · <span class="tags">${meta.tags.map(t => `<a href="tags.html?tag=${encodeURIComponent(t)}">${t}</a>`).join(', ')}</span>`;
      }

      html += `</div>`;

      if (meta.excerpt) {
        html += `<p class="excerpt">${meta.excerpt}</p>`;
      }

      // Agrega el contenido del post (convertido desde markdown)
      html += marked.parse(rawContent);

      // Inserta el HTML resultante en la página
      contentContainer.innerHTML = html;

      // Renderiza matemáticas si KaTeX está cargado
      if (typeof renderMathInElement === 'function') {
        renderMathInElement(contentContainer, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false }
          ]
        });
      }
    })
    .catch(err => {
      contentContainer.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
      console.error("Error al cargar el post:", err);
    });
}