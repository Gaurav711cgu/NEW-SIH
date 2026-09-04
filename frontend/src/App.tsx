import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

import new_bg1 from './assets/new_bg1.jpg';
import new_bg2 from './assets/new_bg2.jpg';
import new_bg3 from './assets/new_bg3.jpg';
import bg1 from './assets/bg1.jpg';
import bg2 from './assets/bg2.jpg';
import bg3 from './assets/bg3.jpg';
import bg4 from './assets/bg4.jpg';

const BackgroundWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  let bgImage = new_bg1;
  if (location.pathname.includes('/seafloor')) bgImage = new_bg2;
  else if (location.pathname.includes('/biogeo')) bgImage = bg2;
  else if (location.pathname.includes('/intel')) bgImage = new_bg3;
  else if (location.pathname.includes('/mission')) bgImage = bg4;
  else if (location.pathname.includes('/auv-twin')) bgImage = bg3;
  else if (location.pathname.includes('/validation')) bgImage = bg1;
  else if (location.pathname.includes('/research')) bgImage = new_bg2;

  return (
    <>
      {/* Background Image */}
      <div 
        className="fixed inset-0 w-full h-full z-0 opacity-50 pointer-events-none transition-all duration-700 ease-in-out"
        style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      {children}
    </>
  );
};

function App() {
  return (
    <MissionProvider>
      <BrowserRouter>
        <BackgroundWrapper>
          {/* Skip to Main Content Link (WCAG 2.4.1) */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-cyan-300"
          >
            Skip to main content
          </a>
          
          <div className="flex h-screen bg-abyss-950/60 text-steel-100 font-sans selection:bg-ice-500/30 overflow-hidden relative z-10 backdrop-blur-sm">
            <Sidebar />
            <main id="main-content" tabIndex={-1} className="flex-1 overflow-hidden relative bg-abyss-900/30">
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
                <Route path="*" element={<Navigate to="/ocean-state" replace />} />
              </Routes>
            </main>
          </div>
        </BackgroundWrapper>
      </BrowserRouter>
    </MissionProvider>
  );
}

export default App;
