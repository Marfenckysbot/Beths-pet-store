import { store, uiFlags } from "./site.config.js";
import { social } from "./social.config.js";

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.lang = store.language || "en";
  const year = document.getElementById("year");
  if (year && !year.textContent) year.textContent = new Date().getFullYear();

  const wa = document.getElementById("social-whatsapp");
  const fb = document.getElementById("social-facebook");
  if (wa && social.whatsapp) wa.href = social.whatsapp;
  if (fb && social.facebook) fb.href = social.facebook;

  // Only expose contact actions after real business-owned channels are configured.
  if (uiFlags.contactHub) {
    const hub = document.getElementById("contact-hub");
    if (hub) {
      const links = [
        social.phone && [social.phone, "Call"],
        social.whatsapp && [social.whatsapp, "WhatsApp"],
        social.email && [social.email, "Email"],
      ].filter(Boolean);
      hub.replaceChildren(...links.map(([href, label]) => {
        const a = document.createElement("a");
        a.className = "hub-item";
        a.href = href;
        a.textContent = label;
        return a;
      }));
      hub.hidden = links.length === 0;
    }
  }

  const toggle = document.getElementById("dark-mode-toggle");
  if (uiFlags.darkModeToggle && toggle) {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) document.documentElement.dataset.theme = saved;
      toggle.addEventListener("click", () => {
        const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        localStorage.setItem("theme", next);
        toggle.setAttribute("aria-pressed", String(next === "dark"));
      });
    } catch {
      toggle.hidden = true;
    }
  }
});