import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bath,
  BedDouble,
  Check,
  CirclePower,
  Fan,
  Home,
  Lamp,
  Moon,
  Power,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
  ThermometerSun,
  Trees,
  Waves
} from 'lucide-react';
import bedroomImage from './assets/images/royal-water-villa-bedroom-lighting-design-18.png';
import blueWaterNightImage from './assets/images/royal-water-villa-blue-water-night-view-25.png';
import outdoorImage from './assets/images/royal-water-villa-outdoor-lounge-night-08.png';
import poolImage from './assets/images/royal-water-villa-pool-fruit-tray-20.png';
import { KioskButton } from './components/KioskButton';
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

const sectionTabs: Array<{ id: View; label: string; icon: typeof Home }> = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'salon', label: 'Salon', icon: Lamp },
  { id: 'outdoor', label: 'Pergola', icon: Trees },
  { id: 'pool', label: 'Pool', icon: Waves },
  { id: 'bedroom', label: 'Bedroom', icon: BedDouble },
  { id: 'bathroom', label: 'Heater', icon: Bath },
  { id: 'quick', label: 'Actions', icon: Sparkles }
];

const sectionCopy: Record<View, { kicker: string; title: string; subtitle: string }> = {
  overview: {
    kicker: 'Royal Water Villa',
    title: 'Guest comfort, tuned instantly.',
    subtitle: 'A calm wall-mounted control surface for lighting, pool ambience, bedroom airflow, and bathroom heat.'
  },
  salon: {
    kicker: 'Salon',
    title: 'Warm interior atmosphere.',
    subtitle: 'Ceiling spots and ambient wall lighting for arrival, hosting, and quiet evenings.'
  },
  outdoor: {
    kicker: 'Outdoor / Pergola',
    title: 'Terrace lighting with one touch.',
    subtitle: 'Pergola, wall, and back pathway controls for the villa exterior.'
  },
  pool: {
    kicker: 'Pool',
    title: 'Evening glow by the water.',
    subtitle: 'Pool and bar lighting for night swims and outdoor hosting.'
  },
  bedroom: {
    kicker: 'Bedroom',
    title: 'Soft light and airflow.',
    subtitle: 'Fan light and ceiling fan controls designed for bedside use.'
  },
  bathroom: {
    kicker: 'Bathroom heater',
    title: 'Fast shower comfort.',
    subtitle: 'A simple heat control with clear status for guests.'
  },
  quick: {
    kicker: 'Quick actions',
    title: 'Scenes for the whole villa.',
    subtitle: 'Apply polished presets immediately, then confirm state through the provider layer.'
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 }
};

function formatTime(timestamp?: number) {
  if (!timestamp) {
    return 'Not synced';
  }

  return new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(timestamp);
}

function Toggle({ isOn, pending, onClick, label }: { isOn: boolean; pending?: boolean; onClick: () => void; label: string }) {
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
          isOn ? 'translate-x-[4.15rem]' : 'translate-x-1.5'
        ].join(' ')}
      >
        {isOn ? <Check size={18} /> : <CirclePower size={18} />}
      </motion.span>
    </motion.button>
  );
}

function DeviceCard({ device }: { device: Device }) {
  const state = useSmartHomeStore((store) => store.states[device.id]);
  const pending = useSmartHomeStore((store) => store.pending[device.id]);
  const toggleDevice = useSmartHomeStore((store) => store.toggleDevice);
  const setFanSpeed = useSmartHomeStore((store) => store.setFanSpeed);
  const Icon = areaIcons[device.area];

  return (
    <motion.article
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      className={['device-card', state.isOn ? 'device-card-on' : ''].join(' ')}
      onClick={() => void toggleDevice(device.id)}
    >
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-white/10 text-gold">
            <Icon size={26} />
          </div>
          <h3 className="text-2xl font-semibold leading-tight text-pearl">{device.name}</h3>
          <p className="mt-2 text-base leading-6 text-mist">{device.subtitle}</p>
        </div>
        <Toggle
          isOn={state.isOn}
          pending={pending}
          label={`${state.isOn ? 'Turn off' : 'Turn on'} ${device.name}`}
          onClick={() => void toggleDevice(device.id)}
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <span className={state.isOn ? 'status-pill-on' : 'status-pill-off'}>{state.isOn ? 'On' : 'Off'}</span>
        <span className="text-sm text-mist">{pending ? 'Sending...' : `Synced ${formatTime(state.lastSyncedAt)}`}</span>
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
              {speed === 0 ? 'Off' : speed}
            </motion.button>
          ))}
        </div>
      ) : null}
    </motion.article>
  );
}

function HeroPanel({ setView }: { setView: (view: View) => void }) {
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
            <p className="section-kicker">Royal Water Villa</p>
            <h1 className="max-w-3xl text-6xl font-semibold leading-[1.02] text-pearl">Guest comfort, tuned instantly.</h1>
          </div>
          <div className="glass-chip">
            <ShieldCheck size={20} className="text-gold" />
            <span>{health.label}</span>
          </div>
        </div>
        <div>
          <p className="max-w-2xl text-xl leading-8 text-mist">
            Salon lighting, pergola ambience, pool glow, bedroom airflow, and bathroom heat in one calm tablet surface.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <KioskButton tone="primary" icon={<Lamp size={22} />} onClick={() => setView('salon')}>
              Start Lights
            </KioskButton>
            <KioskButton icon={<Sparkles size={22} />} onClick={() => setView('quick')}>
              Scenes
            </KioskButton>
            <KioskButton icon={<Power size={22} />} tone="danger" onClick={() => void allOff()}>
              All Off
            </KioskButton>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <button type="button" className="metric-card" onClick={() => setView('overview')}>
            <span>{activeCount}</span>
            <small>devices active</small>
          </button>
          <button type="button" className="metric-card" onClick={() => void sync()}>
            <span>{formatTime(lastSyncAt)}</span>
            <small>last sync</small>
          </button>
          <button type="button" className="metric-card" onClick={() => setView('pool')}>
            <span>Pool</span>
            <small>evening ready</small>
          </button>
        </div>
      </div>
    </motion.section>
  );
}

function QuickActionsPanel() {
  const scenes = useSmartHomeStore((store) => store.scenes);
  const applyScene = useSmartHomeStore((store) => store.applyScene);
  const allOff = useSmartHomeStore((store) => store.allOff);

  return (
    <section className="panel p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="section-kicker">One tap</p>
          <h2 className="text-3xl font-semibold text-pearl">Quick actions</h2>
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
              <strong>{scene.name}</strong>
              <small>{scene.description}</small>
            </span>
            <Sparkles size={20} />
          </motion.button>
        ))}
        <motion.button type="button" whileTap={{ scale: 0.975 }} className="scene-row scene-row-danger" onClick={() => void allOff()}>
          <span>
            <strong>Villa Off</strong>
            <small>Power down all mapped guest devices.</small>
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
      <img src={outdoorImage} alt="Royal Water Villa outdoor lounge at night" />
      <img src={poolImage} alt="Royal Water Villa pool setting" />
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
  const copy = sectionCopy[view];
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
          {copy.subtitle} {view !== 'quick' && view !== 'overview' ? `${count} mapped controls.` : ''}
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
              <strong className="block text-4xl font-semibold text-pearl">{scene.name}</strong>
              <small className="mt-3 block text-lg leading-7 text-mist">{scene.description}</small>
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
            <strong className="block text-4xl font-semibold text-pearl">Villa Off</strong>
            <small className="mt-3 block text-lg leading-7 text-mist">Quiet everything for the night.</small>
          </span>
        </motion.button>
      </div>
    </div>
  );
}

function Header({ view, setView }: { view: View; setView: (view: View) => void }) {
  const sync = useSmartHomeStore((store) => store.sync);
  const health = useSmartHomeStore((store) => store.health);
  const lastSyncAt = useSmartHomeStore((store) => store.lastSyncAt);
  const error = useSmartHomeStore((store) => store.error);
  const states = useSmartHomeStore((store) => store.states);
  const activeCount = Object.values(states).filter((state) => state.isOn).length;

  return (
    <header className="top-bar">
      <div>
        <p className="section-kicker">Guest tablet</p>
        <h2>Royal Water Villa</h2>
      </div>
      <div className="section-tabs" aria-label="Villa sections">
        {sectionTabs.map((item) => {
          const Icon = item.icon;
          const active = item.id === view;
          return (
            <motion.button
              key={item.id}
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-pressed={active}
              whileTap={{ scale: 0.94 }}
              onClick={() => setView(item.id)}
              className={['section-tab', active ? 'section-tab-active' : ''].join(' ')}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </div>
      <div className="top-status">
        <span className="connection-pill">
          <span className="status-dot" />
          {activeCount} active
        </span>
        <span className={['connection-pill', health.status === 'error' ? 'connection-error' : ''].join(' ')}>
          {error ?? health.label} · {formatTime(lastSyncAt)}
        </span>
        <KioskButton icon={<RefreshCw size={20} />} onClick={() => void sync()} aria-label="Sync">
          Sync
        </KioskButton>
      </div>
    </header>
  );
}

export function App() {
  const [view, setView] = useState<View>('overview');
  const sync = useSmartHomeStore((store) => store.sync);

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
    <div className="min-h-screen overflow-hidden bg-ink text-pearl">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,181,109,0.14),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(15,106,107,0.42),transparent_34%),linear-gradient(135deg,#061818,#092c2f_48%,#061818)]" />
      <main className="relative z-10 flex h-screen flex-col overflow-hidden p-4">
        <div className="rotate-hint">For the best experience, rotate the tablet to landscape.</div>
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
        <div className="home-indicator" />
      </main>
    </div>
  );
}
