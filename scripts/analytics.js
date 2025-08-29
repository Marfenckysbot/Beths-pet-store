// EDIT: Toggle analytics
export const analytics = { enabled: false }; // EDIT: Set to true to activate GA4

if (analytics.enabled) {
  // EDIT: Replace with your GA tag
  const GA_ID = "G-XXXXXXX";
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ dataLayer.push(arguments); };
  gtag("js", new Date());
  gtag("config", GA_ID);
}