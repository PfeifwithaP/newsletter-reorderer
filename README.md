# Newsletter Story Reorderer

A drag-and-drop app for reordering newsletter stories from Make.com before sending via Mailchimp.

## Features

- Paste aggregated JSON from Make
- Drag stories to reorder within categories
- Auto-inserts outlet names (NYT, WSJ, WaPo, Bloomberg, etc.)
- Live preview of the email
- Export reordered JSON to paste back into Make

## Deployment to Vercel

1. Push this repo to GitHub
2. Go to [Vercel.com](https://vercel.com)
3. Click "New Project" and select this repo
4. Vercel auto-detects it's a React app
5. Click "Deploy"
6. Get a live URL immediately

## Local Development

```bash
npm install
npm start
```

Opens at `http://localhost:3000`

## Usage

1. In Make: Export the BasicAggregator output as JSON
2. Paste into this app
3. Drag stories to reorder
4. Click "Export JSON"
5. Paste back into Make's Set Variable module
6. Resume workflow
