import { useState, useRef, useEffect, useCallback } from 'react';
import { SFX } from '@/game/audio';
import { Haptics } from '@/game/haptics';
import { T, RUFUS_ACCESSORIES, RUFUS_SLOT_LABELS, RUFUS_SLOT_ORDER, RUFUS_LEVEL_XP, RUFUS_RARITY_COLORS } from '@/game/data';
import useGameStore from '@/game/store';

// ── Rufus Display Component ──
function RufusDisplay({ equipped, mood, size = 100, onTap }) {
  const moodAnim = mood === 'excited' ? 'fw-bounceIn' : mood === 'sad' ? 'fw-pulse' : 'fw-float';
  const bgAcc = equipped.bg ? RUFUS_ACCESSORIES.find(a => a.id === equipped.bg) : null;
  const petAcc = equipped.pet ? RUFUS_ACCESSORIES.find(a => a.id === equipped.pet) : null;

  const slots = ['head', 'body', 'neck', 'held', 'feet'];
  const slotPositions = {
    head: { top: '-8%', left: '50%', transform: 'translateX(-50%)', fontSize: size * 0.28 },
    neck: { top: '25%', left: '70%', fontSize: size * 0.22 },
    body: { top: '45%', left: '20%', fontSize: size * 0.25 },
    held: { top: '55%', left: '75%', fontSize: size * 0.24 },
    feet: { top: '78%', left: '50%', transform: 'translateX(-50%)', fontSize: size * 0.22 },
  };

  return (
    <div style={{ position: 'relative', width: size, height: size * 1.3, margin: '0 auto' }}>
      {/* Background */}
      {bgAcc && <div style={{ position: 'absolute', inset: -10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5, opacity: 0.3, filter: 'blur(2px)' }}>{bgAcc.i}</div>}
      {/* Rufus base */}
      <div className={moodAnim} onClick={onTap} style={{ fontSize: size * 0.6, textAlign: 'center', cursor: 'pointer', paddingTop: size * 0.15, userSelect: 'none', position: 'relative', zIndex: 2 }}>
        🐕
      </div>
      {/* Equipped accessories */}
      {slots.map(slot => {
        const accId = equipped[slot];
        if (!accId) return null;
        const acc = RUFUS_ACCESSORIES.find(a => a.id === accId);
        if (!acc) return null;
        const pos = slotPositions[slot];
        return <span key={slot} style={{ position: 'absolute', zIndex: 3, pointerEvents: 'none', ...pos }}>{acc.i}</span>;
      })}
      {/* Sub-pet */}
      {petAcc && <div className="fw-float" style={{ position: 'absolute', bottom: 0, right: 0, fontSize: size * 0.25, zIndex: 3 }}>{petAcc.i}</div>}
    </div>
  );
}

// ── Ball Fetch Mini-Game ──
function FetchMiniGame({ onClose, onScore, bestStreak }) {
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const ballRef = useRef({ x: 150, y: 50, vx: 3, vy: 0 });
  const frameRef = useRef(null);
  const areaRef = useRef(null);
  const [ballPos, setBallPos] = useState({ x: 150, y: 50 });

  const W = 300, H = 350, R = 20, GRAVITY = 0.35;

  const loop = useCallback(() => {
    const b = ballRef.current;
    b.vy += GRAVITY;
    b.x += b.vx;
    b.y += b.vy;
    if (b.x < R || b.x > W - R) { b.vx *= -0.9; b.x = Math.max(R, Math.min(W - R, b.x)); }
    if (b.y > H - R) {
      setGameOver(true);
      setPlaying(false);
      SFX.play('bark');
      return;
    }
    setBallPos({ x: b.x, y: b.y });
    frameRef.current = requestAnimationFrame(loop);
  }, []);

  function startGame() {
    ballRef.current = { x: 150, y: 80, vx: (Math.random() - 0.5) * 6, vy: -6 };
    setScore(0);
    setGameOver(false);
    setPlaying(true);
  }

  useEffect(() => {
    if (playing) frameRef.current = requestAnimationFrame(loop);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [playing, loop]);

  function handleTap(e) {
    if (!playing) return;
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const tx = (e.clientX - rect.left) * (W / rect.width);
    const ty = (e.clientY - rect.top) * (H / rect.height);
    const b = ballRef.current;
    const dist = Math.sqrt((tx - b.x) ** 2 + (ty - b.y) ** 2);
    if (dist < 40) {
      b.vy = -8 - Math.random() * 2;
      b.vx = (Math.random() - 0.5) * 7;
      const newScore = score + 1;
      setScore(newScore);
      SFX.play('bark_happy');
      Haptics.light();
      if (newScore % 5 === 0) onScore(newScore);
    }
  }

  useEffect(() => {
    if (gameOver && score > 0) onScore(score);
  }, [gameOver]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
      <div className="fw-scaleIn" style={{ maxWidth: 340, width: '100%', padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 16, color: T.tx }}>Atrapa el Balon</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.tx3, fontSize: 20, cursor: 'pointer' }}>X</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: T.fontHeading, fontSize: 14, color: T.gold }}>{score}</span>
          <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx4 }}>Mejor: {Math.max(bestStreak, score)}</span>
        </div>
        <div ref={areaRef} onClick={handleTap} style={{ width: W, height: H, maxWidth: '100%', background: 'linear-gradient(180deg, #1a2744 0%, #2d4a3e 60%, #3a5a3a 100%)', borderRadius: 12, position: 'relative', overflow: 'hidden', margin: '0 auto', cursor: 'pointer', touchAction: 'manipulation', border: `1px solid ${T.glassBorder}` }}>
          {/* Ground line */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: R, background: 'rgba(139,90,43,0.4)', borderTop: '2px solid rgba(139,90,43,0.6)' }} />
          {/* Rufus at bottom */}
          <div style={{ position: 'absolute', bottom: R + 5, left: '50%', transform: 'translateX(-50%)', fontSize: 32, transition: 'left 0.15s' }}>🐕</div>
          {/* Ball */}
          {playing && <div style={{ position: 'absolute', left: ballPos.x - 14, top: ballPos.y - 14, fontSize: 28, transition: 'none', pointerEvents: 'none' }}>⚽</div>}
          {/* Start / Game Over overlay */}
          {!playing && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
              {gameOver && <div style={{ fontFamily: T.fontHeading, fontSize: 20, color: T.gold, marginBottom: 8 }}>Racha: {score}</div>}
              <button className="fw-btn fw-btn-primary" onClick={(e) => { e.stopPropagation(); startGame(); }} style={{ fontFamily: T.fontHeading, fontSize: 14, padding: '10px 24px' }}>{gameOver ? 'Otra vez' : 'Jugar'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main MascotScreen ──
export default function MascotScreen() {
  const { globalStats, updateRufus, addAccessoryToInventory, go, initRufus, getRufus } = useGameStore();
  const [tab, setTab] = useState('accesorios');
  const [showGame, setShowGame] = useState(false);
  const [petFlash, setPetFlash] = useState(false);

  useEffect(() => { initRufus(); }, []);

  const rufus = getRufus();
  const level = rufus.level || 0;
  const xp = rufus.xp || 0;
  const nextXP = RUFUS_LEVEL_XP[Math.min(level + 1, RUFUS_LEVEL_XP.length - 1)];
  const prevXP = RUFUS_LEVEL_XP[level] || 0;
  const xpPct = nextXP > prevXP ? Math.min(100, ((xp - prevXP) / (nextXP - prevXP)) * 100) : 100;

  function handlePet() {
    SFX.play('bark');
    Haptics.light();
    setPetFlash(true);
    setTimeout(() => setPetFlash(false), 300);
    updateRufus(r => ({ ...r, totalPets: (r.totalPets || 0) + 1, xp: (r.xp || 0) + 1 }));
  }

  function handleEquip(slot, accId) {
    SFX.play('click');
    Haptics.light();
    updateRufus(r => {
      const equipped = { ...r.equipped };
      equipped[slot] = equipped[slot] === accId ? null : accId;
      return { ...r, equipped };
    });
  }

  function handleGameScore(score) {
    updateRufus(r => ({
      ...r,
      totalBalls: (r.totalBalls || 0) + score,
      bestBallStreak: Math.max(r.bestBallStreak || 0, score),
      xp: (r.xp || 0) + Math.floor(score / 3),
    }));
  }

  const tabs = [
    { k: 'accesorios', l: '🎒', label: 'Accesorios' },
    { k: 'fotos',      l: '📸', label: 'Fotos' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto', background: T.bg }}>
      <div className="stadium-glow" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <div style={{ padding: '14px 16px 8px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div className="text-gradient-gold" style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 22, textTransform: 'uppercase', letterSpacing: 2 }}>🐕 {rufus.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6 }}>
          <span style={{ fontFamily: T.fontHeading, fontSize: 12, color: T.gold, background: `${T.gold}15`, padding: '2px 10px', borderRadius: 10 }}>Nv.{level}</span>
          <div style={{ width: 80, height: 6, background: T.bg1, borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${xpPct}%`, height: '100%', background: T.gradientPrimary, borderRadius: 3, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx4 }}>{xp}/{nextXP} XP</span>
        </div>
        <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3, marginTop: 4 }}>
          {rufus.mood === 'excited' ? 'Emocionado' : rufus.mood === 'sad' ? 'Triste' : rufus.mood === 'sleepy' ? 'Somnoliento' : 'Feliz'} · {rufus.totalPets || 0} caricias · {rufus.inventory?.length || 0}/{RUFUS_ACCESSORIES.length} items
        </div>
      </div>

      {/* Rufus Display */}
      <div style={{ padding: '8px 0 16px', position: 'relative', zIndex: 1 }}>
        {petFlash && <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: T.fontHeading, fontSize: 16, color: T.gold, animation: 'fw-fadeUp 0.5s ease-out forwards', zIndex: 10, pointerEvents: 'none' }}>+1 XP</div>}
        <RufusDisplay equipped={rufus.equipped || {}} mood={rufus.mood} size={100} onTap={handlePet} />
      </div>

      {/* Mini-game button */}
      <div style={{ textAlign: 'center', marginBottom: 12, position: 'relative', zIndex: 1 }}>
        <button className="fw-btn fw-btn-glass" onClick={() => setShowGame(true)} style={{ fontFamily: T.fontHeading, fontSize: 12, padding: '8px 20px' }}>⚽ Jugar con Rufus</button>
        {(rufus.bestBallStreak || 0) > 0 && <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx4, marginTop: 4 }}>Mejor racha: {rufus.bestBallStreak}</div>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, position: 'relative', zIndex: 1 }}>
        {tabs.map(t => (
          <div key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, padding: '8px 0', textAlign: 'center', cursor: 'pointer', borderBottom: tab === t.k ? `2px solid ${T.gold}` : '2px solid transparent' }}>
            <span style={{ fontSize: 14 }}>{t.l}</span>
            <div style={{ fontFamily: T.fontHeading, fontSize: 10, color: tab === t.k ? T.gold : T.tx4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.label}</div>
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 12px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>

          {tab === 'accesorios' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {RUFUS_SLOT_ORDER.map(slot => {
                const slotLabel = RUFUS_SLOT_LABELS[slot];
                const items = RUFUS_ACCESSORIES.filter(a => a.slot === slot);
                const equippedId = rufus.equipped?.[slot];
                return (
                  <div key={slot} className="glass-light" style={{ borderRadius: 10, padding: 10 }}>
                    <div style={{ fontFamily: T.fontHeading, fontSize: 11, color: T.tx3, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{slotLabel.i} {slotLabel.n}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {items.map(acc => {
                        const owned = (rufus.inventory || []).includes(acc.id);
                        const equipped = equippedId === acc.id;
                        const rc = RUFUS_RARITY_COLORS[acc.rarity] || RUFUS_RARITY_COLORS.common;
                        return (
                          <div key={acc.id} onClick={() => owned && handleEquip(slot, acc.id)} title={owned ? `${acc.n}\n${acc.d}` : '???'} style={{
                            width: 48, height: 48, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: owned ? 22 : 18, cursor: owned ? 'pointer' : 'default',
                            background: equipped ? `${rc}20` : owned ? T.bg1 : 'rgba(0,0,0,0.3)',
                            border: equipped ? `2px solid ${rc}` : owned ? `1px solid ${T.glassBorder}` : `1px solid transparent`,
                            opacity: owned ? 1 : 0.3,
                            boxShadow: equipped ? `0 0 8px ${rc}40` : 'none',
                            transition: 'all 0.15s',
                          }}>
                            {owned ? acc.i : '?'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'fotos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(rufus.photos || []).length === 0 && (
                <div style={{ textAlign: 'center', padding: 30, color: T.tx4, fontFamily: T.fontBody, fontSize: 13 }}>
                  Gana la copa final para tomarle una foto a Rufus
                </div>
              )}
              {[...(rufus.photos || [])].reverse().map((photo, i) => (
                <div key={i} className="card-gold" style={{ borderRadius: 12, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 40 }}>
                      🐕{Object.values(photo.accessories || {}).filter(Boolean).map(id => {
                        const a = RUFUS_ACCESSORIES.find(x => x.id === id);
                        return a ? a.i : '';
                      }).join('')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 13, color: T.gold }}>{photo.leagueName || 'Copa'}</div>
                      <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx2 }}>{photo.teamName} · Run #{photo.runNum}</div>
                      <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx4 }}>{new Date(photo.timestamp).toLocaleDateString()}</div>
                    </div>
                    <span style={{ fontSize: 24 }}>🏆</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showGame && (
        <FetchMiniGame
          onClose={() => setShowGame(false)}
          onScore={handleGameScore}
          bestStreak={rufus.bestBallStreak || 0}
        />
      )}
    </div>
  );
}
