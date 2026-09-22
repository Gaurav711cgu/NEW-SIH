import { useEffect, useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';

export default function ComponentInspector() {
  const selectedComponentId = useSimulationStore((s) => s.selectedComponent);
  const components = useSimulationStore((s) => s.components);
  const setSelectedComponent = useSimulationStore((s) => s.setSelectedComponent);

  const [visible, setVisible] = useState(false);

  const component = components.find((c) => c.id === selectedComponentId);

  useEffect(() => {
    if (component) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [component]);

  if (!component) return null;

  const healthColor = component.health > 70 ? 'bg-ice-500' : component.health > 30 ? 'bg-yellow-400' : 'bg-[#ff453a]';
  const statusColor = component.status === 'NOMINAL' ? 'bg-ice-500' : component.status === 'WARNING' ? 'bg-yellow-400' : 'bg-[#ff453a]';

  return (
    <div className={`p-4 bg-[#020617] border border-steel-800/80 rounded mt-4 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-sm font-bold text-steel-100 text-[22px] tracking-tight">{component.name}</h2>
        <button 
          onClick={() => setSelectedComponent(null)}
          className="text-steel-400 hover:text-steel-100 text-xs"
        >
          ✕
        </button>
      </div>
      <div className="inline-block px-2 py-0.5 text-[10px] bg-[#1c1c1e] text-steel-100 rounded mb-4">
        {component.category}
      </div>

      <div className="space-y-1 text-xs text-steel-400 mb-4">
        <p><span className="text-steel-400">Hardware:</span> {component.hardware}</p>
        <p><span className="text-steel-400">Local Cost:</span> ₹{component.costINR.toLocaleString()}</p>
        <p><span className="text-steel-400">Import Cost:</span> <span className="line-through text-[#ebebf57a]">₹{component.importedCostINR.toLocaleString()}</span></p>
        <p className="text-ice-400 font-semibold mt-1">
          Cost Savings: {(component.importedCostINR / component.costINR).toFixed(1)}x
        </p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-steel-400">Health</span>
          <span className="text-steel-100">{component.health}%</span>
        </div>
        <div className="w-full bg-[#1c1c1e] h-1.5 rounded-full overflow-hidden">
          <div className={`h-full ${healthColor}`} style={{ width: `${component.health}%` }} />
        </div>
      </div>

      <div className="space-y-1 mb-4 border-t border-steel-800/80 pt-3">
        <h3 className="text-[10px] font-bold text-steel-400 uppercase tracking-wider mb-2">Specifications</h3>
        {Object.entries(component.specs).map(([key, value]) => (
          <div key={key} className="flex justify-between text-xs">
            <span className="text-steel-400">{key}:</span>
            <span className="text-steel-100 text-right">{String(value)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center text-xs font-bold border-t border-steel-800/80 pt-3">
        <div className={`w-2 h-2 rounded-full mr-2 ${statusColor}`} />
        <span className={component.status === 'NOMINAL' ? 'text-ice-400' : component.status === 'WARNING' ? 'text-yellow-400' : 'text-[#ff453a]'}>
          {component.status}
        </span>
      </div>
    </div>
  );
}
