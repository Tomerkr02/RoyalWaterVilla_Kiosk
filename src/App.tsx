import { useEffect, useMemo, useState } from 'react';
import {
  Bath,
  BedDouble,
  Fan,
  Flame,
  Home,
  Lamp,
  Moon,
  Power,
  RefreshCw,
  Sparkles,
  Sun,
  Trees,
  Waves
} from 'lucide-react';
import blueWaterNightImage from './assets/images/royal-water-villa-blue-water-night-view-25.png';
import bedroomImage from './assets/images/royal-water-villa-bedroom-lighting-design-18.png';
import outdoorImage from './assets/images/royal-water-villa-outdoor-lounge-night-08.png';
import poolImage from './assets/images/royal-water-villa-pool-fruit-tray-20.png';
import { KioskButton } from './components/KioskButton';
import { areaLabels } from './config/devices';
import { useSmartHomeStore } from './store/useSmartHomeStore';
import type { Device, DeviceArea, DeviceId } from './types/devices';

type View = 'home' | 'lights' | 'scenes' | 'comfort';

const areaIcons: Record<DeviceArea, typeof Home> = {
  salon: Home,
  outdoor: Trees,
  pool: Waves,
  bedroom: BedDouble,
  bathroom: Bath
};

const navItems: Array<{ id: View; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Villa', icon: Home },
  { id: 'lights', label: 'Lights', icon: Lamp },
  { id: 'scenes', label: 'Scenes', icon: Sparkles },
  { id: 'comfort', label: 'Comfort', icon: Fan }
];

function formatTime(timestamp?: number) {
  if (!timestamp) {
    return 'Not synced yet';
  }

  return new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(timestamp);
}

function Toggle({ isOn, pending, onClick, label }: { isOn: boolean; pending?: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isOn}
      onClick={onClick}
      className={[
        'touch-feedback relative h-14 w-28 shrink-0 rounded-full border transition',
        isOn ? 'border-gold bg-gold/90 shadow-glow' : 'border-white/15 bg-white/10',
        pending ? 'animate-pulse' : ''
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-1.5 h-11 w-11 rounded-full bg-pearl shadow-xl transition-transform',
          isOn ? 'translate-x-14' : 'translate-x-1.5'
        ].join(' ')}
      />
    </button>
  );
}

function DeviceCard({ device }: { device: Device }) {
  const state = useSmartHomeStore((store) => store.states[device.id]);
  const pending = useSmartHomeStore((store) => store.pending[device.id]);
  const toggleDevice = useSmartHomeStore((store) => store.toggleDevice);
  const setFanSpeed = useSmartHomeStore((store) => store.setFanSpeed);
  const Icon = areaIcons[device.area];

  return (
    <article className={['device-card', state.isOn ? 'device-card-on' : ''].join(' ')}>
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-gold">
            <Icon size={26} />
          </div>
          <h3 className="text-2xl font-semibold leading-tight text-pearl">{device.name}</h3>
          <p className="mt-2 text-base text-mist">{device.subtitle}</p>
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
            <button
              key={speed}
              type="button"
              className={[
                'touch-feedback rounded-lg border px-3 py-3 text-sm font-bold transition',
                state.fanSpeed === speed ? 'border-gold bg-gold text-ink' : 'border-white/10 bg-white/10 text-pearl'
              ].join(' ')}
              onClick={() => void setFanSpeed(device.id, speed)}
            >
              {speed === 0 ? 'Off' : speed}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function HeroPanel({ setView }: { setView: (view: View) => void }) {
  const states = useSmartHomeStore((store) => store.states);
  const allOff = useSmartHomeStore((store) => store.allOff);
  const activeCount = Object.values(states).filter((state) => state.isOn).length;

  return (
    <section className="hero-panel">
      <img src={blueWaterNightImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/92 via-ink/50 to-ink/10" />
      <div className="relative z-10 flex h-full max-w-3xl flex-col justify-end p-8">
        <p className="mb-3 text-lg font-semibold uppercase tracking-[0.18em] text-gold">Royal Water Villa</p>
        <h1 className="text-6xl font-semibold leading-tight text-pearl">Welcome home by the water</h1>
        <p className="mt-5 max-w-2xl text-xl leading-8 text-mist">
          Control lights, pool ambience, bedroom comfort, and bathroom heat with instant tablet feedback.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <KioskButton tone="primary" icon={<Lamp size={22} />} onClick={() => setView('lights')}>
            Lighting
          </KioskButton>
          <KioskButton icon={<Power size={22} />} tone="danger" onClick={() => void allOff()}>
            All Off
          </KioskButton>
        </div>
        <div className="mt-8 inline-flex w-fit items-center gap-3 rounded-lg border border-white/10 bg-black/25 px-4 py-3 text-pearl backdrop-blur-xl">
          <Sun size={20} className="text-gold" />
          <span className="text-lg font-semibold">{activeCount}</span>
          <span className="text-mist">devices active</span>
        </div>
      </div>
    </section>
  );
}

function HomeView({ setView }: { setView: (view: View) => void }) {
  const scenes = useSmartHomeStore((store) => store.scenes);
  const applyScene = useSmartHomeStore((store) => store.applyScene);

  return (
    <div className="grid h-full grid-cols-[1.25fr_0.75fr] gap-5">
      <HeroPanel setView={setView} />
      <div className="grid gap-5">
        <img src={outdoorImage} alt="Royal Water Villa outdoor lounge at night" className="h-56 w-full rounded-lg object-cover shadow-panel" />
        <section className="panel">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-3xl font-semibold text-pearl">Signature scenes</h2>
            <Sparkles className="text-gold" size={28} />
          </div>
          <div className="grid gap-3">
            {scenes.slice(0, 2).map((scene) => (
              <button key={scene.id} type="button" className="scene-row touch-feedback" onClick={() => void applyScene(scene.id)}>
                <span>
                  <strong>{scene.name}</strong>
                  <small>{scene.description}</small>
                </span>
                <Sparkles size={20} />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function DeviceGrid({ filter }: { filter?: (device: Device) => boolean }) {
  const devices = useSmartHomeStore((store) => store.devices);
  const visibleDevices = filter ? devices.filter(filter) : devices;
  const grouped = useMemo(
    () =>
      visibleDevices.reduce<Partial<Record<DeviceArea, Device[]>>>((groups, device) => {
        groups[device.area] = [...(groups[device.area] ?? []), device];
        return groups;
      }, {}),
    [visibleDevices]
  );

  return (
    <div className="space-y-7">
      {(Object.keys(areaLabels) as DeviceArea[]).map((area) =>
        grouped[area]?.length ? (
          <section key={area}>
            <h2 className="mb-4 text-2xl font-semibold text-gold">{areaLabels[area]}</h2>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
              {grouped[area]?.map((device) => <DeviceCard key={device.id} device={device} />)}
            </div>
          </section>
        ) : null
      )}
    </div>
  );
}

function LightsView() {
  return <DeviceGrid filter={(device) => device.kind === 'light' || device.kind === 'switch'} />;
}

function ComfortView() {
  return <DeviceGrid filter={(device) => device.kind === 'fan' || device.kind === 'heater'} />;
}

function ScenesView() {
  const scenes = useSmartHomeStore((store) => store.scenes);
  const applyScene = useSmartHomeStore((store) => store.applyScene);
  const imageMap = [outdoorImage, poolImage, bedroomImage];

  return (
    <div className="grid grid-cols-3 gap-5">
      {scenes.map((scene, index) => (
        <button key={scene.id} type="button" className="scene-card touch-feedback" onClick={() => void applyScene(scene.id)}>
          <img src={imageMap[index % imageMap.length]} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-transparent" />
          <span className="relative z-10 mt-auto block p-6 text-left">
            <Sparkles className="mb-5 text-gold" size={32} />
            <strong className="block text-4xl font-semibold text-pearl">{scene.name}</strong>
            <small className="mt-3 block text-lg leading-7 text-mist">{scene.description}</small>
          </span>
        </button>
      ))}
    </div>
  );
}

function Header() {
  const sync = useSmartHomeStore((store) => store.sync);
  const health = useSmartHomeStore((store) => store.health);
  const lastSyncAt = useSmartHomeStore((store) => store.lastSyncAt);
  const error = useSmartHomeStore((store) => store.error);

  return (
    <header className="mb-6 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Guest Control</p>
        <h2 className="mt-1 text-4xl font-semibold text-pearl">Royal Water Villa</h2>
      </div>
      <div className="flex items-center gap-3">
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
  const [view, setView] = useState<View>('home');
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

  const content = {
    home: <HomeView setView={setView} />,
    lights: <LightsView />,
    scenes: <ScenesView />,
    comfort: <ComfortView />
  }[view];

  return (
    <div className="min-h-screen overflow-hidden bg-ink text-pearl">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,106,107,0.45),transparent_32%),linear-gradient(135deg,#061818,#0b2f32_45%,#061818)]" />
      <div className="relative z-10 grid h-screen grid-cols-[104px_1fr] p-4">
        <nav className="panel flex flex-col items-center gap-4 p-3">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-gold text-ink">
            <Sun size={30} />
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                title={item.label}
                aria-label={item.label}
                onClick={() => setView(item.id)}
                className={['nav-button touch-feedback', view === item.id ? 'nav-button-active' : ''].join(' ')}
              >
                <Icon size={26} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <main className="min-w-0 overflow-y-auto px-5 pb-4 pt-2">
          <div className="rotate-hint">For the best experience, rotate the tablet to landscape.</div>
          <Header />
          {content}
        </main>
      </div>
    </div>
  );
}
