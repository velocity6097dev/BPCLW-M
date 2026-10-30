# BPCLW-M — Vercel redirect page

A small, standalone package — separate from the main BPCLW-M project —
whose only job is to keep your **old Vercel link working**. Anyone who
still has it bookmarked lands on a page that looks like part of the same
app (same topbar, logo, loading animation, colors/fonts), briefly says
"we've moved", and automatically sends them to the new InfinityFree site.

## What it does

1. Shows a branded card matching the main app's look, with the loader gif.
2. After 3 seconds, redirects to `https://bpclinvoicemaker.infy.click`
   (same convention as the main app's loading screens).
3. If JavaScript is blocked, a `<meta http-equiv="refresh">` tag does the
   same redirect on its own.
4. A visible "Go there now →" button works immediately, for anyone who
   doesn't want to wait.
5. Any path on the old domain (not just `/`) shows this same page —
   `vercel.json` rewrites every route to `index.html`.

## Deploying

This replaces whatever is currently live on your existing Vercel
project — it does **not** need a new Vercel project or a new domain.

1. In the Vercel dashboard, open your existing project (the one your old
   link points to).
2. Either:
   - **Via the dashboard**: upload/deploy this folder's contents as a new
     deployment to that same project (drag-and-drop or connect it to a
     repo containing just these files), or
   - **Via the CLI**, from inside this folder:
     ```
     vercel --prod
     ```
     (link it to your existing project when prompted, don't create a new one).
3. That's it — no build step, no environment variables, nothing else to
   configure.

## If the InfinityFree domain ever changes

Open `index.html` and update the one `NEW_URL` line near the bottom of
the `<script>` block, **and** the matching URL in the `<meta
http-equiv="refresh">` tag near the top of `<head>` — both need to say
the same address. Redeploy after.

## About "the Cloudflare thing"

This page does **not** include the license-gate/Cloudflare-Worker check
that the main app uses (`src/js/license-gate.js`) — it's intentionally
left out, on purpose: this is just a redirect notice, not the protected
app itself, so there's nothing here worth gating, and adding that check
would only risk the exact "stuck loading" bug we just fixed elsewhere if
this new/old domain pairing isn't in the Worker's allowed list. If you
actually wanted something else here — e.g. routing this domain's DNS
through Cloudflare, or proxying it through the Worker for some other
reason — let me know specifically what, since that wasn't fully clear
and I didn't want to guess and build the wrong thing.
