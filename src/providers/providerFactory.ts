import { createHomeAssistantProvider } from './homeAssistantProvider';
import { createMockProvider } from './mockProvider';
import type { SmartHomeProvider } from './SmartHomeProvider';

export function createProvider(): SmartHomeProvider {
  return createHomeAssistantProvider() ?? createMockProvider();
}
