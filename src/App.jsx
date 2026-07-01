import React, { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm"; // <--- Añade esta línea aquí
/* ---------------------------------------------------------
   DATA HELPERS
--------------------------------------------------------- */
import React, { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import {
  Trophy, Users, Plus, User, ChevronLeft, CreditCard, Wallet,
  CheckCircle2, Clock, ShieldCheck, X, AlertCircle, Lock,
  Loader2, Gamepad2, Monitor, Link2, Check, Coins, RefreshCw
} from "lucide-react";
const NAME_POOL = [
  "CR_Pro99", "ElMago10", "Nano_FC", "Reus_King", "ManoDeDios",
  "Pichichi22", "ZonaMixta", "Galactico7", "ElNueve", "Capitan_K",
  "Furia_Roja", "TacoFC", "Rabona99", "ElCanterano", "Trivela_X",
];

function pickName(i) {
  return NAME_POOL[i % NAME_POOL.length];
}

function roundNamesFor(size) {
  const order = ["Final", "Semifinal", "Cuartos de final", "Octavos de final", "Dieciseisavos de final"];
  const roundsCount = Math.log2(size);
  const rounds = [];
  for (let i = 0; i < roundsCount; i++) {
    rounds.push(order[roundsCount - 1 - i] || `Ronda ${i + 1}`);
  }
  return rounds;
}

function generateBracket(size, userInIt = true) {
  const names = roundNamesFor(size);
  const rounds = names.map((name, ri) => {
    const matchCount = size / Math.pow(2, ri + 1);
    const matches = Array.from({ length: matchCount }).map((_, mi) => {
      const id = `r${ri}m${mi}`;
      if (ri === 0) {
        const isUserMatch = userInIt && mi === 0;
        const p1 = isUserMatch ? "Tú" : pickName(mi * 2);
        const p2 = pickName(mi * 2 + 1);
        if (mi === 1 && size > 2) {
          return { id, p1, p2, score1: 3, score2: 1, status: "completed" };
        }
        if (isUserMatch) {
          return { id, p1, p2, score1: null, score2: null, status: "live" };
        }
        return { id, p1, p2, score1: null, score2: null, status: "pending" };
      }
      return { id, p1: "Por determinar", p2: "Por determinar", score1: null, score2: null, status: "waiting" };
    });
    return { name, matches };
  });
  return rounds;
}

const INITIAL_TOURNAMENTS = [
  { id: 1, name: "Clásico Nocturno", size: 8, fee: 120, filled: 6, closesIn: "2h", live: true },
  { id: 2, name: "Reto Relámpago", size: 2, fee: 60, filled: 1, closesIn: "30m", live: false },
  { id: 3, name: "Liga de Barrio", size: 16, fee: 150, filled: 11, closesIn: "5h", live: false },
  { id: 4, name: "Copa de los 32", size: 32, fee: 220, filled: 24, closesIn: "1d", live: false },
  { id: 5, name: "Duelo Directo", size: 2, fee: 40, filled: 2, closesIn: "Cerrado", live: false },
].map((t) => ({ ...t, bracket: generateBracket(t.size, t.id === 1) }));

const DEFAULT_PROFILE = {
  balance: 1250,
  stats: { played: 14, won: 6 },
  platforms: {
    ps5: { connected: false, tag: "" },
    xbox: { connected: false, tag: "" },
    pc: { connected: false, tag: "" },
  },
  history: [
    { id: 1, name: "Liga de Barrio", result: "win", amount: 1425 },
    { id: 2, name: "Reto Relámpago", result: "loss", amount: -500 },
    { id: 3, name: "Copa de los 32", result: "pending", amount: 0 },
  ],
};

const COIN_PACKAGES = [
  { id: "p1", coins: 500, bonus: 0, price: 4.99 },
  { id: "p2", coins: 1200, bonus: 150, price: 9.99 },
  { id: "p3", coins: 3000, bonus: 500, price: 19.99 },
];

const RC_PER_EURO = 10;

function coinsFmt(n) {
  const v = Math.round(Number(n) || 0);
  return v.toLocaleString("es-ES");
}
function eurosFmt(rc) {
  return (Number(rc || 0) / RC_PER_EURO).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€";
}
function formatSigned(n) {
  if (!n) return null;
  const sign = n > 0 ? "+" : "−";
  return `${sign}${coinsFmt(Math.abs(n))} RC`;
}
function poolOf(t) { return t.fee * t.size; }
function commissionOf(t) { return poolOf(t) * 0.05; }
function prizeOf(t) { return poolOf(t) - commissionOf(t); }

const PLATFORM_META = {
  ps5: { label: "PlayStation 5", icon: "Gamepad2", placeholder: "Tu PSN ID" },
  xbox: { label: "Xbox", icon: "Gamepad2", placeholder: "Tu Gamertag" },
  pc: { label: "PC (EA App)", icon: "Monitor", placeholder: "Tu EA ID" },
};

/* ---------------------------------------------------------
   THEME / FONTS
--------------------------------------------------------- */

const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700&display=swap');
  .font-display{font-family:'Chakra Petch',sans-serif; letter-spacing:0.02em;}
  .font-body{font-family:'Inter',sans-serif;}
  .font-mono{font-family:'JetBrains Mono',monospace;}
  .scrollbar-none::-webkit-scrollbar{display:none;}
  .scrollbar-none{-ms-overflow-style:none; scrollbar-width:none;}
  @keyframes pulseRing {
    0% { transform: scale(0.9); opacity: 0.85; }
    70% { transform: scale(2.4); opacity: 0; }
    100% { transform: scale(2.4); opacity: 0; }
  }
  .pulse-ring { animation: pulseRing 1.6s cubic-bezier(0.4,0,0.6,1) infinite; }
`;

/* ---------------------------------------------------------
   SMALL UI ATOMS
--------------------------------------------------------- */

function CoinBadge({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M12 1 L21.7 6.5 V17.5 L12 23 L2.3 17.5 V6.5 Z" fill="#FFC93C" stroke="#8A5A00" strokeWidth="0.7" />
      <text x="12" y="16.2" textAnchor="middle" fontSize="11" fontWeight="700" fill="#3D2600" fontFamily="'Chakra Petch',sans-serif">R</text>
    </svg>
  );
}

function CoinAmount({ value, size = "md", tone = "gold" }) {
  const sizes = { sm: "text-[12px] gap-1", md: "text-[15px] gap-1.5", lg: "text-[26px] gap-2" };
  const iconSize = { sm: 11, md: 14, lg: 20 }[size];
  const color = tone === "gold" ? "text-[#FFC93C]" : tone === "danger" ? "text-[#FF3B4E]" : "text-[#EAFBE9]";
  return (
    <span className={`inline-flex items-center font-mono font-semibold ${sizes[size]} ${color}`}>
      <CoinBadge size={iconSize} />
      {coinsFmt(value)}
    </span>
  );
}

function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`font-display shrink-0 px-3 py-1.5 rounded-md text-[13px] tracking-wide uppercase border transition-colors ${
        active
          ? "bg-[#39FF6A] text-[#050807] border-[#39FF6A]"
          : "bg-transparent text-[#7C9482] border-[#1C2B1E]"
      }`}
    >
      {children}
    </button>
  );
}

function Pill({ children, tone = "default" }) {
  const tones = {
    default: "bg-[#1C2B1E] text-[#7C9482]",
    live: "bg-[#FF3B4E]/15 text-[#FF3B4E]",
    gold: "bg-[#FFC93C]/15 text-[#FFC93C]",
    danger: "bg-[#FF3B4E]/15 text-[#FF3B4E]",
    brand: "bg-[#39FF6A]/15 text-[#39FF6A]",
  };
  return (
    <span className={`font-display inline-flex items-center gap-1.5 text-[11px] tracking-wider uppercase px-2 py-0.5 rounded ${tones[tone]}`}>
      {tone === "live" && (
        <span className="relative flex w-1.5 h-1.5">
          <span className="absolute inline-flex w-full h-full rounded-full bg-[#FF3B4E] pulse-ring" />
          <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-[#FF3B4E]" />
        </span>
      )}
      {children}
    </span>
  );
}

function TournamentCard({ t, onOpen }) {
  const pct = Math.round((t.filled / t.size) * 100);
  return (
    <button
      onClick={onOpen}
      className="w-full text-left bg-[#0B120D] border border-[#1C2B1E] rounded-xl p-4 active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {t.live && <Pill tone="live">En vivo</Pill>}
            <Pill>{t.size === 2 ? "1 vs 1" : `${t.size} jugadores`}</Pill>
          </div>
          <h3 className="font-display text-[17px] text-[#EAFBE9] font-medium leading-tight">{t.name}</h3>
        </div>
        <div className="text-right shrink-0 pl-3">
          <CoinAmount value={prizeOf(t)} size="lg" />
          <div className="text-[11px] text-[#7C9482] mt-0.5">premio</div>
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-[#050807] overflow-hidden mb-2">
        <div className="h-full bg-[#39FF6A]" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex items-center justify-between text-[12px] text-[#7C9482]">
        <span className="flex items-center gap-1"><Users size={12} /> {t.filled}/{t.size} inscritos</span>
        <span className="flex items-center gap-1"><Clock size={12} /> Cierra en {t.closesIn}</span>
        <span className="font-mono text-[#EAFBE9]">{coinsFmt(t.fee)} RC</span>
      </div>
    </button>
  );
}

function MatchCard({ m, onUpload }) {
  if (m.status === "completed") {
    return (
      <div className="bg-[#0B120D] border border-[#1C2B1E] rounded-lg px-3 py-2.5">
        <Row name={m.p1} score={m.score1} winner={m.score1 > m.score2} />
        <Row name={m.p2} score={m.score2} winner={m.score2 > m.score1} />
      </div>
    );
  }
  if (m.status === "live") {
    return (
      <div className="relative bg-[#140A0B] border border-[#FF3B4E]/40 rounded-lg px-3 py-2.5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,59,78,0.16),_transparent_70%)]" />
        <div className="relative flex items-center justify-between mb-2">
          <Pill tone="live">Tu partido</Pill>
        </div>
        <div className="relative">
          <Row name={m.p1} score="—" />
          <Row name={m.p2} score="—" />
        </div>
        <button
          onClick={onUpload}
          className="relative mt-2 w-full font-display text-[12px] uppercase tracking-wide bg-[#39FF6A] text-[#050807] rounded-md py-1.5 font-semibold"
        >
          Subir resultado
        </button>
      </div>
    );
  }
  if (m.status === "pending") {
    return (
      <div className="bg-[#0B120D]/60 border border-[#1C2B1E] rounded-lg px-3 py-2.5">
        <Row name={m.p1} score="—" dim />
        <Row name={m.p2} score="—" dim />
        <div className="text-[11px] text-[#7C9482] mt-1">Por jugar</div>
      </div>
    );
  }
  return (
    <div className="bg-[#0B120D]/30 border border-dashed border-[#1C2B1E] rounded-lg px-3 py-2.5">
      <div className="text-[12px] text-[#4B5F4E] font-display uppercase tracking-wide">Por determinar</div>
    </div>
  );
}

function Row({ name, score, winner, dim }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className={`font-body text-[13px] ${dim ? "text-[#4B5F4E]" : winner ? "text-[#EAFBE9] font-semibold" : "text-[#D8E5D4]"}`}>
        {name}
      </span>
      <span className={`font-mono text-[14px] ${winner ? "text-[#39FF6A]" : "text-[#7C9482]"}`}>{score}</span>
    </div>
  );
}

function Header({ title, onBack, balance }) {
  return (
    <div className="relative px-4 pt-5 pb-4 bg-[#050807]">
      <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,_rgba(57,255,106,0.14),_transparent_70%)] pointer-events-none" />
      <div className="relative flex items-center justify-between">
        {onBack ? (
          <button onClick={onBack} className="p-1 -ml-1 text-[#EAFBE9]"><ChevronLeft size={22} /></button>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-[20px] font-bold tracking-tight text-[#EAFBE9]">KINBET</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#39FF6A] mb-1" />
          </div>
        )}
        {title && <span className="font-display text-[15px] text-[#EAFBE9] uppercase tracking-wide">{title}</span>}
        {balance !== undefined ? (
          <div className="flex items-center gap-1.5 bg-[#0B120D] border border-[#1C2B1E] rounded-full px-2.5 py-1">
            <CoinAmount value={balance} size="sm" />
            <span className="text-[10px] text-[#4B5F4E] font-mono">· {eurosFmt(balance)}</span>
          </div>
        ) : onBack ? <div className="w-6" /> : <div className="w-6" />}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   MAIN APP
--------------------------------------------------------- */

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Nuevo estado para controlar el inicio
  const [tournaments, setTournaments] = useState(INITIAL_TOURNAMENTS);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  const [tab, setTab] = useState("list");
  const [stack, setStack] = useState(null); 
  const [filterSize, setFilterSize] = useState("all");
  const [resultModal, setResultModal] = useState(null); 
  const [scoreInputs, setScoreInputs] = useState({ a: "", b: "" });
  const [toast, setToast] = useState(null);
  const [paying, setPaying] = useState(false);
  const [linkModal, setLinkModal] = useState(null); 
  const [tagInput, setTagInput] = useState("");

  const [selectedPackage, setSelectedPackage] = useState("p2");
  const [payMethod, setPayMethod] = useState("paypal");
  const [buying, setBuying] = useState(false);

  const [form, setForm] = useState({ name: "", size: 8, feeEuro: 2 });

  /* ---------- PERSISTENCE ---------- */

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let t = INITIAL_TOURNAMENTS;
      let p = DEFAULT_PROFILE;
      try {
        const res = await window.storage.get("rival:tournaments", false);
        t = JSON.parse(res.value);
      } catch (e) {
        try { await window.storage.set("rival:tournaments", JSON.stringify(INITIAL_TOURNAMENTS), false); } catch (e2) {}
      }
      try {
        const res = await window.storage.get("rival:profile", false);
        p = JSON.parse(res.value);
      } catch (e) {
        try { await window.storage.set("rival:profile", JSON.stringify(DEFAULT_PROFILE), false); } catch (e2) {}
      }
      if (!cancelled) {
        setTournaments(t);
        setProfile(p);
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function persistTournaments(next) {
    setTournaments(next);
    try {
      await window.storage.set("rival:tournaments", JSON.stringify(next), false);
    } catch (e) {
      showToast("No se pudo guardar. Comprueba tu conexión.");
    }
  }

  async function persistProfile(next) {
    setProfile(next);
    try {
      await window.storage.set("rival:profile", JSON.stringify(next), false);
    } catch (e) {
      showToast("No se pudo guardar. Comprueba tu conexión.");
    }
  }

  async function resetData() {
    await persistTournaments(INITIAL_TOURNAMENTS);
    await persistProfile(DEFAULT_PROFILE);
    showToast("Datos restablecidos");
  }

  const selected = stack ? tournaments.find((t) => t.id === stack.id) : null;

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function openTournament(id) { setStack({ screen: "detail", id }); }
  function goBack() {
    if (stack?.screen === "payment") setStack({ screen: "detail", id: stack.id });
    else if (stack?.screen === "buyCoins") setStack(stack.returnTo || null);
    else setStack(null);
  }

  function submitResult() {
    const t = tournaments.find((tt) => tt.id === resultModal.tid);
    const updated = {
      ...t,
      bracket: t.bracket.map((round) => ({
        ...round,
        matches: round.matches.map((m) =>
          m.id === resultModal.mid
            ? { ...m, status: "awaiting", score1: scoreInputs.a, score2: scoreInputs.b }
            : m
        ),
      })),
    };
    persistTournaments(tournaments.map((tt) => (tt.id === t.id ? updated : tt)));
    setResultModal(null);
    setScoreInputs({ a: "", b: "" });
    showToast("Resultado enviado. Esperando confirmación del rival.");
  }

  function createTournament() {
    if (!form.name.trim()) { showToast("Ponle un nombre al torneo"); return; }
    const feeEuro = Number(form.feeEuro) || 0;
    if (feeEuro < 2) { showToast("La cuota mínima es 2€"); return; }
    const fee = Math.round(feeEuro * RC_PER_EURO);
    if (profile.balance < fee) {
      showToast(`Te faltan ${coinsFmt(fee - profile.balance)} RC para crear este torneo`);
      return;
    }
    const newT = {
      id: Date.now(),
      name: form.name.trim(),
      size: Number(form.size),
      fee,
      filled: 1,
      closesIn: "24h",
      live: false,
      bracket: generateBracket(Number(form.size), false),
    };
    persistTournaments([newT, ...tournaments]);
    persistProfile({
      ...profile,
      balance: profile.balance - fee,
      history: [{ id: Date.now() + 1, name: newT.name, result: "pending", amount: 0 }, ...profile.history],
    });
    setForm({ name: "", size: 8, feeEuro: 2 });
    setTab("list");
    showToast("Torneo creado. Ya eres el primer inscrito.");
  }

  function linkPlatform() {
    if (!tagInput.trim()) { showToast("Escribe tu gamertag o usuario"); return; }
    persistProfile({ ...profile, platforms: { ...profile.platforms, [linkModal]: { connected: true, tag: tagInput.trim() } } });
    showToast(`${PLATFORM_META[linkModal].label} vinculado correctamente`);
    setLinkModal(null);
    setTagInput("");
  }

  function unlinkPlatform(key) {
    persistProfile({ ...profile, platforms: { ...profile.platforms, [key]: { connected: false, tag: "" } } });
  }

  function confirmPayment() {
    const t = selected;
    if (profile.balance < t.fee) { showToast("Saldo insuficiente"); return; }
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      persistTournaments(tournaments.map((tt) =>
        tt.id === t.id ? { ...tt, filled: Math.min(tt.filled + 1, tt.size) } : tt
      ));
      persistProfile({
        ...profile,
        balance: profile.balance - t.fee,
        history: [{ id: Date.now(), name: t.name, result: "pending", amount: 0 }, ...profile.history],
      });
      setStack({ screen: "success", id: t.id });
    }, 1200);
  }

  function confirmBuyCoins() {
    const pack = COIN_PACKAGES.find((p) => p.id === selectedPackage);
    setBuying(true);
    setTimeout(() => {
      const total = pack.coins + pack.bonus;
      persistProfile({ ...profile, balance: profile.balance + total });
      setBuying(false);
      showToast(`+${coinsFmt(total)} RC añadidas a tu saldo`);
      setStack(stack?.returnTo || null);
    }, 1300);
  }

  const filteredTournaments = tournaments.filter((t) =>
    filterSize === "all" ? true : String(t.size) === filterSize
  );

  /* ---------- SCREENS ---------- */

  // NUEVA PANTALLA DE REGISTRO / KYC
  function RegistrationScreen({ onComplete }) {
    const [platform, setPlatform] = useState(null);

    return (
      <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-8 flex flex-col items-center">
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-6 w-full">
          <div className="w-12 h-12 rounded-xl border border-[#39FF6A] flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(57,255,106,0.15)] bg-[#050807]">
            <span className="font-display text-[22px] text-[#EAFBE9] font-bold">K</span>
          </div>
          <h1 className="font-display text-[20px] text-[#EAFBE9] font-bold tracking-wide">ÚNETE A KINBET</h1>
          <p className="text-[#7C9482] text-[11px] text-center mt-1">
            Apuestas 1v1 y Torneos de FC26 en España y Latinoamérica.
          </p>
        </div>

        {/* Formulario Contenedor */}
        <div className="w-full bg-[#0B120D] border border-[#1C2B1E] rounded-xl p-4 space-y-4">
          
          {/* Sección 1: Cuenta */}
          <div>
            <div className="font-display text-[10px] uppercase tracking-wider text-[#39FF6A] mb-3">Registrar nueva cuenta (KYC Requerido)</div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase text-[#7C9482] font-display mb-1 block">Correo Electrónico</label>
                <input type="email" placeholder="nombre@correo.com" className="w-full bg-[#050807] border border-[#1C2B1E] rounded-md px-3 py-2 text-[13px] text-[#EAFBE9] outline-none focus:border-[#39FF6A] transition-colors" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-[#7C9482] font-display mb-1 block">Contraseña</label>
                <input type="password" placeholder="••••••••" className="w-full bg-[#050807] border border-[#1C2B1E] rounded-md px-3 py-2 text-[13px] text-[#EAFBE9] outline-none focus:border-[#39FF6A] transition-colors" />
              </div>
            </div>
          </div>

          <div className="h-px bg-[#1C2B1E] my-3" />

          {/* Sección 2: EA ID */}
          <div>
            <label className="text-[10px] uppercase text-[#7C9482] font-display mb-1 block">EA ID de Jugador (Consola/PC)</label>
            <input type="text" placeholder="Ej: FC_KinGamer" className="w-full bg-[#050807] border border-[#1C2B1E] rounded-md px-3 py-2 text-[13px] text-[#EAFBE9] outline-none focus:border-[#39FF6A] transition-colors" />
          </div>

          {/* Sección 3: Sincronización */}
          <div className="border border-[#1C2B1E] rounded-md p-3 bg-[#050807]">
            <div className="flex items-center gap-1.5 text-[10px] uppercase text-[#7C9482] font-display mb-3">
              <Link2 size={12} className="text-[#39FF6A]"/> Sincroniza tu consola de origen
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['PSN', 'Xbox Live', 'EA App'].map(p => (
                <button 
                  key={p} 
                  onClick={() => setPlatform(p)} 
                  className={`py-2 flex flex-col items-center justify-center rounded-md border transition-colors ${platform === p ? 'border-[#39FF6A] bg-[#39FF6A]/10 text-[#39FF6A]' : 'border-[#1C2B1E] bg-[#0B120D] text-[#7C9482]'}`}
                >
                  <Gamepad2 size={16} className="mb-1" />
                  <span className="text-[9px] font-display tracking-wide">{p}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#1C2B1E] my-3" />

          {/* Sección 4: KYC / Identidad */}
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase text-[#FFC93C] font-display mb-3">
              <ShieldCheck size={13} /> Verificación de identidad obligatoria
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase text-[#7C9482] font-display mb-1 block">País / Región de origen</label>
                <select className="w-full bg-[#050807] border border-[#1C2B1E] rounded-md px-3 py-2 text-[13px] text-[#EAFBE9] outline-none focus:border-[#39FF6A] appearance-none">
                  <option>España 🇪🇸</option>
                  <option>México 🇲🇽</option>
                  <option>Argentina 🇦🇷</option>
                  <option>Colombia 🇨🇴</option>
                  <option>Chile 🇨🇱</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase text-[#7C9482] font-display mb-1 block">Tipo Documento</label>
                  <select className="w-full bg-[#050807] border border-[#1C2B1E] rounded-md px-3 py-2 text-[13px] text-[#EAFBE9] outline-none focus:border-[#39FF6A] appearance-none">
                    <option>DNI</option>
                    <option>Pasaporte</option>
                    <option>NIE</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-[#7C9482] font-display mb-1 block">Nº de Documento</label>
                  <input type="text" placeholder="Ej: 12345678Z" className="w-full bg-[#050807] border border-[#1C2B1E] rounded-md px-3 py-2 text-[13px] text-[#EAFBE9] outline-none focus:border-[#39FF6A]" />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={onComplete} 
            className="w-full font-display uppercase tracking-wider text-[13px] bg-[#39FF6A] text-[#050807] font-bold rounded-md py-3.5 mt-2 transition-transform active:scale-[0.98]"
          >
            Verificar y Empezar
          </button>

          <div className="text-center pt-2">
            <button className="text-[11px] text-[#7C9482] underline font-display hover:text-[#EAFBE9] transition-colors">
              ¿Ya tienes cuenta? Inicia Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  function ListScreen() {
    return (
      <>
        <Header balance={profile.balance} />
        <div className="px-4">
          <h1 className="font-display text-[24px] text-[#EAFBE9] font-semibold mb-1">Torneos disponibles</h1>
          <p className="text-[13px] text-[#7C9482] mb-4">FC26 · Eliminación simple</p>

          <div className="flex gap-2 overflow-x-auto pb-3 mb-1 -mx-4 px-4 scrollbar-none">
            {["all", "2", "4", "8", "16", "32"].map((s) => (
              <Chip key={s} active={filterSize === s} onClick={() => setFilterSize(s)}>
                {s === "all" ? "Todos" : s === "2" ? "1 vs 1" : s}
              </Chip>
            ))}
          </div>
        </div>

        <div className="px-4 pb-6 space-y-3">
          {filteredTournaments.map((t) => (
            <TournamentCard key={t.id} t={t} onOpen={() => openTournament(t.id)} />
          ))}
          {filteredTournaments.length === 0 && (
            <div className="text-center py-12 text-[#4B5F4E] text-[13px]">No hay torneos de este tamaño ahora mismo.</div>
          )}
        </div>
      </>
    );
  }

  function DetailScreen() {
    const t = selected;
    return (
      <>
        <Header onBack={goBack} title={t.size === 2 ? "1 vs 1" : `${t.size} jugadores`} />
        <div className="px-4 pb-6">
          <h1 className="font-display text-[22px] text-[#EAFBE9] font-semibold mb-3">{t.name}</h1>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <Stat label="Cuota" value={`${coinsFmt(t.fee)} RC`} />
            <Stat label="Pool total" value={`${coinsFmt(poolOf(t))} RC`} />
            <Stat label="Premio" value={`${coinsFmt(prizeOf(t))} RC`} accent />
          </div>

          <div className="bg-[#0B120D] border border-[#1C2B1E] rounded-xl p-3 mb-5 flex items-center gap-2 text-[12px] text-[#7C9482]">
            <ShieldCheck size={14} className="text-[#39FF6A] shrink-0" />
            Comisión de la plataforma: 5% ({coinsFmt(commissionOf(t))} RC), ya descontada del premio mostrado.
          </div>

          {t.filled < t.size ? (
            <button
              onClick={() => setStack({ screen: "payment", id: t.id })}
              className="w-full font-display uppercase tracking-wide text-[14px] bg-[#39FF6A] text-[#050807] font-semibold rounded-lg py-3 mb-6"
            >
              Unirse por {coinsFmt(t.fee)} RC
            </button>
          ) : (
            <div className="w-full text-center font-display uppercase tracking-wide text-[13px] bg-[#1C2B1E] text-[#7C9482] rounded-lg py-3 mb-6">
              Torneo completo
            </div>
          )}

          <h2 className="font-display text-[15px] text-[#EAFBE9] uppercase tracking-wide mb-3">Bracket</h2>
          <div className="space-y-5">
            {t.bracket.map((round) => (
              <div key={round.name}>
                <div className="text-[11px] uppercase tracking-wider text-[#4B5F4E] font-display mb-2">{round.name}</div>
                <div className="space-y-2">
                  {round.matches.map((m) => (
                    <MatchCard
                      key={m.id}
                      m={m}
                      onUpload={() => setResultModal({ tid: t.id, mid: m.id })}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  function Stat({ label, value, accent }) {
    return (
      <div className="bg-[#0B120D] border border-[#1C2B1E] rounded-lg py-2.5 px-2 text-center">
        <div className={`font-mono text-[14px] font-semibold ${accent ? "text-[#FFC93C]" : "text-[#EAFBE9]"}`}>{value}</div>
        <div className="text-[10px] text-[#7C9482] uppercase tracking-wide mt-0.5 font-display">{label}</div>
      </div>
    );
  }

  function PaymentScreen() {
    const t = selected;
    const enough = profile.balance >= t.fee;
    return (
      <>
        <Header onBack={goBack} title="Inscripción" />
        <div className="px-4 pb-6">
          <div className="bg-[#0B120D] border border-[#1C2B1E] rounded-xl p-4 mb-5">
            <div className="flex justify-between text-[13px] text-[#7C9482] mb-1">
              <span>{t.name}</span>
              <span className="font-mono text-[#EAFBE9]">{coinsFmt(t.fee)} RC</span>
            </div>
            <div className="flex justify-between text-[12px] text-[#4B5F4E]">
              <span>Incluye comisión de la plataforma</span>
            </div>
            <div className="h-px bg-[#1C2B1E] my-3" />
            <div className="flex items-center justify-between">
              <span className="font-display text-[13px] uppercase tracking-wide text-[#7C9482]">Tu saldo</span>
              <div className="text-right">
                <CoinAmount value={profile.balance} size="md" />
                <div className="text-[10px] text-[#4B5F4E] font-mono">≈ {eurosFmt(profile.balance)}</div>
              </div>
            </div>
          </div>

          {enough ? (
            <button
              onClick={confirmPayment}
              disabled={paying}
              className="w-full font-display uppercase tracking-wide text-[14px] bg-[#39FF6A] text-[#050807] font-semibold rounded-lg py-3 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {paying ? <Loader2 size={16} className="animate-spin" /> : <Lock size={14} />}
              {paying ? "Procesando…" : `Confirmar inscripción · ${coinsFmt(t.fee)} RC`}
            </button>
          ) : (
            <>
              <div className="flex items-start gap-2 bg-[#140A0B] border border-[#FF3B4E]/30 rounded-lg p-3 mb-4 text-[12px] text-[#FF3B4E]">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                Saldo insuficiente. Te faltan {coinsFmt(t.fee - profile.balance)} RC para inscribirte.
              </div>
              <button
                onClick={() => setStack({ screen: "buyCoins", returnTo: { screen: "payment", id: t.id } })}
                className="w-full font-display uppercase tracking-wide text-[14px] bg-[#FFC93C] text-[#3D2600] font-semibold rounded-lg py-3 flex items-center justify-center gap-2"
              >
                <Coins size={16} /> Recargar monedas
              </button>
            </>
          )}

          <p className="text-[11px] text-[#4B5F4E] text-center mt-4 leading-relaxed">
            Maqueta de demostración: no se procesa ningún pago real.
          </p>
        </div>
      </>
    );
  }

  function BuyCoinsScreen() {
    const pack = COIN_PACKAGES.find((p) => p.id === selectedPackage);
    const total = pack.coins + pack.bonus;
    return (
      <>
        <Header onBack={goBack} title="Recargar monedas" />
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between bg-[#0B120D] border border-[#1C2B1E] rounded-xl px-4 py-3 mb-5">
            <span className="font-display text-[12px] uppercase tracking-wide text-[#7C9482]">Saldo actual</span>
            <div className="text-right">
              <CoinAmount value={profile.balance} size="md" />
              <div className="text-[10px] text-[#4B5F4E] font-mono">≈ {eurosFmt(profile.balance)}</div>
            </div>
          </div>

          <div className="text-[12px] uppercase tracking-wide text-[#7C9482] font-display mb-2">Elige un paquete</div>
          <div className="space-y-2 mb-5">
            {COIN_PACKAGES.map((p) => {
              const t = p.coins + p.bonus;
              const active = selectedPackage === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPackage(p.id)}
                  className={`w-full text-left rounded-lg border px-3 py-3 flex items-center justify-between transition-colors ${
                    active ? "border-[#39FF6A] bg-[#39FF6A]/10" : "border-[#1C2B1E] bg-[#0B120D]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CoinBadge size={22} />
                    <div>
                      <div className="font-mono text-[16px] text-[#EAFBE9] font-semibold">{coinsFmt(t)} RC</div>
                      {p.bonus > 0 && <div className="text-[11px] text-[#FFC93C]">+{coinsFmt(p.bonus)} de regalo</div>}
                    </div>
                  </div>
                  <div className="font-display text-[15px] text-[#EAFBE9]">{p.price.toFixed(2)}€</div>
                </button>
              );
            })}
          </div>

          <div className="text-[12px] uppercase tracking-wide text-[#7C9482] font-display mb-2">Método de pago</div>
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              onClick={() => setPayMethod("paypal")}
              className={`rounded-lg border py-3 flex flex-col items-center gap-1.5 ${payMethod === "paypal" ? "border-[#39FF6A] bg-[#39FF6A]/10" : "border-[#1C2B1E] bg-[#0B120D]"}`}
            >
              <Wallet size={18} className={payMethod === "paypal" ? "text-[#39FF6A]" : "text-[#7C9482]"} />
              <span className="font-display text-[12px] text-[#EAFBE9]">PayPal</span>
            </button>
            <button
              onClick={() => setPayMethod("card")}
              className={`rounded-lg border py-3 flex flex-col items-center gap-1.5 ${payMethod === "card" ? "border-[#39FF6A] bg-[#39FF6A]/10" : "border-[#1C2B1E] bg-[#0B120D]"}`}
            >
              <CreditCard size={18} className={payMethod === "card" ? "text-[#39FF6A]" : "text-[#7C9482]"} />
              <span className="font-display text-[12px] text-[#EAFBE9]">Tarjeta</span>
            </button>
          </div>

          {payMethod === "card" && (
            <div className="space-y-2 mb-5">
              <input placeholder="Número de tarjeta" className="w-full bg-[#0B120D] border border-[#1C2B1E] rounded-lg px-3 py-2.5 text-[13px] text-[#EAFBE9] placeholder:text-[#4B5F4E] outline-none focus:border-[#39FF6A]" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="MM/AA" className="bg-[#0B120D] border border-[#1C2B1E] rounded-lg px-3 py-2.5 text-[13px] text-[#EAFBE9] placeholder:text-[#4B5F4E] outline-none focus:border-[#39FF6A]" />
                <input placeholder="CVV" className="bg-[#0B120D] border border-[#1C2B1E] rounded-lg px-3 py-2.5 text-[13px] text-[#EAFBE9] placeholder:text-[#4B5F4E] outline-none focus:border-[#39FF6A]" />
              </div>
            </div>
          )}

          {payMethod === "paypal" && (
            <div className="bg-[#0B120D] border border-[#1C2B1E] rounded-lg px-3 py-3 mb-5 text-[12px] text-[#7C9482]">
              Se te redirigirá a PayPal para confirmar el pago de forma segura.
            </div>
          )}

          <button
            onClick={confirmBuyCoins}
            disabled={buying}
            className="w-full font-display uppercase tracking-wide text-[14px] bg-[#FFC93C] text-[#3D2600] font-semibold rounded-lg py-3 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {buying ? <Loader2 size={16} className="animate-spin" /> : <Coins size={16} />}
            {buying ? "Procesando…" : `Comprar ${coinsFmt(total)} RC · ${pack.price.toFixed(2)}€`}
          </button>

          <p className="text-[11px] text-[#4B5F4E] text-center mt-4 leading-relaxed">
            Maqueta de demostración: no se procesa ningún pago real.
          </p>
        </div>
      </>
    );
  }

  function SuccessScreen() {
    const t = selected;
    return (
      <div className="px-4 pt-16 pb-6 flex flex-col items-center text-center h-full">
        <div className="w-16 h-16 rounded-full bg-[#39FF6A]/15 flex items-center justify-center mb-5">
          <CheckCircle2 size={32} className="text-[#39FF6A]" />
        </div>
        <h1 className="font-display text-[20px] text-[#EAFBE9] font-semibold mb-2">¡Estás dentro!</h1>
        <p className="text-[13px] text-[#7C9482] mb-8 max-w-[260px]">
          Te has inscrito en <span className="text-[#EAFBE9]">{t.name}</span>. Te avisaremos cuando se complete el cuadro y empiece tu primer partido.
        </p>
        <button
          onClick={() => setStack({ screen: "detail", id: t.id })}
          className="w-full font-display uppercase tracking-wide text-[13px] bg-[#39FF6A] text-[#050807] font-semibold rounded-lg py-3"
        >
          Ver torneo
        </button>
      </div>
    );
  }

  function CreateScreen() {
    const feeEuro = Number(form.feeEuro) || 0;
    const fee = Math.round(feeEuro * RC_PER_EURO);
    const pool = fee * form.size;
    const commission = pool * 0.05;
    const prize = pool - commission;
    const belowMin = form.feeEuro !== "" && feeEuro < 2;
    return (
      <>
        <Header title="Crear torneo" />
        <div className="px-4 pb-6">
          <label className="block text-[11px] uppercase tracking-wide text-[#7C9482] font-display mb-1.5">Nombre del torneo</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej. Copa de los Viernes"
            className="w-full bg-[#0B120D] border border-[#1C2B1E] rounded-lg px-3 py-2.5 text-[13px] text-[#EAFBE9] placeholder:text-[#4B5F4E] outline-none focus:border-[#39FF6A] mb-4"
          />

          <label className="block text-[11px] uppercase tracking-wide text-[#7C9482] font-display mb-1.5">Tamaño</label>
          <div className="flex gap-2 mb-4">
            {[2, 4, 8, 16, 32].map((s) => (
              <button
                key={s}
                onClick={() => setForm({ ...form, size: s })}
                className={`flex-1 rounded-lg py-2.5 font-display text-[13px] border ${form.size === s ? "bg-[#39FF6A] text-[#050807] border-[#39FF6A]" : "bg-[#0B120D] text-[#7C9482] border-[#1C2B1E]"}`}
              >
                {s === 2 ? "1v1" : s}
              </button>
            ))}
          </div>

          <label className="block text-[11px] uppercase tracking-wide text-[#7C9482] font-display mb-1.5">Cuota de entrada por jugador</label>
          <div className="relative mb-1.5">
            <input
              type="number"
              min={2}
              step={0.5}
              value={form.feeEuro}
              onChange={(e) => setForm({ ...form, feeEuro: e.target.value === "" ? "" : Number(e.target.value) })}
              className={`w-full bg-[#0B120D] border rounded-lg px-3 py-2.5 text-[13px] text-[#EAFBE9] outline-none font-mono ${belowMin ? "border-[#FF3B4E] focus:border-[#FF3B4E]" : "border-[#1C2B1E] focus:border-[#39FF6A]"}`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C9482] text-[13px] font-display">€</span>
          </div>
          <div className={`text-[11px] mb-5 ${belowMin ? "text-[#FF3B4E]" : "text-[#4B5F4E]"}`}>
            {belowMin ? "La cuota mínima es 2€." : `Cuota mínima 2€ · equivale a ${coinsFmt(fee)} RC`}
          </div>

          <div className="bg-[#0B120D] border border-[#1C2B1E] rounded-xl p-4 mb-6">
            <div className="font-display text-[12px] uppercase tracking-wide text-[#7C9482] mb-2.5">Resumen</div>
            <SummaryRow label="Cuota por jugador" value={`${eurosFmt(fee)} · ${coinsFmt(fee)} RC`} />
            <SummaryRow label={`Pool total (${form.size} jugadores)`} value={`${coinsFmt(pool || 0)} RC`} />
            <SummaryRow label="Tu comisión (5%)" value={`${coinsFmt(commission || 0)} RC`} />
            <div className="h-px bg-[#1C2B1E] my-2" />
            <SummaryRow label="Premio para el ganador" value={`${coinsFmt(prize || 0)} RC`} accent />
          </div>

          <button
            onClick={createTournament}
            disabled={belowMin}
            className="w-full font-display uppercase tracking-wide text-[14px] bg-[#39FF6A] text-[#050807] font-semibold rounded-lg py-3 disabled:opacity-40"
          >
            Crear torneo
          </button>
        </div>
      </>
    );
  }

  function SummaryRow({ label, value, accent }) {
    return (
      <div className="flex justify-between text-[13px] mb-1">
        <span className="text-[#7C9482]">{label}</span>
        <span className={`font-mono ${accent ? "text-[#FFC93C] font-semibold" : "text-[#EAFBE9]"}`}>{value}</span>
      </div>
    );
  }

  function ProfileScreen() {
    const winRate = profile.stats.played ? Math.round((profile.stats.won / profile.stats.played) * 100) : 0;
    return (
      <>
        <Header title="Perfil" />
        <div className="px-4 pb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-full bg-[#1C2B1E] flex items-center justify-center font-display text-[18px] text-[#39FF6A] font-semibold">TÚ</div>
            <div>
              <div className="font-display text-[16px] text-[#EAFBE9] font-semibold">Jugador_01</div>
              <div className="text-[12px] text-[#7C9482]">Verificado · +18</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-5">
            <Stat label="Jugados" value={String(profile.stats.played)} />
            <Stat label="Ganados" value={String(profile.stats.won)} accent />
            <Stat label="Win rate" value={`${winRate}%`} />
          </div>

          <div className="bg-[#0B120D] border border-[#1C2B1E] rounded-xl p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-[12px] uppercase tracking-wide text-[#7C9482]">Saldo disponible</span>
              <CoinBadge size={16} />
            </div>
            <CoinAmount value={profile.balance} size="lg" />
            <div className="text-[12px] text-[#7C9482] font-mono mt-1">≈ {eurosFmt(profile.balance)}</div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={() => setStack({ screen: "buyCoins", returnTo: null })}
                className="font-display text-[12px] uppercase tracking-wide bg-[#39FF6A] text-[#050807] font-semibold rounded-lg py-2 flex items-center justify-center gap-1.5"
              >
                <Coins size={13} /> Añadir fondos
              </button>
              <button
                onClick={() => showToast("Función de retiro próximamente")}
                className="font-display text-[12px] uppercase tracking-wide bg-[#1C2B1E] text-[#EAFBE9] rounded-lg py-2"
              >
                Retirar
              </button>
            </div>
          </div>

          <div className="font-display text-[12px] uppercase tracking-wide text-[#7C9482] mb-2 flex items-center gap-1.5">
            Plataformas conectadas
          </div>
          <div className="space-y-2 mb-5">
            {Object.keys(PLATFORM_META).map((key) => {
              const meta = PLATFORM_META[key];
              const p = profile.platforms[key];
              const Icon = meta.icon === "Monitor" ? Monitor : Gamepad2;
              return (
                <div key={key} className="flex items-center justify-between bg-[#0B120D] border border-[#1C2B1E] rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${p.connected ? "bg-[#39FF6A]/15" : "bg-[#1C2B1E]"}`}>
                      <Icon size={15} className={p.connected ? "text-[#39FF6A]" : "text-[#7C9482]"} />
                    </div>
                    <div>
                      <div className="font-body text-[13px] text-[#EAFBE9]">{meta.label}</div>
                      <div className="text-[11px] text-[#7C9482]">{p.connected ? p.tag : "No vinculado"}</div>
                    </div>
                  </div>
                  {p.connected ? (
                    <button onClick={() => unlinkPlatform(key)} className="flex items-center gap-1 text-[11px] font-display uppercase tracking-wide text-[#39FF6A]">
                      <Check size={12} /> Listo
                    </button>
                  ) : (
                    <button
                      onClick={() => { setLinkModal(key); setTagInput(""); }}
                      className="flex items-center gap-1 text-[11px] font-display uppercase tracking-wide text-[#39FF6A] border border-[#39FF6A]/40 rounded-full px-2.5 py-1"
                    >
                      <Link2 size={11} /> Conectar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-start gap-2 bg-[#0B120D]/60 border border-[#1C2B1E] rounded-lg p-2.5 mb-5 text-[11px] text-[#7C9482]">
            <AlertCircle size={13} className="shrink-0 mt-0.5 text-[#39FF6A]" />
            Vincular tu cuenta verifica tu identidad y muestra tu gamertag en el perfil. Los resultados de los partidos se siguen confirmando por captura, ya que EA no ofrece lectura automática de marcadores a apps externas.
          </div>

          <div className="font-display text-[12px] uppercase tracking-wide text-[#7C9482] mb-2">Historial reciente</div>
          <div className="space-y-2 mb-6">
            {profile.history.map((h) => (
              <HistoryRow key={h.id} name={h.name} result={h.result} amount={h.amount} />
            ))}
          </div>

          <button
            onClick={resetData}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] font-display uppercase tracking-wide text-[#4B5F4E]"
          >
            <RefreshCw size={11} /> Restablecer datos
          </button>
        </div>
      </>
    );
  }

  function HistoryRow({ name, result, amount }) {
    const tone = result === "win" ? "brand" : result === "loss" ? "danger" : "default";
    const label = result === "win" ? "Ganado" : result === "loss" ? "Perdido" : "En curso";
    const display = result === "pending" ? "En curso" : formatSigned(amount);
    const color = result === "win" ? "text-[#39FF6A]" : result === "loss" ? "text-[#FF3B4E]" : "text-[#7C9482]";
    return (
      <div className="flex items-center justify-between bg-[#0B120D] border border-[#1C2B1E] rounded-lg px-3 py-2.5">
        <div>
          <div className="font-body text-[13px] text-[#EAFBE9]">{name}</div>
          <Pill tone={tone}>{label}</Pill>
        </div>
        <span className={`font-mono text-[13px] ${color}`}>{display}</span>
      </div>
    );
  }

  /* ---------- RENDER ---------- */

  if (!loaded) {
    return (
      <div className="w-full flex items-center justify-center py-6 bg-[#030503]">
        <style>{FONT_STYLE}</style>
        <div className="font-body relative w-[380px] h-[760px] bg-[#050807] rounded-[36px] border border-[#1C2B1E] shadow-2xl overflow-hidden flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="text-[#39FF6A] animate-spin" />
            <span className="font-display text-[13px] uppercase tracking-wide text-[#7C9482]">Cargando tu perfil…</span>
          </div>
        </div>
      </div>
    );
  }

  // Lógica para mostrar la pantalla de registro si no está autenticado
  let content;
  if (!isAuthenticated) {
    content = <LoginForm onComplete={() => setIsAuthenticated(true)} />;
  } else if (stack?.screen === "detail") {
    content = <DetailScreen />;
  } else if (stack?.screen === "payment") {
    content = <PaymentScreen />;
  } else if (stack?.screen === "buyCoins") {
    content = <BuyCoinsScreen />;
  } else if (stack?.screen === "success") {
    content = <SuccessScreen />;
  } else if (tab === "list") {
    content = <ListScreen />;
  } else if (tab === "create") {
    content = <CreateScreen />;
  } else if (tab === "profile") {
    content = <ProfileScreen />;
  }
  }

  const showBottomNav = isAuthenticated && !stack;

  return (
    <div className="w-full flex items-center justify-center py-6 bg-[#030503]">
      <style>{FONT_STYLE}</style>
      <div
        className="font-body relative w-[380px] h-[760px] bg-[#050807] rounded-[36px] border border-[#1C2B1E] shadow-2xl overflow-hidden flex flex-col"
        style={{ boxShadow: "0 0 0 1px #1C2B1E, 0 0 60px -12px rgba(57,255,106,0.35), 0 0 100px -20px rgba(255,201,60,0.15)" }}
      >
        {/* notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#030503] rounded-b-2xl z-20" />

        <div className="flex-1 overflow-y-auto scrollbar-none pt-4">{content}</div>

        {showBottomNav && (
          <div className="flex items-center justify-around border-t border-[#1C2B1E] bg-[#050807] py-2.5 px-2">
            <NavBtn icon={Trophy} label="Torneos" active={tab === "list"} onClick={() => setTab("list")} />
            <NavBtn icon={Plus} label="Crear" active={tab === "create"} onClick={() => setTab("create")} />
            <NavBtn icon={User} label="Perfil" active={tab === "profile"} onClick={() => setTab("profile")} />
          </div>
        )}

        {toast && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#1C2B1E] text-[#EAFBE9] text-[12px] px-4 py-2 rounded-full shadow-lg max-w-[90%] text-center z-30">
            {toast}
          </div>
        )}

        {linkModal && (
          <div className="absolute inset-0 bg-black/60 flex items-end z-40">
            <div className="w-full bg-[#0B120D] border-t border-[#1C2B1E] rounded-t-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-[15px] text-[#EAFBE9] uppercase tracking-wide">
                  Vincular {PLATFORM_META[linkModal].label}
                </h3>
                <button onClick={() => setLinkModal(null)} className="text-[#7C9482]"><X size={18} /></button>
              </div>
              <input
                autoFocus
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder={PLATFORM_META[linkModal].placeholder}
                className="w-full bg-[#050807] border border-[#1C2B1E] rounded-lg px-3 py-2.5 text-[14px] text-[#EAFBE9] placeholder:text-[#4B5F4E] outline-none focus:border-[#39FF6A] mb-4"
              />
              <div className="flex items-start gap-2 bg-[#050807] rounded-lg p-2.5 mb-4 text-[11px] text-[#7C9482]">
                <ShieldCheck size={14} className="shrink-0 mt-0.5 text-[#39FF6A]" />
                Solo se usa para mostrar tu identidad en la app. No compartimos esta información con terceros.
              </div>
              <button
                onClick={linkPlatform}
                className="w-full font-display uppercase tracking-wide text-[13px] bg-[#39FF6A] text-[#050807] font-semibold rounded-lg py-3"
              >
                Vincular cuenta
              </button>
            </div>
          </div>
        )}

        {resultModal && (
          <div className="absolute inset-0 bg-black/60 flex items-end z-40">
            <div className="w-full bg-[#0B120D] border-t border-[#1C2B1E] rounded-t-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-[15px] text-[#EAFBE9] uppercase tracking-wide">Subir resultado</h3>
                <button onClick={() => setResultModal(null)} className="text-[#7C9482]"><X size={18} /></button>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="number" min={0} placeholder="0" value={scoreInputs.a}
                  onChange={(e) => setScoreInputs({ ...scoreInputs, a: e.target.value })}
                  className="w-full bg-[#050807] border border-[#1C2B1E] rounded-lg px-3 py-2.5 text-center text-[16px] text-[#EAFBE9] outline-none focus:border-[#39FF6A] font-mono"
                />
                <span className="font-display text-[#7C9482]">VS</span>
                <input
                  type="number" min={0} placeholder="0" value={scoreInputs.b}
                  onChange={(e) => setScoreInputs({ ...scoreInputs, b: e.target.value })}
                  className="w-full bg-[#050807] border border-[#1C2B1E] rounded-lg px-3 py-2.5 text-center text-[16px] text-[#EAFBE9] outline-none focus:border-[#39FF6A] font-mono"
                />
              </div>
              <div className="flex items-start gap-2 bg-[#050807] rounded-lg p-2.5 mb-4 text-[11px] text-[#7C9482]">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-[#39FF6A]" />
                Sube también una captura del marcador final. Si tu rival reporta algo distinto, se abrirá una disputa.
              </div>
              <button
                onClick={submitResult}
                className="w-full font-display uppercase tracking-wide text-[13px] bg-[#39FF6A] text-[#050807] font-semibold rounded-lg py-3"
              >
                Enviar resultado
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NavBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 px-4 py-1">
      <Icon size={20} className={active ? "text-[#39FF6A]" : "text-[#4B5F4E]"} />
      <span className={`font-display text-[10px] uppercase tracking-wide ${active ? "text-[#39FF6A]" : "text-[#4B5F4E]"}`}>{label}</span>
    </button>
  );
}
