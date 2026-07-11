import React from "react";
import {
  AbsoluteFill,
  Easing,
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

const ease = Easing.bezier(0.22, 1, 0.36, 1);

// Float Component for floating/breathing animation
const Float: React.FC<{
  children: React.ReactNode;
  speed?: number;
  amplitude?: number;
  rotateAmplitude?: number;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, speed = 60, amplitude = 6, rotateAmplitude = 0.5, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const t = frame + delay;
  const y = Math.sin(t / speed) * amplitude;
  const r = Math.cos(t / (speed * 1.2)) * rotateAmplitude;
  return (
    <div
      style={{
        ...style,
        transform: `${style?.transform || ""} translateY(${y}px) rotate(${r}deg)`,
      }}
    >
      {children}
    </div>
  );
};

const fade = (frame: number, start: number, end: number, fadeIn = 18, fadeOut = 18) =>
  interpolate(frame, [start, start + fadeIn, end - fadeOut, end], [0, 1, 1, 0], clamp);

const softStep = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {...clamp, easing: ease});

const PaperBackground: React.FC<{tone?: "light" | "warm"}> = ({tone = "light"}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
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
        style={{position: "absolute", inset: 0, opacity: 0.16}}
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

const TopCode: React.FC<{text: string; active?: boolean}> = ({text, active = true}) => (
  <div
    style={{
      position: "absolute",
      top: 44,
      left: 58,
      fontFamily: MONO_STACK,
      fontSize: 15,
      letterSpacing: 1.2,
      color: active ? "#315f6d" : "rgba(47, 55, 49, 0.48)",
      display: "flex",
      alignItems: "center",
      gap: 12,
      zIndex: 30,
    }}
  >
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: 999,
        background: active ? "#5b806f" : "rgba(47, 55, 49, 0.35)",
      }}
    />
    {text}
  </div>
);

const SectionTitle: React.FC<{
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  y?: number;
  color?: string;
}> = ({eyebrow, title, subtitle, y = 118, color = "#4f745d"}) => (
  <div
    style={{
      position: "absolute",
      top: y,
      left: "50%",
      transform: "translateX(-50%)",
      width: 1500,
      textAlign: "center",
    }}
  >
    <div
      style={{
        fontFamily: MONO_STACK,
        fontSize: 16,
        color,
        marginBottom: 16,
        fontWeight: 700,
      }}
    >
      {eyebrow}
    </div>
    <div style={{fontSize: 64, lineHeight: 1.12, fontWeight: 700, color: "#26332e"}}>
      {title}
    </div>
    <div style={{fontFamily: MONO_STACK, fontSize: 16, color: "#6f7368", marginTop: 16}}>
      {subtitle}
    </div>
  </div>
);

const DrawnStamp: React.FC<{
  progress: number;
  tone: "green" | "amber";
  title: string;
  label: string;
}> = ({progress, tone, title, label}) => {
  const color = tone === "green" ? "#4f745d" : "#a77748";
  const bg = tone === "green" ? "rgba(79, 116, 93, 0.07)" : "rgba(167, 119, 72, 0.08)";

  return (
    <div
      style={{
        position: "absolute",
        right: 34,
        bottom: 26,
        width: 170,
        height: 82,
        border: `2px solid ${color}`,
        background: bg,
        transform: `rotate(-7deg) scale(${interpolate(progress, [0, 1], [0.86, 1])})`,
        opacity: interpolate(progress, [0, 1], [0, 1]),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 12px 30px ${tone === "green" ? "rgba(79, 116, 93, 0.12)" : "rgba(167, 119, 72, 0.12)"}`,
      }}
    >
      <svg width="150" height="62" viewBox="0 0 150 62" style={{position: "absolute"}}>
        <rect
          x="5"
          y="5"
          width="140"
          height="52"
          rx="4"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="8 7"
          strokeDashoffset={interpolate(progress, [0, 1], [160, 0])}
        />
      </svg>
      <div style={{fontFamily: MONO_STACK, fontSize: 12, color, fontWeight: 800}}>{title}</div>
      <div style={{fontFamily: SERIF_STACK, fontSize: 25, color, fontWeight: 700, marginTop: 4}}>
        {label}
      </div>
    </div>
  );
};

const FocusBeam: React.FC<{
  progress: number;
  tone: "green" | "amber" | "blue";
}> = ({progress, tone}) => {
  const color =
    tone === "green"
      ? "rgba(79, 116, 93, 0.24)"
      : tone === "amber"
        ? "rgba(167, 119, 72, 0.24)"
        : "rgba(49, 95, 109, 0.22)";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        opacity: interpolate(progress, [0, 0.12, 0.88, 1], [0, 1, 1, 0], clamp),
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -130,
          bottom: -130,
          left: interpolate(progress, [0, 1], [-180, 650]),
          width: 150,
          transform: "rotate(9deg)",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          filter: "blur(2px)",
        }}
      />
    </div>
  );
};

const DefineCard: React.FC<{
  x: number;
  y: number;
  tone: "green" | "amber";
  eyebrow: string;
  title: string;
  mainValue: string;
  unitLabel: string;
  firstRow: string;
  secondRow: string;
  footer: string;
  stamped: boolean;
  stampProgress: number;
  stampTitle: string;
  stampLabel: string;
  opacity?: number;
  scale?: number;
  rotate?: number;
  revealProgress?: number;
  beamProgress?: number;
}> = ({
  x,
  y,
  tone,
  eyebrow,
  title,
  mainValue,
  unitLabel,
  firstRow,
  secondRow,
  footer,
  stamped,
  stampProgress,
  stampTitle,
  stampLabel,
  opacity = 1,
  scale = 1,
  rotate = 0,
  revealProgress = 1,
  beamProgress = 0,
}) => {
  const color = tone === "green" ? "#4f745d" : "#a77748";
  const muted = tone === "green" ? "rgba(79, 116, 93, 0.34)" : "rgba(167, 119, 72, 0.34)";

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 620,
        height: 388,
        background: "rgba(255, 252, 244, 0.86)",
        border: `1px solid ${stamped ? muted : "rgba(47, 55, 49, 0.16)"}`,
        boxShadow: stamped
          ? `0 30px 80px ${tone === "green" ? "rgba(79, 116, 93, 0.14)" : "rgba(167, 119, 72, 0.14)"}`
          : "0 26px 70px rgba(55, 48, 38, 0.10)",
        overflow: "hidden",
        opacity,
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        transformOrigin: "center center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.09,
          backgroundImage: "radial-gradient(#29342f 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div style={{position: "absolute", left: 38, top: 34, fontFamily: MONO_STACK, fontSize: 14, color: "#7a766c"}}>
        {eyebrow}
      </div>
      <div
        style={{
          position: "absolute",
          right: 38,
          top: 34,
          fontFamily: MONO_STACK,
          fontSize: 13,
          color: stamped ? color : "#8a8b80",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{width: 7, height: 7, borderRadius: 999, background: stamped ? color : "#9ba098"}} />
        {stamped ? "标签已附加" : "等待标签"}
      </div>

      <div style={{position: "absolute", left: 40, top: 120, width: 230}}>
        <div
          style={{
            fontFamily: MONO_STACK,
            fontSize: 12,
            color: "#8a8b80",
            marginBottom: 8,
            opacity: interpolate(revealProgress, [0, 0.18], [0, 1], clamp),
            transform: `translateY(${interpolate(revealProgress, [0, 0.18], [12, 0], clamp)}px)`,
          }}
        >
          底层数字
        </div>
        <div
          style={{
            fontFamily: MONO_STACK,
            fontSize: 72,
            lineHeight: 1,
            color: "#26332e",
            fontWeight: 800,
            opacity: interpolate(revealProgress, [0.08, 0.32], [0, 1], clamp),
            transform: `translateY(${interpolate(revealProgress, [0.08, 0.32], [18, 0], clamp)}px)`,
          }}
        >
          {mainValue}
          <span style={{fontFamily: SERIF_STACK, color, fontSize: 50, marginLeft: 14}}>{unitLabel}</span>
        </div>
        <div
          style={{
            fontSize: 18,
            color: "#6f7368",
            marginTop: 18,
            opacity: interpolate(revealProgress, [0.22, 0.46], [0, 1], clamp),
            transform: `translateY(${interpolate(revealProgress, [0.22, 0.46], [14, 0], clamp)}px)`,
          }}
        >
          数字本身不动
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 310,
          top: 116,
          width: 260,
          borderLeft: "1px solid rgba(47, 55, 49, 0.14)",
          paddingLeft: 32,
          fontFamily: MONO_STACK,
          fontSize: 15,
          color: "#6f7368",
          lineHeight: 1.9,
          opacity: interpolate(revealProgress, [0.38, 0.7], [0, 1], clamp),
          transform: `translateX(${interpolate(revealProgress, [0.38, 0.7], [24, 0], clamp)}px)`,
        }}
      >
        <div style={{fontSize: 12, color: "#8a8b80", marginBottom: 8}}>解释这串数字</div>
        <div style={{display: "flex", justifyContent: "space-between"}}>
          <span>X:</span>
          <b style={{color: stamped ? color : "#26332e"}}>{firstRow}</b>
        </div>
        <div style={{display: "flex", justifyContent: "space-between"}}>
          <span>Y:</span>
          <b style={{color: stamped ? color : "#26332e"}}>{secondRow}</b>
        </div>
        <div style={{fontSize: 12, color: "#8a8b80", marginTop: 8}}>{footer}</div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 38,
          bottom: 34,
          width: 310,
          borderTop: "1px solid rgba(47, 55, 49, 0.12)",
          paddingTop: 18,
          fontSize: 26,
          color: "#29342f",
          fontWeight: 700,
          opacity: interpolate(revealProgress, [0.66, 0.92], [0, 1], clamp),
          transform: `translateY(${interpolate(revealProgress, [0.66, 0.92], [16, 0], clamp)}px)`,
        }}
      >
        {title}
      </div>

      {stamped && <DrawnStamp progress={stampProgress} tone={tone} title={stampTitle} label={stampLabel} />}
      <FocusBeam progress={beamProgress} tone={tone} />
    </div>
  );
};

const ProjectCard: React.FC<{
  x: number;
  y: number;
  tone: "source" | "target";
  title: string;
  status: string;
  value: string;
  valueUnit: string;
  xValue: string;
  yValue: string;
  footer: string;
  opacity?: number;
  scale?: number;
  revealProgress?: number;
}> = ({
  x,
  y,
  tone,
  title,
  status,
  value,
  valueUnit,
  xValue,
  yValue,
  footer,
  opacity = 1,
  scale = 1,
  revealProgress = 1,
}) => {
  const color = tone === "source" ? "#4f745d" : "#315f6d";
  const borderMuted = tone === "source" ? "rgba(79, 116, 93, 0.22)" : "rgba(49, 95, 109, 0.22)";
  const bgHeader = tone === "source" ? "rgba(79, 116, 93, 0.08)" : "rgba(49, 95, 109, 0.08)";

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 440,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      <div
        style={{
          height: 44,
          border: `1.5px solid ${borderMuted}`,
          background: bgHeader,
          color,
          fontFamily: MONO_STACK,
          fontSize: 16,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      <div
        style={{
          height: 300,
          background: "rgba(255, 252, 244, 0.88)",
          border: `1.5px solid ${borderMuted}`,
          boxShadow: "0 26px 70px rgba(55, 48, 38, 0.12)",
          padding: "24px 28px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: MONO_STACK,
            fontSize: 16,
            opacity: interpolate(revealProgress, [0, 0.24], [0, 1], clamp),
            transform: `translateY(${interpolate(revealProgress, [0, 0.24], [10, 0], clamp)}px)`,
          }}
        >
          <span style={{color: "#8a8b80"}}>{tone === "source" ? "输入文件.shp" : "输出文件_new.shp"}</span>
          <span style={{color, fontWeight: 800}}>{status}</span>
        </div>
        <div
          style={{
            fontFamily: MONO_STACK,
            fontSize: 56,
            color: "#26332e",
            fontWeight: 800,
            marginTop: 24,
            opacity: interpolate(revealProgress, [0.16, 0.42], [0, 1], clamp),
            transform: `translateY(${interpolate(revealProgress, [0.16, 0.42], [18, 0], clamp)}px)`,
          }}
        >
          {value}
          <span style={{fontFamily: SERIF_STACK, color, fontSize: 44, marginLeft: 14}}>{valueUnit}</span>
        </div>
        <div
          style={{
            borderTop: "1px solid rgba(47, 55, 49, 0.12)",
            marginTop: 20,
            paddingTop: 14,
            fontFamily: MONO_STACK,
            lineHeight: 1.8,
            opacity: interpolate(revealProgress, [0.4, 0.72], [0, 1], clamp),
            transform: `translateY(${interpolate(revealProgress, [0.4, 0.72], [16, 0], clamp)}px)`,
          }}
        >
          <div style={{display: "flex", justifyContent: "space-between", height: 32, alignItems: "center"}}>
            <span style={{fontSize: 18, color: "#6f7368"}}>X 坐标:</span>
            <b style={{fontSize: 20, color: "#26332e"}}>{xValue}</b>
          </div>
          <div style={{display: "flex", justifyContent: "space-between", height: 32, alignItems: "center"}}>
            <span style={{fontSize: 18, color: "#6f7368"}}>Y 坐标:</span>
            <b style={{fontSize: 20, color: "#26332e"}}>{yValue}</b>
          </div>
        </div>
        <div
          style={{
            fontFamily: MONO_STACK,
            fontSize: 15,
            color: "#8a8b80",
            marginTop: 18,
            opacity: interpolate(revealProgress, [0.7, 1], [0, 1], clamp),
          }}
        >
          {footer}
        </div>
      </div>
    </div>
  );
};

const MathEngine: React.FC<{frame: number; mode: "money" | "projection"}> = ({frame, mode}) => {
  const spin = frame * 0.5;
  const pulse = interpolate(Math.sin(frame / 18), [-1, 1], [0.16, 0.28]);

  return (
    <div style={{position: "absolute", left: 0, top: 0, width: 280, height: 220, textAlign: "center"}}>
      <svg width="280" height="220" viewBox="0 0 280 220" style={{overflow: "visible"}}>
        {/* Outermost glowing thin circle with nodes */}
        <circle
          cx="140"
          cy="110"
          r="92"
          fill="none"
          stroke="rgba(167, 119, 72, 0.15)"
          strokeWidth="1.5"
        />
        <circle cx="140" cy="18" r="4" fill="#a77748" />
        <circle cx="140" cy="202" r="4" fill="#a77748" />
        <circle cx="48" cy="110" r="4" fill="#a77748" />
        <circle cx="232" cy="110" r="4" fill="#a77748" />

        {/* Rotating gear/dashed ring */}
        <circle
          cx="140"
          cy="110"
          r="74"
          fill={`rgba(167, 119, 72, ${pulse})`}
          stroke="#a77748"
          strokeWidth="2"
          strokeDasharray="12 12"
          transform={`rotate(${spin} 140 110)`}
        />

        {/* Inner coordinate axes rotating in opposite direction */}
        <g transform={`rotate(${-spin * 0.5} 140 110)`} opacity="0.6">
          <line x1="100" y1="110" x2="180" y2="110" stroke="#a77748" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="140" y1="70" x2="140" y2="150" stroke="#a77748" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="140" cy="110" r="42" fill="none" stroke="#a77748" strokeWidth="1" strokeDasharray="3 3" />
        </g>

        {/* Core pulsing circle */}
        <circle
          cx="140"
          cy="110"
          r={32 + 3 * Math.sin(frame / 10)}
          fill="rgba(255, 252, 244, 0.95)"
          stroke="rgba(167,119,72,0.6)"
          strokeWidth="2"
        />

        {/* Dynamic mathematical floating symbols */}
        <g style={{ fontFamily: MONO_STACK, fontSize: 13, fontWeight: "bold", fill: "rgba(167, 119, 72, 0.65)" }}>
          <text
            x={140 + 72 * Math.cos(frame * 0.015 + 0.4)}
            y={110 + 72 * Math.sin(frame * 0.015 + 0.4)}
            textAnchor="middle"
          >
            f(x)
          </text>
          <text
            x={140 + 64 * Math.cos(frame * 0.012 + 2.5)}
            y={110 + 64 * Math.sin(frame * 0.012 + 2.5)}
            textAnchor="middle"
          >
            ∑
          </text>
          <text
            x={140 + 76 * Math.cos(-frame * 0.01 + 4.8)}
            y={110 + 76 * Math.sin(-frame * 0.01 + 4.8)}
            textAnchor="middle"
          >
            dx
          </text>
        </g>
      </svg>
      <div style={{fontFamily: MONO_STACK, color: "#a77748", fontSize: 15, fontWeight: 800, marginTop: 12}}>
        {mode === "money" ? "汇率换算公式" : "投影转换公式"}
      </div>
      <div style={{fontSize: 24, color: "#29342f", fontWeight: 700, marginTop: 8}}>
        {mode === "money" ? "$100 -> ¥679" : "经纬度 -> 平面米"}
      </div>
    </div>
  );
};

const Packet: React.FC<{
  progress: number;
  opacity: number;
  label: string;
  color: string;
}> = ({progress, opacity, label, color}) => {
  const startX = 620;
  const endX = 1300;
  const currentX = interpolate(progress, [0, 1], [startX, endX]);
  const currentY = 550;

  const tail1X = interpolate(Math.max(0, progress - 0.04), [0, 1], [startX, endX]);
  const tail2X = interpolate(Math.max(0, progress - 0.08), [0, 1], [startX, endX]);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: tail2X,
          top: currentY,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: color,
          opacity: opacity * 0.28,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 38,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: tail1X,
          top: currentY,
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: color,
          opacity: opacity * 0.52,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 39,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: currentX,
          top: currentY,
          width: 140,
          height: 52,
          transform: `translate(-50%, -50%) rotate(${interpolate(progress, [0, 1], [-6, 6])}deg)`,
          opacity,
          background: color,
          border: "2px solid rgba(255,255,255,0.75)",
          borderRadius: 999,
          color: "#fffdf6",
          fontFamily: MONO_STACK,
          fontSize: 16,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 12px 30px ${color}40`,
          zIndex: 40,
        }}
      >
        {label}
      </div>
    </>
  );
};

export const GISComparison: React.FC = () => {
  const {fps: videoFps} = useVideoConfig();
  const rawFrame = useCurrentFrame();
  const frame = rawFrame * (30 / videoFps);
  const fps = 30;

  const phase1Opacity = fade(frame, 0, 1513);
  const phase2Opacity = fade(frame, 1513, 3376);

  const title1 = spring({frame: frame - 20, fps, config: {damping: 18, stiffness: 80}});
  const title2 = spring({frame: frame - 1530, fps, config: {damping: 18, stiffness: 80}});

  const gisStamp = spring({frame: frame - 690, fps, config: {damping: 11, stiffness: 120}});
  const moneyStamp = spring({frame: frame - 1162, fps, config: {damping: 11, stiffness: 120}});
  const isGisStamped = frame >= 696;
  const isMoneyStamped = frame >= 1168;

  const gisAppear = spring({frame: frame - 120, fps, config: {damping: 18, stiffness: 82}});
  const gisMoveLeft = softStep(frame, 780, 930);
  const moneyAppear = spring({frame: frame - 930, fps, config: {damping: 18, stiffness: 82}});
  const moneyMoveRight = softStep(frame, 1240, 1380);
  const gisReveal = softStep(frame, 155, 430);
  const moneyReveal = softStep(frame, 950, 1190);
  const gisBeam = softStep(frame, 430, 560);
  const moneyBeam = softStep(frame, 1040, 1160);
  const bridgeProgress = softStep(frame, 840, 1030);
  const summaryPulse = interpolate(Math.sin(frame / 22), [-1, 1], [0.94, 1.02]);
  const gisCardX = interpolate(gisMoveLeft, [0, 1], [650, 260]);
  const gisCardScale = interpolate(gisAppear, [0, 1], [0.92, interpolate(gisMoveLeft, [0, 1], [1.12, 1])]);
  const gisDimDuringAnalogy = interpolate(frame, [900, 980, 1230, 1360], [1, 0.28, 0.28, 1], clamp);
  const gisCardOpacity = interpolate(gisAppear, [0, 1], [0, 1]) * gisDimDuringAnalogy;
  const moneyCardX = interpolate(moneyMoveRight, [0, 1], [650, 1040]);
  const moneyCardScale = interpolate(moneyAppear, [0, 1], [0.92, interpolate(moneyMoveRight, [0, 1], [1.12, 1])]);
  const moneyCardOpacity = interpolate(moneyAppear, [0, 1], [0, 1]);

  const warningOpacity = interpolate(frame, [1300, 1320, 1490, 1510], [0, 1, 1, 0], clamp);

  const cardEntry = spring({frame: frame - 1528, fps, config: {damping: 18, stiffness: 82}});
  const sourceCardIn = spring({frame: frame - 1600, fps, config: {damping: 18, stiffness: 82}});
  const engineIn = spring({frame: frame - 1810, fps, config: {damping: 16, stiffness: 90}});
  const targetCardIn = spring({frame: frame - 2070, fps, config: {damping: 18, stiffness: 82}});
  const sourceReveal = softStep(frame, 1620, 1810);
  const targetReveal = softStep(frame, 2090, 2290);
  const engineMode = frame < 2400 ? "money" : "projection";

  const packetMoneyProgress = interpolate(frame, [1995, 2232], [0, 1], clamp);
  const packetMoneyOpacity = interpolate(frame, [1988, 1998, 2228, 2242], [0, 1, 1, 0], clamp);
  const packetCoordProgress = interpolate(frame, [2610, 2840], [0, 1], clamp);
  const packetCoordOpacity = interpolate(frame, [2602, 2612, 2838, 2852], [0, 1, 1, 0], clamp);

  const cnySpring = spring({frame: frame - 2232, fps, config: {damping: 16, stiffness: 75}});
  const coordSpring = spring({frame: frame - 2840, fps, config: {damping: 16, stiffness: 75}});
  const swapSpring = spring({frame: frame - 2960, fps, config: {damping: 16, stiffness: 75}});

  const displayCNY = Math.round(interpolate(cnySpring, [0, 1], [100, 679]));
  const mercatorX = Math.round(interpolate(coordSpring, [0, 1], [121, 13469903]));
  const mercatorY = Math.round(interpolate(coordSpring, [0, 1], [31, 3632633]));
  const finalX = Math.round(interpolate(swapSpring, [0, 1], [mercatorX, 40489254]));
  const finalY = Math.round(interpolate(swapSpring, [0, 1], [mercatorY, 3431291]));
  const targetName = frame < 2960 ? "目标坐标系：Web Mercator" : "目标坐标系：高斯克吕格 3 度带";

  const underline1 = softStep(frame, 80, 170);
  const underline2 = softStep(frame, 1620, 1705);

  return (
    <AbsoluteFill style={{fontFamily: SERIF_STACK, color: "#29342f", overflow: "hidden"}}>
      <PaperBackground tone={frame > 1513 ? "warm" : "light"} />
      <TopCode text="DEFINE PROJECTION / PROJECT" active />

      {frame >= 0 && frame < 1513 && (
        <AbsoluteFill style={{opacity: phase1Opacity}}>
          <div
            style={{
              opacity: interpolate(title1, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(title1, [0, 1], [36, 0])}px)`,
            }}
          >
            <SectionTitle
              eyebrow="PART 01 / DEFINE PROJECTION"
              title={
                <>
                  定义投影 = <span style={{color: "#4f745d"}}>贴标签</span>
                </>
              }
              subtitle="声明这串数字原本代表什么；底层数字不重新计算"
              color="#4f745d"
            />
            <div
              style={{
                position: "absolute",
                top: 282,
                left: "50%",
                transform: "translateX(-50%)",
                width: interpolate(underline1, [0, 1], [0, 700]),
                height: 4,
                background: "linear-gradient(90deg, transparent, #a77748, #4f745d, transparent)",
              }}
            />
          </div>

          <DefineCard
            x={gisCardX}
            y={382}
            tone="green"
            eyebrow="GIS 数据 / Define Projection"
            title="给 shp 补上坐标系说明"
            mainValue="121"
            unitLabel=""
            firstRow={isGisStamped ? "121.000°" : "121.000"}
            secondRow={isGisStamped ? "31.000°" : "31.000"}
            footer={isGisStamped ? "解释方式：WGS 84 地理经纬度" : "解释方式：未知"}
            stamped={isGisStamped}
            stampProgress={gisStamp}
            stampTitle="CRS LABEL"
            stampLabel="WGS 84"
            opacity={gisCardOpacity}
            scale={gisCardScale}
            revealProgress={gisReveal}
            beamProgress={gisBeam}
          />

          {frame >= 820 && frame < 1120 && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 588,
                width: 300,
                transform: "translate(-50%, -50%)",
                opacity: interpolate(bridgeProgress, [0, 0.15, 1], [0, 1, 1], clamp),
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <svg width="300" height="86" viewBox="0 0 300 86">
                <path
                  d="M20 43 C 84 12, 212 12, 280 43"
                  fill="none"
                  stroke="#a77748"
                  strokeWidth="2"
                  strokeDasharray="6 8"
                  strokeDashoffset={interpolate(bridgeProgress, [0, 1], [240, 0])}
                />
                <path
                  d="M266 35 L282 43 L266 51"
                  fill="none"
                  stroke="#a77748"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={interpolate(bridgeProgress, [0.65, 1], [0, 1], clamp)}
                />
              </svg>
              <div
                style={{
                  fontFamily: MONO_STACK,
                  fontSize: 13,
                  color: "#a77748",
                  fontWeight: 800,
                  transform: `translateY(${interpolate(bridgeProgress, [0, 1], [12, 0])}px)`,
                }}
              >
                换个生活例子再看一遍
              </div>
            </div>
          )}

          <DefineCard
            x={moneyCardX}
            y={382}
            tone="amber"
            eyebrow="生活类比 / Label"
            title="给纸上的 100 补上单位"
            mainValue="100"
            unitLabel={isMoneyStamped ? "$" : ""}
            firstRow="100"
            secondRow="--"
            footer={isMoneyStamped ? "解释方式：声明为美元" : "解释方式：普通数字"}
            stamped={isMoneyStamped}
            stampProgress={moneyStamp}
            stampTitle="UNIT LABEL"
            stampLabel="美元"
            opacity={moneyCardOpacity}
            scale={moneyCardScale}
            revealProgress={moneyReveal}
            beamProgress={moneyBeam}
          />

          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 82,
              width: 980,
              opacity: warningOpacity,
              background: "rgba(255, 247, 242, 0.90)",
              border: "1px solid rgba(143, 78, 62, 0.28)",
              boxShadow: "0 24px 70px rgba(84, 59, 46, 0.12)",
              padding: "24px 34px",
              textAlign: "center",
              transform: `translateX(-50%) scale(${summaryPulse})`,
            }}
          >
            <div style={{fontSize: 30, fontWeight: 700, color: "#8f4e3e"}}>
              注意：定义投影没有改数据，只是补说明。
            </div>
            <div style={{fontFamily: MONO_STACK, fontSize: 14, color: "#6f7368", marginTop: 10}}>
              纸上仍然是 100；GIS 底层仍然是 121 和 31。变化的是“如何解释它们”。
            </div>
          </div>
        </AbsoluteFill>
      )}

      {frame >= 1513 && frame < 3376 && (
        <AbsoluteFill style={{opacity: phase2Opacity}}>
          <div
            style={{
              opacity: interpolate(title2, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(title2, [0, 1], [36, 0])}px)`,
            }}
          >
            <SectionTitle
              eyebrow="PART 02 / PROJECT"
              title={
                <>
                  投影 = <span style={{color: "#315f6d"}}>重算数字</span>
                </>
              }
              subtitle="读取源坐标系，经过转换公式，写出一份全新的坐标文件"
              color="#315f6d"
            />
            <div
              style={{
                position: "absolute",
                top: 282,
                left: "50%",
                transform: "translateX(-50%)",
                width: interpolate(underline2, [0, 1], [0, 700]),
                height: 4,
                background: "linear-gradient(90deg, transparent, #a77748, #315f6d, transparent)",
              }}
            />
          </div>

          <div
            style={{
              opacity: interpolate(cardEntry, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(cardEntry, [0, 1], [52, 0])}px)`,
            }}
          >
            <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: "absolute", inset: 0, overflow: "visible"}}>
              <path
                d="M620 540 C 740 490, 840 490, 960 540 S 1180 590, 1300 540"
                fill="none"
                stroke="rgba(167,119,72,0.45)"
                strokeWidth="3"
                strokeDasharray="8 8"
                strokeDashoffset={-frame * 1.5}
              />
              <path
                d="M620 560 C 740 610, 840 610, 960 560 S 1180 510, 1300 560"
                fill="none"
                stroke="rgba(49,95,109,0.36)"
                strokeWidth="3"
                strokeDasharray="8 8"
                strokeDashoffset={frame * 1.5}
              />
            </svg>

            {/* Source Card Float Wrapper */}
            <Float
              speed={56}
              amplitude={8}
              rotateAmplitude={0.4}
              delay={10}
              style={{
                position: "absolute",
                left: interpolate(sourceCardIn, [0, 1], [430, 180]),
                top: 380,
                opacity: interpolate(sourceCardIn, [0, 1], [0, 1]),
              }}
            >
              <ProjectCard
                x={0}
                y={0}
                tone="source"
                title="源坐标系：WGS 84 地理坐标系"
                status="原始值"
                value="100"
                valueUnit="$"
                xValue="121.000°"
                yValue="31.000°"
                footer="经纬度单位：度 (Degree)"
                scale={interpolate(sourceCardIn, [0, 1], [1.08, 1])}
                revealProgress={sourceReveal}
              />
            </Float>

            {/* Math Engine Float Wrapper */}
            <Float
              speed={60}
              amplitude={6}
              rotateAmplitude={0.2}
              delay={20}
              style={{
                position: "absolute",
                left: 820,
                top: 440,
                opacity: interpolate(engineIn, [0, 1], [0, 1]),
              }}
            >
              <MathEngine frame={frame} mode={engineMode} />
            </Float>

            {/* Target Card Float Wrapper */}
            <Float
              speed={64}
              amplitude={8}
              rotateAmplitude={-0.4}
              delay={35}
              style={{
                position: "absolute",
                left: interpolate(targetCardIn, [0, 1], [1050, 1300]),
                top: 380,
                opacity: interpolate(targetCardIn, [0, 1], [0, 1]),
              }}
            >
              <ProjectCard
                x={0}
                y={0}
                tone="target"
                title={targetName}
                status="重新写入"
                value={String(displayCNY)}
                valueUnit="¥"
                xValue={finalX.toLocaleString()}
                yValue={finalY.toLocaleString()}
                footer={frame < 2960 ? "平面单位：米 (m)" : "平面单位：米 (m)，带号写入"}
                scale={interpolate(targetCardIn, [0, 1], [1.08, 1])}
                revealProgress={targetReveal}
              />
            </Float>

            {frame >= 1990 && frame <= 2242 && (
              <Packet progress={packetMoneyProgress} opacity={packetMoneyOpacity} label="$100" color="#4f745d" />
            )}
            {frame >= 2602 && frame <= 2852 && (
              <Packet progress={packetCoordProgress} opacity={packetCoordOpacity} label="[121, 31]" color="#315f6d" />
            )}
          </div>

          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 82,
              width: 1240,
              transform: "translateX(-50%)",
              background: "rgba(255, 252, 244, 0.90)",
              border: "1.5px solid rgba(47, 55, 49, 0.18)",
              boxShadow: "0 24px 70px rgba(55, 48, 38, 0.14)",
              padding: "24px 34px",
              textAlign: "center",
              fontSize: 32,
              lineHeight: 1.55,
              color: "#29342f",
              fontWeight: 700,
            }}
          >
            {frame < 2400 ? (
              <>
                就像把 100 美元换成人民币：经过汇率公式之后，
                <span style={{color: "#315f6d"}}> 到手数字从 100 变成 679。</span>
              </>
            ) : (
              <>
                投影转换也是这样：
                <span style={{color: "#315f6d"}}> 坐标数字会被全部重新计算并写入新文件。</span>
                不同投影算法，输出的平面米制数值也不同。
              </>
            )}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
