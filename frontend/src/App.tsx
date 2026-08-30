import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { OceanState } from './pages/OceanState';
import { Biogeochemistry } from './pages/Biogeochemistry';
import { SeafloorIntelligence } from './pages/SeafloorIntelligence';
import { MissionControl } from './pages/MissionControl';
import AUVTwin from './pages/AUVTwin';
import { GovernmentIntel } from './pages/GovernmentIntel';
import ResearchCitations from './pages/ResearchCitations';

function App() {
  return (
    <BrowserRouter>
      {/* AQUILA OVERLAYS */}
      <div className="scanlines"></div>
      <div className="crt-flicker"></div>
      
      <div className="flex h-screen bg-abyss-950 text-steel-100 font-sans selection:bg-ice-500/30 overflow-hidden relative z-10">
        <Sidebar />
        <main className="flex-1 overflow-hidden relative bg-abyss-900/50">
          <Routes>
            <Route path="/" element={<Navigate to="/ocean-state" replace />} />
            <Route path="/ocean-state" element={<OceanState />} />
            <Route path="/intel" element={<GovernmentIntel />} />
            <Route path="/biogeo" element={<Biogeochemistry />} />
            <Route path="/seafloor" element={<SeafloorIntelligence />} />
            <Route path="/mission" element={<MissionControl />} />
            <Route path="/auv-twin" element={<AUVTwin />} />
            <Route path="/research" element={<ResearchCitations />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
