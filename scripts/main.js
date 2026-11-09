import { store, adoption } from "./site.config.js";
import { images } from "./image-manifest.js";

document.addEventListener("DOMContentLoaded", () => {
  const logo = document.getElementById("logo");
  const brand = document.getElementById("brand-name");
  if (logo && images.logo?.url) {
    logo.src = images.logo.url;
    logo.alt = images.logo.alt || "Beth's Pet Store logo";
  }
  if (brand) brand.textContent = store.name;

  // No public street address or map coordinates are exposed by this site configuration.
  const proofField = document.getElementById("proof-field");
  if (proofField && adoption.minimalProof) proofField.hidden = true;

  const adoptionForm = document.getElementById("adoption-form");
  if (adoptionForm) {
    adoptionForm.addEventListener("submit", (event) => {
      // A front-end-only form must never claim an application was approved or received.
      const status = document.getElementById("adoption-status");
      if (status) status.textContent = "Online application processing is not connected yet. Please contact the team before submitting personal documents.";
      event.preventDefault();
    });
  }
});