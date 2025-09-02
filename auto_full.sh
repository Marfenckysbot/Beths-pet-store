bash -c '
cat <<EOF > sitemap.xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://beths-pet-store.netlify.app/</loc>
    <lastmod>2025-09-01</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
EOF

cat <<ROB > robots.txt
User-agent: *
Allow: /
Sitemap: https://beths-pet-store.netlify.app/sitemap.xml
ROB

sed -i "/<head>/a \
<title>Beth'\''s Pet Store – Quality Pet Supplies & Care</title>\n\
<meta name=\"description\" content=\"Shop at Beth'\''s Pet Store for quality pet supplies, accessories, and care tips.\">\n\
<link rel=\"canonical\" href=\"https://beths-pet-store.netlify.app/\">\n\
<meta property=\"og:title\" content=\"Beth'\''s Pet Store\">\n\
<meta property=\"og:description\" content=\"Your one-stop shop for quality pet supplies and accessories.\">\n\
<meta property=\"og:image\" content=\"https://beths-pet-store.netlify.app/images/og-image.jpg\">\n\
<meta property=\"og:url\" content=\"https://beths-pet-store.netlify.app/\">\n\
<meta property=\"og:type\" content=\"website\">\n\
<meta name=\"twitter:card\" content=\"summary_large_image\">\n\
<meta name=\"twitter:title\" content=\"Beth'\''s Pet Store\">\n\
<meta name=\"twitter:description\" content=\"Shop for pet supplies and accessories at Beth'\''s Pet Store.\">\n\
<meta name=\"twitter:image\" content=\"https://beths-pet-store.netlify.app/images/og-image.jpg\">\n\
<script async src=\"https://www.googletagmanager.com/gtag/js?id=G-BETHPET01A\"></script>\n\
<script>\n\
  window.dataLayer = window.dataLayer || [];\n\
  function gtag(){dataLayer.push(arguments);}\n\
  gtag('js', new Date());\n\
  gtag('config', 'G-BETHPET01A');\n\
</script>" index.html || echo "Index.html not found!"

git add .
git commit -m "Final automation: SEO, GA4, auto-deploy enabled" || echo "Nothing new to commit"
git push origin main
netlify deploy --prod --dir="."
'
