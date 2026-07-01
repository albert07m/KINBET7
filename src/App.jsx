import React, { useState } from "react";
import RegistrationScreen from "./components/RegistrationScreen";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState("list"); // Controla qué pantalla vemos

    <div className="min-h-screen bg-[#030503] text-[#EAFBE9]">
      {!isAuthenticated ? (
        // Si no está registrado, muestra registro
        <RegistrationScreen onComplete={() => setIsAuthenticated(true)} />
      ) : (
        // Si ya está registrado, muestra la lista de torneos
        <TournamentList 
          tournaments={MOCK_TOURNAMENTS} 
          onOpen={(id) => console.log("Abriendo torneo:", id)} 
        />
      )}
    </div>
  );
}
