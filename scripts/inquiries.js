import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const config = window.BETHS_SUPABASE_CONFIG || {};
const form = document.querySelector("[data-inquiry-form]");
if (form) {
  const status = document.querySelector("#inquiry-status");
  const submit = form.querySelector('button[type="submit"]');
  const say = (message, isError = false) => {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("error", isError);
    status.setAttribute("role", "status");
  };

  if (!config.url || !config.anonKey) {
    say("The enquiry service is not configured. Please try again later.", true);
    submit.disabled = true;
  } else {
    const supabase = createClient(config.url, config.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      submit.disabled = true;
      say("Sending your message securely…");
      const fields = new FormData(form);
      const { data, error } = await supabase.functions.invoke("site-inquiry", {
        body: {
          category: form.dataset.inquiryCategory,
          name: fields.get("name"),
          email: fields.get("email"),
          subject: fields.get("subject"),
          message: fields.get("message"),
          company_website: fields.get("company_website")
        }
      });
      submit.disabled = false;
      if (error || !data?.ok) {
        say(error?.message || data?.error || "We couldn't send your message. Please try again later.", true);
        return;
      }
      form.reset();
      say(data.message || "Thank you. Your message has been recorded.");
    });
  }
}
