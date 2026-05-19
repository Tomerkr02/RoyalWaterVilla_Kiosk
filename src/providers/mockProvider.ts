import { initialDeviceStates } from '../config/devices';
import type { DeviceId, DeviceState, DeviceStateMap } from '../types/devices';
import type { SmartHomeProvider } from './SmartHomeProvider';

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function createMockProvider(): SmartHomeProvider {
  let states: DeviceStateMap = structuredClone(initialDeviceStates);

  return {
    name: 'Mock Villa',
    getHealth: () => ({ status: 'mock', label: 'Mock Mode' }),
    async getStates() {
      await delay(160);
      return structuredClone(states);
    },
    async getState(deviceId: DeviceId) {
      await delay(90);
      return structuredClone(states[deviceId]);
    },
    async setState(deviceId: DeviceId, patch: Partial<DeviceState>) {
      await delay(220);
      const nextState = {
        ...states[deviceId],
        ...patch,
        lastSyncedAt: Date.now()
      };
      states = { ...states, [deviceId]: nextState };
      return structuredClone(nextState);
    }
  };
}
