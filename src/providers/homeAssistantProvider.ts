import { devices } from '../config/devices';
import type { Device, DeviceId, DeviceState, DeviceStateMap } from '../types/devices';
import type { SmartHomeProvider } from './SmartHomeProvider';

type HomeAssistantEntity = {
  entity_id: string;
  state: string;
  attributes?: {
    brightness?: number;
    percentage?: number;
  };
};

type HomeAssistantConfig = {
  apiBaseUrl: string;
  configuredBaseUrl: string;
};

const mappedDevices = devices.filter((device) => device.entityId);
const deviceById = new Map(mappedDevices.map((device) => [device.id, device]));
const deviceByEntity = new Map(mappedDevices.map((device) => [device.entityId, device]));

function envConfig(): HomeAssistantConfig | null {
  const haBaseUrl = import.meta.env.VITE_HA_BASE_URL as string | undefined;

  if (!haBaseUrl) {
    return null;
  }

  return {
    apiBaseUrl: import.meta.env.DEV ? '/ha-api' : haBaseUrl.replace(/\/$/, ''),
    configuredBaseUrl: haBaseUrl.replace(/\/$/, '')
  };
}

function domainFor(entityId: string) {
  return entityId.split('.')[0];
}

function toDeviceState(entity: HomeAssistantEntity): DeviceState {
  const unavailable = entity.state === 'unavailable' || entity.state === 'unknown';
  const percentage = entity.attributes?.percentage;

  return {
    isOn: entity.state === 'on' || entity.state === 'heat',
    isAvailable: !unavailable,
    brightness: entity.attributes?.brightness,
    fanSpeed: typeof percentage === 'number' ? (Math.max(1, Math.ceil(percentage / 33)) as 1 | 2 | 3) : undefined,
    lastSyncedAt: Date.now()
  };
}

async function request<T>(config: HomeAssistantConfig, path: string, init?: RequestInit): Promise<T> {
  const requestUrl = `${config.apiBaseUrl}${path}`;
  const response = await fetch(requestUrl, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers
    }
  });
  const responseBody = await response.text().catch(() => '');

  if (import.meta.env.DEV) {
    console.info('[HA] response', {
      requestUrl,
      configuredBaseUrl: config.configuredBaseUrl,
      status: response.status,
      responseBody: responseBody || '(empty)'
    });
  }

  if (!response.ok) {
    throw new Error(`Home Assistant request failed: ${response.status}${responseBody ? ` ${responseBody}` : ''}`);
  }

  if (response.status === 204 || !responseBody) {
    return undefined as T;
  }

  return JSON.parse(responseBody) as T;
}

function getMappedDevice(deviceId: DeviceId): Device {
  const device = deviceById.get(deviceId);
  if (!device?.entityId) {
    throw new Error(`Missing Home Assistant entity for ${deviceId}`);
  }

  return device;
}

function serviceFor(device: Device, isOn: boolean) {
  const domain = domainFor(device.entityId ?? '');

  if (!['switch', 'light', 'fan', 'climate'].includes(domain)) {
    throw new Error(`Unsupported Home Assistant domain: ${domain}`);
  }

  return {
    domain,
    service: isOn ? 'turn_on' : 'turn_off'
  };
}

async function callPowerService(config: HomeAssistantConfig, device: Device, isOn: boolean) {
  const service = serviceFor(device, isOn);
  if (import.meta.env.DEV) {
    console.info('[HA] command', {
      haBaseUrl: config.configuredBaseUrl,
      mappedEntityId: device.entityId,
      deviceId: device.id,
      targetState: isOn,
      serviceDomain: service.domain,
      serviceName: service.service,
      requestUrl: `${config.apiBaseUrl}/api/services/${service.domain}/${service.service}`
    });
  }
  await request<unknown>(config, `/api/services/${service.domain}/${service.service}`, {
    method: 'POST',
    body: JSON.stringify({ entity_id: device.entityId })
  });
}

async function callClimateService(config: HomeAssistantConfig, device: Device, isOn: boolean) {
  try {
    await callPowerService(config, device, isOn);
  } catch (error) {
    const hvacMode = isOn ? 'heat' : 'off';
    if (import.meta.env.DEV) {
      console.warn('[HA] climate turn_on/turn_off failed, falling back to climate.set_hvac_mode', {
        deviceId: device.id,
        mappedEntityId: device.entityId,
        targetState: isOn,
        hvacMode,
        error
      });
    }
    await request<unknown>(config, '/api/services/climate/set_hvac_mode', {
      method: 'POST',
      body: JSON.stringify({ entity_id: device.entityId, hvac_mode: hvacMode })
    });
  }
}

async function fetchEntityState(config: HomeAssistantConfig, device: Device) {
  if (import.meta.env.DEV) {
    console.info('[HA] fetch entity state', {
      haBaseUrl: config.configuredBaseUrl,
      mappedEntityId: device.entityId,
      deviceId: device.id,
      requestUrl: `${config.apiBaseUrl}/api/states/${device.entityId}`
    });
  }
  const entity = await request<HomeAssistantEntity>(config, `/api/states/${device.entityId}`);
  if (import.meta.env.DEV) {
    console.info('[HA] mapped current state', {
      mappedEntityId: device.entityId,
      deviceId: device.id,
      currentState: entity.state,
      attributes: entity.attributes
    });
  }
  return toDeviceState(entity);
}

export function createHomeAssistantProvider(): SmartHomeProvider | null {
  const config = envConfig();

  if (!config) {
    return null;
  }

  return {
    name: 'Home Assistant',
    getHealth: () => ({ status: 'connected', label: 'Connected' }),
    async getStates() {
      const entityStates = await Promise.all(
        mappedDevices.map(async (device) => {
          const entity = await request<HomeAssistantEntity>(config, `/api/states/${device.entityId}`);
          return [device.id, toDeviceState(entity)] as const;
        })
      );

      return Object.fromEntries(entityStates) as DeviceStateMap;
    },
    async getState(deviceId) {
      return fetchEntityState(config, getMappedDevice(deviceId));
    },
    async setState(deviceId, patch) {
      const device = getMappedDevice(deviceId);

      if (typeof patch.isOn === 'boolean') {
        if (domainFor(device.entityId ?? '') === 'climate') {
          await callClimateService(config, device, patch.isOn);
        } else {
          await callPowerService(config, device, patch.isOn);
        }
      }

      if (device.kind === 'fan' && typeof patch.fanSpeed === 'number') {
        if (patch.fanSpeed === 0) {
          await callPowerService(config, device, false);
        } else {
          await callPowerService(config, device, true);
          await request<unknown>(config, '/api/services/fan/set_percentage', {
            method: 'POST',
            body: JSON.stringify({ entity_id: device.entityId, percentage: patch.fanSpeed * 33 })
          });
        }
      }

      return fetchEntityState(config, device);
    }
  };
}

export function hasMappedEntity(entityId: string) {
  return deviceByEntity.has(entityId);
}
