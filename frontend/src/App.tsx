import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { MissionProvider } from './components/layout/MissionContext';
import { OceanState } from './pages/OceanState';
import { Biogeochemistry } from './pages/Biogeochemistry';
import { SeafloorIntelligence } from './pages/SeafloorIntelligence';
import { MissionControl } from './pages/MissionControl';
import AUVTwin from './pages/AUVTwin';
import { GovernmentIntel } from './pages/GovernmentIntel';
import ResearchCitations from './pages/ResearchCitations';
import { ModelValidation } from './pages/ModelValidation';

import bgImage from './assets/new_bg1.jpg';

function App() {
  return (
    <MissionProvider>
      <BrowserRouter>
        {/* Background Image */}
        <div 
          className="fixed inset-0 w-full h-full z-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        
        <div className="flex h-screen bg-abyss-950/90 text-steel-100 font-sans selection:bg-ice-500/30 overflow-hidden relative z-10 backdrop-blur-sm">
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
              <Route path="/validation" element={<ModelValidation />} />
              <Route path="/research" element={<ResearchCitations />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </MissionProvider>
  );
}

export default App;

