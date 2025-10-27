function verificarLogin() {
  if (!localStorage.getItem("token")) {
    window.location = "index.html";
  }
}