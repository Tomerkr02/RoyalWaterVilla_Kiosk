# Royal Water Villa Kiosk

Premium tablet-first smart-room kiosk for Royal Water Villa.

## Languages

The kiosk supports:

- Hebrew (`HE`) - default, RTL
- English (`EN`) - LTR
- French (`FR`) - LTR

The selected language is saved in `localStorage`.

## Local Development

Install dependencies:

```bash
npm install
```

Run the kiosk:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Home Assistant Setup

The app supports two providers:

- `Mock Mode`: default when Home Assistant is not configured.
- `Connected`: enabled when `VITE_HA_BASE_URL` is configured.

Frontend code must not contain a Home Assistant token. For local development, Vite proxies `/ha-api` to Home Assistant and injects the token server-side.

1. Create a local `.env` file:

```bash
VITE_HA_BASE_URL=http://homeassistant.local:8123
HA_TOKEN=your_home_assistant_long_lived_access_token
```

2. Create a Home Assistant long-lived access token:

- Open Home Assistant.
- Go to your user profile.
- Scroll to `Long-Lived Access Tokens`.
- Create a token for the kiosk dev proxy.
- Put it in `.env` as `HA_TOKEN`.

3. Start the dev server:

```bash
npm run dev
```

During development, the browser calls:

```text
/ha-api/api/states/<entity_id>
/ha-api/api/services/<domain>/<service>
```

Vite forwards those requests to `VITE_HA_BASE_URL` and adds:

```text
Authorization: Bearer <HA_TOKEN>
```

Do not prefix `HA_TOKEN` with `VITE_`. `VITE_*` values are exposed to the browser; `HA_TOKEN` is read only by the Vite dev server.

Development logs are printed for:

- selected provider
- HA base URL
- mapped entity id
- device id
- current state
- target state
- service domain and service name
- request URL
- response status and body

A small development-only debug panel shows provider status, last HA error, and last entity action.

## Production Home Assistant Setup

On Vercel, the kiosk uses the serverless proxy at:

```text
/api/ha/*
```

The browser never receives the Home Assistant token. The Vercel function reads `HA_BASE_URL` and `HA_TOKEN` server-side, then forwards requests to Home Assistant.

Set these Vercel environment variables:

```bash
HA_BASE_URL=https://your-home-assistant.example.com
HA_TOKEN=your_home_assistant_long_lived_access_token
VITE_ENABLE_HA=true
VITE_HA_API_BASE_PATH=/api/ha
```

Do not set `VITE_HA_TOKEN`. Any `VITE_*` value is bundled into frontend code.

The Vercel proxy forwards these paths to Home Assistant:

```text
/api/states/<entity_id>
/api/services/<domain>/<service>
```

The proxy, not the frontend, adds:

```text
Authorization: Bearer <HA_TOKEN>
```

## Vercel Deployment

The repository includes:

- `vercel.json` for Vite output, SPA refresh/deep route rewrites, and cache headers.
- `api/ha/[...path].js` for production-safe Home Assistant proxying.

Deploy steps:

1. Push the repository to GitHub.
2. Create a new Vercel project from the repository.
3. Use the default framework detection or set:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

4. Add the environment variables listed above in Vercel Project Settings.
5. Deploy.

To deploy from the Vercel CLI:

```bash
npm install -g vercel
vercel login
vercel
vercel env add HA_BASE_URL production
vercel env add HA_TOKEN production
vercel env add VITE_ENABLE_HA production
vercel env add VITE_HA_API_BASE_PATH production
vercel --prod
```

For `VITE_ENABLE_HA`, use:

```text
true
```

For `VITE_HA_API_BASE_PATH`, use:

```text
/api/ha
```

## Mapped Devices

Device and entity mappings live in:

```text
src/config/devices.ts
```

Supported mapped entities:

- Salon ceiling spots
- Salon LED wall
- Pergola light
- Wall light
- Back pathway light
- Pool light
- Outdoor bar light
- Outdoor wall light
- Bathroom light
- Bedroom fan light
- Ceiling fan
- Bathroom heater

## Provider Behavior

- Initial load fetches mapped entity states.
- Taps update the UI optimistically immediately.
- Commands are sent in the background.
- After each command, only the affected entity is synced.
- There is no heavy full-state polling loop.
- On command failure, the card reverts and the status indicator moves to `Error`.

## Production Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```
