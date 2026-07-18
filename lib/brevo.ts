const BREVO_API = "https://api.brevo.com/v3";

/**
 * Adds (or updates) a contact in Brevo. Best-effort — failures are logged but
 * never thrown, so email capture UX never breaks if Brevo is unreachable or
 * BREVO_API_KEY isn't configured yet.
 */
export async function addContactToBrevo(email: string, source: string): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("Brevo: BREVO_API_KEY not configured, skipping contact sync for", email);
    return;
  }

  try {
    const res = await fetch(`${BREVO_API}/contacts`, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        attributes: { SOURCE: source },
        updateEnabled: true,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn(`Brevo: failed to add contact (${res.status}):`, text);
    }
  } catch (err) {
    console.warn("Brevo: request failed:", err);
  }
}
