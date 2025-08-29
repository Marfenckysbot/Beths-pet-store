const animals = [
  { name: "Bella", img: "images/animals/bella.jpg", fact: "Loves sunflower seeds." },
  { name: "Max", img: "images/animals/max.jpg", fact: "Enjoys belly rubs." }
];
const container = document.querySelector('.gallery-container');
animals.forEach(a => {
  const card = document.createElement('div');
  card.classList.add('animal-card');
  card.innerHTML = `
    <img src="${a.img}" alt="${a.name} the animal" loading="lazy"/>
    <h3>${a.name}</h3>
    <p>${a.fact}</p>
  `;
  container.appendChild(card);
});

// gallery.js

const galleryImages = [
  'images/animals/dog_golden.jpg',
  'images/animals/cat_tabby.jpg',
  'images/animals/parrot_macaw.jpg',
  'images/animals/rabbit_white.jpg'
];

// Example: use in your gallery display logic
const galleryContainer = document.getElementById('gallery');

galleryImages.forEach(src => {
  const img = document.createElement('img');
  img.src = src;
  img.alt = src.split('/').pop().replace(/_/g, ' ').replace(/\.\w+$/, '');
  galleryContainer.appendChild(img);
});