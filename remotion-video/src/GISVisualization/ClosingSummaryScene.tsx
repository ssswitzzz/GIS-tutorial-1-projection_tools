import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
} from "remotion";

const SERIF_STACK =
  "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif SC', SimSun, serif";
const MONO_STACK = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const ease = Easing.bezier(0.22, 1, 0.36, 1);
const fps = 60;
const sec = (value: number) => Math.round(value * fps);

const progress = (frame: number, start: number, end: number) =>
  ease(interpolate(frame, [start, end], [0, 1], clamp));

// Float Component for floating/breathing animation
const Float: React.FC<{
  children: React.ReactNode;
  speed?: number;
  amplitude?: number;
  rotateAmplitude?: number;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, speed = 60, amplitude = 6, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const t = frame + delay;
  const y = Math.sin(t / speed) * amplitude;
  return (
    <div
      style={{
        ...style,
        transform: `${style?.transform || ""} translate3d(0, ${y}px, 0)`,
        backfaceVisibility: "hidden",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {children}
    </div>
  );
};

const PaperBackground: React.FC<{ cameraX: number }> = ({ cameraX }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(Math.sin(frame / 120), [-1, 1], [-14, 14]);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #f9f4e9 0%, #fcfbf5 50%, #e9efea 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.24,
          backgroundImage:
            "linear-gradient(rgba(37, 48, 43, 0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 48, 43, 0.09) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          transform: `translate(${drift - cameraX * 0.2}px, ${drift * 0.4}px)`,
        }}
      />
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, opacity: 0.15 }}
      >
        <path
          d="M-40 744 C 254 664, 420 812, 730 722 S 1260 476, 1970 598"
          fill="none"
          stroke="#6d7c6b"
          strokeWidth="2"
          style={{
            transform: `translateX(${-cameraX * 0.07}px)`,
          }}
        />
        <path
          d="M-30 824 C 250 738, 470 920, 760 812 S 1300 552, 1980 674"
          fill="none"
          stroke="#6d7c6b"
          strokeWidth="2"
          style={{
            transform: `translateX(${-cameraX * 0.12}px)`,
          }}
        />
        <path
          d="M104 230 C 376 124, 584 304, 858 208 S 1398 26, 1960 188"
          fill="none"
          stroke="#426b80"
          strokeWidth="1.5"
          style={{
            transform: `translateX(${-cameraX * 0.05}px)`,
          }}
        />
        <path
          d="M1380 984 C 1478 812, 1656 766, 1848 832"
          fill="none"
          stroke="#a98452"
          strokeWidth="2"
          style={{
            transform: `translateX(${-cameraX * 0.16}px)`,
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 14%, rgba(196, 143, 72, 0.18), transparent 26%), radial-gradient(circle at 82% 20%, rgba(59, 105, 121, 0.12), transparent 24%), radial-gradient(circle at 74% 86%, rgba(93, 120, 89, 0.14), transparent 30%)",
        }}
      />
    </AbsoluteFill>
  );
};

const TopHeader: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        top: 44,
        left: 58,
        color: "#315f6d",
        display: "flex",
        alignItems: "center",
        gap: 12,
        zIndex: 40,
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: 999, background: "#5b806f" }} />
      <span style={{ fontFamily: MONO_STACK, fontSize: 22 }}>GIS PROJECTION / </span>
      <span style={{ fontFamily: SERIF_STACK, fontSize: 22, fontWeight: 700 }}>结尾总结</span>
    </div>
    <div
      style={{
        position: "absolute",
        top: 44,
        right: 58,
        fontFamily: MONO_STACK,
        fontSize: 18,
        color: "#6f7368",
        zIndex: 40,
      }}
    >
      FINAL SUMMARY
    </div>
  </>
);

const TitleBlock: React.FC<{
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  color?: string;
  delay?: number;
}> = ({ eyebrow, title, subtitle, color = "#4f745d", delay = 0 }) => {
  const frame = useCurrentFrame();
  const enterSpring = spring({
    frame: frame - delay,
    fps: 60,
    config: { damping: 15, stiffness: 90 },
  });
  const opacity = interpolate(enterSpring, [0, 1], [0, 1], clamp);
  const translateY = interpolate(enterSpring, [0, 1], [30, 0], clamp);

  return (
    <div
      style={{
        position: "absolute",
        top: 108,
        left: "50%",
        width: 1500,
        transform: `translateX(-50%) translateY(${translateY}px)`,
        textAlign: "center",
        opacity,
        zIndex: 30,
      }}
    >
      <div style={{ fontFamily: SERIF_STACK, fontSize: 24, color, fontWeight: 800, marginBottom: 14, letterSpacing: 0 }}>
        {eyebrow}
      </div>
      <div style={{ fontFamily: SERIF_STACK, fontSize: 66, lineHeight: 1.12, fontWeight: 800, color: "#26332e" }}>
        {title}
      </div>
      <div style={{ fontFamily: SERIF_STACK, fontSize: 34, color: "#6f7368", marginTop: 14 }}>{subtitle}</div>
    </div>
  );
};

const TagPill: React.FC<{
  label: string;
  color: string;
  muted?: boolean;
  style?: React.CSSProperties;
}> = ({ label, color, muted = false, style }) => (
  <div
    style={{
      height: 44,
      padding: "0 20px",
      borderRadius: 999,
      border: `1.5px solid ${color}`,
      background: muted ? "rgba(255,255,255,0.7)" : `${color}14`,
      color,
      fontFamily: SERIF_STACK,
      fontSize: 20,
      fontWeight: 800,
      display: "flex",
      alignItems: "center",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {label}
  </div>
);

const StatementCard: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  accent: string;
  children: React.ReactNode;
  delay: number;
  shake?: number;
  style?: React.CSSProperties;
}> = ({ x, y, width, height, accent, children, delay, shake = 0, style }) => {
  const frame = useCurrentFrame();
  const enter = spring({
    frame: frame - delay,
    fps: 60,
    config: { damping: 18, stiffness: 78 },
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        borderRadius: 12,
        background: "rgba(255, 255, 255, 0.88)",
        border: `1.5px solid ${accent}22`,
        boxShadow: `0 24px 55px ${accent}14`,
        boxSizing: "border-box",
        padding: 28,
        overflow: "hidden",
        opacity: interpolate(enter, [0, 1], [0, 1], clamp),
        transform: `translate(-50%, -50%) scale(${interpolate(enter, [0, 1], [0.92, 1], clamp)}) translateX(${shake}px)`,
        ...style,
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, background: accent }} />
      {children}
    </div>
  );
};

const MiniFile: React.FC<{ tagProgress: number; enter: number }> = ({ tagProgress, enter }) => {
  const stampScale = interpolate(tagProgress, [0, 0.7, 0.85, 1], [2.2, 0.9, 1.15, 1.0], clamp);
  const stampRotate = interpolate(tagProgress, [0, 0.7, 1], [15, -12, -8], clamp);

  return (
    <div
      style={{
        width: 440,
        height: 350,
        borderRadius: 12,
        background: "#fffdf8",
        border: "1.5px solid rgba(167, 119, 72, 0.25)",
        boxShadow: "0 18px 45px rgba(167, 119, 72, 0.1)",
        opacity: enter,
        overflow: "hidden",
        transform: `translate(-50%, -50%) scale(${interpolate(enter, [0, 1], [0.92, 1], clamp)})`,
      }}
    >
      <div style={{ height: 52, background: "#a77748", color: "white", fontFamily: MONO_STACK, fontSize: 18, display: "flex", alignItems: "center", paddingLeft: 20, fontWeight: 800 }}>
        sample_data.shp
      </div>
      <svg width="440" height="298" viewBox="0 0 440 298" style={{ position: "absolute", top: 52 }}>
        <path d="M 40 188 C 120 148, 202 216, 298 166 S 400 158, 418 188" fill="none" stroke="#2563eb" strokeWidth="8" />
        <path d="M 110 30 L 110 268" stroke="#e2e8f0" strokeWidth="4" />
        <path d="M 20 140 L 420 140" stroke="#e2e8f0" strokeWidth="4" />
        <circle cx="316" cy="116" r="18" fill="#10b981" fillOpacity="0.36" stroke="#047857" strokeWidth="2.5" />
        <rect x="314" y="188" width="30" height="30" rx="6" fill="#f59e0b" fillOpacity="0.28" stroke="#d97706" strokeWidth="2.5" />
      </svg>
      <div
        style={{
          position: "absolute",
          right: 32,
          top: 110,
          transform: `rotate(${stampRotate}deg) scale(${stampScale})`,
          opacity: tagProgress,
          transformOrigin: "center center",
        }}
      >
        <TagPill label="已贴 CRS 标签" color="#10b981" />
      </div>
    </div>
  );
};

const ArrowConnector: React.FC<{ progress: number }> = ({ progress }) => {
  const len = 122;
  const dashoffset = len * (1 - progress);
  const arrowOpacity = interpolate(progress, [0.8, 1], [0, 1], clamp);
  return (
    <svg width="170" height="70" viewBox="0 0 170 70" style={{ overflow: "visible" }}>
      <path
        d="M 18 35 L 140 35"
        stroke="#a77748"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="122"
        strokeDashoffset={dashoffset}
        fill="none"
      />
      <path
        d="M 128 22 L 146 35 L 128 48"
        fill="none"
        stroke="#a77748"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: arrowOpacity }}
      />
    </svg>
  );
};

const IntroPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const card1Spring = spring({ frame: frame - 60, fps: 60, config: { damping: 15, stiffness: 90 } });
  const card2Spring = spring({ frame: frame - 110, fps: 60, config: { damping: 15, stiffness: 90 } });

  return (
    <AbsoluteFill>
      <TitleBlock
        eyebrow="最后总结"
        title="两句话，打包带走"
        subtitle="把 Define Projection、Project、矢量、栅格放回同一张地图里"
        color="#4f745d"
        delay={10}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 568,
          transform: "translate(-50%, -50%)",
          display: "flex",
          gap: 44,
        }}
      >
        <Float speed={55} amplitude={8} rotateAmplitude={0.6} delay={0}>
          <div
            style={{
              width: 520,
              height: 220,
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.9)",
              border: "1.5px solid rgba(167, 119, 72, 0.22)",
              boxShadow: "0 22px 50px rgba(167, 119, 72, 0.12)",
              boxSizing: "border-box",
              padding: 32,
              position: "relative",
              overflow: "hidden",
              opacity: interpolate(card1Spring, [0, 1], [0, 1], clamp),
              transform: `scale(${interpolate(card1Spring, [0, 1], [0.92, 1], clamp)})`,
            }}
          >
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, background: "#a77748" }} />
            <TagPill label="第一句" color="#a77748" />
            <div style={{ marginTop: 24, fontSize: 42, fontWeight: 800, color: "#26332e" }}>
              贴标签 vs 改数字
            </div>
          </div>
        </Float>

        <Float speed={65} amplitude={8} rotateAmplitude={-0.6} delay={30}>
          <div
            style={{
              width: 520,
              height: 220,
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.9)",
              border: "1.5px solid rgba(49, 95, 109, 0.22)",
              boxShadow: "0 22px 50px rgba(49, 95, 109, 0.12)",
              boxSizing: "border-box",
              padding: 32,
              position: "relative",
              overflow: "hidden",
              opacity: interpolate(card2Spring, [0, 1], [0, 1], clamp),
              transform: `scale(${interpolate(card2Spring, [0, 1], [0.92, 1], clamp)})`,
            }}
          >
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, background: "#315f6d" }} />
            <TagPill label="第二句" color="#315f6d" />
            <div style={{ marginTop: 24, fontSize: 42, fontWeight: 800, color: "#26332e" }}>
              换位置 vs 重采样
            </div>
          </div>
        </Float>
      </div>
    </AbsoluteFill>
  );
};

const DefineProjectPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const tagProgress = progress(frame, 408, 500);
  const projectProgress = progress(frame, 566, 680);

  // Tag Projection card variables
  const tagRightOpacity = interpolate(tagProgress, [0.6, 1], [0, 1], clamp);
  const tagShiftX = interpolate(tagProgress, [0.6, 1], [-12, 0], clamp);
  const tagArrowDashOffset = 32 * (1 - tagProgress);
  const tagArrowheadOpacity = interpolate(tagProgress, [0.8, 1], [0, 1], clamp);

  // Project card variables
  const rightOpacity = interpolate(projectProgress, [0.6, 1], [0, 1], clamp);
  const shiftX = interpolate(projectProgress, [0.6, 1], [-16, 0], clamp);
  const arrowDashOffset = 58 * (1 - projectProgress);
  const arrowheadOpacity = interpolate(projectProgress, [0.8, 1], [0, 1], clamp);

  const fileEnter = spring({ frame: frame - 320, fps: 60, config: { damping: 16, stiffness: 90 } });

  return (
    <AbsoluteFill>
      <TitleBlock
        eyebrow="第一句"
        title="Define Projection 是贴标签，Project 是改数字"
        subtitle="一个改元数据，一个改坐标值，顺序不能反"
        color="#a77748"
        delay={300}
      />

      <Float speed={58} amplitude={6} rotateAmplitude={0.4} delay={10} style={{ position: "absolute", left: 350, top: 550 }}>
        <MiniFile tagProgress={tagProgress} enter={interpolate(fileEnter, [0, 1], [0, 1], clamp)} />
      </Float>

      <Float speed={62} amplitude={6} rotateAmplitude={-0.4} delay={20} style={{ position: "absolute", left: 960, top: 550 }}>
        <StatementCard x={0} y={0} width={440} height={350} accent="#10b981" delay={340}>
          <TagPill label="Define Projection" color="#10b981" />
          <div style={{ fontFamily: SERIF_STACK, fontSize: 40, color: "#26332e", fontWeight: 800, marginTop: 20 }}>
            贴标签
          </div>
          <div style={{ fontSize: 28, color: "#6f7368", lineHeight: 1.55, marginTop: 14 }}>
            说明这份数据原本是什么坐标系，坐标数字本身不动。
          </div>
          <svg width="380" height="58" viewBox="0 0 380 58" style={{ marginTop: 16, overflow: "visible" }}>
            {/* Left coordinate text - stationary */}
            <text x="80" y="32" textAnchor="middle" fontFamily={MONO_STACK} fontSize="18" fontWeight="800" fill="#6f7368">
              120.50, 31.20
            </text>
            {/* Animated arrow line */}
            <path
              d="M 158 24 L 190 24"
              stroke="#a77748"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="32"
              strokeDashoffset={tagArrowDashOffset}
              fill="none"
            />
            {/* Arrowhead */}
            <path
              d="M 184 18 L 190 24 L 184 30"
              stroke="#a77748"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{ opacity: tagArrowheadOpacity }}
            />
            {/* Right coordinate text - fading & sliding in */}
            <text
              x={288 + tagShiftX}
              y="32"
              textAnchor="middle"
              fontFamily={MONO_STACK}
              fontSize="18"
              fontWeight="800"
              fill="#10b981"
              style={{
                opacity: tagRightOpacity,
              }}
            >
              120.50°E, 31.20°N
            </text>
          </svg>
        </StatementCard>
      </Float>

      <Float speed={66} amplitude={6} rotateAmplitude={0.4} delay={30} style={{ position: "absolute", left: 1570, top: 550 }}>
        <StatementCard x={0} y={0} width={440} height={350} accent="#315f6d" delay={360}>
          <TagPill label="Project" color="#315f6d" />
          <div style={{ fontFamily: SERIF_STACK, fontSize: 40, color: "#26332e", fontWeight: 800, marginTop: 20 }}>
            改数字
          </div>
          <div style={{ fontSize: 28, color: "#6f7368", lineHeight: 1.55, marginTop: 14 }}>
            把每个坐标代入公式，换算成目标坐标系里的新位置。
          </div>
          <svg width="350" height="58" viewBox="0 0 350 58" style={{ marginTop: 16, overflow: "visible" }}>
            {/* Left coordinate text - stationary */}
            <text x="90" y="32" textAnchor="middle" fontFamily={MONO_STACK} fontSize="24" fontWeight="800" fill="#315f6d">
              120.50
            </text>
            {/* Animated arrow line */}
            <path
              d="M 146 24 L 204 24"
              stroke="#a77748"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="58"
              strokeDashoffset={arrowDashOffset}
              fill="none"
            />
            {/* Arrowhead */}
            <path
              d="M 196 16 L 204 24 L 196 32"
              stroke="#a77748"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{ opacity: arrowheadOpacity }}
            />
            {/* Right coordinate text - fading & sliding in */}
            <text
              x={260 + shiftX}
              y="32"
              textAnchor="middle"
              fontFamily={MONO_STACK}
              fontSize="24"
              fontWeight="800"
              fill="#8f4e3e"
              style={{
                opacity: rightOpacity,
              }}
            >
              408522
            </text>
          </svg>
        </StatementCard>
      </Float>
    </AbsoluteFill>
  );
};

const WarningWorkflowPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const errorShake = interpolate(frame, [854, 856, 858, 860, 862, 864, 866, 870], [0, 8, -6, 4, -2, 1, 0, 0], clamp);
  const isError = frame >= 854;
  const errorProgress = spring({ frame: frame - 854, fps: 60, config: { damping: 12, stiffness: 100 } });

  const c1Enter = spring({ frame: frame - 760, fps: 60, config: { damping: 16, stiffness: 85 } });
  const c2Enter = spring({ frame: frame - 800, fps: 60, config: { damping: 16, stiffness: 85 } });
  const c3Enter = spring({ frame: frame - 840, fps: 60, config: { damping: 16, stiffness: 85 } });

  const arrow1Progress = progress(frame, 780, 810);
  const arrow2Progress = progress(frame, 820, 850);

  const c2BorderColor = isError ? `rgba(${Math.round(interpolate(errorProgress, [0, 1], [49, 143]))}, ${Math.round(interpolate(errorProgress, [0, 1], [95, 78]))}, ${Math.round(interpolate(errorProgress, [0, 1], [109, 62]))}, ${interpolate(errorProgress, [0, 1], [0.14, 0.7])})` : "rgba(49, 95, 109, 0.14)";
  const c2ShadowColor = isError ? `rgba(${Math.round(interpolate(errorProgress, [0, 1], [49, 143]))}, ${Math.round(interpolate(errorProgress, [0, 1], [95, 78]))}, ${Math.round(interpolate(errorProgress, [0, 1], [109, 62]))}, ${interpolate(errorProgress, [0, 1], [0.1, 0.3])})` : "rgba(49, 95, 109, 0.1)";

  const crossScale = spring({ frame: frame - 858, fps: 60, config: { damping: 10, stiffness: 120 } });
  const crossOpacity = interpolate(crossScale, [0, 0.4], [0, 1], clamp);

  const validSpring = spring({ frame: frame - 1272, fps: 60, config: { damping: 14, stiffness: 90 } });
  const bannerScale = interpolate(validSpring, [0, 1], [0.85, 1], clamp);
  const bannerOpacity = interpolate(validSpring, [0, 1], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <TitleBlock
        eyebrow="遇到未知坐标系"
        title="不要盲目投影"
        subtitle="软件不知道原始坐标单位，就没法代入投影公式"
        color="#8f4e3e"
        delay={741}
      />
      <div
        style={{
          position: "absolute",
          left: 210,
          top: 356,
          width: 1500,
          height: 380,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Float speed={56} amplitude={6} rotateAmplitude={0.4} delay={5}>
          <div
            style={{
              width: 330,
              height: 240,
              borderRadius: 12,
              background: "#fffdf8",
              border: "1.5px solid rgba(143, 78, 62, 0.25)",
              boxShadow: "0 18px 45px rgba(143, 78, 62, 0.1)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              opacity: interpolate(c1Enter, [0, 1], [0, 1], clamp),
              transform: `scale(${interpolate(c1Enter, [0, 1], [0.92, 1], clamp)})`,
            }}
          >
            <div style={{ fontFamily: SERIF_STACK, fontSize: 44, color: "#8f4e3e", fontWeight: 800 }}>
              未知数据
            </div>
            <div style={{ marginTop: 18, fontFamily: MONO_STACK, fontSize: 24, color: "#6f7368", fontWeight: 800 }}>
              CRS: ?
            </div>
          </div>
        </Float>

        <ArrowConnector progress={arrow1Progress} />

        <Float speed={60} amplitude={6} rotateAmplitude={-0.4} delay={15} style={{ transform: `translateX(${errorShake}px)` }}>
          <div
            style={{
              width: 330,
              height: 240,
              borderRadius: 12,
              background: "#fffdf8",
              border: `1.5px solid ${c2BorderColor}`,
              boxShadow: `0 18px 45px ${c2ShadowColor}`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              opacity: interpolate(c2Enter, [0, 1], [0, 1], clamp),
              transform: `scale(${interpolate(c2Enter, [0, 1], [0.92, 1], clamp)})`,
            }}
          >
            <div style={{ fontFamily: SERIF_STACK, fontSize: 44, color: isError ? "#8f4e3e" : "#315f6d", fontWeight: 800 }}>
              Project
            </div>
            <div style={{ marginTop: 18, fontFamily: SERIF_STACK, fontSize: 24, color: "#6f7368", fontWeight: 800 }}>
              公式计算
            </div>
            {isError && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.35)",
                  borderRadius: 12,
                  opacity: crossOpacity,
                  transform: `scale(${interpolate(crossScale, [0, 1], [0.3, 1], clamp)})`,
                }}
              >
                <div style={{ fontSize: 130, color: "#8f4e3e", fontWeight: 900, lineHeight: 1, fontFamily: MONO_STACK }}>
                  ❌
                </div>
              </div>
            )}
          </div>
        </Float>

        <ArrowConnector progress={arrow2Progress} />

        <Float speed={64} amplitude={6} rotateAmplitude={0.4} delay={25}>
          <div
            style={{
              width: 330,
              height: 240,
              borderRadius: 12,
              background: "#fffdf8",
              border: isError ? "1.5px solid rgba(143, 78, 62, 0.75)" : "1.5px solid rgba(143, 78, 62, 0.25)",
              boxShadow: isError ? "0 18px 45px rgba(143, 78, 62, 0.25)" : "0 18px 45px rgba(143, 78, 62, 0.1)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              opacity: interpolate(c3Enter, [0, 1], [0, 1], clamp),
              transform: `scale(${interpolate(c3Enter, [0, 1], [0.92, 1], clamp)})`,
            }}
          >
            <div style={{ fontFamily: SERIF_STACK, fontSize: 44, color: "#8f4e3e", fontWeight: 800 }}>
              结果不可信
            </div>
            <div style={{ marginTop: 18, fontFamily: SERIF_STACK, fontSize: 24, color: "#6f7368", fontWeight: 800 }}>
              单位未知
            </div>
          </div>
        </Float>
      </div>

      <Float speed={70} amplitude={5} rotateAmplitude={0.3} delay={40} style={{ position: "absolute", left: "50%", top: 770, transform: "translateX(-50%)" }}>
        <div
          style={{
            transform: `scale(${bannerScale})`,
            opacity: bannerOpacity,
            height: 96,
            padding: "0 36px",
            borderRadius: 12,
            background: "rgba(236, 253, 245, 0.95)",
            border: "2px solid #10b981",
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 18px 45px rgba(16, 185, 129, 0.18)",
            fontFamily: SERIF_STACK,
            fontSize: 38,
            fontWeight: 800,
            color: "#26332e",
            whiteSpace: "nowrap",
          }}
        >
          <span>正确顺序：</span>
          <span
            style={{
              padding: "4px 18px",
              borderRadius: 999,
              border: "2px solid #10b981",
              background: "rgba(16, 185, 129, 0.08)",
              color: "#10b981",
              lineHeight: 1,
            }}
          >
            先定义
          </span>
          <span style={{ color: "#a77748" }}>再</span>
          <span
            style={{
              padding: "4px 18px",
              borderRadius: 999,
              border: "2px solid #315f6d",
              background: "rgba(49, 95, 109, 0.08)",
              color: "#315f6d",
              lineHeight: 1,
            }}
          >
            投影
          </span>
        </div>
      </Float>
    </AbsoluteFill>
  );
};

const VertexDiagram: React.FC<{ enter: number }> = ({ enter }) => {
  const frame = useCurrentFrame();
  const move = progress(frame, 1888, 2020);
  const pts = [
    { x: 120, y: 88, nx: 174, ny: 64 },
    { x: 248, y: 92, nx: 292, ny: 124 },
    { x: 300, y: 214, nx: 358, ny: 220 },
    { x: 164, y: 236, nx: 210, ny: 246 },
    { x: 72, y: 190, nx: 122, ny: 210 },
  ];

  return (
    <div
      style={{
        width: 570,
        height: 380,
        borderRadius: 12,
        background: "rgba(255,255,255,0.9)",
        border: "1.5px solid rgba(49, 95, 109, 0.22)",
        boxShadow: "0 22px 50px rgba(49, 95, 109, 0.12)",
        padding: 26,
        boxSizing: "border-box",
        opacity: enter,
        transform: `scale(${interpolate(enter, [0, 1], [0.92, 1], clamp)})`,
      }}
    >
      <TagPill label="矢量：换位置" color="#315f6d" />
      <svg width="510" height="280" viewBox="0 0 510 280" style={{ marginTop: 18 }}>
        <polygon
          points={pts
            .map((p) => `${interpolate(move, [0, 1], [p.x, p.nx], clamp)},${interpolate(move, [0, 1], [p.y, p.ny], clamp)}`)
            .join(" ")}
          fill="#315f6d22"
          stroke="#315f6d"
          strokeWidth="4"
        />
        {pts.map((p, idx) => {
          const x = interpolate(move, [0, 1], [p.x, p.nx], clamp);
          const y = interpolate(move, [0, 1], [p.y, p.ny], clamp);
          const dx = x - p.x;
          const dy = y - p.y;
          return (
            <g key={`vertex-${idx}`}>
              <path d={`M ${p.x} ${p.y} L ${p.nx} ${p.ny}`} stroke="#a77748" strokeWidth="2" strokeDasharray="7 7" opacity="0.55" />
              <circle cx={x} cy={y} r="9" fill="#fffdf8" stroke="#315f6d" strokeWidth="4" />
              <text
                x={p.x + 13 + dx}
                y={p.y - 11 + dy}
                fontFamily={MONO_STACK}
                fontSize="18"
                fontWeight="800"
                fill="#315f6d"
              >
                V{idx + 1}
              </text>
            </g>
          );
        })}
        <text x="255" y="270" textAnchor="middle" fontFamily={SERIF_STACK} fontSize="22" fontWeight="800" fill="#6f7368">
          每个顶点代入一次公式 → 得到新坐标
        </text>
      </svg>
    </div>
  );
};

const RasterDiagram: React.FC<{ enter: number }> = ({ enter }) => {
  const frame = useCurrentFrame();
  const fill = progress(frame, 2382, 2580);
  const cells = Array.from({ length: 36 }).map((_, idx) => {
    const row = Math.floor(idx / 6);
    const col = idx % 6;
    const dist = Math.sqrt(row * row + col * col) / 8; // 0 to 1
    const cellProgress = interpolate(fill, [dist * 0.5, dist * 0.5 + 0.3], [0, 1], clamp);
    const active = interpolate(cellProgress, [0, 1], [0.18, 0.95], clamp);

    const seed = (row * 17 + col * 23) % 100;
    const base = seed > 66 ? "#315f6d" : seed > 36 ? "#5f8163" : "#a77748";
    return { base, active };
  });

  return (
    <div
      style={{
        width: 570,
        height: 380,
        borderRadius: 12,
        background: "rgba(255,255,255,0.9)",
        border: "1.5px solid rgba(167, 119, 72, 0.25)",
        boxShadow: "0 22px 50px rgba(167, 119, 72, 0.12)",
        padding: 26,
        boxSizing: "border-box",
        opacity: enter,
        transform: `scale(${interpolate(enter, [0, 1], [0.92, 1], clamp)})`,
      }}
    >
      <TagPill label="栅格：重采样" color="#a77748" />
      <div style={{ display: "flex", gap: 24, alignItems: "center", marginTop: 30 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 34px)", gap: 6 }}>
          {cells.map((cell, idx) => (
            <div
              key={`raster-cell-${idx}`}
              style={{
                width: 34,
                height: 34,
                borderRadius: 5,
                background: cell.base,
                opacity: cell.active,
                border: "1px solid rgba(255,255,255,0.52)",
              }}
            />
          ))}
        </div>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ overflow: "visible" }}>
          {/* Straight horizontal dashed line pointing left */}
          <path d="M 110 60 L 10 60" stroke="#8f4e3e" strokeWidth="4" strokeDasharray="8 6" fill="none" />
          {/* Arrowhead pointing left */}
          <path d="M 22 48 L 10 60 L 22 72" fill="none" stroke="#8f4e3e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {/* Text above the arrow */}
          <text x="60" y="38" textAnchor="middle" fontFamily={SERIF_STACK} fontSize="18" fontWeight="800" fill="#8f4e3e">
            逆向反算
          </text>
        </svg>
        <div style={{ width: 170, fontFamily: SERIF_STACK, fontSize: 38, fontWeight: 800, color: "#26332e", lineHeight: 1.35 }}>
          插值填充
          <div style={{ fontFamily: SERIF_STACK, fontSize: 22, color: "#6f7368", marginTop: 12, fontWeight: 800 }}>
            输出像元从原图取值
          </div>
        </div>
      </div>
    </div>
  );
};

const VectorRasterPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const leftEnter = spring({ frame: frame - 1470, fps: 60, config: { damping: 16, stiffness: 85 } });
  const rightEnter = spring({ frame: frame - 1630, fps: 60, config: { damping: 16, stiffness: 85 } });

  return (
    <AbsoluteFill>
      <TitleBlock
        eyebrow="第二句"
        title="矢量投影是换位置，栅格投影是重采样"
        subtitle="一个处理顶点，一个处理像元矩阵"
        color="#315f6d"
        delay={1452}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 564,
          transform: "translate(-50%, -50%)",
          display: "flex",
          gap: 56,
        }}
      >
        <Float speed={60} amplitude={6} rotateAmplitude={0.4} delay={10}>
          <VertexDiagram enter={interpolate(leftEnter, [0, 1], [0, 1], clamp)} />
        </Float>
        <Float speed={65} amplitude={6} rotateAmplitude={-0.4} delay={35}>
          <RasterDiagram enter={interpolate(rightEnter, [0, 1], [0, 1], clamp)} />
        </Float>
      </div>
    </AbsoluteFill>
  );
};

const FinalLockup: React.FC<{ enter: number }> = ({ enter }) => {
  const frame = useCurrentFrame();
  const sealSpring = spring({
    frame: frame - 2840,
    fps: 60,
    config: { damping: 11, stiffness: 120 },
  });
  const sealScale = interpolate(sealSpring, [0, 0.75, 0.9, 1], [4.0, 0.85, 1.1, 1.0], clamp);
  const sealOpacity = interpolate(sealSpring, [0, 0.25], [0, 0.92], clamp);
  const sealRotate = interpolate(sealSpring, [0, 0.75, 1], [30, -15, -12], clamp);

  const textOpacity = interpolate(enter, [0.3, 1], [0, 1], clamp);
  const textTranslateY = interpolate(enter, [0, 1], [24, 0], clamp);

  return (
    <AbsoluteFill style={{ opacity: enter }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 1180,
          height: 520,
          transform: `translate(-50%, -50%) scale(${interpolate(enter, [0, 1], [0.92, 1], clamp)})`,
          borderRadius: 16,
          background: "rgba(255, 255, 255, 0.88)",
          border: "1.5px solid rgba(79, 116, 93, 0.24)",
          boxShadow: "0 28px 80px rgba(79, 116, 93, 0.14)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 44,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontFamily: SERIF_STACK,
            fontSize: 32,
            color: "#4f745d",
            fontWeight: 800,
            marginBottom: 28,
            opacity: textOpacity,
            transform: `translateY(${textTranslateY}px)`,
          }}
        >
          打包带走
        </div>
        <div
          style={{
            fontFamily: SERIF_STACK,
            fontSize: 64,
            color: "#26332e",
            fontWeight: 800,
            lineHeight: 1.35,
            textAlign: "center",
            opacity: textOpacity,
            transform: `translateY(${textTranslateY}px)`,
          }}
        >
          先定义，再投影
          <br />
          矢量投影换位置，栅格投影重采样
        </div>
        <div
          style={{
            position: "absolute",
            right: -80,
            bottom: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: "5px solid #8f4e3e",
            color: "#8f4e3e",
            fontFamily: SERIF_STACK,
            fontSize: 60,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `rotate(${sealRotate}deg) scale(${sealScale})`,
            opacity: sealOpacity,
            background: "rgba(255,253,248,0.7)",
            boxShadow: "0 8px 24px rgba(143, 78, 62, 0.1)",
          }}
        >
          收工
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ClosingSummaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const sceneFade = interpolate(frame, [0, 24, 3370, 3400], [0, 1, 1, 0], clamp);

  // Springs for camera pan
  const cameraSpring1 = spring({ frame: frame - sec(4.8), fps: 60, config: { damping: 20, stiffness: 60 } });
  const cameraSpring2 = spring({ frame: frame - sec(12.0), fps: 60, config: { damping: 20, stiffness: 60 } });
  const cameraSpring3 = spring({ frame: frame - sec(23.8), fps: 60, config: { damping: 20, stiffness: 60 } });
  const cameraSpring4 = spring({ frame: frame - sec(45.7), fps: 60, config: { damping: 20, stiffness: 60 } });

  const cameraX = (cameraSpring1 + cameraSpring2 + cameraSpring3 + cameraSpring4) * 1920;

  // Zoom dip during camera moves
  const dip1 = 4 * cameraSpring1 * (1 - cameraSpring1);
  const dip2 = 4 * cameraSpring2 * (1 - cameraSpring2);
  const dip3 = 4 * cameraSpring3 * (1 - cameraSpring3);
  const dip4 = 4 * cameraSpring4 * (1 - cameraSpring4);
  const totalDip = Math.max(0, Math.min(1, dip1 + dip2 + dip3 + dip4));
  const cameraScale = 1 - 0.04 * totalDip;

  // Screen shake on warning error (854) and final seal stamp (2840)
  const warningShake = interpolate(frame, [854, 856, 858, 860, 862, 864, 866, 870], [0, 8, -6, 4, -2, 1, 0, 0], clamp);
  const sealShake = interpolate(frame, [2840, 2842, 2844, 2846, 2848, 2850, 2852, 2856], [0, 14, -10, 7, -4, 2, 0, 0], clamp);
  const shakeX = warningShake + sealShake;
  const shakeY = (warningShake + sealShake) * 0.4;

  // Fade out for panels to prevent overlap on final lockup or offscreen rendering
  const finalOpacity = spring({ frame: frame - sec(46.3), fps: 60, config: { damping: 15, stiffness: 90 } });

  return (
    <AbsoluteFill style={{ fontFamily: SERIF_STACK, color: "#29342f", opacity: sceneFade, overflow: "hidden" }}>
      <PaperBackground cameraX={cameraX} />
      <TopHeader />

      {/* Scrolling Canvas Container */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${cameraScale}) translate(${shakeX}px, ${shakeY}px)`,
          transformOrigin: "center center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 1920 * 5,
            height: 1080,
            transform: `translateX(${-cameraX}px)`,
          }}
        >
          {/* Panel 0: Intro */}
          <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }}>
            <IntroPanel />
          </div>

          {/* Panel 1: Define vs Project */}
          <div style={{ position: "absolute", left: 1920, top: 0, width: 1920, height: 1080 }}>
            <DefineProjectPanel />
          </div>

          {/* Panel 2: Warning Workflow */}
          <div style={{ position: "absolute", left: 3840, top: 0, width: 1920, height: 1080 }}>
            <WarningWorkflowPanel />
          </div>

          {/* Panel 3: Vector vs Raster */}
          <div style={{ position: "absolute", left: 5760, top: 0, width: 1920, height: 1080 }}>
            <VectorRasterPanel />
          </div>

          {/* Panel 4: Final Summary */}
          <div style={{ position: "absolute", left: 7680, top: 0, width: 1920, height: 1080 }}>
            <FinalLockup enter={interpolate(finalOpacity, [0, 1], [0, 1], clamp)} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
