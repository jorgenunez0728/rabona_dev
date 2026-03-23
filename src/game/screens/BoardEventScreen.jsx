import { SFX } from "@/game/audio";
import { T, applyBoardEffect } from "@/game/data";
import useGameStore from "@/game/store";

export default function BoardEventScreen() {
  const {
    boardEvents, boardEventIdx, setBoardEventIdx,
    boardPhase, setBoardPhase,
    boardSlideDir, setBoardSlideDir,
    boardResultData, setBoardResultData,
    game, setGame, go,
    setBoardEvents,
  } = useGameStore();

  const ev = boardEvents[boardEventIdx];
  const phase = boardPhase;
  if (!ev) { setTimeout(() => go('prematch'), 50); return null; }

  function previewEffects(opt) {
    const parts = [];
    if (opt?.e?.coins > 0) parts.push({ t: `+${opt.e.coins} 💰`, c: T.win });
    if (opt?.e?.coins < 0) parts.push({ t: `${opt.e.coins} 💰`, c: T.lose });
    if (opt?.e?.chem > 0) parts.push({ t: `+${opt.e.chem} 🔗`, c: T.win });
    if (opt?.e?.chem < 0) parts.push({ t: `${opt.e.chem} 🔗`, c: T.lose });
    const f = opt?.fx;
    if (f === 'startCopa') parts.push({ t: '🏆 Inicia Copa', c: T.gold });
    if (f === 'sellWorstReserve') parts.push({ t: '📤 Vende reserva', c: T.draw });
    if (f === 'boostRandom') parts.push({ t: '📈 +stats titular', c: T.win });
    if (f === 'fatigueAll5') parts.push({ t: '😓 +fatiga todos', c: T.lose });
    return parts;
  }

  function choose(option) {
    if (phase !== 'choose') return;
    const chosen = ev[option]; if (!chosen) return;
    SFX.play('click'); setBoardPhase('sliding'); setBoardSlideDir(option === 'a' ? 'left' : 'right');
    const effects = previewEffects(chosen);
    setTimeout(() => {
      setGame(g => applyBoardEffect(g, chosen.e || {}, chosen.fx));
      setBoardSlideDir(null);
      setBoardResultData({ label: chosen.l, effects, narrative: `Elegiste: "${chosen.l}"` });
      setBoardPhase('result');
    }, 400);
  }

  function advance() {
    setBoardPhase('choose'); setBoardResultData(null);
    if (boardEventIdx + 1 < boardEvents.length) setBoardEventIdx(boardEventIdx + 1);
    else { setBoardEvents([]); setBoardEventIdx(0); go('prematch'); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <div style={{ fontFamily: "'Oswald'", fontSize: 10, color: T.tx3, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Entre Jornadas · {boardEventIdx + 1}/{boardEvents.length}</div>
      {phase === 'result' && boardResultData && (
        <div style={{ width: '100%', maxWidth: 360, background: 'linear-gradient(145deg,#141e3a,#1a2744)', border: `1px solid ${T.gold}25`, borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>📋</div>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 16, color: T.tx, marginBottom: 4 }}>"{boardResultData.label}"</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginBottom: 12 }}>
            {boardResultData.effects.map((e, i) => (<span key={i} style={{ fontFamily: "'Oswald'", fontSize: 12, color: e.c, background: `${e.c}12`, padding: '3px 10px', borderRadius: 10, border: `1px solid ${e.c}25` }}>{e.t}</span>))}
          </div>
          <button onClick={advance} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, padding: '10px 32px', border: 'none', background: `linear-gradient(135deg,${T.accent},#00e676)`, color: T.bg, borderRadius: 6, cursor: 'pointer', textTransform: 'uppercase' }}>Continuar</button>
        </div>
      )}
      {phase !== 'result' && (
        <div style={{ width: '100%', maxWidth: 360, background: 'linear-gradient(145deg,#141e3a,#1a2744)', border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, textAlign: 'center', transform: boardSlideDir === 'left' ? 'translateX(-120%) rotate(-8deg)' : boardSlideDir === 'right' ? 'translateX(120%) rotate(8deg)' : 'translateX(0)', opacity: boardSlideDir ? 0 : 1, transition: 'transform 0.35s ease, opacity 0.3s ease' }}>
          <div style={{ fontSize: 36, marginBottom: 4 }}>{ev.who.split(' ')[0]}</div>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, color: T.gold, textTransform: 'uppercase' }}>{ev.who}</div>
          <div style={{ fontFamily: "'Barlow'", fontSize: 15, color: T.tx, lineHeight: 1.5, margin: '12px 0', minHeight: 50 }}>{ev.text}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button onClick={() => choose('a')} disabled={phase !== 'choose'} style={{ width: '100%', padding: '12px', background: `${T.win}08`, border: `1.5px solid ${T.win}30`, borderRadius: 8, cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, color: T.win }}>{ev.a.l}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>{previewEffects(ev.a).map((p, i) => (<span key={i} style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: p.c, background: `${p.c}10`, padding: '1px 6px', borderRadius: 6 }}>{p.t}</span>))}</div>
            </button>
            {ev.b && (
              <button onClick={() => choose('b')} disabled={phase !== 'choose'} style={{ width: '100%', padding: '12px', background: `${T.lose}08`, border: `1.5px solid ${T.lose}30`, borderRadius: 8, cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, color: T.lose }}>{ev.b.l}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>{previewEffects(ev.b).map((p, i) => (<span key={i} style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: p.c, background: `${p.c}10`, padding: '1px 6px', borderRadius: 6 }}>{p.t}</span>))}</div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
