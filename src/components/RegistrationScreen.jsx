import React, { useState } from 'react';
import { Gamepad2, Link2, ShieldCheck } from 'lucide-react';

export default function RegistrationScreen({ onComplete }) {
  const [platform, setPlatform] = useState(null);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 bg-[#050807] min-h-screen text-[#EAFBE9]">
      {/* Header */}
      <div className="flex flex-col items-center my-8">
        <div className="w-12 h-12 rounded-xl border border-[#39FF6A] flex items-center justify-center mb-3 bg-[#050807]">
          <span className="font-display text-[22px] font-bold">K</span>
        </div>
        <h1 className="font-display text-[20px] font-bold tracking-wide">ÚNETE A KINBET</h1>
        <p className="text-[#7C9482] text-[11px] text-center mt-1">
          Apuestas 1v1 y Torneos de FC26 en España y Latinoamérica.
        </p>
      </div>

      {/* Formulario */}
      <div className="w-full bg-[#0B120D] border border-[#1C2B1E] rounded-xl p-4 space-y-4">
        
        {/* Sección Cuenta */}
        <div>
          <div className="font-display text-[10px] uppercase text-[#39FF6A] mb-3">Registrar nueva cuenta</div>
          <input type="email" placeholder="nombre@correo.com" className="w-full mb-3 bg-[#050807] border border-[#1C2B1E] rounded-md px-3 py-2 text-[13px] outline-none focus:border-[#39FF6A]" />
          <input type="password" placeholder="••••••••" className="w-full bg-[#050807] border border-[#1C2B1E] rounded-md px-3 py-2 text-[13px] outline-none focus:border-[#39FF6A]" />
        </div>

        {/* Sincronización */}
        <div className="border border-[#1C2B1E] rounded-md p-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase text-[#7C9482] mb-3">
            <Link2 size={12} /> Sincroniza tu consola
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['PSN', 'Xbox', 'EA App'].map(p => (
              <button key={p} onClick={() => setPlatform(p)} className={`py-2 rounded-md border ${platform === p ? 'border-[#39FF6A] bg-[#39FF6A]/10' : 'border-[#1C2B1E]'}`}>
                <Gamepad2 size={16} className="mx-auto mb-1" />
                <span className="text-[9px]">{p}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Botón Acción */}
        <button onClick={onComplete} className="w-full font-bold bg-[#39FF6A] text-[#050807] rounded-md py-3 mt-2">
          VERIFICAR Y EMPEZAR
        </button>
      </div>
    </div>
  );
}
