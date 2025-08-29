# Beth's Pet Store Website

## Project Setup

- **Files Structure:** 
  - HTML files: `index.html`, `community.html`, `thank-you.html`, `faqs.html`, `privacy.html`, `terms.html`, `support.html`, `feedback.html`.
  - Styles: `style.css` (for global styles, responsive layout, and animations).
  - Scripts: `script.js` (for dynamic hero counters, quiz logic, community posts, and footer year).
  - **Images Directory:** Create `images/` with subfolders `pets/`, `products/`, `pages/`, `avatars/`. Place your own pet and product images accordingly for use in `<img>` tags or background images.
    - Example: `images/pets/dog1.jpg`, `images/products/toy1.jpg`, etc.
  - **Fonts & Icons:** Uses Google Fonts (Montserrat, Roboto). You may add Font Awesome or similar if needed.

## How to Use

1. **Deployment:** 
   - The site is static and can be hosted on any web server or Netlify (for built-in form handling).
   - Ensure the `style.css` and `script.js` files are in the same directory as your HTML files, or adjust paths accordingly.
2. **Netlify Forms:** 
   - Forms (`<form data-netlify="true">`) on the site (newsletter, support, feedback) are configured for Netlify. Just deploy on Netlify, and it will catch submissions. 
   - No backend code is required. Include a hidden input `name="form-name"` matching the form's `name` attribute.
3. **Images:** 
   - The code uses placeholder images from Unsplash via the source URL. Replace or supplement these with your own images in the `images/` folder for a fully customized look.
4. **Interactive Features:**
   - **Live Pet Counter:** Randomized on each page load (`script.js` sets a random number of pets available for adoption).
   - **Pet Match Quiz:** Simple quiz on the homepage that suggests a pet type based on answers.
   - **Community Posts:** On the Community page, users can submit new posts which appear instantly (stored in-page, for demo purposes).
   - **Footer Year:** Automatically updates to the current year via JavaScript.
5. **Customization:**
   - **Color & Theme:** Uses coral (`#FF7F50`) and teal (`#008080`) as primary colors. Modify the CSS variables in `:root` to tweak the palette.
   - **Animations:** Button hover effects and subtle transitions are included. Additional animations can be added by editing `style.css`.
   - **Quiz Logic:** Adjust questions and results in `script.js` as needed for more accuracy or detail.
6. **Other Notes:** 
   - All currency is in USD as requested. Ensure any pricing updates in the HTML reflect USD format (`$`).
   - All links in navigation and footer should be updated if deploying under a different domain or subdirectory.
   - This scaffold provides placeholders for advanced features (like 360° tours, loyalty signup) which can be fleshed out with backend services or additional scripts.

Enjoy building on this foundation to create a fully featured pet store experience!
