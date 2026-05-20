import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devices, initialDeviceStates, scenes } from '../config/devices';
import { createProvider } from '../providers/providerFactory';
import type { ProviderHealth, SmartHomeProvider } from '../providers/SmartHomeProvider';
import type { DeviceId, DeviceState, DeviceStateMap, Scene } from '../types/devices';

type CommandStatus = Record<DeviceId, boolean>;

type DebugInfo = {
  lastHaError?: string;
  lastEntityAction?: string;
};

export type ShabbatScheduleItem = {
  id: string;
  type: 'on' | 'off';
  label: string;
  time: string;
};

type ShabbatDeviceSchedule = {
  schedule: ShabbatScheduleItem[];
};

type ShabbatModeState = {
  active: boolean;
  devices: Record<DeviceId, ShabbatDeviceSchedule>;
};

type ShabbatExecutionStatus = 'waiting' | 'success' | 'failed';

type ShabbatExecutionState = {
  status: ShabbatExecutionStatus;
  lastAction?: string;
  lastRunAt?: number;
  lastError?: string;
  perDevice: Partial<Record<DeviceId, ShabbatExecutionStatus>>;
};

type SmartHomeStore = {
  devices: typeof devices;
  scenes: Scene[];
  states: DeviceStateMap;
  pending: CommandStatus;
  provider: SmartHomeProvider;
  health: ProviderHealth;
  lastSyncAt?: number;
  error?: string;
  debug: DebugInfo;
  shabbatMode: ShabbatModeState;
  shabbatExecution: ShabbatExecutionState;
  sync: () => Promise<void>;
  setDeviceState: (deviceId: DeviceId, patch: Partial<DeviceState>) => Promise<void>;
  toggleDevice: (deviceId: DeviceId) => Promise<void>;
  setFanSpeed: (deviceId: DeviceId, fanSpeed: 0 | 1 | 2 | 3) => Promise<void>;
  applyScene: (sceneId: string) => Promise<void>;
  allOff: () => Promise<void>;
  setShabbatModeActive: (active: boolean) => void;
  setShabbatScheduleTime: (deviceId: DeviceId, scheduleId: string, time: string) => void;
  runShabbatScheduler: () => Promise<void>;
};

const provider = createProvider();
const targetedSyncDelays = [300, 900, 1800] as const;
const defaultShabbatLabels = ['הדלקה', 'כיבוי', 'הדלקה', 'כיבוי'] as const;
const executedStorageKey = 'royal-water-villa-shabbat-executed-actions';
let shabbatRunnerBusy = false;

function createDefaultShabbatMode(): ShabbatModeState {
  return {
    active: false,
    devices: Object.fromEntries(
      devices.map((device) => [
        device.id,
        {
          schedule: defaultShabbatLabels.map((label, index) => ({
            id: `${device.id}-shabbat-${index + 1}`,
            type: index % 2 === 0 ? 'on' : 'off',
            label,
            time: ''
          }))
        }
      ])
    ) as Record<DeviceId, ShabbatDeviceSchedule>
  };
}

function mergeShabbatMode(persisted?: Partial<ShabbatModeState>): ShabbatModeState {
  const defaults = createDefaultShabbatMode();
  return {
    active: persisted?.active ?? defaults.active,
    devices: Object.fromEntries(
      devices.map((device) => [
        device.id,
        {
          schedule: persisted?.devices?.[device.id]?.schedule ?? defaults.devices[device.id].schedule
        }
      ])
    ) as Record<DeviceId, ShabbatDeviceSchedule>
  };
}

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

function createDefaultExecutionState(): ShabbatExecutionState {
  return {
    status: 'waiting',
    perDevice: {}
  };
}

function isValidScheduleTime(time: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

function dateKey(now: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
}

function minuteKey(now: Date) {
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function readExecutedKeys(today: string) {
  if (typeof window === 'undefined') return new Set<string>();
  try {
    const stored = JSON.parse(window.localStorage.getItem(executedStorageKey) ?? '[]') as string[];
    return new Set(stored.filter((key) => key.startsWith(`${today}:`)));
  } catch {
    return new Set<string>();
  }
}

function writeExecutedKeys(keys: Set<string>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(executedStorageKey, JSON.stringify([...keys]));
}

export const useSmartHomeStore = create<SmartHomeStore>()(
  persist(
    (set, get) => ({
  devices,
  scenes,
  states: initialDeviceStates,
  pending: {} as CommandStatus,
  provider,
  health: provider.getHealth(),
  debug: {},
  shabbatMode: createDefaultShabbatMode(),
  shabbatExecution: createDefaultExecutionState(),
  async sync() {
    try {
      const states = await get().provider.getStates();
      set((store) => ({
        states: mergeStates(store.states, states),
        health: store.provider.getHealth(),
        lastSyncAt: Date.now(),
        error: undefined,
        debug: {
          ...store.debug,
          lastHaError: undefined
        }
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sync devices';
      set({
        health: { status: 'error', label: 'Error' },
        error: message,
        debug: {
          ...get().debug,
          lastHaError: message
        }
      });
    }
  },
  async setDeviceState(deviceId, patch) {
    const previous = get().states[deviceId];
    const optimisticState = { ...previous, ...patch };
    const device = get().devices.find((item) => item.id === deviceId);
    const targetState = typeof patch.isOn === 'boolean' ? patch.isOn : optimisticState.isOn;
    const actionLabel = `${deviceId} -> ${targetState ? 'on' : 'off'} (${device?.entityId ?? 'no entity'})`;

    if (import.meta.env.DEV) {
      console.info('[SmartHome] optimistic command', {
        provider: get().provider.name,
        deviceId,
        mappedEntityId: device?.entityId,
        currentState: previous,
        targetState,
        patch
      });
    }

    set((store) => ({
      states: {
        ...store.states,
        [deviceId]: optimisticState
      },
      pending: {
        ...store.pending,
        [deviceId]: true
      },
      error: undefined,
      debug: {
        ...store.debug,
        lastEntityAction: actionLabel,
        lastHaError: undefined
      }
    }));
    targetedSyncDelays.forEach((delay) => {
      window.setTimeout(() => {
        void (async () => {
          try {
            const refreshed = await get().provider.getState(deviceId);
            const isFinalRefresh = delay === targetedSyncDelays[targetedSyncDelays.length - 1];
            const shouldApplyRefresh = isFinalRefresh || typeof patch.isOn !== 'boolean' || refreshed.isOn === targetState;

            set((store) => ({
              states: shouldApplyRefresh
                ? {
                    ...store.states,
                    [deviceId]: {
                      ...store.states[deviceId],
                      ...refreshed
                    }
                  }
                : store.states,
              pending: {
                ...store.pending,
                [deviceId]: isFinalRefresh ? false : store.pending[deviceId]
              },
              lastSyncAt: shouldApplyRefresh ? Date.now() : store.lastSyncAt,
              health: store.provider.getHealth()
            }));

            if (import.meta.env.DEV) {
              console.info('[SmartHome] targeted entity refresh', {
                provider: get().provider.name,
                deviceId,
                mappedEntityId: device?.entityId,
                delayMs: delay,
                applied: shouldApplyRefresh,
                refreshed
              });
            }
          } catch (error) {
            const isFinalRefresh = delay === targetedSyncDelays[targetedSyncDelays.length - 1];
            if (isFinalRefresh) {
              set((store) => ({
                pending: {
                  ...store.pending,
                  [deviceId]: false
                }
              }));
            }
            if (import.meta.env.DEV) {
              console.warn('[SmartHome] targeted entity refresh failed', {
                provider: get().provider.name,
                deviceId,
                mappedEntityId: device?.entityId,
                delayMs: delay,
                error
              });
            }
          }
        })();
      }, delay);
    });

    try {
      const confirmed = await get().provider.setState(deviceId, patch);
      if (import.meta.env.DEV) {
        console.info('[SmartHome] confirmed entity sync', {
          provider: get().provider.name,
          deviceId,
          mappedEntityId: device?.entityId,
          confirmed
        });
      }
      const shouldApplyConfirmed = get().provider.name === 'Mock' || typeof patch.isOn !== 'boolean' || confirmed.isOn === targetState;
      set((store) => ({
        states: shouldApplyConfirmed
          ? {
              ...store.states,
              [deviceId]: { ...optimisticState, ...confirmed }
            }
          : store.states,
        pending: {
          ...store.pending,
          [deviceId]: store.provider.name === 'Mock' ? false : store.pending[deviceId]
        },
        lastSyncAt: shouldApplyConfirmed ? Date.now() : store.lastSyncAt,
        health: store.provider.getHealth(),
        debug: {
          ...store.debug,
          lastEntityAction: `${actionLabel} confirmed`
        }
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to control device';
      if (import.meta.env.DEV) {
        console.error('[SmartHome] command failed and reverted', {
          provider: get().provider.name,
          deviceId,
          mappedEntityId: device?.entityId,
          previous,
          optimisticState,
          error
        });
      }
      set((store) => ({
        states: {
          ...store.states,
          [deviceId]: previous
        },
        pending: {
          ...store.pending,
          [deviceId]: false
        },
        health: { status: 'error', label: 'Error' },
        error: message,
        debug: {
          ...store.debug,
          lastEntityAction: `${actionLabel} failed`,
          lastHaError: message
        }
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
  },
  setShabbatModeActive(active) {
    set((store) => ({
      shabbatMode: {
        ...store.shabbatMode,
        active
      }
    }));
  },
  setShabbatScheduleTime(deviceId, scheduleId, time) {
    set((store) => ({
      shabbatMode: {
        ...store.shabbatMode,
        devices: {
          ...store.shabbatMode.devices,
          [deviceId]: {
            schedule: store.shabbatMode.devices[deviceId].schedule.map((item) =>
              item.id === scheduleId ? { ...item, time } : item
            )
          }
        }
      }
    }));
  },
  async runShabbatScheduler() {
    if (shabbatRunnerBusy) return;

    const store = get();
    if (!store.shabbatMode.active) {
      set((current) => ({
        shabbatExecution: {
          ...current.shabbatExecution,
          status: 'waiting'
        }
      }));
      return;
    }

    shabbatRunnerBusy = true;
    const now = new Date();
    const today = dateKey(now);
    const currentMinute = minuteKey(now);
    const executedKeys = readExecutedKeys(today);
    let ranAction = false;

    try {
      for (const device of store.devices) {
        const state = get().states[device.id];
        const schedules = get().shabbatMode.devices[device.id]?.schedule ?? [];

        if (!state?.isAvailable) {
          continue;
        }

        for (const item of schedules) {
          if (!item.time || !isValidScheduleTime(item.time) || item.time !== currentMinute) {
            continue;
          }

          const executionKey = `${today}:${device.id}:${item.id}:${item.time}:${item.type}`;
          if (executedKeys.has(executionKey)) {
            continue;
          }

          ranAction = true;
          executedKeys.add(executionKey);
          writeExecutedKeys(executedKeys);

          const targetIsOn = item.type === 'on';
          const action = `${device.id} ${item.type} ${item.time}`;

          set((current) => ({
            shabbatExecution: {
              ...current.shabbatExecution,
              status: 'waiting',
              lastAction: action,
              lastRunAt: Date.now(),
              lastError: undefined,
              perDevice: {
                ...current.shabbatExecution.perDevice,
                [device.id]: 'waiting'
              }
            }
          }));

          try {
            await get().setDeviceState(device.id, {
              isOn: targetIsOn,
              fanSpeed: device.kind === 'fan' && targetIsOn ? 2 : device.kind === 'fan' ? 0 : undefined
            });

            set((current) => ({
              shabbatExecution: {
                ...current.shabbatExecution,
                status: 'success',
                lastAction: action,
                lastRunAt: Date.now(),
                lastError: undefined,
                perDevice: {
                  ...current.shabbatExecution.perDevice,
                  [device.id]: 'success'
                }
              }
            }));
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Shabbat action failed';
            set((current) => ({
              shabbatExecution: {
                ...current.shabbatExecution,
                status: 'failed',
                lastAction: action,
                lastRunAt: Date.now(),
                lastError: message,
                perDevice: {
                  ...current.shabbatExecution.perDevice,
                  [device.id]: 'failed'
                }
              }
            }));
          }
        }
      }

      if (!ranAction) {
        set((current) => ({
          shabbatExecution: {
            ...current.shabbatExecution,
            status: 'waiting'
          }
        }));
      }
    } finally {
      shabbatRunnerBusy = false;
    }
  }
}),
    {
      name: 'royal-water-villa-shabbat-mode',
      partialize: (state) => ({ shabbatMode: state.shabbatMode }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<SmartHomeStore> | undefined;
        return {
          ...current,
          shabbatMode: mergeShabbatMode(persistedState?.shabbatMode)
        };
      }
    }
  )
);
