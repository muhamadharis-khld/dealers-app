# iMotorbike Dealer App

This is the clean MVP version.

## Files To Upload To GitHub

Upload these files to the root of a new GitHub repo:

- `index.html`
- `styles.css`
- `app.js`
- `inventory.json`
- `vercel.json`
- `preview-server.js`
- `README.md`

Do not upload old files like `index (1).html`.

## Deploy On Vercel

1. Create a new GitHub repo.
2. Upload all files from this folder.
3. Go to Vercel.
4. Import the GitHub repo.
5. Framework preset: `Other`.
6. Build command: leave blank.
7. Output directory: leave blank.
8. Deploy.

## Daily Inventory Update

Only replace this file:

```text
inventory.json
```

The app reads:

```js
fetch("inventory.json")
```

## Inventory Format

Each bike should look like this:

```json
{
  "productId": "98635",
  "plate": "VNC 9261",
  "brand": "Yamaha",
  "model": "Y16ZR",
  "year": 2024,
  "mileage": 19812,
  "shop": "iMotorbike - Glenmarie",
  "price": 6450,
  "certification": "Certified Lite",
  "link": ""
}
```

`productId` is used internally only. It is not shown to dealers.

## Editing Text

Edit page text in `index.html`.

Edit button logic and offer message in `app.js`.

Edit colours and layout in `styles.css`.

## Local Testing

Do not double-click `index.html` for final testing because browser security may block `inventory.json`.

Run:

```bash
node preview-server.js
```

Then open:

```text
http://127.0.0.1:8123
```

