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

  const healthColor = component.health > 70 ? 'bg-[#34c759]' : component.health > 30 ? 'bg-[#ff9f0a]' : 'bg-[#ff453a]';
  const statusColor = component.status === 'NOMINAL' ? 'bg-[#34c759]' : component.status === 'WARNING' ? 'bg-[#ff9f0a]' : 'bg-[#ff453a]';

  return (
    <div className={`p-4 bg-[#000000] border border-[#38383a] rounded mt-4 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-sm font-bold text-[#ffffff] text-[22px] tracking-tight">{component.name}</h2>
        <button 
          onClick={() => setSelectedComponent(null)}
          className="text-[#ebebf599] hover:text-[#ffffff] text-xs"
        >
          ✕
        </button>
      </div>
      <div className="inline-block px-2 py-0.5 text-[10px] bg-[#1c1c1e] text-[#ffffff] rounded mb-4">
        {component.category}
      </div>

      <div className="space-y-1 text-xs text-[#ebebf599] mb-4">
        <p><span className="text-[#ebebf599]">Hardware:</span> {component.hardware}</p>
        <p><span className="text-[#ebebf599]">Local Cost:</span> ₹{component.costINR.toLocaleString()}</p>
        <p><span className="text-[#ebebf599]">Import Cost:</span> <span className="line-through text-[#ebebf57a]">₹{component.importedCostINR.toLocaleString()}</span></p>
        <p className="text-[#34c759] font-semibold mt-1">
          Cost Savings: {(component.importedCostINR / component.costINR).toFixed(1)}x
        </p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[#ebebf599]">Health</span>
          <span className="text-[#ffffff]">{component.health}%</span>
        </div>
        <div className="w-full bg-[#1c1c1e] h-1.5 rounded-full overflow-hidden">
          <div className={`h-full ${healthColor}`} style={{ width: `${component.health}%` }} />
        </div>
      </div>

      <div className="space-y-1 mb-4 border-t border-[#38383a] pt-3">
        <h3 className="text-[10px] font-bold text-[#ebebf599] uppercase tracking-wider mb-2">Specifications</h3>
        {Object.entries(component.specs).map(([key, value]) => (
          <div key={key} className="flex justify-between text-xs">
            <span className="text-[#ebebf599]">{key}:</span>
            <span className="text-[#ffffff] text-right">{String(value)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center text-xs font-bold border-t border-[#38383a] pt-3">
        <div className={`w-2 h-2 rounded-full mr-2 ${statusColor}`} />
        <span className={component.status === 'NOMINAL' ? 'text-[#34c759]' : component.status === 'WARNING' ? 'text-[#ff9f0a]' : 'text-[#ff453a]'}>
          {component.status}
        </span>
      </div>
    </div>
  );
}
