import React, { useState, useEffect } from "react";
import {
  Trophy, Users, Plus, User, ChevronLeft, CreditCard, Wallet,
  CheckCircle2, Clock, ShieldCheck, X, AlertCircle, Lock,
  Loader2, Gamepad2, Monitor, Link2, Check, Coins, RefreshCw,
  Home, Star
} from "lucide-react";

/* ---------------------------------------------------------
   DATA HELPERS (Tu lógica original intacta)
--------------------------------------------------------- */

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
  { id: 1, name: "FIFA 24: ULTIMATE CUP", size: 64, fee: 250, filled: 48, closesIn: "2h", live: true },
  { id: 2, name: "eSeries Pro", size: 16, fee: 60, filled: 12, closesIn: "30m", live: false },
  { id: 3, name: "Club Challenge", size: 32, fee: 150, filled: 30, closesIn: "5h", live: false },
  { id: 4, name: "Duelo Directo", size: 2, fee: 40, filled: 1, closesIn: "1d", live: false },
].map((t) => ({ ...t, bracket: generateBracket(t.size, t.id === 1) }));

const DEFAULT_PROFILE = {
  username: "albert07m",
  balance: 5250,
  stats: { played: 14, won: 6 },
  platforms: {
    ps5: { connected: true, tag: "albert_psn" },
    xbox: { connected: false, tag: "" },
    pc: { connected: false, tag: "" },
  },
  history: [
    { id: 1, name: "FIFA 24: ULTIMATE CUP", result: "pending", amount: 0 },
    { id: 2, name: "Reto Relámpago", result: "win", amount: 500 },
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
   THEME / FONTS (Esports Space Theme)
--------------------------------------------------------- */

const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Orbitron:wght@400;700;900&display=swap');
  .font-display{font-family:'Orbitron', sans-serif;}
  .font-body{font-family:'Chakra Petch', sans-serif;}
  .scrollbar-none::-webkit-scrollbar{display:none;}
  .scrollbar-none{-ms-overflow-style:none; scrollbar-width:none;}
  
  /* Space Background */
  .bg-space {
    background-color: #060814;
    background-image: 
      radial-gradient(1px 1px at 25px 5px, white, rgba(255, 255, 255, 0)),
      radial-gradient(1px 1px at 50px 25px, white, rgba(255, 255, 255, 0)),
      radial-gradient(1.5px 1.5px at 125px 20px, #00E5FF, rgba(255, 255, 255, 0)),
      radial-gradient(2px 2px at 50px 75px, white, rgba(255, 255, 255, 0)),
      radial-gradient(2px 2px at 15px 125px, white, rgba(255, 255, 255, 0)),
      radial-gradient(1.5px 1.5px at 110px 140px, #B026FF, rgba(255, 255, 255, 0)),
      radial-gradient(1px 1px at 170px 90px, white, rgba(255, 255, 255, 0)),
      radial-gradient(1px 1px at 200px 150px, white, rgba(255, 255, 255, 0));
    background-repeat: repeat;
    background-size: 200px 200px;
  }
`;

/* ---------------------------------------------------------
   UI ATOMS (Cyan & Neon Palette)
--------------------------------------------------------- */

function CoinBadge({ size = 14, silver = false }) {
  const fill = silver ? "#A0B0C0" : "#FFC93C";
  const stroke = silver ? "#405060" : "#8A5A00";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="shrink-0 drop-shadow-md">
      <circle cx="12" cy="12" r="11" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#202020" fontFamily="'Orbitron',sans-serif">RC</text>
    </svg>
  );
}

function CoinAmount({ value, size = "md", tone = "gold" }) {
  const sizes = { sm: "text-[12px] gap-1", md: "text-[16px] gap-1.5", lg: "text-[26px] gap-2" };
  const iconSize = { sm: 12, md: 16, lg: 24 }[size];
  const color = tone === "gold" ? "text-white" : tone === "danger" ? "text-[#FF3B4E]" : "text-white";
  return (
    <span className={`inline-flex items-center font-display font-bold ${sizes[size]} ${color}`}>
      <CoinBadge size={iconSize} />
      {coinsFmt(value)} <span className="text-[12px] ml-1 mt-1 text-[#809BB0]">RC</span>
    </span>
  );
}

function HeaderProfile({ profile }) {
  return (
    <div className="flex flex-col items-center mt-6 mb-6">
      <div className="flex flex-col items-center bg-[#070b1a]/80 border border-[#00E5FF]/30 shadow-[0_0_20px_rgba(0,229,255,0.15)] rounded-2xl px-8 py-3 backdrop-blur-sm min-w-[220px]">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full border-2 border-[#FF3B7C] overflow-hidden mb-2 shadow-[0_0_15px_rgba(255,59,124,0.4)]">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}&backgroundColor=b6e3f4`} alt="avatar" className="w-full h-full object-cover" />
        </div>
        <div className="font-display text-[15px] text-white font-bold tracking-wide">@{profile.username}</div>
        <div className="flex items-center gap-1.5 text-white font-bold text-[14px] mt-1">
          <CoinBadge size={16}/> {coinsFmt(profile.balance)} RC
        </div>
      </div>
    </div>
  );
}

function TournamentCardNew({ t, onOpen }) {
  return (
    <div className="relative bg-[#0b1026]/90 border border-[#00E5FF]/40 shadow-[0_0_20px_rgba(0,229,255,0.15)] rounded-xl overflow-hidden mb-5 backdrop-blur-sm">
      
      {/* Decorative Neon Lines (Faked with CSS) */}
      <div className="absolute top-0 left-0 w-[40%] h-full opacity-30 pointer-events-none overflow-hidden">
         <div className="absolute -left-10 top-0 w-full h-full border-r border-[#B026FF] rotate-12 transform scale-150"></div>
         <div className="absolute left-4 top-0 w-full h-full border-r-2 border-[#00E5FF] rotate-12 transform scale-150 shadow-[0_0_10px_#00E5FF]"></div>
      </div>

      <div className="p-4 relative z-10">
        <h3 className="font-display text-[18px] text-white font-bold uppercase tracking-wide mb-4 text-center">{t.name}</h3>

        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="flex flex-col items-center">
            <div className="text-[10px] text-[#809BB0] font-body uppercase mb-1">Entry Fee:</div>
            <div className="text-[14px] text-white font-display font-bold flex items-center gap-1.5"><CoinBadge size={14}/> {t.fee} RC</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-[10px] text-[#809BB0] font-body uppercase mb-1">Platform:</div>
            <div className="text-[14px] text-white font-display font-bold flex items-center gap-1.5"><Gamepad2 size={14}/> PS5</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-[10px] text-[#809BB0] font-body uppercase mb-1">Max Players:</div>
            <div className="text-[14px] text-white font-display font-bold flex items-center gap-1.5"><Users size={14}/> {t.size}</div>
          </div>
        </div>

        {/* Prizes Row */}
        <div className="flex items-center justify-center gap-6 border-t border-white/10 pt-3 mb-5">
            <div className="flex items-center gap-1.5 text-white font-display text-[14px] font-bold"><Trophy size={16} className="text-[#FFC93C] drop-shadow-[0_0_5px_#FFC93C]"/> {coinsFmt(prizeOf(t))} RC</div>
            <div className="flex items-center gap-1.5 text-white font-display text-[14px] font-bold"><Star size={16} className="text-[#FFC93C] drop-shadow-[0_0_5px_#FFC93C]"/> 1,500 XP</div>
        </div>

        {/* Action Button */}
        <div className="px-4 pb-2">
          <button onClick={onOpen} className="w-full bg-[#030612]/50 border-2 border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)_inset,0_0_10px_rgba(0,229,255,0.4)] text-[#00E5FF] font-display font-bold uppercase py-2.5 rounded-lg tracking-widest text-[15px] hover:bg-[#00E5FF]/20 transition-colors active:scale-95">
            VER CUADRO
          </button>
        </div>
      </div>
    </div>
  );
}

function HeaderSub({ title, onBack }) {
  return (
    <div className="relative px-4 pt-5 pb-4 bg-transparent z-10">
      <div className="relative flex items-center justify-between">
        {onBack ? (
          <button onClick={onBack} className="p-2 -ml-2 text-[#00E5FF] bg-[#00E5FF]/10 rounded-full border border-[#00E5FF]/30"><ChevronLeft size={22} /></button>
        ) : <div className="w-10" />}
        
        {title && <span className="font-display text-[16px] text-white uppercase tracking-wider font-bold drop-shadow-[0_0_8px_#00E5FF]">{title}</span>}
        
        <div className="w-10" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   MAIN APP
--------------------------------------------------------- */

export default function App() {
  const [tournaments, setTournaments] = useState(INITIAL_TOURNAMENTS);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(true);

  const [tab, setTab] = useState("list");
  const [stack, setStack] = useState(null); 
  const [filterSize, setFilterSize] = useState("all");

  // Resto de estados (iguales a tu código original)
  const [paying, setPaying] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("p2");
  const [payMethod, setPayMethod] = useState("paypal");
  const [buying, setBuying] = useState(false);
  const [form, setForm] = useState({ name: "", size: 8, feeEuro: 2 });
  const [toast, setToast] = useState(null);

  const selected = stack ? tournaments.find((t) => t.id === stack.id) : null;

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function openTournament(id) { setStack({ screen: "detail", id }); }
  function goBack() {
    if (stack?.screen === "payment") setStack({ screen: "detail", id: stack.id });
    else if (stack?.screen === "buyCoins") setStack(stack.returnTo || null);
    else setStack(null);
  }

  function confirmPayment() {
    if (profile.balance < selected.fee) { showToast("Saldo insuficiente"); return; }
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setProfile({...profile, balance: profile.balance - selected.fee});
      setStack({ screen: "success", id: selected.id });
    }, 1200);
  }

  const filteredTournaments = tournaments.filter((t) => filterSize === "all" ? true : String(t.size) === filterSize);

  /* ---------- SCREENS ---------- */

  function ListScreen() {
    return (
      <div className="px-4">
        <HeaderProfile profile={profile} />
        
        <h2 className="text-center font-display text-[22px] font-bold text-white uppercase tracking-wider mb-6 drop-shadow-[0_0_10px_#ffffff]">
          Torneos en Curso
        </h2>

        <div className="pb-6 space-y-4">
          {filteredTournaments.map((t) => (
            <TournamentCardNew key={t.id} t={t} onOpen={() => openTournament(t.id)} />
          ))}
        </div>
      </div>
    );
  }

  function DetailScreen() {
    const t = selected;
    return (
      <>
        <HeaderSub onBack={goBack} title="ARENA DE COMBATE" />
        <div className="px-4 pb-6">
          <TournamentCardNew t={t} onOpen={() => setStack({ screen: "payment", id: t.id })} />

          <h2 className="font-display text-[15px] text-[#00E5FF] uppercase tracking-wide mb-3 mt-6 border-b border-[#00E5FF]/30 pb-2">Cuadro del Torneo</h2>
          
          <div className="bg-[#0b1026]/80 border border-[#00E5FF]/20 rounded-xl p-4 backdrop-blur-md">
            <div className="text-center text-[#809BB0] font-body text-[13px] py-8">
              <Trophy size={32} className="mx-auto mb-2 text-[#00E5FF]/50" />
              El cuadro se generará una vez se completen las {t.size} inscripciones.
            </div>
          </div>
        </div>
      </>
    );
  }

  function PaymentScreen() {
    const t = selected;
    const enough = profile.balance >= t.fee;
    return (
      <>
        <HeaderSub onBack={goBack} title="INSCRIPCIÓN" />
        <div className="px-4 pb-6">
          <div className="bg-[#0b1026]/90 border border-[#00E5FF]/40 shadow-[0_0_20px_rgba(0,229,255,0.15)] rounded-xl p-5 mb-5 backdrop-blur-md">
            <div className="font-display text-white text-[18px] text-center mb-4">{t.name}</div>
            
            <div className="flex justify-between items-center bg-[#060814] p-3 rounded-lg border border-white/10 mb-4">
              <span className="font-body text-[13px] text-[#809BB0] uppercase">Costo de Entrada</span>
              <CoinAmount value={t.fee} size="md" />
            </div>

            <div className="flex justify-between items-center bg-[#060814] p-3 rounded-lg border border-[#00E5FF]/30">
              <span className="font-body text-[13px] text-[#00E5FF] uppercase font-bold">Tu Saldo</span>
              <CoinAmount value={profile.balance} size="md" />
            </div>
          </div>

          {enough ? (
            <button onClick={confirmPayment} disabled={paying} className="w-full bg-[#00E5FF] text-[#060814] shadow-[0_0_15px_#00E5FF] font-display font-bold uppercase py-3.5 rounded-lg tracking-widest text-[15px] hover:bg-white transition-colors flex justify-center items-center gap-2">
              {paying ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
              {paying ? "AUTORIZANDO..." : "CONFIRMAR PAGO"}
            </button>
          ) : (
            <>
              <div className="bg-[#FF3B4E]/10 border border-[#FF3B4E]/50 text-[#FF3B4E] rounded-lg p-3 text-center text-[12px] font-body mb-4">
                Saldo insuficiente. Necesitas recargar {t.fee - profile.balance} RC.
              </div>
              <button onClick={() => setStack({ screen: "buyCoins", returnTo: { screen: "payment", id: t.id } })} className="w-full bg-[#FFC93C] text-[#3D2600] shadow-[0_0_15px_#FFC93C] font-display font-bold uppercase py-3.5 rounded-lg tracking-widest text-[15px] flex justify-center items-center gap-2">
                <Coins size={18} /> AÑADIR SALDO
              </button>
            </>
          )}
        </div>
      </>
    );
  }

  function ProfileScreen() {
    return (
      <div className="px-4">
        <HeaderProfile profile={profile} />
        <h2 className="text-center font-display text-[22px] font-bold text-white uppercase tracking-wider mb-6 drop-shadow-[0_0_10px_#ffffff]">
          Tu Base de Datos
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-6">
           <div className="bg-[#0b1026]/80 border border-[#00E5FF]/30 rounded-xl p-4 text-center backdrop-blur-sm">
              <div className="text-[#00E5FF] font-display text-[24px] font-bold">{profile.stats.played}</div>
              <div className="text-[#809BB0] text-[10px] uppercase font-body">Partidos Jugados</div>
           </div>
           <div className="bg-[#0b1026]/80 border border-[#B026FF]/30 rounded-xl p-4 text-center backdrop-blur-sm">
              <div className="text-[#B026FF] font-display text-[24px] font-bold">{Math.round((profile.stats.won/profile.stats.played)*100)}%</div>
              <div className="text-[#809BB0] text-[10px] uppercase font-body">Win Rate</div>
           </div>
        </div>

        <button className="w-full bg-transparent border-2 border-[#FF3B4E] shadow-[0_0_10px_rgba(255,59,78,0.2)_inset] text-[#FF3B4E] font-display font-bold uppercase py-3 rounded-lg tracking-widest text-[14px]">
          Cerrar Sesión
        </button>
      </div>
    );
  }

  function SuccessScreen() {
    return (
      <div className="px-4 pt-20 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-[#00E5FF]/10 border-2 border-[#00E5FF] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,229,255,0.4)]">
          <CheckCircle2 size={48} className="text-[#00E5FF]" />
        </div>
        <h1 className="font-display text-[28px] text-white font-bold mb-3 drop-shadow-[0_0_10px_#ffffff]">¡REGISTRADO!</h1>
        <p className="text-[#809BB0] font-body text-[14px] max-w-[250px] mb-8">
          Tu plaza ha sido asegurada. El cuadro del torneo se actualizará en breve.
        </p>
        <button onClick={() => setStack(null)} className="w-full bg-[#00E5FF] text-[#060814] shadow-[0_0_15px_#00E5FF] font-display font-bold uppercase py-3.5 rounded-lg tracking-widest text-[15px]">
          VOLVER AL LOBBY
        </button>
      </div>
    );
  }

  /* ---------- RENDER ---------- */

  let content;
  if (stack?.screen === "detail") content = <DetailScreen />;
  else if (stack?.screen === "payment") content = <PaymentScreen />;
  else if (stack?.screen === "success") content = <SuccessScreen />;
  else if (tab === "list") content = <ListScreen />;
  else if (tab === "profile") content = <ProfileScreen />;

  const showBottomNav = !stack;

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-6 bg-[#020205]">
      <style>{FONT_STYLE}</style>
      
      {/* Contenedor Móvil Principal */}
      <div className="relative w-[380px] h-[760px] bg-space rounded-[36px] border-2 border-[#00E5FF]/20 overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,229,255,0.15)]">
        
        {/* Screen Content */}
        <div className="flex-1 overflow-y-auto scrollbar-none pt-4 relative z-10">
          {content}
        </div>

        {/* Bottom Navigation Sci-Fi Bar */}
        {showBottomNav && (
          <div className="relative flex items-center justify-between border-t border-[#00E5FF]/30 bg-[#060814]/90 backdrop-blur-md px-6 h-[75px] z-20">
            
            <button onClick={() => setTab("list")} className={`flex flex-col items-center gap-1 w-16 ${tab === "list" ? "text-[#00E5FF] drop-shadow-[0_0_5px_#00E5FF]" : "text-[#506070]"}`}>
              <Home size={22} />
              <span className="font-display text-[9px] font-bold uppercase tracking-wider">Inicio</span>
            </button>

            <button className={`flex flex-col items-center gap-1 w-16 text-[#506070]`}>
              <Trophy size={22} />
              <span className="font-display text-[9px] font-bold uppercase tracking-wider">Torneos</span>
            </button>

            {/* Central "+" Button Elevated */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-6">
              <button onClick={() => setTab("create")} className="w-16 h-16 bg-[#060814] border-2 border-[#00E5FF] rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)_inset,0_4px_15px_rgba(0,0,0,0.5)] text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors">
                 <Plus size={28} />
                 <span className="text-[9px] font-display font-bold uppercase mt-1">Créate</span>
              </button>
            </div>

            <button onClick={() => setTab("profile")} className={`flex flex-col items-center gap-1 w-16 ml-16 ${tab === "profile" ? "text-[#00E5FF] drop-shadow-[0_0_5px_#00E5FF]" : "text-[#506070]"}`}>
              <User size={22} />
              <span className="font-display text-[9px] font-bold uppercase tracking-wider">Perfil</span>
            </button>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#00E5FF]/20 border border-[#00E5FF] text-white text-[12px] font-body px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(0,229,255,0.4)] max-w-[90%] text-center z-50 backdrop-blur-md">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
