export type DeviceArea = 'salon' | 'outdoor' | 'pool' | 'bedroom' | 'bathroom';

export type DeviceKind = 'switch' | 'light' | 'fan' | 'heater';

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
  | 'bathroomHeater';

export type DeviceState = {
  isOn: boolean;
  isAvailable: boolean;
  brightness?: number;
  fanSpeed?: 0 | 1 | 2 | 3;
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
