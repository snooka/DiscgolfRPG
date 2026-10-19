import React, { useState } from 'react';
import { 
  Trophy, User, Disc, MapPin, Plus, ChevronRight, 
  CheckCircle, Play, Sparkles, ChevronLeft, 
  Trash2, Zap, ExternalLink, Calendar, Copy, History, Check,
  CloudRain, Wind, Info, Eye, X, Shield, UserPlus, Swords, Activity, UsersRound
} from 'lucide-react';

// Egendefinert artig neon-logo med disk og kjettingkurv
const FancyDiscLogo = () => (
  <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-tr from-amber-500 via-rose-500 to-cyan-500 p-0.5 rounded-2xl shadow-lg shadow-cyan-500/20 animate-pulse">
    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden relative">
      <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {/* Kurv kjettinger */}
        <path d="M7 6h10M8 6l1 7M16 6l-1 7M12 6v7M9 13h6M10 13l2 4M14 13l-2 4" strokeLinecap="round" strokeLinejoin="round" className="stroke-slate-400" />
        {/* Disk i bevegelse */}
        <ellipse cx="16" cy="9" rx="5" ry="2" className="fill-emerald-400 stroke-emerald-300" />
        <path d="M11 9c2 0 3.5-.5 4.5-1" className="stroke-amber-400" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  </div>
);

const GENERATE_LEVELS = () => {
  const memes = [
    { level: 1, title: 'Tree Magnet 🌲', icon: '🪵', desc: 'Søker automatisk mot nærmeste furutre.' },
    { level: 2, title: 'Disc Finder 🔍', icon: '🕵️', desc: 'Leter mer i buskene enn du kaster.' },
    { level: 3, title: 'Chain Rattle ⚙️', icon: '💥', desc: 'Kjettingene skjelver når du nærmer deg.' },
    { level: 4, title: 'Water Hazard Veteran 🌊', icon: '🤿', desc: 'Disken din elsker å svømme.' },
    { level: 5, title: 'Bogey King 👑', icon: '🤴', desc: 'Stødig på +1 på hvert eneste hull.' },
    { level: 6, title: 'Hyzer Flip Novice 🔄', icon: '🌀', desc: 'Begynner å få vinklene på plass.' },
    { level: 7, title: 'Fairway Finder 🎯', icon: '🎯', desc: 'Treffer gaten 50% av gangene.' },
    { level: 8, title: 'Putter Sniper 🏹', icon: '🎯', desc: 'Sikker innenfor C1 (10 meter).' },
    { level: 9, title: 'Wind Whisperer 💨', icon: '🧙‍♂️', desc: 'Leser kastevinkel i storm.' },
    { level: 10, title: 'Disc Golf Chad 💪', icon: '🗿', desc: 'Kaster 120m uten oppvarming.' },
    { level: 12, title: 'Parked Specialist 🅿️', icon: '🚗', desc: 'Landingspunktet er alltid under kurven.' },
    { level: 15, title: 'Chains Whisperer ⚡', icon: '⚡', desc: 'Hører kjettingene før disken forlater hånden.' },
    { level: 20, title: 'Ace God 🔱', icon: '🔱', desc: 'Legende på alle norske baner.' }
  ];

  const levels = [];
  let cumulativeXp = 0;

  for (let i = 1; i <= 20; i++) {
    let reqForThisLevel = 0;
    if (i === 1) reqForThisLevel = 0;
    else if (i <= 10) {
      reqForThisLevel = 40 + (i * 30);
    } else {
      reqForThisLevel = Math.round(350 * Math.pow(1.35, i - 10));
    }
    cumulativeXp += reqForThisLevel;

    const memeInfo = memes.find(m => m.level === i) || {
      level: i,
      title: `Disc Master Lvl ${i} 🥏`,
      icon: '🏆',
      desc: 'Formidabel spiller med masse runder bak seg.'
    };

    levels.push({
      level: i,
      title: memeInfo.title,
      icon: memeInfo.icon,
      desc: memeInfo.desc,
      minXp: cumulativeXp
    });
  }
  return levels;
};

const MEME_LEVELS = GENERATE_LEVELS();

const WEATHER_BADGES = [
  { id: 'rain_warrior', name: 'Regnkriger 🌧️', desc: 'Spilte runde i regnvær. "Ingen dårlig vær!"', icon: '☔', bg: 'bg-blue-900/40 border-blue-500/50 text-blue-300' },
  { id: 'storm_master', name: 'Stormmester 💨', desc: 'Spilte runde med vind over 8 m/s.', icon: '🌪️', bg: 'bg-cyan-900/40 border-cyan-500/50 text-cyan-300' },
  { id: 'ice_ace', name: 'Isfisker ❄️', desc: 'Trossa kulda under 3°C på banen.', icon: '🧊', bg: 'bg-indigo-900/40 border-indigo-500/50 text-indigo-300' },
  { id: 'sun_seeker', name: 'Solskinnskaster ☀️', desc: 'Kastet i strålende solskinn og varmt vær.', icon: '🕶️', bg: 'bg-amber-900/40 border-amber-500/50 text-amber-300' }
];

const COURSES = [
  {
    id: 'c_haganes',
    name: 'Haganes Discgolfpark',
    location: 'Sotra / Øygarden, Vestland',
    par: 54,
    holesCount: 18,
    difficulty: 'Middels',
    image: '🌲',
    mapsQuery: 'Haganes+Discgolfpark',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3][i] || 3,
      distance: [68, 75, 82, 60, 115, 70, 85, 90, 65, 72, 88, 125, 78, 62, 95, 70, 80, 65][i] || 75,
      description: i % 2 === 0 ? 'Skogshull med smal fairway og OB-grenser.' : 'Kast over åpent terreng, vokt deg for vinden.',
    }))
  },
  {
    id: 'c_alvoen',
    name: 'Alvøen Frisbeegolfbane',
    location: 'Alvøen, Bergen',
    par: 57,
    holesCount: 18,
    difficulty: 'Nybegynner / Middels',
    image: '🌿',
    mapsQuery: 'Alvoen+Frisbeegolfbane+Bergen',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [3, 3, 4, 3, 3, 3, 4, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3][i] || 3,
      distance: [70, 80, 130, 65, 85, 75, 120, 60, 90, 70, 85, 140, 65, 72, 88, 92, 75, 68][i] || 80,
      description: 'Variert park- og skogsbane i flotte omgivelser.'
    }))
  },
  {
    id: 'c_flaktveit',
    name: 'Flaktveit Discgolfpark',
    location: 'Åsane, Bergen',
    par: 56,
    holesCount: 18,
    difficulty: 'Middels',
    image: '🏔️',
    mapsQuery: 'Flaktveit+Discgolfpark',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [3, 3, 4, 3, 3, 3, 3, 4, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3][i] || 3,
      distance: [65, 88, 135, 70, 92, 78, 85, 145, 60, 75, 82, 90, 128, 68, 74, 80, 86, 70][i] || 75,
      description: 'Teknisk krevende bane i kupert skogsterreng.'
    }))
  },
  {
    id: 'c_smoras',
    name: 'Smøråsfjellet Frisbeegolfbane',
    location: 'Rådal, Bergen',
    par: 30,
    holesCount: 9,
    difficulty: 'Nybegynner',
    image: '🌲',
    mapsQuery: 'Smorasfjellet+Frisbeegolfbane',
    holes: Array.from({ length: 9 }, (_, i) => ({
      number: i + 1,
      par: 3,
      distance: [55, 62, 70, 48, 65, 58, 75, 52, 68][i] || 60,
      description: 'Familievennlig 9-hulls skogsbane i turterrenget.'
    }))
  }
];

const INITIAL_DISCS = [
  { id: 'd1', brand: 'Innova', model: 'Destroyer', type: 'Distance Driver', speed: 12, glide: 5, turn: -1, fade: 3, color: 'bg-rose-500' },
  { id: 'd2', brand: 'Discraft', model: 'Buzzz', type: 'Midrange', speed: 5, glide: 4, turn: -1, fade: 1, color: 'bg-amber-500' },
  { id: 'd3', brand: 'Kastaplast', model: 'Berg', type: 'Putter', speed: 1, glide: 1, turn: 0, fade: 2, color: 'bg-cyan-500' }
];

const INITIAL_QUESTS = [
  { id: 'q1', title: 'Klar 5 Par på en runde', desc: 'Registrer minst 5 par på en hel runde', xpReward: 10, completed: false, claimed: false, icon: '🎯' },
  { id: 'q2', title: 'Spill uten å miste en disk', desc: 'Gjennomfør 9 eller 18 hull trygt', xpReward: 15, completed: false, claimed: false, icon: '🛡️' },
  { id: 'q3', title: 'Minst 1 Birdie på valgfri bane', desc: 'Klar en birdie (-1 under par)', xpReward: 25, completed: false, claimed: false, icon: '🐥' },
  { id: 'q4', title: 'Logg runde med venner', desc: 'Spill en runde sammen med minst 1 venn', xpReward: 20, completed: false, claimed: false, icon: '👥' },
  { id: 'q5', title: 'Registrer 3 disker i bagen', desc: 'Ha minst 3 disker registrert i "Min Bag"', xpReward: 15, completed: false, claimed: false, icon: '🥏' }
];

const INITIAL_FRIENDS = [
  { 
    id: 'f1', 
    name: 'Jonas "Hyzer" Berg', 
    code: 'JONAS-9921', 
    level: 6, 
    levelTitle: 'Hyzer Flip Novice 🔄', 
    xp: 580, 
    avatar: '🧔', 
    roundsCount: 14,
    birdies: 12,
    aces: 1,
    status: 'Vind-guru 💨',
    badges: ['rain_warrior', 'storm_master'],
    favDisc: 'Kastaplast Berg',
    headToHead: { wins: 3, losses: 5, ties: 1 },
    roundsTogether: 9,
    bestScore: { course: 'Smøråsfjellet Frisbeegolfbane', score: -3 }
  },
  { 
    id: 'f2', 
    name: 'Kari "Putter" Hansen', 
    code: 'KARI-1102', 
    level: 4, 
    levelTitle: 'Water Hazard Veteran 🌊', 
    xp: 310, 
    avatar: '👩', 
    roundsCount: 8,
    birdies: 5,
    aces: 0,
    status: 'Regnkriger 🌧️',
    badges: ['rain_warrior'],
    favDisc: 'Discraft Buzzz',
    headToHead: { wins: 4, losses: 2, ties: 0 },
    roundsTogether: 6,
    bestScore: { course: 'Alvøen Frisbeegolfbane', score: +2 }
  },
  { 
    id: 'f3', 
    name: 'Morten "TreeHit" Olsen', 
    code: 'MORT-4481', 
    level: 2, 
    levelTitle: 'Disc Finder 🔍', 
    xp: 120, 
    avatar: '👨‍🦱', 
    roundsCount: 3,
    birdies: 1,
    aces: 0,
    status: 'Solskinnspiller ☀️',
    badges: ['sun_seeker'],
    favDisc: 'Innova Destroyer',
    headToHead: { wins: 2, losses: 0, ties: 0 },
    roundsTogether: 2,
    bestScore: { course: 'Haganes Discgolfpark', score: +8 }
  },
];

const INITIAL_ACTIVITY_FEED = [
  {
    id: 'feed_1',
    date: '18. Okt 2026',
    courseName: 'Flaktveit Discgolfpark',
    weather: 'Regn (2.4mm) & 9.5m/s',
    players: [
      { id: 'f1', name: 'Jonas "Hyzer" Berg', score: 54, diff: -2, winner: true, avatar: '🧔', isFriend: true },
      { id: 'me', name: 'FrisbeeMaster (Deg)', score: 57, diff: +1, winner: false, avatar: '😎', isFriend: true },
      { id: 'non_friend_1', name: 'Sander "Anhyzer" Moe', code: 'SAND-3301', score: 59, diff: +3, winner: false, avatar: '🧢', isFriend: false, friendOf: 'Jonas "Hyzer" Berg' }
    ]
  },
  {
    id: 'feed_2',
    date: '15. Okt 2026',
    courseName: 'Alvøen Frisbeegolfbane',
    weather: 'Solskinn & 3m/s',
    players: [
      { id: 'me', name: 'FrisbeeMaster (Deg)', score: 55, diff: -2, winner: true, avatar: '😎', isFriend: true },
      { id: 'f2', name: 'Kari "Putter" Hansen', score: 59, diff: +2, winner: false, avatar: '👩', isFriend: true }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('play'); 
  
  const [weather] = useState({
    condition: 'Regn',
    temp: 8,
    windSpeed: 9.5,
    windDir: 'SSØ',
    locationName: 'Bergen / Vestland',
    rainMm: 2.4
  });

  const [user, setUser] = useState({
    name: 'FrisbeeMaster',
    friendCode: 'DISC-8842',
    avatar: '😎',
    xp: 145, 
    roundsPlayed: 2,
    totalBirdies: 3,
    totalAces: 0,
    badges: ['rain_warrior'],
    status: 'Regnkriger 🌧️'
  });

  const [discs, setDiscs] = useState(INITIAL_DISCS);
  const [quests, setQuests] = useState(INITIAL_QUESTS);
  const [friends, setFriends] = useState(INITIAL_FRIENDS);
  const [activityFeed, setActivityFeed] = useState(INITIAL_ACTIVITY_FEED);
  
  const [roundHistory, setRoundHistory] = useState([
    {
      id: 'h_1',
      date: '18. Okt 2026',
      courseName: 'Smøråsfjellet Frisbeegolfbane',
      totalStrokes: 28,
      par: 30,
      diff: -2,
      xpGained: 65,
      birdies: 2,
      weatherConditions: 'Regn (2.4mm) & 9.5m/s vind',
      badgeEarned: 'Regnkriger 🌧️',
      taggedDiscs: ['Kastaplast Berg'],
      coPlayers: ['Jonas "Hyzer" Berg']
    }
  ]);

  const [activeRound, setActiveRound] = useState(null);
  const [selectedCoPlayers, setSelectedCoPlayers] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [lastSummaryData, setLastSummaryData] = useState(null);

  const [showAddDisc, setShowAddDisc] = useState(false);
  const [newDisc, setNewDisc] = useState({ brand: '', model: '', type: 'Distance Driver', speed: 9, glide: 5, turn: -1, fade: 2 });
  const [friendInput, setFriendInput] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null); 
  const [showWeatherTips, setShowWeatherTips] = useState(false);

  const [toast, setToast] = useState(null);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const getCurrentLevel = (xp) => {
    let current = MEME_LEVELS[0];
    for (let lvl of MEME_LEVELS) {
      if (xp >= lvl.minXp) current = lvl;
    }
    return current;
  };

  const getNextLevel = (xp) => {
    for (let lvl of MEME_LEVELS) {
      if (lvl.minXp > xp) return lvl;
    }
    return null;
  };

  const addXP = (amount, reason) => {
    setUser(prev => ({ ...prev, xp: prev.xp + amount }));
    showNotification(`+${amount} XP: ${reason}`);
  };

  const getWeatherAdvice = () => {
    if (weather.condition === 'Regn' || weather.rainMm > 0) {
      return {
        title: '🌧️ Våte forhold & Regntips',
        points: [
          'Ha alltid med minst 2-3 tørkehaandklær (mikrofiber er best).',
          'Regn reduserer grepet: Bruk disker i gummimyk plast (f.eks. Kastaplast K1 Soft, Innova GStar).',
          'Disken glipper lettere ved kasteutslag - ta et roligere tilløp.',
          'Husk mottoet: "Ingen dårlig vær, bare dårlig klær!"'
        ]
      };
    } else if (weather.windSpeed > 7) {
      return {
        title: '💨 Kraftig Vind & Kasteteknikk',
        points: [
          `Motvind (${weather.windSpeed} m/s): Disken oppfører seg MER understabil. Velg en mer OVERSTABIL disk med mer fade.`,
          'Medvind: Disken vil dale fortere og oppføre seg mer overstabil. Bruk understabile disker med mer glide.',
          'Sidevind: Pass på vinkelen! Viser du undersiden av disken til vinden, vil den blåse langt vekk.',
          'Putt lavt i kjettingene i motvind.'
        ]
      };
    }
    return {
      title: '☀️ Strålende Spillevær',
      points: [
        'Perfekte forhold! Fokusér på rene kastevinkler og god oppvarming.',
        'Husk å drikke nok vann under runden.'
      ]
    };
  };

  const toggleCoPlayer = (friend) => {
    if (selectedCoPlayers.some(p => p.id === friend.id)) {
      setSelectedCoPlayers(selectedCoPlayers.filter(p => p.id !== friend.id));
    } else {
      setSelectedCoPlayers([...selectedCoPlayers, friend]);
    }
  };

  const startNewRound = (course) => {
    const initialScores = {};

    initialScores['me'] = {};
    course.holes.forEach(h => {
      initialScores['me'][h.number] = { strokes: h.par, discId: '' };
    });

    selectedCoPlayers.forEach(friend => {
      initialScores[friend.id] = {};
      course.holes.forEach(h => {
        initialScores[friend.id][h.number] = { strokes: h.par, discId: '' };
      });
    });

    setActiveRound({
      course,
      currentHoleIndex: 0,
      scores: initialScores,
      coPlayers: [...selectedCoPlayers],
      startTime: new Date()
    });
    setShowSummary(false);
  };

  const updateHoleScore = (playerId, holeNum, delta) => {
    if (!activeRound) return;
    setActiveRound(prev => {
      const currentStrokes = prev.scores[playerId][holeNum].strokes;
      const newStrokes = Math.max(1, currentStrokes + delta);
      return {
        ...prev,
        scores: {
          ...prev.scores,
          [playerId]: {
            ...prev.scores[playerId],
            [holeNum]: { ...prev.scores[playerId][holeNum], strokes: newStrokes }
          }
        }
      };
    });
  };

  const finishRound = () => {
    if (!activeRound) return;

    let myTotalStrokes = 0;
    let totalPar = activeRound.course.par;
    let birdiesCount = 0;
    let parCount = 0;
    let acesCount = 0;
    let xpGained = 50; 
    const taggedDiscsUsed = [];

    Object.entries(activeRound.scores['me']).forEach(([holeNum, data]) => {
      const hole = activeRound.course.holes.find(h => h.number === parseInt(holeNum));
      const strokes = data.strokes;
      myTotalStrokes += strokes;

      if (strokes === 1) {
        acesCount++;
        xpGained += 50; 
      } else if (strokes <= hole.par - 1) {
        birdiesCount++;
        xpGained += 15; 
      } else if (strokes === hole.par) {
        parCount++;
        xpGained += 5; 
      } else {
        xpGained += 2;
      }

      if (data.discId && (strokes <= hole.par - 1)) {
        const disc = discs.find(d => d.id === data.discId);
        if (disc) taggedDiscsUsed.push(`${disc.brand} ${disc.model}`);
      }
    });

    const allPlayersResults = [
      {
        id: 'me',
        name: `${user.name} (Deg)`,
        score: myTotalStrokes,
        diff: myTotalStrokes - totalPar,
        avatar: user.avatar,
        isFriend: true
      }
    ];

    activeRound.coPlayers.forEach(friend => {
      let friendStrokes = 0;
      Object.values(activeRound.scores[friend.id]).forEach(data => {
        friendStrokes += data.strokes;
      });
      allPlayersResults.push({
        id: friend.id,
        name: friend.name,
        score: friendStrokes,
        diff: friendStrokes - totalPar,
        avatar: friend.avatar,
        isFriend: true
      });
    });

    const minScore = Math.min(...allPlayersResults.map(p => p.score));
    allPlayersResults.forEach(p => {
      p.winner = p.score === minScore;
    });

    const updatedFriends = friends.map(f => {
      const coP = activeRound.coPlayers.find(p => p.id === f.id);
      if (!coP) return f;

      const myScore = myTotalStrokes;
      let friendStrokes = 0;
      Object.values(activeRound.scores[f.id]).forEach(data => {
        friendStrokes += data.strokes;
      });

      const wins = myScore < friendStrokes ? f.headToHead.wins + 1 : f.headToHead.wins;
      const losses = myScore > friendStrokes ? f.headToHead.losses + 1 : f.headToHead.losses;
      const ties = myScore === friendStrokes ? f.headToHead.ties + 1 : f.headToHead.ties;

      return {
        ...f,
        roundsTogether: f.roundsTogether + 1,
        roundsCount: f.roundsCount + 1,
        xp: f.xp + 45,
        headToHead: { wins, losses, ties }
      };
    });

    setFriends(updatedFriends);

    let earnedBadge = null;
    let earnedBadgeId = null;

    if (weather.condition === 'Regn' || weather.rainMm > 0) {
      earnedBadgeId = 'rain_warrior';
      earnedBadge = 'Regnkriger 🌧️';
    } else if (weather.windSpeed >= 8) {
      earnedBadgeId = 'storm_master';
      earnedBadge = 'Stormmester 💨';
    } else {
      earnedBadgeId = 'sun_seeker';
      earnedBadge = 'Solskinnskaster ☀️';
    }

    let newBadges = [...user.badges];
    if (earnedBadgeId && !user.badges.includes(earnedBadgeId)) {
      newBadges.push(earnedBadgeId);
      addXP(30, `Låst opp nytt væremblem: ${earnedBadge}!`);
    }

    if (parCount >= 5) setQuests(prev => prev.map(q => q.id === 'q1' ? { ...q, completed: true } : q));
    if (birdiesCount >= 1) setQuests(prev => prev.map(q => q.id === 'q3' ? { ...q, completed: true } : q));
    if (activeRound.coPlayers.length >= 1) setQuests(prev => prev.map(q => q.id === 'q4' ? { ...q, completed: true } : q));
    setQuests(prev => prev.map(q => q.id === 'q2' ? { ...q, completed: true } : q));

    const diff = myTotalStrokes - totalPar;
    const today = new Date().toLocaleDateString('no-NO', { day: 'numeric', month: 'short', year: 'numeric' });

    const historyItem = {
      id: 'h_' + Date.now(),
      date: today,
      courseName: activeRound.course.name,
      totalStrokes: myTotalStrokes,
      par: totalPar,
      diff,
      xpGained,
      birdies: birdiesCount,
      weatherConditions: `${weather.condition} (${weather.temp}°C, ${weather.windSpeed}m/s)`,
      badgeEarned: earnedBadge,
      taggedDiscs: [...new Set(taggedDiscsUsed)],
      coPlayers: activeRound.coPlayers.map(p => p.name)
    };

    const feedItem = {
      id: 'feed_' + Date.now(),
      date: today,
      courseName: activeRound.course.name,
      weather: `${weather.condition} & ${weather.windSpeed}m/s`,
      players: allPlayersResults
    };

    setActivityFeed([feedItem, ...activityFeed]);
    setRoundHistory([historyItem, ...roundHistory]);
    setUser(prev => ({
      ...prev,
      badges: newBadges,
      status: earnedBadge || prev.status,
      roundsPlayed: prev.roundsPlayed + 1,
      totalBirdies: prev.totalBirdies + birdiesCount,
      totalAces: prev.totalAces + acesCount
    }));

    addXP(xpGained, activeRound.coPlayers.length > 0 ? `Fullført co-op runde med ${activeRound.coPlayers.length} venner!` : `Fullført runde`);

    setLastSummaryData({ ...historyItem, allPlayersResults });
    setActiveRound(null);
    setSelectedCoPlayers([]);
    setShowSummary(true);
  };

  const claimQuestReward = (quest) => {
    if (quest.claimed || !quest.completed) return;
    addXP(quest.xpReward, `Ukentlig oppgave: ${quest.title}`);
    setQuests(prev => prev.map(q => q.id === quest.id ? { ...q, claimed: true } : q));
  };

  const handleAddDisc = (e) => {
    e.preventDefault();
    if (!newDisc.brand || !newDisc.model) return;
    const created = {
      ...newDisc,
      id: 'disc_' + Date.now(),
      color: ['bg-emerald-500', 'bg-cyan-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500'][Math.floor(Math.random() * 5)]
    };
    setDiscs([...discs, created]);
    setNewDisc({ brand: '', model: '', type: 'Distance Driver', speed: 9, glide: 5, turn: -1, fade: 2 });
    setShowAddDisc(false);
    addXP(15, 'Ny disk i bagen');
  };

  const quickAddPlayer = (player) => {
    if (friends.some(f => f.name === player.name || f.code === player.code)) return;

    const createdFriend = {
      id: 'f_' + Date.now(),
      name: player.name,
      code: player.code || 'USER-' + Math.floor(1000 + Math.random() * 9000),
      level: 3,
      levelTitle: 'Chain Rattle ⚙️',
      xp: 210,
      avatar: player.avatar || '🥏',
      roundsCount: 5,
      birdies: 4,
      aces: 0,
      status: 'Spilt nylig ⚡',
      badges: ['rain_warrior'],
      favDisc: 'Innova Destroyer',
      headToHead: { wins: 0, losses: 0, ties: 0 },
      roundsTogether: 1,
      bestScore: { course: 'Flaktveit Discgolfpark', score: +3 }
    };

    setFriends([...friends, createdFriend]);
    showNotification(`Hurtig-la til ${player.name} som venn! 🎉`);
  };

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (!friendInput.trim()) return;
    const createdFriend = {
      id: 'f_' + Date.now(),
      name: friendInput,
      code: 'USER-' + Math.floor(1000 + Math.random() * 9000),
      level: 1,
      levelTitle: MEME_LEVELS[0].title,
      xp: 50,
      avatar: '🥏',
      roundsCount: 1,
      birdies: 0,
      aces: 0,
      status: 'Nybegynner 🌿',
      badges: ['sun_seeker'],
      favDisc: 'Ukjent',
      headToHead: { wins: 0, losses: 0, ties: 0 },
      roundsTogether: 0,
      bestScore: { course: 'Smøråsfjellet Frisbeegolfbane', score: +5 }
    };
    setFriends([...friends, createdFriend]);
    setFriendInput('');
    setShowAddFriend(false);
    showNotification(`Lagt til ${friendInput} som venn!`);
  };

  const copyFriendCode = () => {
    navigator.clipboard?.writeText(user.friendCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const userLevel = getCurrentLevel(user.xp);
  const nextLevel = getNextLevel(user.xp);
  const xpProgress = nextLevel 
    ? Math.min(100, Math.round(((user.xp - (userLevel.minXp - 50)) / (nextLevel.minXp - userLevel.minXp)) * 100))
    : 100;

  const sortedLeaderboard = [
    { 
      id: 'me', 
      name: `${user.name} (Deg)`, 
      code: user.friendCode, 
      level: userLevel.level, 
      levelTitle: userLevel.title, 
      xp: user.xp, 
      avatar: user.avatar, 
      isUser: true,
      roundsCount: user.roundsPlayed,
      birdies: user.totalBirdies,
      aces: user.totalAces,
      status: user.status,
      badges: user.badges,
      favDisc: discs[0] ? `${discs[0].brand} ${discs[0].model}` : 'Kastaplast Berg'
    },
    ...friends
  ].sort((a, b) => b.xp - a.xp);

  const suggestedFriends = [];
  activityFeed.forEach(feed => {
    feed.players.forEach(p => {
      if (!p.isFriend && p.id !== 'me' && !suggestedFriends.some(sf => sf.name === p.name)) {
        suggestedFriends.push(p);
      }
    });
  });

  const advice = getWeatherAdvice();

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950 font-sans text-slate-100 p-0 sm:p-4">
      
      {toast && (
        <div className="fixed top-5 z-50 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-300">
          <Sparkles className="w-5 h-5 fill-slate-950" />
          <span>{toast}</span>
        </div>
      )}

      <div className="w-full max-w-md h-[100vh] sm:h-[880px] bg-slate-900 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-800 relative">
        
        {/* OPPPDATERT NYTT MEME-BANNER UTEN UDISC / YR */}
        <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 p-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <FancyDiscLogo />
            <div>
              <h1 className="font-black text-base tracking-wider bg-gradient-to-r from-emerald-400 via-cyan-300 to-amber-300 bg-clip-text text-transparent flex items-center gap-1">
                DISC GOLF RPG
              </h1>
              <p className="text-[10px] text-amber-400/90 font-extrabold flex items-center gap-1">
                <span>Tree Magnet Edition</span> 🌲✨
              </p>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-800/90 hover:from-slate-700/80 px-3 py-1.5 rounded-2xl transition border border-emerald-500/30 shadow-inner"
          >
            <span className="text-sm">{userLevel.icon}</span>
            <div className="text-right">
              <p className="text-xs font-black text-emerald-400">Lvl {userLevel.level}</p>
              <p className="text-[10px] text-slate-400 font-mono">{user.xp} XP</p>
            </div>
          </button>
        </header>

        {/* SCROLLABLE MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">

          {/* LIVE WEATHER BANNER */}
          <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 rounded-2xl p-3.5 shadow-lg space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {weather.condition === 'Regn' ? <CloudRain className="w-5 h-5 text-cyan-400 animate-pulse" /> : <Wind className="w-5 h-5 text-cyan-300" />}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-100">{weather.locationName}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {weather.condition} • {weather.temp}°C • Vind: <strong className="text-cyan-300">{weather.windSpeed} m/s ({weather.windDir})</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowWeatherTips(!showWeatherTips)}
                className="bg-blue-600/30 hover:bg-blue-600/50 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition flex items-center gap-1"
              >
                <Info className="w-3.5 h-3.5" /> Tips
              </button>
            </div>

            {showWeatherTips && (
              <div className="bg-slate-950/90 p-3 rounded-xl border border-blue-500/40 text-xs space-y-2 animate-fade-in mt-2">
                <h4 className="font-extrabold text-cyan-300 flex items-center gap-1.5">
                  {advice.title}
                </h4>
                <ul className="space-y-1 text-[11px] text-slate-300 pl-1">
                  {advice.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* SCORECARD / TAB ROUTING */}
          {activeRound ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                <button 
                  onClick={() => { if (confirm('Vil du avbryte runden?')) setActiveRound(null); }}
                  className="text-xs text-rose-400 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Avbryt
                </button>
                <div className="text-center">
                  <span className="text-xs font-bold text-slate-200 block truncate max-w-[140px]">
                    {activeRound.course.name}
                  </span>
                  {activeRound.coPlayers.length > 0 && (
                    <span className="text-[10px] text-cyan-400 font-semibold">
                      👥 Med: {activeRound.coPlayers.map(p => p.name.split(' ')[0]).join(', ')}
                    </span>
                  )}
                </div>
                <button 
                  onClick={finishRound}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg shadow-md transition flex items-center gap-1"
                >
                  Fullfør <CheckCircle className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Hole Picker */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {activeRound.course.holes.map((h, idx) => {
                  const myScore = activeRound.scores['me'][h.number].strokes;
                  const isCurrent = idx === activeRound.currentHoleIndex;
                  const diff = myScore - h.par;
                  let badgeColor = 'bg-slate-800 text-slate-400';
                  if (diff < 0) badgeColor = 'bg-emerald-500 text-slate-950 font-bold';
                  if (diff > 0) badgeColor = 'bg-rose-500/20 text-rose-300';

                  return (
                    <button
                      key={h.number}
                      onClick={() => setActiveRound({ ...activeRound, currentHoleIndex: idx })}
                      className={`flex-shrink-0 w-11 h-14 rounded-xl border flex flex-col items-center justify-center transition ${
                        isCurrent 
                          ? 'border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-500/30' 
                          : 'border-slate-800 bg-slate-800/50'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400">H{h.number}</span>
                      <span className={`text-xs px-1 py-0.5 rounded mt-1 ${badgeColor}`}>
                        {myScore}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Current Hole Details */}
              {(() => {
                const currentHole = activeRound.course.holes[activeRound.currentHoleIndex];

                return (
                  <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-4 shadow-xl">
                    <div className="flex justify-between items-start border-b border-slate-700 pb-3">
                      <div>
                        <span className="bg-emerald-500/20 text-emerald-400 font-black text-xs px-2.5 py-1 rounded-lg">
                          Hull {currentHole.number} av {activeRound.course.holes.length}
                        </span>
                        <p className="text-xs text-slate-300 mt-2 italic">"{currentHole.description}"</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-slate-100">{currentHole.distance}m</p>
                        <p className="text-xs font-bold text-slate-400">Par {currentHole.par}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* USER SCORE */}
                      {(() => {
                        const scoreData = activeRound.scores['me'][currentHole.number];
                        const diff = scoreData.strokes - currentHole.par;
                        let term = 'Par';
                        let termBg = 'bg-slate-700 text-slate-200';
                        if (scoreData.strokes === 1) { term = 'ACE! 🎉'; termBg = 'bg-purple-500 text-white font-black'; }
                        else if (diff === -1) { term = 'Birdie 🐤'; termBg = 'bg-emerald-500 text-slate-950 font-bold'; }
                        else if (diff === 1) { term = 'Bogey'; termBg = 'bg-amber-500/20 text-amber-300'; }

                        return (
                          <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-500/40 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{user.avatar}</span>
                              <div>
                                <p className="text-xs font-extrabold text-emerald-300">{user.name} (Deg)</p>
                                <span className={`text-[9px] px-2 py-0.2 rounded-full inline-block mt-0.5 ${termBg}`}>
                                  {term}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => updateHoleScore('me', currentHole.number, -1)}
                                className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 text-lg font-bold text-emerald-400 active:scale-95"
                              >
                                -
                              </button>
                              <span className="text-xl font-black text-white w-6 text-center">{scoreData.strokes}</span>
                              <button 
                                onClick={() => updateHoleScore('me', currentHole.number, 1)}
                                className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 text-lg font-bold text-rose-400 active:scale-95"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* CO-PLAYERS */}
                      {activeRound.coPlayers.map(friend => {
                        const scoreData = activeRound.scores[friend.id][currentHole.number];
                        const diff = scoreData.strokes - currentHole.par;

                        return (
                          <div key={friend.id} className="bg-slate-900/60 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{friend.avatar}</span>
                              <div>
                                <p className="text-xs font-extrabold text-slate-200">{friend.name}</p>
                                <p className="text-[10px] text-slate-400">
                                  {diff > 0 ? `+${diff}` : diff === 0 ? 'Par' : `${diff}`}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => updateHoleScore(friend.id, currentHole.number, -1)}
                                className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-base font-bold text-emerald-400 active:scale-95"
                              >
                                -
                              </button>
                              <span className="text-lg font-bold text-white w-5 text-center">{scoreData.strokes}</span>
                              <button 
                                onClick={() => updateHoleScore(friend.id, currentHole.number, 1)}
                                className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-base font-bold text-rose-400 active:scale-95"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        disabled={activeRound.currentHoleIndex === 0}
                        onClick={() => setActiveRound({ ...activeRound, currentHoleIndex: activeRound.currentHoleIndex - 1 })}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" /> Forrige
                      </button>
                      <button
                        disabled={activeRound.currentHoleIndex === activeRound.course.holes.length - 1}
                        onClick={() => setActiveRound({ ...activeRound, currentHoleIndex: activeRound.currentHoleIndex + 1 })}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1 shadow-md"
                      >
                        Neste <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })()}
            </div>
          ) : showSummary && lastSummaryData ? (
            /* SUMMARY CARD */
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-5 text-center animate-fade-in shadow-2xl">
              <div className="inline-flex p-3 bg-gradient-to-tr from-emerald-400 to-cyan-400 rounded-full text-slate-950 shadow-lg">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-black text-white">Runde Lagret & Delt!</h2>
                <p className="text-xs text-slate-400 mt-1">{lastSummaryData.courseName}</p>
                <p className="text-[10px] text-emerald-400 mt-0.5">Delt til venner og aktivitetsfeed ⚡</p>
              </div>

              <div className="space-y-2 text-left bg-slate-900 p-3 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-400 font-bold uppercase border-b border-slate-800 pb-1">RESULTATER</p>
                {lastSummaryData.allPlayersResults.map((p) => (
                  <div key={p.id} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5">
                      <span>{p.avatar}</span>
                      <span className={`font-bold ${p.winner ? 'text-amber-300' : 'text-slate-300'}`}>
                        {p.name} {p.winner && '👑 (Vinner)'}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-200">
                      {p.score} ({p.diff > 0 ? `+${p.diff}` : p.diff})
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowSummary(false)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg transition"
              >
                Gå til Hovedmeny
              </button>
            </div>
          ) : activeTab === 'play' ? (
            /* PLAY TAB */
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-800 via-slate-800/90 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg">
                <div className="space-y-1">
                  <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">Aktiv Spiller</span>
                  <h3 className="text-base font-black text-white flex items-center gap-1.5">
                    {user.name} <span className="text-xs font-normal text-slate-400">({user.friendCode})</span>
                  </h3>
                  <p className="text-xs text-emerald-300 font-semibold">{userLevel.title}</p>
                  <span className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full inline-block font-bold">
                    Status: {user.status}
                  </span>
                </div>
                <div className="text-center">
                  <div className="text-3xl">{userLevel.icon}</div>
                  <span className="text-[10px] text-yellow-400 font-extrabold bg-yellow-950/50 px-2 py-0.5 rounded border border-yellow-500/30 inline-block mt-1">
                    Level {userLevel.level}
                  </span>
                </div>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3 shadow-md">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <UsersRound className="w-4 h-4 text-emerald-400" /> Velg Medspillere for Neste Runde
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">({selectedCoPlayers.length} valgt)</span>
                </div>

                {friends.length === 0 ? (
                  <p className="text-xs text-slate-500">Ingen venner lagt til enda.</p>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {friends.map(friend => {
                      const isSelected = selectedCoPlayers.some(p => p.id === friend.id);
                      return (
                        <button
                          key={friend.id}
                          onClick={() => toggleCoPlayer(friend)}
                          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                            isSelected 
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/30' 
                              : 'bg-slate-900 border-slate-700 text-slate-400'
                          }`}
                        >
                          <span>{friend.avatar}</span>
                          <span>{friend.name.split(' ')[0]}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('courses')}
                  className="bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 p-4 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-2 shadow-lg transition active:scale-95"
                >
                  <Play className="w-6 h-6 fill-slate-950" />
                  <span>START RUNDE NÅ</span>
                </button>

                <button
                  onClick={() => setActiveTab('feed')}
                  className="bg-slate-800 hover:bg-slate-700/80 border border-slate-700 p-4 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-2 transition"
                >
                  <Activity className="w-6 h-6 text-cyan-400" />
                  <span className="text-slate-200">VENNERS RUNDER</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'feed' ? (
            /* FEED TAB */
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" /> Aktivitetsfeed & Felles Runder
                </h2>
                <p className="text-xs text-slate-400">Se ferske runder fra deg og dine venner</p>
              </div>

              {suggestedFriends.length > 0 && (
                <div className="bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/30 rounded-2xl p-3.5 space-y-2">
                  <h3 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-purple-400" /> Folk dine venner har spilt med
                  </h3>

                  <div className="space-y-2">
                    {suggestedFriends.map(player => (
                      <div key={player.id} className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{player.avatar}</span>
                          <div>
                            <p className="font-extrabold text-white">{player.name}</p>
                            <p className="text-[9px] text-slate-400">Spilte sammen med {player.friendOf || 'venn'}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => quickAddPlayer(player)}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition shadow"
                        >
                          <Plus className="w-3 h-3" /> Hurtig-Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {activityFeed.map(feed => (
                  <div key={feed.id} className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3 shadow-md">
                    <div className="flex justify-between items-start border-b border-slate-700/80 pb-2">
                      <div>
                        <h3 className="font-extrabold text-xs text-white">{feed.courseName}</h3>
                        <p className="text-[10px] text-slate-400">{feed.date} • {feed.weather}</p>
                      </div>
                      <span className="text-[9px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded font-mono border border-cyan-500/30">
                        {feed.players.length} Spillere
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {feed.players.map(p => (
                        <div key={p.id} className="flex justify-between items-center text-xs bg-slate-900/60 p-2 rounded-xl">
                          <div className="flex items-center gap-2">
                            <span>{p.avatar}</span>
                            <span className={`font-bold ${p.winner ? 'text-amber-300' : 'text-slate-200'}`}>
                              {p.name} {p.winner && '👑'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-300">
                              {p.score} ({p.diff > 0 ? `+${p.diff}` : p.diff})
                            </span>

                            {!p.isFriend && p.id !== 'me' && (
                              <button
                                onClick={() => quickAddPlayer(p)}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 transition shadow"
                              >
                                <Plus className="w-3 h-3" /> Legg til
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'courses' ? (
            /* COURSES TAB */
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" /> Norske Baner & Kart
                </h2>
                <p className="text-xs text-slate-400">Finn baner med direkte Google Maps-lenker</p>
              </div>

              <div className="space-y-3">
                {COURSES.map(course => (
                  <div key={course.id} className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3 shadow-md">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl bg-slate-900 p-2 rounded-xl border border-slate-700">
                          {course.image}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-white">{course.name}</h3>
                          <p className="text-xs text-slate-400">{course.location}</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-slate-900 text-slate-300 px-2 py-1 rounded font-bold border border-slate-700">
                        {course.difficulty}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl text-xs text-slate-300">
                      <span>⛳ {course.holesCount} Hull</span>
                      <span>🎯 Par {course.par}</span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${course.mapsQuery}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 underline text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" /> Kart
                      </a>
                    </div>

                    <button
                      onClick={() => startNewRound(course)}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-2.5 rounded-xl transition shadow flex items-center justify-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" /> Start Runde på Denne Banen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'quests' ? (
            /* QUESTS TAB */
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" /> Ukentlige Oppgaver
                </h2>
                <p className="text-xs text-slate-400">Gjennomfør utfordringer for bonus XP</p>
              </div>

              <div className="space-y-3">
                {quests.map(quest => (
                  <div key={quest.id} className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-2 shadow-md">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{quest.icon}</span>
                        <div>
                          <h3 className={`text-xs font-bold ${quest.claimed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                            {quest.title}
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">{quest.desc}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-yellow-400 bg-yellow-950/50 px-2 py-0.5 rounded border border-yellow-500/20">
                        +{quest.xpReward} XP
                      </span>
                    </div>

                    <div className="pt-2 flex justify-end">
                      {quest.claimed ? (
                        <span className="text-xs text-emerald-400 font-extrabold flex items-center gap-1">
                          <Check className="w-4 h-4" /> Belønning Hentet
                        </span>
                      ) : quest.completed ? (
                        <button
                          onClick={() => claimQuestReward(quest)}
                          className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition shadow animate-pulse"
                        >
                          HENT BELØNNING (+{quest.xpReward} XP)
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setQuests(prev => prev.map(q => q.id === quest.id ? { ...q, completed: true } : q));
                          }}
                          className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold text-[11px] px-3 py-1.5 rounded-lg transition"
                        >
                          Marker som Utført
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'leaderboard' ? (
            /* LEADERBOARD TAB */
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-emerald-400" /> Leaderboard & Venner
                  </h2>
                  <p className="text-xs text-slate-400">Klikk for Head-to-Head statistikk!</p>
                </div>
                <button
                  onClick={() => setShowAddFriend(!showAddFriend)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl transition shadow flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Legg til
                </button>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">DIN VENNEKODE</p>
                  <p className="text-xs font-black text-emerald-400">{user.friendCode}</p>
                </div>
                <button
                  onClick={copyFriendCode}
                  className="bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                >
                  {codeCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{codeCopied ? 'Kopiert!' : 'Kopier'}</span>
                </button>
              </div>

              {showAddFriend && (
                <form onSubmit={handleAddFriend} className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-2">
                  <label className="text-xs font-semibold text-slate-200">Legg til med brukernavn eller kode</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="f.eks. JONAS-9921"
                      value={friendInput}
                      onChange={(e) => setFriendInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                    <button type="submit" className="bg-emerald-500 text-slate-950 font-bold text-xs px-3 py-2 rounded-lg">
                      Legg til
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {sortedLeaderboard.map((item, idx) => {
                  const rank = idx + 1;
                  let rankIcon = <span className="text-xs font-bold text-slate-500 w-5 text-center">#{rank}</span>;
                  if (rank === 1) rankIcon = <span className="text-base">🥇</span>;
                  if (rank === 2) rankIcon = <span className="text-base">🥈</span>;
                  if (rank === 3) rankIcon = <span className="text-base">🥉</span>;

                  return (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedPlayer(item)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:border-emerald-400 transition ${
                        item.isUser 
                          ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md' 
                          : 'bg-slate-800/80 border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {rankIcon}
                        <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-lg">
                          {item.avatar}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${item.isUser ? 'text-emerald-300' : 'text-slate-100'}`}>
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{item.levelTitle}</p>
                          {item.headToHead && (
                            <span className="text-[9px] text-yellow-400 font-semibold flex items-center gap-1">
                              <Swords className="w-3 h-3" /> H2H: {item.headToHead.wins}W - {item.headToHead.losses}L
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <div>
                          <span className="text-xs font-black text-yellow-400 bg-yellow-950/40 px-2 py-0.5 rounded border border-yellow-500/20 inline-block">
                            {item.xp} XP
                          </span>
                          <p className="text-[9px] text-slate-400 font-bold mt-0.5">Lvl {item.level}</p>
                        </div>
                        <Eye className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activeTab === 'bag' ? (
            /* BAG TAB */
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <Disc className="w-4 h-4 text-emerald-400" /> Min Disc Bag ({discs.length})
                  </h2>
                  <p className="text-xs text-slate-400">Dine registrerte disker</p>
                </div>
                <button
                  onClick={() => setShowAddDisc(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl transition shadow flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Legg til
                </button>
              </div>

              {showAddDisc && (
                <form onSubmit={handleAddDisc} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-3 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                    <h3 className="text-xs font-bold text-white">Ny Disk i Bagen</h3>
                    <button type="button" onClick={() => setShowAddDisc(false)} className="text-slate-400 text-xs">✕</button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      required 
                      type="text" 
                      placeholder="Merke (Innova osv.)" 
                      value={newDisc.brand}
                      onChange={(e) => setNewDisc({ ...newDisc, brand: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                    <input 
                      required 
                      type="text" 
                      placeholder="Modell (Buzzz osv.)" 
                      value={newDisc.model}
                      onChange={(e) => setNewDisc({ ...newDisc, model: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <select
                    value={newDisc.type}
                    onChange={(e) => setNewDisc({ ...newDisc, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="Distance Driver">Distance Driver</option>
                    <option value="Fairway Driver">Fairway Driver</option>
                    <option value="Midrange">Midrange</option>
                    <option value="Putter">Putter</option>
                  </select>

                  <button type="submit" className="w-full bg-emerald-500 text-slate-950 font-black text-xs py-2.5 rounded-xl">
                    Lagre Disk
                  </button>
                </form>
              )}

              <div className="space-y-2.5">
                {discs.map(disc => (
                  <div key={disc.id} className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3.5 flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${disc.color} flex items-center justify-center text-slate-950 font-bold text-xs shadow`}>
                        🥏
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xs text-slate-100">{disc.brand} {disc.model}</h3>
                        <p className="text-[10px] text-emerald-400 font-semibold">{disc.type}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5 text-[10px] bg-slate-900 px-2 py-1 rounded border border-slate-700 font-mono text-slate-300">
                        <span>{disc.speed}</span>/<span>{disc.glide}</span>/<span>{disc.turn}</span>/<span>{disc.fade}</span>
                      </div>
                      <button 
                        onClick={() => setDiscs(discs.filter(d => d.id !== disc.id))}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'history' ? (
            /* HISTORY TAB */
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-400" /> Spillehistorikk Over Tid
                </h2>
                <p className="text-xs text-slate-400">Oversikt over alle spilte runder og medspillere</p>
              </div>

              <div className="space-y-3">
                {roundHistory.map(item => (
                  <div key={item.id} className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-2 shadow-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-extrabold text-xs text-white">{item.courseName}</h3>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {item.date}
                        </p>
                      </div>
                      <span className={`text-xs font-black px-2 py-0.5 rounded ${
                        item.diff <= 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      }`}>
                        {item.diff > 0 ? `+${item.diff}` : item.diff === 0 ? 'E' : item.diff}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs bg-slate-900/60 p-2 rounded-xl text-slate-300">
                      <span>Kast: <strong>{item.totalStrokes}</strong> (Par {item.par})</span>
                      <span>Birdies: <strong className="text-emerald-400">{item.birdies}</strong></span>
                      <span className="text-yellow-400 font-bold">+{item.xpGained} XP</span>
                    </div>

                    {item.coPlayers && item.coPlayers.length > 0 && (
                      <p className="text-[10px] text-cyan-300 font-semibold">
                        👥 Spilt sammen med: {item.coPlayers.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* PROFILE TAB */
            <div className="space-y-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 text-center space-y-3 shadow-xl">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center text-3xl shadow-lg border border-slate-600">
                  {user.avatar}
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">{user.name}</h2>
                  <p className="text-xs font-bold text-emerald-400">{userLevel.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 italic">"{userLevel.desc}"</p>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-left space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">Level {userLevel.level} Framgang</span>
                    <span className="text-yellow-400">{user.xp} XP</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-cyan-400" /> Dine Væremblemer
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {WEATHER_BADGES.map(badge => {
                    const hasBadge = user.badges.includes(badge.id);
                    return (
                      <div 
                        key={badge.id}
                        className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                          hasBadge ? badge.bg : 'bg-slate-900/40 border-slate-800 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>{badge.icon}</span>
                          <span>{badge.name}</span>
                        </div>
                        <p className="text-[9px] opacity-80">{badge.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </main>

        {/* PLAYER PROFILE MODAL */}
        {selectedPlayer && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 p-4 flex items-center justify-center animate-fade-in">
            <div className="bg-slate-800 border border-slate-700 w-full rounded-2xl p-5 space-y-4 shadow-2xl relative">
              <button 
                onClick={() => setSelectedPlayer(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center text-3xl shadow-lg">
                  {selectedPlayer.avatar}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{selectedPlayer.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">Kode: {selectedPlayer.code}</p>
                  <p className="text-xs font-bold text-emerald-400 mt-1">{selectedPlayer.levelTitle}</p>
                </div>
              </div>

              {selectedPlayer.headToHead && (
                <div className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/50 p-3 rounded-xl border border-amber-500/30 text-center space-y-1">
                  <p className="text-[10px] text-amber-400 font-black uppercase flex items-center justify-center gap-1">
                    <Swords className="w-3.5 h-3.5" /> HODE-TIL-HODE STATISTIKK (H2H)
                  </p>
                  <div className="flex justify-center gap-6 text-sm font-black pt-1">
                    <span className="text-emerald-400">{selectedPlayer.headToHead.wins} Seire</span>
                    <span className="text-slate-400">-</span>
                    <span className="text-rose-400">{selectedPlayer.headToHead.losses} Tap</span>
                    <span className="text-slate-400">-</span>
                    <span className="text-amber-300">{selectedPlayer.headToHead.ties} Uavgjort</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Runder spilt sammen: {selectedPlayer.roundsTogether}</p>
                </div>
              )}

              {selectedPlayer.bestScore && (
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700 text-xs flex justify-between items-center">
                  <span className="text-slate-400">Beste pers ({selectedPlayer.bestScore.course}):</span>
                  <span className="font-extrabold text-emerald-400">
                    {selectedPlayer.bestScore.score > 0 ? `+${selectedPlayer.bestScore.score}` : selectedPlayer.bestScore.score}
                  </span>
                </div>
              )}

              <button
                onClick={() => setSelectedPlayer(null)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs py-2.5 rounded-xl transition"
              >
                Lukk Profil
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION */}
        <nav className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 absolute bottom-0 left-0 right-0 flex justify-around p-2 z-20">
          <button 
            onClick={() => setActiveTab('play')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
              activeTab === 'play' ? 'text-emerald-400 font-bold bg-slate-800' : 'text-slate-400'
            }`}
          >
            <Play className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">Spill</span>
          </button>

          <button 
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
              activeTab === 'feed' ? 'text-emerald-400 font-bold bg-slate-800' : 'text-slate-400'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">Feed</span>
          </button>

          <button 
            onClick={() => setActiveTab('courses')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
              activeTab === 'courses' ? 'text-emerald-400 font-bold bg-slate-800' : 'text-slate-400'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">Kart</span>
          </button>

          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
              activeTab === 'leaderboard' ? 'text-emerald-400 font-bold bg-slate-800' : 'text-slate-400'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">Ranking</span>
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
              activeTab === 'history' ? 'text-emerald-400 font-bold bg-slate-800' : 'text-slate-400'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">Historikk</span>
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
              activeTab === 'profile' ? 'text-emerald-400 font-bold bg-slate-800' : 'text-slate-400'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-[9px] mt-0.5">Profil</span>
          </button>
        </nav>

      </div>
    </div>
  );
}