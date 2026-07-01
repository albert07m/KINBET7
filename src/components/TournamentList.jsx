import React from 'react';
import { Users, Clock } from 'lucide-react';

export default function TournamentList({ tournaments, onOpen }) {
  return (
    <div className="p-4 space-y-4">
      <h2 className="font-display text-[24px] font-semibold text-[#EAFBE9]">Torneos</h2>
      
      {tournaments.map((t) => (
        <button
          key={t.id}
          onClick={() => onOpen(t.id)}
          className="w-full text-left bg-[#0B120D] border border-[#1C2B1E] rounded-xl p-4 transition-transform active:scale-[0.99]"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-display text-[17px] text-[#EAFBE9]">{t.name}</h3>
            <span className="text-[#39FF6A] font-mono">{t.fee} RC</span>
          </div>
          
          <div className="flex items-center gap-4 text-[12px] text-[#7C9482]">
            <span className="flex items-center gap-1"><Users size={12} /> {t.filled}/{t.size}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {t.closesIn}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
