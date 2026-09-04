import { NavLink } from 'react-router-dom';
import { Activity, Anchor, Waves, Target, Cpu, FileText, BookOpen, ShieldCheck, BarChart4 } from 'lucide-react';
import { SystemStatusRow } from './SystemStatusRow';

const navItems = [
  { path: '/ocean-state', label: 'Ocean State', icon: Waves },
  { path: '/intel', label: 'MoES Intel Report', icon: FileText },
  { path: '/biogeo', label: 'Biogeochemistry', icon: Activity },
  { path: '/seafloor', label: 'Seafloor Intel', icon: Target },
  { path: '/mission', label: 'Mission Control', icon: Anchor },
  { path: '/auv-twin', label: 'AUV Digital Twin', icon: Cpu },
  { path: '/validation', label: 'Model Validation', icon: BarChart4 },
  { path: '/research', label: 'Research & Citations', icon: BookOpen },
];

export function Sidebar() {
  return (
    <nav aria-label="Main Navigation" className="relative z-10 w-20 md:w-64 bg-abyss-900/80 backdrop-blur-xl border-r border-steel-800/60 flex flex-col flex-shrink-0 transition-all duration-300">
      <NavLink to="/" className="p-3 md:p-4 flex items-center justify-center md:justify-start gap-3 hover:opacity-90 transition-opacity border-b border-steel-800/60">
        <div className="w-10 h-10 flex-shrink-0 rounded-md bg-white p-0.5 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden flex items-center justify-center">
          <img src="/aquila-logo.jpg" alt="AQUILA Logo" className="w-full h-full object-cover rounded-md" />
        </div>
        <div className="hidden md:block overflow-hidden">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-extrabold text-base tracking-wider text-ice-100 whitespace-nowrap">AQUILA</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900/50 text-zinc-300 border border-white/10 font-bold">OS</span>
          </div>
          <p className="text-[8px] font-mono text-steel-400 uppercase tracking-tight leading-tight truncate">
            Ocean Observation &amp; Seafloor Intel
          </p>
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
                  ? 'bg-abyss-700/65 text-ice-100 border border-ice-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                  : 'text-steel-400 hover:bg-abyss-800/50 hover:text-ice-200 border border-transparent'
              }`
            }
            title={item.label}
          >
            <item.icon className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="hidden md:block whitespace-nowrap">{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Atmanirbhar Bharat Indigenous Badge */}
      <div className="hidden md:block mx-3 my-2 p-2.5 rounded-lg bg-zinc-900/50 border border-white/10 font-mono text-[10px]">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-0.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ATMANIRBHAR BHARAT</span>
        </div>
        <div className="text-steel-400 text-[9px] leading-tight">
          Sovereign Ocean Tech · 100% Domestic AI & Hardware
        </div>
      </div>

      <SystemStatusRow />
    </nav>
  );
}
