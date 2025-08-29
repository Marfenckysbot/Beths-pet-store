import { products } from "./image-manifest.js";

const KEY = "bethstore_wishlist";

function getList() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
function setList(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("grid");
  if (!grid) return;

  // Render product cards
  const tpl = document.getElementById("card-template");
  products.forEach(p => {
    const node = tpl.content.cloneNode(true);
    const card = node.querySelector(".product-card");
    const btn = node.querySelector(".wishlist-btn");
    const img = node.querySelector(".product-image");
    const title = node.querySelector(".product-title");
    const price = node.querySelector(".product-price");
    const qv = node.querySelector(".quickview");

    btn.dataset.id = p.id;
    qv.dataset.id = p.id;

    // EDIT: Card content from products[]
    img.src = p.img.url;
    img.alt = p.img.alt || p.title;
    title.textContent = p.title;
    price.textContent = p.priceUSD ? `$${p.priceUSD.toLocaleString()}` : "Request price";

    card.dataset.id = p.id;
    grid.appendChild(node);
  });

  // Wire wishlist
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".wishlist-btn");
    if (!btn) return;
    const id = btn.dataset.id;
    const list = new Set(getList());
    if (list.has(id)) { list.delete(id); btn.classList.remove("active"); }
    else { list.add(id); btn.classList.add("active"); }
    setList([...list]);
  });

  // Initialize active state
  const active = new Set(getList());
  grid.querySelectorAll(".product-card").forEach(card => {
    if (active.has(card.dataset.id)) {
      card.querySelector(".wishlist-btn").classList.add("active");
    }
  });
});