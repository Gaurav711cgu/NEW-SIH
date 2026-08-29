import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Anchor, Waves, Target } from 'lucide-react';
import { SystemStatusRow } from './SystemStatusRow';
import { MissionProvider } from './MissionContext';

const navItems = [
  { path: '/', label: 'Ocean State', icon: Waves },
  { path: '/biogeochemistry', label: 'Biogeochemistry', icon: Activity },
  { path: '/seafloor', label: 'Seafloor Intel', icon: Target },
  { path: '/mission', label: 'Mission Control', icon: Anchor },
];

const bgImages = [
  '/src/assets/bg1.jpg',
  '/src/assets/bg2.jpg',
  '/src/assets/bg3.jpg',
  '/src/assets/bg4.jpg',
];

export function AppShell() {
  const location = useLocation();
  
  const bgIndex = Math.max(0, navItems.findIndex(i => i.path === location.pathname));
  const bgImage = bgImages[bgIndex];

  return (
    <MissionProvider>
      <div className="flex h-screen w-full bg-ocean-950 text-ice-100 overflow-hidden font-sans">
        
        {/* Background Canvas */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={bgImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url('${bgImage}')`,
                filter: 'saturate(0.6) brightness(0.7)'
              }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-ocean-950/40 mix-blend-multiply" />
        </div>

        {/* Sidebar - Collapses to 5rem (20) on small screens, expands to 16rem (64) on md */}
        <nav className="relative z-10 w-20 md:w-64 bg-ocean-900/80 backdrop-blur-xl border-r border-steel-800/60 flex flex-col flex-shrink-0 transition-all duration-300">
          <NavLink to="/" className="p-4 md:p-6 flex justify-center md:justify-start hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 flex-shrink-0 rounded bg-ice-500/10 border border-ice-500/30 flex items-center justify-center">
                <Anchor className="w-4 h-4 text-ice-500" />
              </div>
              <div className="hidden md:block overflow-hidden">
                <h1 className="font-sans font-bold text-sm tracking-wide text-ice-100 whitespace-nowrap">AQUILA</h1>
              </div>
            </div>
          </NavLink>

          <div className="flex-1 py-4 flex flex-col gap-1 px-2 md:px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-center md:justify-start gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-ocean-700/65 text-ice-100 border border-ice-500/20 shadow-[0_0_30px_-8px_rgba(0,229,255,0.12)]'
                      : 'text-steel-400 hover:bg-ocean-800/50 hover:text-ice-200 border border-transparent'
                  }`
                }
                title={item.label}
              >
                <item.icon className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0" />
                <span className="hidden md:block whitespace-nowrap">{item.label}</span>
              </NavLink>
            ))}
          </div>

          <SystemStatusRow />
        </nav>

        {/* Main Content Area */}
        <main className="relative z-20 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
          <div className="max-w-[1440px] mx-auto h-full">
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </div>
        </main>
      </div>
    </MissionProvider>
  );
}
