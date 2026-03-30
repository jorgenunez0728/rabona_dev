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

// ── Breakout Mini-Game "Rufus Rompe Huesos" ──
function BreakoutGame({ onClose, onScore, bestScore }) {
  const W = 300, H = 400, PADDLE_W = 60, PADDLE_H = 14, BALL_R = 7;
  const COLS = 7, ROWS = 5, BRICK_W = W / COLS, BRICK_H = 16, BRICK_Y0 = 40;
  const POWERUP_CHANCE = 0.25;

  const stateRef = useRef(null);
  const frameRef = useRef(null);
  const canvasRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [msg, setMsg] = useState(null);
  const paddleXRef = useRef(W / 2);

  const BRICK_EMOJIS = ['🦴', '⚽', '🏆', '🎾', '🥎', '🧱', '💎'];
  const POWERUP_TYPES = [
    { id: 'multiball', i: '⚽⚽', label: 'Multi-Balón!', color: '#3b82f6' },
    { id: 'wide', i: '↔️', label: 'Rufus Grande!', color: '#22c55e' },
    { id: 'speed', i: '⚡', label: 'Velocidad!', color: '#f59e0b' },
    { id: 'slow', i: '🐢', label: 'Cámara Lenta!', color: '#8b5cf6' },
  ];

  function makeBricks(lvl) {
    const rows = Math.min(ROWS + Math.floor(lvl / 2), 8);
    const bricks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < COLS; c++) {
        const hp = r < 2 && lvl > 2 ? 2 : 1;
        bricks.push({ x: c * BRICK_W, y: BRICK_Y0 + r * BRICK_H, w: BRICK_W - 2, h: BRICK_H - 2, hp, emoji: BRICK_EMOJIS[(r + c) % BRICK_EMOJIS.length] });
      }
    }
    return bricks;
  }

  function initState(lvl) {
    const speed = 3 + lvl * 0.4;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
    return {
      balls: [{ x: W / 2, y: H - 40, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed }],
      bricks: makeBricks(lvl),
      powerups: [],
      paddleW: PADDLE_W,
      paddleX: W / 2,
      baseSpeed: speed,
      speedMult: 1,
      wideTimer: 0,
      slowTimer: 0,
    };
  }

  function startGame() {
    const s = initState(1);
    stateRef.current = s;
    paddleXRef.current = W / 2;
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameOver(false);
    setMsg(null);
    setPlaying(true);
  }

  function nextLevel(prevScore) {
    const nl = level + 1;
    setLevel(nl);
    setMsg(`Nivel ${nl}!`);
    setTimeout(() => setMsg(null), 1000);
    const s = initState(nl);
    stateRef.current = s;
    SFX.play('bark_happy');
  }

  function handlePointer(e) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * (W / rect.width);
    paddleXRef.current = Math.max(0, Math.min(W, x));
  }

  const loop = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const pw = s.wideTimer > 0 ? PADDLE_W * 1.6 : PADDLE_W;
    s.paddleX = paddleXRef.current;
    const sm = s.slowTimer > 0 ? 0.6 : s.speedMult;

    // Update powerup timers
    if (s.wideTimer > 0) s.wideTimer--;
    if (s.slowTimer > 0) s.slowTimer--;

    // Update balls
    const deadBalls = [];
    for (const ball of s.balls) {
      ball.x += ball.vx * sm;
      ball.y += ball.vy * sm;
      // Wall bounces
      if (ball.x < BALL_R) { ball.x = BALL_R; ball.vx = Math.abs(ball.vx); }
      if (ball.x > W - BALL_R) { ball.x = W - BALL_R; ball.vx = -Math.abs(ball.vx); }
      if (ball.y < BALL_R) { ball.y = BALL_R; ball.vy = Math.abs(ball.vy); }
      // Paddle bounce
      const py = H - 28;
      if (ball.vy > 0 && ball.y + BALL_R >= py && ball.y + BALL_R <= py + PADDLE_H + 4) {
        const left = s.paddleX - pw / 2, right = s.paddleX + pw / 2;
        if (ball.x >= left - BALL_R && ball.x <= right + BALL_R) {
          ball.y = py - BALL_R;
          const hitPos = (ball.x - s.paddleX) / (pw / 2); // -1 to 1
          const angle = -Math.PI / 2 + hitPos * 0.7;
          const spd = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
          ball.vx = Math.cos(angle) * spd;
          ball.vy = Math.sin(angle) * spd;
          SFX.play('kick');
        }
      }
      // Bottom — lose ball
      if (ball.y > H + 10) deadBalls.push(ball);
      // Brick collision
      for (let i = s.bricks.length - 1; i >= 0; i--) {
        const br = s.bricks[i];
        if (ball.x + BALL_R > br.x && ball.x - BALL_R < br.x + br.w && ball.y + BALL_R > br.y && ball.y - BALL_R < br.y + br.h) {
          ball.vy *= -1;
          br.hp--;
          if (br.hp <= 0) {
            // Spawn powerup
            if (Math.random() < POWERUP_CHANCE) {
              const pu = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
              s.powerups.push({ ...pu, x: br.x + br.w / 2, y: br.y + br.h / 2, vy: 1.5 });
            }
            s.bricks.splice(i, 1);
            setScore(prev => prev + (level * 10));
            Haptics.light();
          }
          break;
        }
      }
    }
    // Remove dead balls
    for (const db of deadBalls) { const idx = s.balls.indexOf(db); if (idx >= 0) s.balls.splice(idx, 1); }
    if (s.balls.length === 0) {
      setLives(prev => {
        const nl = prev - 1;
        if (nl <= 0) {
          setGameOver(true);
          setPlaying(false);
          SFX.play('bark');
          return 0;
        }
        // Respawn ball
        const speed = s.baseSpeed;
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
        s.balls.push({ x: W / 2, y: H - 40, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed });
        Haptics.warning();
        return nl;
      });
    }

    // Update powerups
    for (let i = s.powerups.length - 1; i >= 0; i--) {
      const pu = s.powerups[i];
      pu.y += pu.vy;
      const py = H - 28;
      if (pu.y >= py && pu.x >= s.paddleX - pw / 2 - 10 && pu.x <= s.paddleX + pw / 2 + 10) {
        // Collected!
        if (pu.id === 'multiball') {
          const nb = { x: W / 2, y: H - 50, vx: (Math.random() - 0.5) * 6, vy: -s.baseSpeed };
          s.balls.push(nb);
          if (s.balls.length < 4) { s.balls.push({ ...nb, vx: -nb.vx }); }
        } else if (pu.id === 'wide') { s.wideTimer = 300; }
        else if (pu.id === 'speed') { s.speedMult = 1.5; setTimeout(() => { if (stateRef.current) stateRef.current.speedMult = 1; }, 4000); }
        else if (pu.id === 'slow') { s.slowTimer = 240; }
        SFX.play('bark_happy');
        setMsg(pu.label);
        setTimeout(() => setMsg(null), 800);
        s.powerups.splice(i, 1);
        continue;
      }
      if (pu.y > H + 20) { s.powerups.splice(i, 1); }
    }

    // Level complete
    if (s.bricks.length === 0 && s.balls.length > 0) {
      setScore(prev => { nextLevel(prev); return prev; });
      return;
    }

    // ── Draw ──
    ctx.clearRect(0, 0, W, H);
    // Background
    ctx.fillStyle = '#0f1729';
    ctx.fillRect(0, 0, W, H);
    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // Bricks
    for (const br of s.bricks) {
      ctx.fillStyle = br.hp > 1 ? '#7c3aed' : '#1e3a5f';
      ctx.fillRect(br.x + 1, br.y + 1, br.w, br.h);
      ctx.strokeStyle = br.hp > 1 ? '#a78bfa' : '#2d5a8e';
      ctx.strokeRect(br.x + 1, br.y + 1, br.w, br.h);
      ctx.font = `${br.h - 2}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText(br.emoji, br.x + br.w / 2 + 1, br.y + br.h - 2);
    }
    // Balls
    ctx.font = `${BALL_R * 2.5}px serif`;
    ctx.textAlign = 'center';
    for (const ball of s.balls) {
      ctx.fillText('⚽', ball.x, ball.y + BALL_R * 0.8);
    }
    // Powerups
    ctx.font = '16px serif';
    for (const pu of s.powerups) {
      ctx.fillStyle = pu.color + '40';
      ctx.beginPath(); ctx.arc(pu.x, pu.y, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillText(pu.i, pu.x, pu.y + 5);
    }
    // Paddle (Rufus)
    const py = H - 28;
    ctx.font = `${PADDLE_H + 6}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🐕', s.paddleX, py + PADDLE_H);
    // Paddle bar
    ctx.fillStyle = '#f0c040';
    ctx.fillRect(s.paddleX - pw / 2, py + PADDLE_H + 2, pw, 3);

    frameRef.current = requestAnimationFrame(loop);
  }, [level]);

  useEffect(() => {
    if (playing) {
      const c = canvasRef.current;
      if (c) { c.width = W; c.height = H; }
      frameRef.current = requestAnimationFrame(loop);
    }
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [playing, loop]);

  useEffect(() => {
    if (gameOver && score > 0) onScore(score);
  }, [gameOver]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
      <div className="fw-scaleIn" style={{ maxWidth: 340, width: '100%', padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 16, color: T.tx }}>Rufus Rompe Huesos</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.tx3, fontSize: 20, cursor: 'pointer' }}>X</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: T.fontHeading, fontSize: 14, color: T.gold }}>{score} pts</span>
          <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx4 }}>Nv.{level}</span>
          <span style={{ fontSize: 14 }}>{'❤️'.repeat(lives)}{'🖤'.repeat(Math.max(0, 3 - lives))}</span>
          <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx4 }}>Mejor: {Math.max(bestScore, score)}</span>
        </div>
        {msg && <div style={{ textAlign: 'center', fontFamily: T.fontHeading, fontSize: 14, color: T.gold, marginBottom: 4, animation: 'fw-fadeUp 0.5s' }}>{msg}</div>}
        <div style={{ position: 'relative', margin: '0 auto', width: W, maxWidth: '100%' }}>
          <canvas
            ref={canvasRef}
            onPointerMove={handlePointer}
            onTouchMove={(e) => { e.preventDefault(); handlePointer(e.touches[0]); }}
            style={{ width: '100%', height: 'auto', aspectRatio: `${W}/${H}`, display: 'block', borderRadius: 12, border: `1px solid ${T.glassBorder}`, touchAction: 'none', cursor: 'none' }}
          />
          {!playing && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', borderRadius: 12 }}>
              {gameOver && <div style={{ fontFamily: T.fontHeading, fontSize: 22, color: T.gold, marginBottom: 4 }}>{score} pts</div>}
              {gameOver && <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx3, marginBottom: 12 }}>Nivel alcanzado: {level}</div>}
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
        <button className="fw-btn fw-btn-glass" onClick={() => setShowGame(true)} style={{ fontFamily: T.fontHeading, fontSize: 12, padding: '8px 20px' }}>🦴 Rufus Rompe Huesos</button>
        {(rufus.bestBallStreak || 0) > 0 && <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx4, marginTop: 4 }}>Mejor: {rufus.bestBallStreak} pts</div>}
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
        <BreakoutGame
          onClose={() => setShowGame(false)}
          onScore={handleGameScore}
          bestScore={rufus.bestBallStreak || 0}
        />
      )}
    </div>
  );
}
