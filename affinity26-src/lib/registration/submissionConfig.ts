/**
 * The one place the registration submission URL is defined.
 *
 * The browser never talks to Google Apps Script directly (a direct call is blocked by CORS: Apps Script /exec
 * responses carry no `Access-Control-Allow-Origin` header). It POSTs to a SAME-ORIGIN proxy instead:
 *
 *   Browser -> {basePath}/api/register  (Cloudflare Pages Function, /functions/affinity26/api/register.js)
 *           -> Google Apps Script /exec  (server-to-server; URL kept in the Cloudflare secret
 *                                         GOOGLE_APPS_SCRIPT_ENDPOINT, never in this bundle)
 *           -> Google Sheet
 *
 * With the deployed basePath this is exactly "/affinity26/api/register". No Apps Script URL, and no
 * NEXT_PUBLIC_* variable holding one, exists anywhere in the frontend. See the root README.md.
 */
import { assetPath } from "@/lib/basePath";

export const REGISTRATION_ENDPOINT: string = assetPath("/api/register");
