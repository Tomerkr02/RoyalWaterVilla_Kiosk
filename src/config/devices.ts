import type { Device, DeviceArea, DeviceId, DeviceStateMap, Scene } from '../types/devices';

export const areaLabels: Record<DeviceArea, string> = {
  salon: 'Salon',
  outdoor: 'Terrace',
  pool: 'Pool',
  bedroom: 'Bedroom',
  bathroom: 'Bathroom'
};

export const devices: Device[] = [
  {
    id: 'salonCeilingSpots',
    name: 'Salon ceiling spots',
    subtitle: 'Warm recessed lighting',
    area: 'salon',
    kind: 'light',
    entityId: 'switch.tvrt_slvn_salon_light_switch_1',
    tuya: { deviceId: 'bfae97a0468699bf6es1mx', commandCode: 'switch_2' }
  },
  {
    id: 'salonLedWall',
    name: 'Salon LED wall',
    subtitle: 'Ambient feature wall',
    area: 'salon',
    kind: 'light',
    entityId: 'switch.tvrt_slvn_salon_light_switch_2',
    tuya: { deviceId: 'bfae97a0468699bf6es1mx', commandCode: 'switch_1' }
  },
  {
    id: 'pergolaLight',
    name: 'Pergola light',
    subtitle: 'Outdoor canopy',
    area: 'outdoor',
    kind: 'light',
    entityId: 'switch.tvrt_prgvlh_pergola_light_switch_1',
    tuya: { deviceId: 'bfa046217ed22cbb88x6mw', commandCode: 'switch_1' }
  },
  {
    id: 'wallLight',
    name: 'Wall light',
    subtitle: 'Perimeter wall',
    area: 'outdoor',
    kind: 'light',
    entityId: 'switch.tvrt_khvmh_wall_light_switch_1',
    tuya: { deviceId: 'bffcde940e008e6f8bsiaj', commandCode: 'switch_1' }
  },
  {
    id: 'backPathwayLight',
    name: 'Back pathway light',
    subtitle: 'Rear garden path',
    area: 'outdoor',
    kind: 'light',
    entityId: 'switch.tvrt_shbyl_khvry_back_pathway_light_switch_1',
    tuya: { deviceId: 'bfb7a879c0ebf0c6e66lc2', commandCode: 'switch_1' }
  },
  {
    id: 'poolLight',
    name: 'Pool light',
    subtitle: 'Waterline glow',
    area: 'pool',
    kind: 'light',
    entityId: 'switch.tvrt_brykh_vbr_pool_light_bar_switch_1',
    tuya: { deviceId: 'bf2af07eae210d7a388lkx', commandCode: 'switch_2' }
  },
  {
    id: 'outdoorBarLight',
    name: 'Outdoor bar light',
    subtitle: 'Pool bar counter',
    area: 'pool',
    kind: 'light',
    entityId: 'switch.tvrt_brykh_vbr_pool_light_bar_switch_2',
    tuya: { deviceId: 'bf2af07eae210d7a388lkx', commandCode: 'switch_1' }
  },
  {
    id: 'outdoorWallLight',
    name: 'Outdoor wall light',
    subtitle: 'Outside shower wall',
    area: 'outdoor',
    kind: 'light',
    entityId: 'switch.tvrt_mbtyh_vld_qyr_khvts_shower_outside_wall_switch_1',
    tuya: { deviceId: 'bfe6a09f4ad1838449xayz', commandCode: 'switch_1' }
  },
  {
    id: 'bathroomLight',
    name: 'Bathroom light',
    subtitle: 'Shower wall switch',
    area: 'bathroom',
    kind: 'light',
    entityId: 'switch.tvrt_mbtyh_vld_qyr_khvts_shower_outside_wall_switch_2',
    tuya: { deviceId: 'bfe6a09f4ad1838449xayz', commandCode: 'switch_2' }
  },
  {
    id: 'bedroomFanLight',
    name: 'Bedroom fan light',
    subtitle: 'Ceiling fixture',
    area: 'bedroom',
    kind: 'light',
    entityId: 'light.ceiling_fan_with_light',
    tuya: { deviceId: 'bfed21a4097abed981lg6y', commandCode: 'light' }
  },
  {
    id: 'ceilingFan',
    name: 'Ceiling fan',
    subtitle: 'Bedroom airflow',
    area: 'bedroom',
    kind: 'fan',
    entityId: 'fan.ceiling_fan_with_light',
    tuya: { deviceId: 'bfed21a4097abed981lg6y', commandCode: 'switch' }
  },
  {
    id: 'bathroomHeater',
    name: 'Bathroom heater',
    subtitle: 'Shower comfort',
    area: 'bathroom',
    kind: 'heater',
    entityId: 'climate.royal_heater',
    tuya: { deviceId: 'bfeb1883831883a9225uan', commandCode: 'switch' }
  }
];

export const deviceById = Object.fromEntries(devices.map((device) => [device.id, device])) as Record<DeviceId, Device>;

export const initialDeviceStates: DeviceStateMap = Object.fromEntries(
  devices.map((device) => [
    device.id,
    {
      isOn: false,
      isAvailable: true,
      fanSpeed: device.kind === 'fan' ? 0 : undefined
    }
  ])
) as DeviceStateMap;

export const scenes: Scene[] = [
  {
    id: 'arrival',
    name: 'Arrival',
    description: 'Warm salon and terrace lighting for check-in.',
    deviceStates: {
      salonCeilingSpots: { isOn: true },
      salonLedWall: { isOn: true },
      pergolaLight: { isOn: true },
      wallLight: { isOn: true }
    }
  },
  {
    id: 'poolEvening',
    name: 'Pool Evening',
    description: 'Pool, bar, and pergola lighting for a relaxed night swim.',
    deviceStates: {
      poolLight: { isOn: true },
      outdoorBarLight: { isOn: true },
      pergolaLight: { isOn: true },
      backPathwayLight: { isOn: true }
    }
  },
  {
    id: 'sleep',
    name: 'Sleep',
    description: 'Turn off shared lights and keep the bedroom ready.',
    deviceStates: {
      salonCeilingSpots: { isOn: false },
      salonLedWall: { isOn: false },
      pergolaLight: { isOn: false },
      wallLight: { isOn: false },
      backPathwayLight: { isOn: false },
      poolLight: { isOn: false },
      outdoorBarLight: { isOn: false },
      outdoorWallLight: { isOn: false },
      bathroomLight: { isOn: false },
      bedroomFanLight: { isOn: false },
      bathroomHeater: { isOn: false }
    }
  }
];
