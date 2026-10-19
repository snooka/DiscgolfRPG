import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  User,
  Disc,
  MapPin,
  Plus,
  Minus,
  Check,
  UsersRound,
  LogIn,
  X,
  Swords,
  Award,
  BarChart3,
  Sparkles,
  Play,
  Search,
  Bell,
  CloudRain,
  Wind,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Compass,
} from 'lucide-react';

// ==========================================
// SUPABASE REST API TILKOBLING
// ==========================================
const SUPABASE_URL = 'https://pkegwnodzhxlsokyrxnx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vT61AJcKjYq8DWBGQagEKA_DN6BxEb-';

interface CourseItem {
  id: string;
  name: string;
  location: string;
  holes: number;
  par: number;
  image: string;
  lat: number;
  lng: number;
}

interface PlayerStats {
  totalGames: number;
  courseGames: Record<string, number>;
  playedCoursesData?: Record<string, CourseItem>;
  totalKm: number;
  bestRoundDiff?: number | null;
}

interface DiscItem {
  id: string;
  name: string;
  brand: string;
  type: string;
  speed: number;
  glide: number;
  turn: number;
  fade: number;
  plastic: string;
  color: string;
}

interface FlightPlayer {
  name: string;
  email?: string;
  isGuest: boolean;
}

const cloudApi = {
  async getPlayer(email: string) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/players?email=eq.${encodeURIComponent(email)}`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );
      const data = await res.json();
      return data?.[0] || null;
    } catch {
      return null;
    }
  },
  async getTopPlayers() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/players?select=email,name,xp,stats,badges&order=xp.desc&limit=20`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
  async searchPlayers(query: string) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/players?or=(name.ilike.*${encodeURIComponent(
          query
        )}*,email.ilike.*${encodeURIComponent(query)}*)`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
  async upsertPlayer(
    email: string,
    name: string,
    xp: number,
    requests: any = [],
    friendsList: any = [],
    stats: PlayerStats = {
      totalGames: 0,
      courseGames: {},
      playedCoursesData: {},
      totalKm: 0,
      bestRoundDiff: null,
    },
    unlockedBadges: string[] = []
  ) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/players`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          email,
          name,
          xp,
          friend_requests: requests,
          friends: friendsList,
          stats,
          badges: unlockedBadges,
        }),
      });
    } catch (e) {
      console.error('Feil ved lagring:', e);
    }
  },
  async sendFriendRequest(targetEmail: string, senderObj: any) {
    try {
      const target = await this.getPlayer(targetEmail);
      if (!target) return false;
      const currentRequests = target.friend_requests || [];
      if (currentRequests.some((r: any) => r.email === senderObj.email))
        return true;

      await this.upsertPlayer(
        target.email,
        target.name,
        target.xp || 0,
        [...currentRequests, senderObj],
        target.friends || [],
        target.stats || {
          totalGames: 0,
          courseGames: {},
          playedCoursesData: {},
          totalKm: 0,
        },
        target.badges || []
      );
      return true;
    } catch {
      return false;
    }
  },
};

// ==========================================
// LYDEFFEKTER
// ==========================================
const playTone = (
  freqs: number[],
  type: OscillatorType = 'sine',
  step = 0.08,
  dur = 0.25
) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(f, now + i * step);
      gain.gain.setValueAtTime(0.15, now + i * step);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * step + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * step);
      osc.stop(now + i * step + dur);
    });
  } catch {}
};

// Beregn GPS-avstand i km
const getDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const FancyDiscLogo = () => (
  <div className="relative flex items-center justify-center w-11 h-11 bg-emerald-950 border-2 border-emerald-500 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.4)] overflow-hidden">
    <svg
      className="w-7 h-7 text-emerald-400 relative z-10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5h16" />
      <path d="M6 5v6a6 6 0 0 0 12 0V5" />
      <path d="M10 5v6a2 2 0 0 0 4 0V5" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
      <ellipse
        cx="14"
        cy="9"
        rx="5"
        ry="2"
        className="text-cyan-400"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  </div>
);

// ==========================================
// EMBLEMER & NIVÅSYSTEM
// ==========================================
const ALL_BADGES = [
  {
    id: 'first_round',
    title: 'Første Kastet',
    subtitle: 'Debutant',
    desc: 'Fullfør din aller første runde på en bane.',
    icon: '🥏',
    target: 1,
    type: 'games',
  },
  {
    id: 'games_5',
    title: 'Helge-Kasteren',
    subtitle: 'Fast Inventar',
    desc: 'Fullfør totalt 5 runder med venner eller gjester.',
    icon: '🎯',
    target: 5,
    type: 'games',
  },
  {
    id: 'games_15',
    title: 'Bane-Veteranen',
    subtitle: 'Klubbmester',
    desc: 'Fullfør totalt 15 runder på banene.',
    icon: '🏟️',
    target: 15,
    type: 'games',
  },
  {
    id: 'km_5',
    title: 'Skogsvandrer',
    subtitle: 'Tur-Nivå 1',
    desc: 'Gå totalt 5 km på diskgolfbaner over tid.',
    icon: '🥾',
    target: 5,
    type: 'km',
  },
  {
    id: 'km_20',
    title: 'Lars Monsen i Krattet',
    subtitle: 'Tur-Nivå 2',
    desc: 'Gå totalt 20 km i lyng, skog og mark.',
    icon: '🏕️',
    target: 20,
    type: 'km',
  },
  {
    id: 'km_50',
    title: 'Ultra-Vandreren',
    subtitle: 'Tur-Nivå 3',
    desc: 'Gå totalt 50 km på jakt etter disker og kjetting.',
    icon: '⛰️',
    target: 50,
    type: 'km',
  },
  {
    id: 'rain_warrior',
    title: 'Regnværs-Viking',
    subtitle: 'Vestlandsklassiker',
    desc: 'Fullfør en runde i ekte regnvær (verifisert via Yr.no).',
    icon: '🌧️',
    target: 1,
    type: 'rain',
  },
  {
    id: 'wind_warrior',
    title: 'Kyst-Kuling & Motvind',
    subtitle: 'Stormkast',
    desc: 'Fullfør en runde i vind på minst 8 m/s (verifisert via Yr.no).',
    icon: '💨',
    target: 1,
    type: 'wind',
  },
  {
    id: 'birdie_hunter',
    title: 'Birdie-Jegeren',
    subtitle: 'Presisjon',
    desc: 'Sett minst én Birdie eller Ace i løpet av en runde.',
    icon: '🦅',
    target: 1,
    type: 'birdie',
  },
  {
    id: 'under_par',
    title: 'Par-Knuseren',
    subtitle: 'Elite',
    desc: 'Fullfør en hel runde på eller under banens total-par.',
    icon: '👑',
    target: 1,
    type: 'under_par',
  },
  {
    id: 'tree_magnet',
    title: 'Tre-Magneten',
    subtitle: 'Skogshugger',
    desc: 'Kast en runde der furutrærne garantert sto midt i fairway.',
    icon: '🌲',
    target: 1,
    type: 'oneshot',
  },
];

const LEVEL_DATA = Array.from({ length: 50 }, (_, i) => {
  const lvl = i + 1;
  const tiers = [
    {
      level: 1,
      title: 'Busk-Leter',
      icon: '🌿',
      desc: 'Ekspert på å finne disker dypt inne i einer og brennesle.',
    },
    {
      level: 3,
      title: 'Tre-Magneten',
      icon: '🌲',
      desc: 'Uforklarlig tiltrekningskraft mot nærmeste furutre.',
    },
    {
      level: 6,
      title: 'Myr-Snikeren',
      icon: '🥾',
      desc: 'Mester i å hoppe fra tue til tue uten å bli våt på beina.',
    },
    {
      level: 10,
      title: 'Fairway-los',
      icon: '🧭',
      desc: 'Treffer endelig åpningen i skogen oftere enn trærne.',
    },
    {
      level: 15,
      title: 'Par-Maskinen',
      icon: '⚙️',
      desc: 'Redder par fra de mest umulige posisjoner.',
    },
    {
      level: 22,
      title: 'Kjetting-Rangler',
      icon: '⛓️',
      desc: 'Lyden av raslende kjetting høres over hele banen.',
    },
    {
      level: 30,
      title: 'Kyst-Generalen',
      icon: '🌊',
      desc: 'Behersker stiv kuling, regnbyger og svaberg på Vestlandet.',
    },
    {
      level: 40,
      title: 'Hyzer-Trollmannen',
      icon: '🧙‍♂️',
      desc: 'Former kastene rundt ethvert hinder med kirurgisk presisjon.',
    },
    {
      level: 50,
      title: 'Legendarisk Kjede-Knuser',
      icon: '⚡',
      desc: 'Toppnivået. Fryktet på enhver bane i hele landet.',
    },
  ];
  const found =
    tiers
      .slice()
      .reverse()
      .find((m) => lvl >= m.level) || tiers[0];
  return {
    ...found,
    level: lvl,
    requiredXp: Math.round(500 * Math.pow(1.18, i)),
  };
});

const DEFAULT_HOME_COURSE: CourseItem = {
  id: 'kolbeinsvik',
  name: 'Kolbeinsvik Diskgolfbane',
  location: 'Austevoll',
  holes: 9,
  par: 27,
  image: '🌲',
  lat: 60.0825,
  lng: 5.2512,
};

const KNOWN_COURSES_DB: CourseItem[] = [
  DEFAULT_HOME_COURSE,
  {
    id: 'fanafjell',
    name: 'Fanafjell Diskgolfbane',
    location: 'Bergen',
    holes: 18,
    par: 58,
    image: '⛰️',
    lat: 60.2541,
    lng: 5.382,
  },
  {
    id: 'smoras',
    name: 'Smørås Diskgolfbane',
    location: 'Bergen',
    holes: 18,
    par: 56,
    image: '🌲',
    lat: 60.312,
    lng: 5.334,
  },
  {
    id: 'aasane',
    name: 'Åsane Diskgolfbane',
    location: 'Bergen',
    holes: 18,
    par: 57,
    image: '⛳',
    lat: 60.4712,
    lng: 5.328,
  },
  {
    id: 'lyngbo',
    name: 'Lyngbø Diskgolfbane',
    location: 'Bergen',
    holes: 9,
    par: 27,
    image: '🌳',
    lat: 60.3725,
    lng: 5.254,
  },
  {
    id: 'stord',
    name: 'Stord Diskgolfbane',
    location: 'Stord',
    holes: 18,
    par: 54,
    image: '🌿',
    lat: 59.782,
    lng: 5.489,
  },
  {
    id: 'ekholt',
    name: 'Ekholt Diskgolfbane',
    location: 'Rygge',
    holes: 18,
    par: 54,
    image: '☀️',
    lat: 59.39,
    lng: 10.72,
  },
];

const generateHoleLayout = (totalHoles: number) =>
  Array.from({ length: totalHoles }, (_, i) => ({
    hole: i + 1,
    par: 3,
    distance: `${65 + (((i + 1) * 11) % 45)}m`,
  }));

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('Kim Kristoffersen');
  const [xp, setXp] = useState(1450);

  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    totalGames: 0,
    courseGames: {},
    playedCoursesData: {},
    totalKm: 0,
    bestRoundDiff: null,
  });
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [sessionUnlockedBadges, setSessionUnlockedBadges] = useState<any[]>([]);
  const [courseWeather, setCourseWeather] = useState<{
    isRain: boolean;
    isWindy: boolean;
    windSpeed: number;
    desc: string;
    temp: number;
  } | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'profile' | 'courses' | 'badges' | 'friends' | 'leaderboard'
  >('profile');

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapInstance = useRef<any>(null);
  const [userCoords, setUserCoords] = useState({ lat: 60.0825, lng: 5.2512 });
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [courseSearchResults, setCourseSearchResults] = useState<CourseItem[]>(
    []
  );
  const [isSearchingCourses, setIsSearchingCourses] = useState(false);
  const [customHoleCount, setCustomHoleCount] = useState<number>(9);

  const [discs, setDiscs] = useState<DiscItem[]>(() => {
    const saved = localStorage.getItem('disc_rpg_bag_v2');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: '1',
            name: 'River',
            brand: 'Latitude 64',
            type: 'Fairway Driver',
            speed: 7,
            glide: 7,
            turn: -1,
            fade: 1,
            plastic: 'Opto',
            color: '#10b981',
          },
          {
            id: '2',
            name: 'Fuse',
            brand: 'Latitude 64',
            type: 'Midrange',
            speed: 5,
            glide: 6,
            turn: -1,
            fade: 0,
            plastic: 'Opto',
            color: '#06b6d4',
          },
          {
            id: '3',
            name: 'Pixel',
            brand: 'Axiom',
            type: 'Putter',
            speed: 2,
            glide: 4,
            turn: 0,
            fade: 0.5,
            plastic: 'Electron',
            color: '#f59e0b',
          },
        ];
  });
  const [showAddDiscModal, setShowAddDiscModal] = useState(false);
  const [newDisc, setNewDisc] = useState({
    name: '',
    brand: '',
    type: 'Fairway Driver',
    speed: 7,
    glide: 5,
    turn: -1,
    fade: 1,
    plastic: 'Opto',
    color: '#10b981',
  });

  useEffect(() => {
    localStorage.setItem('disc_rpg_bag_v2', JSON.stringify(discs));
  }, [discs]);

  const [setupRoundModal, setSetupRoundModal] = useState(false);
  const [activeCourse, setActiveCourse] =
    useState<CourseItem>(DEFAULT_HOME_COURSE);
  const [flightPlayers, setFlightPlayers] = useState<FlightPlayer[]>([]);
  const [guestNameInput, setGuestNameInput] = useState('');

  const [inActiveRound, setInActiveRound] = useState(false);
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [courseLayout, setCourseLayout] = useState(generateHoleLayout(9));
  const [scores, setScores] = useState<number[][]>([]);
  const [roundFinished, setRoundFinished] = useState(false);

  const [roundSteps, setRoundSteps] = useState(0);
  const [roundKm, setRoundKm] = useState(0);
  const lastStepTimeRef = useRef<number>(0);

  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [leaderboardPlayers, setLeaderboardPlayers] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    if (!inActiveRound || roundFinished) return;
    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const mag = Math.sqrt(
        (acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2
      );
      const now = Date.now();
      if (mag > 12.3 && now - lastStepTimeRef.current > 360) {
        lastStepTimeRef.current = now;
        setRoundSteps((p) => p + 1);
      }
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [inActiveRound, roundFinished]);

  useEffect(() => {
    setRoundKm(parseFloat(((roundSteps * 0.76) / 1000).toFixed(2)));
  }, [roundSteps]);

  useEffect(() => {
    if (!isLoggedIn || !email) return;
    const fetchUpdates = async () => {
      const pData = await cloudApi.getPlayer(email);
      if (pData) {
        const cReqs = pData.friend_requests || [];
        if (cReqs.length > friendRequests.length) {
          playTone([523.25, 659.25, 783.99]);
          triggerToast('🔔 Ny venneforespørsel mottatt!');
        }
        setFriendRequests(cReqs);
        if (pData.friends) setFriends(pData.friends);
        if (pData.stats) setPlayerStats(pData.stats);
        if (pData.badges) setUnlockedBadges(pData.badges);
      }
      const top = await cloudApi.getTopPlayers();
      if (top.length > 0) setLeaderboardPlayers(top);
    };
    fetchUpdates();
    const inv = setInterval(fetchUpdates, 6000);
    return () => clearInterval(inv);
  }, [isLoggedIn, email, friendRequests.length]);

  const getPlayedCoursesList = (): CourseItem[] => {
    const names = Object.keys(playerStats.courseGames || {});
    const savedMap = playerStats.playedCoursesData || {};
    return names.map((cName) => {
      if (savedMap[cName]) return savedMap[cName];
      const known = KNOWN_COURSES_DB.find(
        (k) => k.name.toLowerCase() === cName.toLowerCase()
      );
      return (
        known || {
          id: cName,
          name: cName,
          location: 'Norge',
          holes: 9,
          par: 27,
          image: '🌲',
          lat: userCoords.lat,
          lng: userCoords.lng,
        }
      );
    });
  };

  const getNearbyCoursesList = (): CourseItem[] => {
    const playedNames = Object.keys(playerStats.courseGames || {});
    return KNOWN_COURSES_DB.filter(
      (c) =>
        getDistanceKm(userCoords.lat, userCoords.lng, c.lat, c.lng) <= 20 &&
        !playedNames.includes(c.name)
    );
  };

  const handleSearchCoursesOnMap = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!courseSearchQuery.trim()) return setCourseSearchResults([]);
    setIsSearchingCourses(true);
    const q = courseSearchQuery.trim().toLowerCase();
    const localMatches = KNOWN_COURSES_DB.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q)
    );

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          courseSearchQuery + ' Norge'
        )}&limit=5`
      );
      const geoData = await res.json();
      const geoCourses: CourseItem[] = (
        Array.isArray(geoData) ? geoData : []
      ).map((item: any, idx: number) => {
        const raw = item.display_name.split(',')[0].trim();
        const fName =
          raw.toLowerCase().includes('diskgolf') ||
          raw.toLowerCase().includes('disc')
            ? raw
            : `${raw} Diskgolfbane`;
        return {
          id: `geo_${item.place_id || idx}`,
          name: fName,
          location: item.display_name.split(',')[1]?.trim() || 'Norge',
          holes: customHoleCount,
          par: customHoleCount * 3,
          image: '🌲',
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        };
      });
      const combined = [...localMatches];
      geoCourses.forEach((gc) => {
        if (
          !combined.some(
            (ex) => ex.name.toLowerCase() === gc.name.toLowerCase()
          )
        )
          combined.push(gc);
      });
      setCourseSearchResults(combined);

      if (
        combined.length > 0 &&
        leafletMapInstance.current &&
        (window as any).L
      ) {
        const first = combined[0];
        const L = (window as any).L;
        leafletMapInstance.current.setView([first.lat, first.lng], 13);
        L.marker([first.lat, first.lng])
          .addTo(leafletMapInstance.current)
          .bindPopup(`<b>${first.name}</b><br/>${first.location}`)
          .openPopup();
      }
    } catch {
      setCourseSearchResults(localMatches);
    } finally {
      setIsSearchingCourses(false);
    }
  };

  const openSetupRound = async (course: CourseItem = activeCourse) => {
    setActiveCourse(course);
    setCustomHoleCount(course.holes);
    setFlightPlayers([{ name, email, isGuest: false }]);
    setSetupRoundModal(true);
    setIsLoadingWeather(true);
    try {
      const res = await fetch(
        `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${course.lat}&lon=${course.lng}`
      );
      const data = await res.json();
      const details = data?.properties?.timeseries?.[0]?.data?.instant?.details;
      const sym =
        data?.properties?.timeseries?.[0]?.data?.next_1_hours?.summary
          ?.symbol_code || '';
      const temp = Math.round(details?.air_temperature ?? 12);
      const wind = parseFloat((details?.wind_speed ?? 4.5).toFixed(1));
      const rain =
        sym.includes('rain') ||
        sym.includes('sleet') ||
        sym.includes('showers');
      setCourseWeather({
        isRain: rain,
        isWindy: wind >= 8.0,
        windSpeed: wind,
        desc: `${rain ? 'Regn 🌧️' : 'Opphold 🌤️'} • ${wind} m/s`,
        temp,
      });
    } catch {
      setCourseWeather({
        isRain: false,
        isWindy: false,
        windSpeed: 5.0,
        desc: 'Opphold 🌤️ • 5.0 m/s',
        temp: 11,
      });
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const startRound = async () => {
    try {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        await (DeviceMotionEvent as any).requestPermission();
      }
    } catch {}
    const updatedCourse = {
      ...activeCourse,
      holes: customHoleCount,
      par: customHoleCount * 3,
    };
    setActiveCourse(updatedCourse);
    const layout = generateHoleLayout(customHoleCount);
    setCourseLayout(layout);
    setScores(flightPlayers.map(() => layout.map((h) => h.par)));
    setCurrentHoleIndex(0);
    setRoundSteps(0);
    setSessionUnlockedBadges([]);
    setRoundFinished(false);
    setSetupRoundModal(false);
    setInActiveRound(true);
  };

  const updateScore = (pIdx: number, delta: number) => {
    setScores((prev) => {
      const copy = prev.map((r) => [...r]);
      const next = copy[pIdx][currentHoleIndex] + delta;
      if (next >= 1 && next <= 15) copy[pIdx][currentHoleIndex] = next;
      return copy;
    });
  };

  const getPlayerTotals = (pIdx: number) => {
    const pScores = scores[pIdx] || [];
    const totalThrows = pScores.reduce((a, b) => a + b, 0);
    const par = courseLayout.reduce((a, h) => a + h.par, 0);
    const diff = totalThrows - par;
    return {
      totalThrows,
      diff,
      diffFormatted: diff === 0 ? 'E' : diff > 0 ? `+${diff}` : `${diff}`,
    };
  };

  const finishRound = async () => {
    playTone([880, 1100, 1320, 1760, 2200], 'triangle', 0.03, 0.15);
    const earnedXp = courseLayout.length * 15 + 100;
    const effKm =
      roundKm > 0.2
        ? roundKm
        : parseFloat((courseLayout.length * 0.14).toFixed(2));
    if (roundKm <= 0.2) setRoundKm(effKm);

    const updatedCG = { ...(playerStats.courseGames || {}) };
    updatedCG[activeCourse.name] = (updatedCG[activeCourse.name] || 0) + 1;

    const updatedPCD = {
      ...(playerStats.playedCoursesData || {}),
      [activeCourse.name]: activeCourse,
    };
    const myTotals = getPlayerTotals(0);
    const bestDiff =
      playerStats.bestRoundDiff == null
        ? myTotals.diff
        : Math.min(playerStats.bestRoundDiff, myTotals.diff);
    const newTotalKm = parseFloat(
      ((playerStats.totalKm || 0) + effKm).toFixed(2)
    );
    const newTotalGames = (playerStats.totalGames || 0) + 1;

    const newStats: PlayerStats = {
      totalGames: newTotalGames,
      courseGames: updatedCG,
      playedCoursesData: updatedPCD,
      totalKm: newTotalKm,
      bestRoundDiff: bestDiff,
    };
    const gotBirdie = (scores[0] || []).some((t, i) => t < courseLayout[i].par);

    const newlyEarned: any[] = [];
    const curBadges = [...unlockedBadges];
    ALL_BADGES.forEach((b) => {
      if (!curBadges.includes(b.id)) {
        const ok =
          (b.type === 'km' && newTotalKm >= b.target) ||
          (b.type === 'games' && newTotalGames >= b.target) ||
          (b.type === 'rain' && courseWeather?.isRain) ||
          (b.type === 'wind' && courseWeather?.isWindy) ||
          (b.type === 'birdie' && gotBirdie) ||
          (b.type === 'under_par' && myTotals.diff <= 0) ||
          b.type === 'oneshot';
        if (ok) {
          curBadges.push(b.id);
          newlyEarned.push(b);
        }
      }
    });

    const nextXp = xp + earnedXp;
    setXp(nextXp);
    setUnlockedBadges(curBadges);
    setSessionUnlockedBadges(newlyEarned);
    setPlayerStats(newStats);
    await cloudApi.upsertPlayer(
      email,
      name,
      nextXp,
      friendRequests,
      friends,
      newStats,
      curBadges
    );
    triggerToast(`🎉 Runde lagret! +${earnedXp} XP`);
    setRoundFinished(true);
  };

  useEffect(() => {
    if (activeTab === 'courses' && isLoggedIn && !inActiveRound) {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      if (!(window as any).L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = initMap;
        document.body.appendChild(script);
      } else {
        setTimeout(initMap, 100);
      }
    }
  }, [activeTab, isLoggedIn, inActiveRound, playerStats.courseGames]);

  const initMap = () => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;
    if (leafletMapInstance.current) {
      leafletMapInstance.current.remove();
      leafletMapInstance.current = null;
    }
    const map = L.map(mapRef.current).setView(
      [userCoords.lat, userCoords.lng],
      11
    );
    leafletMapInstance.current = map;

    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: '© Google Maps',
    }).addTo(map);

    const mapCourses = [...getPlayedCoursesList()];
    getNearbyCoursesList().forEach((nb) => {
      if (!mapCourses.some((c) => c.name === nb.name)) mapCourses.push(nb);
    });

    mapCourses.forEach((course) => {
      const m = L.marker([course.lat, course.lng]).addTo(map);
      m.bindPopup(
        `<div style="color:#0f172a;min-width:140px;"><b>${course.image} ${course.name}</b><br/><span style="font-size:11px;">${course.location} • ${course.holes} hull</span><br/><button id="play-${course.id}" style="margin-top:6px;width:100%;background:#10b981;color:#0f172a;border:none;padding:5px;border-radius:6px;font-weight:bold;cursor:pointer;">Spill her ➔</button></div>`
      );
      m.on('popupopen', () => {
        const btn = document.getElementById(`play-${course.id}`);
        if (btn) btn.onclick = () => openSetupRound(course);
      });
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return alert('Fyll ut e-post og passord');
    const existing = await cloudApi.getPlayer(email);
    if (existing) {
      setXp(existing.xp || 1450);
      setName(existing.name || name);
      setFriendRequests(existing.friend_requests || []);
      setFriends(existing.friends || []);
      if (existing.stats) {
        const cg = { ...(existing.stats.courseGames || {}) };
        if (cg['Kolbeinsvik Disc Golf Park']) {
          cg['Kolbeinsvik Diskgolfbane'] =
            (cg['Kolbeinsvik Diskgolfbane'] || 0) +
            cg['Kolbeinsvik Disc Golf Park'];
          delete cg['Kolbeinsvik Disc Golf Park'];
        }
        setPlayerStats({ ...existing.stats, courseGames: cg });
      }
      if (existing.badges) setUnlockedBadges(existing.badges);
    } else {
      await cloudApi.upsertPlayer(
        email,
        name,
        1450,
        [],
        [],
        {
          totalGames: 0,
          courseGames: {},
          playedCoursesData: {},
          totalKm: 0,
          bestRoundDiff: null,
        },
        []
      );
    }
    setLeaderboardPlayers(await cloudApi.getTopPlayers());
    setIsLoggedIn(true);
    triggerToast(`Velkommen, ${name}! 🥏`);
  };

  const currentLevelObj =
    LEVEL_DATA.find(
      (l, idx) =>
        xp >= l.requiredXp &&
        (!LEVEL_DATA[idx + 1] || xp < LEVEL_DATA[idx + 1].requiredXp)
    ) || LEVEL_DATA[0];
  const nextLevelObj =
    LEVEL_DATA.find((l) => l.level === currentLevelObj.level + 1) ||
    currentLevelObj;
  const progressPercent = Math.min(
    100,
    Math.max(
      0,
      ((xp - currentLevelObj.requiredXp) /
        Math.max(1, nextLevelObj.requiredXp - currentLevelObj.requiredXp)) *
        100
    )
  );

  if (!isLoggedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950 font-sans text-slate-100 p-0 sm:p-4">
        <div className="w-full max-w-md h-[100vh] sm:h-[890px] bg-slate-900 sm:rounded-3xl shadow-2xl flex flex-col justify-between p-6 border border-slate-800">
          <div className="pt-12 text-center space-y-3">
            <div className="flex justify-center mb-4">
              <FancyDiscLogo />
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 via-cyan-300 to-amber-300 bg-clip-text text-transparent">
              DISC GOLF RPG
            </h1>
            <p className="text-xs text-emerald-400 font-bold">
              🇳🇴 Banekart, Scorekort & Emblemer
            </p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4 my-auto">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                Spillernavn
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                E-postadresse
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@epost.no"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                Passord
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Logg Inn & Start Spill
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-500">
            All fremgang, runder og emblemer lagres automatisk.
          </p>
        </div>
      </div>
    );
  }

  const playedCoursesList = getPlayedCoursesList();
  const nearbyCoursesList = getNearbyCoursesList();

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950 font-sans text-slate-100 p-0 sm:p-4">
      {toast && (
        <div className="fixed top-5 z-50 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce text-xs">
          <Sparkles className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* MODAL: LEGG TIL NY DISK */}
      {showAddDiscModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newDisc.name.trim()) return;
              setDiscs((p) => [
                ...p,
                { ...newDisc, id: Date.now().toString() },
              ]);
              setShowAddDiscModal(false);
              triggerToast(`La til ${newDisc.name}! 🥏`);
            }}
            className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-5 space-y-3 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <Disc className="w-4 h-4 text-emerald-400" /> Legg til disk
              </h3>
              <button
                type="button"
                onClick={() => setShowAddDiscModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={newDisc.brand}
                onChange={(e) =>
                  setNewDisc({ ...newDisc, brand: e.target.value })
                }
                placeholder="Merke (f.eks. Latitude 64)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                required
                value={newDisc.name}
                onChange={(e) =>
                  setNewDisc({ ...newDisc, name: e.target.value })
                }
                placeholder="Modell (f.eks. River)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newDisc.type}
                onChange={(e) =>
                  setNewDisc({ ...newDisc, type: e.target.value })
                }
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white"
              >
                <option value="Putter">Putter</option>
                <option value="Midrange">Midrange</option>
                <option value="Fairway Driver">Fairway Driver</option>
                <option value="Distance Driver">Distance Driver</option>
              </select>
              <input
                type="text"
                value={newDisc.plastic}
                onChange={(e) =>
                  setNewDisc({ ...newDisc, plastic: e.target.value })
                }
                placeholder="Plast (f.eks. Opto)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['speed', 'glide', 'turn', 'fade'] as const).map((k) => (
                <div key={k}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    {k}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newDisc[k]}
                    onChange={(e) =>
                      setNewDisc({
                        ...newDisc,
                        [k]: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-center font-mono text-emerald-400"
                  />
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-500 text-slate-950 font-black py-2.5 rounded-xl text-xs"
            >
              Lagre Disk
            </button>
          </form>
        </div>
      )}

      {/* MODAL: OPPSETT AV RUNDE */}
      {setupRoundModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400" /> Rundeoppsett
              </h3>
              <button
                onClick={() => setSetupRoundModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Valgt Bane
                  </span>
                  <span className="text-xs font-black text-white">
                    {activeCourse.image} {activeCourse.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {activeCourse.location}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSetupRoundModal(false);
                    setActiveTab('courses');
                  }}
                  className="text-[10px] bg-slate-900 border border-slate-800 text-emerald-400 font-bold px-2.5 py-1.5 rounded-lg"
                >
                  Søk / Bytt bane
                </button>
              </div>
              <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold">
                  Antall hull:
                </span>
                <div className="flex gap-1.5">
                  {[9, 12, 18].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setCustomHoleCount(h)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        customHoleCount === h
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {h} hull
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {courseWeather?.isRain ? (
                  <CloudRain className="w-5 h-5 text-cyan-400" />
                ) : (
                  <Wind className="w-5 h-5 text-emerald-400" />
                )}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">
                    Yr.no Værsjekk
                  </span>
                  <span className="text-xs text-white font-bold">
                    {isLoadingWeather ? 'Henter vær...' : courseWeather?.desc}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {courseWeather?.temp}°C
              </span>
            </div>

            {friends.length > 0 && (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                  Ta med venner i flighten:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {friends.map((f: any) => {
                    const sel = flightPlayers.some((p) => p.email === f.email);
                    return (
                      <button
                        key={f.email}
                        type="button"
                        onClick={() =>
                          setFlightPlayers((prev) =>
                            sel
                              ? prev.filter((p) => p.email !== f.email)
                              : [
                                  ...prev,
                                  {
                                    name: f.name,
                                    email: f.email,
                                    isGuest: false,
                                  },
                                ]
                          )
                        }
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 ${
                          sel
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-950 text-slate-300 border-slate-800'
                        }`}
                      >
                        {sel && <Check className="w-3 h-3" />} {f.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">
                Legg til gjestespiller (uten app)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={guestNameInput}
                  onChange={(e) => setGuestNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && guestNameInput.trim()) {
                      setFlightPlayers((p) => [
                        ...p,
                        {
                          name: `${guestNameInput.trim()} (Gjest)`,
                          isGuest: true,
                        },
                      ]);
                      setGuestNameInput('');
                    }
                  }}
                  placeholder="Navn på gjest..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!guestNameInput.trim()) return;
                    setFlightPlayers((p) => [
                      ...p,
                      {
                        name: `${guestNameInput.trim()} (Gjest)`,
                        isGuest: true,
                      },
                    ]);
                    setGuestNameInput('');
                  }}
                  className="bg-slate-800 text-emerald-400 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Gjest
                </button>
              </div>
            </div>

            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {flightPlayers.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl flex items-center justify-between text-xs text-white font-bold"
                >
                  <span>
                    {idx === 0 ? '🥏' : p.isGuest ? '🎟️' : '🤝'} {p.name}{' '}
                    {idx === 0 && '(Deg)'}
                  </span>
                  {idx > 0 && (
                    <button
                      onClick={() =>
                        setFlightPlayers((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={startRound}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs shadow-lg"
            >
              Start Runden ➔
            </button>
          </div>
        </div>
      )}

      {/* AKTIV RUNDE / SCOREKORT */}
      {inActiveRound && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex justify-center">
          <div className="w-full max-w-md h-full flex flex-col p-4 justify-between">
            <div className="space-y-3 overflow-y-auto pb-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="font-black text-sm text-white">
                    {activeCourse.name}
                  </h2>
                  <p className="text-[11px] text-emerald-400 font-bold">
                    {!roundFinished
                      ? `Hull ${currentHoleIndex + 1} av ${
                          courseLayout.length
                        } • Par ${courseLayout[currentHoleIndex].par} (${
                          courseLayout[currentHoleIndex].distance
                        })`
                      : 'Sluttresultat & Oppsummering'}
                  </p>
                </div>
                <button
                  onClick={() => setInActiveRound(false)}
                  className="bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-xl text-xs font-bold"
                >
                  Lukk
                </button>
              </div>

              {!roundFinished ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-2xl">
                    <button
                      disabled={currentHoleIndex === 0}
                      onClick={() =>
                        setCurrentHoleIndex((p) => Math.max(0, p - 1))
                      }
                      className="p-2 rounded-xl bg-slate-950 text-slate-300 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="text-center">
                      <span className="text-xs font-black text-white block">
                        HULL {currentHoleIndex + 1}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        Par {courseLayout[currentHoleIndex].par} • Lengde{' '}
                        {courseLayout[currentHoleIndex].distance}
                      </span>
                    </div>
                    <button
                      disabled={currentHoleIndex === courseLayout.length - 1}
                      onClick={() =>
                        setCurrentHoleIndex((p) =>
                          Math.min(courseLayout.length - 1, p + 1)
                        )
                      }
                      className="p-2 rounded-xl bg-slate-950 text-slate-300 disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {flightPlayers.map((player, pIdx) => {
                      const holePar = courseLayout[currentHoleIndex].par;
                      const holeScore =
                        scores[pIdx]?.[currentHoleIndex] ?? holePar;
                      const holeDiff = holeScore - holePar;
                      const totals = getPlayerTotals(pIdx);
                      const holeLabel =
                        holeScore === 1
                          ? 'ACE! 🌟'
                          : holeDiff <= -2
                          ? 'Eagle! 🦅'
                          : holeDiff === -1
                          ? 'Birdie 🐦'
                          : holeDiff === 0
                          ? 'Par'
                          : holeDiff === 1
                          ? 'Bogey'
                          : `+${holeDiff}`;

                      return (
                        <div
                          key={pIdx}
                          className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-xs text-white flex items-center gap-1.5">
                              <span>{player.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                                Tot: {totals.totalThrows} (
                                {totals.diffFormatted})
                              </span>
                            </div>
                            <div
                              className={`text-[10px] font-bold mt-0.5 ${
                                holeScore === 1
                                  ? 'text-amber-300 animate-pulse'
                                  : holeDiff < 0
                                  ? 'text-cyan-400'
                                  : holeDiff > 0
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              Dette hullet: {holeLabel}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateScore(pIdx, -1)}
                              className="w-9 h-9 bg-slate-950 border border-slate-800 text-white rounded-xl flex items-center justify-center"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-7 text-center font-mono font-black text-base text-emerald-400">
                              {holeScore}
                            </span>
                            <button
                              onClick={() => updateScore(pIdx, 1)}
                              className="w-9 h-9 bg-slate-950 border border-slate-800 text-white rounded-xl flex items-center justify-center"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="text-center space-y-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                    <div className="text-3xl">🏆</div>
                    <h3 className="text-base font-black text-white">
                      Runde Fullført & Lagret!
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tilbakelagt distanse:{' '}
                      <span className="text-cyan-400 font-bold">
                        {roundKm} km
                      </span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    {flightPlayers
                      .map((p, idx) => ({ ...p, ...getPlayerTotals(idx) }))
                      .sort((a, b) => a.totalThrows - b.totalThrows)
                      .map((res, rIdx) => (
                        <div
                          key={rIdx}
                          className={`p-3 rounded-2xl border flex items-center justify-between ${
                            rIdx === 0
                              ? 'bg-emerald-950/30 border-emerald-500/50'
                              : 'bg-slate-900 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm font-black w-5 text-center">
                              {rIdx === 0
                                ? '🥇'
                                : rIdx === 1
                                ? '🥈'
                                : rIdx === 2
                                ? '🥉'
                                : `${rIdx + 1}.`}
                            </span>
                            <span className="text-xs font-bold text-white">
                              {res.name}
                            </span>
                          </div>
                          <div className="text-right font-mono">
                            <span className="text-xs font-black text-white block">
                              {res.totalThrows} kast
                            </span>
                            <span className="text-[10px] font-bold text-emerald-400">
                              {res.diffFormatted} mot par
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                  {sessionUnlockedBadges.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase block">
                        🎖️ Nye emblemer låst opp:
                      </span>
                      {sessionUnlockedBadges.map((b, i) => (
                        <div
                          key={i}
                          className="bg-slate-900 border border-amber-500/50 p-3 rounded-2xl flex items-center gap-3"
                        >
                          <span className="text-2xl">{b.icon}</span>
                          <div>
                            <div className="font-black text-xs text-amber-300">
                              {b.title}
                            </div>
                            <div className="text-[10px] text-slate-300">
                              {b.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-900">
              {!roundFinished ? (
                currentHoleIndex < courseLayout.length - 1 ? (
                  <button
                    onClick={() => setCurrentHoleIndex((p) => p + 1)}
                    className="w-full bg-emerald-500 text-slate-950 font-black py-3.5 rounded-2xl text-xs"
                  >
                    Lagre Hull {currentHoleIndex + 1} & Neste Hull ➔
                  </button>
                ) : (
                  <button
                    onClick={finishRound}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-400 text-slate-950 font-black py-3.5 rounded-2xl text-xs"
                  >
                    Fullfør Runde & Se Resultater 🏁
                  </button>
                )
              ) : (
                <button
                  onClick={() => setInActiveRound(false)}
                  className="w-full bg-emerald-500 text-slate-950 font-black py-3.5 rounded-2xl text-xs"
                >
                  Tilbake til Oversikt
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HOVED-RAMME */}
      <div className="w-full max-w-md h-[100vh] sm:h-[890px] bg-slate-900 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-800 relative">
        <header className="bg-slate-900/95 border-b border-slate-800/80 p-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <FancyDiscLogo />
            <div>
              <h1 className="font-black text-base bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
                DISC GOLF RPG
              </h1>
              <p className="text-[10px] text-emerald-400 font-bold">
                Lvl {currentLevelObj.level} • {currentLevelObj.title}
              </p>
            </div>
          </div>
          <button
            onClick={() => openSetupRound(activeCourse)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black shadow"
          >
            + Ny Runde
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 bg-slate-900 rounded-2xl border border-slate-800">
                    {currentLevelObj.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-black text-white">{name}</h2>
                      <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                        Level {currentLevelObj.level}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400 font-bold">
                      {currentLevelObj.title}
                    </p>
                    <p className="text-[10px] text-slate-400 italic mt-0.5">
                      "{currentLevelObj.desc}"
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span>XP mot Level {nextLevelObj.level}</span>
                    <span className="text-emerald-400 font-mono">
                      {xp} / {nextLevelObj.requiredXp} XP
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-xs text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />{' '}
                  Spillestatistikk & Banehistorikk
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">
                      Spilte runder
                    </span>
                    <div className="text-base font-mono font-black text-emerald-400">
                      {playerStats.totalGames}
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">
                      Totalt gått
                    </span>
                    <div className="text-base font-mono font-black text-cyan-400">
                      {playerStats.totalKm} km
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">
                      Beste runde
                    </span>
                    <div className="text-base font-mono font-black text-amber-400">
                      {playerStats.bestRoundDiff == null
                        ? '-'
                        : playerStats.bestRoundDiff === 0
                        ? 'Par (E)'
                        : playerStats.bestRoundDiff > 0
                        ? `+${playerStats.bestRoundDiff}`
                        : playerStats.bestRoundDiff}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Spilte runder per bane:
                  </span>
                  {Object.keys(playerStats.courseGames || {}).length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      Ingen runder spilt ennå.
                    </p>
                  ) : (
                    Object.entries(playerStats.courseGames).map(
                      ([cName, count]) => (
                        <div
                          key={cName}
                          className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl flex items-center justify-between text-xs"
                        >
                          <span className="text-white font-bold">{cName}</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {count} {count === 1 ? 'runde' : 'runder'}
                          </span>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-white flex items-center gap-2">
                    <Disc className="w-4 h-4 text-emerald-400" /> Diskbagen din
                    ({discs.length})
                  </h3>
                  <button
                    onClick={() => setShowAddDiscModal(true)}
                    className="text-[10px] bg-slate-900 text-emerald-400 border border-slate-800 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Legg til disk
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {discs.map((d) => (
                    <div
                      key={d.id}
                      className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-xs text-white">
                            {d.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {d.brand} • {d.plastic}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setDiscs((p) => p.filter((x) => x.id !== d.id))
                          }
                          className="text-slate-600 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[9px] text-slate-400">
                          {d.type}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                          {d.speed}|{d.glide}|{d.turn}|{d.fade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BANER */}
          {activeTab === 'courses' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-sm text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" /> Banesøk & Kart
                </h2>
                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                  <Compass className="w-3 h-3 text-emerald-400" /> Google Maps
                </span>
              </div>

              <form onSubmit={handleSearchCoursesOnMap} className="flex gap-2">
                <input
                  type="text"
                  value={courseSearchQuery}
                  onChange={(e) => setCourseSearchQuery(e.target.value)}
                  placeholder="Søk etter bane eller sted..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-emerald-500 text-slate-950 font-black px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1"
                >
                  <Search className="w-3.5 h-3.5" />{' '}
                  {isSearchingCourses ? '...' : 'Søk'}
                </button>
              </form>

              {courseSearchResults.length > 0 && (
                <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">
                      Søkeresultater ({courseSearchResults.length})
                    </span>
                    <button
                      onClick={() => setCourseSearchResults([])}
                      className="text-[10px] text-slate-400"
                    >
                      Lukk ✕
                    </button>
                  </div>
                  {courseSearchResults.map((c) => (
                    <div
                      key={c.id}
                      className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-white">
                          {c.image} {c.name}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {c.location}
                        </p>
                      </div>
                      <button
                        onClick={() => openSetupRound(c)}
                        className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg"
                      >
                        Spill her
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="w-full h-64 rounded-2xl border border-slate-800 overflow-hidden relative shadow-lg">
                <div ref={mapRef} className="w-full h-full z-10"></div>
              </div>

              <div className="space-y-2 pt-1">
                <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Dine Spilte Baner ({playedCoursesList.length})
                </h3>
                {playedCoursesList.length === 0 ? (
                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl text-center">
                    <p className="text-xs text-slate-300 font-bold">
                      Ingen spilte baner ennå
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Når du har reist til en bane og fullført 1 runde, blir den
                      lagret fast på listen din her.
                    </p>
                  </div>
                ) : (
                  playedCoursesList.map((c) => (
                    <div
                      key={c.id}
                      className="bg-slate-950 border border-emerald-500/30 p-3 rounded-2xl flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-white">
                          {c.image} {c.name}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {c.location} • {c.holes} hull •{' '}
                          <span className="text-emerald-400 font-bold">
                            Spilt {playerStats.courseGames?.[c.name] || 1}x
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => openSetupRound(c)}
                        className="bg-emerald-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl"
                      >
                        Spill igjen
                      </button>
                    </div>
                  ))
                )}
              </div>

              {nearbyCoursesList.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    I nærheten av deg nå (GPS)
                  </h3>
                  {nearbyCoursesList.map((c) => (
                    <div
                      key={c.id}
                      className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-white">
                          {c.image} {c.name}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {c.location} • {c.holes} hull
                        </p>
                      </div>
                      <button
                        onClick={() => openSetupRound(c)}
                        className="bg-slate-800 text-emerald-400 font-black text-xs px-3.5 py-2 rounded-xl border border-slate-700"
                      >
                        Spill
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-sm text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" /> Emblemer &
                  Prestasjoner
                </h2>
                <span className="text-xs text-emerald-400 font-mono font-bold">
                  {unlockedBadges.length} / {ALL_BADGES.length} Låst opp
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {ALL_BADGES.map((b) => {
                  const isUnl = unlockedBadges.includes(b.id);
                  const cur =
                    b.type === 'km'
                      ? playerStats.totalKm || 0
                      : b.type === 'games'
                      ? playerStats.totalGames || 0
                      : isUnl
                      ? b.target
                      : 0;
                  const pct = Math.min(
                    100,
                    Math.max(0, (cur / b.target) * 100)
                  );
                  return (
                    <div
                      key={b.id}
                      className={`p-3.5 rounded-2xl border space-y-2 ${
                        isUnl
                          ? 'bg-slate-950 border-amber-500/50'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-2xl p-2.5 rounded-xl border ${
                            isUnl
                              ? 'bg-amber-950/40 border-amber-500/40'
                              : 'bg-slate-900 border-slate-800 opacity-40 grayscale'
                          }`}
                        >
                          {b.icon}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-black text-xs text-white">
                              {b.title}{' '}
                              <span className="text-[10px] text-amber-400 font-normal">
                                ({b.subtitle})
                              </span>
                            </h4>
                            {isUnl ? (
                              <span className="text-[10px] text-amber-400 font-bold">
                                Låst opp 🏆
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">
                                {cur} / {b.target}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {b.desc}
                          </p>
                        </div>
                      </div>
                      {!isUnl && b.target > 1 && (
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="bg-amber-500 h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="space-y-4">
              <h2 className="font-black text-sm text-white flex items-center gap-2">
                <UsersRound className="w-4 h-4 text-emerald-400" /> Venner &
                Forespørsler
              </h2>
              {friendRequests.length > 0 && (
                <div className="bg-amber-950/30 border border-amber-500/50 rounded-2xl p-3 space-y-2">
                  <div className="text-amber-400 font-bold text-xs flex items-center gap-2">
                    <Bell className="w-4 h-4" /> Venneforespørsler (
                    {friendRequests.length})
                  </div>
                  {friendRequests.map((req: any) => (
                    <div
                      key={req.email}
                      className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-white">
                          {req.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {req.email}
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={async () => {
                            const uf = [
                              ...friends,
                              {
                                email: req.email,
                                name: req.name,
                                xp: req.xp || 1000,
                              },
                            ];
                            const ur = friendRequests.filter(
                              (r) => r.email !== req.email
                            );
                            setFriends(uf);
                            setFriendRequests(ur);
                            await cloudApi.upsertPlayer(
                              email,
                              name,
                              xp,
                              ur,
                              uf,
                              playerStats,
                              unlockedBadges
                            );
                            triggerToast(`${req.name} lagt til!`);
                          }}
                          className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-1.5 rounded-lg"
                        >
                          Godkjenn
                        </button>
                        <button
                          onClick={async () => {
                            const ur = friendRequests.filter(
                              (r) => r.email !== req.email
                            );
                            setFriendRequests(ur);
                            await cloudApi.upsertPlayer(
                              email,
                              name,
                              xp,
                              ur,
                              friends,
                              playerStats,
                              unlockedBadges
                            );
                          }}
                          className="bg-slate-800 text-red-400 font-bold text-[10px] px-2.5 py-1.5 rounded-lg"
                        >
                          Avslå
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Søk etter spiller..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                  <button
                    onClick={async () => {
                      if (!searchQuery.trim()) return;
                      const r = await cloudApi.searchPlayers(searchQuery);
                      setSearchResults(
                        r.filter(
                          (p: any) =>
                            p.email !== email &&
                            !friends.some((f: any) => f.email === p.email)
                        )
                      );
                    }}
                    className="bg-emerald-500 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs"
                  >
                    Søk
                  </button>
                </div>
                {searchResults.map((p: any) => (
                  <div
                    key={p.email}
                    className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-white">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {p.xp || 1000} XP
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (
                          await cloudApi.sendFriendRequest(p.email, {
                            email,
                            name,
                            xp,
                          })
                        ) {
                          triggerToast(`Sendt til ${p.name}!`);
                          setSearchResults((prev) =>
                            prev.filter((x) => x.email !== p.email)
                          );
                        }
                      }}
                      className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-1.5 rounded-lg"
                    >
                      + Legg til
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase">
                  Venneliste ({friends.length})
                </h3>
                {friends.map((f: any) => (
                  <div
                    key={f.email}
                    className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-white">
                        {f.name}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        {f.xp || 1450} XP
                      </div>
                    </div>
                    <button
                      onClick={() => openSetupRound(activeCourse)}
                      className="bg-slate-900 border border-slate-800 text-emerald-400 font-bold text-[10px] px-3 py-1.5 rounded-xl flex items-center gap-1"
                    >
                      <Swords className="w-3 h-3" /> Inviter i runde
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-3">
              <h2 className="font-black text-sm text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Toppliste
              </h2>
              {leaderboardPlayers.map((p, idx) => (
                <div
                  key={p.email || idx}
                  className={`p-3 rounded-2xl border flex items-center justify-between ${
                    p.email === email
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black text-xs w-5 text-center text-slate-400">
                      {idx === 0
                        ? '🥇'
                        : idx === 1
                        ? '🥈'
                        : idx === 2
                        ? '🥉'
                        : `${idx + 1}.`}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-white">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {p.stats?.totalGames || 0} runder •{' '}
                        {p.stats?.totalKm || 0} km
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-emerald-400 font-black text-xs">
                    {p.xp || 0} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </main>

        <nav className="absolute bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-800 py-2.5 px-4 flex justify-between items-center z-30">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex flex-col items-center text-[10px] font-bold ${
              activeTab === 'courses' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <MapPin className="w-4 h-4 mb-0.5" /> Baner
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex flex-col items-center text-[10px] font-bold ${
              activeTab === 'badges' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <Award className="w-4 h-4 mb-0.5" /> Emblemer
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex flex-col items-center text-[10px] font-bold relative ${
              activeTab === 'friends' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <UsersRound className="w-4 h-4 mb-0.5" /> Venner
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex flex-col items-center text-[10px] font-bold ${
              activeTab === 'leaderboard'
                ? 'text-emerald-400'
                : 'text-slate-400'
            }`}
          >
            <Trophy className="w-4 h-4 mb-0.5" /> Toppliste
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center text-[10px] font-bold ${
              activeTab === 'profile' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <User className="w-4 h-4 mb-0.5" /> Profil
          </button>
        </nav>
      </div>
    </div>
  );
}
