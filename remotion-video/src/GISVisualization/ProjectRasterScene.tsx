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

const fade = (frame: number, start: number, end: number, fadeIn = 15, fadeOut = 15) =>
  interpolate(frame, [start, start + fadeIn, end - fadeOut, end], [0, 1, 1, 0], clamp);

// Clean helper to draw a simple raster grid inside a card
const MiniRasterGrid: React.FC<{ size: number; rows: number; cols: number; colors: string[][] }> = ({ size, rows, cols, colors }) => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 3, width: size, height: size }}>
      {Array.from({ length: rows * cols }).map((_, idx) => {
        const r = Math.floor(idx / cols);
        const c = idx % cols;
        const color = colors[r]?.[c] || "#94a3b8";
        return (
          <div
            key={`cell-${idx}`}
            style={{
              background: color,
              borderRadius: 3,
              boxShadow: "inset 0 1px 2px rgba(255,255,255,0.15)",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          />
        );
      })}
    </div>
  );
};

export const ProjectRasterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ==================== SUBTITLE NARRATIVE TIMES (Total: 1900 frames) ====================
  const sceneFade = interpolate(frame, [0, 15, 1880, 1900], [0, 1, 1, 0], clamp);

  const textOpacity1 = fade(frame, 0, 175, 15, 15);     // Sub 140
  const textOpacity2 = fade(frame, 176, 445, 15, 15);   // Sub 141-142
  const textOpacity3 = fade(frame, 446, 677, 15, 15);   // Sub 143-144
  const textOpacity4 = fade(frame, 678, 991, 15, 15);   // Sub 145-147
  const textOpacity5 = fade(frame, 992, 1629, 15, 15);  // Sub 148-151
  const textOpacity6 = fade(frame, 1630, 1900, 15, 15); // Sub 152-153

  // ==================== ANIMATIONS & SPRINGS ====================
  // Phase 1: Entry of Raster DEM Card
  const entrySpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 18, stiffness: 72 },
  });
  const demCardY = interpolate(entrySpring, [0, 1], [300, 0], clamp);
  const demCardOpacity = interpolate(entrySpring, [0, 1], [0, 1], clamp);

  // Phase 2: Shift DEM left, slide Vector in
  const phase2Spring = spring({
    frame: frame - 176,
    fps,
    config: { damping: 18, stiffness: 70 },
  });
  const demCardX = interpolate(phase2Spring, [0, 1], [0, -320], clamp);
  const vectorCardX = interpolate(phase2Spring, [0, 1], [400, 320], clamp);
  const vectorCardOpacity = interpolate(phase2Spring, [0, 1], [0, 1], clamp);

  // Phase 3: Contrast three cards
  const phase3Spring1 = spring({ frame: frame - 450, fps, config: { damping: 16, stiffness: 80 } });
  const phase3Spring2 = spring({ frame: frame - 470, fps, config: { damping: 16, stiffness: 80 } });
  const phase3Spring3 = spring({ frame: frame - 490, fps, config: { damping: 16, stiffness: 80 } });

  const card3Y1 = interpolate(phase3Spring1, [0, 1], [250, 0], clamp);
  const card3Y2 = interpolate(phase3Spring2, [0, 1], [250, 0], clamp);
  const card3Y3 = interpolate(phase3Spring3, [0, 1], [250, 0], clamp);

  const card3Op1 = interpolate(phase3Spring1, [0, 1], [0, 1], clamp);
  const card3Op2 = interpolate(phase3Spring2, [0, 1], [0, 1], clamp);
  const card3Op3 = interpolate(phase3Spring3, [0, 1], [0, 1], clamp);

  // Phase 4: Focus on Project Raster card
  const phase4Spring = spring({
    frame: frame - 680,
    fps,
    config: { damping: 20, stiffness: 60 },
  });
  // Fades out other cards
  const cardOutOpacity = interpolate(phase4Spring, [0, 0.4], [1, 0], clamp);
  // Centers and grows Project Raster card
  const focusCardX = interpolate(phase4Spring, [0, 1], [340, 0], clamp);
  const focusCardY = interpolate(phase4Spring, [0, 1], [0, -20], clamp);
  const focusCardScale = interpolate(phase4Spring, [0, 1], [1, 1.25], clamp);

  // Phase 5: Pipeline flow
  const pipelineEntry = spring({
    frame: frame - 992,
    fps,
    config: { damping: 18, stiffness: 70 },
  });
  const pipelineOpacity = interpolate(pipelineEntry, [0, 1], [0, 1], clamp);
  const pipelineScale = interpolate(pipelineEntry, [0, 1], [0.85, 1], clamp);
  
  // Pipeline glow dot movement (frames 1050 to 1550 loop or sweep)
  const dotProgress1 = interpolate(frame, [1050, 1220], [0, 1], clamp); // Raw to Step 1
  const dotProgress2 = interpolate(frame, [1240, 1420], [0, 1], clamp); // Step 1 to Step 2
  const dotProgress3 = interpolate(frame, [1440, 1580], [0, 1], clamp); // Step 2 to Final Output

  // Phase 6: Big Question Mark
  const questionSpring = spring({
    frame: frame - 1630,
    fps,
  });
  const qMarkScale = interpolate(questionSpring, [0, 1], [0.2, 1.8], clamp);
  const qMarkOpacity = interpolate(questionSpring, [0, 1], [0, 0.15], clamp);
  const qTextY = interpolate(questionSpring, [0, 1], [40, 0], clamp);
  const qTextOpacity = interpolate(questionSpring, [0, 1], [0, 1], clamp);

  // ==================== COLOR DATASETS ====================
  const demColors = [
    ["#4f745d", "#5f8163", "#749a78", "#88ab8c"],
    ["#315f6d", "#426b80", "#5f8a9e", "#8cb1c4"],
    ["#a77748", "#bc8f5f", "#d1a87b", "#e4c29a"],
    ["#8f4e3e", "#a36353", "#b77a6a", "#cb9383"],
  ];

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
      {/* Decorative Background Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.18,
          backgroundImage:
            "linear-gradient(rgba(37, 48, 43, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 48, 43, 0.08) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      {/* Top Section Headers */}
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
        PROJECT RASTER TOOL / 投影栅格工具
      </div>

      <div style={{ position: "absolute", top: 44, right: 58, fontFamily: MONO_STACK, fontSize: 14, color: "#6f7368" }}>
        SECTION 04 / 04
      </div>

      {/* ==================== SUBTITLE BANNER OVERLAYS ==================== */}
      <div style={{ position: "absolute", top: 120, width: "100%", display: "flex", justifyContent: "center", zIndex: 30 }}>
        <div style={{ position: "relative", width: 1200, height: 110, display: "flex", justifyContent: "center" }}>
          
          {/* Sub 140 */}
          {textOpacity1 > 0 && (
            <div style={{ position: "absolute", opacity: textOpacity1, textAlign: "center", transform: `translateY(${interpolate(textOpacity1, [0, 1], [12, 0])}px)` }}>
              <h2 style={{ fontSize: 44, fontWeight: 800, color: "#315f6d" }}>🗺️ 栅格数据投影问题</h2>
              <p style={{ fontFamily: MONO_STACK, fontSize: 24, color: "#7a766c", marginTop: 8 }}>可能大家在平常处理数据的时候，也要用到投影转换工具</p>
            </div>
          )}

          {/* Sub 141-142 */}
          {textOpacity2 > 0 && (
            <div style={{ position: "absolute", opacity: textOpacity2, textAlign: "center", transform: `translateY(${interpolate(textOpacity2, [0, 1], [12, 0])}px)` }}>
              <h2 style={{ fontSize: 44, fontWeight: 800, color: "#315f6d" }}>🔄 投影栅格工具 (Project Raster)</h2>
              <p style={{ fontFamily: MONO_STACK, fontSize: 24, color: "#7a766c", marginTop: 8 }}>当处理栅格图层（如遥感影像、DEM）时，会使用专属的投影栅格工具</p>
            </div>
          )}

          {/* Sub 143-144 */}
          {textOpacity3 > 0 && (
            <div style={{ position: "absolute", opacity: textOpacity3, textAlign: "center", transform: `translateY(${interpolate(textOpacity3, [0, 1], [12, 0])}px)` }}>
              <h2 style={{ fontSize: 44, fontWeight: 800, color: "#8f4e3e" }}>❓ 投影栅格和普通投影有什么区别？</h2>
              <p style={{ fontFamily: MONO_STACK, fontSize: 24, color: "#7a766c", marginTop: 8 }}>为什么拖入普通的矢量数据 and 栅格数据，转换工具会不尽相同？</p>
            </div>
          )}

          {/* Sub 145-147 */}
          {textOpacity4 > 0 && (
            <div style={{ position: "absolute", opacity: textOpacity4, textAlign: "center", transform: `translateY(${interpolate(textOpacity4, [0, 1], [12, 0])}px)` }}>
              <h2 style={{ fontSize: 44, fontWeight: 800, color: "#4f745d" }}>⚙️ 本质：栅格数据专用的投影工具</h2>
              <p style={{ fontFamily: MONO_STACK, fontSize: 24, color: "#5b806f", marginTop: 8 }}>投影栅格是针对像元网格结构，专为栅格图层定制的底层变换引擎</p>
            </div>
          )}

          {/* Sub 148-151 */}
          {textOpacity5 > 0 && (
            <div style={{ position: "absolute", opacity: textOpacity5, textAlign: "center", transform: `translateY(${interpolate(textOpacity5, [0, 1], [12, 0])}px)` }}>
              <h2 style={{ fontSize: 44, fontWeight: 800, color: "#a77748" }}>🏷️ 正确工作流：先定义投影，再投影转换</h2>
              <p style={{ fontFamily: MONO_STACK, fontSize: 24, color: "#7a766c", marginTop: 8 }}>遇到未知坐标系，依然需要先用 Define Projection 赋以身份，然后再通过 Project Raster 换算</p>
            </div>
          )}

          {/* Sub 152-153 */}
          {textOpacity6 > 0 && (
            <div style={{ position: "absolute", opacity: textOpacity6, textAlign: "center", transform: `translateY(${interpolate(textOpacity6, [0, 1], [12, 0])}px)` }}>
              <h2 style={{ fontSize: 44, fontWeight: 800, color: "#8f4e3e", fontFamily: SERIF_STACK }}>💡 核心思考：为什么栅格必须独立开发投影工具？</h2>
              <p style={{ fontFamily: MONO_STACK, fontSize: 24, color: "#7a766c", marginTop: 8 }}>这背后的数学原因，取决于栅格数据本身极具特征的底层结构...</p>
            </div>
          )}

        </div>
      </div>

      {/* ==================== PHASE 1 & 2: RASTER VS VECTOR CARDS ==================== */}
      {frame < 446 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10 }}>
          
          {/* Raster (DEM) Card */}
          <div
            style={{
              position: "absolute",
              transform: `translate(${demCardX}px, ${demCardY}px)`,
              opacity: demCardOpacity,
              width: 480,
              height: 480,
              background: "#ffffff",
              border: "1px solid rgba(49, 95, 109, 0.12)",
              borderRadius: 24,
              boxShadow: "0 20px 50px rgba(49, 95, 109, 0.06)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "40px",
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontFamily: MONO_STACK, fontSize: 13, color: "#315f6d", letterSpacing: 1.5, marginBottom: 12 }}>GRID DATASET / 栅格数据集</div>
            <h3 style={{ fontSize: 28, fontWeight: 800, color: "#29342f", marginBottom: 30, fontFamily: SERIF_STACK }}>DEM / 影像图层</h3>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MiniRasterGrid size={240} rows={4} cols={4} colors={demColors} />
            </div>
            <div style={{ marginTop: 24, fontFamily: MONO_STACK, fontSize: 13, color: "#6f7368" }}>
              存储方式: 网格像素矩阵 (Pixel Matrix)
            </div>
          </div>

          {/* Vector Card (Slides in Beat 2) */}
          {frame >= 176 && (
            <div
              style={{
                position: "absolute",
                transform: `translateX(${vectorCardX}px)`,
                opacity: vectorCardOpacity,
                width: 480,
                height: 480,
                background: "#ffffff",
                border: "1px solid rgba(79, 116, 93, 0.12)",
                borderRadius: 24,
                boxShadow: "0 20px 50px rgba(79, 116, 93, 0.06)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "40px",
                boxSizing: "border-box",
              }}
            >
              <div style={{ fontFamily: MONO_STACK, fontSize: 13, color: "#4f745d", letterSpacing: 1.5, marginBottom: 12 }}>VECTOR DATASET / 矢量数据集</div>
              <h3 style={{ fontSize: 28, fontWeight: 800, color: "#29342f", marginBottom: 30, fontFamily: SERIF_STACK }}>点、线、多边形</h3>
              <div style={{ flex: 1, width: 240, height: 240, border: "2px dashed #e2e8f0", borderRadius: 12, background: "#f8fafc", position: "relative" }}>
                {/* SVG representing vertices and polygon */}
                <svg width="240" height="240" viewBox="0 0 240 240" style={{ position: "absolute", inset: 0 }}>
                  <polygon points="50,60 180,40 200,180 80,190" fill="rgba(79,116,93,0.12)" stroke="#4f745d" strokeWidth="2.5" />
                  <circle cx="50" cy="60" r="6" fill="#8f4e3e" stroke="white" strokeWidth="1.5" />
                  <circle cx="180" cy="40" r="6" fill="#8f4e3e" stroke="white" strokeWidth="1.5" />
                  <circle cx="200" cy="180" r="6" fill="#8f4e3e" stroke="white" strokeWidth="1.5" />
                  <circle cx="80" cy="190" r="6" fill="#8f4e3e" stroke="white" strokeWidth="1.5" />
                  <text x="35" y="45" fontFamily={MONO_STACK} fontSize="10" fill="#8f4e3e">(X1, Y1)</text>
                  <text x="180" y="30" fontFamily={MONO_STACK} fontSize="10" fill="#8f4e3e">(X2, Y2)</text>
                  <text x="195" y="200" fontFamily={MONO_STACK} fontSize="10" fill="#8f4e3e">(X3, Y3)</text>
                  <text x="65" y="210" fontFamily={MONO_STACK} fontSize="10" fill="#8f4e3e">(X4, Y4)</text>
                </svg>
              </div>
              <div style={{ marginTop: 24, fontFamily: MONO_STACK, fontSize: 13, color: "#6f7368" }}>
                存储方式: 顶点坐标序列 (Coordinate Vertices)
              </div>
            </div>
          )}

        </div>
      )}

      {/* ==================== PHASE 3 & 4: THREE COMPARISON CARDS ==================== */}
      {frame >= 446 && frame < 992 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 36, zIndex: 15 }}>
          
          {/* Card 1: Define Projection */}
          <div
            style={{
              transform: `translateY(${card3Y1}px)`,
              opacity: card3Op1 * cardOutOpacity,
              width: 380,
              height: 480,
              background: "#ffffff",
              border: "1px solid rgba(16, 139, 122, 0.12)",
              borderRadius: 24,
              boxShadow: "0 15px 40px rgba(16, 139, 122, 0.05)",
              padding: "36px 30px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ background: "#ecfdf5", padding: "6px 14px", borderRadius: 20, fontFamily: MONO_STACK, fontSize: 12, color: "#108B7A", fontWeight: "bold" }}>
              TOOL 01 / METADATA
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 800, marginTop: 24, marginBottom: 12, color: "#29342f" }}>Define Projection</h3>
            <div style={{ fontSize: 16, color: "#5b806f", marginBottom: 30 }}>定义投影</div>
            
            <div style={{ width: "100%", height: 2, background: "#f1f5f9", marginBottom: 30 }} />
            <div style={{ textAlign: "center", fontFamily: MONO_STACK, fontSize: 15, color: "#475569", lineHeight: 1.6 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🏷️</div>
              <strong>功能: 贴个标签</strong>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
                仅仅写入坐标系描述元数据，<span style={{ color: "#ef4444" }}>完全不修改</span>任何坐标数值。
              </div>
            </div>
          </div>

          {/* Card 2: Project */}
          <div
            style={{
              transform: `translateY(${card3Y2}px)`,
              opacity: card3Op2 * cardOutOpacity,
              width: 380,
              height: 480,
              background: "#ffffff",
              border: "1px solid rgba(42, 101, 214, 0.12)",
              borderRadius: 24,
              boxShadow: "0 15px 40px rgba(42, 101, 214, 0.05)",
              padding: "36px 30px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ background: "#eff6ff", padding: "6px 14px", borderRadius: 20, fontFamily: MONO_STACK, fontSize: 12, color: "#2A65D6", fontWeight: "bold" }}>
              TOOL 02 / VECTOR
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 800, marginTop: 24, marginBottom: 12, color: "#29342f" }}>Project</h3>
            <div style={{ fontSize: 16, color: "#4f745d", marginBottom: 30 }}>投影 (矢量专享)</div>
            
            <div style={{ width: "100%", height: 2, background: "#f1f5f9", marginBottom: 30 }} />
            <div style={{ textAlign: "center", fontFamily: MONO_STACK, fontSize: 15, color: "#475569", lineHeight: 1.6 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>📐</div>
              <strong>功能: 改写数值</strong>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
                读取旧顶点的几何值，代入投影公式计算出<span style={{ color: "#3b82f6" }}>新坐标值</span>生成新文件。
              </div>
            </div>
          </div>

          {/* Card 3: Project Raster (Focusses & scales in Phase 4) */}
          <div
            style={{
              position: "relative",
              transform: `translate(${focusCardX}px, ${focusCardY}px) scale(${focusCardScale})`,
              opacity: card3Op3,
              width: 380,
              height: 480,
              background: "#ffffff",
              border: "2px solid #315f6d",
              borderRadius: 24,
              boxShadow: "0 25px 60px rgba(49, 95, 109, 0.12)",
              padding: "36px 30px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ background: "#f0fdfa", padding: "6px 14px", borderRadius: 20, fontFamily: MONO_STACK, fontSize: 12, color: "#315f6d", fontWeight: "bold" }}>
              TOOL 03 / RASTER
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 800, marginTop: 24, marginBottom: 12, color: "#29342f" }}>Project Raster</h3>
            <div style={{ fontSize: 16, color: "#b45309", marginBottom: 30 }}>投影栅格 (专属)</div>
            
            <div style={{ width: "100%", height: 2, background: "#f1f5f9", marginBottom: 30 }} />
            <div style={{ textAlign: "center", fontFamily: MONO_STACK, fontSize: 15, color: "#475569", lineHeight: 1.6 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🔄</div>
              <strong>功能: 重采样插值</strong>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
                建立新目标网格，从目标反向投影并<span style={{ color: "#d97706" }}>插值填充像元</span>重构矩阵。
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ==================== PHASE 5: PIPELINE WORKFLOW FLOW ==================== */}
      {frame >= 992 && frame < 1630 && (
        <div 
          style={{ 
            position: "absolute", 
            inset: 0, 
            display: "flex", 
            flexDirection: "column",
            justifyContent: "center", 
            alignItems: "center", 
            opacity: pipelineOpacity,
            transform: `scale(${pipelineScale})`,
            zIndex: 20 
          }}
        >
          {/* Workflow Title Label */}
          <div style={{ fontSize: 26, fontWeight: 800, color: "#315f6d", marginBottom: 70, letterSpacing: 1.0 }}>
            RAW UNKNOWN RASTER ➔ CORRECT PROJECTION PIPELINE
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, position: "relative" }}>
            
            {/* 1. Raw Input Card */}
            <div style={{ width: 280, height: 200, background: "white", border: "2px solid #ef4444", borderRadius: 16, boxShadow: "0 10px 25px rgba(239, 68, 68, 0.05)", padding: 24, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📁</div>
              <div style={{ fontFamily: MONO_STACK, fontSize: 15, fontWeight: "bold", color: "#ef4444" }}>丢失坐标的栅格</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 6, textAlign: "center" }}>Unknown CRS</div>
            </div>

            {/* Path Line 1 */}
            <div style={{ width: 100, height: 4, background: "#cbd5e1", position: "relative" }}>
              {dotProgress1 > 0 && dotProgress1 < 1 && (
                <div style={{ position: "absolute", left: `${dotProgress1 * 100}%`, top: -6, width: 16, height: 16, borderRadius: 99, background: "#f59e0b", boxShadow: "0 0 10px #f59e0b", transform: "translateX(-50%)" }} />
              )}
            </div>

            {/* 2. Step 1 Card: Define Projection */}
            <div style={{ width: 280, height: 200, background: "white", border: "2px solid #108B7A", borderRadius: 16, boxShadow: "0 10px 25px rgba(16, 139, 122, 0.05)", padding: 24, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <div style={{ background: "#ecfdf5", padding: "4px 10px", borderRadius: 12, fontFamily: MONO_STACK, fontSize: 11, color: "#108B7A", fontWeight: "bold", marginBottom: 12 }}>STEP 01</div>
              <div style={{ fontSize: 18, fontWeight: "bold", color: "#29342f" }}>Define Projection</div>
              <div style={{ fontSize: 12, color: "#4f745d", marginTop: 6, textAlign: "center" }}>声明数据本来的坐标系</div>
            </div>

            {/* Path Line 2 */}
            <div style={{ width: 100, height: 4, background: "#cbd5e1", position: "relative" }}>
              {dotProgress2 > 0 && dotProgress2 < 1 && (
                <div style={{ position: "absolute", left: `${dotProgress2 * 100}%`, top: -6, width: 16, height: 16, borderRadius: 99, background: "#f59e0b", boxShadow: "0 0 10px #f59e0b", transform: "translateX(-50%)" }} />
              )}
            </div>

            {/* 3. Step 2 Card: Project Raster */}
            <div style={{ width: 280, height: 200, background: "white", border: "2px solid #2A65D6", borderRadius: 16, boxShadow: "0 10px 25px rgba(42, 101, 214, 0.05)", padding: 24, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <div style={{ background: "#eff6ff", padding: "4px 10px", borderRadius: 12, fontFamily: MONO_STACK, fontSize: 11, color: "#2A65D6", fontWeight: "bold", marginBottom: 12 }}>STEP 02</div>
              <div style={{ fontSize: 18, fontWeight: "bold", color: "#29342f" }}>Project Raster</div>
              <div style={{ fontSize: 12, color: "#315f6d", marginTop: 6, textAlign: "center" }}>执行真实的栅格变换</div>
            </div>

            {/* Path Line 3 */}
            <div style={{ width: 100, height: 4, background: "#cbd5e1", position: "relative" }}>
              {dotProgress3 > 0 && dotProgress3 < 1 && (
                <div style={{ position: "absolute", left: `${dotProgress3 * 100}%`, top: -6, width: 16, height: 16, borderRadius: 99, background: "#f59e0b", boxShadow: "0 0 10px #f59e0b", transform: "translateX(-50%)" }} />
              )}
            </div>

            {/* 4. Final Output Card */}
            <div style={{ width: 280, height: 200, background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", border: "2px solid #334155", borderRadius: 16, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.15)", padding: 24, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "white" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>💾</div>
              <div style={{ fontFamily: MONO_STACK, fontSize: 15, fontWeight: "bold", color: "#38bdf8" }}>投影就绪栅格</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6, textAlign: "center" }}>Ready Dataset</div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== PHASE 6: BIG QUESTION MARK TRANSITION ==================== */}
      {frame >= 1630 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 25 }}>
          <div
            style={{
              position: "absolute",
              fontFamily: SERIF_STACK,
              fontSize: 320,
              lineHeight: 1,
              color: "#315f6d",
              opacity: qMarkOpacity,
              transform: `scale(${qMarkScale}) rotate(${interpolate(questionSpring, [0, 1], [-15, 5], clamp)}deg)`,
              transformOrigin: "center center",
              userSelect: "none",
            }}
          >
            ?
          </div>
          
          <div
            style={{
              opacity: qTextOpacity,
              transform: `translateY(${qTextY}px)`,
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: 48, fontWeight: 900, color: "#8f4e3e", fontFamily: SERIF_STACK }}>
              为什么栅格不能像矢量一样直接转换？
            </h2>
            <p style={{ fontFamily: MONO_STACK, fontSize: 24, color: "#6f7368", marginTop: 20, maxWidth: 900, lineHeight: 1.6 }}>
              这要从两者的底层<b>数据结构差异</b>开始讲起……
            </p>
          </div>
        </div>
      )}

    </AbsoluteFill>
  );
};
