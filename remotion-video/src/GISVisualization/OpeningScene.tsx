import React, {useEffect, useMemo, useState} from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {Lottie, LottieAnimationData} from "@remotion/lottie";

export const LottiePlayer: React.FC<{
  src: string;
  style?: React.CSSProperties;
}> = ({src, style}) => {
  const [handle] = useState(() => delayRender(`Load Lottie: ${src}`));
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);

  useEffect(() => {
    let active = true;

    fetch(staticFile(src))
      .then((res) => res.json())
      .then((json) => {
        if (active) {
          setAnimationData(json);
        }
      })
      .catch((err) => {
        console.error("Lottie load failed", err);
      })
      .finally(() => continueRender(handle));

    return () => {
      active = false;
    };
  }, [handle, src]);

  if (!animationData) {
    return null;
  }

  return <Lottie animationData={animationData} style={style} />;
};

const SERIF_STACK =
  "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif SC', SimSun, serif";
const MONO_STACK = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const ease = Easing.bezier(0.22, 1, 0.36, 1);

const fade = (frame: number, start: number, end: number, fadeIn = 14, fadeOut = 16) =>
  interpolate(frame, [start, start + fadeIn, end - fadeOut, end], [0, 1, 1, 0], clamp);

const softStep = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {...clamp, easing: ease});

const PaperBackground: React.FC<{tone?: "light" | "warm"}> = ({tone = "light"}) => {
  const {fps: videoFps} = useVideoConfig();
  const frame = useCurrentFrame() * (30 / videoFps);
  const drift = interpolate(Math.sin(frame / 90), [-1, 1], [-10, 10]);

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

const BigQuestionMark: React.FC<{x: number; y: number; size: number; delay: number}> = ({
  x,
  y,
  size,
  delay,
}) => {
  const {fps: videoFps} = useVideoConfig();
  const frame = useCurrentFrame() * (30 / videoFps);
  const appear = spring({
    frame: frame - delay,
    fps: 30,
    config: {damping: 16, stiffness: 90},
  });
  const rotate = interpolate(Math.sin((frame - delay) / 30), [-1, 1], [-8, 7]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: SERIF_STACK,
        fontSize: size,
        lineHeight: 1,
        color: "rgba(56, 75, 69, 0.14)",
        transform: `translate(-50%, -50%) scale(${interpolate(appear, [0, 1], [0.8, 1])}) rotate(${rotate}deg)`,
        opacity: interpolate(appear, [0, 1], [0, 1]),
      }}
    >
      ?
    </div>
  );
};

const ToolCard: React.FC<{
  label: string;
  detail: string;
  tone: "right" | "wrong";
  style?: React.CSSProperties;
}> = ({label, detail, tone, style}) => (
  <div
    style={{
      width: 360,
      minHeight: 178,
      borderRadius: 8,
      padding: "28px 30px",
      background: tone === "right" ? "rgba(247, 251, 244, 0.9)" : "rgba(255, 248, 244, 0.9)",
      border: `1px solid ${tone === "right" ? "rgba(73, 119, 92, 0.36)" : "rgba(157, 89, 63, 0.34)"}`,
      boxShadow: "0 18px 50px rgba(47, 42, 35, 0.12)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      ...style,
    }}
  >
    <div style={{fontFamily: MONO_STACK, fontSize: 13, color: "rgba(43, 52, 47, 0.52)"}}>ArcGIS Tool</div>
    <div>
      <div
        style={{
          fontFamily: SERIF_STACK,
          fontSize: 43,
          lineHeight: 1.05,
          color: tone === "right" ? "#365e4d" : "#8f4e3e",
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div style={{fontFamily: MONO_STACK, fontSize: 14, color: "#6c6c62", marginTop: 12}}>{detail}</div>
    </div>
  </div>
);

const CheckMark: React.FC<{progress: number}> = ({progress}) => (
  <svg width="112" height="112" viewBox="0 0 112 112" style={{overflow: "visible"}}>
    <circle
      cx="56"
      cy="56"
      r="48"
      fill="rgba(83, 122, 91, 0.12)"
      stroke="rgba(83, 122, 91, 0.35)"
      strokeWidth="2"
    />
    <path
      d="M32 57 L49 74 L82 36"
      fill="none"
      stroke="#527a5e"
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="92"
      strokeDashoffset={92 - progress * 92}
    />
  </svg>
);

export const OpeningScene: React.FC = () => {
  const {fps: videoFps} = useVideoConfig();
  const frame = useCurrentFrame() * (30 / videoFps);
  const fps = 30;

  const sec1 = fade(frame, 0, 120);
  const sec2 = fade(frame, 114, 420);
  const sec3 = fade(frame, 414, 630);
  const sec4 = fade(frame, 624, 780);
  const sec5 = fade(frame, 774, 1020);
  const sec6 = fade(frame, 1014, 1500, 16, 24);

  const titleSpring = spring({frame: frame - 12, fps, config: {damping: 18, stiffness: 80}});
  const titleY = interpolate(titleSpring, [0, 1], [44, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);
  const earthScale = interpolate(
    spring({frame: frame - 8, fps, config: {damping: 18, stiffness: 72}}),
    [0, 1],
    [0.78, 1]
  );
  const ringRotation = frame * 0.25;

  const workspaceProgress = spring({frame: frame - 126, fps, config: {damping: 22, stiffness: 82}});
  const workspaceY = interpolate(workspaceProgress, [0, 1], [72, 0]);
  const fileMove = softStep(frame, 150, 190);
  const fileX = interpolate(fileMove, [0, 1], [170, 740]);
  const fileY = interpolate(fileMove, [0, 1], [315, 485]);
  const fileTilt = interpolate(fileMove, [0, 1], [-7, 0]);
  const fileOpacity = interpolate(frame, [135, 145, 195, 215], [0, 1, 1, 0], clamp);
  const alertOpacity = interpolate(frame, [195, 205, 245, 255], [0, 1, 1, 0], clamp);
  const alertScale = interpolate(frame, [195, 205], [0.86, 1], clamp);
  const thinkingOpacity = interpolate(frame, [250, 260, 410, 420], [0, 1, 1, 0], clamp);
  const decisionProgress = spring({frame: frame - 235, fps, config: {damping: 17, stiffness: 90}});
  const cursorPath = interpolate(
    frame,
    [250, 275, 305, 335, 360],
    [-205, -205, 208, 208, -205],
    {
      ...clamp,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }
  );

  const clickProgress = spring({frame: frame - 440, fps, config: {damping: 9, stiffness: 180}});
  const checkProgress = softStep(frame, 465, 495);
  const unlockY = interpolate(
    spring({frame: frame - 450, fps, config: {damping: 18, stiffness: 85}}),
    [0, 1],
    [70, 0]
  );

  const s4Progress = spring({frame: frame - 635, fps, config: {damping: 18, stiffness: 80}});
  const errorProgress = softStep(frame, 655, 680);
  const questionProgress = softStep(frame, 715, 740);
  const s5Progress = spring({frame: frame - 785, fps, config: {damping: 20, stiffness: 80}});

  const s6Progress = spring({frame: frame - 1030, fps, config: {damping: 20, stiffness: 80}});
  const gisLift = spring({frame: frame - 1092, fps, config: {damping: 14, stiffness: 95}});
  const finalUnderline = softStep(frame, 1160, 1220);

  const typedTitle = useMemo(() => {
    const text = "DEFINE PROJECTION  !=  PROJECT";
    const count = Math.floor(interpolate(frame, [1050, 1110], [0, text.length], clamp));
    return text.slice(0, count);
  }, [frame]);

  return (
    <AbsoluteFill style={{fontFamily: SERIF_STACK, color: "#29342f", overflow: "hidden"}}>
      <PaperBackground tone={frame > 774 ? "warm" : "light"} />

      {frame >= 0 && frame < 122 && (
        <AbsoluteFill style={{opacity: sec1}}>
          <BigQuestionMark x={224} y={214} size={200} delay={16} />
          <BigQuestionMark x={1620} y={770} size={310} delay={28} />
          <BigQuestionMark x={1510} y={238} size={130} delay={40} />

          <div style={{position: "absolute", left: 260, top: 220, width: 560, height: 560}}>
            <div
              style={{
                position: "absolute",
                inset: 20,
                border: "1px solid rgba(54, 94, 77, 0.22)",
                borderRadius: "50%",
                transform: `rotate(${ringRotation}deg)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 75,
                border: "1px dashed rgba(49, 95, 109, 0.24)",
                borderRadius: "50%",
                transform: `rotate(${-ringRotation * 1.6}deg)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 120,
                top: 108,
                width: 330,
                height: 330,
                transform: `scale(${earthScale})`,
                filter: "drop-shadow(0 26px 42px rgba(48, 83, 74, 0.2))",
              }}
            >
              <LottiePlayer src="earth.json" />
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 840,
              top: 292,
              width: 820,
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
            }}
          >
            <div style={{fontFamily: MONO_STACK, fontSize: 18, color: "#6f7d72", marginBottom: 26}}>
              不是会点工具按钮，而是真的知道数字在哪里。
            </div>
            <div style={{fontSize: 108, lineHeight: 1.04, fontWeight: 700, letterSpacing: 0}}>
              你真的懂
              <br />
              <span style={{color: "#2f5d68"}}>坐标系吗？</span>
            </div>
            <div
              style={{
                width: interpolate(titleSpring, [0, 1], [0, 560]),
                height: 5,
                background: "linear-gradient(90deg, #a77748, #597b63, transparent)",
                marginTop: 32,
              }}
            />
          </div>
        </AbsoluteFill>
      )}

      {frame >= 114 && frame < 422 && (
        <AbsoluteFill style={{opacity: sec2}}>
          <div
            style={{
              position: "absolute",
              left: 130,
              top: 118,
              fontSize: 58,
              lineHeight: 1.14,
              fontWeight: 700,
              color: "#26332e",
            }}
          >
            打开 ArcGIS，拖入一个
            <span style={{color: "#9b5a42"}}>没有坐标系</span>
            的数据。
          </div>
          <div
            style={{
              position: "absolute",
              left: 132,
              top: 257,
              fontFamily: MONO_STACK,
              fontSize: 17,
              color: "#6f7368",
            }}
          >
            这时你是在“补身份证”，还是在“重算坐标”？
          </div>

          <div
            style={{
              position: "absolute",
              left: 220,
              top: 330,
              width: 1480,
              height: 590,
              background: "rgba(255, 253, 247, 0.82)",
              border: "1px solid rgba(47, 55, 49, 0.18)",
              boxShadow: "0 30px 90px rgba(55, 48, 38, 0.14)",
              transform: `translateY(${workspaceY}px)`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 330,
                height: "100%",
                background: "rgba(235, 229, 214, 0.62)",
                borderRight: "1px solid rgba(47, 55, 49, 0.14)",
                padding: "34px 28px",
                boxSizing: "border-box",
              }}
            >
              <div style={{fontFamily: MONO_STACK, fontSize: 15, color: "#6d7168", marginBottom: 30}}>CATALOG</div>
              {["地图项目.aprx", "边界数据.gdb", "研究区.shp"].map((item, i) => (
                <div
                  key={item}
                  style={{
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid rgba(47, 55, 49, 0.08)",
                    fontFamily: MONO_STACK,
                    fontSize: 14,
                    color: i === 2 ? "#7c5540" : "#74786f",
                    opacity: i === 2 ? 1 : 0.62,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            <div
              style={{
                position: "absolute",
                left: 390,
                top: 76,
                right: 72,
                bottom: 240,
                border: "1px solid rgba(46, 68, 58, 0.2)",
                background:
                  "linear-gradient(rgba(46, 68, 58, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(46, 68, 58, 0.06) 1px, transparent 1px)",
                backgroundSize: "54px 54px",
              }}
            >
              <div style={{position: "absolute", top: 22, left: 26, fontFamily: MONO_STACK, fontSize: 14, color: "#8a8b80"}}>
                MAP VIEW
              </div>
              {frame < 195 && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 360,
                    height: 150,
                    transform: "translate(-50%, -50%)",
                    border: "2px dashed rgba(73, 93, 83, 0.24)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: MONO_STACK,
                    color: "#9a988b",
                    fontSize: 14,
                  }}
                >
                  DROP DATA HERE
                </div>
              )}

              {frame >= 195 && frame < 255 && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 520,
                    padding: "28px 32px",
                    transform: `translate(-50%, -50%) scale(${alertScale})`,
                    opacity: alertOpacity,
                    background: "rgba(255, 247, 242, 0.96)",
                    border: "1px solid rgba(157, 89, 63, 0.38)",
                    boxShadow: "0 24px 70px rgba(128, 79, 55, 0.18)",
                  }}
                >
                  <div style={{fontFamily: MONO_STACK, color: "#9b5a42", fontSize: 15, marginBottom: 10}}>
                    SPATIAL REFERENCE MISSING
                  </div>
                  <div style={{fontSize: 33, fontWeight: 700, color: "#3c312d"}}>缺失空间参考</div>
                  <div style={{fontFamily: MONO_STACK, fontSize: 14, color: "#766d65", marginTop: 14}}>
                    软件只看见一串 X / Y 数字，但不知道这些数字属于哪个地球模型。
                  </div>
                </div>
              )}

              {frame >= 250 && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "48%",
                    width: 300,
                    height: 220,
                    transform: "translate(-50%, -50%)",
                    opacity: thinkingOpacity,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div style={{width: 140, height: 140}}>
                    <LottiePlayer src="Thinking.json" />
                  </div>
                  <div style={{fontFamily: SERIF_STACK, fontSize: 28, fontWeight: 700, color: "#7c5a3b", marginTop: 4, display: "flex", alignItems: "center", gap: 8}}>
                    <span>纠结中... </span>
                    <span
                      style={{
                        display: "inline-block",
                        transform: `translateY(${Math.sin(frame * 0.25) * 6}px)`,
                      }}
                    >
                      ❓
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: fileX,
              top: fileY,
              width: 290,
              height: 108,
              background: "rgba(255, 250, 241, 0.96)",
              border: "1px solid rgba(121, 96, 65, 0.28)",
              boxShadow: "0 22px 50px rgba(57, 44, 28, 0.18)",
              transform: `rotate(${fileTilt}deg)`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 24px",
              zIndex: 20,
              opacity: fileOpacity,
            }}
          >
            <div style={{fontFamily: MONO_STACK, fontSize: 13, color: "#8c6a4a", marginBottom: 8}}>shp / no .prj</div>
            <div style={{fontFamily: MONO_STACK, fontSize: 18, color: "#2f3832", fontWeight: 700}}>unknown_crs.shp</div>
          </div>

          {frame >= 235 && (
            <div
              style={{
                position: "absolute",
                left: 1119,
                top: 700,
                opacity: interpolate(decisionProgress, [0, 1], [0, 1]),
                transform: `translate(-50%, ${interpolate(decisionProgress, [0, 1], [42, 0])}px)`,
              }}
            >
              <div style={{display: "flex", gap: 46, justifyContent: "center"}}>
                <ToolCard label="定义投影" detail="给原始数字附加坐标系标签" tone="right" />
                <ToolCard label="投影" detail="根据已知坐标系重算数字" tone="wrong" />
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 360 + 23 + cursorPath,
                  top: 190 + Math.sin(frame * 0.25) * 8,
                  zIndex: 30,
                }}
              >
                <div
                  style={{
                    fontSize: 54,
                    transform: "translate(-50%, -50%)",
                    filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.25))",
                  }}
                >
                  👆
                </div>
              </div>
            </div>
          )}
        </AbsoluteFill>
      )}

      {frame >= 414 && frame < 632 && (
        <AbsoluteFill style={{opacity: sec3}}>
          <div
            style={{
              position: "absolute",
              left: 260,
              top: 238,
              width: 1400,
              height: 610,
              background: "rgba(255, 252, 244, 0.78)",
              border: "1px solid rgba(57, 68, 59, 0.15)",
              boxShadow: "0 34px 110px rgba(55, 48, 38, 0.13)",
              display: "grid",
              gridTemplateColumns: "530px 1fr",
            }}
          >
            <div style={{padding: "70px 72px", borderRight: "1px solid rgba(57, 68, 59, 0.12)"}}>
              <div style={{fontFamily: MONO_STACK, fontSize: 15, color: "#607164", marginBottom: 34}}>ANSWER</div>
              <div style={{fontSize: 68, lineHeight: 1.08, fontWeight: 700}}>
                如果你能回答
                <br />
                <span style={{color: "#4f745d"}}>定义投影</span>
              </div>
              <div style={{fontFamily: MONO_STACK, fontSize: 16, color: "#767268", marginTop: 30}}>
                恭喜，你已经拥有了基本的 GIS 直觉。
              </div>
            </div>

            <div style={{position: "relative", display: "flex", alignItems: "center", justifyContent: "center"}}>
              <div
                style={{
                  position: "absolute",
                  width: 340,
                  height: 340,
                  borderRadius: "50%",
                  background: `rgba(82, 122, 94, ${interpolate(clickProgress, [0, 1], [0.02, 0.12])})`,
                  transform: `scale(${interpolate(clickProgress, [0, 1], [0.6, 1.2])})`,
                }}
              />
              <div
                style={{
                  width: 540,
                  padding: "48px",
                  background: "#fffdf6",
                  border: "1px solid rgba(82, 122, 94, 0.26)",
                  boxShadow: "0 28px 76px rgba(57, 70, 50, 0.14)",
                  transform: `translateY(${unlockY}px)`,
                  textAlign: "center",
                }}
              >
                <CheckMark progress={checkProgress} />
                <div style={{fontFamily: MONO_STACK, fontSize: 14, color: "#5a765f", marginTop: 22}}>
                  GIS INTUITION UNLOCKED
                </div>
                <div style={{fontSize: 43, lineHeight: 1.22, fontWeight: 700, color: "#29342f", marginTop: 14}}>
                  你知道这里要做的是：
                  <br />
                  <span style={{color: "#4f745d"}}>声明，而不是改写。</span>
                </div>
                <div style={{fontFamily: MONO_STACK, color: "#7a766c", fontSize: 15, lineHeight: 1.75, marginTop: 24}}>
                  定义投影只是给数据补上“它原本属于哪个坐标系”的说明，
                  底层坐标数值不会被重新计算。
                </div>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {frame >= 624 && frame < 782 && (
        <AbsoluteFill style={{opacity: sec4}}>
          <div
            style={{
              position: "absolute",
              left: 150,
              top: 190,
              width: 710,
              transform: `translateY(${interpolate(s4Progress, [0, 1], [62, 0])}px)`,
            }}
          >
            <div style={{fontSize: 72, lineHeight: 1.12, fontWeight: 700}}>
              但如果我问你：
              <br />
              为什么这里
              <br />
              <span style={{color: "#8f4e3e"}}>不能用“投影”？</span>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              right: 150,
              top: 238,
              width: 760,
              height: 520,
              background: "rgba(255, 253, 249, 0.92)",
              border: "1px solid rgba(143, 78, 62, 0.22)",
              boxShadow: "0 34px 90px rgba(84, 59, 46, 0.14)",
              borderRadius: 8,
              overflow: "hidden",
              transform: `translateX(${interpolate(s4Progress, [0, 1], [76, 0])}px)`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Window Header */}
            <div
              style={{
                background: "rgba(143, 78, 62, 0.08)",
                borderBottom: "1px solid rgba(143, 78, 62, 0.15)",
                padding: "16px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{fontFamily: SERIF_STACK, fontSize: 20, fontWeight: 700, color: "#8f4e3e"}}>
                工具运行尝试：投影 (Project)
              </span>
              <span style={{color: "#8f4e3e", fontSize: 18}}>✕</span>
            </div>

            {/* Dialog Content */}
            <div style={{padding: "30px 36px", flex: 1, display: "flex", flexDirection: "column", gap: 18}}>
              {/* Input 1 */}
              <div>
                <div style={{fontFamily: MONO_STACK, fontSize: 13, color: "#7a766c", marginBottom: 6}}>输入数据集或要素类</div>
                <div 
                  style={{
                    border: "1px solid #d1d5db", 
                    borderRadius: 4, 
                    background: "rgba(255, 255, 255, 0.6)", 
                    padding: "12px 16px",
                    fontFamily: MONO_STACK,
                    fontSize: 15,
                    color: "#29342f",
                  }}
                >
                  unknown_crs.shp
                </div>
              </div>

              {/* Input 2 */}
              <div>
                <div style={{fontFamily: MONO_STACK, fontSize: 13, color: "#7a766c", marginBottom: 6}}>输入坐标系 (自动读取)</div>
                <div 
                  style={{
                    border: "1px dashed #ef4444", 
                    borderRadius: 4, 
                    background: "rgba(254, 242, 242, 0.8)", 
                    padding: "12px 16px",
                    fontFamily: MONO_STACK,
                    fontSize: 15,
                    color: "#ef4444",
                    fontWeight: 700,
                  }}
                >
                  ⚠️ 未知坐标系 (Unknown)
                </div>
              </div>

              {/* Input 3 */}
              <div>
                <div style={{fontFamily: MONO_STACK, fontSize: 13, color: "#7a766c", marginBottom: 6}}>输出坐标系 (目标)</div>
                <div 
                  style={{
                    border: "1px solid #d1d5db", 
                    borderRadius: 4, 
                    background: "rgba(255, 255, 255, 0.6)", 
                    padding: "12px 16px",
                    fontFamily: MONO_STACK,
                    fontSize: 15,
                    color: "#29342f",
                  }}
                >
                  CGCS2000 三度带中央经线 120E
                </div>
              </div>
            </div>

            {/* Error Overlay / Status Footer */}
            <div
              style={{
                background: "#fef2f2",
                borderTop: "1px solid #fee2e2",
                padding: "20px 36px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                transform: `translateY(${interpolate(errorProgress, [0, 1], [100, 0], clamp)}%)`,
                opacity: interpolate(errorProgress, [0, 1], [0, 1], clamp),
              }}
            >
              <div 
                style={{
                  background: "#ef4444",
                  color: "white",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                ✕
              </div>
              <div style={{display: "flex", flexDirection: "column"}}>
                <div style={{fontFamily: MONO_STACK, fontSize: 15, fontWeight: 700, color: "#991b1b"}}>
                  运行错误: 无法执行该工具。
                </div>
                <div style={{fontFamily: MONO_STACK, fontSize: 13, color: "#b91c1c", marginTop: 2}}>
                  输入坐标系缺失，无法进行投影公式计算。
                </div>
              </div>
            </div>

            {/* Bottom Overlay Question Mark (shown if error is active) */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255, 253, 249, 0.95)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                opacity: questionProgress,
                pointerEvents: questionProgress > 0.5 ? "auto" : "none",
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.15))",
                  transform: `translateY(${Math.sin(frame * 0.25) * 12}px)`,
                }}
              >
                ❓
              </div>
              <div style={{fontSize: 32, fontWeight: 700, color: "#8f4e3e", marginTop: 16}}>
                为什么直接投影行不通？
              </div>
              <div style={{fontFamily: MONO_STACK, fontSize: 16, color: "#7a766c", marginTop: 8}}>
                它到底缺了什么关键要素？
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {frame >= 774 && frame < 1022 && (
        <AbsoluteFill style={{opacity: sec5}}>
          <div
            style={{
              position: "absolute",
              left: 170,
              top: 182,
              width: 720,
              transform: `translateY(${interpolate(s5Progress, [0, 1], [62, 0])}px)`,
            }}
          >
            <div style={{fontSize: 78, lineHeight: 1.15, fontWeight: 700}}>
              说实话，
              <br />
              大三的我，
              <br />
              <span style={{color: "#8f4e3e"}}>也完全懵了... 🤯</span>
            </div>
            <div style={{fontSize: 28, color: "#5f5e56", lineHeight: 1.55, marginTop: 32}}>
              备考 GIS 大赛前，我已经完全忘记。
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              right: 150,
              top: 238,
              width: 760,
              height: 520,
              background: "#1f3227",
              border: "12px solid #5c3f25",
              borderRadius: 8,
              boxShadow: "0 34px 90px rgba(27, 44, 35, 0.25), inset 0 0 40px rgba(0,0,0,0.6)",
              padding: "36px 40px",
              boxSizing: "border-box",
              transform: `scale(${interpolate(s5Progress, [0, 1], [0.85, 1])})`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Blackboard Header */}
            <div style={{color: "rgba(255,255,255,0.7)", fontFamily: SERIF_STACK, fontSize: 20, borderBottom: "1px dashed rgba(255,255,255,0.2)", paddingBottom: 10}}>
              📝 GIS 大赛模拟面试
            </div>

            {/* Main Area */}
            <div style={{display: "flex", flex: 1, marginTop: 20, position: "relative"}}>
              {/* Question Chalk Text */}
              <div style={{flex: 1, color: "#fffaf0", display: "flex", flexDirection: "column", gap: 14, textShadow: "0 0 4px rgba(255,255,255,0.4)"}}>
                <div style={{fontSize: 22, color: "#facc15", fontWeight: 700}}>【提问】</div>
                <div style={{fontSize: 34, lineHeight: 1.35, fontWeight: 700, fontFamily: SERIF_STACK}}>
                  缺失坐标系的数据，
                  <br />
                  为什么不能
                  <br />
                  直接用【投影】？
                </div>
              </div>

              {/* Nervous Boy Image */}
              <div 
                style={{
                  width: 260,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  position: "relative",
                  transform: `translateX(${interpolate(s5Progress, [0, 1], [50, 0])}px)`,
                }}
              >
                <img 
                  src={staticFile("school_kokuban_happyou_tenkousei_kinchou_boy.png")}
                  style={{
                    height: 280,
                    objectFit: "contain",
                    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.3))",
                    transform: `translateX(${Math.sin(frame * 1.5) * 2}px)`, 
                  }}
                />

                {/* Speech Bubble */}
                {frame >= 810 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 270,
                      right: 110,
                      width: 220,
                      background: "#fff",
                      border: "2px solid #222",
                      borderRadius: 12,
                      padding: "10px 14px",
                      fontSize: 16,
                      color: "#111",
                      fontWeight: 700,
                      boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                      transform: `scale(${spring({frame: frame - 810, fps, config: {damping: 12, stiffness: 120}})})`,
                      transformOrigin: "bottom right",
                    }}
                  >
                    “呃……直接运行
                    <br />
                    不就行了吗……？”
                    <div style={{
                      position: "absolute",
                      bottom: -10,
                      right: 30,
                      width: 0,
                      height: 0,
                      borderWidth: "10px 10px 0 0",
                      borderColor: "#fff transparent transparent transparent",
                      borderStyle: "solid",
                    }} />
                    <div style={{
                      position: "absolute",
                      bottom: -13,
                      right: 29,
                      width: 0,
                      height: 0,
                      borderWidth: "11px 11px 0 0",
                      borderColor: "#222 transparent transparent transparent",
                      borderStyle: "solid",
                      zIndex: -1,
                    }} />
                  </div>
                )}
              </div>
            </div>

            {/* Giant Stamp Slammed */}
            {frame >= 845 && (
              <div
                style={{
                  position: "absolute",
                  left: "30%",
                  top: "40%",
                  border: "6px double #ef4444",
                  color: "#ef4444",
                  fontFamily: SERIF_STACK,
                  fontSize: 48,
                  fontWeight: 900,
                  padding: "10px 30px",
                  borderRadius: 12,
                  background: "rgba(254, 242, 242, 0.95)",
                  boxShadow: "0 10px 30px rgba(239, 68, 68, 0.4)",
                  zIndex: 10,
                  transform: `translate(-50%, -50%) rotate(-15deg) scale(${interpolate(
                    spring({frame: frame - 845, fps, config: {damping: 10, stiffness: 150}}),
                    [0, 1],
                    [3, 1]
                  )})`,
                  opacity: interpolate(
                    spring({frame: frame - 845, fps, config: {damping: 10, stiffness: 150}}),
                    [0, 1],
                    [0, 1]
                  ),
                }}
              >
                得分: 0分 🤦‍♂️
              </div>
            )}
          </div>
        </AbsoluteFill>
      )}

      {frame >= 1014 && frame < 1500 && (
        <AbsoluteFill style={{opacity: sec6}}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 122,
              transform: `translate(-50%, ${interpolate(s6Progress, [0, 1], [50, 0])}px)`,
              textAlign: "center",
              width: 1500,
            }}
          >
            <div style={{fontFamily: MONO_STACK, fontSize: 16, color: "#315f6d", marginBottom: 22, height: 24}}>
              {typedTitle}
            </div>
            <div style={{fontSize: 74, lineHeight: 1.12, fontWeight: 700}}>
              作为 GISer 的看家本领，
              <br />
              它就是你的<span style={{color: "#4f745d"}}>空间判断力</span>。
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 210,
              top: 452,
              width: 1500,
              display: "grid",
              gridTemplateColumns: "1fr 150px 1fr",
              alignItems: "center",
              gap: 50,
            }}
          >
            <div
              style={{
                height: 270,
                padding: 34,
                border: "1px solid rgba(47, 55, 49, 0.14)",
                background: "rgba(255, 252, 244, 0.54)",
                opacity: 0.58,
                transform: `translateX(${interpolate(s6Progress, [0, 1], [-110, 0])}px)`,
              }}
            >
              <div style={{fontFamily: MONO_STACK, fontSize: 14, color: "#73776f"}}>代码能力相同</div>
              <div style={{fontSize: 40, fontWeight: 700, marginTop: 44}}>CS 毕业生</div>
              <div style={{fontSize: 22, color: "#6c6c62", lineHeight: 1.5, marginTop: 20}}>
                编程很强，但可能不知道“这串坐标到底该怎么被理解”。
              </div>
            </div>

            <div style={{fontFamily: MONO_STACK, fontSize: 30, color: "#8d806d", textAlign: "center"}}>VS</div>

            <div
              style={{
                height: 300,
                padding: 38,
                border: "1px solid rgba(79, 116, 93, 0.32)",
                background: "rgba(248, 253, 246, 0.86)",
                boxShadow: `0 ${interpolate(gisLift, [0, 1], [16, 34])}px 80px rgba(61, 91, 67, 0.18)`,
                transform: `translateX(${interpolate(s6Progress, [0, 1], [110, 0])}px) translateY(${interpolate(gisLift, [0, 1], [0, -24])}px)`,
              }}
            >
              <div style={{fontFamily: MONO_STACK, fontSize: 14, color: "#4f745d"}}>决定性差异</div>
              <div style={{fontSize: 43, fontWeight: 700, marginTop: 44, color: "#2d342f"}}>GIS 毕业生</div>
              <div style={{fontSize: 23, color: "#4e5a51", lineHeight: 1.5, marginTop: 20}}>
                能判断什么时候只是“定义”，什么时候必须“投影”。
              </div>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 112,
              transform: "translateX(-50%)",
              textAlign: "center",
              fontSize: 42,
              lineHeight: 1.28,
              fontWeight: 700,
              color: "#26332e",
            }}
          >
            今天这个视频，
            <span style={{color: "#315f6d"}}>带你真正搞懂</span>
            <br />
            “定义投影”和“投影”这两个工具。
            <div
              style={{
                height: 4,
                width: interpolate(finalUnderline, [0, 1], [0, 820]),
                background: "linear-gradient(90deg, transparent, #a77748, #4f745d, transparent)",
                margin: "26px auto 0",
              }}
            />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
