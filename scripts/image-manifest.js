// EDIT: Centralized images and product data
export const images = {
  logo: { url: "assets/icons/favicon.svg", alt: "Beth Store logo" }, // EDIT: Logo URL and alt
  hero_main: { url: "assets/img/placeholder.jpg", alt: "Happy pets and people" }, // EDIT: Hero image
};

export const products = [
  // EDIT: Add/replace items; priceUSD optional
  {
    id: "breed-tibetan-mastiff",
    title: "Tibetan Mastiff",
    priceUSD: 3500,
    img: { url: "assets/img/placeholder.jpg", alt: "Tibetan Mastiff" },
    summary: "Loyal guardian, calm at home.",
  },
  {
    id: "breed-shiba-inu",
    title: "Shiba Inu",
    priceUSD: 1500,
    img: { url: "assets/img/placeholder.jpg", alt: "Shiba Inu" },
    summary: "Confident, agile, and charming.",
  },
];