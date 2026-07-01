import React, { useState } from "react";
import RegistrationScreen from "./components/RegistrationScreen";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="min-h-screen bg-[#030503] font-body text-[#EAFBE9]">
      {/* Si no está autenticado, mostramos la pantalla de registro */}
      {!isAuthenticated ? (
        <RegistrationScreen onComplete={() => setIsAuthenticated(true)} />
      ) : (
        <div className="flex items-center justify-center h-screen">
          <h1 className="text-2xl font-display uppercase tracking-widest text-[#39FF6A]">
            Bienvenido a Kinbet
          </h1>
        </div>
      )}
    </div>
  );
}
