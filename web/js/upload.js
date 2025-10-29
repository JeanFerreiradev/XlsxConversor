// js/upload.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  const fileInput = document.getElementById("arquivoBmp");
  const statusBox = document.getElementById("statusUpload");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    if (!file) {
      alert("Selecione um arquivo BMP (.xlsx) para enviar.");
      return;
    }

    // Cria o objeto FormData
    const formData = new FormData();
    formData.append("file", file);

    statusBox.innerHTML = `<p>Enviando arquivo... ⏳</p>`;

    try {
      // Faz o upload com progresso
      const result = await apiRequest(
        "/upload_bmp/",
        "POST",
        formData,
        true, // é FormData
        (pct) => {
          statusBox.innerHTML = `<p>Enviando: ${pct}%</p>`;
        }
      );

      // Exibe o resultado
      if (result.error) {
        statusBox.innerHTML = `<p style="color:red;">Erro: ${result.error}</p>`;
      } else {
        statusBox.innerHTML = `
          <p style="color:green;">Upload concluído ✅</p>
          <p>Status: <b>${result.status}</b></p>
          <p>Protocolo: <b>${result.protocol || 'Não retornado'}</b></p>
          <p>ID: ${result.id}</p>
        `;
      }
    } catch (err) {
      console.error("Erro no upload:", err);
      statusBox.innerHTML = `<p style="color:red;">Erro no upload: ${err.detail || err.message}</p>`;
    }
  });
});