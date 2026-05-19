import { createHomeAssistantProvider } from './homeAssistantProvider';
import { createMockProvider } from './mockProvider';
import type { SmartHomeProvider } from './SmartHomeProvider';

export function createProvider(): SmartHomeProvider {
  const provider = createHomeAssistantProvider() ?? createMockProvider();
  if (import.meta.env.DEV) {
    console.info('[SmartHome] selected provider', {
      provider: provider.name,
      status: provider.getHealth().status,
      haBaseUrl: import.meta.env.VITE_HA_BASE_URL ?? '(not configured)',
      browserApiBase: provider.name === 'Home Assistant' ? '/api/ha' : '(mock provider)',
      tokenHandling: 'HA_TOKEN is read only by the server-side API/proxy; it is not available to frontend code.'
    });
  }
  return provider;
}
