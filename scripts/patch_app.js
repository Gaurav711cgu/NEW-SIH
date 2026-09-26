const fs = require('fs');

let content = fs.readFileSync('convectnow/frontend/src/App.tsx', 'utf8');

// We need to add state for replay events and selected event
if (!content.includes('const [replayEvents, setReplayEvents]')) {
    content = content.replace(
        'const [stormData, setStormData] = useState<any>(null);',
        `const [stormData, setStormData] = useState<any>(null);\n  const [replayEvents, setReplayEvents] = useState<any[]>([]);\n  const [selectedEventId, setSelectedEventId] = useState<string>('0');`
    );
}

// Update useEffect to fetch the list of events
if (!content.includes('fetchReplayEvents')) {
    const fetchEventsBlock = `
  const fetchReplayEvents = async () => {
    try {
      const res = await fetch('http://localhost:8008/api/replay/events');
      if (res.ok) {
        const data = await res.json();
        setReplayEvents(data.events || []);
      }
    } catch (e) {
      console.error('Failed to fetch replay events:', e);
    }
  };

  useEffect(() => {
    fetchReplayEvents();
  }, []);
`;
    content = content.replace('const fetchStorm =', fetchEventsBlock + '\n  const fetchStorm =');
}

// Modify the Timeline Scrubber HTML to include a dropdown and VCR controls
const scrubberRegex = /<div className="h-16 card-blizzard rounded-full px-6 flex items-center justify-between shrink-0 shadow-\[0_4px_24px_rgba\(0,0,0,0\.4\)\] border border-white\/10">([\s\S]*?)<\/div>\s*<\/section>/;

const newScrubber = `<div className="h-20 card-blizzard rounded-3xl px-6 flex flex-col justify-center shrink-0 shadow-[0_4px_24px_rgba(0,0,0,0.4)] border border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#131928]/90 via-transparent to-[#131928]/90 pointer-events-none"></div>
              
              <div className="flex items-center justify-between relative z-10">
                {/* VCR Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setLeadTimeMin(prev => Math.max(0, prev - 5));
                    }}
                    className="p-2 rounded-full bg-[#131928] hover:bg-[#1a233a] text-slate-400 hover:text-white border border-white/10 transition-all active:scale-95 shadow-sm"
                    title="Step Backward"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-3 rounded-full bg-gradient-to-br from-[#38a8ff] to-[#0070f3] text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(56,168,255,0.4)]"
                    title={isPlaying ? "Pause Forecast Loop" : "Play Forecast Loop"}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setLeadTimeMin(0);
                    }}
                    className="p-2 rounded-full bg-[#131928] hover:bg-[#1a233a] text-slate-400 hover:text-white border border-white/10 transition-all active:scale-95 shadow-sm"
                    title="Reset to T0 Analysis"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>

                {/* Scrubber slider */}
                <div className="flex-1 max-w-2xl mx-6 flex items-center space-x-4">
                  <span className="text-[11px] font-mono font-semibold text-slate-300 whitespace-nowrap">
                    T0 (Live)
                  </span>
                  <div className="relative flex-1 group">
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="5"
                      value={leadTimeMin}
                      onChange={(e) => {
                        setIsPlaying(false);
                        setLeadTimeMin(parseInt(e.target.value));
                      }}
                      className="w-full accent-[#38a8ff] cursor-pointer h-2 bg-[#1a233a] rounded-full appearance-none outline-none group-hover:bg-[#222d4a] transition-colors"
                      style={{
                        background: \`linear-gradient(to right, #38a8ff \${(leadTimeMin / 60) * 100}%, #1a233a \${(leadTimeMin / 60) * 100}%)\`
                      }}
                    />
                    <div className="absolute -top-6 left-0 right-0 flex justify-between text-[9px] text-slate-500 font-mono px-1 pointer-events-none">
                      <span>0m</span>
                      <span>15m</span>
                      <span>30m</span>
                      <span>45m</span>
                      <span>60m</span>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-white font-bold whitespace-nowrap min-w-[75px] bg-[#1a233a] px-3 py-1.5 rounded-lg border border-[#38a8ff]/30 text-center shadow-inner">
                    +{leadTimeMin} min
                  </span>
                </div>

                {/* Historical Event Selector */}
                <div className="flex items-center space-x-3">
                  <div className="text-right text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Historical Replay
                  </div>
                  <select 
                    className="bg-[#0f1423] text-xs font-mono text-[#38a8ff] border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#38a8ff]/50 shadow-inner cursor-pointer"
                    value={selectedEventId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedEventId(val);
                      fetchStorm(parseInt(val) || 0);
                      fetchEvaluation(parseInt(val) || 0);
                      setLeadTimeMin(0);
                      setIsPlaying(false);
                    }}
                  >
                    <option value="0">SEVIR-2019-0612 (Oklahoma)</option>
                    <option value="1">IMD-2023-0814 (Uttarakhand)</option>
                    <option value="2">MOSDAC-2024-0511 (Mumbai)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>`;

content = content.replace(scrubberRegex, newScrubber);

fs.writeFileSync('convectnow/frontend/src/App.tsx', content);
console.log("App.tsx patched");
