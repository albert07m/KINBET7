import React, { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import { 
  Trophy, Users, Plus, User, ChevronLeft, CreditCard, Wallet,
  CheckCircle2, Clock, ShieldCheck, X, AlertCircle, Lock,
  Loader2, Gamepad2, Monitor, Link2, Check, Coins, RefreshCw 
} from "lucide-react";

// ... [Aquí mantienes TODAS tus funciones auxiliares: NAME_POOL, pickName, generateBracket, etc.] ...

export default function App() {
  // ... [Aquí mantienes todos tus estados: useState, etc.] ...

  // ... [Aquí mantienes todos tus useEffect y funciones de lógica: persistTournaments, etc.] ...

  // ---------- RENDER ----------

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
  // ... [Tu lógica de if/else para 'content'] ...

  const showBottomNav = isAuthenticated && !stack;

  return (
    <div className="w-full flex items-center justify-center py-6 bg-[#030503]">
      <style>{FONT_STYLE}</style>
      <div className="font-body relative w-[380px] h-[760px] bg-[#050807] rounded-[36px] border border-[#1C2B1E] shadow-2xl overflow-hidden flex flex-col">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#030503] rounded-b-2xl z-20" />
        <div className="flex-1 overflow-y-auto scrollbar-none pt-4">{content}</div>
        
        {showBottomNav && (
          <div className="flex items-center justify-around border-t border-[#1C2B1E] bg-[#050807] py-2.5 px-2">
            <NavBtn icon={Trophy} label="Torneos" active={tab === "list"} onClick={() => setTab("list")} />
            <NavBtn icon={Plus} label="Crear" active={tab === "create"} onClick={() => setTab("create")} />
            <NavBtn icon={User} label="Perfil" active={tab === "profile"} onClick={() => setTab("profile")} />
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
