import type { DeviceId, DeviceState, DeviceStateMap } from '../types/devices';

export type ProviderStatus = 'mock' | 'connected' | 'unconfigured' | 'error';

export type ProviderHealth = {
  status: ProviderStatus;
  label: string;
};

export interface SmartHomeProvider {
  readonly name: string;
  getHealth(): ProviderHealth;
  getStates(): Promise<DeviceStateMap>;
  setState(deviceId: DeviceId, patch: Partial<DeviceState>): Promise<DeviceState>;
}
