
import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { OceanState } from './pages/OceanState';
import { Biogeochemistry } from './pages/Biogeochemistry';
import { SeafloorIntelligence } from './pages/SeafloorIntelligence';
import { MissionControl } from './pages/MissionControl';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<OceanState />} />
        <Route path="biogeochemistry" element={<Biogeochemistry />} />
        <Route path="seafloor" element={<SeafloorIntelligence />} />
        <Route path="mission" element={<MissionControl />} />
      </Route>
    </Routes>
  );
}
