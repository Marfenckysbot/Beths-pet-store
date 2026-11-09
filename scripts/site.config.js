// Public configuration only. Never place private addresses, coordinates, API keys or credentials here.
export const store = {
  name: "Beth's Pet Store",
  language: "en",
  marketLabel: "Nigeria and international markets",
};

// Delivery prices and availability must come from an actual delivery provider or a confirmed business policy.
// Do not display estimates until those rules are configured.
export const delivery = {
  mode: "disabled",
};

// Adoption applications must be reviewed by a person. Never auto-approve an application.
export const adoption = {
  minimalProof: true,
  autoApprove: false,
};

export const uiFlags = {
  darkModeToggle: true,
  faqAccordion: true,
  contactHub: false,
};