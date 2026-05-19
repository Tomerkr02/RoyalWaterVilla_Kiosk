import { createHomeAssistantProvider } from './homeAssistantProvider';
import { createMockProvider } from './mockProvider';
import type { SmartHomeProvider } from './SmartHomeProvider';

export function createProvider(): SmartHomeProvider {
  const provider = createHomeAssistantProvider() ?? createMockProvider();
  if (import.meta.env.DEV) {
    console.info('[SmartHome] selected provider', {
      provider: provider.name,
      status: provider.getHealth().status,
      haBaseUrl: import.meta.env.VITE_HA_BASE_URL ?? '(not configured)'
    });
  }
  return provider;
}
