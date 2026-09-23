import { NavLink } from 'react-router-dom';
import { Activity, Anchor, Waves, Target, Cpu, FileText, BookOpen, ShieldCheck, BarChart4, Compass, Layers } from 'lucide-react';
import { SystemStatusRow } from './SystemStatusRow';

const navItems = [
  { path: '/ocean-state', label: 'Ocean State', icon: Waves },
  { path: '/intel', label: 'MoES Intel Report', icon: FileText },
  { path: '/system-architecture', label: 'Proposed System', icon: Cpu },
  { path: '/biogeo', label: 'Biogeochemistry', icon: Activity },
  { path: '/seafloor', label: 'Seafloor Intel', icon: Target },
  { path: '/mission', label: 'Mission Control', icon: Anchor },
  { path: '/simulation', label: '3D Tactical Digital Twin', icon: Compass },
  { path: '/auv-twin', label: 'AUV Digital Twin', icon: Cpu },
  { path: '/digital-twin', label: 'Digital Twin', icon: Activity },
  { path: '/validation', label: 'Model Validation', icon: BarChart4 },
  { path: '/cyclegan', label: 'Neural Acoustic Augmentation', icon: Layers },
  { path: '/research', label: 'Research & Citations', icon: BookOpen },
];

export function Sidebar() {
  return (
    <nav aria-label="Main Navigation" className="relative z-10 w-20 md:w-64 bg-[#1c1c1e]/80 backdrop-blur-[20px] border-r border-[#38383a] flex flex-col flex-shrink-0 transition-all duration-300">
      <NavLink to="/" className="p-3 md:p-4 flex items-center justify-center md:justify-start gap-3 hover:opacity-90 transition-opacity border-b border-[#38383a]">
        <div className="w-10 h-10 flex-shrink-0 rounded-md bg-white p-0.5 border border-[#38383a] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden flex items-center justify-center">
          <img src="/aquila-logo.jpg" alt="AQUILA Logo" className="w-full h-full object-cover rounded-md" />
        </div>
        <div className="hidden md:block overflow-hidden">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-extrabold text-base tracking-wider text-[#ffffff] whitespace-nowrap">AQUILA</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#2c2c2e] text-[#ebebf5] border border-[#38383a] font-bold">OS</span>
          </div>
          <p className="text-[8px] font-mono text-[#ebebf599] uppercase tracking-tight leading-tight truncate">
            Ocean Observation &amp; Seafloor Intel
          </p>
        </div>
      </NavLink>

      <div className="flex-1 py-4 flex flex-col gap-1 px-2 md:px-3 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-center md:justify-start gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-[#2c2c2e] text-[#ffffff] border border-[#38383a] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                  : 'text-[#ebebf599] hover:bg-[#2c2c2e]/50 hover:text-[#ffffff] border border-transparent'
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
      <div className="hidden md:block mx-3 my-2 p-2.5 rounded-lg bg-[#2c2c2e] border border-[#38383a] font-mono text-[10px]">
        <div className="flex items-center gap-1.5 text-[#34c759] font-bold mb-0.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ATMANIRBHAR BHARAT</span>
        </div>
        <div className="text-[#ebebf599] text-[9px] leading-tight">
          Sovereign Ocean Tech · 100% Domestic AI & Hardware
        </div>
      </div>

      <SystemStatusRow />
    </nav>
  );
}
