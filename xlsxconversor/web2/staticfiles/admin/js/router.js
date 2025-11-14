function loadPage(page) {
  fetch(`../templates/web_interface/${page}`)
    .then(response => {
      if (!response.ok) throw new Error(`Erro ao carregar ${page}`);
      return response.text();
    })
    .then(html => {
      const container = document.getElementById("main-content");
      container.innerHTML = html;

      // executa scripts externos
      container.querySelectorAll("script[src]").forEach(script => {
        const newScript = document.createElement("script");
        newScript.src = script.src;
        document.body.appendChild(newScript);
      });
      window.history.pushState({ page }, "", `#${page}`);
    })
    .catch(err => {
      document.getElementById("main-content").innerHTML =
        `<div class="alert alert-danger">Erro ao carregar a página: ${err.message}</div>`;
    });
}

// Voltar/navegar no histórico sem recarregar
window.onpopstate = (e) => {
  if (e.state?.page) loadPage(e.state.page);
};

// Carrega dashboard por padrão
window.addEventListener("load", () => {
  const page = location.hash.replace("#", "") || "dashboard.html";
  loadPage(page);
});