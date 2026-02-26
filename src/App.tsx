import React, { useState, useEffect, useRef } from 'react';
import { Settings, Play, Trophy, ShoppingCart, LogOut } from 'lucide-react';

type Screen = 'menu' | 'game' | 'settings' | 'achievements' | 'shop';

let globalIdCounter = 0;
const generateId = () => {
  globalIdCounter += 1;
  return `${Date.now()}-${globalIdCounter}-${Math.random().toString(36).substr(2, 9)}`;
};

type PlantType = 'peashooter' | 'sunflower' | 'wallnut' | 'ultimate' | 'reaper';
type ZombieType = 'normal' | 'conehead' | 'buckethead' | 'fast';

const PLANT_DATA = {
  peashooter: { cost: 100, hp: 6, name: '豌豆射手' },
  sunflower: { cost: 50, hp: 6, name: '向日葵' },
  wallnut: { cost: 50, hp: 72, name: '坚果墙' },
  ultimate: { cost: 1000, hp: 999, name: '毁灭神' },
  reaper: { cost: 500, hp: 10, name: '死神' }
};

const ZOMBIE_DATA = {
  normal: { hp: 5, speed: 1.2, filter: 'brightness(1)', scale: 1 },
  conehead: { hp: 14, speed: 1.0, filter: 'brightness(1)', scale: 1 },
  buckethead: { hp: 28, speed: 0.8, filter: 'brightness(1)', scale: 1 },
  fast: { hp: 4, speed: 2.5, filter: 'saturate(1.5)', scale: 0.85 }
};

const LEVELS = Array.from({ length: 30 }).map((_, i) => {
  const level = i + 1;
  // Increase zombie counts to make the 1-second spawn rate meaningful
  const normalCount = 5 + level * 4;
  const coneheadCount = level >= 2 ? level * 3 : 0;
  const bucketheadCount = level >= 3 ? level * 2 : 0;
  const fastCount = level >= 2 ? level * 2 : 0;
  
  const zombies: ZombieType[] = [];
  for(let j=0; j<normalCount; j++) zombies.push('normal');
  for(let j=0; j<coneheadCount; j++) zombies.push('conehead');
  for(let j=0; j<bucketheadCount; j++) zombies.push('buckethead');
  for(let j=0; j<fastCount; j++) zombies.push('fast');
  
  zombies.sort(() => Math.random() - 0.5);

  return {
    level,
    zombies,
    // Level 1: 4 seconds. Level 2+: 1 second (Super Hard Mode)
    spawnRate: level >= 2 ? 1000 : 4000
  };
});

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [coins, setCoins] = useState(0);
  const [hasUltimate, setHasUltimate] = useState(false);
  const [hasReaper, setHasReaper] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [redeemedReaper, setRedeemedReaper] = useState(false);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu': return <MainMenu onNavigate={setCurrentScreen} />;
      case 'game': return <GameScreen onNavigate={setCurrentScreen} hasUltimate={hasUltimate} hasReaper={hasReaper} />;
      case 'settings': return <SettingsScreen onNavigate={setCurrentScreen} coins={coins} setCoins={setCoins} redeemed={redeemed} setRedeemed={setRedeemed} redeemedReaper={redeemedReaper} setRedeemedReaper={setRedeemedReaper} />;
      case 'achievements': return <AchievementsScreen onNavigate={setCurrentScreen} />;
      case 'shop': return <ShopScreen onNavigate={setCurrentScreen} coins={coins} setCoins={setCoins} hasUltimate={hasUltimate} setHasUltimate={setHasUltimate} hasReaper={hasReaper} setHasReaper={setHasReaper} />;
      default: return <MainMenu onNavigate={setCurrentScreen} />;
    }
  };

  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden bg-black text-white font-sans selection:bg-green-500/30 touch-none select-none">
      {renderScreen()}

      {/* Portrait Warning Overlay for Mobile */}
      {isPortrait && (
        <div className="fixed inset-0 z-[999] bg-stone-950 flex flex-col items-center justify-center text-white p-8 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <svg className="w-24 h-24 mb-6 text-amber-500 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h2 className="text-3xl font-black mb-4 text-amber-400">请旋转手机</h2>
            <p className="text-stone-300 text-lg">为了获得最佳游戏体验，<br/>请在横屏模式下进行游戏。</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MainMenu({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: 'url("https://raw.githubusercontent.com/gvgle/111/main/unnamedddddddddddddddd.webp")' }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      
      <div className="relative z-10 flex flex-col items-center gap-4 md:gap-6 p-6 md:p-8 bg-black/60 rounded-3xl border-4 border-green-800/50 shadow-[0_0_40px_rgba(34,197,94,0.3)] scale-90 md:scale-100">
        <h1 className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-300 to-green-700 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] mb-4 md:mb-8 tracking-wider text-center">
          伟大的柯立帆<br/><span className="text-xl md:text-3xl text-green-400">Web Edition</span>
        </h1>

        <div className="flex flex-col gap-3 md:gap-4 w-56 md:w-64">
          <MenuButton icon={<Play />} text="开始游戏" onClick={() => onNavigate('game')} primary />
          <MenuButton icon={<ShoppingCart />} text="商店" onClick={() => onNavigate('shop')} />
          <MenuButton icon={<Trophy />} text="成就" onClick={() => onNavigate('achievements')} />
          <MenuButton icon={<Settings />} text="设置" onClick={() => onNavigate('settings')} />
          <MenuButton icon={<LogOut />} text="退出" onClick={() => alert('网页版无法直接退出，请关闭标签页')} variant="danger" />
        </div>
      </div>
    </div>
  );
}

function MenuButton({ icon, text, onClick, primary, variant = 'default' }: { icon: React.ReactNode, text: string, onClick: () => void, primary?: boolean, variant?: 'default' | 'danger' }) {
  const baseClasses = "flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg border-b-4";
  
  let colorClasses = "bg-stone-700 hover:bg-stone-600 text-stone-100 border-stone-900";
  if (primary) {
    colorClasses = "bg-green-600 hover:bg-green-500 text-white border-green-800 shadow-green-900/50";
  } else if (variant === 'danger') {
    colorClasses = "bg-red-700 hover:bg-red-600 text-white border-red-900 shadow-red-900/50";
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${colorClasses}`}>
      {icon}
      <span>{text}</span>
    </button>
  );
}

function GameScreen({ onNavigate, hasUltimate, hasReaper }: { onNavigate: (screen: Screen) => void, hasUltimate: boolean, hasReaper: boolean }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [sun, setSun] = useState(50);
  const [selectedSeed, setSelectedSeed] = useState<PlantType | null>(null);
  const [plants, setPlants] = useState<{id: string, type: PlantType, row: number, col: number, hp: number, lastAction: number}[]>([]);
  const [suns, setSuns] = useState<{id: string, x: number, y: number}[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(false);
  const [playingReaperVideo, setPlayingReaperVideo] = useState(false);
  const [, setTick] = useState(0);
  
  const currentLevel = LEVELS[levelIndex];

  const gameState = useRef({
    bullets: [] as {id: string, row: number, x: number}[],
    zombies: [] as {id: string, type: ZombieType, row: number, x: number, hp: number, speed: number, lastAttack: number, isWeakened: boolean}[],
    zombiesToSpawn: [...currentLevel.zombies],
    lastSpawnTime: performance.now(),
    lastSkySunTime: performance.now(),
    isGameOver: false,
    reaperBuffActive: false
  });
  
  const plantsRef = useRef(plants);
  useEffect(() => { plantsRef.current = plants; }, [plants]);

  const playHitSound = () => {
    const audio = new Audio("https://raw.githubusercontent.com/gvgle/-/main/Destruction_Metal_Pole_L_Wave_2_0_0.wav");
    audio.volume = 0.6;
    audio.play().catch(() => {});
  };

  // Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const update = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;
      const state = gameState.current;

      if (state.isGameOver) return;

      // Move bullets
      for (let i = state.bullets.length - 1; i >= 0; i--) {
        const b = state.bullets[i];
        b.x += 40 * (deltaTime / 1000);
        if (b.x > 110) state.bullets.splice(i, 1);
      }

      // Move zombies and attack plants
      for (let i = state.zombies.length - 1; i >= 0; i--) {
        const z = state.zombies[i];
        
        // Check collision with plants
        const zombieCol = Math.floor((z.x - 26.5) / (70 / 9));
        const plantInFront = plantsRef.current.find(p => p.row === z.row && p.col === zombieCol);

        if (plantInFront) {
          // Attack plant
          if (time - z.lastAttack > 1000) {
            setPlants(prev => {
              const next = [...prev];
              const pIndex = next.findIndex(p => p.id === plantInFront.id);
              if (pIndex !== -1) {
                next[pIndex] = { ...next[pIndex], hp: next[pIndex].hp - 1 };
                if (next[pIndex].hp <= 0) {
                  // If reaper dies, trigger buff
                  if (next[pIndex].type === 'reaper') {
                    setPlayingReaperVideo(true);
                    gameState.current.reaperBuffActive = true;
                    // Apply visual weak effect to existing zombies
                    gameState.current.zombies.forEach(z => z.isWeakened = true);
                  }
                  next.splice(pIndex, 1);
                }
              }
              return next;
            });
            z.lastAttack = time;
          }
        } else {
          // Move
          z.x -= z.speed * (deltaTime / 1000);
          if (z.x < 15) {
            state.isGameOver = true;
            setGameOver(true);
            return;
          }
        }
      }

      // Bullet Collisions
      for (let i = state.bullets.length - 1; i >= 0; i--) {
        const b = state.bullets[i];
        const hitZombieIndex = state.zombies.findIndex(z => z.row === b.row && b.x >= z.x && b.x <= z.x + 8);
        
        if (hitZombieIndex !== -1) {
          playHitSound();
          state.bullets.splice(i, 1);
          state.zombies[hitZombieIndex].hp -= 1;
          if (state.zombies[hitZombieIndex].hp <= 0) {
            state.zombies.splice(hitZombieIndex, 1);
          }
        }
      }

      // Spawn Zombies
      if (time - state.lastSpawnTime > currentLevel.spawnRate && state.zombiesToSpawn.length > 0) {
        const type = state.zombiesToSpawn.pop()!;
        const row = Math.floor(Math.random() * 5);
        state.zombies.push({
          id: generateId(),
          type,
          row,
          x: 100,
          hp: ZOMBIE_DATA[type].hp,
          speed: ZOMBIE_DATA[type].speed,
          lastAttack: 0,
          isWeakened: state.reaperBuffActive
        });
        state.lastSpawnTime = time;
      }

      // Sky Sun
      if (time - state.lastSkySunTime > 8000) {
        setSuns(prev => [...prev, {
          id: generateId(),
          x: 30 + Math.random() * 60,
          y: 20 + Math.random() * 60
        }]);
        state.lastSkySunTime = time;
      }

      // Level Complete Check
      if (state.zombiesToSpawn.length === 0 && state.zombies.length === 0) {
        if (levelIndex < LEVELS.length - 1) {
          setLevelIndex(l => l + 1);
          gameState.current.zombiesToSpawn = [...LEVELS[levelIndex + 1].zombies];
        }
      }

      setTick(t => t + 1);
      animationFrameId = requestAnimationFrame(update);
    };
    
    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [levelIndex, currentLevel]);

  // Plant Actions (Shooting & Sun Generation) & Reaper Buff
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState.current.isGameOver) return;
      const time = performance.now();
      
      // Reaper Buff: Damage weakened zombies
      if (gameState.current.reaperBuffActive) {
        for (let i = gameState.current.zombies.length - 1; i >= 0; i--) {
          const z = gameState.current.zombies[i];
          if (z.isWeakened) {
            z.hp -= 0.5; // Damage every 2.5s
            if (z.hp <= 0) {
              gameState.current.zombies.splice(i, 1);
            }
          }
        }
      }

      // Peashooter shooting (slower: every 2500ms)
      const shooters = plantsRef.current.filter(p => p.type === 'peashooter');
      const newBullets = shooters.map(p => {
        const startX = 26.5 + (p.col * (70 / 9)) + 4; 
        return { id: generateId(), row: p.row, x: startX };
      });
      gameState.current.bullets.push(...newBullets);

      // Sunflower generating sun (every 10000ms)
      setPlants(prev => {
        let generated = false;
        const next = prev.map(p => {
          if (p.type === 'sunflower' && time - p.lastAction > 10000) {
            generated = true;
            setSuns(s => [...s, {
              id: generateId(),
              x: 26.5 + (p.col * (70 / 9)) + 2,
              y: 16 + (p.row * (80 / 5)) + 4
            }]);
            return { ...p, lastAction: time };
          }
          return p;
        });
        return generated ? next : prev;
      });

    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (!selectedSeed) return;
    
    const cost = PLANT_DATA[selectedSeed].cost;
    if (sun >= cost) {
      if (selectedSeed === 'ultimate') {
        setSun(s => s - cost);
        setPlayingVideo(true);
        gameState.current.zombies = []; // Kill all zombies instantly
        setSelectedSeed(null);
        return;
      }

      if (plants.some(p => p.row === row && p.col === col)) return;
      
      setSun(s => s - cost);
      setPlants(prev => [...prev, { 
        id: generateId(), 
        type: selectedSeed, 
        row, 
        col, 
        hp: PLANT_DATA[selectedSeed].hp,
        lastAction: performance.now()
      }]);
      setSelectedSeed(null);
    }
  };

  const collectSun = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSun(s => s + 25);
    setSuns(prev => prev.filter(s => s.id !== id));
  };

  const handleRestart = () => {
    setLevelIndex(0);
    setSun(50);
    setPlants([]);
    setSuns([]);
    setSelectedSeed(null);
    setGameOver(false);
    gameState.current = {
      bullets: [],
      zombies: [],
      zombiesToSpawn: [...LEVELS[0].zombies],
      lastSpawnTime: performance.now(),
      lastSkySunTime: performance.now(),
      isGameOver: false
    };
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div 
        className="relative w-full max-w-6xl aspect-[16/9] bg-cover bg-center overflow-hidden shadow-2xl shadow-green-900/20"
        style={{ backgroundImage: 'url("https://raw.githubusercontent.com/gvgle/-/main/bwdkb%20dkwnkc.jpg")' }}
      >
        {/* Top Bar (Seed Bank & Level Info) */}
        <div className="absolute top-1 sm:top-2 left-1 sm:left-2 right-1 sm:right-2 flex justify-between items-start z-50 pointer-events-none">
          <div className="flex gap-1 sm:gap-2 pointer-events-auto overflow-x-auto max-w-[70vw] sm:max-w-none pb-2 scrollbar-hide">
            <div className="bg-amber-900/90 border-2 border-amber-700 rounded-lg p-1 sm:p-2 flex flex-col items-center justify-center w-12 sm:w-20 shadow-lg shrink-0">
              <span className="text-yellow-400 font-black text-sm sm:text-xl drop-shadow-md">{sun}</span>
              <span className="text-[10px] sm:text-xs text-amber-200 font-bold">阳光</span>
            </div>
            
            {(Object.keys(PLANT_DATA) as PlantType[]).filter(t => {
              if (t === 'ultimate') return hasUltimate;
              if (t === 'reaper') return hasReaper;
              return true;
            }).map(type => (
              <div 
                key={type}
                onClick={() => sun >= PLANT_DATA[type].cost && setSelectedSeed(type)}
                className={`
                  relative w-12 h-16 sm:w-16 sm:h-20 rounded-lg border-2 cursor-pointer transition-all overflow-hidden shrink-0
                  ${sun < PLANT_DATA[type].cost ? 'opacity-50 grayscale cursor-not-allowed border-stone-600 bg-stone-800' : 
                    selectedSeed === type ? 'border-green-400 bg-green-900/80 scale-105 shadow-[0_0_15px_#4ade80]' : 
                    'border-amber-700 bg-amber-900/80 hover:bg-amber-800'}
                `}
              >
                <div className="absolute inset-0 flex items-center justify-center pb-3 sm:pb-4 scale-75 sm:scale-100">
                  {type === 'peashooter' && <PeashooterPreview />}
                  {type === 'sunflower' && <SunflowerPreview />}
                  {type === 'wallnut' && <WallnutPreview />}
                  {type === 'ultimate' && <UltimatePreview />}
                  {type === 'reaper' && <ReaperPreview />}
                </div>
                <div className="absolute bottom-0 w-full bg-black/60 text-center text-[10px] sm:text-xs font-bold text-white py-0.5">
                  {PLANT_DATA[type].cost}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-end gap-1 sm:gap-2 pointer-events-auto shrink-0">
            <button 
              onClick={() => onNavigate('menu')} 
              className="px-2 py-1 sm:px-4 sm:py-2 bg-stone-700 rounded-lg sm:rounded-xl font-bold hover:bg-stone-600 border-b-2 sm:border-b-4 border-stone-900 active:translate-y-1 active:border-b-0 text-xs sm:text-sm"
            >
              菜单
            </button>
            <div className="bg-black/60 px-2 py-1 sm:px-4 sm:py-2 rounded-lg border border-white/20 font-bold text-amber-400 text-xs sm:text-base whitespace-nowrap">
              关卡 {currentLevel.level}
            </div>
          </div>
        </div>

        {/* Grid Area */}
        <div className="absolute left-[26.5%] top-[16%] w-[70%] h-[80%] grid grid-cols-9 grid-rows-5">
          {Array.from({ length: 45 }).map((_, i) => {
            const row = Math.floor(i / 9);
            const col = i % 9;
            const plant = plants.find(p => p.row === row && p.col === col);
            
            return (
              <div 
                key={i} 
                className={`relative border border-white/0 transition-colors ${selectedSeed ? 'hover:border-white/40 hover:bg-white/10 cursor-pointer' : ''}`}
                onClick={() => handleCellClick(row, col)}
              >
                {plant && (
                  <div className={`absolute inset-0 ${plant.hp < PLANT_DATA[plant.type].hp / 2 ? 'opacity-70' : ''}`}>
                    {plant.type === 'peashooter' && <Peashooter />}
                    {plant.type === 'sunflower' && <Sunflower />}
                    {plant.type === 'wallnut' && <Wallnut />}
                    {plant.type === 'reaper' && <Reaper />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Zombies */}
        {gameState.current.zombies.map(z => {
          const yPos = 16 + (z.row * (80 / 5)) - 8; 
          return (
            <div 
              key={z.id} 
              className="absolute w-[12%] h-[28%] pointer-events-none z-20 flex items-end justify-center" 
              style={{ 
                left: `${z.x}%`, 
                top: `${yPos}%`, 
                filter: z.isWeakened ? 'hue-rotate(270deg) brightness(0.5) drop-shadow(0 0 10px purple)' : ZOMBIE_DATA[z.type].filter,
                transform: `scale(${ZOMBIE_DATA[z.type].scale})`
              }}
            >
              <PoleZombie type={z.type} />
            </div>
          );
        })}

        {/* Bullets */}
        {gameState.current.bullets.map(b => {
          const yPos = 16 + (b.row * (80 / 5)) + 4; 
          return (
            <div 
              key={b.id} 
              className="absolute w-4 h-4 sm:w-5 sm:h-5 bg-[#73e838] rounded-full shadow-[0_0_8px_#4ade80] border-2 border-[#2b7a11] pointer-events-none -translate-y-1/2 z-30" 
              style={{ left: `${b.x}%`, top: `${yPos}%` }}
            ></div>
          );
        })}

        {/* Suns */}
        {suns.map(s => (
          <div
            key={s.id}
            onClick={(e) => collectSun(s.id, e)}
            className="absolute w-12 h-12 sm:w-16 sm:h-16 cursor-pointer z-40 hover:scale-110 transition-transform animate-[spin_10s_linear_infinite]"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          >
            <div className="w-full h-full bg-yellow-300 rounded-full shadow-[0_0_20px_#facc15] border-4 border-yellow-500 opacity-90 flex items-center justify-center">
              <div className="w-3/4 h-3/4 bg-yellow-200 rounded-full opacity-50"></div>
            </div>
          </div>
        ))}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
            <h2 className="text-5xl md:text-7xl font-black text-red-500 mb-8 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">
              僵尸吃掉了你的脑子！
            </h2>
            <div className="flex gap-6">
              <button 
                onClick={handleRestart} 
                className="px-8 py-4 bg-green-600 rounded-xl font-bold text-2xl hover:bg-green-500 border-b-4 border-green-800 active:translate-y-1 active:border-b-0 text-white shadow-lg shadow-green-900/50"
              >
                重新开始
              </button>
              <button 
                onClick={() => onNavigate('menu')} 
                className="px-8 py-4 bg-stone-700 rounded-xl font-bold text-2xl hover:bg-stone-600 border-b-4 border-stone-900 active:translate-y-1 active:border-b-0 text-white shadow-lg shadow-stone-900/50"
              >
                返回主菜单
              </button>
            </div>
          </div>
        )}

        {/* Ultimate Video Overlay */}
        {playingVideo && (
          <div className="absolute inset-0 z-[200] bg-black flex items-center justify-center">
            <video 
              src="https://raw.githubusercontent.com/gvgle/111/main/sora-video-bb21b004-ac6b-4f43-93a7-96f0887ab053.mp4" 
              autoPlay 
              onEnded={() => setPlayingVideo(false)}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Reaper Video Overlay */}
        {playingReaperVideo && (
          <div className="absolute inset-0 z-[200] bg-black/90 flex items-center justify-center">
            <video 
              src="https://raw.githubusercontent.com/gvgle/111/main/sora-video-c6d801ce-c7c9-4295-83a8-6a86bfc80432.mp4" 
              autoPlay 
              onEnded={() => setPlayingReaperVideo(false)}
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-10 text-purple-500 text-4xl font-black animate-pulse drop-shadow-[0_0_10px_purple]">
              死神降临！全图僵尸虚弱！
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Peashooter() {
  const headImg = "https://raw.githubusercontent.com/gvgle/-/main/unnamedcfgggggggggggggggggggg.webp";
  const baseImg = "https://raw.githubusercontent.com/gvgle/-/main/cchhhhhhhhhh.webp";
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 sm:pb-2 pointer-events-none z-10">
      <div className="relative w-[80%] h-[80%] max-w-[70px] max-h-[70px]">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[70%] z-0">
          <img src={baseImg} alt="base" className="w-full h-full object-contain drop-shadow-lg" />
        </div>
        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[100%] h-[100%] z-10">
          <img src={headImg} alt="head" className="w-full h-full object-contain animate-nod drop-shadow-xl" style={{ transformOrigin: 'center 80%' }} />
        </div>
      </div>
    </div>
  );
}

function Sunflower() {
  const imgUrl = "https://raw.githubusercontent.com/gvgle/-/main/xfffffffffffffffffffffffffmd.webp";
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 sm:pb-2 pointer-events-none z-10">
      <div className="relative w-[80%] h-[80%] max-w-[70px] max-h-[70px]">
        <img 
          src={imgUrl} 
          alt="sunflower" 
          className="w-full h-full object-contain animate-nod drop-shadow-xl" 
          style={{ transformOrigin: 'center bottom' }}
        />
      </div>
    </div>
  );
}

function Wallnut() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-end pb-2 pointer-events-none z-10">
      <div className="w-12 h-14 bg-amber-700 rounded-[2rem] border-4 border-amber-900 shadow-inner animate-[nod_3s_infinite]"></div>
    </div>
  );
}

function PeashooterPreview() {
  const headImg = "https://raw.githubusercontent.com/gvgle/-/main/unnamedcfgggggggggggggggggggg.webp";
  const baseImg = "https://raw.githubusercontent.com/gvgle/-/main/cchhhhhhhhhh.webp";
  return (
    <div className="relative w-10 h-10 flex flex-col items-center justify-end">
      <div className="absolute bottom-0 w-8 h-8 z-0">
        <img src={baseImg} alt="base" className="w-full h-full object-contain drop-shadow-md" />
      </div>
      <div className="absolute top-0 w-10 h-10 z-10">
        <img src={headImg} alt="head" className="w-full h-full object-contain drop-shadow-md" />
      </div>
    </div>
  );
}
function SunflowerPreview() {
  const imgUrl = "https://raw.githubusercontent.com/gvgle/-/main/xfffffffffffffffffffffffffmd.webp";
  return <img src={imgUrl} alt="sunflower" className="w-10 h-10 object-contain drop-shadow-md" />;
}
function WallnutPreview() {
  return <div className="w-6 h-8 bg-amber-700 rounded-[1rem] border-2 border-amber-900"></div>;
}

function UltimatePreview() {
  const imgUrl = "https://raw.githubusercontent.com/gvgle/-/main/100000000000ed.jpg";
  return <img src={imgUrl} alt="ultimate" className="w-10 h-10 object-cover rounded-full border-2 border-red-500 shadow-[0_0_10px_red]" />;
}

function ReaperPreview() {
  const imgUrl = "https://raw.githubusercontent.com/gvgle/111/main/20000000d.webp";
  return <img src={imgUrl} alt="reaper" className="w-10 h-10 object-cover rounded-full border-2 border-purple-500 shadow-[0_0_10px_purple]" />;
}

function Reaper() {
  const imgUrl = "https://raw.githubusercontent.com/gvgle/111/main/20000000d.webp";
  const weaponUrl = "https://raw.githubusercontent.com/gvgle/111/main/kydfffffffffffffffffffffff.webp";
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 sm:pb-2 pointer-events-none z-10">
      <div className="relative w-[80%] h-[80%] max-w-[70px] max-h-[70px]">
        {/* Weapon */}
        <div className="absolute top-[-20%] right-[-30%] w-[80%] h-[120%] z-20 origin-bottom animate-[arm-swing-1_2s_infinite_ease-in-out]">
          <img src={weaponUrl} alt="weapon" className="w-full h-full object-contain drop-shadow-xl" />
        </div>
        {/* Body */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100%] h-[100%] z-10">
          <img src={imgUrl} alt="reaper" className="w-full h-full object-contain animate-[body-bob_3s_infinite_linear] drop-shadow-xl" />
        </div>
      </div>
    </div>
  );
}

function PoleZombie({ type }: { type: ZombieType }) {
  const poleImg = "https://raw.githubusercontent.com/gvgle/-/main/unndfkkkkkkfffffffffffamed.webp";
  
  // Adjust animation speed based on zombie type
  const animDuration = type === 'fast' ? '1s' : type === 'buckethead' ? '3s' : type === 'conehead' ? '2.5s' : '2s';

  return (
    <div className="relative w-full h-full" style={{ animation: `body-bob ${animDuration} infinite linear` }}>
      {/* Right Arm (Back) */}
      <div className="absolute top-[20%] left-1/2 w-[15%] h-[35%] origin-top opacity-70" style={{ animation: `arm-swing-2 ${animDuration} infinite ease-in-out` }}>
        <img src={poleImg} className="w-full h-full object-fill drop-shadow-md" alt="arm-r" />
      </div>
      
      {/* Right Leg (Back) */}
      <div className="absolute top-[50%] left-1/2 w-[18%] h-[45%] origin-top opacity-70" style={{ animation: `leg-swing-2 ${animDuration} infinite ease-in-out` }}>
        <img src={poleImg} className="w-full h-full object-fill drop-shadow-md" alt="leg-r" />
      </div>
      
      {/* Body */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[22%] h-[45%] z-10">
        {type === 'conehead' && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[24px] border-l-transparent border-r-transparent border-b-orange-500 z-30 drop-shadow-md">
            <div className="absolute top-[20px] -left-[14px] w-[28px] h-[6px] bg-orange-600 rounded-full"></div>
          </div>
        )}
        {type === 'buckethead' && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-7 h-6 bg-slate-400 rounded-t-md border-b-4 border-slate-600 z-30 flex justify-center drop-shadow-md">
            <div className="w-9 h-1.5 bg-slate-600 absolute -bottom-1.5 rounded-full"></div>
            <div className="w-1 h-3 bg-red-500 absolute top-1 right-1 rounded-full rotate-45"></div>
          </div>
        )}
        {type === 'fast' && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[120%] h-2 bg-red-600 z-30 shadow-sm rotate-[-10deg]">
            <div className="absolute -right-3 top-0 w-4 h-1 bg-red-600 rotate-[30deg]"></div>
          </div>
        )}
        <img src={poleImg} className="w-full h-full object-fill drop-shadow-xl" alt="body" />
      </div>
      
      {/* Left Leg (Front) */}
      <div className="absolute top-[50%] left-1/2 w-[18%] h-[45%] origin-top z-10" style={{ animation: `leg-swing-1 ${animDuration} infinite ease-in-out` }}>
        <img src={poleImg} className="w-full h-full object-fill drop-shadow-xl" alt="leg-l" />
      </div>
      
      {/* Left Arm (Front) */}
      <div className="absolute top-[20%] left-1/2 w-[15%] h-[35%] origin-top z-20" style={{ animation: `arm-swing-1 ${animDuration} infinite ease-in-out` }}>
        <img src={poleImg} className="w-full h-full object-fill drop-shadow-xl" alt="arm-l" />
      </div>
    </div>
  );
}

function SettingsScreen({ onNavigate, coins, setCoins, redeemed, setRedeemed, redeemedReaper, setRedeemedReaper }: { onNavigate: (screen: Screen) => void, coins: number, setCoins: React.Dispatch<React.SetStateAction<number>>, redeemed: boolean, setRedeemed: React.Dispatch<React.SetStateAction<boolean>>, redeemedReaper: boolean, setRedeemedReaper: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [code, setCode] = useState('');

  const handleRedeem = () => {
    if (code === '54188' && !redeemed) {
      setCoins(c => c + 1000);
      setRedeemed(true);
      alert('兑换成功！获得 1000 金币！');
    } else if (code === '54188' && redeemed) {
      alert('该兑换码已使用！');
    } else if (code === 'sb250' && !redeemedReaper) {
      setCoins(c => c + 1000);
      setRedeemedReaper(true);
      alert('兑换成功！获得 1000 金币！');
    } else if (code === 'sb250' && redeemedReaper) {
      alert('该兑换码已使用！');
    } else {
      alert('无效的兑换码！');
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900 gap-4 md:gap-6 p-4">
      <h2 className="text-3xl md:text-4xl font-bold text-stone-300 mb-2 md:mb-4">设置</h2>
      
      <div className="bg-stone-800 p-6 md:p-8 rounded-2xl border-2 border-stone-700 flex flex-col items-center gap-4 w-full max-w-sm">
        <h3 className="text-xl md:text-2xl text-amber-400 font-bold">兑换码</h3>
        <div className="flex gap-2 w-full">
          <input 
            type="text" 
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="输入兑换码" 
            className="flex-1 px-3 py-2 md:px-4 rounded-lg bg-stone-900 border border-stone-600 text-white outline-none focus:border-green-500 w-full"
          />
          <button onClick={handleRedeem} className="px-4 py-2 bg-green-600 rounded-lg font-bold hover:bg-green-500 whitespace-nowrap">兑换</button>
        </div>
        <p className="text-stone-400 text-sm">当前金币: {coins}</p>
      </div>

      <button onClick={() => onNavigate('menu')} className="px-6 py-3 bg-stone-700 rounded-xl font-bold hover:bg-stone-600 border-b-4 border-stone-900 active:translate-y-1 active:border-b-0 mt-4 md:mt-8">返回主菜单</button>
    </div>
  );
}

function AchievementsScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-amber-950">
      <h2 className="text-4xl font-bold text-amber-400 mb-8">成就</h2>
      <button onClick={() => onNavigate('menu')} className="px-6 py-3 bg-stone-700 rounded-xl font-bold hover:bg-stone-600 border-b-4 border-stone-900 active:translate-y-1 active:border-b-0">返回主菜单</button>
    </div>
  );
}

function ShopScreen({ onNavigate, coins, setCoins, hasUltimate, setHasUltimate, hasReaper, setHasReaper }: { onNavigate: (screen: Screen) => void, coins: number, setCoins: React.Dispatch<React.SetStateAction<number>>, hasUltimate: boolean, setHasUltimate: React.Dispatch<React.SetStateAction<boolean>>, hasReaper: boolean, setHasReaper: React.Dispatch<React.SetStateAction<boolean>> }) {
  const imgUrl = "https://raw.githubusercontent.com/gvgle/-/main/100000000000ed.jpg";
  const reaperImgUrl = "https://raw.githubusercontent.com/gvgle/111/main/20000000d.webp";

  const handleBuyUltimate = () => {
    if (hasUltimate) {
      alert('你已经拥有该物品了！');
      return;
    }
    if (coins >= 1000) {
      setCoins(c => c - 1000);
      setHasUltimate(true);
      alert('购买成功！你现在可以在战斗中使用它了（需要1000阳光）。');
    } else {
      alert('金币不足！');
    }
  };

  const handleBuyReaper = () => {
    if (hasReaper) {
      alert('你已经拥有该物品了！');
      return;
    }
    if (coins >= 1000) {
      setCoins(c => c - 1000);
      setHasReaper(true);
      alert('购买成功！你现在可以在战斗中使用它了（需要500阳光）。');
    } else {
      alert('金币不足！');
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-purple-950 gap-4 md:gap-8 p-4 overflow-y-auto">
      <div className="absolute top-4 right-4 md:top-8 md:right-8 bg-amber-500 text-black px-4 py-1 md:px-6 md:py-2 rounded-full font-black text-sm md:text-xl shadow-[0_0_15px_rgba(245,158,11,0.5)] z-50">
        金币: {coins}
      </div>
      
      <h2 className="text-3xl md:text-5xl font-black text-purple-300 drop-shadow-lg text-center mt-12 md:mt-0">疯狂戴夫的黑市</h2>
      
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center items-center">
        {/* Ultimate */}
        <div className="bg-purple-900/50 p-4 md:p-6 rounded-3xl border-4 border-purple-800 flex flex-col items-center gap-2 md:gap-4 w-full max-w-sm">
          <img src={imgUrl} alt="Ultimate" className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-2xl shadow-2xl border-4 border-red-500" />
          <h3 className="text-2xl md:text-3xl font-bold text-red-400">毁灭神</h3>
          <p className="text-purple-200 text-center text-sm md:text-base h-16">战斗中消耗 1000 阳光召唤。<br/>播放专属动画并秒杀全屏僵尸！</p>
          
          <button 
            onClick={handleBuyUltimate}
            disabled={hasUltimate}
            className={`mt-2 md:mt-4 px-6 py-2 md:px-8 md:py-3 rounded-xl font-bold text-lg md:text-xl border-b-4 active:translate-y-1 active:border-b-0 transition-all w-full ${
              hasUltimate 
                ? 'bg-stone-600 border-stone-800 text-stone-400 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 border-amber-700 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
            }`}
          >
            {hasUltimate ? '已拥有' : '1000 金币购买'}
          </button>
        </div>

        {/* Reaper */}
        <div className="bg-purple-900/50 p-4 md:p-6 rounded-3xl border-4 border-purple-800 flex flex-col items-center gap-2 md:gap-4 w-full max-w-sm">
          <img src={reaperImgUrl} alt="Reaper" className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-2xl shadow-2xl border-4 border-purple-500" />
          <h3 className="text-2xl md:text-3xl font-bold text-purple-400">死神</h3>
          <p className="text-purple-200 text-center text-sm md:text-base h-16">战斗中消耗 500 阳光召唤。<br/>死亡时播放动画，全图僵尸虚弱持续扣血！</p>
          
          <button 
            onClick={handleBuyReaper}
            disabled={hasReaper}
            className={`mt-2 md:mt-4 px-6 py-2 md:px-8 md:py-3 rounded-xl font-bold text-lg md:text-xl border-b-4 active:translate-y-1 active:border-b-0 transition-all w-full ${
              hasReaper 
                ? 'bg-stone-600 border-stone-800 text-stone-400 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 border-amber-700 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
            }`}
          >
            {hasReaper ? '已拥有' : '1000 金币购买'}
          </button>
        </div>
      </div>

      <button onClick={() => onNavigate('menu')} className="px-6 py-2 md:px-8 md:py-4 bg-stone-700 rounded-xl font-bold text-lg md:text-xl hover:bg-stone-600 border-b-4 border-stone-900 active:translate-y-1 active:border-b-0 mt-2 md:mt-4">返回主菜单</button>
    </div>
  );
}
