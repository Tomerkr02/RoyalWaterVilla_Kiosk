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
- `Connected`: enabled when `VITE_ENABLE_HA=true` is configured.

Frontend code never receives the Home Assistant token. The browser calls internal app endpoints under `/api/ha/*`; the local Vite middleware or Vercel API route reads `HA_BASE_URL` and `HA_TOKEN` server-side.

1. Create a local `.env` file:

```bash
HA_BASE_URL=http://homeassistant.local:8123
HA_TOKEN=your_home_assistant_long_lived_access_token
VITE_ENABLE_HA=true
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
GET /api/ha/states?entity_id=<entity_id>
POST /api/ha/toggle
POST /api/ha/service
```

Vite forwards those requests to `HA_BASE_URL` and adds:

```text
Authorization: Bearer <HA_TOKEN>
```

Do not prefix `HA_TOKEN` with `VITE_`. `VITE_*` values are exposed to the browser; `HA_TOKEN` is read only by the Vite dev server or Vercel function.

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

### Local Toggle Test

1. Confirm `.env` contains:

```bash
HA_BASE_URL=http://homeassistant.local:8123
HA_TOKEN=your_home_assistant_long_lived_access_token
VITE_ENABLE_HA=true
```

2. Restart the Vite server after changing `.env`.
3. Open DevTools and click a device card, for example `Salon ceiling spots`.
4. In the Network tab, confirm the browser calls:

```text
POST /api/ha/toggle
GET /api/ha/states?entity_id=switch.tvrt_slvn_salon_light_switch_1
```

5. In the console, confirm `[SmartHome] selected provider` shows `Home Assistant`, not `Mock`.

If the provider is `Mock`, `VITE_ENABLE_HA=true` was not loaded by Vite or the dev server was not restarted. If the API returns `500` with missing env details, `HA_BASE_URL` or `HA_TOKEN` is missing. If it returns `401`, the token is invalid. If it returns `502`, the server cannot reach Home Assistant.

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
```

Do not set `VITE_HA_TOKEN`. Any `VITE_*` value is bundled into frontend code. Production uses the secure `/api/ha` route by default. To intentionally force Mock Mode in a production build, set `VITE_ENABLE_HA=false`.

Important: Vercel cannot reach `homeassistant.local` inside the villa network. `HA_BASE_URL` must be a secure public URL that reaches Home Assistant, for example through Nabu Casa Remote UI or a Cloudflare Tunnel. Do not implement the tunnel in this app; configure it outside the app and put that reachable URL in `HA_BASE_URL`.

The browser calls these internal routes:

```text
GET /api/ha/states
GET /api/ha/states?entity_id=<entity_id>
POST /api/ha/toggle
POST /api/ha/service
```

The server route, not the frontend, calls Home Assistant and adds:

```text
Authorization: Bearer <HA_TOKEN>
```

## Vercel Deployment

The repository includes:

- `vercel.json` for Vite output, SPA refresh/deep route rewrites, and cache headers.
- `api/ha/states.js`, `api/ha/toggle.js`, and `api/ha/service.js` for production-safe Home Assistant access.

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
vercel --prod
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
