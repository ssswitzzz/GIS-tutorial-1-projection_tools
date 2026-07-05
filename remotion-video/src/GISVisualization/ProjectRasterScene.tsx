import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const SERIF_STACK =
  "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif SC', SimSun, serif";
const MONO_STACK = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const ease = Easing.bezier(0.22, 1, 0.36, 1);

const fade = (frame: number, start: number, end: number, fadeIn = 15, fadeOut = 15) =>
  interpolate(frame, [start, start + fadeIn, end - fadeOut, end], [0, 1, 1, 0], clamp);

// S-Curve cross-fade helper using cubic-bezier easing
const smoothFade = (frame: number, start: number, end: number, fadeIn = 25, fadeOut = 25) => {
  const p = interpolate(frame, [start, start + fadeIn, end - fadeOut, end], [0, 1, 1, 0], clamp);
  return ease(p);
};

// Drifting grid background matching OpeningScene and GISComparison
const PaperBackground: React.FC<{ tone?: "light" | "warm" }> = ({ tone = "light" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const normalizedFrame = frame * (30 / fps);
  const drift = interpolate(Math.sin(normalizedFrame / 90), [-1, 1], [-10, 10]);

  return (
    <AbsoluteFill
      style={{
        background:
          tone === "warm"
            ? "linear-gradient(135deg, #f6efe1 0%, #fffaf0 44%, #e9f0e4 100%)"
            : "linear-gradient(135deg, #f9f4e9 0%, #fcfbf5 50%, #e9efea 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.28,
          backgroundImage:
            "linear-gradient(rgba(37, 48, 43, 0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 48, 43, 0.09) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          transform: `translate(${drift}px, ${drift * 0.4}px)`,
        }}
      />
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, opacity: 0.16 }}
      >
        <path d="M-40 736 C 246 664, 402 810, 710 718 S 1238 470, 1970 592" fill="none" stroke="#6d7c6b" strokeWidth="2" />
        <path d="M-30 812 C 246 734, 460 910, 748 804 S 1300 540, 1980 664" fill="none" stroke="#6d7c6b" strokeWidth="2" />
        <path d="M114 218 C 384 120, 584 300, 858 204 S 1398 18, 1960 180" fill="none" stroke="#426b80" strokeWidth="1.5" />
        <path d="M96 282 C 352 194, 604 372, 884 282 S 1388 96, 1940 250" fill="none" stroke="#426b80" strokeWidth="1.5" />
        <path d="M1380 980 C 1478 810, 1656 762, 1848 826" fill="none" stroke="#a98452" strokeWidth="2" />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 14%, rgba(196, 143, 72, 0.18), transparent 26%), radial-gradient(circle at 82% 22%, rgba(59, 105, 121, 0.12), transparent 24%), radial-gradient(circle at 74% 86%, rgba(93, 120, 89, 0.15), transparent 30%)",
        }}
      />
    </AbsoluteFill>
  );
};

// Drifting background question marks matching OpeningScene
const FloatingQuestionMark: React.FC<{ x: number; y: number; size: number; delay: number }> = ({
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

// Signature Editorial Title Component matching GISComparison
const SectionTitle: React.FC<{
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  y?: number;
  color?: string;
  opacity?: number;
}> = ({ eyebrow, title, subtitle, y = 75, color = "#4f745d", opacity = 1 }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: "50%",
        transform: "translateX(-50%)",
        width: 1500,
        textAlign: "center",
        zIndex: 30,
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: MONO_STACK,
          fontSize: 18,
          color,
          marginBottom: 16,
          fontWeight: 700,
          letterSpacing: 1.5,
        }}
      >
        {eyebrow}
      </div>
      <div style={{ fontSize: 64, lineHeight: 1.12, fontWeight: 700, color: "#26332e", fontFamily: SERIF_STACK }}>
        {title}
      </div>
      <div style={{ fontFamily: SERIF_STACK, fontSize: 28, color: "#6f7368", marginTop: 16 }}>
        {subtitle}
      </div>
    </div>
  );
};

// Clean helper to draw a simple raster grid inside a card
const MiniRasterGrid: React.FC<{ size: number; rows: number; cols: number; colors: string[][] }> = ({ size, rows, cols, colors }) => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 4, width: size, height: size }}>
      {Array.from({ length: rows * cols }).map((_, idx) => {
        const r = Math.floor(idx / cols);
        const c = idx % cols;
        const color = colors[r]?.[c] || "#94a3b8";
        return (
          <div
            key={`cell-${idx}`}
            style={{
              background: color,
              borderRadius: 4,
              boxShadow: "inset 0 1px 2px rgba(255,255,255,0.2)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          />
        );
      })}
    </div>
  );
};

// Premium Glassmorphism Card Wrapper
const GlassCard: React.FC<{
  style?: React.CSSProperties;
  borderColor: string;
  shadowColor: string;
  children: React.ReactNode;
}> = ({ style, borderColor, shadowColor, children }) => {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1.5px solid ${borderColor}`,
        borderRadius: 32,
        boxShadow: `0 15px 45px ${shadowColor}, inset 0 1px 3px rgba(255, 255, 255, 0.7)`,
        padding: "48px 40px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const ProjectRasterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ==================== PHASE NARRATIVE FADES (Total: 1900 frames) ====================
  // Added Easing-based smooth cross-fades between different phases
  const sceneFade = interpolate(frame, [0, 20, 1860, 1900], [0, 1, 1, 0], clamp);

  const phase1Fade = smoothFade(frame, 0, 460, 20, 40);   // Phase 1 & 2
  const phase3Fade = smoothFade(frame, 420, 1010, 40, 40); // Phase 3 & 4
  const phase5Fade = smoothFade(frame, 970, 1650, 40, 40); // Phase 5
  const phase6Fade = smoothFade(frame, 1610, 1900, 40, 20); // Phase 6

  // Subtitle concept opacities to control SectionTitle timing precisely
  const textOpacity1 = fade(frame, 0, 175, 15, 15);     // Sub 140
  const textOpacity2 = fade(frame, 176, 445, 15, 15);   // Sub 141-142
  const textOpacity3 = fade(frame, 446, 677, 15, 15);   // Sub 143-144
  const textOpacity4 = fade(frame, 678, 991, 15, 15);   // Sub 145-147
  const textOpacity5 = fade(frame, 992, 1629, 15, 15);  // Sub 148-151

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
  // Centering translation is exactly -416px (width 380px + gap 36px)
  const focusCardX = interpolate(phase4Spring, [0, 1], [0, -416], clamp);
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
  const qMarkOpacity = interpolate(questionSpring, [0, 1], [0, 0.08], clamp);
  const qTextY = interpolate(questionSpring, [0, 1], [40, 0], clamp);
  const qTextOpacity = interpolate(questionSpring, [0, 1], [0, 1], clamp);

  // ==================== COLOR DATASETS ====================
  const demColors = [
    ["#3b7a57", "#4c8c68", "#60a37c", "#77ba93"],
    ["#2c5a75", "#3a6d8c", "#4f83a3", "#6ba0bd"],
    ["#a26c38", "#b8824c", "#cf9a63", "#e6b37c"],
    ["#8a3c2e", "#a15243", "#b9695a", "#d18273"],
  ];

  return (
    <AbsoluteFill
      style={{
        fontFamily: SERIF_STACK,
        color: "#1e293b",
        overflow: "hidden",
        background: "#fafaf9",
      }}
    >
      <div style={{ opacity: sceneFade, width: "100%", height: "100%" }}>
        {/* Drifting Paper Background matching OpeningScene and GISComparison */}
        <PaperBackground tone={frame > 992 ? "warm" : "light"} />

      {/* ==================== SECTION TITLE OVERLAYS ==================== */}
      {/* Editorial headings that are highly concise and consolidated */}
      {phase1Fade > 0 && textOpacity1 > 0 && (
        <SectionTitle
          eyebrow="数据存储"
          title="栅格数据"
          subtitle="由像元组成的连续网格"
          opacity={textOpacity1 * phase1Fade}
        />
      )}

      {phase1Fade > 0 && textOpacity2 > 0 && (
        <SectionTitle
          eyebrow="数据存储"
          title="矢量与栅格"
          subtitle="不同空间数据的底层结构差异"
          opacity={textOpacity2 * phase1Fade}
        />
      )}

      {phase3Fade > 0 && textOpacity3 > 0 && (
        <SectionTitle
          eyebrow="空间操作对比"
          title="投影与定义投影"
          subtitle="为什么矢量数据与栅格数据，使用的转换工具不同？"
          opacity={textOpacity3 * phase3Fade}
        />
      )}

      {phase3Fade > 0 && textOpacity4 > 0 && (
        <SectionTitle
          eyebrow="重采样机制"
          title="投影栅格"
          subtitle="针对离散网格的像元重构与插值"
          opacity={textOpacity4 * phase3Fade}
        />
      )}

      {phase5Fade > 0 && textOpacity5 > 0 && (
        <SectionTitle
          eyebrow="数据处理流程"
          title="标准投影工作流"
          subtitle="先使用“定义投影”声明，再使用“投影”或“投影栅格”转换"
          opacity={textOpacity5 * phase5Fade}
        />
      )}


      {/* ==================== PHASE 1 & 2: RASTER VS VECTOR CARDS ==================== */}
      {phase1Fade > 0 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10, opacity: phase1Fade }}>
          
          {/* Raster (DEM) Card */}
          <GlassCard
            borderColor="rgba(13, 148, 136, 0.15)"
            shadowColor="rgba(13, 148, 136, 0.05)"
            style={{
              position: "absolute",
              transform: `translate(${demCardX}px, ${demCardY + 80}px)`,
              opacity: demCardOpacity,
              width: 480,
              height: 530,
            }}
          >
            <div style={{ background: "rgba(13, 148, 136, 0.08)", padding: "8px 20px", borderRadius: 30, fontFamily: MONO_STACK, fontSize: 14, color: "#0d9488", fontWeight: 700, letterSpacing: 1.2, marginBottom: 16 }}>
              栅格数据集
            </div>
            <h3 style={{ fontSize: 34, fontWeight: 900, color: "#0f172a", marginBottom: 30, fontFamily: SERIF_STACK }}>高程与影像数据</h3>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MiniRasterGrid size={240} rows={4} cols={4} colors={demColors} />
            </div>
            <div style={{ marginTop: 24, fontFamily: MONO_STACK, fontSize: 18, color: "#475569", fontWeight: 500 }}>
              存储方式: 像元网格矩阵
            </div>
          </GlassCard>

          {/* Vector Card (Slides in Beat 2) */}
          {frame >= 176 && (
            <GlassCard
              borderColor="rgba(234, 88, 12, 0.15)"
              shadowColor="rgba(234, 88, 12, 0.05)"
              style={{
                position: "absolute",
                transform: `translate(${vectorCardX}px, 80px)`,
                opacity: vectorCardOpacity,
                width: 480,
                height: 530,
              }}
            >
              <div style={{ background: "rgba(234, 88, 12, 0.08)", padding: "8px 20px", borderRadius: 30, fontFamily: MONO_STACK, fontSize: 14, color: "#ea580c", fontWeight: 700, letterSpacing: 1.2, marginBottom: 16 }}>
                矢量数据集
              </div>
              <h3 style={{ fontSize: 34, fontWeight: 900, color: "#0f172a", marginBottom: 30, fontFamily: SERIF_STACK }}>点、线、面要素</h3>
              <div style={{ flex: 1, width: 240, height: 240, border: "1.5px dashed rgba(234, 88, 12, 0.2)", borderRadius: 16, background: "rgba(248, 250, 252, 0.5)", position: "relative" }}>
                {/* SVG representing vertices and polygon */}
                <svg width="240" height="240" viewBox="0 0 240 240" style={{ position: "absolute", inset: 0 }}>
                  <polygon points="50,60 180,40 200,180 80,190" fill="rgba(234, 88, 12, 0.08)" stroke="#ea580c" strokeWidth="2.5" />
                  <circle cx="50" cy="60" r="6" fill="#0f766e" stroke="white" strokeWidth="1.5" />
                  <circle cx="180" cy="40" r="6" fill="#0f766e" stroke="white" strokeWidth="1.5" />
                  <circle cx="200" cy="180" r="6" fill="#0f766e" stroke="white" strokeWidth="1.5" />
                  <circle cx="80" cy="190" r="6" fill="#0f766e" stroke="white" strokeWidth="1.5" />
                  <text x="15" y="40" fontFamily={MONO_STACK} fontSize="14" fill="#0f766e" fontWeight="bold">(X1, Y1)</text>
                  <text x="170" y="20" fontFamily={MONO_STACK} fontSize="14" fill="#0f766e" fontWeight="bold">(X2, Y2)</text>
                  <text x="150" y="205" fontFamily={MONO_STACK} fontSize="14" fill="#0f766e" fontWeight="bold">(X3, Y3)</text>
                  <text x="50" y="215" fontFamily={MONO_STACK} fontSize="14" fill="#0f766e" fontWeight="bold">(X4, Y4)</text>
                </svg>
              </div>
              <div style={{ marginTop: 24, fontFamily: MONO_STACK, fontSize: 18, color: "#475569", fontWeight: 500 }}>
                存储方式: 顶点坐标序列
              </div>
            </GlassCard>
          )}

        </div>
      )}

      {/* ==================== PHASE 3 & 4: THREE COMPARISON CARDS ==================== */}
      {phase3Fade > 0 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 36, zIndex: 15, opacity: phase3Fade }}>
          
          {/* Card 1: Define Projection */}
          <GlassCard
            borderColor="rgba(13, 148, 136, 0.15)"
            shadowColor="rgba(13, 148, 136, 0.04)"
            style={{
              transform: `translateY(${card3Y1 + 80}px)`,
              opacity: card3Op1 * cardOutOpacity,
              width: 380,
              height: 530,
            }}
          >
            <h3 style={{ fontSize: 38, fontWeight: 900, marginTop: 10, marginBottom: 6, color: "#0f172a", fontFamily: SERIF_STACK }}>定义投影</h3>
            <div style={{ fontSize: 18, fontFamily: MONO_STACK, color: "#64748b", marginBottom: 24 }}>Define Projection</div>
            
            <div style={{ width: "100%", height: 1.5, background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.06) 50%, transparent)", marginBottom: 28 }} />
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(13, 148, 136, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                marginBottom: 16,
                boxShadow: "0 4px 12px rgba(13, 148, 136, 0.04)"
              }}>
                🏷️
              </div>
              <strong style={{ fontSize: 22, color: "#0f172a", marginBottom: 8 }}>功能: 声明元数据</strong>
              <div style={{ fontSize: 19, color: "#475569", lineHeight: 1.6 }}>
                仅仅写入坐标系描述元数据，<span style={{ color: "#ef4444", fontWeight: 700 }}>完全不修改</span>任何坐标数值。
              </div>
            </div>
          </GlassCard>

          {/* Card 2: Project */}
          <GlassCard
            borderColor="rgba(37, 99, 235, 0.15)"
            shadowColor="rgba(37, 99, 235, 0.04)"
            style={{
              transform: `translateY(${card3Y2 + 80}px)`,
              opacity: card3Op2 * cardOutOpacity,
              width: 380,
              height: 530,
            }}
          >
            <h3 style={{ fontSize: 38, fontWeight: 900, marginTop: 10, marginBottom: 6, color: "#0f172a", fontFamily: SERIF_STACK }}>投影</h3>
            <div style={{ fontSize: 18, fontFamily: MONO_STACK, color: "#64748b", marginBottom: 24 }}>Project</div>
            
            <div style={{ width: "100%", height: 1.5, background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.06) 50%, transparent)", marginBottom: 28 }} />
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(37, 99, 235, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                marginBottom: 16,
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.04)"
              }}>
                📐
              </div>
              <strong style={{ fontSize: 22, color: "#0f172a", marginBottom: 8 }}>功能: 改写坐标值</strong>
              <div style={{ fontSize: 19, color: "#475569", lineHeight: 1.6 }}>
                读取旧顶点的几何值，代入投影公式计算出<span style={{ color: "#2563eb", fontWeight: 700 }}>新坐标值</span>并生成新文件。
              </div>
            </div>
          </GlassCard>

          {/* Card 3: Project Raster (Focusses & scales in Phase 4) */}
          <GlassCard
            borderColor={frame >= 680 ? "rgba(234, 88, 12, 0.45)" : "rgba(234, 88, 12, 0.15)"}
            shadowColor={frame >= 680 ? "rgba(234, 88, 12, 0.18)" : "rgba(234, 88, 12, 0.04)"}
            style={{
              position: "relative",
              transform: `translate(${focusCardX}px, ${card3Y3 + focusCardY + 80}px) scale(${focusCardScale})`,
              opacity: card3Op3,
              width: 380,
              height: 530,
              // Smooth border color transition when focused
              transition: "border-color 0.25s ease, box-shadow 0.25s ease",
            }}
          >
            <h3 style={{ fontSize: 38, fontWeight: 900, marginTop: 10, marginBottom: 6, color: "#0f172a", fontFamily: SERIF_STACK }}>投影栅格</h3>
            <div style={{ fontSize: 18, fontFamily: MONO_STACK, color: "#64748b", marginBottom: 24 }}>Project Raster</div>
            
            <div style={{ width: "100%", height: 1.5, background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.06) 50%, transparent)", marginBottom: 28 }} />
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(234, 88, 12, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                marginBottom: 16,
                boxShadow: "0 4px 12px rgba(234, 88, 12, 0.04)"
              }}>
                🔄
              </div>
              <strong style={{ fontSize: 22, color: "#0f172a", marginBottom: 8 }}>功能: 重采样插值</strong>
              <div style={{ fontSize: 19, color: "#475569", lineHeight: 1.6 }}>
                建立新目标网格，从目标反向投影并<span style={{ color: "#ea580c", fontWeight: 700 }}>插值填充像元</span>重构矩阵。
              </div>
            </div>
          </GlassCard>

        </div>
      )}

      {/* ==================== PHASE 5: PIPELINE WORKFLOW FLOW ==================== */}
      {phase5Fade > 0 && (
        <div 
          style={{ 
            position: "absolute", 
            inset: 0, 
            display: "flex", 
            flexDirection: "column",
            justifyContent: "center", 
            alignItems: "center", 
            opacity: phase5Fade * pipelineOpacity,
            transform: `scale(${pipelineScale}) translateY(30px)`,
            zIndex: 20 
          }}
        >

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, position: "relative" }}>
            
            <div style={{
              width: 320,
              height: 220,
              background: "rgba(255, 255, 255, 0.75)",
              backdropFilter: "blur(12px)",
              border: "1.5px solid rgba(239, 68, 68, 0.2)",
              borderRadius: 20,
              boxShadow: "0 10px 25px rgba(239, 68, 68, 0.04)",
              padding: 24,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <div style={{ background: "rgba(239, 68, 68, 0.08)", padding: "6px 16px", borderRadius: 14, fontFamily: MONO_STACK, fontSize: 16, color: "#ef4444", fontWeight: "bold", marginBottom: 16 }}>未定义</div>
              <div style={{ fontSize: 28, fontWeight: "bold", color: "#1e293b", fontFamily: SERIF_STACK }}>无坐标系栅格</div>
              <div style={{ fontSize: 18, color: "#64748b", marginTop: 8, textAlign: "center", fontFamily: MONO_STACK }}>Unknown Spatial Reference</div>
            </div>

            {/* Path Line 1 */}
            <div style={{ width: 80, borderTop: "2px dashed #cbd5e1", height: 0, position: "relative" }}>
              {dotProgress1 > 0 && dotProgress1 < 1 && (
                <div style={{ position: "absolute", left: `${dotProgress1 * 100}%`, top: -10, width: 18, height: 18, borderRadius: "50%", background: "#ea580c", boxShadow: "0 0 12px 4px rgba(234, 88, 12, 0.6)", transform: "translateX(-50%)" }} />
              )}
            </div>

            {/* 2. Step 1 Card: Define Projection */}
            <div style={{
              width: 320,
              height: 220,
              background: "rgba(255, 255, 255, 0.75)",
              backdropFilter: "blur(12px)",
              border: "1.5px solid rgba(13, 148, 136, 0.2)",
              borderRadius: 20,
              boxShadow: "0 10px 25px rgba(13, 148, 136, 0.04)",
              padding: 24,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <div style={{ background: "rgba(13, 148, 136, 0.08)", padding: "6px 16px", borderRadius: 14, fontFamily: MONO_STACK, fontSize: 16, color: "#0d9488", fontWeight: "bold", marginBottom: 16 }}>步骤 01</div>
              <div style={{ fontSize: 28, fontWeight: "bold", color: "#1e293b", fontFamily: SERIF_STACK }}>定义投影</div>
              <div style={{ fontSize: 18, color: "#475569", marginTop: 8, textAlign: "center" }}>声明数据本来的坐标系</div>
            </div>

            {/* Path Line 2 */}
            <div style={{ width: 80, borderTop: "2px dashed #cbd5e1", height: 0, position: "relative" }}>
              {dotProgress2 > 0 && dotProgress2 < 1 && (
                <div style={{ position: "absolute", left: `${dotProgress2 * 100}%`, top: -10, width: 18, height: 18, borderRadius: "50%", background: "#ea580c", boxShadow: "0 0 12px 4px rgba(234, 88, 12, 0.6)", transform: "translateX(-50%)" }} />
              )}
            </div>

            {/* 3. Step 2 Card: Project Raster */}
            <div style={{
              width: 320,
              height: 220,
              background: "rgba(255, 255, 255, 0.75)",
              backdropFilter: "blur(12px)",
              border: "1.5px solid rgba(234, 88, 12, 0.2)",
              borderRadius: 20,
              boxShadow: "0 10px 25px rgba(234, 88, 12, 0.04)",
              padding: 24,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <div style={{ background: "rgba(234, 88, 12, 0.08)", padding: "6px 16px", borderRadius: 14, fontFamily: MONO_STACK, fontSize: 16, color: "#ea580c", fontWeight: "bold", marginBottom: 16 }}>步骤 02</div>
              <div style={{ fontSize: 28, fontWeight: "bold", color: "#1e293b", fontFamily: SERIF_STACK }}>投影栅格</div>
              <div style={{ fontSize: 18, color: "#475569", marginTop: 8, textAlign: "center" }}>执行真实的像元重采样</div>
            </div>

            {/* Path Line 3 */}
            <div style={{ width: 80, borderTop: "2px dashed #cbd5e1", height: 0, position: "relative" }}>
              {dotProgress3 > 0 && dotProgress3 < 1 && (
                <div style={{ position: "absolute", left: `${dotProgress3 * 100}%`, top: -10, width: 18, height: 18, borderRadius: "50%", background: "#ea580c", boxShadow: "0 0 12px 4px rgba(234, 88, 12, 0.6)", transform: "translateX(-50%)" }} />
              )}
            </div>

            {/* 4. Final Output Card */}
            <div style={{
              width: 320,
              height: 220,
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              border: "1.5px solid rgba(56, 189, 248, 0.3)",
              borderRadius: 20,
              boxShadow: "0 12px 30px rgba(15, 23, 42, 0.25)",
              padding: 24,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              color: "white"
            }}>
              <div style={{ background: "rgba(56, 189, 248, 0.15)", padding: "6px 16px", borderRadius: 14, fontFamily: MONO_STACK, fontSize: 16, color: "#38bdf8", fontWeight: "bold", marginBottom: 16 }}>就绪</div>
              <div style={{ fontSize: 28, fontWeight: "bold", color: "#e2e8f0", fontFamily: SERIF_STACK }}>就绪栅格数据集</div>
              <div style={{ fontSize: 18, color: "#94a3b8", marginTop: 8, textAlign: "center", fontFamily: MONO_STACK }}>Projected Raster Dataset</div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== PHASE 6: BIG QUESTION MARK TRANSITION ==================== */}
      {phase6Fade > 0 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 25, opacity: phase6Fade }}>
          {/* Drifting signature question marks matching OpeningScene */}
          <FloatingQuestionMark x={240} y={230} size={220} delay={16} />
          <FloatingQuestionMark x={1640} y={750} size={330} delay={28} />
          <FloatingQuestionMark x={1480} y={280} size={150} delay={40} />

          <div
            style={{
              position: "absolute",
              fontFamily: SERIF_STACK,
              fontSize: 360,
              lineHeight: 1,
              color: "#ea580c",
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
            <h2 style={{ fontSize: 58, fontWeight: 900, color: "#c2410c", fontFamily: SERIF_STACK, letterSpacing: 0.5 }}>
              为什么栅格不能像矢量一样直接转换？
            </h2>
            <p style={{ fontFamily: SERIF_STACK, fontSize: 28, color: "#475569", marginTop: 24, maxWidth: 960, lineHeight: 1.7 }}>
              这要从两者的底层<b>数据结构差异</b>开始讲起……
            </p>
          </div>
        </div>
      )}

      </div>
    </AbsoluteFill>
  );
};
