import type { DeviceArea, DeviceId, Scene } from '../types/devices';

export type Language = 'he' | 'en' | 'fr';

export type Translation = {
  dir: 'rtl' | 'ltr';
  languageLabels: Record<Language, string>;
  app: {
    brand: string;
    guestTablet: string;
    rotateHint: string;
    active: string;
    lastSync: string;
    notSynced: string;
    sync: string;
    synced: string;
    sending: string;
    on: string;
    off: string;
    turnOn: string;
    turnOff: string;
    mockMode: string;
    connected: string;
    error: string;
    loading: string;
    unavailable: string;
    startLights: string;
    scenes: string;
    allOff: string;
    villaOff: string;
    villaOffDescription: string;
    oneTap: string;
    quickActions: string;
    devicesActive: string;
    poolReady: string;
    mappedControls: string;
    fanOff: string;
    debugTitle: string;
    providerStatus: string;
    lastHaError: string;
    lastEntityAction: string;
    none: string;
  };
  dashboard: {
    welcome: string;
    heroTitle: string;
    heroSubtitle: string;
    areasTitle: string;
    selectedArea: string;
    devicesCount: string;
    connected: string;
    network: string;
    systemOk: string;
    systemNormal: string;
    help: string;
    helpSubtitle: string;
    quickActions: string;
    quickNight: string;
    quickDay: string;
    quickPool: string;
    quickExit: string;
    quickAllOff: string;
    quickAllLightsOff: string;
    allLightsOn: string;
    allLightsOnSubtitle: string;
    allLightsOff: string;
    allLightsOffSubtitle: string;
    topNav: Record<'quickActions' | 'lights' | 'temperature' | 'air' | 'cameras' | 'settings', string>;
    areas: Record<DeviceArea | 'allLights', { label: string }>;
  };
  nav: Record<'overview' | DeviceArea | 'quick', string>;
  sections: Record<'overview' | DeviceArea | 'quick', { kicker: string; title: string; subtitle: string }>;
  devices: Record<DeviceId, { name: string; subtitle: string }>;
  scenes: Record<Scene['id'], { name: string; description: string }>;
};

export const translations: Record<Language, Translation> = {
  he: {
    dir: 'rtl',
    languageLabels: { he: 'HE', en: 'EN', fr: 'FR' },
    app: {
      brand: 'Royal Water Villa',
      guestTablet: 'טאבלט אורחים',
      rotateHint: 'לחוויה מיטבית, סובבו את הטאבלט למצב אופקי.',
      active: 'פעילים',
      lastSync: 'סנכרון אחרון',
      notSynced: 'טרם סונכרן',
      sync: 'סנכרון',
      synced: 'סונכרן',
      sending: 'שולח...',
      on: 'דלוק',
      off: 'כבוי',
      turnOn: 'הדלק',
      turnOff: 'כבה',
      mockMode: 'מצב הדמיה',
      connected: 'מחובר',
      error: 'שגיאה',
      loading: 'טוען',
      unavailable: 'לא זמין',
      startLights: 'תאורה',
      scenes: 'תרחישים',
      allOff: 'כיבוי כללי',
      villaOff: 'כיבוי הווילה',
      villaOffDescription: 'כיבוי כל מכשירי האורחים הממופים.',
      oneTap: 'לחיצה אחת',
      quickActions: 'פעולות מהירות',
      devicesActive: 'מכשירים פעילים',
      poolReady: 'בריכה מוכנה לערב',
      mappedControls: 'פקדים ממופים',
      fanOff: 'כבוי',
      debugTitle: 'פאנל פיתוח',
      providerStatus: 'סטטוס ספק',
      lastHaError: 'שגיאת HA אחרונה',
      lastEntityAction: 'פעולת ישות אחרונה',
      none: 'אין'
    },
    dashboard: {
      welcome: 'ברוכים הבאים',
      heroTitle: 'Royal Water Villa',
      heroSubtitle: 'שליטה חכמה במתחם האירוח שלכם',
      areasTitle: 'אזורים',
      selectedArea: 'אזור נבחר',
      devicesCount: 'מכשירים',
      connected: 'מחובר',
      network: 'רשת',
      systemOk: 'מצב מערכת תקין',
      systemNormal: 'כל המערכות זמינות',
      help: 'עזרה',
      helpSubtitle: 'שירות לאורחים',
      quickActions: 'פעולות מהירות',
      quickNight: 'מצב לילה',
      quickDay: 'מצב יום',
      quickPool: 'מצב בריכה',
      quickExit: 'יציאה מהבית',
      quickAllOff: 'כיבוי כל הבית',
      quickAllLightsOff: 'כיבוי כל התאורה',
      allLightsOn: 'כל התאורה דולקת',
      allLightsOnSubtitle: 'הדלקת כל גופי התאורה הממופים',
      allLightsOff: 'כל התאורה כבויה',
      allLightsOffSubtitle: 'כיבוי כל גופי התאורה הממופים',
      topNav: {
        quickActions: 'פעולות מהירות',
        lights: 'תאורה',
        temperature: 'טמפרטורה',
        air: 'מאווררים',
        cameras: 'מצלמות',
        settings: 'הגדרות'
      },
      areas: {
        salon: { label: 'סלון' },
        outdoor: { label: 'אזור חוץ' },
        pool: { label: 'בריכה' },
        bedroom: { label: 'חדר שינה' },
        bathroom: { label: 'שירותים ומקלחת' },
        allLights: { label: 'כל התאורה' }
      }
    },
    nav: {
      overview: 'סקירה',
      salon: 'סלון',
      outdoor: 'פרגולה',
      pool: 'בריכה',
      bedroom: 'חדר שינה',
      bathroom: 'חימום',
      quick: 'פעולות'
    },
    sections: {
      overview: {
        kicker: 'Royal Water Villa',
        title: 'נוחות אורחים בשליטה מיידית.',
        subtitle: 'משטח שליטה רגוע לטאבלט קיר: תאורה, אווירת בריכה, אוורור חדר שינה וחימום אמבטיה.'
      },
      salon: {
        kicker: 'סלון',
        title: 'אווירה פנימית חמימה.',
        subtitle: 'ספוטים ותאורת קיר לאירוח, כניסה שקטה וערב רגוע.'
      },
      outdoor: {
        kicker: 'חוץ / פרגולה',
        title: 'תאורת חוץ בלחיצה אחת.',
        subtitle: 'שליטה בפרגולה, קיר חוץ ושביל אחורי.'
      },
      pool: {
        kicker: 'בריכה',
        title: 'אור ערב ליד המים.',
        subtitle: 'תאורת בריכה ובר לאירוח ולשחיית לילה.'
      },
      bedroom: {
        kicker: 'חדר שינה',
        title: 'אור רך ואוויר נעים.',
        subtitle: 'תאורת מאוורר ומאוורר תקרה לשימוש נוח מהמיטה.'
      },
      bathroom: {
        kicker: 'חימום אמבטיה',
        title: 'נוחות מהירה למקלחת.',
        subtitle: 'חימום ותאורת אמבטיה עם סטטוס ברור לאורחים.'
      },
      quick: {
        kicker: 'פעולות מהירות',
        title: 'תרחישים לכל הווילה.',
        subtitle: 'הפעלת מצבים מוכנים מיד, ואז אימות מצב מול Home Assistant.'
      }
    },
    devices: {
      salonCeilingSpots: { name: 'ספוטים תקרה סלון', subtitle: 'תאורה שקועה וחמה' },
      salonLedWall: { name: 'קיר LED סלון', subtitle: 'תאורת אווירה מרכזית' },
      pergolaLight: { name: 'תאורת פרגולה', subtitle: 'קירוי חוץ' },
      wallLight: { name: 'תאורת חומה', subtitle: 'קיר היקפי' },
      backPathwayLight: { name: 'תאורת שביל אחורי', subtitle: 'שביל גינה אחורי' },
      poolLight: { name: 'תאורת בריכה', subtitle: 'אור על קו המים' },
      outdoorBarLight: { name: 'תאורת בר חיצוני', subtitle: 'דלפק הבר בבריכה' },
      outdoorWallLight: { name: 'תאורת קיר חוץ', subtitle: 'קיר מקלחת חיצוני' },
      bathroomLight: { name: 'תאורת אמבטיה', subtitle: 'מתג קיר מקלחת' },
      bedroomFanLight: { name: 'תאורת מאוורר חדר שינה', subtitle: 'גוף תאורה תקרתי' },
      ceilingFan: { name: 'מאוורר תקרה', subtitle: 'אוורור חדר השינה' },
      bathroomHeater: { name: 'מחמם אמבטיה', subtitle: 'נוחות במקלחת' }
    },
    scenes: {
      arrival: { name: 'כניסה', description: 'תאורת סלון ומרפסת חמימה לצ׳ק-אין.' },
      poolEvening: { name: 'ערב בריכה', description: 'בריכה, בר ופרגולה לשחיית ערב רגועה.' },
      sleep: { name: 'לילה שקט', description: 'כיבוי אזורים משותפים והכנת חדר השינה.' }
    }
  },
  en: {
    dir: 'ltr',
    languageLabels: { he: 'HE', en: 'EN', fr: 'FR' },
    app: {
      brand: 'Royal Water Villa',
      guestTablet: 'Guest tablet',
      rotateHint: 'For the best experience, rotate the tablet to landscape.',
      active: 'active',
      lastSync: 'last sync',
      notSynced: 'Not synced',
      sync: 'Sync',
      synced: 'Synced',
      sending: 'Sending...',
      on: 'On',
      off: 'Off',
      turnOn: 'Turn on',
      turnOff: 'Turn off',
      mockMode: 'Mock Mode',
      connected: 'Connected',
      error: 'Error',
      loading: 'Loading',
      unavailable: 'Unavailable',
      startLights: 'Start Lights',
      scenes: 'Scenes',
      allOff: 'All Off',
      villaOff: 'Villa Off',
      villaOffDescription: 'Power down all mapped guest devices.',
      oneTap: 'One tap',
      quickActions: 'Quick actions',
      devicesActive: 'devices active',
      poolReady: 'evening ready',
      mappedControls: 'mapped controls',
      fanOff: 'Off',
      debugTitle: 'Dev panel',
      providerStatus: 'Provider status',
      lastHaError: 'Last HA error',
      lastEntityAction: 'Last entity action',
      none: 'None'
    },
    dashboard: {
      welcome: 'Welcome',
      heroTitle: 'Royal Water Villa',
      heroSubtitle: 'Smart control for your private villa experience',
      areasTitle: 'Areas',
      selectedArea: 'Selected area',
      devicesCount: 'devices',
      connected: 'Connected',
      network: 'Network',
      systemOk: 'System healthy',
      systemNormal: 'All systems available',
      help: 'Help',
      helpSubtitle: 'Guest service',
      quickActions: 'Quick actions',
      quickNight: 'Night mode',
      quickDay: 'Day mode',
      quickPool: 'Pool mode',
      quickExit: 'Leaving villa',
      quickAllOff: 'All home off',
      quickAllLightsOff: 'All lights off',
      allLightsOn: 'All lights on',
      allLightsOnSubtitle: 'Turn on every mapped light',
      allLightsOff: 'All lights off',
      allLightsOffSubtitle: 'Turn off every mapped light',
      topNav: {
        quickActions: 'Quick actions',
        lights: 'Lighting',
        temperature: 'Temperature',
        air: 'Fans',
        cameras: 'Cameras',
        settings: 'Settings'
      },
      areas: {
        salon: { label: 'Salon' },
        outdoor: { label: 'Outdoor' },
        pool: { label: 'Pool' },
        bedroom: { label: 'Bedroom' },
        bathroom: { label: 'Bathroom' },
        allLights: { label: 'All lighting' }
      }
    },
    nav: {
      overview: 'Overview',
      salon: 'Salon',
      outdoor: 'Pergola',
      pool: 'Pool',
      bedroom: 'Bedroom',
      bathroom: 'Heater',
      quick: 'Actions'
    },
    sections: {
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
        subtitle: 'Apply polished presets immediately, then confirm state through Home Assistant.'
      }
    },
    devices: {
      salonCeilingSpots: { name: 'Salon ceiling spots', subtitle: 'Warm recessed lighting' },
      salonLedWall: { name: 'Salon LED wall', subtitle: 'Ambient feature wall' },
      pergolaLight: { name: 'Pergola light', subtitle: 'Outdoor canopy' },
      wallLight: { name: 'Wall light', subtitle: 'Perimeter wall' },
      backPathwayLight: { name: 'Back pathway light', subtitle: 'Rear garden path' },
      poolLight: { name: 'Pool light', subtitle: 'Waterline glow' },
      outdoorBarLight: { name: 'Outdoor bar light', subtitle: 'Pool bar counter' },
      outdoorWallLight: { name: 'Outdoor wall light', subtitle: 'Outside shower wall' },
      bathroomLight: { name: 'Bathroom light', subtitle: 'Shower wall switch' },
      bedroomFanLight: { name: 'Bedroom fan light', subtitle: 'Ceiling fixture' },
      ceilingFan: { name: 'Ceiling fan', subtitle: 'Bedroom airflow' },
      bathroomHeater: { name: 'Bathroom heater', subtitle: 'Shower comfort' }
    },
    scenes: {
      arrival: { name: 'Arrival', description: 'Warm salon and terrace lighting for check-in.' },
      poolEvening: { name: 'Pool Evening', description: 'Pool, bar, and pergola lighting for a relaxed night swim.' },
      sleep: { name: 'Sleep', description: 'Turn off shared lights and keep the bedroom ready.' }
    }
  },
  fr: {
    dir: 'ltr',
    languageLabels: { he: 'HE', en: 'EN', fr: 'FR' },
    app: {
      brand: 'Royal Water Villa',
      guestTablet: 'Tablette invités',
      rotateHint: 'Pour une meilleure expérience, utilisez la tablette en mode paysage.',
      active: 'actifs',
      lastSync: 'dernière synchro',
      notSynced: 'Non synchronisé',
      sync: 'Synchroniser',
      synced: 'Synchronisé',
      sending: 'Envoi...',
      on: 'Allumé',
      off: 'Éteint',
      turnOn: 'Allumer',
      turnOff: 'Éteindre',
      mockMode: 'Mode démo',
      connected: 'Connecté',
      error: 'Erreur',
      loading: 'Chargement',
      unavailable: 'Indisponible',
      startLights: 'Éclairage',
      scenes: 'Scènes',
      allOff: 'Tout éteindre',
      villaOff: 'Villa éteinte',
      villaOffDescription: 'Éteindre tous les appareils invités configurés.',
      oneTap: 'Un geste',
      quickActions: 'Actions rapides',
      devicesActive: 'appareils actifs',
      poolReady: 'prête pour le soir',
      mappedControls: 'commandes configurées',
      fanOff: 'Off',
      debugTitle: 'Panneau dev',
      providerStatus: 'État fournisseur',
      lastHaError: 'Dernière erreur HA',
      lastEntityAction: 'Dernière action entité',
      none: 'Aucune'
    },
    dashboard: {
      welcome: 'Bienvenue',
      heroTitle: 'Royal Water Villa',
      heroSubtitle: 'Contrôle intelligent de votre séjour privé',
      areasTitle: 'Zones',
      selectedArea: 'Zone sélectionnée',
      devicesCount: 'appareils',
      connected: 'Connecté',
      network: 'Réseau',
      systemOk: 'Système normal',
      systemNormal: 'Tous les systèmes disponibles',
      help: 'Aide',
      helpSubtitle: 'Service invités',
      quickActions: 'Actions rapides',
      quickNight: 'Mode nuit',
      quickDay: 'Mode jour',
      quickPool: 'Mode piscine',
      quickExit: 'Départ villa',
      quickAllOff: 'Tout éteindre',
      quickAllLightsOff: 'Tout éclairage off',
      allLightsOn: 'Tout allumer',
      allLightsOnSubtitle: 'Allumer toutes les lumières configurées',
      allLightsOff: 'Tout éteindre',
      allLightsOffSubtitle: 'Éteindre toutes les lumières configurées',
      topNav: {
        quickActions: 'Actions rapides',
        lights: 'Éclairage',
        temperature: 'Température',
        air: 'Ventilation',
        cameras: 'Caméras',
        settings: 'Réglages'
      },
      areas: {
        salon: { label: 'Salon' },
        outdoor: { label: 'Extérieur' },
        pool: { label: 'Piscine' },
        bedroom: { label: 'Chambre' },
        bathroom: { label: 'Salle de bain' },
        allLights: { label: 'Tout éclairage' }
      }
    },
    nav: {
      overview: 'Accueil',
      salon: 'Salon',
      outdoor: 'Pergola',
      pool: 'Piscine',
      bedroom: 'Chambre',
      bathroom: 'Chauffage',
      quick: 'Actions'
    },
    sections: {
      overview: {
        kicker: 'Royal Water Villa',
        title: 'Le confort invité, instantanément.',
        subtitle: 'Une interface murale apaisante pour l’éclairage, la piscine, la chambre et le chauffage de salle de bain.'
      },
      salon: {
        kicker: 'Salon',
        title: 'Ambiance intérieure chaleureuse.',
        subtitle: 'Spots plafond et mur LED pour l’arrivée, les soirées et les moments calmes.'
      },
      outdoor: {
        kicker: 'Extérieur / Pergola',
        title: 'Lumière de terrasse en un geste.',
        subtitle: 'Contrôle de la pergola, du mur extérieur et du chemin arrière.'
      },
      pool: {
        kicker: 'Piscine',
        title: 'Lueur du soir au bord de l’eau.',
        subtitle: 'Éclairage piscine et bar pour les bains de nuit et les soirées.'
      },
      bedroom: {
        kicker: 'Chambre',
        title: 'Lumière douce et air agréable.',
        subtitle: 'Lumière du ventilateur et ventilateur plafond pour le confort au lit.'
      },
      bathroom: {
        kicker: 'Chauffage salle de bain',
        title: 'Confort rapide après la douche.',
        subtitle: 'Chauffage et lumière de salle de bain avec état clair pour les invités.'
      },
      quick: {
        kicker: 'Actions rapides',
        title: 'Scènes pour toute la villa.',
        subtitle: 'Appliquez les scènes instantanément, puis confirmez l’état via Home Assistant.'
      }
    },
    devices: {
      salonCeilingSpots: { name: 'Spots plafond salon', subtitle: 'Éclairage encastré chaleureux' },
      salonLedWall: { name: 'Mur LED salon', subtitle: 'Mur d’ambiance' },
      pergolaLight: { name: 'Lumière pergola', subtitle: 'Auvent extérieur' },
      wallLight: { name: 'Lumière murale', subtitle: 'Mur périphérique' },
      backPathwayLight: { name: 'Chemin arrière', subtitle: 'Allée du jardin' },
      poolLight: { name: 'Lumière piscine', subtitle: 'Lueur au bord de l’eau' },
      outdoorBarLight: { name: 'Lumière bar extérieur', subtitle: 'Comptoir de piscine' },
      outdoorWallLight: { name: 'Lumière mur extérieur', subtitle: 'Mur de douche extérieure' },
      bathroomLight: { name: 'Lumière salle de bain', subtitle: 'Interrupteur douche' },
      bedroomFanLight: { name: 'Lumière ventilateur chambre', subtitle: 'Luminaire plafond' },
      ceilingFan: { name: 'Ventilateur plafond', subtitle: 'Air dans la chambre' },
      bathroomHeater: { name: 'Chauffage salle de bain', subtitle: 'Confort douche' }
    },
    scenes: {
      arrival: { name: 'Arrivée', description: 'Salon et terrasse chaleureux pour le check-in.' },
      poolEvening: { name: 'Soirée piscine', description: 'Piscine, bar et pergola pour une baignade de nuit.' },
      sleep: { name: 'Nuit calme', description: 'Éteindre les espaces communs et préparer la chambre.' }
    }
  }
};
