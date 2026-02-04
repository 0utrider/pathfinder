document.addEventListener("DOMContentLoaded", () => {

  /* Determine mode */
  const currentScript = document.currentScript;
  const mode = currentScript?.getAttribute("data-mode") || "full";

  /* Create footer */
  const footer = document.createElement("footer");
  footer.id = "outrider-coffeefooter";
  footer.classList.add(mode);

  /* Coffee icon path */
  const iconPath = "https://0utrider.github.io/pathfinder/coffeefooter/coffee1.webp";

  /* Build HTML for each mode */
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

      <a href="https://0utrider.github.io/pathfinder/" target="_blank">
        Outrider's Pathfinder Projects
      </a>
    `;
  }

  document.body.appendChild(footer);

  /* Add bottom padding so content never hides behind the floating footer */
  requestAnimationFrame(() => {
    const footerHeight = footer.offsetHeight;
    document.body.style.paddingBottom = footerHeight + "px";
  });

});
