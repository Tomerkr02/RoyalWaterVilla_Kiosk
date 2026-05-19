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
      browserApiBase: import.meta.env.VITE_HA_BASE_URL ? '/ha-api' : '(mock provider)',
      tokenHandling: 'HA_TOKEN is injected only by the dev/proxy server; it is not available to frontend code.'
    });
  }
  return provider;
}
