import React, { useState, useMemo } from "react";
import {
  Trophy, Wallet, Users, ShieldCheck, Flag, CreditCard, Clock,
  ChevronRight, ChevronLeft, AlertCircle, Check, X, Home as HomeIcon,
  Swords, Gavel, User, Upload, Plus, Minus, Play, Lock, MapPin, Zap,
  Gamepad2, Monitor,
} from "lucide-react";

/* ---------------------------------------------------------
   TOKENS
   bg: night-stadium charcoal · red card = real stakes
   yellow card = demo/practice · pitch teal = verified/win
--------------------------------------------------------- */
const C = {
  bg: "#080C0A",
  bgAlt: "#0F1713",
  card: "#131D18",
  line: "#213028",
  text: "#EAFBF3",
  sub: "#82A296",
  green: "#39FF88",
  greenDim: "#0E3B24",
  cyan: "#22D3EE",
  cyanDim: "#0B3540",
  amber: "#F5B800",
  amberDim: "#4A3900",
  teal: "#2DD4A7",
  tealDim: "#0F3B31",
  red: "#FF4D5E",
  redDim: "#3A1218",
};

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Teko:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');";

/* ---------------------------------------------------------
   MOCK DATA
--------------------------------------------------------- */
const COMMISSION_RATE = 0.05; // 5% de comisión de la plataforma sobre las inscripciones

const FORMATS = [
  { id: "1v1", label: "1 vs 1", size: 2 },
  { id: "2v2", label: "2 vs 2", size: 4 },
  { id: "4", label: "Copa 4", size: 4 },
  { id: "8", label: "Copa 8", size: 8 },
  { id: "16", label: "Copa 16", size: 16 },
  { id: "32", label: "Copa 32", size: 32 },
];

const PLATFORMS = [
  { id: "ps5", label: "PS5", icon: Gamepad2, color: "#2D6FE0", bg: "#0B1730" },
  { id: "xbox", label: "Xbox", icon: Gamepad2, color: "#3BAA35", bg: "#0C1F0C" },
  { id: "pc", label: "PC · Steam", icon: Monitor, color: "#66C0F4", bg: "#12181F" },
];

// El bote se calcula solo: entrada x jugadores inscritos, menos la comisión de la casa.
const pot = (fee, joined) => Math.round(fee * joined * (1 - COMMISSION_RATE) * 100) / 100;
const rake = (fee, joined) => Math.round(fee * joined * COMMISSION_RATE * 100) / 100;

const seedTournaments = [
  { id: "t0", name: "Arranque 1v1", format: "1v1", mode: "real", fee: 2, joined: 9, slots: 16, status: "open", start: "Hoy 19:30", platform: "pc" },
  { id: "t1", name: "Noche de Clásicos", format: "1v1", mode: "real", fee: 5, joined: 14, slots: 16, status: "open", start: "Hoy 21:00", platform: "ps5" },
  { id: "t2", name: "Duo Cup Semanal", format: "2v2", mode: "real", fee: 8, joined: 6, slots: 8, status: "open", start: "Hoy 22:30", platform: "ps5" },
  { id: "t3", name: "Copa Relámpago", format: "4", mode: "real", fee: 3, joined: 4, slots: 4, status: "live", start: "En vivo", platform: "xbox" },
  { id: "t4", name: "Liga Nocturna", format: "8", mode: "real", fee: 10, joined: 5, slots: 8, status: "open", start: "Mañana 20:00", platform: "ps5" },
  { id: "t5", name: "Máster 16", format: "16", mode: "real", fee: 15, joined: 11, slots: 16, status: "open", start: "Vie 21:00", platform: "xbox" },
  { id: "t6", name: "Gran Copa 32", format: "32", mode: "real", fee: 20, joined: 19, slots: 32, status: "open", start: "Sáb 18:00", platform: "pc" },
  { id: "t7", name: "Sala Demo 1v1", format: "1v1", mode: "demo", fee: 0, joined: 8, slots: 16, status: "open", start: "Hoy 20:00", platform: "ps5" },
  { id: "t8", name: "Sala Demo Copa 8", format: "8", mode: "demo", fee: 0, joined: 3, slots: 8, status: "open", start: "Hoy 23:00", platform: "xbox" },
].map((t) => ({ ...t, prize: t.mode === "demo" ? 0 : pot(t.fee, t.slots) }));

const seedDisputes = [
  { id: "d1", tournament: "Copa Relámpago", players: "kdz_10 vs nano_fc", reason: "Resultado no coincide (3-1 / 1-3)", status: "pendiente", proof: true },
  { id: "d2", tournament: "Noche de Clásicos", players: "rive_pt vs elgoat22", reason: "Rival no se presentó", status: "pendiente", proof: false },
  { id: "d3", tournament: "Liga Nocturna", players: "sanz.7 vs draven_ok", reason: "Sospecha de reconexión forzada", status: "resuelta", proof: true },
];

/* ---------------------------------------------------------
   SMALL UI PRIMITIVES
--------------------------------------------------------- */
function Pill({ children, tone = "sub" }) {
  const tones = {
    sub: { bg: C.card, fg: C.sub, bd: C.line },
    live: { bg: C.cyanDim, fg: "#7DE8FA", bd: C.cyan },
    warn: { bg: C.redDim, fg: "#FF8A93", bd: C.red },
    open: { bg: C.greenDim, fg: C.green, bd: C.green },
    demo: { bg: C.amberDim, fg: C.amber, bd: C.amber },
  };
  const t = tones[tone] || tones.sub;
  return (
    <span
      style={{
        background: t.bg, color: t.fg, border: `1px solid ${t.bd}`,
        fontFamily: "Manrope", fontSize: 11, fontWeight: 700,
        padding: "3px 8px", borderRadius: 999, letterSpacing: 0.4,
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

function ScoreNum({ children, size = 28, color = C.text }) {
  return (
    <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: size, color }}>
      {children}
    </span>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "22px 4px 12px" }}>
      <h2 style={{ fontFamily: "Teko", fontWeight: 600, fontSize: 24, letterSpacing: 0.5, color: C.text, margin: 0, textTransform: "uppercase" }}>
        {children}
      </h2>
      {action}
    </div>
  );
}

/* ---------------------------------------------------------
   BOTTOM NAV
--------------------------------------------------------- */
function BottomNav({ screen, setScreen, isAdmin }) {
  const items = [
    { id: "home", label: "Inicio", icon: HomeIcon },
    { id: "tournaments", label: "Torneos", icon: Swords },
    { id: "wallet", label: "Cartera", icon: Wallet },
    { id: "disputes", label: "Disputas", icon: Gavel },
    { id: "profile", label: isAdmin ? "Admin" : "Perfil", icon: User },
  ];
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: 66,
      background: C.bgAlt, borderTop: `1px solid ${C.line}`,
      display: "flex", alignItems: "center", justifyContent: "space-around",
    }}>
      {items.map((it) => {
        const active = screen === it.id || (screen === "detail" && it.id === "tournaments");
        const Icon = it.icon;
        return (
          <button
            key={it.id}
            onClick={() => setScreen(it.id)}
            style={{
              background: "none", border: "none", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 3, cursor: "pointer", padding: 4, width: 60,
            }}
          >
            <Icon size={20} color={active ? C.green : C.sub} strokeWidth={active ? 2.4 : 1.8} />
            <span style={{
              fontFamily: "Manrope", fontSize: 10, fontWeight: active ? 800 : 600,
              color: active ? C.text : C.sub,
            }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------
   TOP BAR (balance switcher — the signature element)
   Red card = real money, Yellow card = demo
--------------------------------------------------------- */
function BalanceCard({ mode, setMode, real, demo }) {
  const isReal = mode === "real";
  return (
    <div
      onClick={() => setMode(isReal ? "demo" : "real")}
      style={{
        position: "relative", cursor: "pointer", overflow: "hidden",
        borderRadius: 14, padding: "14px 16px",
        background: isReal
          ? `linear-gradient(135deg, ${C.greenDim}, #071710)`
          : `linear-gradient(135deg, ${C.amberDim}, #1A160B)`,
        border: `1px solid ${isReal ? C.green : C.amber}`,
        transition: "background 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Zap size={13} color={isReal ? C.green : C.amber} fill={isReal ? C.green : C.amber} />
            <span style={{ fontFamily: "Manrope", fontSize: 11, fontWeight: 800, color: isReal ? C.green : C.amber, textTransform: "uppercase", letterSpacing: 0.6 }}>
              {isReal ? "Saldo real" : "Saldo demo"}
            </span>
          </div>
          <ScoreNum size={30} color={isReal ? C.text : C.text}>{isReal ? `€${real.toFixed(2)}` : `${demo.toFixed(0)} DC`}</ScoreNum>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontFamily: "Manrope", fontSize: 10, color: C.sub }}>Toca para cambiar</span>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
            <div style={{ width: 8, height: 12, borderRadius: 1.5, background: isReal ? C.amberDim : C.greenDim, border: `1px solid ${isReal ? C.amber : C.green}`, opacity: 0.6 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   HOME
--------------------------------------------------------- */
function Home({ setScreen, balMode, setBalMode, real, demo, tournaments, openTournament, verified }) {
  const live = tournaments.find((t) => t.status === "live" && t.mode === balMode);
  const upcoming = tournaments.filter((t) => t.mode === balMode && t.status === "open").slice(0, 4);

  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontFamily: "Manrope", fontSize: 12, color: C.sub }}>Bienvenido</span>
          <h1 style={{ fontFamily: "Teko", fontWeight: 700, fontSize: 30, margin: 0, color: C.text }}>KDZ_10</h1>
        </div>
        {verified ? (
          <Pill tone="open"><ShieldCheck size={11} style={{ marginRight: 3, marginBottom: -1 }} />Verificado</Pill>
        ) : (
          <button onClick={() => setScreen("verify")} style={{ all: "unset", cursor: "pointer" }}>
            <Pill tone="warn"><AlertCircle size={11} style={{ marginRight: 3, marginBottom: -1 }} />Verificar</Pill>
          </button>
        )}
      </div>

      <div style={{ marginTop: 18 }}>
        <BalanceCard mode={balMode} setMode={setBalMode} real={real} demo={demo} />
      </div>

      {live && (
        <div
          onClick={() => openTournament(live)}
          style={{
            marginTop: 18, borderRadius: 16, padding: 18, cursor: "pointer",
            background: `radial-gradient(circle at 100% 0%, ${C.cyanDim}, ${C.card} 60%)`,
            border: `1px solid ${C.cyan}`, position: "relative", overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.cyan, display: "inline-block" }} />
            <span style={{ fontFamily: "Manrope", fontSize: 11, fontWeight: 800, color: "#7DE8FA", letterSpacing: 0.6, textTransform: "uppercase" }}>En vivo ahora</span>
          </div>
          <h3 style={{ fontFamily: "Teko", fontSize: 26, fontWeight: 600, color: C.text, margin: "6px 0 2px" }}>{live.name}</h3>
          <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
            <div>
              <span style={{ fontFamily: "Manrope", fontSize: 10, color: C.sub, display: "block" }}>Bote del torneo</span>
              <ScoreNum size={20} color={C.amber}>€{live.prize}</ScoreNum>
            </div>
            <div>
              <span style={{ fontFamily: "Manrope", fontSize: 10, color: C.sub, display: "block" }}>Formato</span>
              <ScoreNum size={20}>{live.format}</ScoreNum>
            </div>
          </div>
        </div>
      )}

      <SectionTitle action={<button onClick={() => setScreen("tournaments")} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", color: C.sub, fontFamily: "Manrope", fontSize: 12, fontWeight: 700 }}>Ver todos <ChevronRight size={14} /></button>}>
        Próximos torneos
      </SectionTitle>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {upcoming.map((t) => <TournamentRow key={t.id} t={t} onClick={() => openTournament(t)} />)}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   TOURNAMENT ROW
--------------------------------------------------------- */
function TournamentRow({ t, onClick }) {
  const fmt = FORMATS.find((f) => f.id === t.format);
  return (
    <div onClick={onClick} style={{
      background: C.card, border: `1px solid ${C.line}`, borderRadius: 12,
      padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between",
      cursor: "pointer",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10, background: C.bgAlt,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${C.line}`,
        }}>
          <span style={{ fontFamily: "Teko", fontWeight: 700, fontSize: 16, color: C.text }}>{fmt?.id.toUpperCase()}</span>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "Manrope", fontWeight: 700, fontSize: 14, color: C.text }}>{t.name}</span>
            {t.status === "live" && <Pill tone="live">Vivo</Pill>}
            {t.mode === "demo" && <Pill tone="demo">Demo</Pill>}
          </div>
          <span style={{ fontFamily: "Manrope", fontSize: 11, color: C.sub }}>
            <Clock size={10} style={{ marginBottom: -1, marginRight: 3 }} />{t.start} · {t.joined}/{t.slots} jugadores
            {t.platform && <> · <span style={{ color: PLATFORMS.find((p) => p.id === t.platform)?.color }}>{PLATFORMS.find((p) => p.id === t.platform)?.label}</span></>}
          </span>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <ScoreNum size={16} color={t.mode === "demo" ? C.amber : C.teal}>{t.mode === "demo" ? "Gratis" : `€${t.prize}`}</ScoreNum>
        <span style={{ fontFamily: "Manrope", fontSize: 10, color: C.sub, display: "block" }}>{t.mode === "demo" ? "Bote demo" : "Bote"}</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   TOURNAMENTS LIST (filter by format)
--------------------------------------------------------- */
function Tournaments({ tournaments, openTournament, balMode }) {
  const [filter, setFilter] = useState("all");
  const filtered = tournaments.filter((t) => t.mode === balMode && (filter === "all" || t.format === filter));

  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <h1 style={{ fontFamily: "Teko", fontWeight: 700, fontSize: 30, margin: "0 0 4px", color: C.text }}>Torneos</h1>
      <span style={{ fontFamily: "Manrope", fontSize: 12, color: C.sub }}>
        Mostrando modo {balMode === "real" ? "SALDO REAL" : "DEMO"}
      </span>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "14px 0 4px" }}>
        <FilterChip label="Todos" active={filter === "all"} onClick={() => setFilter("all")} />
        {FORMATS.map((f) => (
          <FilterChip key={f.id} label={f.label} active={filter === f.id} onClick={() => setFilter(f.id)} />
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: C.sub, fontFamily: "Manrope", fontSize: 13 }}>
            No hay torneos de este formato ahora mismo.
          </div>
        )}
        {filtered.map((t) => <TournamentRow key={t.id} t={t} onClick={() => openTournament(t)} />)}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      whiteSpace: "nowrap", padding: "7px 14px", borderRadius: 999,
      background: active ? C.green : C.card, border: `1px solid ${active ? C.green : C.line}`,
      color: active ? "#06140D" : C.sub, fontFamily: "Manrope", fontWeight: 800, fontSize: 12,
      cursor: "pointer",
    }}>{label}</button>
  );
}

/* ---------------------------------------------------------
   BRACKET VISUAL
--------------------------------------------------------- */
function Bracket({ size }) {
  const rounds = Math.log2(size);
  const roundData = [];
  let count = size;
  for (let r = 0; r < rounds; r++) {
    roundData.push(count / 2);
    count = count / 2;
  }
  const names = ["kdz_10", "nano_fc", "rive_pt", "elgoat22", "sanz.7", "draven_ok", "mia_ok", "juli_ux",
    "bx_leo", "toty22", "renzo_g", "vik_fc", "camz09", "ander.gg", "puchi7", "nox_dz"];

  return (
    <div style={{ display: "flex", gap: 20, overflowX: "auto", padding: "6px 2px 14px" }}>
      {roundData.map((matches, ri) => (
        <div key={ri} style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", gap: 14, minWidth: 130 }}>
          <span style={{ fontFamily: "Manrope", fontSize: 10, fontWeight: 800, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {matches === 1 ? "Final" : matches === 2 ? "Semis" : `Ronda ${ri + 1}`}
          </span>
          {Array.from({ length: matches }).map((_, mi) => {
            const p1 = names[(mi * 2) % names.length];
            const p2 = names[(mi * 2 + 1) % names.length];
            const decided = ri === 0;
            return (
              <div key={mi} style={{
                background: C.card, border: `1px solid ${C.line}`, borderRadius: 8,
                padding: "6px 10px", minWidth: 120,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                  <span style={{ fontFamily: "Manrope", fontSize: 11, color: decided ? C.teal : C.text, fontWeight: decided ? 800 : 600 }}>{p1}</span>
                  {decided && <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: C.teal }}>3</span>}
                </div>
                <div style={{ height: 1, background: C.line }} />
                <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                  <span style={{ fontFamily: "Manrope", fontSize: 11, color: C.sub }}>{p2}</span>
                  {decided && <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: C.sub }}>1</span>}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------
   TOURNAMENT DETAIL
--------------------------------------------------------- */
function TournamentDetail({ t, back, joined, join, goReport, accounts, setAccounts }) {
  const fmt = FORMATS.find((f) => f.id === t.format);
  const plat = PLATFORMS.find((p) => p.id === t.platform);
  const linked = accounts?.[t.platform]?.connected;
  const [showLink, setShowLink] = useState(false);
  const [draft, setDraft] = useState("");

  const handleJoinClick = () => {
    if (t.mode === "real" && !linked) { setShowLink(true); return; }
    join();
  };

  const confirmLink = () => {
    if (!draft.trim()) return;
    setAccounts((a) => ({ ...a, [t.platform]: { connected: true, username: draft.trim() } }));
    setShowLink(false);
    join();
  };

  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <button onClick={back} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: C.sub, fontFamily: "Manrope", fontSize: 12, marginBottom: 12 }}>
        <ChevronLeft size={16} /> Torneos
      </button>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <Pill tone={t.status === "live" ? "live" : "open"}>{t.status === "live" ? "En vivo" : "Inscripción abierta"}</Pill>
        {t.mode === "demo" && <Pill tone="demo">Demo</Pill>}
        {plat && (
          <span style={{
            display: "flex", alignItems: "center", gap: 4, fontFamily: "Manrope", fontSize: 11, fontWeight: 700,
            color: plat.color, background: plat.bg, border: `1px solid ${plat.color}`, borderRadius: 999, padding: "3px 9px",
          }}>
            <plat.icon size={11} /> {plat.label}
          </span>
        )}
      </div>
      <h1 style={{ fontFamily: "Teko", fontWeight: 700, fontSize: 32, margin: "0 0 4px", color: C.text }}>{t.name}</h1>
      <span style={{ fontFamily: "Manrope", fontSize: 12, color: C.sub }}>{fmt?.label} · Empieza {t.start}</span>

      <div style={{ display: "flex", gap: 10, margin: "16px 0" }}>
        <Stat label="Bote total" value={t.mode === "demo" ? "—" : `€${t.prize}`} color={C.amber} />
        <Stat label="Entrada" value={t.mode === "demo" ? "Gratis" : `€${t.fee}`} color={C.text} />
        <Stat label="Cupos" value={`${t.joined}/${t.slots}`} color={C.teal} />
      </div>
      {t.mode === "real" && (
        <p style={{ fontFamily: "Manrope", fontSize: 11, color: C.sub, margin: "-8px 0 4px" }}>
          El bote ya descuenta el 5% de comisión de la plataforma sobre las inscripciones.
        </p>
      )}

      <SectionTitle>Bracket</SectionTitle>
      <Bracket size={fmt?.size || 2} />

      <SectionTitle>Reglas rápidas</SectionTitle>
      <ul style={{ fontFamily: "Manrope", fontSize: 13, color: C.sub, lineHeight: 1.7, paddingLeft: 18, margin: 0 }}>
        <li>Duración de partido: 6 minutos por mitad, dificultad Leyenda.</li>
        <li>Ambos jugadores suben captura del marcador final.</li>
        <li>Desconexión antes del min. 60 = derrota para quien se desconecta.</li>
        <li>Cualquier discrepancia se resuelve en Disputas por el árbitro.</li>
        {plat && <li>Se juega en <strong style={{ color: C.text }}>{plat.label}</strong>: tu usuario/gamertag vinculado se usa para verificar el resultado.</li>}
      </ul>

      <div style={{ position: "sticky", bottom: 76, marginTop: 20, display: "flex", gap: 10 }}>
        {!joined ? (
          <button onClick={handleJoinClick} style={{
            flex: 1, background: C.green, border: "none", borderRadius: 12, padding: "14px 0",
            color: "#06140D", fontFamily: "Manrope", fontWeight: 800, fontSize: 14, cursor: "pointer",
            boxShadow: `0 0 20px -6px ${C.green}`,
          }}>
            {t.mode === "demo" ? "Unirme (Demo)" : `Unirme · €${t.fee}`}
          </button>
        ) : (
          <button onClick={goReport} style={{
            flex: 1, background: C.card, border: `1px solid ${C.teal}`, borderRadius: 12, padding: "14px 0",
            color: C.teal, fontFamily: "Manrope", fontWeight: 800, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <Upload size={15} /> Reportar resultado
          </button>
        )}
      </div>

      {showLink && plat && (
        <Modal onClose={() => setShowLink(false)}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: plat.bg, border: `1px solid ${plat.color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <plat.icon size={15} color={plat.color} />
            </div>
            <h3 style={{ fontFamily: "Teko", fontSize: 22, color: C.text, margin: 0 }}>Vincula tu {plat.label}</h3>
          </div>
          <p style={{ fontFamily: "Manrope", fontSize: 12, color: C.sub, margin: "6px 0 14px" }}>
            Necesitamos tu usuario/gamertag de {plat.label} para poder verificar quién ganó este torneo con dinero real.
          </p>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t.platform === "pc" ? "Usuario de Steam" : `Gamertag de ${plat.label}`}
            style={{
              width: "100%", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10,
              padding: "12px 14px", color: C.text, fontFamily: "JetBrains Mono", fontSize: 13,
              outline: "none", marginBottom: 14,
            }}
          />
          <button onClick={confirmLink} style={{
            width: "100%", background: C.green, border: "none", borderRadius: 12, padding: "13px 0",
            color: "#06140D", fontFamily: "Manrope", fontWeight: 800, fontSize: 14, cursor: "pointer",
          }}>
            Vincular y unirme · €{t.fee}
          </button>
        </Modal>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ flex: 1, background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 12px" }}>
      <span style={{ fontFamily: "Manrope", fontSize: 10, color: C.sub, display: "block", marginBottom: 2 }}>{label}</span>
      <ScoreNum size={17} color={color}>{value}</ScoreNum>
    </div>
  );
}

/* ---------------------------------------------------------
   WALLET
--------------------------------------------------------- */
function WalletScreen({ real, demo, setReal, setDemo, history, setHistory }) {
  const [showRecharge, setShowRecharge] = useState(false);
  const [method, setMethod] = useState("paypal");
  const [amount, setAmount] = useState(20);
  const [card, setCard] = useState({ number: "", exp: "", cvv: "" });

  const cardValid = card.number.replace(/\s/g, "").length >= 16 && card.exp.length === 5 && card.cvv.length >= 3;

  const confirmRecharge = () => {
    const label = method === "paypal" ? "Recarga PayPal" : "Recarga tarjeta ····" + card.number.slice(-4);
    setReal((v) => v + amount);
    setHistory((h) => [{ id: Date.now(), type: label, amount, ts: "Ahora" }, ...h]);
    setShowRecharge(false);
    setCard({ number: "", exp: "", cvv: "" });
  };

  const formatCardNumber = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExp = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <h1 style={{ fontFamily: "Teko", fontWeight: 700, fontSize: 30, margin: "0 0 14px", color: C.text }}>Cartera</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <BalanceCard mode="real" setMode={() => {}} real={real} demo={demo} />
        <div style={{
          borderRadius: 14, padding: "14px 16px",
          background: `linear-gradient(135deg, ${C.amberDim}, #1A160B)`,
          border: `1px solid ${C.amber}`,
        }}>
          <span style={{ fontFamily: "Manrope", fontSize: 11, fontWeight: 800, color: C.amber, textTransform: "uppercase" }}>Saldo demo</span>
          <ScoreNum size={26}>{demo.toFixed(0)} DC</ScoreNum>
          <span style={{ fontFamily: "Manrope", fontSize: 11, color: C.sub, display: "block", marginTop: 2 }}>Sin valor real · solo práctica</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button onClick={() => { setMethod("paypal"); setShowRecharge(true); }} style={{
          flex: 1, background: C.green, border: "none", borderRadius: 12, padding: "13px 0",
          color: "#06140D", fontFamily: "Manrope", fontWeight: 800, fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          boxShadow: `0 0 20px -6px ${C.green}`,
        }}>
          <CreditCard size={15} /> Recargar saldo
        </button>
        <button onClick={() => setDemo((v) => v + 500)} style={{
          flex: 1, background: C.card, border: `1px solid ${C.amber}`, borderRadius: 12, padding: "13px 0",
          color: C.amber, fontFamily: "Manrope", fontWeight: 800, fontSize: 13, cursor: "pointer",
        }}>
          + 500 DC demo
        </button>
      </div>

      <SectionTitle>Movimientos</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {history.map((h) => (
          <div key={h.id} style={{ display: "flex", justifyContent: "space-between", background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px" }}>
            <div>
              <span style={{ fontFamily: "Manrope", fontSize: 13, color: C.text, fontWeight: 700, display: "block" }}>{h.type}</span>
              <span style={{ fontFamily: "Manrope", fontSize: 11, color: C.sub }}>{h.ts}</span>
            </div>
            <ScoreNum size={15} color={h.amount > 0 ? C.green : "#FF8A93"}>{h.amount > 0 ? "+" : ""}€{h.amount}</ScoreNum>
          </div>
        ))}
      </div>

      {showRecharge && (
        <Modal onClose={() => setShowRecharge(false)}>
          <h3 style={{ fontFamily: "Teko", fontSize: 24, color: C.text, margin: "0 0 4px" }}>Recargar saldo</h3>
          <p style={{ fontFamily: "Manrope", fontSize: 12, color: C.sub, margin: "0 0 14px" }}>
            Flujo simulado — un pago real requiere una pasarela autorizada para pagos de torneos.
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <MethodTab active={method === "paypal"} onClick={() => setMethod("paypal")} label="PayPal" />
            <MethodTab active={method === "card"} onClick={() => setMethod("card")} label="Tarjeta débito/crédito" />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, margin: "6px 0 18px" }}>
            <button onClick={() => setAmount((a) => Math.max(5, a - 5))} style={circleBtn}><Minus size={16} color={C.text} /></button>
            <ScoreNum size={34} color={C.green}>€{amount}</ScoreNum>
            <button onClick={() => setAmount((a) => a + 5)} style={circleBtn}><Plus size={16} color={C.text} /></button>
          </div>

          {method === "card" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              <CardInput label="Número de tarjeta" placeholder="0000 0000 0000 0000" value={card.number}
                onChange={(v) => setCard((c) => ({ ...c, number: formatCardNumber(v) }))} icon={<CreditCard size={14} color={C.sub} />} />
              <div style={{ display: "flex", gap: 10 }}>
                <CardInput label="MM/AA" placeholder="MM/AA" value={card.exp}
                  onChange={(v) => setCard((c) => ({ ...c, exp: formatExp(v) }))} />
                <CardInput label="CVV" placeholder="123" value={card.cvv}
                  onChange={(v) => setCard((c) => ({ ...c, cvv: v.replace(/\D/g, "").slice(0, 4) }))} />
              </div>
            </div>
          )}

          <button
            onClick={confirmRecharge}
            disabled={method === "card" && !cardValid}
            style={{
              width: "100%",
              background: method === "paypal" ? "#0070BA" : (cardValid ? C.green : C.line),
              border: "none", borderRadius: 12, padding: "13px 0",
              color: method === "paypal" ? "#fff" : (cardValid ? "#06140D" : C.sub),
              fontFamily: "Manrope", fontWeight: 800, fontSize: 14,
              cursor: method === "card" && !cardValid ? "not-allowed" : "pointer",
            }}
          >
            {method === "paypal" ? "Pagar con PayPal" : "Pagar con tarjeta"}
          </button>
        </Modal>
      )}
    </div>
  );
}

function MethodTab({ active, onClick, label }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, cursor: "pointer", padding: "10px 8px", borderRadius: 10,
      background: active ? C.greenDim : C.bg, border: `1px solid ${active ? C.green : C.line}`,
      color: active ? C.green : C.sub, fontFamily: "Manrope", fontWeight: 700, fontSize: 12,
    }}>{label}</button>
  );
}

function CardInput({ label, placeholder, value, onChange, icon }) {
  return (
    <div style={{ flex: 1 }}>
      <span style={{ fontFamily: "Manrope", fontSize: 10, color: C.sub, display: "block", marginBottom: 4 }}>{label}</span>
      <div style={{
        display: "flex", alignItems: "center", gap: 6, background: C.bg, border: `1px solid ${C.line}`,
        borderRadius: 10, padding: "10px 12px",
      }}>
        {icon}
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1, background: "none", border: "none", outline: "none",
            color: C.text, fontFamily: "JetBrains Mono", fontSize: 13,
          }}
        />
      </div>
    </div>
  );
}

const circleBtn = {
  width: 34, height: 34, borderRadius: "50%", background: C.card, border: `1px solid ${C.line}`,
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
};

function Modal({ children, onClose }) {
  return (
    <div style={{
      position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "flex-end", zIndex: 20,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", background: C.bgAlt, borderTop: `1px solid ${C.line}`,
        borderRadius: "18px 18px 0 0", padding: "20px 18px 26px", position: "relative",
      }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer" }}>
          <X size={18} color={C.sub} />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   VERIFICATION (EU / LatAm)
--------------------------------------------------------- */
function Verify({ verified, setVerified, back }) {
  const [region, setRegion] = useState("EU");
  const [step, setStep] = useState(verified ? 3 : 0);

  const docsByRegion = {
    EU: ["DNI / NIE", "Pasaporte", "Permiso de conducir (UE)"],
    LATAM: ["Cédula / INE / DNI nacional", "Pasaporte", "Cédula de extranjería"],
  };

  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <button onClick={back} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: C.sub, fontFamily: "Manrope", fontSize: 12, marginBottom: 12 }}>
        <ChevronLeft size={16} /> Perfil
      </button>
      <h1 style={{ fontFamily: "Teko", fontWeight: 700, fontSize: 30, margin: "0 0 4px", color: C.text }}>Verificación de identidad</h1>
      <p style={{ fontFamily: "Manrope", fontSize: 12, color: C.sub, margin: "0 0 18px" }}>
        Necesaria para retirar saldo real y participar en torneos con premio en efectivo.
      </p>

      {step === 3 ? (
        <div style={{ background: C.tealDim, border: `1px solid ${C.teal}`, borderRadius: 14, padding: 18, textAlign: "center" }}>
          <ShieldCheck size={30} color={C.teal} style={{ marginBottom: 8 }} />
          <h3 style={{ fontFamily: "Teko", fontSize: 22, color: C.text, margin: "0 0 4px" }}>Cuenta verificada</h3>
          <span style={{ fontFamily: "Manrope", fontSize: 12, color: C.sub }}>Región: {region === "EU" ? "Unión Europea" : "Latinoamérica"}</span>
        </div>
      ) : (
        <>
          <span style={{ fontFamily: "Manrope", fontSize: 11, fontWeight: 800, color: C.sub, textTransform: "uppercase" }}>Selecciona tu región</span>
          <div style={{ display: "flex", gap: 10, margin: "8px 0 18px" }}>
            <RegionCard label="Europa" icon={<MapPin size={16} />} active={region === "EU"} onClick={() => setRegion("EU")} />
            <RegionCard label="Latinoamérica" icon={<MapPin size={16} />} active={region === "LATAM"} onClick={() => setRegion("LATAM")} />
          </div>

          {step === 0 && (
            <StepCard title="Paso 1 · Documento de identidad" desc={`Formatos aceptados: ${docsByRegion[region].join(", ")}.`} cta="Subir documento" onNext={() => setStep(1)} />
          )}
          {step === 1 && (
            <StepCard title="Paso 2 · Selfie de verificación" desc="Foto en vivo para comparar con tu documento (prueba de vida)." cta="Tomar selfie" onNext={() => setStep(2)} />
          )}
          {step === 2 && (
            <StepCard title="Paso 3 · Confirmación de datos" desc="Nombre completo, fecha de nacimiento y dirección según tu documento." cta="Enviar a revisión" onNext={() => { setStep(3); setVerified(true); }} />
          )}

          <p style={{ fontFamily: "Manrope", fontSize: 11, color: C.sub, marginTop: 18, lineHeight: 1.6 }}>
            Nota: este flujo es una simulación de KYC. Una verificación real de identidad para dinero real normalmente se
            procesa con un proveedor certificado (p. ej. verificación de documento + biometría) conforme a las normas de cada país.
          </p>
        </>
      )}
    </div>
  );
}

function RegionCard({ label, icon, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, cursor: "pointer", padding: "12px 10px", borderRadius: 12,
      background: active ? C.greenDim : C.card, border: `1px solid ${active ? C.green : C.line}`,
      color: active ? C.text : C.sub, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      fontFamily: "Manrope", fontWeight: 700, fontSize: 12,
    }}>
      {icon}{label}
    </button>
  );
}

function StepCard({ title, desc, cta, onNext }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
      <h3 style={{ fontFamily: "Teko", fontSize: 20, color: C.text, margin: "0 0 4px" }}>{title}</h3>
      <p style={{ fontFamily: "Manrope", fontSize: 12, color: C.sub, margin: "0 0 14px", lineHeight: 1.5 }}>{desc}</p>
      <button onClick={onNext} style={{
        width: "100%", background: C.green, border: "none", borderRadius: 10, padding: "11px 0",
        color: "#06140D", fontFamily: "Manrope", fontWeight: 800, fontSize: 13, cursor: "pointer",
      }}>{cta}</button>
    </div>
  );
}

/* ---------------------------------------------------------
   REPORT RESULT
--------------------------------------------------------- */
function ReportResult({ t, back, fileDispute }) {
  const [scoreA, setScoreA] = useState(3);
  const [scoreB, setScoreB] = useState(1);
  const [uploaded, setUploaded] = useState(false);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div style={{ padding: "18px 16px 90px", textAlign: "center" }}>
        <Check size={34} color={C.teal} style={{ marginTop: 60 }} />
        <h2 style={{ fontFamily: "Teko", fontSize: 26, color: C.text, margin: "10px 0 4px" }}>Resultado enviado</h2>
        <p style={{ fontFamily: "Manrope", fontSize: 12, color: C.sub }}>Se confirma cuando tu rival también reporte, o el árbitro lo valide.</p>
        <button onClick={back} style={{ marginTop: 20, background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 18px", color: C.text, fontFamily: "Manrope", fontWeight: 700, cursor: "pointer" }}>Volver</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <button onClick={back} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: C.sub, fontFamily: "Manrope", fontSize: 12, marginBottom: 12 }}>
        <ChevronLeft size={16} /> {t.name}
      </button>
      <h1 style={{ fontFamily: "Teko", fontWeight: 700, fontSize: 28, margin: "0 0 16px", color: C.text }}>Reportar resultado</h1>

      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>
          <ScoreBox name="kdz_10 (tú)" value={scoreA} setValue={setScoreA} />
          <span style={{ fontFamily: "Teko", fontSize: 22, color: C.sub }}>VS</span>
          <ScoreBox name="nano_fc" value={scoreB} setValue={setScoreB} />
        </div>
      </div>

      <div
        onClick={() => setUploaded(true)}
        style={{
          marginTop: 14, border: `1.5px dashed ${uploaded ? C.teal : C.line}`, borderRadius: 14,
          padding: 22, textAlign: "center", cursor: "pointer",
          background: uploaded ? C.tealDim : "transparent",
        }}
      >
        <Upload size={22} color={uploaded ? C.teal : C.sub} />
        <p style={{ fontFamily: "Manrope", fontSize: 12, color: uploaded ? C.teal : C.sub, margin: "8px 0 0" }}>
          {uploaded ? "Captura subida ✓" : "Sube captura del marcador final"}
        </p>
      </div>

      <button
        disabled={!uploaded}
        onClick={() => setSent(true)}
        style={{
          width: "100%", marginTop: 16, background: uploaded ? C.green : C.line, border: "none",
          borderRadius: 12, padding: "13px 0", color: uploaded ? "#06140D" : C.sub,
          fontFamily: "Manrope", fontWeight: 800, fontSize: 14, cursor: uploaded ? "pointer" : "not-allowed",
        }}
      >
        Confirmar resultado
      </button>

      <button
        onClick={() => { fileDispute(t); back(); }}
        style={{
          width: "100%", marginTop: 10, background: "none", border: `1px solid ${C.red}`,
          borderRadius: 12, padding: "12px 0", color: C.red,
          fontFamily: "Manrope", fontWeight: 800, fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}
      >
        <Flag size={14} /> No estoy de acuerdo, abrir disputa
      </button>
    </div>
  );
}

function ScoreBox({ name, value, setValue }) {
  return (
    <div style={{ textAlign: "center" }}>
      <span style={{ fontFamily: "Manrope", fontSize: 11, color: C.sub, display: "block", marginBottom: 6 }}>{name}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setValue((v) => Math.max(0, v - 1))} style={circleBtn}><Minus size={14} color={C.text} /></button>
        <ScoreNum size={30}>{value}</ScoreNum>
        <button onClick={() => setValue((v) => v + 1)} style={circleBtn}><Plus size={14} color={C.text} /></button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   DISPUTES / ARBITRAJE
--------------------------------------------------------- */
function Disputes({ disputes, resolve, isAdmin }) {
  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <h1 style={{ fontFamily: "Teko", fontWeight: 700, fontSize: 30, margin: "0 0 4px", color: C.text }}>
        {isAdmin ? "Panel de arbitraje" : "Mis disputas"}
      </h1>
      <span style={{ fontFamily: "Manrope", fontSize: 12, color: C.sub }}>
        {isAdmin ? "Revisa pruebas y resuelve como administrador." : "Reclamos abiertos sobre tus partidas."}
      </span>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {disputes.map((d) => (
          <div key={d.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 13, color: C.text }}>{d.players}</span>
                <span style={{ fontFamily: "Manrope", fontSize: 11, color: C.sub, display: "block" }}>{d.tournament}</span>
              </div>
              <Pill tone={d.status === "pendiente" ? "warn" : "open"}>{d.status}</Pill>
            </div>
            <p style={{ fontFamily: "Manrope", fontSize: 12, color: C.sub, margin: "8px 0" }}>{d.reason}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: isAdmin && d.status === "pendiente" ? 10 : 0 }}>
              {d.proof ? (
                <span style={{ fontFamily: "Manrope", fontSize: 11, color: C.teal, display: "flex", alignItems: "center", gap: 4 }}><Check size={12} /> Prueba adjunta</span>
              ) : (
                <span style={{ fontFamily: "Manrope", fontSize: 11, color: C.sub, display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={12} /> Sin prueba</span>
              )}
            </div>
            {isAdmin && d.status === "pendiente" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => resolve(d.id, "A")} style={{ flex: 1, background: C.tealDim, border: `1px solid ${C.teal}`, color: C.teal, borderRadius: 8, padding: "8px 0", fontFamily: "Manrope", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  A favor de {d.players.split(" vs ")[0]}
                </button>
                <button onClick={() => resolve(d.id, "B")} style={{ flex: 1, background: C.redDim, border: `1px solid ${C.red}`, color: "#FF8A8F", borderRadius: 8, padding: "8px 0", fontFamily: "Manrope", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  A favor de {d.players.split(" vs ")[1]}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   PROFILE / ADMIN
--------------------------------------------------------- */
function Profile({ verified, isAdmin, setIsAdmin, setScreen, accounts }) {
  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <h1 style={{ fontFamily: "Teko", fontWeight: 700, fontSize: 30, margin: "0 0 16px", color: C.text }}>Perfil</h1>

      <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.greenDim, border: `1px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "Teko", fontSize: 22, color: C.green, fontWeight: 700 }}>KZ</span>
        </div>
        <div>
          <span style={{ fontFamily: "Manrope", fontWeight: 800, fontSize: 15, color: C.text, display: "block" }}>KDZ_10</span>
          <Pill tone={verified ? "open" : "warn"}>{verified ? "Verificado" : "Sin verificar"}</Pill>
        </div>
      </div>

      <SectionTitle>Plataformas vinculadas</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PLATFORMS.map((p) => {
          const acc = accounts?.[p.id];
          return (
            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: p.bg, border: `1px solid ${p.color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p.icon size={15} color={p.color} />
                </div>
                <div>
                  <span style={{ fontFamily: "Manrope", fontSize: 13, color: C.text, fontWeight: 700, display: "block" }}>{p.label}</span>
                  <span style={{ fontFamily: "Manrope", fontSize: 11, color: C.sub }}>{acc?.connected ? acc.username : "No vinculada"}</span>
                </div>
              </div>
              {acc?.connected ? <Check size={16} color={C.green} /> : <Pill tone="warn">Pendiente</Pill>}
            </div>
          );
        })}
      </div>

      <SectionTitle>Cuenta</SectionTitle>
      <ProfileRow icon={<ShieldCheck size={16} />} label="Verificación de identidad" onClick={() => setScreen("verify")} />
      <ProfileRow icon={<Trophy size={16} />} label="Historial de torneos" />
      <ProfileRow icon={<Users size={16} />} label="Invitar amigos" />

      <SectionTitle>Administración</SectionTitle>
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Lock size={16} color={C.sub} />
          <span style={{ fontFamily: "Manrope", fontSize: 13, color: C.text, fontWeight: 700 }}>Modo administrador</span>
        </div>
        <button onClick={() => setIsAdmin((v) => !v)} style={{
          width: 42, height: 24, borderRadius: 999, border: "none", cursor: "pointer",
          background: isAdmin ? C.green : C.line, position: "relative",
        }}>
          <div style={{
            position: "absolute", top: 2, left: isAdmin ? 20 : 2, width: 20, height: 20,
            borderRadius: "50%", background: "#fff", transition: "left 0.15s",
          }} />
        </button>
      </div>
      {isAdmin && (
        <p style={{ fontFamily: "Manrope", fontSize: 11, color: C.sub, marginTop: 8, lineHeight: 1.6 }}>
          Con el modo admin activo, la pestaña Disputas se convierte en tu panel de arbitraje para resolver reclamos.
        </p>
      )}
    </div>
  );
}

function ProfileRow({ icon, label, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: C.card, border: `1px solid ${C.line}`, borderRadius: 12,
      padding: "12px 14px", marginBottom: 8, cursor: onClick ? "pointer" : "default",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: C.sub }}>{icon}</span>
        <span style={{ fontFamily: "Manrope", fontSize: 13, color: C.text, fontWeight: 600 }}>{label}</span>
      </div>
      <ChevronRight size={16} color={C.sub} />
    </div>
  );
}

/* ---------------------------------------------------------
   BRAND WORDMARK
--------------------------------------------------------- */
function Logo({ size = 20 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <div style={{
        width: size + 6, height: size + 6, borderRadius: 8,
        background: `linear-gradient(135deg, ${C.greenDim}, ${C.bg})`,
        border: `1px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 12px -4px ${C.green}`,
      }}>
        <Zap size={size * 0.6} color={C.green} fill={C.green} />
      </div>
      <span style={{ fontFamily: "Teko", fontWeight: 700, fontSize: size + 8, letterSpacing: 0.5, color: C.text, lineHeight: 1 }}>
        EKAIN<span style={{ color: C.green }}>BET</span>
      </span>
    </div>
  );
}

function TopBar({ verified }) {
  return (
    <div style={{
      height: 50, minHeight: 50, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 16px", background: C.bgAlt, borderBottom: `1px solid ${C.line}`,
    }}>
      <Logo />
      {verified && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <ShieldCheck size={14} color={C.green} />
          <span style={{ fontFamily: "Manrope", fontSize: 10, fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: 0.4 }}>Verificado</span>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   FLOATING PLATFORM CONNECT BUTTONS
   Genéricos (no logos oficiales con licencia) — identificados por
   texto + color de marca de cada plataforma.
--------------------------------------------------------- */
function PlatformFab({ accounts, setAccounts }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");

  const startEdit = (id) => { setEditing(id); setDraft(accounts[id]?.username || ""); };
  const save = (id) => {
    if (!draft.trim()) return;
    setAccounts((a) => ({ ...a, [id]: { connected: true, username: draft.trim() } }));
    setEditing(null);
  };

  return (
    <div style={{
      position: "absolute", right: 16, bottom: 84, zIndex: 15,
      display: "flex", flexDirection: "column-reverse", alignItems: "flex-end", gap: 12,
    }}>
      {PLATFORMS.map((p, i) => {
        const Icon = p.icon;
        const acc = accounts[p.id];
        const isEditing = editing === p.id;
        return (
          <div key={p.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            opacity: open ? 1 : 0, transform: open ? "translateY(0) scale(1)" : "translateY(14px) scale(0.7)",
            transition: `all 0.24s cubic-bezier(.34,1.56,.64,1) ${open ? i * 0.05 : 0}s`,
            pointerEvents: open ? "auto" : "none",
          }}>
            {isEditing ? (
              <div style={{
                display: "flex", alignItems: "center", gap: 6, background: C.card,
                border: `1px solid ${p.color}`, borderRadius: 10, padding: "5px 6px 5px 10px",
              }}>
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && save(p.id)}
                  placeholder={p.id === "pc" ? "Usuario de Steam" : `Gamertag ${p.label}`}
                  style={{ background: "none", border: "none", outline: "none", color: C.text, fontFamily: "Manrope", fontSize: 12, width: 118 }}
                />
                <button onClick={() => save(p.id)} style={{ background: p.color, border: "none", borderRadius: 6, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Check size={13} color="#081018" />
                </button>
              </div>
            ) : (
              <span
                onClick={() => startEdit(p.id)}
                style={{
                  fontFamily: "Manrope", fontSize: 11, fontWeight: 800, color: C.text,
                  background: C.card, border: `1px solid ${C.line}`, borderRadius: 8,
                  padding: "5px 10px", whiteSpace: "nowrap", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                {acc?.connected ? acc.username : `Vincular ${p.label}`}
                {acc?.connected && <Check size={11} color={C.green} />}
              </span>
            )}
            <button
              onClick={() => (acc?.connected ? startEdit(p.id) : startEdit(p.id))}
              style={{
                width: 46, height: 46, borderRadius: "50%", cursor: "pointer",
                background: p.bg, border: `1.5px solid ${acc?.connected ? C.green : p.color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: acc?.connected ? `0 0 16px -4px ${C.green}` : `0 4px 14px rgba(0,0,0,0.4)`,
              }}
            >
              <Icon size={19} color={acc?.connected ? C.green : p.color} />
            </button>
          </div>
        );
      })}

      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 56, height: 56, borderRadius: "50%", cursor: "pointer", border: "none",
          background: `linear-gradient(135deg, ${C.green}, #14C46B)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 6px 22px -4px ${C.green}`,
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          transition: "transform 0.25s ease",
        }}
      >
        <Plus size={24} color="#06140D" strokeWidth={2.6} />
      </button>
    </div>
  );
}


export default function App() {
  const [screen, setScreen] = useState("home");
  const [balMode, setBalMode] = useState("real");
  const [real, setReal] = useState(35.5);
  const [demo, setDemo] = useState(1000);
  const [verified, setVerified] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [tournaments] = useState(seedTournaments);
  const [selected, setSelected] = useState(null);
  const [joinedIds, setJoinedIds] = useState([]);
  const [disputes, setDisputes] = useState(seedDisputes);
  const [accounts, setAccounts] = useState({
    ps5: { connected: false, username: "" },
    xbox: { connected: false, username: "" },
    pc: { connected: false, username: "" },
  });
  const [history, setHistory] = useState([
    { id: 1, type: "Premio · Copa Relámpago", amount: 40, ts: "Ayer" },
    { id: 2, type: "Recarga PayPal", amount: 20, ts: "Hace 2 días" },
    { id: 3, type: "Entrada · Noche de Clásicos", amount: -5, ts: "Hace 3 días" },
  ]);

  const openTournament = (t) => { setSelected(t); setScreen("detail"); };
  const join = () => { setJoinedIds((j) => [...j, selected.id]); if (selected.mode === "real") setReal((v) => v - selected.fee); };
  const resolveDispute = (id, winner) => setDisputes((ds) => ds.map((d) => d.id === id ? { ...d, status: "resuelta" } : d));
  const fileDispute = (t) => setDisputes((ds) => [{ id: "d" + Date.now(), tournament: t.name, players: "kdz_10 vs nano_fc", reason: "Marcador reportado no coincide", status: "pendiente", proof: true }, ...ds]);

  const screens = {
    home: <Home setScreen={setScreen} balMode={balMode} setBalMode={setBalMode} real={real} demo={demo} tournaments={tournaments} openTournament={openTournament} verified={verified} />,
    tournaments: <Tournaments tournaments={tournaments} openTournament={openTournament} balMode={balMode} />,
    detail: selected && <TournamentDetail t={selected} back={() => setScreen("tournaments")} joined={joinedIds.includes(selected.id)} join={join} goReport={() => setScreen("report")} accounts={accounts} setAccounts={setAccounts} />,
    report: selected && <ReportResult t={selected} back={() => setScreen("detail")} fileDispute={fileDispute} />,
    wallet: <WalletScreen real={real} demo={demo} setReal={setReal} setDemo={setDemo} history={history} setHistory={setHistory} />,
    disputes: <Disputes disputes={disputes} resolve={resolveDispute} isAdmin={isAdmin} />,
    profile: <Profile verified={verified} isAdmin={isAdmin} setIsAdmin={setIsAdmin} setScreen={setScreen} accounts={accounts} />,
    verify: <Verify verified={verified} setVerified={setVerified} back={() => setScreen("profile")} />,
  };

  return (
    <div style={{
      width: "100%", maxWidth: 420, height: 840, margin: "0 auto", position: "relative",
      background: C.bg, borderRadius: 28, overflow: "hidden", border: `1px solid ${C.line}`,
      boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
    }}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        div::-webkit-scrollbar { display: none; }
      `}</style>
      <TopBar verified={verified} />
      <div style={{ height: "calc(100% - 50px - 66px)", overflowY: "auto" }}>
        {screens[screen]}
      </div>
      <PlatformFab accounts={accounts} setAccounts={setAccounts} />
      <BottomNav screen={screen} setScreen={setScreen} isAdmin={isAdmin} />
    </div>
  );
}
