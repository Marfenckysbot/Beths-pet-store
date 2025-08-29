// EDIT: Core store identity and location
export const store = {
  name: "Beth Store", // EDIT: Store name
  address: "123 Pet Avenue, Lagos, Nigeria", // EDIT: Store address
  lat: 6.5244, // EDIT: Latitude
  lng: 3.3792, // EDIT: Longitude
  language: "en", // EDIT: Default language code
};

// EDIT: Service and delivery controls
export const delivery = {
  mode: "distance", // EDIT: "distance" or "flat"
  baseFeeUSD: 10,   // EDIT: Base fee in USD
  perMileUSD: 1.5,  // EDIT: Per-mile rate
  maxMiles: 25,     // EDIT: Max distance
};

// EDIT: Adoption flow settings
export const adoption = {
  minimalProof: true,  // EDIT: Hide proof upload field if true
  autoApprove: true,   // EDIT: Auto-approve applications for demo
};

// EDIT: UI flags
export const uiFlags = {
  darkModeToggle: true, // EDIT: Enable theme toggle
  faqAccordion: true,   // EDIT: Enable FAQ accordion
  contactHub: true,     // EDIT: Enable floating contact hub
};