export type DeviceArea = 'salon' | 'outdoor' | 'pool' | 'bedroom' | 'bathroom';

export type DeviceKind = 'switch' | 'light' | 'fan' | 'heater' | 'climate';

export type HvacMode = 'cool' | 'heat' | 'auto' | 'fan_only' | 'off';

export type DeviceId =
  | 'salonCeilingSpots'
  | 'salonLedWall'
  | 'pergolaLight'
  | 'wallLight'
  | 'backPathwayLight'
  | 'poolLight'
  | 'outdoorBarLight'
  | 'outdoorWallLight'
  | 'bathroomLight'
  | 'bedroomFanLight'
  | 'ceilingFan'
  | 'bedroomAc'
  | 'bathroomHeater';

export type DeviceState = {
  isOn: boolean;
  isAvailable: boolean;
  brightness?: number;
  fanSpeed?: 0 | 1 | 2 | 3;
  currentTemperature?: number;
  targetTemperature?: number;
  hvacMode?: HvacMode;
  hvacAction?: string;
  lastSyncedAt?: number;
};

export type Device = {
  id: DeviceId;
  name: string;
  subtitle: string;
  area: DeviceArea;
  kind: DeviceKind;
  entityId?: string;
  tuya?: {
    deviceId: string;
    commandCode: string;
  };
};

export type DeviceStateMap = Record<DeviceId, DeviceState>;

export type Scene = {
  id: 'arrival' | 'poolEvening' | 'sleep';
  name: string;
  description: string;
  deviceStates: Partial<Record<DeviceId, Partial<DeviceState>>>;
};
