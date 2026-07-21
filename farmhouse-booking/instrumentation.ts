/**
 * instrumentation.ts — Next.js 16.2 AI / dev-experience hooks.
 * Runs ONCE per Node.js process. DEV-ONLY.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV === "production") return;
  // eslint-disable-next-line no-console
  console.log(
    "[instrumentation] Next.js 16.2 dev hooks active — browser logs forward to terminal"
  );
}
