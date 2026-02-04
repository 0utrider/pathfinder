document.addEventListener("DOMContentLoaded", () => {

  /* Determine mode */
  const currentScript = document.currentScript;
  const mode = currentScript?.getAttribute("data-mode") || "full";

  /* Inject font.css */
  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href = "https://0utrider.github.io/pathfinder/coffeefooter/font.css";
  document.head.appendChild(fontLink);

  /* Inject footer.css and wait for it to load */
  const cssLink = document.createElement("link");
  cssLink.rel = "stylesheet";
  cssLink.href = "https://0utrider.github.io/pathfinder/coffeefooter/footer.css";

  cssLink.onload = () => {
    buildFooter(mode);
  };

  document.head.appendChild(cssLink);
});


function buildFooter(mode) {

  /* Remove any existing footer */
  const existing = document.getElementById("outrider-coffeefooter");
  if (existing) existing.remove();

  /* Create footer */
  const footer = document.createElement("footer");
  footer.id = "outrider-coffeefooter";
  footer.classList.add(mode);

  const iconPath = "https://0utrider.github.io/pathfinder/coffeefooter/coffee1.webp";

  /* Mode-specific HTML */
  if (mode === "minimal") {
    footer.innerHTML = `
      <a href="https://buymeacoffee.com/outrider" target="_blank">
        <img src="${iconPath}" class="coffee-icon" alt="Coffee">
      </a>
    `;
  }

  else if (mode === "button") {
    footer.innerHTML = `
      <a href="https://buymeacoffee.com/outrider" target="_blank">
        <img src="${iconPath}" class="coffee-icon" alt="Coffee">
        Buy Me a Coffee!
      </a>
    `;
  }

  else {
    footer.innerHTML = `
      <span class="footer-text">Did you find this useful?</span>

      <a href="https://buymeacoffee.com/outrider" target="_blank">
        <img src="${iconPath}" class="coffee-icon" alt="Coffee">
        Buy Me a Coffee!
      </a>
    `;
  }

  document.body.appendChild(footer);

  /* Add bottom padding so content never hides behind the floating footer */
  requestAnimationFrame(() => {
    const footerHeight = footer.offsetHeight;
    document.body.style.paddingBottom = footerHeight + "px";
  });
}
