import { devices } from '../config/devices';
import type { DeviceId, DeviceState, DeviceStateMap } from '../types/devices';
import type { SmartHomeProvider } from './SmartHomeProvider';

type HomeAssistantEntity = {
  entity_id: string;
  state: string;
  attributes?: {
    percentage?: number;
    brightness?: number;
  };
};

type HomeAssistantConfig = {
  baseUrl: string;
  token: string;
};

const deviceByEntity = new Map(devices.filter((device) => device.entityId).map((device) => [device.entityId, device]));

function envConfig(): HomeAssistantConfig | null {
  const baseUrl = import.meta.env.VITE_HA_URL as string | undefined;
  const token = import.meta.env.VITE_HA_TOKEN as string | undefined;

  if (!baseUrl || !token) {
    return null;
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ''),
    token
  };
}

function domainFor(entityId: string) {
  return entityId.split('.')[0];
}

function serviceFor(deviceId: DeviceId, isOn: boolean) {
  const device = devices.find((item) => item.id === deviceId);
  if (!device?.entityId) {
    throw new Error(`Missing Home Assistant entity for ${deviceId}`);
  }

  const domain = domainFor(device.entityId);
  if (domain === 'climate') {
    return { domain, service: 'set_hvac_mode', data: { hvac_mode: isOn ? 'heat' : 'off' } };
  }

  return { domain, service: isOn ? 'turn_on' : 'turn_off', data: {} };
}

async function request<T>(config: HomeAssistantConfig, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
      ...init?.headers
    }
  });

  if (!response.ok) {
    throw new Error(`Home Assistant request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function createHomeAssistantProvider(): SmartHomeProvider | null {
  const config = envConfig();

  if (!config) {
    return null;
  }

  return {
    name: 'Home Assistant',
    getHealth: () => ({ status: 'connected', label: 'Home Assistant' }),
    async getStates() {
      const entities = await request<HomeAssistantEntity[]>(config, '/api/states');
      const mapped = entities.reduce<Partial<DeviceStateMap>>((stateMap, entity) => {
        const device = deviceByEntity.get(entity.entity_id);
        if (!device) {
          return stateMap;
        }

        stateMap[device.id] = {
          isOn: entity.state === 'on' || entity.state === 'heat',
          isAvailable: entity.state !== 'unavailable' && entity.state !== 'unknown',
          brightness: entity.attributes?.brightness,
          fanSpeed: entity.attributes?.percentage ? Math.ceil(entity.attributes.percentage / 33) as 1 | 2 | 3 : undefined,
          lastSyncedAt: Date.now()
        };
        return stateMap;
      }, {});

      return mapped as DeviceStateMap;
    },
    async setState(deviceId, patch) {
      const device = devices.find((item) => item.id === deviceId);
      if (!device?.entityId) {
        throw new Error(`Missing Home Assistant entity for ${deviceId}`);
      }

      if (typeof patch.isOn === 'boolean') {
        const service = serviceFor(deviceId, patch.isOn);
        await request(config, `/api/services/${service.domain}/${service.service}`, {
          method: 'POST',
          body: JSON.stringify({ entity_id: device.entityId, ...service.data })
        });
      }

      if (device.kind === 'fan' && typeof patch.fanSpeed === 'number') {
        await request(config, '/api/services/fan/set_percentage', {
          method: 'POST',
          body: JSON.stringify({ entity_id: device.entityId, percentage: patch.fanSpeed * 33 })
        });
      }

      const entity = await request<HomeAssistantEntity>(config, `/api/states/${device.entityId}`);
      return {
        isOn: entity.state === 'on' || entity.state === 'heat',
        isAvailable: entity.state !== 'unavailable' && entity.state !== 'unknown',
        brightness: entity.attributes?.brightness,
        fanSpeed: entity.attributes?.percentage ? Math.ceil(entity.attributes.percentage / 33) as 1 | 2 | 3 : undefined,
        lastSyncedAt: Date.now()
      };
    }
  };
}
