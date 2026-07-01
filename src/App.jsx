// ... (Tus imports, funciones auxiliares y componentes se mantienen igual hasta App)

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  // ... (Tus useEffect y funciones como persistTournaments, createTournament, etc. se mantienen igual)

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

  const showBottomNav = isAuthenticated && !stack;

  return (
    <div className="w-full flex items-center justify-center py-6 bg-[#030503]">
      <style>{FONT_STYLE}</style>
      <div
        className="font-body relative w-[380px] h-[760px] bg-[#050807] rounded-[36px] border border-[#1C2B1E] shadow-2xl overflow-hidden flex flex-col"
        style={{ boxShadow: "0 0 0 1px #1C2B1E, 0 0 60px -12px rgba(57,255,106,0.35), 0 0 100px -20px rgba(255,201,60,0.15)" }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#030503] rounded-b-2xl z-20" />
        <div className="flex-1 overflow-y-auto scrollbar-none pt-4">{content}</div>

        {showBottomNav && (
          <div className="flex items-center justify-around border-t border-[#1C2B1E] bg-[#050807] py-2.5 px-2">
            <NavBtn icon={Trophy} label="Torneos" active={tab === "list"} onClick={() => setTab("list")} />
            <NavBtn icon={Plus} label="Crear" active={tab === "create"} onClick={() => setTab("create")} />
            <NavBtn icon={User} label="Perfil" active={tab === "profile"} onClick={() => setTab("profile")} />
          </div>
        )}

        {/* ... (Tus bloques de modales: toast, linkModal, resultModal) ... */}
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
