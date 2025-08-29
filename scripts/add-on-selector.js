// EDIT: Add-on items and pricing
const addOns = [
  { id: "crate", label: "Travel crate", priceUSD: 50 },
  { id: "microchip", label: "Microchipping", priceUSD: 35 },
  { id: "starter-kit", label: "Starter kit", priceUSD: 60 },
];

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("add-on-selector");
  if (!root) return;
  root.innerHTML = `
    <h2>Customize your delivery</h2>
    <div class="addons">
      ${addOns.map(a => `
        <label><input type="checkbox" data-price="${a.priceUSD}"> ${a.label} (+$${a.priceUSD})</label>
      `).join("")}
    </div>
    <p>Total add‑ons: <strong id="addons-total">$0.00</strong></p>
  `;
  const out = document.getElementById("addons-total");
  root.querySelectorAll("input[type='checkbox']").forEach(cb => {
    cb.addEventListener("change", () => {
      const total = Array.from(root.querySelectorAll("input:checked"))
        .reduce((sum, i) => sum + Number(i.dataset.price), 0);
      out.textContent = `$${total.toFixed(2)}`;
    });
  });
});