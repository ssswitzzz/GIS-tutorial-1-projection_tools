import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Lottie, LottieAnimationData } from "@remotion/lottie";

const SERIF_STACK =
  "'Source Han Serif CN SemiBold', 'Source Han Serif CN', 'Source Han Serif SC', 'Noto Serif SC', SimSun, serif";
const MONO_STACK = "'JetBrains Mono', 'Cascadia Mono', Consolas, monospace";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// const ease = Easing.bezier(0.22, 1, 0.36, 1);

// Lottie player helper component
const LottiePlayer: React.FC<{
  src: string;
  style?: React.CSSProperties;
}> = ({ src, style }) => {
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

export const CurrencyExchangeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ==================== 1. INTRO SCENE TIMING (0 - 490) ====================
  const introFade = interpolate(frame, [460, 490], [1, 0], clamp);
  const ringRotation = frame * 0.25;
  const earthScale = interpolate(
    spring({ frame: frame - 8, fps, config: { damping: 18, stiffness: 72 } }),
    [0, 1],
    [0.78, 1]
  );

  // Subtitle opacities inside Intro Scene
  const textOpacity87 = interpolate(frame, [10, 30, 136, 156], [0, 1, 1, 0], clamp);
  const textOpacity88 = interpolate(frame, [170, 190, 306, 326], [0, 1, 1, 0], clamp);
  const textOpacity89 = interpolate(frame, [328, 348, 466, 486], [0, 1, 1, 0], clamp);

  // ==================== 2. KIOSK ANIMATION TIMING (490+) ====================
  const kioskFade = interpolate(frame, [480, 510], [0, 1], clamp);

  // Little Person Position Animations (shifted by +490 frames)
  const personX = interpolate(frame, 
    [490, 610,  940, 990,  1290, 1340,  2690, 2740,  3190, 3240], 
    [-200, 580, 580, 720, 720, 580,  580, 720,   720, 580], 
    clamp
  );

  // Walk animation oscillation (bounce up and down)
  const isWalking = (frame >= 490 && frame <= 610) || 
                    (frame >= 940 && frame <= 990) || 
                    (frame >= 1290 && frame <= 1340) || 
                    (frame >= 2690 && frame <= 2740) || 
                    (frame >= 3190 && frame <= 3240);
  const bounceY = isWalking ? Math.abs(Math.sin(frame * 0.25)) * 18 : 0;

  // Cross-fade opacity values for the 4 character states (extended to 20 frames for gentler transition)
  const opacity1 = interpolate(frame, [770, 790], [1, 0], clamp);
  
  const opacity2 = frame < 1500 
    ? interpolate(frame, [770, 790], [0, 1], clamp) 
    : interpolate(frame, [2220, 2240], [1, 0], clamp);
    
  const opacity3 = frame < 2500 
    ? interpolate(frame, [2220, 2240], [0, 1], clamp) 
    : interpolate(frame, [2860, 2880], [1, 0], clamp);
    
  const opacity4 = interpolate(frame, [2860, 2880], [0, 1], clamp);

  // Individual image scales during transitions to ensure incoming images grow and outgoing images shrink smoothly
  const scale1 = interpolate(frame, [770, 790], [1.0, 0.7], clamp);
  
  const scale2 = frame < 1500
    ? interpolate(frame, [770, 790], [0.7, 1.0], clamp)
    : interpolate(frame, [2220, 2240], [1.0, 0.7], clamp);
    
  const scale3 = frame < 2500
    ? interpolate(frame, [2220, 2240], [0.945, 1.35], clamp)
    : interpolate(frame, [2860, 2880], [1.35, 0.945], clamp);
    
  const scale4 = interpolate(frame, [2860, 2880], [0.7, 1.0], clamp);

  // Stamp Tool Animation (Stamping phase)
  const stampY = interpolate(frame, [2210, 2230, 2238, 2260], [-600, 430, 430, -600], clamp);
  const stampScale = interpolate(frame, [2225, 2230, 2238, 2250], [1, 1.2, 0.9, 1], clamp);
  
  // Screen Shake effect on stamp hit
  const shakeOffset = interpolate(frame, [2230, 2232, 2234, 2236, 2238, 2240, 2245], [0, 12, -10, 8, -6, 3, 0], clamp);

  // Kiosk Slot position: X=960, Y=480
  // Paper / Bill Position Animation (moved to bottom-right of the person)
  let paperX = personX + 160;
  let paperY = 220 - bounceY + 300; 
  let paperOpacity = 1;
  let paperRotation = 12;

  // Polished Paper Movement using Remotion Spring engine
  const tInsert1 = spring({ frame: frame - 970, fps, config: { damping: 14, stiffness: 120 } });
  const tReject = spring({ frame: frame - 1290, fps, config: { damping: 13, stiffness: 80 } });
  const tInsert2 = spring({ frame: frame - 2710, fps, config: { damping: 14, stiffness: 120 } });
  const tDispense = spring({ frame: frame - 3250, fps, config: { damping: 14, stiffness: 100 } });

  if (frame > 960 && frame <= 1290) {
    // Stage 2: First Insertion
    paperX = interpolate(tInsert1, [0, 1], [personX + 160, 920], clamp);
    paperY = interpolate(tInsert1, [0, 1], [220 - bounceY + 300, 480], clamp);
    paperRotation = interpolate(tInsert1, [0, 1], [12, 0], clamp);
    paperOpacity = interpolate(frame, [990, 1000], [1, 0], clamp);
  } else if (frame > 1290 && frame <= 2710) {
    // Stage 3: Rejected / Confused
    paperX = interpolate(tReject, [0, 1], [920, personX + 160], clamp);
    paperY = interpolate(tReject, [0, 1], [480, 220 - bounceY + 300], clamp);
    paperRotation = interpolate(tReject, [0, 1], [0, 12], clamp);
    paperOpacity = interpolate(frame, [1290, 1300], [0, 1], clamp);
  } else if (frame > 2710 && frame <= 2890) {
    // Stage 4: Second Insertion
    paperX = interpolate(tInsert2, [0, 1], [personX + 160, 920], clamp);
    paperY = interpolate(tInsert2, [0, 1], [220 - bounceY + 300, 480], clamp);
    paperRotation = interpolate(tInsert2, [0, 1], [12, 0], clamp);
    paperOpacity = interpolate(frame, [2730, 2740], [1, 0], clamp);
  } else if (frame > 2890) {
    // Labeled paper is gone inside the machine!
    paperOpacity = 0;
  }

  // Stamp label reveal progress (Define Projection)
  const isStamped = frame >= 2230;
  const stampProgress = spring({
    frame: frame - 2230,
    fps,
    config: { damping: 10, stiffness: 90 },
  });

  // Converted Bill Output Animation (frame 3250+) driven by spring
  const newBillOpacity = interpolate(frame, [3240, 3255], [0, 1], clamp);
  const newBillX = interpolate(tDispense, [0, 1], [920, personX + 160], clamp);
  const newBillY = interpolate(tDispense, [0, 1], [480, 220 - bounceY + 300], clamp);
  const newBillRotate = interpolate(tDispense, [0, 1], [-15, 12], clamp);

  // Kiosk Screen Status State
  let kioskScreenBg = "#1f2421";
  let kioskTextColor = "#5b806f";
  let kioskMessage = "请存入外币 / INSERT";
  let alarmColor = "#c48f48";
  let alarmPulse = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.3, 0.8]);

  if (frame > 990 && frame <= 1300) {
    // Inserting blank paper -> ALARM ERROR!
    kioskScreenBg = "#2d1616";
    kioskTextColor = "#f43f5e";
    kioskMessage = "ERROR: 无法识别币种!";
    alarmColor = "#ef4444";
  } else if (frame > 1300 && frame <= 2720) {
    // Waiting for labeled paper
    kioskScreenBg = "#1f2421";
    kioskTextColor = "#7a766c";
    kioskMessage = "等待有效凭证...";
    alarmColor = "#7a766c";
    alarmPulse = 0.2;
  } else if (frame > 2720 && frame <= 3250) {
    // Identified RMB -> Processing
    kioskScreenBg = "#162820";
    kioskTextColor = "#34d399";
    kioskMessage = "已识别: 人民币 ¥100";
    alarmColor = "#10b981";
    if (frame > 2840) {
      kioskMessage = "汇率换算中 (CNY -> USD)...";
    }
  } else if (frame > 3250) {
    // Processed -> Dispensed
    kioskScreenBg = "#1c2530";
    kioskTextColor = "#60a5fa";
    kioskMessage = "兑换成功! 已吐钞";
    alarmColor = "#3b82f6";
  }

  // Gear Rotation inside the machine during processing (2740 - 3250)
  const isProcessing = frame > 2740 && frame < 3250;
  // const gearRotation = isProcessing ? frame * 4 : 0;

  // HUD & Narrative Title Banners (Refined and Concised GIS Concept Summaries)
  const textOpacity90 = interpolate(frame, [490, 510, 750, 770], [0, 1, 1, 0], clamp);
  const textOpacity92 = interpolate(frame, [770, 790, 1230, 1250], [0, 1, 1, 0], clamp);
  const textOpacity94 = interpolate(frame, [1250, 1270, 1770, 1790], [0, 1, 1, 0], clamp);
  const textOpacity97 = interpolate(frame, [1790, 1810, 2250, 2270], [0, 1, 1, 0], clamp);
  const textOpacity99 = interpolate(frame, [2270, 2290, 2850, 2870], [0, 1, 1, 0], clamp);
  const textOpacity101 = interpolate(frame, [2870, 2890, 3420, 3450], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill
      style={{
        fontFamily: SERIF_STACK,
        color: "#29342f",
        background: "linear-gradient(135deg, #f9f4e9 0%, #fcfbf5 50%, #e9efea 100%)",
        overflow: "hidden",
        transform: `translateY(${shakeOffset}px)`,
      }}
    >
      {/* ==================== SCENE 1: INTRO SECTION (0 - 490) ==================== */}
      {frame >= 0 && frame < 495 && (
        <AbsoluteFill style={{ opacity: introFade, zIndex: 50 }}>
          <BigQuestionMark x={224} y={214} size={200} delay={16} />
          <BigQuestionMark x={1620} y={770} size={310} delay={28} />
          <BigQuestionMark x={1510} y={238} size={130} delay={40} />

          {/* Left side dynamic rotating circles and Thinking Lottie */}
          <div style={{ position: "absolute", left: 240, top: 220, width: 560, height: 560 }}>
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
                left: 100,
                top: 100,
                width: 360,
                height: 360,
                transform: `scale(${earthScale})`,
                filter: "drop-shadow(0 26px 42px rgba(48, 83, 74, 0.15))",
              }}
            >
              <LottiePlayer src="Thinking.json" />
            </div>
          </div>

          {/* Right side Text Block */}
          <div
            style={{
              position: "absolute",
              left: 860,
              top: 280,
              width: 820,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: 500,
            }}
          >
            {/* Subtitle 87 */}
            <div style={{ position: "absolute", opacity: textOpacity87, transform: `translateY(${interpolate(textOpacity87, [0, 1], [20, 0])}px)` }}>
              <div style={{ fontSize: 90, lineHeight: 1.1, fontWeight: 800 }}>
                现在我们来回答
                <br />
                <span style={{ color: "#8f4e3e" }}>开头那个问题。</span>
              </div>
              <div style={{ width: 520, height: 5, background: "linear-gradient(90deg, #a77748, transparent)", marginTop: 24 }} />
            </div>

            {/* Subtitle 88 */}
            <div style={{ position: "absolute", opacity: textOpacity88, transform: `translateY(${interpolate(textOpacity88, [0, 1], [20, 0])}px)` }}>
              <div style={{ fontSize: 76, lineHeight: 1.15, fontWeight: 800 }}>
                为什么拖入一个
                <br />
                <span style={{ color: "#b45309" }}>没有坐标系的数据，</span>
              </div>
              <div style={{ width: 520, height: 5, background: "linear-gradient(90deg, #b45309, transparent)", marginTop: 24 }} />
            </div>

            {/* Subtitle 89 */}
            <div style={{ position: "absolute", opacity: textOpacity89, transform: `translateY(${interpolate(textOpacity89, [0, 1], [20, 0])}px)` }}>
              <div style={{ fontSize: 76, lineHeight: 1.15, fontWeight: 800 }}>
                不能直接用
                <br />
                <span style={{ color: "#ef4444" }}>Project 转换呢？</span>
              </div>
              <div style={{ width: 520, height: 5, background: "linear-gradient(90deg, #ef4444, transparent)", marginTop: 24 }} />
            </div>

          </div>
        </AbsoluteFill>
      )}

      {/* ==================== SCENE 2: KIOSK MAIN ANIMATION (490+) ==================== */}
      {frame >= 480 && (
        <AbsoluteFill style={{ opacity: kioskFade, zIndex: 10 }}>
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
            SCENARIO SIMULATION / 换汇情景模拟
          </div>

          <div style={{ position: "absolute", top: 44, right: 58, fontFamily: MONO_STACK, fontSize: 14, color: "#6f7368" }}>
            SECTION 03 / 04
          </div>

          {/* Narrative Overlay Banner (Refined, concise summaries) */}
          <div style={{ position: "absolute", top: 120, width: "100%", display: "flex", justifyContent: "center", zIndex: 10 }}>
            <div style={{ position: "relative", width: 1100, height: 120, display: "flex", justifyContent: "center" }}>
              
              {/* Subtitle 90-91 */}
              <div style={{ position: "absolute", opacity: textOpacity90, textAlign: "center", transform: `translateY(${interpolate(textOpacity90, [0, 1], [15, 0])}px)` }}>
                <h2 style={{ fontSize: 44, fontWeight: 800, color: "#4f745d" }}>什么是【投影】 (Project)？</h2>
                <p style={{ fontFamily: MONO_STACK, fontSize: 24, color: "#7a766c", marginTop: 10 }}>将它类比为自助换汇：必须声明“源币种”才能换算汇率</p>
              </div>

              {/* Subtitle 92-93 */}
              <div style={{ position: "absolute", opacity: textOpacity92, textAlign: "center", transform: `translateY(${interpolate(textOpacity92, [0, 1], [15, 0])}px)` }}>
                <h2 style={{ fontSize: 44, fontWeight: 800, color: "#ef4444" }}>直接运行 Project ❌</h2>
                <p style={{ fontFamily: MONO_STACK, fontSize: 24, color: "#ef4444", marginTop: 10 }}>空白纸张上没有任何币种标志，换汇机无法换算 (无法投影)</p>
              </div>

              {/* Subtitle 94-96 */}
              <div style={{ position: "absolute", opacity: textOpacity94, textAlign: "center", transform: `translateY(${interpolate(textOpacity94, [0, 1], [15, 0])}px)` }}>
                <h2 style={{ fontSize: 44, fontWeight: 800, color: "#b45309" }}>缺少【原始坐标系说明】</h2>
                <p style={{ fontFamily: MONO_STACK, fontSize: 24, color: "#7a766c", marginTop: 10 }}>学术大门打不开：未知源坐标系，几何换算公式无法执行</p>
              </div>

              {/* Subtitle 97-98 */}
              <div style={{ position: "absolute", opacity: textOpacity97, textAlign: "center", transform: `translateY(${interpolate(textOpacity97, [0, 1], [15, 0])}px)` }}>
                <h2 style={{ fontSize: 44, fontWeight: 800, color: "#10b981" }}>第一步：用 Define Projection 贴上标签 🏷️</h2>
                <p style={{ fontFamily: MONO_STACK, fontSize: 24, color: "#047857", marginTop: 10 }}>为没有坐标系的数据，声明其原本所代表的真实含义 (如 CNY)</p>
              </div>

              {/* Subtitle 99-100 */}
              <div style={{ position: "absolute", opacity: textOpacity99, textAlign: "center", transform: `translateY(${interpolate(textOpacity99, [0, 1], [15, 0])}px)` }}>
                <h2 style={{ fontSize: 44, fontWeight: 800, color: "#3b82f6" }}>有了标签身份，才能计算新数字 🔄</h2>
                <p style={{ fontFamily: MONO_STACK, fontSize: 24, color: "#1d4ed8", marginTop: 10 }}>读取源坐标系，经过转换数学公式，重算得到全新投影平面坐标</p>
              </div>

              {/* Subtitle 101-112 */}
              <div style={{ position: "absolute", opacity: textOpacity101, textAlign: "center", transform: `translateY(${interpolate(textOpacity101, [0, 1], [15, 0])}px)` }}>
                <h2 style={{ fontSize: 44, fontWeight: 800, color: "#7c3aed" }}>标准工作流：先 Define Projection，再 Project ✅</h2>
                <p style={{ fontFamily: MONO_STACK, fontSize: 24, color: "#7c3aed", marginTop: 10 }}>找回丢失的身份标签 ➡️ 数学换算 ➡️ 吐出带有新坐标定义的文件</p>
              </div>

            </div>
          </div>

          {/* Main Animation Area */}
          <AbsoluteFill style={{ top: 220, height: 700 }}>
            
            {/* Background table line */}
            <div style={{ position: "absolute", left: 100, right: 100, top: 620, height: 4, background: "rgba(37, 48, 43, 0.12)", borderRadius: 999 }} />

            {/* ==================== KIOSK ==================== */}
            <div style={{ position: "absolute", left: 960, top: 120, width: 440, height: 500, transform: "translateX(-50%)" }}>
              
              {/* Flashing Kiosk alarm lamp */}
              <div 
                style={{ 
                  position: "absolute", 
                  left: 220 - 20, 
                  top: -24, 
                  width: 40, 
                  height: 24, 
                  borderRadius: "20px 20px 0 0", 
                  background: alarmColor, 
                  boxShadow: `0 0 30px ${alarmColor}`,
                  opacity: alarmPulse,
                  transition: "background 0.3s, box-shadow 0.3s"
                }} 
              />

              {/* Main Body */}
              <div 
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  background: "linear-gradient(180deg, #374151 0%, #1f2937 100%)", 
                  borderRadius: 24, 
                  border: "3px solid #4b5563",
                  boxShadow: "0 25px 60px rgba(17, 24, 39, 0.4)",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Glossy overlay */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "45%", background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 100%)", pointerEvents: "none" }} />

                {/* Screen border */}
                <div style={{ position: "absolute", left: 32, top: 32, right: 32, height: 200, borderRadius: 12, border: "2px solid #6b7280", background: kioskScreenBg, padding: 22, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "background 0.3s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: MONO_STACK, fontSize: 15, color: kioskTextColor, fontWeight: "bold" }}>FOREIGN EXCHANGE KIOSK</span>
                    <span style={{ width: 12, height: 12, borderRadius: 999, background: alarmColor, transition: "background 0.3s" }} />
                  </div>

                  <div style={{ fontSize: 28, fontWeight: 700, color: kioskTextColor, textAlign: "center", letterSpacing: 0.5, transition: "color 0.3s" }}>
                    {kioskMessage}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontFamily: MONO_STACK, color: "#8b949e" }}>
                    <span>CNY/USD RATE: 0.147</span>
                    <span>SYSTEM ACTIVE</span>
                  </div>
                </div>

                {/* Insertion Slot */}
                <div style={{ position: "absolute", left: "50%", bottom: 140, transform: "translateX(-50%)", width: 220, height: 20, background: "#111827", borderRadius: 10, border: "2.5px solid #4b5563", boxShadow: "0 0 12px rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 190, height: 4, background: isProcessing ? "#10b981" : "#f59e0b", borderRadius: 2, boxShadow: isProcessing ? "0 0 8px #10b981" : "0 0 8px #f59e0b" }} />
                </div>
                <div style={{ position: "absolute", left: "50%", bottom: 110, transform: "translateX(-50%)", fontFamily: MONO_STACK, fontSize: 16, color: "#9ca3af", fontWeight: "bold", whiteSpace: "nowrap" }}>
                  INSERT BILL HERE / 投币口
                </div>

                {/* Output Slot */}
                <div style={{ position: "absolute", left: "50%", bottom: 42, transform: "translateX(-50%)", width: 220, height: 16, background: "#0f172a", borderRadius: 4, border: "1px solid #374151" }} />
                <div style={{ position: "absolute", left: "50%", bottom: 20, transform: "translateX(-50%)", fontFamily: MONO_STACK, fontSize: 14, color: "#6b7280", whiteSpace: "nowrap" }}>
                  DISPENSING SLOT / 吐钞口
                </div>
              </div>
            </div>

            {/* ==================== LITTLE PERSON ==================== */}
            <div 
              style={{ 
                position: "absolute", 
                left: personX, 
                top: 220 - bounceY, 
                width: 300, 
                height: 400,
                transform: "translateX(-50%)",
                transformOrigin: "bottom center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 20,
              }}
            >
              {/* Image 1: Smile 2 */}
              {opacity1 > 0 && (
                <img 
                  src={staticFile("face_smile_woman2.png")}
                  alt="Smile 2"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    height: 400,
                    width: "auto",
                    objectFit: "contain",
                    opacity: opacity1,
                    transform: `scale(${scale1})`,
                    transformOrigin: "bottom center",
                  }}
                />
              )}
              {/* Image 2: Angry 3 */}
              {opacity2 > 0 && (
                <img 
                  src={staticFile("face_angry_woman3.png")}
                  alt="Angry 3"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    height: 400,
                    width: "auto",
                    objectFit: "contain",
                    opacity: opacity2,
                    transform: `scale(${scale2})`,
                    transformOrigin: "bottom center",
                  }}
                />
              )}
              {/* Image 3: Inspired Book */}
              {opacity3 > 0 && (
                <img 
                  src={staticFile("book_hirameki_keihatsu_woman.png")}
                  alt="Inspired Book"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    height: 400,
                    width: "auto",
                    objectFit: "contain",
                    opacity: opacity3,
                    transform: `scale(${scale3})`,
                    transformOrigin: "bottom center",
                  }}
                />
              )}
              {/* Image 4: Smile 4 */}
              {opacity4 > 0 && (
                <img 
                  src={staticFile("face_smile_woman4.png")}
                  alt="Smile 4"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    height: 400,
                    width: "auto",
                    objectFit: "contain",
                    opacity: opacity4,
                    transform: `scale(${scale4})`,
                    transformOrigin: "bottom center",
                  }}
                />
              )}
            </div>

            {/* ==================== ORIGINAL INPUT PAPER ==================== */}
            {paperOpacity > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: paperX,
                  top: paperY,
                  width: 200, 
                  height: 110,
                  background: "rgba(255, 255, 255, 0.95)",
                  border: `3px solid ${isStamped ? "#4f745d" : "#7a766c"}`,
                  borderRadius: 10,
                  boxShadow: "0 16px 36px rgba(0, 0, 0, 0.16)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `translate(-50%, -50%) rotate(${paperRotation}deg)`,
                  opacity: paperOpacity,
                  zIndex: 25,
                }}
              >
                <div style={{ fontSize: 13, fontFamily: MONO_STACK, color: "#7a828e", letterSpacing: 1.2, fontWeight: 700 }}>SHAPE_DATA</div>
                <div style={{ fontSize: 46, fontWeight: 900, color: isStamped ? "#047857" : "#1f2937", lineHeight: 1.1 }}>
                  {isStamped ? "¥ 100" : "100"}
                </div>
                <div style={{ fontSize: 13, fontFamily: MONO_STACK, color: isStamped ? "#10b981" : "#99a1af", fontWeight: 700 }}>
                  {isStamped ? "标签: 人民币" : "未声明币种"}
                </div>

                {isStamped && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 4,
                      border: "2px dashed rgba(16, 185, 129, 0.4)",
                      borderRadius: 6,
                      transform: `scale(${stampProgress})`,
                      opacity: stampProgress,
                      pointerEvents: "none"
                    }}
                  />
                )}
              </div>
            )}

            {/* ==================== STAMPING TOOL ==================== */}
            <div
              style={{
                position: "absolute",
                left: personX + 160, 
                top: stampY,
                transform: `translate(-50%, -50%) scale(${stampScale})`,
                width: 170,
                height: 170,
                zIndex: 45,
                pointerEvents: "none"
              }}
            >
              {/* Stamp handle */}
              <div style={{ width: 44, height: 76, background: "#b45309", border: "2.5px solid #78350f", borderRadius: "14px 14px 0 0", margin: "0 auto" }} />
              {/* Stamp metal collar */}
              <div style={{ width: 94, height: 22, background: "#9ca3af", border: "2.5px solid #4b5563", margin: "0 auto" }} />
              {/* Stamp base plate */}
              <div style={{ width: 160, height: 36, background: "#10b981", border: "2.5px solid #047857", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontFamily: MONO_STACK, fontSize: 16, fontWeight: "bold" }}>贴标签 (CNY)</span>
              </div>
            </div>

            {/* ==================== CONVERTED OUTPUT BILL ==================== */}
            <div
              style={{
                position: "absolute",
                left: newBillX,
                top: newBillY,
                width: 200, 
                height: 110,
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                border: "3px solid #34d399",
                borderRadius: 10,
                boxShadow: "0 18px 42px rgba(5, 150, 105, 0.35)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transform: `translate(-50%, -50%) rotate(${newBillRotate}deg)`,
                opacity: newBillOpacity,
                color: "white",
                zIndex: 25,
              }}
            >
              <div style={{ fontSize: 13, fontFamily: MONO_STACK, color: "#a7f3d0", letterSpacing: 1.2, fontWeight: 700 }}>PROJECT_DATA</div>
              <div style={{ fontSize: 44, fontWeight: 900, color: "white", lineHeight: 1.1 }}>
                $ 14.7
              </div>
              <div style={{ fontSize: 13, fontFamily: MONO_STACK, color: "#d1fae5", fontWeight: 700 }}>
                平面坐标 (已投影)
              </div>
            </div>

          </AbsoluteFill>
        </AbsoluteFill>
      )}

    </AbsoluteFill>
  );
};
