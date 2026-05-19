import { create } from 'zustand';
import { devices, initialDeviceStates, scenes } from '../config/devices';
import { createProvider } from '../providers/providerFactory';
import type { ProviderHealth, SmartHomeProvider } from '../providers/SmartHomeProvider';
import type { DeviceId, DeviceState, DeviceStateMap, Scene } from '../types/devices';

type CommandStatus = Record<DeviceId, boolean>;

type SmartHomeStore = {
  devices: typeof devices;
  scenes: Scene[];
  states: DeviceStateMap;
  pending: CommandStatus;
  provider: SmartHomeProvider;
  health: ProviderHealth;
  lastSyncAt?: number;
  error?: string;
  sync: () => Promise<void>;
  setDeviceState: (deviceId: DeviceId, patch: Partial<DeviceState>) => Promise<void>;
  toggleDevice: (deviceId: DeviceId) => Promise<void>;
  setFanSpeed: (deviceId: DeviceId, fanSpeed: 0 | 1 | 2 | 3) => Promise<void>;
  applyScene: (sceneId: string) => Promise<void>;
  allOff: () => Promise<void>;
};

const provider = createProvider();

function mergeStates(current: DeviceStateMap, incoming: Partial<DeviceStateMap>) {
  return Object.keys(current).reduce((next, key) => {
    const deviceId = key as DeviceId;
    next[deviceId] = {
      ...current[deviceId],
      ...incoming[deviceId],
      lastSyncedAt: incoming[deviceId]?.lastSyncedAt ?? current[deviceId].lastSyncedAt
    };
    return next;
  }, {} as DeviceStateMap);
}

export const useSmartHomeStore = create<SmartHomeStore>((set, get) => ({
  devices,
  scenes,
  states: initialDeviceStates,
  pending: {} as CommandStatus,
  provider,
  health: provider.getHealth(),
  async sync() {
    try {
      const states = await get().provider.getStates();
      set((store) => ({
        states: mergeStates(store.states, states),
        health: store.provider.getHealth(),
        lastSyncAt: Date.now(),
        error: undefined
      }));
    } catch (error) {
      set({
        health: { status: 'error', label: 'Sync error' },
        error: error instanceof Error ? error.message : 'Unable to sync devices'
      });
    }
  },
  async setDeviceState(deviceId, patch) {
    const previous = get().states[deviceId];
    const optimisticState = { ...previous, ...patch };

    set((store) => ({
      states: {
        ...store.states,
        [deviceId]: optimisticState
      },
      pending: {
        ...store.pending,
        [deviceId]: true
      },
      error: undefined
    }));

    try {
      const confirmed = await get().provider.setState(deviceId, patch);
      set((store) => ({
        states: {
          ...store.states,
          [deviceId]: { ...optimisticState, ...confirmed }
        },
        pending: {
          ...store.pending,
          [deviceId]: false
        },
        lastSyncAt: Date.now(),
        health: store.provider.getHealth()
      }));
    } catch (error) {
      set((store) => ({
        states: {
          ...store.states,
          [deviceId]: previous
        },
        pending: {
          ...store.pending,
          [deviceId]: false
        },
        health: { status: 'error', label: 'Command failed' },
        error: error instanceof Error ? error.message : 'Unable to control device'
      }));
    }
  },
  async toggleDevice(deviceId) {
    const current = get().states[deviceId];
    await get().setDeviceState(deviceId, {
      isOn: !current.isOn,
      fanSpeed: deviceId === 'ceilingFan' && !current.isOn ? 2 : current.fanSpeed
    });
  },
  async setFanSpeed(deviceId, fanSpeed) {
    await get().setDeviceState(deviceId, {
      fanSpeed,
      isOn: fanSpeed > 0
    });
  },
  async applyScene(sceneId) {
    const scene = get().scenes.find((item) => item.id === sceneId);
    if (!scene) {
      return;
    }

    await Promise.all(
      Object.entries(scene.deviceStates).map(([deviceId, patch]) =>
        get().setDeviceState(deviceId as DeviceId, patch)
      )
    );
  },
  async allOff() {
    await Promise.all(
      get().devices.map((device) =>
        get().setDeviceState(device.id, {
          isOn: false,
          fanSpeed: device.kind === 'fan' ? 0 : undefined
        })
      )
    );
  }
}));
