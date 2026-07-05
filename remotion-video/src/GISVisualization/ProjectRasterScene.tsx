import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Video,
  staticFile,
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

export const ProjectRasterScene: React.FC = () => {
  const frame = useCurrentFrame();

  // ==================== 1. TIMING AND OPACITIES ====================
  const sceneFade = interpolate(frame, [0, 20, 7530, 7554], [0, 1, 1, 0], clamp);

  // Subtitle concept opacities (mapped precisely to subtitle ranges)
  const textOpacity1 = fade(frame, 0, 292, 20, 20);      // Sub 152-154: Why separate tool?
  const textOpacity2 = fade(frame, 292, 1936, 20, 20);    // Sub 155-170: Raster structure
  const textOpacity3 = fade(frame, 1936, 3736, 20, 20);  // Sub 171-185: Curvature & skewing
  const textOpacity4 = fade(frame, 3736, 4398, 20, 20);  // Sub 186-194: Solution: Resampling
  const textOpacity5 = fade(frame, 4398, 7284, 20, 20);  // Sub 195-204: Inverse projection & Interpolation
  const textOpacity6 = fade(frame, 7284, 7554, 20, 20);  // Sub 205-206: Outro summary

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
      {/* Decorative Background Grid Lines */}
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
          gap: 10,
          fontWeight: 600,
        }}
      >
        <span>● PROJECT RASTER VISUALIZATION</span>
        <span style={{ color: "#d1c7bd" }}>/</span>
        <span style={{ color: "#7c8c83" }}>投影栅格原理解析</span>
      </div>

      <div
        style={{
          position: "absolute",
          top: 44,
          right: 58,
          fontFamily: MONO_STACK,
          fontSize: 14,
          color: "#7c8c83",
          fontWeight: 600,
        }}
      >
        SECTION 04 / 04
      </div>

      {/* ==================== SCREEN TITLE BANNERS ==================== */}
      {/* Phase 1: Intro (Sub 152-154) */}
      <div
        style={{
          position: "absolute",
          top: 106,
          left: 58,
          right: 58,
          opacity: textOpacity1,
          pointerEvents: "none",
        }}
      >
        <h2 style={{ fontSize: 32, fontWeight: "bold", margin: "0 0 12px 0", color: "#1f2937", display: "flex", alignItems: "center", gap: 12 }}>
          💡 为什么栅格数据需要专属投影工具？
        </h2>
        <p style={{ fontSize: 18, color: "#4b5563", margin: 0, lineHeight: 1.5 }}>
          栅格数据与矢量数据在存储结构上存在本质差别，这也决定了它们需要不同的处理逻辑。
        </p>
      </div>

      {/* Phase 2: Data Structure (Sub 155-170) */}
      <div
        style={{
          position: "absolute",
          top: 106,
          left: 58,
          right: 58,
          opacity: textOpacity2,
          pointerEvents: "none",
        }}
      >
        <h2 style={{ fontSize: 32, fontWeight: "bold", margin: "0 0 12px 0", color: "#115e59", display: "flex", alignItems: "center", gap: 12 }}>
          📋 矢量与栅格的数据结构差异
        </h2>
        <p style={{ fontSize: 18, color: "#374151", margin: 0, lineHeight: 1.5 }}>
          矢量数据存储具体的顶点坐标；而栅格仅在头文件中保存左上角坐标、像元大小、行列数等参数，其余格子的坐标全部由此推算。
        </p>
      </div>

      {/* Phase 3: Distortion (Sub 171-185) */}
      <div
        style={{
          position: "absolute",
          top: 106,
          left: 58,
          right: 58,
          opacity: textOpacity3,
          pointerEvents: "none",
        }}
      >
        <h2 style={{ fontSize: 32, fontWeight: "bold", margin: "0 0 12px 0", color: "#991b1b", display: "flex", alignItems: "center", gap: 12 }}>
          📐 投影转换引起的网格形变
        </h2>
        <p style={{ fontSize: 18, color: "#374151", margin: 0, lineHeight: 1.5 }}>
          因地球表面曲率变化，正方形网格在新坐标系中会发生弯曲、拉伸甚至旋转，而计算机硬盘要求栅格数据必须为正交行列矩阵。
        </p>
      </div>

      {/* Phase 4: Resampling Intro (Sub 186-194) */}
      <div
        style={{
          position: "absolute",
          top: 106,
          left: 58,
          right: 58,
          opacity: textOpacity4,
          pointerEvents: "none",
        }}
      >
        <h2 style={{ fontSize: 32, fontWeight: "bold", margin: "0 0 12px 0", color: "#065f46", display: "flex", alignItems: "center", gap: 12 }}>
          🔄 核心解决方案：重采样 (Resampling)
        </h2>
        <p style={{ fontSize: 18, color: "#374151", margin: 0, lineHeight: 1.5 }}>
          重采样的逻辑非常聪明：不直接变换或拉伸旧网格，而是直接在新坐标系中，先铺设一张横平竖直的空白像素矩阵。
        </p>
      </div>

      {/* Phase 5: Interpolation & Sweep (Sub 195-204) */}
      <div
        style={{
          position: "absolute",
          top: 106,
          left: 58,
          right: 58,
          opacity: textOpacity5,
          pointerEvents: "none",
        }}
      >
        <h2 style={{ fontSize: 32, fontWeight: "bold", margin: "0 0 12px 0", color: "#1e3a8a", display: "flex", alignItems: "center", gap: 12 }}>
          ⚡ 反向投影与像元值插值融合
        </h2>
        <p style={{ fontSize: 18, color: "#374151", margin: 0, lineHeight: 1.5 }}>
          将新网格中的格子反向算回旧坐标系中定位，跨在旧格子之间时，使用插值算法将邻域旧格子的数值融合，计算出新像素值。
        </p>
      </div>

      {/* Phase 6: Conclusion (Sub 205-206) */}
      <div
        style={{
          position: "absolute",
          top: 106,
          left: 58,
          right: 58,
          opacity: textOpacity6,
          pointerEvents: "none",
        }}
      >
        <h2 style={{ fontSize: 32, fontWeight: "bold", margin: "0 0 12px 0", color: "#3730a3", display: "flex", alignItems: "center", gap: 12 }}>
          🎯 重采样的本质与特性
        </h2>
        <p style={{ fontSize: 18, color: "#374151", margin: 0, lineHeight: 1.5 }}>
          这就是重采样的本质，也是投影栅格的核心特性，确保了输出栅格能够被硬盘和内存标准地正交存储。
        </p>
      </div>

      {/* ==================== MAIN MANIM VIDEO EMBED ==================== */}
      <div
        style={{
          position: "absolute",
          top: 220,
          left: "50%",
          transform: "translateX(-50%)",
          width: 1280,
          height: 720,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <Video
          src={staticFile("ProjectRasterSceneTimed.mp4")}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 16,
            border: "1.5px solid rgba(0, 0, 0, 0.08)",
            boxShadow: "0 25px 60px rgba(49, 95, 109, 0.12)",
          }}
          volume={0}
        />
      </div>
    </AbsoluteFill>
  );
};
