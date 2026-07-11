import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const SERIF_STACK =
  "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif SC', SimSun, serif";
const MONO_STACK = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const fade = (frame: number, start: number, end: number, fadeIn = 20, fadeOut = 20) =>
  interpolate(frame, [start, start + fadeIn, end - fadeOut, end], [0, 1, 1, 0], clamp);
const BigQuestionMark: React.FC<{ x: number; y: number; size: number; delay: number }> = ({
  x,
  y,
  size,
  delay,
}) => {
  const frame = useCurrentFrame();
  const appear = spring({
    frame: frame - delay,
    fps: 60,
    config: { damping: 16, stiffness: 90 },
  });
  const rotate = interpolate(Math.sin((frame - delay) / 60), [-1, 1], [-8, 7]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: SERIF_STACK,
        fontSize: size,
        lineHeight: 1,
        color: "rgba(56, 75, 69, 0.12)",
        transform: `translate(-50%, -50%) scale(${interpolate(appear, [0, 1], [0.8, 1])}) rotate(${rotate}deg)`,
        opacity: interpolate(appear, [0, 1], [0, 1]),
      }}
    >
      ?
    </div>
  );
};

export const GeoreferencingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ==================== 1. SCENE TRANSITION TIMINGS ====================
  const sceneFade = interpolate(frame, [0, 20, 2640, 2662], [0, 1, 1, 0], clamp);

  // Subtitle concept opacities (precisely mapped to subtitle ranges)
  const textOpacity1 = fade(frame, 0, 478, 20, 20);      // Sub 113-117: Question / Dilemma
  const textOpacity2 = fade(frame, 478, 882, 20, 20);    // Sub 118-121: Vector vs Raster issue
  const textOpacity3 = fade(frame, 882, 1156, 20, 20);   // Sub 122-124: Intro Georeferencing
  const textOpacity4 = fade(frame, 1156, 1912, 20, 20);  // Sub 125-131: GCP Setup
  const textOpacity5 = fade(frame, 1912, 2350, 20, 20);  // Sub 132-136: Warp & Apply CRS
  const textOpacity6 = fade(frame, 2350, 2662, 20, 20);  // Sub 137-139: Search Tutorials Outro

  // Fade out maps before Phase 6 starts
  const mapsOpacity = interpolate(frame, [2300, 2340], [1.0, 0.0], clamp);

  // ==================== 2. MAP ALIGNMENT TRANSFORMS ====================
  const panelW = 600;
  const panelH = 450;

  // Center coordinate of Panels
  const leftCenterX = 520;
  const rightCenterX = 1400;
  const centerY = 380;

  // Reference points distance
  const slideDistance = rightCenterX - leftCenterX; // 880px

  // Spring driven Warp animation (Phase 5: Sub 132-136)
  // Alignment starts at frame 1912 (Sub 132) and runs smoothly
  const warpSpring = spring({
    frame: frame - 1912,
    fps,
    config: { damping: 20, stiffness: 60 },
  }); // 0 to 1

  // Left Panel transforms
  const tx = interpolate(warpSpring, [0, 1], [0, slideDistance], clamp);
  const ty = 0;
  const scale = interpolate(warpSpring, [0, 1], [0.9, 1.0], clamp);
  const rotateDeg = interpolate(warpSpring, [0, 1], [-10, 0], clamp);
  const theta = (rotateDeg * Math.PI) / 180;
  
  // Left Panel opacity: fades slightly when overlaid to see reference map underneath
  const leftOpacity = interpolate(warpSpring, [0, 1], [1.0, 0.65], clamp) * mapsOpacity;

  // Right Panel scale & entry (slides in at Phase 3)
  const rightEntry = spring({
    frame: frame - 882,
    fps,
    config: { damping: 16, stiffness: 70 },
  });
  const rightPanelX = interpolate(rightEntry, [0, 1], [1920, rightCenterX], clamp);
  const rightPanelOpacity = interpolate(rightEntry, [0, 1], [0, 1], clamp) * mapsOpacity;

  // Vector metadata visual (Phase 2: Sub 118-121)
  const vectorCardShow = frame >= 478 && frame < 844;
  const vectorCardOpacity = fade(frame, 478, 844, 18, 18);
  const vectorDiagramProgress = interpolate(frame, [510, 620], [0, 1], clamp);
  const vectorPrjPulse = interpolate(Math.sin(frame / 14), [-1, 1], [0.35, 1]);
  
  // ==================== 3. GROUND CONTROL POINTS (GCPs) ====================
  // Landmark coordinates inside 600x450 panels (offset from local center 300, 225)
  const gcps = [
    { lx: 180, ly: 150, rx: 180, ry: 150 },
    { lx: 450, ly: 130, rx: 450, ry: 130 },
    { lx: 180, ly: 320, rx: 180, ry: 320 },
    { lx: 460, ly: 310, rx: 460, ry: 310 },
  ];

  // Opacities for the GCP markers (appearing sequentially inside Phase 4)
  const gcpOpacity1 = interpolate(frame, [1220, 1240], [0, 1], clamp);
  const gcpOpacity2 = interpolate(frame, [1420, 1440], [0, 1], clamp);
  const gcpOpacity3 = interpolate(frame, [1620, 1640], [0, 1], clamp);
  const gcpOpacity4 = interpolate(frame, [1780, 1800], [0, 1], clamp);
  const gcpOpacities = [gcpOpacity1, gcpOpacity2, gcpOpacity3, gcpOpacity4];

  // GCP Colors: shift from orange (unaligned) to green (aligned)
  const gcpColor = frame < 2150 ? "#f59e0b" : "#10b981";

  // Dashed connector lines opacity: collapses and fades out as alignment completes
  const lineOpacity = interpolate(frame, [2100, 2180], [1, 0], clamp) * mapsOpacity;

  // Success ripple animation at frame 2150
  const successSpring = spring({
    frame: frame - 2150,
    fps,
    config: { damping: 12, stiffness: 80 },
  });
  const successScale = interpolate(successSpring, [0, 1], [0.3, 1.8], clamp);
  const successOpacity = interpolate(successSpring, [0, 0.8, 1], [0, 0.9, 0], clamp) * mapsOpacity;

  // Calculate GCP screen coordinates dynamically
  const getScreenCoords = (lx: number, ly: number) => {
    const dx = lx - panelW / 2;
    const dy = ly - panelH / 2;
    // Apply Left Panel Rotation, Scale, and Translation
    const ax = leftCenterX + tx + scale * (dx * Math.cos(theta) - dy * Math.sin(theta));
    const ay = centerY + ty + scale * (dx * Math.sin(theta) + dy * Math.cos(theta));
    return { x: ax, y: ay };
  };

  // GCP coordinates
  const p1 = getScreenCoords(gcps[0].lx, gcps[0].ly);
  const ref1X = rightCenterX + (gcps[0].rx - panelW / 2);
  const ref1Y = centerY + (gcps[0].ry - panelH / 2);

  const p2 = getScreenCoords(gcps[1].lx, gcps[1].ly);
  const ref2X = rightCenterX + (gcps[1].rx - panelW / 2);
  const ref2Y = centerY + (gcps[1].ry - panelH / 2);

  const p3 = getScreenCoords(gcps[2].lx, gcps[2].ly);
  const ref3X = rightCenterX + (gcps[2].rx - panelW / 2);
  const ref3Y = centerY + (gcps[2].ry - panelH / 2);

  const p4 = getScreenCoords(gcps[3].lx, gcps[3].ly);
  const ref4X = rightCenterX + (gcps[3].rx - panelW / 2);
  const ref4Y = centerY + (gcps[3].ry - panelH / 2);

  const screenPoints = [p1, p2, p3, p4];
  const refPoints = [
    { x: ref1X, y: ref1Y },
    { x: ref2X, y: ref2Y },
    { x: ref3X, y: ref3Y },
    { x: ref4X, y: ref4Y },
  ];

  // ==================== 4. HUD / CARD STATUS ====================
  let rawMapStatus = "● CRS: UNKNOWN";
  let rawMapStatusColor = "#ef4444";
  let leftBorderColor = "#a77748";

  if (frame >= 2150) {
    rawMapStatus = "● CRS: WGS 84 (Applied)";
    rawMapStatusColor = "#10b981";
    leftBorderColor = "#059669";
  } else if (frame >= 1912) {
    rawMapStatus = "● Aligning Map...";
    rawMapStatusColor = "#f59e0b";
  }

  // ==================== 5. OUTRO SEARCH TUTORIALS (Phase 6: Sub 137-139) ====================
  const searchEntry = spring({
    frame: frame - 2350,
    fps,
    config: { damping: 15, stiffness: 75 },
  });
  const searchOpacity = interpolate(searchEntry, [0, 1], [0, 1], clamp);
  const searchScale = interpolate(searchEntry, [0, 1], [0.9, 1.0], clamp);
  const searchY = interpolate(searchEntry, [0, 1], [40, 0], clamp);

  const cursorBlink = Math.floor(frame / 20) % 2 === 0;

  const resultOpacity1 = interpolate(frame, [2430, 2450], [0, 1], clamp);
  const resultOpacity2 = interpolate(frame, [2490, 2510], [0, 1], clamp);
  const resultOpacity3 = interpolate(frame, [2550, 2570], [0, 1], clamp);

  return (
    <AbsoluteFill
      style={{
        fontFamily: SERIF_STACK,
        color: "#29342f",
        background: "linear-gradient(135deg, #f9f4e9 0%, #fcfbf5 50%, #e9efea 100%)",
        overflow: "hidden",
        opacity: sceneFade,
      }}
    >
      {/* Decorative Grid Lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.2,
          backgroundImage:
            "linear-gradient(rgba(37, 48, 43, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 48, 43, 0.08) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      {/* Decorative Background Elements (Phase 1) */}
      {frame < 478 && (
        <>
          <BigQuestionMark x={240} y={230} size={220} delay={10} />
          <BigQuestionMark x={1640} y={750} size={300} delay={20} />
          <BigQuestionMark x={1480} y={220} size={150} delay={30} />
        </>
      )}

      {/* Top Header Section */}
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 58,
          fontFamily: MONO_STACK,
          fontSize: 16,
          color: "#315f6d",
          display: "flex",
          alignItems: "center",
          gap: 12,
          zIndex: 30,
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: 999, background: "#5b806f" }} />
        GEOREFERENCING VISUALIZATION / 地理配准原理
      </div>

      <div style={{ position: "absolute", top: 44, right: 58, fontFamily: MONO_STACK, fontSize: 14, color: "#6f7368" }}>
        SECTION 03 / 04
      </div>

      {/* Narrative Concept Overlay Banners */}
      <div style={{ position: "absolute", top: 110, width: "100%", display: "flex", justifyContent: "center", zIndex: 30 }}>
        <div style={{ position: "relative", width: 1200, height: 110, display: "flex", justifyContent: "center" }}>
          
          {/* Phase 1: Sub 113-117 */}
          <div style={{ position: "absolute", opacity: textOpacity1, textAlign: "center", transform: `translateY(${interpolate(textOpacity1, [0, 1], [15, 0])}px)` }}>
            <h2 style={{ fontSize: 44, fontWeight: 800, color: "#8f4e3e" }}>❓ 若原始坐标系未知，该怎么办？</h2>
            <p style={{ fontFamily: MONO_STACK, fontSize: 24, color: "#7a766c", marginTop: 8 }}>说到这里你可能会有疑问，如果我不知道这个数据原始的坐标系是什么，该怎么办呢？</p>
          </div>

          {/* Phase 2: Sub 118-121 */}
          <div style={{ position: "absolute", opacity: textOpacity2, textAlign: "center", transform: `translateY(${interpolate(textOpacity2, [0, 1], [15, 0])}px)` }}>
            <h2 style={{ fontSize: 44, fontWeight: 800, color: "#b45309" }}>📄 这种丢失坐标系的情况多见于栅格</h2>
            <p style={{ fontFamily: MONO_STACK, fontSize: 24, color: "#7a766c", marginTop: 8 }}>矢量数据通常自带投影文件，而扫描纸质地图、航拍影像等栅格数据容易丢失坐标描述</p>
          </div>

          {/* Phase 3: Sub 122-124 */}
          <div style={{ position: "absolute", opacity: textOpacity3, textAlign: "center", transform: `translateY(${interpolate(textOpacity3, [0, 1], [15, 0])}px)` }}>
            <h2 style={{ fontSize: 44, fontWeight: 800, color: "#315f6d" }}>🔗 解决方案：地理配准 (Georeferencing)</h2>
            <p style={{ fontFamily: MONO_STACK, fontSize: 24, color: "#5b806f", marginTop: 8 }}>利用一个具有已知坐标系的底图或图层，去“校对”没有坐标系的数据</p>
          </div>

          {/* Phase 4: Sub 125-131 */}
          <div style={{ position: "absolute", opacity: textOpacity4, textAlign: "center", transform: `translateY(${interpolate(textOpacity4, [0, 1], [15, 0])}px)` }}>
            <h2 style={{ fontSize: 44, fontWeight: 800, color: "#b45309" }}>📍 具体步骤：建立控制点，进行人工对准</h2>
            <p style={{ fontFamily: MONO_STACK, fontSize: 24, color: "#7a766c", marginTop: 8 }}>在手头无坐标数据和参考数据上成对选取特征地物，连接校对</p>
          </div>

          {/* Phase 5: Sub 132-136 */}
          <div style={{ position: "absolute", opacity: textOpacity5, textAlign: "center", transform: `translateY(${interpolate(textOpacity5, [0, 1], [15, 0])}px)` }}>
            <h2 style={{ fontSize: 44, fontWeight: 800, color: "#10b981" }}>🔄 软件自动识别并应用坐标系</h2>
            <p style={{ fontFamily: MONO_STACK, fontSize: 24, color: "#047857", marginTop: 8 }}>ArcGIS会自动读取参考数据的坐标系，并将其物理应用到待校正的数据上</p>
          </div>

          {/* Phase 6: Sub 137-139 */}
          <div style={{ position: "absolute", opacity: textOpacity6, textAlign: "center", transform: `translateY(${interpolate(textOpacity6, [0, 1], [15, 0])}px)` }}>
            <h2 style={{ fontSize: 44, fontWeight: 800, color: "#7c3aed" }}>🔍 网上配准教程丰富，大家可以自行搜索</h2>
            <p style={{ fontFamily: MONO_STACK, fontSize: 24, color: "#6d28d9", marginTop: 8 }}>关于配准的软硬件操作演示非常多，这里就不作多余的赘述了</p>
          </div>

        </div>
      </div>

      {/* ==================== MAIN ANIMATION AREA ==================== */}
      <AbsoluteFill style={{ top: 220, height: 740, zIndex: 10 }}>
        
        {/* ==================== LEFT PANEL: RAW RASTER MAP ==================== */}
        {frame < 2340 && (
          <div
            style={{
              position: "absolute",
              left: leftCenterX,
              top: centerY,
              width: panelW,
              height: panelH,
              background: "#faf6ed",
              border: `3px solid ${leftBorderColor}`,
              borderRadius: 12,
              boxShadow: "0 20px 50px rgba(139, 92, 26, 0.12)",
              transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rotateDeg}deg)`,
              transformOrigin: "center center",
              opacity: leftOpacity,
              overflow: "hidden",
              zIndex: frame >= 1912 ? 25 : 15,
            }}
          >
            {/* Header tag */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: "#8c6239", color: "white", fontFamily: MONO_STACK, fontSize: 13, fontWeight: "bold" }}>
              <span>historic_map.tif (RAW RASTER)</span>
              <span style={{ color: rawMapStatusColor }}>{rawMapStatus}</span>
            </div>

            {/* Pixel coordinate background grid lines */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                top: 40,
                opacity: 0.12,
                backgroundImage:
                  "linear-gradient(rgba(140, 98, 57, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(140, 98, 57, 0.3) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* Pixel coordinate labels on axes */}
            <div style={{ position: "absolute", top: 46, left: 10, fontFamily: MONO_STACK, fontSize: 10, color: "#8c6239", opacity: 0.6 }}>(0, 0) px</div>
            <div style={{ position: "absolute", bottom: 6, right: 10, fontFamily: MONO_STACK, fontSize: 10, color: "#8c6239", opacity: 0.6 }}>(800, 600) px</div>

            {/* SVG drawing representing the map features */}
            <svg width="600" height="410" viewBox="0 0 600 410" style={{ position: "absolute", top: 40, left: 0 }}>
              {/* Forest (GCP 2) */}
              <circle cx="450" cy="90" r="22" fill="#10b981" fillOpacity="0.2" stroke="#059669" strokeWidth="2" strokeDasharray="3 3" />
              <circle cx="450" cy="90" r="14" fill="#059669" fillOpacity="0.3" />
              
              {/* Landmark Building (GCP 4) */}
              <rect x="445" y="255" width="30" height="30" rx="4" fill="#f59e0b" fillOpacity="0.2" stroke="#d97706" strokeWidth="2" />
              <line x1="445" y1="255" x2="475" y2="285" stroke="#d97706" strokeWidth="1.5" />
              <line x1="475" y1="255" x2="445" y2="285" stroke="#d97706" strokeWidth="1.5" />

              {/* River */}
              <path d="M 0,180 C 150,160 280,280 400,240 T 600,340" fill="none" stroke="#60a5fa" strokeWidth="8" strokeOpacity="0.8" />
              
              {/* Roads */}
              <path d="M 180,0 L 180,410" fill="none" stroke="#9ca3af" strokeWidth="4" strokeOpacity="0.7" />
              <path d="M 0,280 L 600,280" fill="none" stroke="#9ca3af" strokeWidth="4" strokeOpacity="0.7" />
              <path d="M 0,110 L 600,110" fill="none" stroke="#9ca3af" strokeWidth="4" strokeOpacity="0.7" />

              {/* GCP Target markers on the Left Panel */}
              {gcps.map((g, idx) => {
                const opacityVal = gcpOpacities[idx];
                return (
                  <g key={`left-gcp-${idx}`} transform={`translate(${g.lx}, ${g.ly - 40})`} style={{ opacity: opacityVal }}>
                    <circle r="12" fill="none" stroke={gcpColor} strokeWidth="2" />
                    <line x1="-18" y1="0" x2="18" y2="0" stroke={gcpColor} strokeWidth="1.5" />
                    <line x1="0" y1="-18" x2="0" y2="18" stroke={gcpColor} strokeWidth="1.5" />
                    <circle r="3.5" fill={gcpColor} />
                    <text x="14" y="-12" fill={gcpColor} fontSize="11" fontFamily={MONO_STACK} fontWeight="bold">
                      GCP {idx + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* ==================== RIGHT PANEL: REFERENCE VECTOR MAP ==================== */}
        {frame >= 882 && frame < 2340 && (
          <div
            style={{
              position: "absolute",
              left: rightPanelX,
              top: centerY,
              width: panelW,
              height: panelH,
              background: "#f0fdf4",
              border: "3px solid #059669",
              borderRadius: 12,
              boxShadow: "0 20px 50px rgba(16, 185, 129, 0.12)",
              transform: "translate(-50%, -50%)",
              opacity: rightPanelOpacity,
              overflow: "hidden",
              zIndex: 10,
            }}
          >
            {/* Header tag */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: "#059669", color: "white", fontFamily: MONO_STACK, fontSize: 13, fontWeight: "bold" }}>
              <span>reference_basemap.shp (VECTOR)</span>
              <span style={{ color: "#34d399" }}>● CRS: WGS 84 (EPSG:4326)</span>
            </div>

            {/* Geographical Coordinate background grid lines */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                top: 40,
                opacity: 0.1,
                backgroundImage:
                  "linear-gradient(rgba(5, 150, 105, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(5, 150, 105, 0.25) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />

            {/* Geographic coordinate labels on edges */}
            <div style={{ position: "absolute", top: 46, left: 10, fontFamily: MONO_STACK, fontSize: 9, color: "#059669", opacity: 0.7 }}>121°27'E, 31°15'N</div>
            <div style={{ position: "absolute", bottom: 6, right: 10, fontFamily: MONO_STACK, fontSize: 9, color: "#059669", opacity: 0.7 }}>121°32'E, 31°12'N</div>

            {/* SVG drawing representing the reference vector map features */}
            <svg width="600" height="410" viewBox="0 0 600 410" style={{ position: "absolute", top: 40, left: 0 }}>
              {/* Forest area polygon (GCP 2) */}
              <circle cx="450" cy="90" r="22" fill="#10b981" fillOpacity="0.4" stroke="#047857" strokeWidth="2.5" />
              
              {/* Landmark Building (GCP 4) */}
              <rect x="445" y="255" width="30" height="30" rx="4" fill="#3b82f6" fillOpacity="0.4" stroke="#2563eb" strokeWidth="2.5" />
              <circle cx="460" cy="270" r="5" fill="#2563eb" />

              {/* River vector */}
              <path d="M 0,180 C 150,160 280,280 400,240 T 600,340" fill="none" stroke="#2563eb" strokeWidth="9" />
              
              {/* Road vectors */}
              <path d="M 180,0 L 180,410" fill="none" stroke="#475569" strokeWidth="5.5" />
              <path d="M 0,280 L 600,280" fill="none" stroke="#475569" strokeWidth="5.5" />
              <path d="M 0,110 L 600,110" fill="none" stroke="#475569" strokeWidth="5.5" />

              {/* GCP Target markers on the Right Panel */}
              {gcps.map((g, idx) => {
                const opacityVal = gcpOpacities[idx];
                return (
                  <g key={`right-gcp-${idx}`} transform={`translate(${g.rx}, ${g.ry - 40})`} style={{ opacity: opacityVal }}>
                    <circle r="12" fill="none" stroke={gcpColor} strokeWidth="2" />
                    <line x1="-18" y1="0" x2="18" y2="0" stroke={gcpColor} strokeWidth="1.5" />
                    <line x1="0" y1="-18" x2="0" y2="18" stroke={gcpColor} strokeWidth="1.5" />
                    <circle r="3.5" fill={gcpColor} />
                    <text x="14" y="-12" fill={gcpColor} fontSize="11" fontFamily={MONO_STACK} fontWeight="bold">
                      GCP {idx + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* ==================== VECTOR METADATA VISUAL (PHASE 2: Sub 118-121) ==================== */}
        {vectorCardShow && (
          <div
            style={{
              position: "absolute",
              left: 1160,
              top: centerY + 10,
              transform: `translate(-50%, -50%) translateY(${interpolate(vectorCardOpacity, [0, 1], [18, 0])}px)`,
              width: 660,
              height: 330,
              background: "rgba(255, 255, 255, 0.94)",
              border: "1px solid rgba(49, 95, 109, 0.16)",
              borderRadius: 14,
              boxShadow: "0 18px 40px rgba(49, 95, 109, 0.08)",
              opacity: vectorCardOpacity,
              display: "flex",
              gap: 22,
              padding: 26,
              boxSizing: "border-box",
              zIndex: 8,
            }}
          >
            <div style={{ width: 250, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: MONO_STACK, fontSize: 13, color: "#64748b", fontWeight: 800, letterSpacing: 0 }}>
                矢量数据包
              </div>

              {[
                { name: "boundary.shp", note: "几何图形", color: "#315f6d" },
                { name: "boundary.dbf", note: "属性表", color: "#64748b" },
                { name: "boundary.prj", note: "投影说明", color: "#10b981" },
              ].map((item, idx) => (
                <div
                  key={item.name}
                  style={{
                    height: 58,
                    border: `2px solid ${item.color}`,
                    borderRadius: 8,
                    background: idx === 2 ? "rgba(236, 253, 245, 0.95)" : "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 14px",
                    boxSizing: "border-box",
                    fontFamily: MONO_STACK,
                    transform: `translateX(${interpolate(vectorDiagramProgress, [0, 1], [24 * (idx + 1), 0])}px)`,
                    opacity: interpolate(vectorDiagramProgress, [0, 0.25 + idx * 0.18, 1], [0, 1, 1], clamp),
                    boxShadow: idx === 2 ? `0 0 ${interpolate(vectorPrjPulse, [0, 1], [0, 18])}px rgba(16, 185, 129, 0.22)` : "none",
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 800, color: item.color }}>{item.name}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase" }}>{item.note}</span>
                </div>
              ))}

              <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.55 }}>
                矢量数据通常和投影说明一起分发，所以很少需要反推原始坐标系。
              </div>
            </div>

            <svg width="330" height="278" viewBox="0 0 330 278" style={{ flex: 1, overflow: "visible" }}>
              <defs>
                <marker id="vector-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                </marker>
              </defs>

              <rect x="38" y="26" width="222" height="82" rx="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
              <text x="149" y="56" textAnchor="middle" fontFamily={MONO_STACK} fontSize="13" fontWeight="800" fill="#315f6d">
                CRS 元数据
              </text>
              <text x="149" y="82" textAnchor="middle" fontFamily={MONO_STACK} fontSize="12" fill="#64748b">
                WGS 84 / UTM ZONE 51N
              </text>
              <text x="149" y="98" textAnchor="middle" fontFamily={MONO_STACK} fontSize="10" fill="#94a3b8">
                保存在 .prj
              </text>

              <path
                d="M 0 179 C 74 179 73 67 38 67"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeDasharray="8 8"
                strokeDashoffset={interpolate(vectorDiagramProgress, [0, 1], [60, 0])}
                markerEnd="url(#vector-arrow)"
                opacity={interpolate(vectorDiagramProgress, [0.25, 1], [0, 1], clamp)}
              />

              <rect x="62" y="154" width="230" height="96" rx="12" fill="#f0fdf4" stroke="#059669" strokeWidth="2" />
              <path d="M 84 216 C 128 186 169 230 212 202 S 260 183 278 197" fill="none" stroke="#2563eb" strokeWidth="5" />
              <path d="M 108 164 L 108 244" stroke="#475569" strokeWidth="3" />
              <path d="M 74 190 L 282 190" stroke="#475569" strokeWidth="3" />
              <circle cx="232" cy="178" r="12" fill="#10b981" fillOpacity="0.38" stroke="#047857" strokeWidth="2" />
              <rect x="214" y="214" width="22" height="22" rx="3" fill="#3b82f6" fillOpacity="0.35" stroke="#2563eb" strokeWidth="2" />
              <text x="177" y="274" textAnchor="middle" fontFamily={MONO_STACK} fontSize="12" fontWeight="800" fill="#059669">
                坐标系随图层一起分发
              </text>
            </svg>
          </div>
        )}

        {/* ==================== ABSOLUTE GCP CONNECTOR DASHED LINES ==================== */}
        {frame >= 1156 && frame < 2200 && (
          <svg
            width="1920"
            height="740"
            viewBox="0 0 1920 740"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 20,
              pointerEvents: "none",
            }}
          >
            {screenPoints.map((pt, idx) => {
              const ref = refPoints[idx];
              const opacityVal = gcpOpacities[idx] * lineOpacity;
              if (opacityVal <= 0) return null;
              
              const startX = pt.x;
              const startY = pt.y;
              const endX = ref.x;
              const endY = ref.y;

              return (
                <g key={`connector-line-${idx}`} style={{ opacity: opacityVal }}>
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke="#f59e0b"
                    strokeWidth="3.5"
                    strokeDasharray="8 6"
                  />
                  <path
                    d={`M ${startX} ${startY} L ${endX} ${endY}`}
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}
          </svg>
        )}

        {/* ==================== SUCCESS ALIGNMENT RIPPLE ==================== */}
        {frame >= 2150 && frame < 2340 && (
          <div
            style={{
              position: "absolute",
              left: rightCenterX,
              top: centerY,
              transform: `translate(-50%, -50%) scale(${successScale})`,
              opacity: successOpacity,
              width: 500,
              height: 350,
              border: "8px solid #10b981",
              borderRadius: "24px",
              boxShadow: "0 0 50px rgba(16, 185, 129, 0.6)",
              pointerEvents: "none",
              zIndex: 30,
            }}
          />
        )}

        {/* ==================== PHASE 6: OUTRO SEARCH TUTORIALS CARD ==================== */}
        {frame >= 2340 && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) scale(${searchScale}) translateY(${searchY}px)`,
              width: 960,
              height: 480,
              background: "white",
              border: "1px solid rgba(124, 58, 237, 0.16)",
              borderRadius: 24,
              boxShadow: "0 30px 70px rgba(124, 58, 237, 0.08)",
              padding: "40px 50px",
              boxSizing: "border-box",
              opacity: searchOpacity,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 40,
            }}
          >
            {/* Search Input Bar (Mocking Google / Baidu search) */}
            <div
              style={{
                width: "100%",
                height: 64,
                border: "2px solid #7c3aed",
                borderRadius: 32,
                display: "flex",
                alignItems: "center",
                padding: "0 28px",
                boxSizing: "border-box",
                background: "#f9f8ff",
                boxShadow: "0 8px 24px rgba(124, 58, 237, 0.06)",
              }}
            >
              <span style={{ fontSize: 24, marginRight: 16 }}>🔍</span>
              <div style={{ flex: 1, fontFamily: MONO_STACK, fontSize: 22, fontWeight: "bold", color: "#374151", display: "flex", alignItems: "center" }}>
                ArcGIS 地理配准教程
                {cursorBlink && <span style={{ marginLeft: 2, width: 3, height: 26, background: "#7c3aed" }} />}
              </div>
              <span style={{ color: "#7c3aed", fontFamily: MONO_STACK, fontSize: 15, fontWeight: "bold" }}>ENTER</span>
            </div>

            {/* Float up search result cards */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16, marginTop: 36 }}>
              {/* Result 1 */}
              <div style={{ opacity: resultOpacity1, transform: `translateY(${interpolate(resultOpacity1, [0, 1], [15, 0])}px)`, padding: "18px 24px", border: "1px solid #e5e7eb", borderRadius: 16, background: "#ffffff", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ fontSize: 18, fontWeight: "bold", color: "#2563eb", textDecoration: "underline", cursor: "pointer" }}>
                    ArcGIS Pro 地理配准 xxxx 教程
                  </h4>
                  <p style={{ fontSize: 13, color: "#4b5563", marginTop: 6, fontFamily: MONO_STACK }}>
                    第1步：添加 xxxx 栅格；第2步：添加控制点；第3步：保存 xxxx...
                  </p>
                </div>
                <span style={{ fontSize: 12, fontFamily: MONO_STACK, color: "#10b981", background: "#ecfdf5", padding: "4px 10px", borderRadius: 12 }}>99.8% 相关</span>
              </div>

              {/* Result 2 */}
              <div style={{ opacity: resultOpacity2, transform: `translateY(${interpolate(resultOpacity2, [0, 1], [15, 0])}px)`, padding: "18px 24px", border: "1px solid #e5e7eb", borderRadius: 16, background: "#ffffff", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ fontSize: 18, fontWeight: "bold", color: "#2563eb", textDecoration: "underline", cursor: "pointer" }}>
                    QGIS 地理配准工具 xxxx 使用指南
                  </h4>
                  <p style={{ fontSize: 13, color: "#4b5563", marginTop: 6, fontFamily: MONO_STACK }}>
                    打开 xxxx 工具，导入 xxxx 栅格，在已知 CRS 图层上逐一打点...
                  </p>
                </div>
                <span style={{ fontSize: 12, fontFamily: MONO_STACK, color: "#10b981", background: "#ecfdf5", padding: "4px 10px", borderRadius: 12 }}>97.5% 相关</span>
              </div>

              {/* Result 3 */}
              <div style={{ opacity: resultOpacity3, transform: `translateY(${interpolate(resultOpacity3, [0, 1], [15, 0])}px)`, padding: "18px 24px", border: "1px solid #e5e7eb", borderRadius: 16, background: "#ffffff", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ fontSize: 18, fontWeight: "bold", color: "#2563eb", textDecoration: "underline", cursor: "pointer" }}>
                    【视频】地理配准 xxxx 控制点演示
                  </h4>
                  <p style={{ fontSize: 13, color: "#4b5563", marginTop: 6, fontFamily: MONO_STACK }}>
                    作者：xxxxx；播放量：xx万；xxxx 案例演示与参数设置...
                  </p>
                </div>
                <span style={{ fontSize: 12, fontFamily: MONO_STACK, color: "#3b82f6", background: "#eff6ff", padding: "4px 10px", borderRadius: 12 }}>示例</span>
              </div>
            </div>
          </div>
        )}

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
