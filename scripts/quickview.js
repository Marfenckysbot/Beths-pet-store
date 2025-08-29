import { products } from "./image-manifest.js";

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("quickview-modal");
  const content = document.getElementById("quickview-content");
  const closeBtn = document.getElementById("quickview-close");
  const grid = document.getElementById("grid");
  if (!modal || !content || !grid) return;

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".quickview");
    if (!btn) return;
    const id = btn.dataset.id;
    const p = products.find(x => x.id === id);
    if (!p) return;
    content.innerHTML = `
      <img src="${p.img.url}" alt="${p.img.alt || p.title}" />
      <h3>${p.title}</h3>
      <p>${p.summary || ""}</p>
      <p>${p.priceUSD ? `$${p.priceUSD.toLocaleString()}` : "Request price"}</p>
    `;
    modal.showModal();
  });

  closeBtn.addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => {
    const rect = modal.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      modal.close();
    }
  });
});