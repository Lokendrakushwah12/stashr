// Centralized favicon helpers. The logo.dev token is a public publishable
// key (pk_*) but is kept here so it isn't sprinkled across components.
const LOGO_DEV_TOKEN = "pk_IgdfjsfTRDC5pflfc9nf1w";

export function logoDevFallbackFor(url: string): string | null {
  try {
    const host = new URL(url).hostname;
    return `https://img.logo.dev/${host}?token=${LOGO_DEV_TOKEN}&retina=true`;
  } catch {
    return null;
  }
}
