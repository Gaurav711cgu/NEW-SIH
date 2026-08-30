const fs = require('fs');
const file = '/Users/gauravkumarnayak/Desktop/new sih/frontend/src/pages/SeafloorIntelligence.tsx';
let content = fs.readFileSync(file, 'utf8');

const startMarker = '{!previewUrl ? (';
const endMarker = '{/* Change file button */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

const replacement = `{!previewUrl ? (
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => inputRef.current?.click()}
              className={\`relative rounded-xl border-2 border-dashed cursor-pointer
                          flex flex-col items-center justify-center gap-4 p-12 min-h-[400px]
                          transition-all duration-300
                          \${isDragging
                            ? 'border-ice-500 bg-ice-500/5 scale-[1.01]'
                            : 'border-steel-700 bg-ocean-800/40 hover:border-ice-500/50 hover:bg-ocean-800/60'
                          }\`}
            >
              {/* Pulsing sonar rings */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-ice-500/10 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-ocean-700/80 border border-ice-500/30
                                flex items-center justify-center">
                  <Target size={28} className="text-ice-500" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold font-mono text-ice-100 tracking-wider">
                  DROP SONAR WATERFALL
                </p>
                <p className="text-xs text-steel-400 mt-1">or click to browse · Interactive Map View</p>
              </div>
              <input ref={inputRef} type="file" accept="image/*"
                className="hidden" onChange={onInputChange} />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-ice-500 tracking-widest flex items-center gap-2">
                    <div className={\`w-2 h-2 rounded-full \${isProcessing ? 'bg-ice-500 animate-ping' : 'bg-steel-500'}\`} />
                    INTERACTIVE SONAR MAP (DRAG TO PAN, SCROLL TO ZOOM)
                  </span>
                </div>
              </div>
              
              <div className="relative rounded-xl overflow-hidden border border-ice-500/30 bg-[#020617] group"
                   style={{ height: '500px' }}>
                
                {/* HOLLYWOOD SCANLINE EFFECT */}
                {stage === 'inferencing' && (
                  <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
                    <motion.div 
                      className="w-full h-1 bg-ice-400 shadow-[0_0_20px_4px_#00e5ff]"
                      initial={{ y: 0 }}
                      animate={{ y: 500 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-0 bg-ice-500/5 animate-pulse mix-blend-overlay" />
                  </div>
                )}
                
                {/* SHADOW VALIDATION EFFECT */}
                {stage === 'calibrating' && (
                  <div className="absolute inset-0 z-50 pointer-events-none bg-health-critical/10 mix-blend-color-burn animate-pulse flex items-center justify-center">
                    <span className="text-health-critical font-mono font-bold tracking-widest text-2xl drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] border-2 border-health-critical px-4 py-2 bg-black/50">
                      CALCULATING ACOUSTIC SHADOWS...
                    </span>
                  </div>
                )}
                
                {/* PREPROCESSING EFFECT */}
                {stage === 'preprocessing' && (
                  <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/40">
                    <span className="text-ice-400 font-mono font-bold tracking-widest text-lg drop-shadow-[0_0_10px_rgba(0,229,255,0.8)] border border-ice-500 px-4 py-2 bg-black/50">
                      APPLYING CLAHE NOISE REDUCTION
                    </span>
                  </div>
                )}

                <TransformWrapper
                  initialScale={1}
                  minScale={0.5}
                  maxScale={8}
                  centerOnInit={true}
                  wheel={{ step: 0.1 }}
                >
                  <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img 
                        ref={rawImgRef} 
                        src={previewUrl}
                        alt="Sonar map"
                        className={\`max-w-none max-h-none transition-all duration-1000 \${
                          stage === 'preprocessing' || stage === 'calibrating' || stage === 'inferencing' || stage === 'done' 
                            ? 'contrast-[1.3] brightness-[1.1] grayscale sepia-[0.2] hue-rotate-[180deg]' 
                            : ''
                        }\`} 
                        style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                      />
                      
                      {/* Bounding Box Canvas Overlay */}
                      <canvas 
                        ref={canvasRef}
                        className={\`absolute inset-0 pointer-events-none transition-opacity duration-500 \${stage === 'done' ? 'opacity-100' : 'opacity-0'}\`}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </TransformComponent>
                </TransformWrapper>
              </div>

              `;

content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
fs.writeFileSync(file, content);
