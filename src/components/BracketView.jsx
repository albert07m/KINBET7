import React from 'react';

export default function BracketView({ bracket }) {
  if (!bracket) return null;

  return (
    <div className="flex gap-6 p-4 overflow-x-auto">
      {bracket.map((round, ri) => (
        <div key={round.name} className="flex flex-col gap-4 min-w-[200px]">
          <h3 className="text-[11px] uppercase tracking-wider text-[#7C9482] font-display">{round.name}</h3>
          <div className="flex flex-col gap-2">
            {round.matches.map((m) => (
              <div key={m.id} className="bg-[#0B120D] border border-[#1C2B1E] rounded-lg p-3 text-[12px]">
                <div className="flex justify-between py-1 border-b border-[#1C2B1E]">
                  <span className="text-[#EAFBE9]">{m.p1 || "---"}</span>
                  <span className="text-[#39FF6A] font-mono">{m.score1 ?? "-"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#EAFBE9]">{m.p2 || "---"}</span>
                  <span className="text-[#39FF6A] font-mono">{m.score2 ?? "-"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
