import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import React from "react";

export const NullIsland: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Drift Animation starting at frame 175
  const driftSpring = spring({
    frame: frame - 175,
    fps,
    config: { damping: 18, mass: 1.2, stiffness: 80 },
  }); // 0 to 1

  // Map coordinate range
  const gridMaxX = interpolate(driftSpring, [0, 1], [180, 20000000]);
  const gridMaxY = interpolate(driftSpring, [0, 1], [90, 10000000]);

  // Center of screen
  const center_x = 960;
  const center_y = 540;
  const gridWidth = 1200;
  const gridHeight = 600;

  // Real world coordinates of Shanghai are (121, 31)
  // Under degrees: 121 / 180 * 600 = +403px (Right)
  // Under meters: 121 / 20,000,000 * 600 = +0.003px (Virtually Center)
  const dotX = center_x + (121 / gridMaxX) * (gridWidth / 2);
  const dotY = center_y - (31 / gridMaxY) * (gridHeight / 2);


  // Deletion Phase timings
  const prjOpacity = interpolate(frame, [45, 55, 125, 135], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const prjScale = interpolate(frame, [45, 55], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Red cross animation over prj
  const crossOpacity = interpolate(frame, [75, 85, 125, 135], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Warning text "CRITICAL: SPATIAL REF MISSING" (glowing red warning banner)
  const warningOpacity = interpolate(frame, [85, 95, 160, 170], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Explain banner when unit switch begins
  const explainOpacity = interpolate(frame, [135, 145, 170, 175], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Ending drift text opacity
  const endingOpacity = interpolate(frame, [215, 230], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Labels for grids
  const unitLabelOpacityDeg = interpolate(driftSpring, [0, 0.3], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const unitLabelOpacityMeter = interpolate(driftSpring, [0.7, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Splash ripple when dot hits Null Island (starts around frame 200)
  const splashSpring = spring({
    frame: frame - 200,
    fps,
    config: { damping: 10, mass: 0.8 },
  }); // 0 to 1
  const splashScale = interpolate(splashSpring, [0, 1], [0.3, 2.5]);
  const splashOpacity = interpolate(splashSpring, [0, 0.8, 1], [0.9, 0.4, 0]);

  // Orbiting radar scanner angle
  const radarRotation = frame * 3.5;

  return (
    <div className="w-full h-full flex flex-col justify-between p-12 bg-[#0B0B0C] text-slate-100 select-none font-sans relative overflow-hidden">
      {/* Background space elements */}
      <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-teal-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800/80 pb-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-sm font-mono text-slate-400 tracking-wider">GIS PHENOMENON</span>
        </div>
        <h1 className="text-3xl tracking-widest text-slate-100 font-extrabold font-serif">
          “零度岛” <span className="text-slate-400 font-normal">(Null Island)</span> 产生原理
        </h1>
        <span className="text-xs font-mono text-slate-500">SECTION 02 / 04</span>
      </div>

      {/* Grid Scene Area */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden my-4 z-10">
        {/* Unit Indicator (HUD at the top of the map) */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-1.5 bg-slate-950/80 border border-slate-800 rounded-full text-xs font-mono flex items-center gap-2 z-20">
          <span className="text-slate-500">GRID UNIT:</span>
          <div className="relative w-28 h-5 flex items-center">
            <span style={{ opacity: unitLabelOpacityDeg }} className="text-teal-400 font-bold absolute inset-0 transition-opacity duration-300">
              度 (Degree)
            </span>
            <span style={{ opacity: unitLabelOpacityMeter }} className="text-blue-400 font-bold absolute inset-0 transition-opacity duration-300">
              米 (Meter)
            </span>
          </div>
        </div>

        {/* The Map Box */}
        <div className="w-[1200px] h-[600px] border border-slate-800/60 bg-slate-950/20 relative flex items-center justify-center rounded-2xl shadow-[inset_0_4px_30px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Subtle Grid dots background */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }}
          />

          {/* Glowing origin axes (Prime Meridian & Equator) */}
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-slate-700/60 to-transparent"></div>
          <div className="absolute h-full w-[2px] bg-gradient-to-b from-transparent via-slate-700/60 to-transparent"></div>

          {/* SVG Grid Overlay for labels & axes lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Equator / X-axis glow line */}
            <line x1="0" y1="300" x2="1200" y2="300" stroke="#334155" strokeWidth="1" />
            {/* Prime Meridian / Y-axis glow line */}
            <line x1="600" y1="0" x2="600" y2="600" stroke="#334155" strokeWidth="1" />
          </svg>

          {/* Grid lines & labels (Vertical) */}
          {[-0.75, -0.5, -0.25, 0.25, 0.5, 0.75].map((factor, idx) => {
            const labelDeg = `${Math.round(factor * 180)}°`;
            const labelMeter = `${(factor * 20000000 / 1000).toLocaleString()} km`;
            return (
              <React.Fragment key={`v-${idx}`}>
                <div
                  style={{ left: `${50 + factor * 50}%` }}
                  className="absolute h-full w-[1px] bg-slate-800/30"
                ></div>
                <div
                  style={{ left: `${50 + factor * 50}%` }}
                  className="absolute bottom-3 transform -translate-x-1/2 text-[10px] font-mono select-none"
                >
                  <span style={{ opacity: unitLabelOpacityDeg }} className="text-teal-500/50 absolute bottom-0 transform -translate-x-1/2 whitespace-nowrap transition-opacity duration-300">
                    {labelDeg}
                  </span>
                  <span style={{ opacity: unitLabelOpacityMeter }} className="text-blue-500/50 absolute bottom-0 transform -translate-x-1/2 whitespace-nowrap transition-opacity duration-300">
                    {labelMeter}
                  </span>
                </div>
              </React.Fragment>
            );
          })}

          {/* Grid lines & labels (Horizontal) */}
          {[-0.66, -0.33, 0.33, 0.66].map((factor, idx) => {
            const labelDeg = `${Math.round(factor * 90)}°`;
            const labelMeter = `${(factor * 10000000 / 1000).toLocaleString()} km`;
            return (
              <React.Fragment key={`h-${idx}`}>
                <div
                  style={{ top: `${50 - factor * 50}%` }}
                  className="absolute w-full h-[1px] bg-slate-800/30"
                ></div>
                <div
                  style={{ top: `${50 - factor * 50}%` }}
                  className="absolute left-3 transform -translate-y-1/2 text-[10px] font-mono select-none"
                >
                  <span style={{ opacity: unitLabelOpacityDeg }} className="text-teal-500/50 absolute left-0 transform -translate-y-1/2 whitespace-nowrap transition-opacity duration-300">
                    {labelDeg}
                  </span>
                  <span style={{ opacity: unitLabelOpacityMeter }} className="text-blue-500/50 absolute left-0 transform -translate-y-1/2 whitespace-nowrap transition-opacity duration-300">
                    {labelMeter}
                  </span>
                </div>
              </React.Fragment>
            );
          })}

          {/* Visual representation of "Null Island" exactly at (0,0) */}
          <div className="absolute w-24 h-24 flex items-center justify-center z-10" style={{ left: "552px", top: "252px" }}>
            {/* Glowing outer ocean circles */}
            <div className="absolute w-16 h-16 rounded-full border border-teal-500/20 bg-teal-500/5 animate-pulse" />
            
            {/* The Land Mass */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 border border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.4)] flex items-center justify-center relative">
              {/* Palm trees emoji or symbol */}
              <span className="text-[10px] select-none filter drop-shadow">🌴</span>
            </div>

            {/* Neon coordinate flag sticking out of the island */}
            <div className="absolute -top-3 -right-6 px-1.5 py-0.5 bg-slate-900/90 border border-teal-500/60 rounded text-[8px] font-mono text-teal-400 flex items-center gap-0.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
              <span>Null Island (0, 0)</span>
            </div>

            {/* Radar scanner sweep line */}
            <div 
              style={{ transform: `rotate(${radarRotation}deg)` }}
              className="absolute w-20 h-20 border-r border-t border-transparent border-l-teal-500/20 rounded-full pointer-events-none"
            />
          </div>

          {/* Concentric Splash wave ripples when the point hits (starts around frame 200) */}
          {frame >= 200 && (
            <div 
              style={{
                left: "600px", 
                top: "300px", 
                transform: `translate(-50%, -50%) scale(${splashScale})`,
                opacity: splashOpacity
              }}
              className="absolute w-20 h-20 rounded-full border-2 border-amber-400 pointer-events-none z-10"
            />
          )}

          {/* Grid labels */}
          <div className="absolute top-4 right-4 text-[10px] text-slate-600 font-mono tracking-wider">
            GIS WORKSPACE BOUNDS
          </div>
        </div>

        {/* The Coordinate Point (Shanghai) */}
        <div
          style={{
            position: "absolute",
            left: `${dotX}px`,
            top: `${dotY}px`,
            transform: "translate(-50%, -50%)",
            transition: "color 0.4s",
          }}
          className="flex flex-col items-start pointer-events-none z-20"
        >
          {/* Glowing Point Marker */}
          <div className={`w-5 h-5 rounded-full relative flex items-center justify-center shadow-lg transition-all duration-300 ${
            frame < 175 ? "bg-red-500 border border-red-300" : "bg-amber-400 border border-amber-200"
          }`}>
            {/* Ping aura */}
            <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
              frame < 175 ? "bg-red-500" : "bg-amber-400"
            }`}></div>
            {/* Target indicator crosshairs */}
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>

          {/* Coordinate Tag box */}
          <div className={`mt-2.5 ml-5 p-2.5 bg-slate-950/90 border rounded-xl text-xs shadow-[0_4px_20px_rgba(0,0,0,0.6)] whitespace-nowrap transition-colors duration-300 flex flex-col gap-0.5 ${
            frame < 175 ? "border-red-500/50 text-red-300" : "border-amber-500/50 text-amber-300 font-bold"
          }`}>
            <span className="font-semibold">{frame < 175 ? "📍 上海" : "⚠️ 未分类黑户数据点"}</span>
            <div className="font-mono text-[9px] text-slate-400 mt-0.5">
              {frame < 175 ? (
                <>
                  X: <span className="text-red-400">121.000° E</span><br/>
                  Y: <span className="text-red-400">31.000° N</span>
                </>
              ) : (
                <>
                  X: <span className="text-amber-400">121.000 m</span><br/>
                  Y: <span className="text-amber-400">31.000 m</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Overlay Popups */}
        
        {/* .PRJ Deletion popup (0 - 130 frames) */}
        {frame >= 45 && frame < 135 && (
          <div
            style={{
              opacity: prjOpacity,
              transform: `scale(${prjScale})`,
            }}
            className="absolute top-8 right-24 flex flex-col items-center p-5 bg-slate-900/90 border border-slate-700 rounded-xl shadow-2xl z-30 min-w-[200px] backdrop-blur"
          >
            <div className="text-3xl mb-1">📄</div>
            <div className="text-xs font-mono text-slate-200 font-bold">shanghai_layer.prj</div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">（空间参考身份证）</div>

            {/* Red cross over it */}
            {frame >= 75 && (
              <div
                style={{ opacity: crossOpacity }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl transition-all duration-300"
              >
                <div className="text-red-500 text-6xl font-bold tracking-tighter transform rotate-[15deg]">❌</div>
                <span className="text-[9px] text-red-400 font-bold font-mono tracking-widest mt-1">DELETED</span>
              </div>
            )}
          </div>
        )}

        {/* Glitchy Critical Alert (starts after PRJ deletion) */}
        {frame >= 85 && frame < 165 && (
          <div 
            style={{ opacity: warningOpacity }}
            className="absolute top-10 left-12 px-4 py-2 bg-red-950/80 border border-red-500/60 rounded-lg text-red-400 text-xs font-mono font-bold tracking-wider z-20 flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse"
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>METADATA WARNING: SHAPEFILE CORRUPTED (MISSING .PRJ)</span>
          </div>
        )}

        {/* Missing PRJ Warning text (135 - 175 frames) */}
        {frame >= 135 && frame < 175 && (
          <div
            style={{ opacity: explainOpacity }}
            className="absolute bottom-6 px-6 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-sm font-semibold text-center max-w-xl z-30 shadow-[0_4px_25px_rgba(245,158,11,0.05)]"
          >
            ⚠️ 失去 .prj 身份证！软件失去坐标系参数，<br/>
            被迫将原始数字 <b>121</b> 和 <b>31</b> 强行读作 <b>121米</b> 和 <b>31米</b>！
          </div>
        )}

        {/* Drift Ending Text (starts after splash) */}
        {frame >= 215 && (
          <div
            style={{ opacity: endingOpacity }}
            className="absolute bottom-6 flex flex-col items-center max-w-xl text-center bg-red-950/20 border border-red-500/30 rounded-xl p-4 z-30 shadow-[0_4px_25px_rgba(239,68,68,0.1)]"
          >
            <div className="text-red-400 text-base font-bold">
              因为 121米 和 31米 相对地球尺寸极其微小，
            </div>
            <div className="text-slate-300 text-xs mt-1">
              在数万公里的投影大网格中，数据点瞬间被“吸附”到了 (0,0) 原点附近。<br/>
              <span className="text-red-400 font-semibold">这就是为什么你的数据会莫名其妙“飞到非洲几内亚湾的海里”！</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center border-t border-slate-800/80 pt-4 text-xs text-slate-500 z-10 font-mono">
        <div className="flex items-center gap-2">
          <span>THE "NULL ISLAND" EFFECT</span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400">DEMO VIDEO</span>
        </div>
        <span>© GISer科普视频</span>
      </div>
    </div>
  );
};
