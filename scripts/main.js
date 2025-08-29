import { store, delivery, adoption } from "./site.config.js";

// Brand and logo hookup
import { images } from "./image-manifest.js";

document.addEventListener("DOMContentLoaded", () => {
  // Logo + brand
  const logo = document.getElementById("logo");
  const brand = document.getElementById("brand-name");
  if (logo && images.logo?.url) {
    logo.src = images.logo.url;
    // EDIT: Logo alt
    logo.alt = images.logo.alt || "Beth Store logo";
  }
  if (brand && store.name) brand.textContent = store.name;

  // Footer address
  const footerAddr = document.getElementById("footer-address");
  if (footerAddr) footerAddr.textContent = store.address;

  // Delivery estimator
  const form = document.getElementById("delivery-estimator");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const miles = parseFloat(document.getElementById("distance").value) || 0;
      const out = document.getElementById("estimate");
      let cost = 0;
      if (delivery.mode === "distance") {
        if (miles > delivery.maxMiles) {
          out.textContent = "Out of range";
          return;
        }
        cost = delivery.baseFeeUSD + miles * delivery.perMileUSD;
      } else {
        cost = delivery.baseFeeUSD;
      }
      out.textContent = `$${cost.toFixed(2)}`;
    });
  }

  // Adoption proof visibility
  const proofField = document.getElementById("proof-field");
  if (proofField && adoption.minimalProof) {
    proofField.style.display = "none";
  }

  // Adoption auto-approve
  const adoptionForm = document.getElementById("adoption-form");
  if (adoptionForm) {
    adoptionForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = document.getElementById("adoption-status");
      // EDIT: Customize approval messaging
      status.textContent = adoption.autoApprove ? "Approved! We'll contact you shortly." : "Submitted! We'll review your application.";
    });
  }
});