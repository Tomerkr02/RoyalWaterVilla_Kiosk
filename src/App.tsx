import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bath,
  BedDouble,
  Check,
  CirclePower,
  Clock3,
  Fan,
  Gauge,
  Home,
  Lamp,
  Moon,
  Power,
  ShieldCheck,
  Sofa,
  Sun,
  ThermometerSun,
  Trees,
  Waves,
  Wifi
} from 'lucide-react';
import blueWaterNightImage from './assets/images/royal-water-villa-blue-water-night-view-25.png';
import { useI18n, useLanguageStore } from './i18n/useLanguageStore';
import type { Language, Translation } from './i18n/translations';
import { useSmartHomeStore } from './store/useSmartHomeStore';
import type { Device, DeviceArea, DeviceId } from './types/devices';

type View = DeviceArea | 'allDevices';

const areaTabs: Array<{ id: View; icon: typeof Home; deviceIds: DeviceId[] }> = [
  { id: 'salon', icon: Sofa, deviceIds: ['salonCeilingSpots', 'salonLedWall'] },
  { id: 'outdoor', icon: Trees, deviceIds: ['pergolaLight', 'wallLight', 'backPathwayLight', 'outdoorWallLight'] },
  { id: 'pool', icon: Waves, deviceIds: ['poolLight', 'outdoorBarLight'] },
  { id: 'bedroom', icon: BedDouble, deviceIds: ['bedroomFanLight', 'ceilingFan'] },
  { id: 'bathroom', icon: Bath, deviceIds: ['bathroomLight', 'bathroomHeater'] },
  {
    id: 'allDevices',
    icon: Lamp,
    deviceIds: [
      'salonCeilingSpots',
      'salonLedWall',
      'pergolaLight',
      'wallLight',
      'backPathwayLight',
      'outdoorWallLight',
      'poolLight',
      'outdoorBarLight',
      'bathroomLight',
      'bedroomFanLight'
    ]
  }
];

const areaIcons: Record<DeviceArea, typeof Home> = {
  salon: Sofa,
  outdoor: Trees,
  pool: Waves,
  bedroom: BedDouble,
  bathroom: ThermometerSun
};

const allDeviceIds = areaTabs.find((tab) => tab.id === 'allDevices')?.deviceIds ?? [];
const lightDeviceIds = allDeviceIds.filter((deviceId) => deviceId !== 'ceilingFan' && deviceId !== 'bathroomHeater');

function providerLabel(status: string, t: Translation) {
  if (status === 'mock') return t.app.mockMode;
  if (status === 'connected') return t.app.connected;
  return t.app.error;
}

function useClock(language: Language) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const locale = language === 'he' ? 'he-IL' : language === 'fr' ? 'fr-FR' : 'en-US';
  return {
    time: new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(now),
    date: new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' }).format(now)
  };
}

function formatTime(timestamp: number | undefined, language: Language, fallback: string) {
  if (!timestamp) return fallback;
  const locale = language === 'he' ? 'he-IL' : language === 'fr' ? 'fr-FR' : 'en-US';
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(timestamp);
}

function LanguageSwitcher() {
  const { language, t } = useI18n();
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const languages: Language[] = ['he', 'en', 'fr'];

  return (
    <div className="rwv-language" aria-label="Language">
      {languages.map((item) => (
        <button
          key={item}
          type="button"
          className={['rwv-language-button', language === item ? 'rwv-language-active' : ''].join(' ')}
          onClick={() => setLanguage(item)}
        >
          {item === 'he' ? '🇮🇱' : item === 'en' ? '🇺🇸' : '🇫🇷'}
          <span>{t.languageLabels[item]}</span>
        </button>
      ))}
    </div>
  );
}

function LogoMark() {
  return (
    <div className="rwv-logo">
      <div className="rwv-crown">♛</div>
      <div>
        <span>Royal</span>
        <span>Water Villa</span>
      </div>
    </div>
  );
}

function AreaTabs({ selectedView, setSelectedView }: { selectedView: View; setSelectedView: (view: View) => void }) {
  const { t } = useI18n();

  return (
    <nav className="rwv-area-tabs" aria-label="Area navigation">
      {areaTabs.map((item) => {
        const Icon = item.icon;
        const active = item.id === selectedView;
        return (
          <motion.button
            key={item.id}
            type="button"
            whileTap={{ scale: 0.96 }}
            className={['rwv-area-tab', active ? 'rwv-area-tab-active' : ''].join(' ')}
            onClick={() => setSelectedView(item.id)}
          >
            <Icon size={21} />
            <span>{t.dashboard.areas[item.id].label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}

function TopBar({ selectedView, setSelectedView }: { selectedView: View; setSelectedView: (view: View) => void }) {
  const { language } = useI18n();
  const clock = useClock(language);

  return (
    <header className="rwv-topbar">
      <LanguageSwitcher />
      <AreaTabs selectedView={selectedView} setSelectedView={setSelectedView} />
      <div className="rwv-clock">
        <Clock3 size={18} />
        <div>
          <strong>{clock.time}</strong>
          <span>{clock.date}</span>
        </div>
      </div>
      <LogoMark />
    </header>
  );
}

function Toggle({ isOn, pending, onClick, label }: { isOn: boolean; pending?: boolean; onClick: () => void; label: string }) {
  const { dir } = useI18n();
  const activePosition = dir === 'rtl' ? 'translate-x-1.5' : 'translate-x-[3.15rem]';
  const inactivePosition = dir === 'rtl' ? 'translate-x-[3.15rem]' : 'translate-x-1.5';

  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={isOn}
      whileTap={{ scale: 0.92 }}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={['rwv-toggle', isOn ? 'rwv-toggle-on' : '', pending ? 'animate-pulse' : ''].join(' ')}
    >
      <motion.span layout transition={{ type: 'spring', stiffness: 520, damping: 34 }} className={isOn ? activePosition : inactivePosition}>
        {isOn ? <Check size={16} /> : <CirclePower size={16} />}
      </motion.span>
    </motion.button>
  );
}

function DeviceCard({ device }: { device: Device }) {
  const { language, t } = useI18n();
  const state = useSmartHomeStore((store) => store.states[device.id]);
  const pending = useSmartHomeStore((store) => store.pending[device.id]);
  const error = useSmartHomeStore((store) => store.error);
  const toggleDevice = useSmartHomeStore((store) => store.toggleDevice);
  const setFanSpeed = useSmartHomeStore((store) => store.setFanSpeed);
  const Icon = areaIcons[device.area] ?? Lamp;
  const copy = t.devices[device.id];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.985 }}
      className={['rwv-device-card', state.isOn ? 'rwv-device-on' : '', error ? 'rwv-device-error' : ''].join(' ')}
      onClick={() => void toggleDevice(device.id)}
    >
      <div className="rwv-device-top">
        <div className="rwv-device-icon">
          <Icon size={24} />
        </div>
        <Toggle
          isOn={state.isOn}
          pending={pending}
          label={`${state.isOn ? t.app.turnOff : t.app.turnOn} ${copy.name}`}
          onClick={() => void toggleDevice(device.id)}
        />
      </div>
      <h3>{copy.name}</h3>
      <p>{copy.subtitle}</p>
      <div className="rwv-device-status">
        <span className={state.isOn ? 'rwv-status-on' : 'rwv-status-off'}>{state.isOn ? t.app.on : t.app.off}</span>
        <small>{pending ? t.app.sending : `${t.app.synced} ${formatTime(state.lastSyncedAt, language, t.app.notSynced)}`}</small>
      </div>
      {device.kind === 'fan' ? (
        <div className="rwv-fan-speed">
          {([0, 1, 2, 3] as const).map((speed) => (
            <button
              key={speed}
              type="button"
              className={state.fanSpeed === speed ? 'active' : ''}
              onClick={(event) => {
                event.stopPropagation();
                void setFanSpeed(device.id, speed);
              }}
            >
              {speed === 0 ? t.app.fanOff : speed}
            </button>
          ))}
        </div>
      ) : null}
    </motion.article>
  );
}

function QuickActions() {
  const { t } = useI18n();
  const applyScene = useSmartHomeStore((store) => store.applyScene);
  const setDeviceState = useSmartHomeStore((store) => store.setDeviceState);

  const setAllLightsOff = () => {
    void Promise.all(lightDeviceIds.map((deviceId) => setDeviceState(deviceId, { isOn: false })));
  };

  const actions = [
    { label: t.dashboard.quickNight, icon: Moon, tone: 'purple', action: () => applyScene('sleep') },
    { label: t.dashboard.quickDay, icon: Sun, tone: 'amber', action: () => applyScene('arrival') },
    { label: t.dashboard.quickPool, icon: Waves, tone: 'cyan', action: () => applyScene('poolEvening') },
    { label: t.dashboard.quickAllLightsOff, icon: Power, tone: 'pink', action: setAllLightsOff }
  ];

  return (
    <div className="rwv-quick-panel">
      <h3>{t.dashboard.quickActions}</h3>
      <div className="rwv-quick-actions">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button key={item.label} type="button" whileTap={{ scale: 0.95 }} className={`rwv-quick-action rwv-quick-${item.tone}`} onClick={() => void item.action()}>
              <Icon size={25} />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function Hero() {
  const { t } = useI18n();
  return (
    <section className="rwv-hero">
      <img src={blueWaterNightImage} alt="" />
      <div className="rwv-hero-shade" />
      <div className="rwv-hero-content">
        <p>{t.dashboard.welcome}</p>
        <h1>{t.dashboard.heroTitle}</h1>
        <h2>{t.dashboard.heroSubtitle}</h2>
      </div>
      <QuickActions />
    </section>
  );
}

function AllLightsActions() {
  const { t } = useI18n();
  const setDeviceState = useSmartHomeStore((store) => store.setDeviceState);
  const setAllLights = (isOn: boolean) => {
    void Promise.all(lightDeviceIds.map((deviceId) => setDeviceState(deviceId, { isOn })));
  };

  return (
    <div className="rwv-all-light-actions">
      <motion.button type="button" whileTap={{ scale: 0.98 }} className="rwv-light-action rwv-all-on" onClick={() => setAllLights(true)}>
        <Sun size={22} />
        <strong>{t.dashboard.allLightsOn}</strong>
      </motion.button>
      <motion.button type="button" whileTap={{ scale: 0.98 }} className="rwv-light-action rwv-all-off" onClick={() => setAllLights(false)}>
        <Moon size={22} />
        <strong>{t.dashboard.allLightsOff}</strong>
      </motion.button>
    </div>
  );
}

function AreaDevicePanel({ selectedView }: { selectedView: View }) {
  const { t } = useI18n();
  const devices = useSmartHomeStore((store) => store.devices);
  const selectedTab = areaTabs.find((tab) => tab.id === selectedView) ?? areaTabs[0];
  const visibleDevices = useMemo(() => devices.filter((device) => selectedTab.deviceIds.includes(device.id)), [devices, selectedTab.deviceIds]);

  return (
    <section className="rwv-devices-section">
      <div className="rwv-panel-heading">
        <div>
          <span>{t.dashboard.selectedArea}</span>
          <h2>{t.dashboard.areas[selectedView].label}</h2>
        </div>
        <div className="rwv-panel-count">{selectedTab.deviceIds.length} {t.dashboard.devicesCount}</div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={selectedView} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          {selectedView === 'allDevices' ? <AllLightsActions /> : null}
          <div className="rwv-device-grid">
            {visibleDevices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function BottomStatusCards() {
  const { t } = useI18n();
  const health = useSmartHomeStore((store) => store.health);
  const cards = [
    { icon: ShieldCheck, title: `Home Assistant ${providerLabel(health.status, t)}`, subtitle: t.dashboard.connected, className: 'rwv-status-green' },
    { icon: Wifi, title: `${t.dashboard.network} Royal Water Villa`, subtitle: t.dashboard.connected, className: 'rwv-status-wifi' },
    { icon: Gauge, title: t.dashboard.systemOk, subtitle: t.dashboard.systemNormal, className: 'rwv-status-neutral' }
  ];

  return (
    <footer className="rwv-bottom-status">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className={`rwv-bottom-card ${card.className}`}>
            <Icon size={23} />
            <div>
              <strong>{card.title}</strong>
              <span>{card.subtitle}</span>
            </div>
          </div>
        );
      })}
    </footer>
  );
}

function DevDebugPanel() {
  const { t } = useI18n();
  const health = useSmartHomeStore((store) => store.health);
  const debug = useSmartHomeStore((store) => store.debug);
  if (!import.meta.env.DEV) return null;

  return (
    <aside className="debug-panel">
      <strong>{t.app.debugTitle}</strong>
      <span>{t.app.providerStatus}: {providerLabel(health.status, t)}</span>
      <span>{t.app.lastHaError}: {debug.lastHaError ?? t.app.none}</span>
      <span>{t.app.lastEntityAction}: {debug.lastEntityAction ?? t.app.none}</span>
    </aside>
  );
}

export function App() {
  const [selectedView, setSelectedView] = useState<View>('salon');
  const sync = useSmartHomeStore((store) => store.sync);
  const { dir, t } = useI18n();

  useEffect(() => {
    void sync();
    const handleVisible = () => {
      if (document.visibilityState === 'visible') void sync();
    };
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', handleVisible);
    return () => {
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [sync]);

  return (
    <div className="rwv-shell" dir={dir}>
      <TopBar selectedView={selectedView} setSelectedView={setSelectedView} />
      <main className="rwv-dashboard">
        <Hero />
        <AreaDevicePanel selectedView={selectedView} />
      </main>
      <BottomStatusCards />
      <DevDebugPanel />
      <div className="rotate-hint">{t.app.rotateHint}</div>
    </div>
  );
}
