import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bath,
  BedDouble,
  Check,
  CirclePower,
  Home,
  Lamp,
  Moon,
  Power,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  ThermometerSun,
  Trees,
  Waves
} from 'lucide-react';
import bedroomImage from './assets/images/royal-water-villa-bedroom-lighting-design-18.png';
import blueWaterNightImage from './assets/images/royal-water-villa-blue-water-night-view-25.png';
import outdoorImage from './assets/images/royal-water-villa-outdoor-lounge-night-08.png';
import poolImage from './assets/images/royal-water-villa-pool-fruit-tray-20.png';
import { KioskButton } from './components/KioskButton';
import { useI18n, useLanguageStore } from './i18n/useLanguageStore';
import type { Language, Translation } from './i18n/translations';
import { useSmartHomeStore } from './store/useSmartHomeStore';
import type { Device, DeviceArea } from './types/devices';

type View = 'overview' | DeviceArea | 'quick';

const areaIcons: Record<DeviceArea, typeof Home> = {
  salon: Home,
  outdoor: Trees,
  pool: Waves,
  bedroom: BedDouble,
  bathroom: ThermometerSun
};

const sectionTabs: Array<{ id: View; icon: typeof Home }> = [
  { id: 'overview', icon: Home },
  { id: 'salon', icon: Lamp },
  { id: 'outdoor', icon: Trees },
  { id: 'pool', icon: Waves },
  { id: 'bedroom', icon: BedDouble },
  { id: 'bathroom', icon: Bath },
  { id: 'quick', icon: Sparkles }
];

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 }
};

function formatTime(timestamp: number | undefined, language: Language, notSynced: string) {
  if (!timestamp) {
    return notSynced;
  }

  const locale = language === 'he' ? 'he-IL' : language === 'fr' ? 'fr-FR' : 'en-US';
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(timestamp);
}

function providerLabel(status: string, t: Translation) {
  if (status === 'mock') {
    return t.app.mockMode;
  }
  if (status === 'connected') {
    return t.app.connected;
  }
  return t.app.error;
}

function LanguageSwitcher() {
  const { language, t } = useI18n();
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const languages: Language[] = ['he', 'en', 'fr'];

  return (
    <div className="language-switcher" aria-label="Language">
      {languages.map((item) => (
        <motion.button
          key={item}
          type="button"
          whileTap={{ scale: 0.94 }}
          className={['language-button', language === item ? 'language-button-active' : ''].join(' ')}
          onClick={() => setLanguage(item)}
        >
          {t.languageLabels[item]}
        </motion.button>
      ))}
    </div>
  );
}

function Toggle({
  isOn,
  pending,
  onClick,
  label
}: {
  isOn: boolean;
  pending?: boolean;
  onClick: () => void;
  label: string;
}) {
  const { dir } = useI18n();
  const activePosition = dir === 'rtl' ? 'translate-x-1.5' : 'translate-x-[4.15rem]';
  const inactivePosition = dir === 'rtl' ? 'translate-x-[4.15rem]' : 'translate-x-1.5';

  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={isOn}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      whileTap={{ scale: 0.92 }}
      className={[
        'relative h-16 w-32 shrink-0 rounded-full border transition duration-150',
        isOn ? 'border-gold bg-gold/90 shadow-glow' : 'border-white/20 bg-white/10',
        pending ? 'animate-pulse' : ''
      ].join(' ')}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 520, damping: 34 }}
        className={[
          'absolute top-1.5 grid h-[3.25rem] w-[3.25rem] place-items-center rounded-full bg-pearl text-ink shadow-xl',
          isOn ? activePosition : inactivePosition
        ].join(' ')}
      >
        {isOn ? <Check size={18} /> : <CirclePower size={18} />}
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
  const Icon = areaIcons[device.area];
  const copy = t.devices[device.id];

  return (
    <motion.article
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      className={['device-card', state.isOn ? 'device-card-on' : '', error ? 'device-card-error' : ''].join(' ')}
      onClick={() => void toggleDevice(device.id)}
    >
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-white/10 text-gold">
            <Icon size={26} />
          </div>
          <h3 className="text-2xl font-semibold leading-tight text-pearl">{copy.name}</h3>
          <p className="mt-2 text-base leading-6 text-mist">{copy.subtitle}</p>
        </div>
        <Toggle
          isOn={state.isOn}
          pending={pending}
          label={`${state.isOn ? t.app.turnOff : t.app.turnOn} ${copy.name}`}
          onClick={() => void toggleDevice(device.id)}
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <span className={state.isOn ? 'status-pill-on' : 'status-pill-off'}>{state.isOn ? t.app.on : t.app.off}</span>
        <span className="text-sm text-mist">
          {pending ? t.app.sending : `${t.app.synced} ${formatTime(state.lastSyncedAt, language, t.app.notSynced)}`}
        </span>
      </div>

      {device.kind === 'fan' ? (
        <div className="mt-6 grid grid-cols-4 gap-2">
          {([0, 1, 2, 3] as const).map((speed) => (
            <motion.button
              key={speed}
              type="button"
              whileTap={{ scale: 0.94 }}
              className={[
                'rounded-lg border px-3 py-3 text-sm font-bold transition',
                state.fanSpeed === speed ? 'border-gold bg-gold text-ink' : 'border-white/10 bg-white/10 text-pearl'
              ].join(' ')}
              onClick={(event) => {
                event.stopPropagation();
                void setFanSpeed(device.id, speed);
              }}
            >
              {speed === 0 ? t.app.fanOff : speed}
            </motion.button>
          ))}
        </div>
      ) : null}
    </motion.article>
  );
}

function HeroPanel({ setView }: { setView: (view: View) => void }) {
  const { language, t } = useI18n();
  const states = useSmartHomeStore((store) => store.states);
  const allOff = useSmartHomeStore((store) => store.allOff);
  const sync = useSmartHomeStore((store) => store.sync);
  const health = useSmartHomeStore((store) => store.health);
  const lastSyncAt = useSmartHomeStore((store) => store.lastSyncAt);
  const activeCount = Object.values(states).filter((state) => state.isOn).length;

  return (
    <motion.section className="hero-panel" layout>
      <img src={blueWaterNightImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/60 to-ink/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-between p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="section-kicker">{t.sections.overview.kicker}</p>
            <h1 className="max-w-3xl text-6xl font-semibold leading-[1.02] text-pearl">{t.sections.overview.title}</h1>
          </div>
          <div className="glass-chip">
            <ShieldCheck size={20} className="text-gold" />
            <span>{providerLabel(health.status, t)}</span>
          </div>
        </div>
        <div>
          <p className="max-w-2xl text-xl leading-8 text-mist">{t.sections.overview.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <KioskButton tone="primary" icon={<Lamp size={22} />} onClick={() => setView('salon')}>
              {t.app.startLights}
            </KioskButton>
            <KioskButton icon={<Sparkles size={22} />} onClick={() => setView('quick')}>
              {t.app.scenes}
            </KioskButton>
            <KioskButton icon={<Power size={22} />} tone="danger" onClick={() => void allOff()}>
              {t.app.allOff}
            </KioskButton>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <button type="button" className="metric-card" onClick={() => setView('overview')}>
            <span>{activeCount}</span>
            <small>{t.app.devicesActive}</small>
          </button>
          <button type="button" className="metric-card" onClick={() => void sync()}>
            <span>{formatTime(lastSyncAt, language, t.app.notSynced)}</span>
            <small>{t.app.lastSync}</small>
          </button>
          <button type="button" className="metric-card" onClick={() => setView('pool')}>
            <span>{t.nav.pool}</span>
            <small>{t.app.poolReady}</small>
          </button>
        </div>
      </div>
    </motion.section>
  );
}

function QuickActionsPanel() {
  const { t } = useI18n();
  const scenes = useSmartHomeStore((store) => store.scenes);
  const applyScene = useSmartHomeStore((store) => store.applyScene);
  const allOff = useSmartHomeStore((store) => store.allOff);

  return (
    <section className="panel p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="section-kicker">{t.app.oneTap}</p>
          <h2 className="text-3xl font-semibold text-pearl">{t.app.quickActions}</h2>
        </div>
        <Sparkles className="text-gold" size={30} />
      </div>
      <div className="grid gap-3">
        {scenes.map((scene) => (
          <motion.button
            key={scene.id}
            type="button"
            whileTap={{ scale: 0.975 }}
            className="scene-row"
            onClick={() => void applyScene(scene.id)}
          >
            <span>
              <strong>{t.scenes[scene.id].name}</strong>
              <small>{t.scenes[scene.id].description}</small>
            </span>
            <Sparkles size={20} />
          </motion.button>
        ))}
        <motion.button type="button" whileTap={{ scale: 0.975 }} className="scene-row scene-row-danger" onClick={() => void allOff()}>
          <span>
            <strong>{t.app.villaOff}</strong>
            <small>{t.app.villaOffDescription}</small>
          </span>
          <Power size={20} />
        </motion.button>
      </div>
    </section>
  );
}

function AmbientImagePanel() {
  return (
    <div className="ambient-stack">
      <img src={outdoorImage} alt="" />
      <img src={poolImage} alt="" />
    </div>
  );
}

function HomeView({ setView }: { setView: (view: View) => void }) {
  return (
    <div className="dashboard-grid">
      <HeroPanel setView={setView} />
      <div className="side-stack">
        <QuickActionsPanel />
        <AmbientImagePanel />
      </div>
    </div>
  );
}

function SectionHeader({ view, count }: { view: View; count: number }) {
  const { t } = useI18n();
  const copy = t.sections[view];
  const activeTab = sectionTabs.find((tab) => tab.id === view);
  const Icon = activeTab?.icon ?? Home;

  return (
    <motion.div className="section-header" layout>
      <div className="section-icon">
        <Icon size={28} />
      </div>
      <div>
        <p className="section-kicker">{copy.kicker}</p>
        <h1>{copy.title}</h1>
        <p>
          {copy.subtitle} {view !== 'quick' && view !== 'overview' ? `${count} ${t.app.mappedControls}.` : ''}
        </p>
      </div>
    </motion.div>
  );
}

function DeviceGrid({ view }: { view: Exclude<View, 'quick'> }) {
  const devices = useSmartHomeStore((store) => store.devices);
  const visibleDevices = view === 'overview' ? devices : devices.filter((device) => device.area === view);

  return (
    <div>
      <SectionHeader view={view} count={visibleDevices.length} />
      <motion.div className="device-grid" initial="hidden" animate="visible" transition={{ staggerChildren: 0.045 }}>
        {visibleDevices.map((device: Device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </motion.div>
    </div>
  );
}

function ScenesView() {
  const { t } = useI18n();
  const scenes = useSmartHomeStore((store) => store.scenes);
  const applyScene = useSmartHomeStore((store) => store.applyScene);
  const allOff = useSmartHomeStore((store) => store.allOff);
  const imageMap = [outdoorImage, poolImage, bedroomImage];

  return (
    <div>
      <SectionHeader view="quick" count={scenes.length} />
      <div className="scene-grid">
        {scenes.map((scene, index) => (
          <motion.button
            key={scene.id}
            type="button"
            whileTap={{ scale: 0.982 }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="scene-card"
            onClick={() => void applyScene(scene.id)}
          >
            <img src={imageMap[index % imageMap.length]} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/35 to-transparent" />
            <span className="relative z-10 mt-auto block p-6 text-left">
              <Sparkles className="mb-5 text-gold" size={32} />
              <strong className="block text-4xl font-semibold text-pearl">{t.scenes[scene.id].name}</strong>
              <small className="mt-3 block text-lg leading-7 text-mist">{t.scenes[scene.id].description}</small>
            </span>
          </motion.button>
        ))}
        <motion.button
          type="button"
          whileTap={{ scale: 0.982 }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: scenes.length * 0.04 }}
          className="scene-card scene-card-off"
          onClick={() => void allOff()}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-coral/35 via-ink to-ink" />
          <span className="relative z-10 mt-auto block p-6 text-left">
            <Moon className="mb-5 text-coral" size={32} />
            <strong className="block text-4xl font-semibold text-pearl">{t.app.villaOff}</strong>
            <small className="mt-3 block text-lg leading-7 text-mist">{t.app.villaOffDescription}</small>
          </span>
        </motion.button>
      </div>
    </div>
  );
}

function DevDebugPanel() {
  const { t } = useI18n();
  const health = useSmartHomeStore((store) => store.health);
  const debug = useSmartHomeStore((store) => store.debug);

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <aside className="debug-panel">
      <strong>{t.app.debugTitle}</strong>
      <span>
        {t.app.providerStatus}: {providerLabel(health.status, t)}
      </span>
      <span>
        {t.app.lastHaError}: {debug.lastHaError ?? t.app.none}
      </span>
      <span>
        {t.app.lastEntityAction}: {debug.lastEntityAction ?? t.app.none}
      </span>
    </aside>
  );
}

function Header({ view, setView }: { view: View; setView: (view: View) => void }) {
  const { language, t } = useI18n();
  const sync = useSmartHomeStore((store) => store.sync);
  const health = useSmartHomeStore((store) => store.health);
  const lastSyncAt = useSmartHomeStore((store) => store.lastSyncAt);
  const states = useSmartHomeStore((store) => store.states);
  const activeCount = Object.values(states).filter((state) => state.isOn).length;

  return (
    <header className="top-bar">
      <div>
        <p className="section-kicker">{t.app.guestTablet}</p>
        <h2>{t.app.brand}</h2>
      </div>
      <div className="section-tabs" aria-label="Villa sections">
        {sectionTabs.map((item) => {
          const Icon = item.icon;
          const active = item.id === view;
          return (
            <motion.button
              key={item.id}
              type="button"
              title={t.nav[item.id]}
              aria-label={t.nav[item.id]}
              aria-pressed={active}
              whileTap={{ scale: 0.94 }}
              onClick={() => setView(item.id)}
              className={['section-tab', active ? 'section-tab-active' : ''].join(' ')}
            >
              <Icon size={22} />
              <span>{t.nav[item.id]}</span>
            </motion.button>
          );
        })}
      </div>
      <div className="top-status">
        <LanguageSwitcher />
        <span className="connection-pill">
          <span className="status-dot" />
          {activeCount} {t.app.active}
        </span>
        <span className={['connection-pill', health.status === 'error' ? 'connection-error' : ''].join(' ')}>
          {providerLabel(health.status, t)} · {formatTime(lastSyncAt, language, t.app.notSynced)}
        </span>
        <KioskButton icon={<RefreshCw size={20} />} onClick={() => void sync()} aria-label={t.app.sync}>
          {t.app.sync}
        </KioskButton>
      </div>
    </header>
  );
}

export function App() {
  const [view, setView] = useState<View>('overview');
  const sync = useSmartHomeStore((store) => store.sync);
  const { dir, t } = useI18n();

  useEffect(() => {
    void sync();

    const handleVisible = () => {
      if (document.visibilityState === 'visible') {
        void sync();
      }
    };

    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', handleVisible);

    return () => {
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [sync]);

  const content =
    view === 'overview' ? <HomeView setView={setView} /> : view === 'quick' ? <ScenesView /> : <DeviceGrid view={view} />;

  return (
    <div className="min-h-screen overflow-hidden bg-ink text-pearl" dir={dir}>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,181,109,0.14),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(15,106,107,0.42),transparent_34%),linear-gradient(135deg,#061818,#092c2f_48%,#061818)]" />
      <main className="relative z-10 flex h-screen flex-col overflow-hidden p-4">
        <div className="rotate-hint">{t.app.rotateHint}</div>
        <Header view={view} setView={setView} />
        <section className="min-h-0 flex-1 overflow-y-auto pr-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {content}
            </motion.div>
          </AnimatePresence>
        </section>
        <DevDebugPanel />
        <div className="home-indicator" />
      </main>
    </div>
  );
}
