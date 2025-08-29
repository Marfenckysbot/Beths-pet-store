import { store, uiFlags } from "./site.config.js";
import { social } from "./social.config.js";

document.addEventListener("DOMContentLoaded", () => {
  // EDIT: Language default
  document.documentElement.lang = store.language || "en";

  // Year
  document.getElementById("year")?.append(new Date().getFullYear());

  // Social links
  const wa = document.getElementById("social-whatsapp");
  const fb = document.getElementById("social-facebook");
  if (wa) wa.href = social.whatsapp;
  if (fb) fb.href = social.facebook;

  // ContactHub
  if (uiFlags.contactHub) {
    const hub = document.getElementById("contact-hub");
    if (hub) {
      hub.innerHTML = `
        <a class="hub-item" href="${social.phone}">Call</a>
        <a class="hub-item" href="${social.whatsapp}">WhatsApp</a>
        <a class="hub-item" href="${social.email}">Email</a>
        <a class="hub-item" href="https://maps.google.com?q=${encodeURIComponent(store.address)}">Map</a>
      `;
    }
  }

  // Dark mode toggle
  const toggle = document.getElementById("dark-mode-toggle");
  if (uiFlags.darkModeToggle && toggle) {
    const saved = localStorage.getItem("theme");
    if (saved) document.documentElement.dataset.theme = saved;
    toggle.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("theme", next);
      toggle.setAttribute("aria-pressed", String(next === "dark"));
    });
  }
});