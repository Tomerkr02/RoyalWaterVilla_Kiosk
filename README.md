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

For production, serve the kiosk behind a local reverse proxy or small server that handles Home Assistant authentication outside the browser.

Set:

```bash
VITE_HA_BASE_URL=https://your-local-kiosk-proxy.example
```

That proxy should forward these paths to Home Assistant:

```text
/api/states/<entity_id>
/api/services/<domain>/<service>
```

The proxy, not the frontend, should add the Home Assistant bearer token.

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
