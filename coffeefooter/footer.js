(function () {
  /* Inject font */
  const font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://0utrider.github.io/pathfinder/coffeefooter/font.css";
  document.head.appendChild(font);

  /* Inject CSS */
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "https://0utrider.github.io/pathfinder/coffeefooter/footer.css";
  document.head.appendChild(css);

  /* Create footer */
  const footer = document.createElement("footer");
  footer.id = "outrider-coffeefooter";
  footer.innerHTML = `
    <span class="footer-text">Did you find this useful?</span>

    <span class="bmc-btn-container" id="bmc-container"></span>

    <a href="https://0utrider.github.io/pathfinder/" target="_blank">
      Outrider's Pathfinder Projects
    </a>
  `;
  document.body.appendChild(footer);

  /* Inject Buy Me a Coffee widget */
  const bmc = document.createElement("script");
  bmc.type = "text/javascript";
  bmc.src = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";
  bmc.setAttribute("data-name", "bmc-button");
  bmc.setAttribute("data-slug", "outrider");
  bmc.setAttribute("data-color", "#825fc4");
  bmc.setAttribute("data-emoji", "");
  bmc.setAttribute("data-font", "Lato");
  bmc.setAttribute("data-text", "Buy me a coffee");
  bmc.setAttribute("data-outline-color", "#ffffff");
  bmc.setAttribute("data-font-color", "#ffffff");
  bmc.setAttribute("data-coffee-color", "#FFDD00");

  document.getElementById("bmc-container").appendChild(bmc);
})();