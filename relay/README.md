# Request relay

This Worker takes the booking form's request, checks it, posts a summary to a private Discord channel, and pings the two roles.

The Discord webhook URL is a secret. It is stored as a Worker secret, never in the website files, because the website is public on GitHub.

## One-time setup

1. **Replace the webhook.** The URL that was pasted into the chat is visible to anyone who has seen it. In Discord, open the channel's settings, go to Integrations, then Webhooks, delete that webhook, and create a new one. Copy the new URL.
2. **Install and log in to Wrangler**, Cloudflare's command-line tool: `npm install -g wrangler`, then `wrangler login`.
3. **Deploy.** From this `relay` folder, run `wrangler deploy`. It prints the Worker's URL, which looks like `https://softreset-requests.<your-subdomain>.workers.dev`.
4. **Store the webhook as a secret:** run `wrangler secret put DISCORD_WEBHOOK_URL` and paste the new URL. It is not written to any file.
5. **Turn the form on.** In `assets/js/config.js`, set `bookingEndpoint` to the Worker URL, then commit and push.
6. **Test.** Send a request from the site. The visitor should see "Request received", and both roles should be pinged in the channel.

## Pings that don't notify

In Discord, open each role's settings and turn on "Allow anyone to @mention this role". Without it, the ping shows up but doesn't notify.

## Limits to know about

- `ALLOWED_ORIGINS` in `wrangler.toml` lists the sites allowed to send requests. Browsers enforce it. Other programs can fake it, so add a rate limit: in the Cloudflare dashboard, add a rate-limiting rule for this Worker's URL (for example, 5 POST requests per minute per IP address).
- The relay checks required fields and cuts long text to Discord's limits.
- If Discord refuses a request, the site shows the visitor a message they can copy and send by hand, so nothing is lost.

## Changing things

- Roles to ping: `ROLE_ONE` and `ROLE_TWO` in `wrangler.toml`, then `wrangler deploy` again.
- Sites allowed to send requests: `ALLOWED_ORIGINS` in `wrangler.toml`, then `wrangler deploy` again.
