import { store } from "./site.config.js";

// EDIT: Default SEO metadata
const seoDefaults = {
  title: "Beth Store",
  description: "Adopt responsibly. Care brilliantly.",
  siteName: "Beth Store",
  ogImage: "", // EDIT: Optional absolute URL
};

// EDIT: Blog behavior and schema
export const blog = {
  postsPerCategory: 3, // EDIT: Visible posts per tab
  schemaMarkup: true,  // EDIT: Enable Blog schema
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("brand-name")?.append(store.name);
  document.getElementById("footer-store-name")?.append(store.name);
  document.getElementById("footer-address")?.append(store.address);

  document.querySelector('meta[property="og:title"]')?.setAttribute("content", seoDefaults.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", seoDefaults.description);

  // Populate blog list (demo items)
  const list = document.getElementById("blog-list");
  if (list) {
    const items = [
      { cat: "care", title: "First week with your puppy", snippet: "Routine, rest, and gentle socialization." },
      { cat: "adoption", title: "How we vet our partners", snippet: "Health records, references, site checks." },
      { cat: "training", title: "Crate training basics", snippet: "Comfort, consistency, and patience." },
      { cat: "care", title: "Nutrition 101", snippet: "Balanced diets by life stage." },
    ];
    renderBlog(list, "care", items);
    wireTabs(items);
  }
});

function renderBlog(container, cat, items) {
  container.innerHTML = "";
  const selected = items.filter(i => i.cat === cat).slice(0, blog.postsPerCategory);
  selected.forEach(i => {
    const art = document.createElement("article");
    art.className = "blog-item";
    art.innerHTML = `<h3>${i.title}</h3><p>${i.snippet}</p>`;
    container.appendChild(art);
  });
}

function wireTabs(items) {
  const tabs = document.querySelectorAll("#blog-categories [role='tab']");
  const list = document.getElementById("blog-list");
  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(t => t.setAttribute("aria-selected", "false"));
      btn.setAttribute("aria-selected", "true");
      renderBlog(list, btn.dataset.cat, items);
    });
  });
}