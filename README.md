# Ritual Feedback Lab

Premium feedback web app concept for the Ritual ecosystem.

## Features

- Wallet connect through `window.ethereum`
- Add or switch to Ritual testnet, Chain ID `1979`
- Signed feedback payload for wallet-authenticated submissions
- Local feedback board stored in browser `localStorage`
- Premium animated interface with no framework dependency
- Static build output for Vercel

## Local

Open `index.html` directly, or run a static server.

```bash
npm run build
```

## Vercel

Vercel will run:

```bash
npm run build
```

and serve the `dist` directory.

## Notes

This is a frontend-only feedback prototype. To collect production feedback, connect the submit handler in `app.js` to an API, database, Airtable, Notion, Supabase, or an on-chain contract.
