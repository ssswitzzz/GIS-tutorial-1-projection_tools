from manim import *
import numpy as np


class ProjectRasterScene(Scene):
    """
    栅格数据结构与投影变换 — 艺术化重构版
    严格对齐 SRT #152–#206 字幕时间轴
    中文字体全部使用思源宋体CN Nuo/SemiBold，英文全部清除，数字全用LaTeX/MathTex
    重构说明：
    1. Act II 投影扭曲采用“优美的地球经纬扇面弯曲投影”，告别老土的平行四边形，且彻底解决0:57的遮挡问题。
    2. Act III 重新设计“重采样反算”逻辑：左侧为规则直边彩色网格(坐标系A)，右侧为规则直边空白网格(坐标系B)。
       新网格格子反算回老坐标系时，在其运动过程中逐渐受投影变换影响弯曲，最终作为一个曲边像元跨在左侧直边旧网格的4个格子之间，完美展示“尴尬跨在几个格子之间”的逆向反算与插值融合过程。
    """

    # ── Map Projection Warp (Globe Fan-shaped Projection) ───────────

    def map_projection_warp(self, p):
        """Warp linear grid into a curved globe-like projection fan."""
        x, y = p[0], p[1]
        # Sector distortion centered at (0, -3.5)
        cx, cy = 0.0, -3.5
        dx = x - cx
        dy = y - cy
        r = np.sqrt(dx**2 + dy**2)
        theta = dx / 4.5  # polar angle scaling
        nx = r * np.sin(theta)
        ny = r * np.cos(theta) - 3.5
        return np.array([nx, ny, 0])

    # ── Background Helpers ──────────────────────────────────────────

    def _make_bg_grid(self, color):
        """Subtle paper grid background."""
        lines = VGroup()
        for x in np.linspace(-12, 12, 25):
            l = Line(
                [x, -4.5, 0], [x, 4.5, 0],
                stroke_color=color, stroke_width=0.6, stroke_opacity=0.30,
            )
            lines.add(l)
        for y in range(-4, 5):
            l = Line(
                [-12, y, 0], [12, y, 0],
                stroke_color=color, stroke_width=0.6, stroke_opacity=0.30,
            )
            lines.add(l)
        return lines.set_z_index(-20)

    def _make_bg_dots(self, color):
        """Subtle paper texture dots."""
        return VGroup(*[
            Dot(
                [np.random.uniform(-7, 7), np.random.uniform(-3.8, 3.8), 0],
                radius=0.005, color=color,
            ).set_opacity(0.15)
            for _ in range(100)
        ]).set_z_index(-20)

    # ── Construct ───────────────────────────────────────────────────

    def construct(self):
        # ═══ Color Palette (Premium Warm Editorial Paper) ═══
        BG     = "#F9F6EE"
        INK    = "#2C2823"
        MUTED  = "#7E7568"
        GRID_C = "#E5DEC9"
        AMBER  = "#D4901B"
        TEAL   = "#108B7A"
        BLUE   = "#2A65D6"
        GREEN  = "#2D8A4E"
        RED    = "#C85A48"
        CARD   = "#F0EAE1"
        CARD2  = "#ECE5D9"
        BORDER = "#D3C8B7"
        SAGE   = "#4F745D"

        # Font configuration
        CH_FONT = "Source Han Serif CN"

        self.camera.background_color = BG
        np.random.seed(154)

        # ═══ Background ═══
        self.add(self._make_bg_grid(GRID_C), self._make_bg_dots(INK))

        # ═══ Subtitle Timing Array (seconds, relative to scene start) ═══
        S = [
            (0.000,  0.800),   #  0 → #152 "那么"
            (0.867,  4.400),   #  1 → #153 "为什么栅格数据要再单独做一个投影工具呢"
            (4.967,  7.633),   #  2 → #154 "其实这也要从数据结构讲起"
            (8.267, 11.033),   #  3 → #155 "矢量数据存储的是顶点坐标"
            (11.533, 13.567),  #  4 → #156 "而栅格数据的头文件中"
            (13.633, 15.533),  #  5 → #157 "存储的是以下几个数据"
            (16.233, 16.567),  #  6 → #158 "第一个"
            (16.567, 19.400),  #  7 → #159 "是左上角像元的实际地理坐标"
            (19.933, 22.467),  #  8 → #160 "然后是像元在x方向上的宽度"
            (22.833, 24.300),  #  9 → #161 "在y方向上的宽度"
            (24.867, 25.600),  # 10 → #162 "行列数"
            (25.833, 27.433),  # 11 → #163 "以及一个旋转参数"
            (28.333, 29.200),  # 12 → #164 "也就是说"
            (29.233, 30.233),  # 13 → #165 "栅格数据"
            (30.233, 33.067),  # 14 → #166 "根本不存每个像素的地理坐标"
            (33.400, 35.333),  # 15 → #167 "而是通过左上角的坐标"
            (35.600, 36.433),  # 16 → #168 "再加上x"
            (36.433, 39.533),  # 17 → #169 "y方向各自的宽度和行列数"
            (39.600, 41.367),  # 18 → #170 "推算出所有格子的坐标"
            (42.267, 43.967),  # 19 → #171 "当我们把这个格网"
            (43.967, 47.167),  # 20 → #172 "从坐标系a投影到坐标系b的时候"
            (47.633, 49.567),  # 21 → #173 "由于地球表面的曲率变化"
            (49.667, 51.233),  # 22 → #174 "原本的正方形格子"
            (51.400, 54.567),  # 23 → #175 "在新的坐标系下会发生扭曲拉伸"
            (54.700, 55.633),  # 24 → #176 "甚至旋转"
            (56.300, 58.567),  # 25 → #177 "如果强行用矢量的公式去算"
            (58.800, 60.600),  # 26 → #178 "原本正方形的像素格子"
            (60.800, 63.067),  # 27 → #179 "就会变成倾斜的平行四边形"
            (63.300, 64.667),  # 28 → #180 "或者不规则的四边形"
            (65.267, 67.700),  # 29 → #181 "可是 栅格数据的底层结构"
            (68.000, 70.167),  # 30 → #182 "只是横平竖直的行列矩阵而已"
            (70.467, 73.033),  # 31 → #183 "计算机没有办法存储一副格子"
            (73.033, 75.233),  # 32 → #184 "全部都是歪着的栅格图像"
            (75.367, 76.767),  # 33 → #185 "为了解决这个矛盾"
            (76.967, 78.267),  # 34 → #186 "投影栅格工具"
            (78.367, 80.233),  # 35 → #187 "必须使出它的核心大招"
            (80.633, 81.500),  # 36 → #188 "重采样"
            (82.433, 83.900),  # 37 → #189 "他的逻辑非常聪明"
            (84.367, 85.867),  # 38 → #190 "既然旧格子扭曲了"
            (86.167, 87.767),  # 39 → #191 "那我就根本不去动它"
            (88.300, 90.200),  # 40 → #192 "而是直接在新的坐标系下"
            (90.233, 93.467),  # 41 → #193 "铺好一张横平竖直的新的空白网格"
            (94.300, 95.033),  # 42 → #194 "接着"
            (95.033, 97.400),  # 43 → #195 "he拿着新网格里的每一个格子"
            (97.500, 99.367),  # 44 → #196 "反算回老坐标系中"
            (99.800, 102.067), # 45 → #197 "看看这个时候他在什么位置"
            (103.033, 105.667),# 46 → #198 "既然新旧格子不可能完美重合"
            (106.000, 106.867),# 47 → #199 "新格子"
            (107.000, 110.000),# 48 → #200 "多半会尴尬的跨在几个旧格子之间"
            (110.767, 113.400),# 49 → #201 "这个时候就需要使用插值算法"
            (113.967, 115.867),# 50 → #202 "把这几个旧格子的数值"
            (115.900, 117.567),# 51 → #203 "按规则融合一下"
            (117.767, 121.267),# 52 → #204 "算出一个全新的像素值填进新格子里"
            (121.800, 123.633),# 53 → #205 "这就是重采样的本质"
            (123.967, 125.900),# 54 → #206 "也是投影栅格的一个特性"
        ]

        # ═══ Timing Helpers ═══
        self.elapsed = 0.0

        def wait_to(t):
            """Advance clock to time t."""
            if t > self.elapsed:
                self.wait(t - self.elapsed)
                self.elapsed = t

        def play_to(t, *anims, rf=smooth):
            """Play animations, finishing at time t."""
            rt = max(0.05, t - self.elapsed)
            if anims:
                self.play(*anims, run_time=rt, rate_func=rf)
            else:
                self.wait(rt)
            self.elapsed = t

        def cue(i):
            """Jump to start time of subtitle index i."""
            wait_to(S[i][0])

        # ═══ Grid Builder ═══
        DEM_PALETTE = [GREEN, TEAL, BLUE, AMBER, RED]
        HEIGHTS = [
            [0, 0, 1, 2, 2],
            [0, 1, 2, 3, 3],
            [1, 2, 3, 4, 4],
            [2, 3, 4, 4, 3],
            [2, 2, 3, 3, 2],
        ]

        # HEIGHTS_B represents the resampled (interpolated) height values in coordinate system B.
        # They are slightly different (smoothed/shifted) compared to System A due to interpolation.
        HEIGHTS_B = [
            [0, 1, 1, 2, 2],
            [1, 1, 2, 3, 3],
            [1, 2, 2, 4, 4],
            [2, 3, 3, 3, 3],
            [2, 2, 3, 2, 2],
        ]

        def make_grid(sz=0.55, rows=5, cols=5, opacity=0.75, show_border=True):
            """Create a DEM-colored raster grid."""
            g = VGroup()
            for r in range(rows):
                for c in range(cols):
                    val = HEIGHTS[r % 5][c % 5]
                    sq = Square(
                        side_length=sz,
                        stroke_color=BORDER if show_border else NONE,
                        stroke_width=1.2 if show_border else 0,
                        fill_color=DEM_PALETTE[val],
                        fill_opacity=opacity,
                    )
                    sq.move_to(np.array([
                        (c - cols / 2 + 0.5) * sz,
                        (rows / 2 - r - 0.5) * sz,
                        0.0,
                    ]))
                    g.add(sq)
            return g

        def make_empty_grid(sz=0.55, rows=5, cols=5):
            """Create an empty grid with transparent cells."""
            g = VGroup()
            for r in range(rows):
                for c in range(cols):
                    sq = Square(
                        side_length=sz,
                        stroke_color=BLUE,
                        stroke_width=1.0,
                        fill_color=BLUE,
                        fill_opacity=0.06,
                    )
                    sq.move_to(np.array([
                        (c - cols / 2 + 0.5) * sz,
                        (rows / 2 - r - 0.5) * sz,
                        0.0,
                    ]))
                    g.add(sq)
            return g

        # ═══ Section Title Helper ═══
        def section_title(title, accent=SAGE):
            ti = Text(title, font_size=38, color=INK, font=CH_FONT, weight=BOLD)
            rule = Line(LEFT * 1.5, RIGHT * 1.5,
                        stroke_color=accent, stroke_width=1.5, stroke_opacity=0.45)
            grp = VGroup(ti, rule).arrange(DOWN, buff=0.2)
            grp.to_edge(UP, buff=0.6)
            return grp

        # ════════════════════════════════════════════════════════════
        #  INTRO: Sub #152–#153 (0s → ~5s)
        #  No titles or question texts shown to leave background clear for transitions.
        # ════════════════════════════════════════════════════════════

        cue(0)
        wait_to(S[2][0])

        # ════════════════════════════════════════════════════════════
        #  ACT I: 数据结构讲解 (Sub #154–#170)
        # ════════════════════════════════════════════════════════════

        # ── Beat 1: Sub #154 — Section Title ──
        sec1 = section_title("数据结构差异", SAGE)
        play_to(S[2][0] + 1.0,
                Write(sec1[0]),
                Create(sec1[1]),
                )

        # ── Beat 2: Sub #155 — 矢量数据 = 顶点坐标 ──
        cue(3)

        # Vector card (left)
        v_card = RoundedRectangle(
            corner_radius=0.12, height=3.6, width=4.0,
            stroke_color=BORDER, fill_color=CARD, fill_opacity=0.92, stroke_width=1.5,
        ).shift(LEFT * 3.2 + DOWN * 0.5)
        v_badge = Text("矢量数据", font_size=18, color=TEAL,
                       weight=BOLD, font=CH_FONT).align_to(v_card, UL).shift(RIGHT * 0.35 + DOWN * 0.28)
        v_sub = Text("存储：顶点坐标序列", font_size=13, color=MUTED,
                     font=CH_FONT).next_to(v_badge, DOWN, aligned_edge=LEFT, buff=0.08)

        # Polygon
        vc = LEFT * 3.2 + DOWN * 0.85
        poly = Polygon(
            vc + np.array([-0.9, 0.45, 0]),
            vc + np.array([ 0.9, 0.6, 0]),
            vc + np.array([ 0.65, -0.65, 0]),
            vc + np.array([-0.7, -0.75, 0]),
            stroke_color=TEAL, stroke_width=2.5,
            fill_color=TEAL, fill_opacity=0.10,
        )
        verts = poly.get_vertices()
        v_dots = VGroup(*[Dot(v, color=RED, radius=0.06, z_index=5) for v in verts])
        v_lbls = VGroup(*[
            MathTex(rf"v_{{{i}}}", font_size=15, color=INK
                    ).next_to(verts[i], UR, buff=0.06)
            for i in range(len(verts))
        ])
        v_all = VGroup(v_card, v_badge, v_sub, poly, v_dots, v_lbls)

        # Raster preview card (right)
        r_card_p = RoundedRectangle(
            corner_radius=0.12, height=3.6, width=4.0,
            stroke_color=BORDER, fill_color=CARD, fill_opacity=0.92, stroke_width=1.5,
        ).shift(RIGHT * 3.2 + DOWN * 0.5)
        r_badge_p = Text("栅格数据", font_size=18, color=AMBER,
                         weight=BOLD, font=CH_FONT).align_to(r_card_p, UL).shift(RIGHT * 0.35 + DOWN * 0.28)
        r_sub_p = Text("存储：像元阵列与文件头", font_size=13, color=MUTED,
                       font=CH_FONT).next_to(r_badge_p, DOWN, aligned_edge=LEFT, buff=0.08)
        r_mini = make_grid(sz=0.38, rows=4, cols=4, opacity=0.6
                           ).move_to(RIGHT * 3.2 + DOWN * 1.05)
        r_all_p = VGroup(r_card_p, r_badge_p, r_sub_p, r_mini)

        # Staggered entry
        play_to(S[3][0] + 0.7,
                FadeIn(v_card, shift=UP * 0.15),
                FadeIn(v_badge), FadeIn(v_sub),
                DrawBorderThenFill(poly),
                FadeIn(r_card_p, shift=UP * 0.15),
                FadeIn(r_badge_p), FadeIn(r_sub_p),
                FadeIn(r_mini, shift=UP * 0.12),
                )

        # Vertex dots appear one by one
        play_to(S[3][0] + 1.8,
                LaggedStart(
                    *[GrowFromCenter(d) for d in v_dots], lag_ratio=0.25),
                LaggedStart(
                    *[FadeIn(l, shift=RIGHT * 0.08) for l in v_lbls], lag_ratio=0.25),
                )

        # Pulse vertices
        play_to(S[3][1],
                *[Indicate(d, color=AMBER, scale_factor=1.4) for d in v_dots],
                )

        # ── Beat 3: Sub #156–#157 — Transition to raster header detail ──
        cue(4)

        # Build raster grid (left) and header card (right)
        r_grid = make_grid(sz=0.55, rows=5, cols=5).shift(LEFT * 3.3 + DOWN * 0.55)

        h_card = RoundedRectangle(
            corner_radius=0.10, height=5.2, width=5.0,
            stroke_color=BORDER, fill_color=CARD2, fill_opacity=0.96, stroke_width=1.5,
        ).shift(RIGHT * 2.8 + DOWN * 0.20)
        h_title = Text("文件头参数（以Esri ASCII为例）", font_size=15, color=TEAL,
                       weight=BOLD, font=CH_FONT).align_to(h_card, UL).shift(RIGHT * 0.35 + DOWN * 0.32)
        h_rule = Line(
            h_card.get_left() + RIGHT * 0.3 + UP * 1.85,
            h_card.get_right() + LEFT * 0.3 + UP * 1.85,
            stroke_color=BORDER, stroke_width=1, stroke_opacity=0.4,
        )

        # 5 parameter lines aligned using horizontal arrangement helper
        def make_param_line(num_str, label_str, math_str, color=INK):
            num_t = Text(num_str, font_size=14, color=color, font=CH_FONT)
            lbl_t = Text(label_str, font_size=14, color=color, font=CH_FONT)
            math_t = MathTex(math_str, font_size=15, color=color)
            return VGroup(num_t, lbl_t, math_t).arrange(RIGHT, buff=0.15)

        param_1 = make_param_line("1.", "原点坐标", "(X_0, Y_0)")
        param_2 = make_param_line("2.", "像元宽度", "dx = 30")
        param_3 = make_param_line("3.", "像元高度", "dy = 30")
        param_4 = make_param_line("4.", "行  列  数", "5 \\times 5")
        param_5 = make_param_line("5.", "NoData值", "-9999")

        params = VGroup(param_1, param_2, param_3, param_4, param_5).arrange(DOWN, aligned_edge=LEFT, buff=0.22)
        params.next_to(h_rule, DOWN, buff=0.20).align_to(h_card, LEFT).shift(RIGHT * 0.4)

        header_grp = VGroup(h_card, h_title, h_rule, params)

        # Cross-fade transition
        play_to(S[4][0] + 1.0,
                FadeOut(v_all, shift=LEFT * 0.25),
                FadeOut(r_all_p, shift=RIGHT * 0.25),
                )
        play_to(S[5][0] + 0.5,
                FadeIn(r_grid, shift=LEFT * 0.15),
                FadeIn(header_grp, shift=RIGHT * 0.15),
                )

        # ── Beat 4: Sub #158–#159 — Origin (X₀, Y₀) ──
        cue(6)

        origin_cell = r_grid[0]
        origin_dot = Dot(origin_cell.get_corner(UL), color=RED, radius=0.08, z_index=5)
        origin_lbl = MathTex(r"(X_0, Y_0)", font_size=18, color=RED
                             ).next_to(origin_dot, UL, buff=0.08)
        origin_ring = Circle(
            radius=0.18, stroke_color=RED, stroke_width=2.0, stroke_opacity=0.55,
        ).move_to(origin_dot.get_center())

        play_to(S[7][0] + 0.8,
                GrowFromCenter(origin_dot),
                FadeIn(origin_lbl, shift=UL * 0.08),
                Create(origin_ring),
                params[0].animate.set_color(RED),
                )

        # Expanding ring pulse
        play_to(S[7][1],
                origin_ring.animate.scale(1.6).set_opacity(0),
                )

        # ── Beat 5: Sub #160 — dx (x方向宽度) ──
        cue(8)

        top_left = origin_cell.get_corner(UL)
        top_right = origin_cell.get_corner(UR)
        dx_arrow = DoubleArrow(
            top_left + UP * 0.18, top_right + UP * 0.18,
            color=BLUE, stroke_width=2.5, tip_length=0.10,
        )
        dx_lbl = MathTex(r"dx", font_size=18, color=BLUE
                         ).next_to(dx_arrow, UP, buff=0.04)

        play_to(S[8][0] + 1.2,
                GrowArrow(dx_arrow),
                FadeIn(dx_lbl, shift=UP * 0.08),
                params[1].animate.set_color(BLUE),
                )
        wait_to(S[8][1])

        # ── Beat 6: Sub #161 — dy (y方向宽度) ──
        cue(9)

        bot_left = origin_cell.get_corner(DL)
        dy_arrow = DoubleArrow(
            top_left + LEFT * 0.18, bot_left + LEFT * 0.18,
            color=AMBER, stroke_width=2.5, tip_length=0.10,
        )
        dy_lbl = MathTex(r"dy", font_size=18, color=AMBER
                         ).next_to(dy_arrow, LEFT, buff=0.04)

        play_to(S[9][0] + 0.8,
                GrowArrow(dy_arrow),
                FadeIn(dy_lbl, shift=LEFT * 0.08),
                params[2].animate.set_color(AMBER),
                )
        wait_to(S[9][1])

        # ── Beat 7: Sub #162 — 行列数 ──
        cue(10)

        dim_badge_bg = RoundedRectangle(
            corner_radius=0.06, height=0.36, width=0.65,
            stroke_color=GREEN, fill_color=GREEN, fill_opacity=0.10, stroke_width=1,
        )
        dim_badge_txt = MathTex(r"5 \times 5", font_size=15, color=GREEN)
        dim_badge = VGroup(dim_badge_bg, dim_badge_txt
                           ).move_to(r_grid.get_corner(DR) + RIGHT * 0.5 + DOWN * 0.1)
        dim_badge_txt.move_to(dim_badge_bg.get_center())

        play_to(S[10][1],
                FadeIn(dim_badge, shift=DOWN * 0.08),
                params[3].animate.set_color(GREEN),
                )

        # ── Beat 8: Sub #163 — NoData值 ──
        cue(11)

        nodata_cell = r_grid[24]  # Bottom-right corner cell representing NoData
        nodata_box = DashedVMobject(
            Square(side_length=0.55, stroke_color=TEAL, stroke_width=2.5),
            num_dashes=12,
        ).move_to(nodata_cell.get_center())
        nodata_lbl = MathTex(r"-9999", font_size=15, color=TEAL
                             ).next_to(nodata_box, RIGHT, buff=0.15)

        play_to(S[11][1],
                Create(nodata_box),
                FadeIn(nodata_lbl, shift=RIGHT * 0.06),
                nodata_cell.animate.set_fill(color="#CCCCCC", opacity=0.45),
                params[4].animate.set_color(TEAL),
                )

        # ── Beat 9: Sub #164–#166 — 不存每个像素坐标 → 公式 ──
        cue(12)

        annotations_1 = VGroup(
            origin_dot, origin_lbl, origin_ring,
            dx_arrow, dx_lbl, dy_arrow, dy_lbl,
            dim_badge, nodata_box, nodata_lbl,
        )

        # Formula card placed inside h_card near the bottom
        f_card = RoundedRectangle(
            corner_radius=0.08, height=1.4, width=4.2,
            stroke_color=BORDER, fill_color=CARD, fill_opacity=0.92, stroke_width=1.2,
        ).move_to(h_card.get_center() + DOWN * 1.6)
        f1 = MathTex(r"X = X_0 + \text{col} \times dx", font_size=20, color=INK)
        f2 = MathTex(r"Y = Y_0 - \text{row} \times dy", font_size=20, color=INK)
        f_txts = VGroup(f1, f2).arrange(DOWN, buff=0.15).move_to(f_card.get_center())
        formula_grp = VGroup(f_card, f_txts)

        # Fade annotations, reveal formula
        play_to(S[13][0],
                FadeOut(annotations_1),
                )
        play_to(S[14][0] + 0.5,
                FadeIn(f_card, shift=UP * 0.12),
                Write(f1),
                Write(f2),
                )

        # ── Beat 10: Sub #167–#169 — 扫描推算坐标 ──
        cue(15)

        scan = Line(
            r_grid.get_left() + LEFT * 0.08, r_grid.get_right() + RIGHT * 0.08,
            color=TEAL, stroke_width=3,
        ).move_to(r_grid.get_top())

        play_to(S[15][0] + 0.4, FadeIn(scan))

        # Row-by-row sweep with cells flashing
        row_flashes = []
        for row in range(5):
            cells = VGroup(*[r_grid[row * 5 + c] for c in range(5)])
            row_flashes.append(cells.animate.set_fill(opacity=0.95))

        play_to(S[17][1],
                scan.animate.move_to(r_grid.get_bottom() + DOWN * 0.08),
                LaggedStart(*row_flashes, lag_ratio=0.6),
                rf=linear,
                )

        # ── Beat 11: Sub #170 — 推算出所有格子的坐标 ──
        cue(18)

        # Flash all cells then clean up annotations
        play_to(S[18][0] + 0.6,
                FadeOut(scan),
                *[Indicate(r_grid[i], color=AMBER, scale_factor=1.02)
                  for i in range(0, 25, 5)],
                )

        # Clean stage for Act II
        play_to(S[18][1],
                FadeOut(sec1, shift=UP * 0.2),
                FadeOut(header_grp, shift=RIGHT * 0.3),
                FadeOut(formula_grp, shift=RIGHT * 0.3),
                r_grid.animate.move_to(ORIGIN + DOWN * 0.3).scale(1.1),
                )

        # ════════════════════════════════════════════════════════════
        #  ACT II: 扭曲困境 (Sub #171–#188)
        # ════════════════════════════════════════════════════════════

        # ── Beat 12: Sub #171–#172 — 从坐标系A投影到坐标系B ──
        cue(19)

        sec2 = section_title("投影栅格", BLUE)
        play_to(S[19][0] + 0.6,
                FadeIn(sec2, shift=DOWN * 0.12),
                )

        # Labels for source/target systems
        lbl_a = Text("坐标系 A", font_size=14, color=MUTED, font=CH_FONT
                     ).next_to(r_grid, UP, buff=0.2)
        play_to(S[19][1],
                r_grid.animate.shift(LEFT * 2.2).scale(0.85),
                FadeIn(lbl_a),
                )

        # Reposition label after grid moved
        lbl_a.next_to(r_grid, UP, buff=0.2)

        # Target frame (right side, dashed)
        tgt_frame = DashedVMobject(
            RoundedRectangle(
                corner_radius=0.08, height=3.2, width=3.2,
                stroke_color=BLUE, stroke_width=2,
            ),
            num_dashes=30,
        ).shift(RIGHT * 3.0 + DOWN * 0.3)
        lbl_b = Text("坐标系 B", font_size=14, color=BLUE, font=CH_FONT
                     ).next_to(tgt_frame, UP, buff=0.2)

        proj_arrow = Arrow(
            r_grid.get_right() + RIGHT * 0.2,
            tgt_frame.get_left() + LEFT * 0.2,
            color=AMBER, stroke_width=2.5, tip_length=0.12,
        )
        proj_lbl = Text("投影", font_size=14, color=AMBER, font=CH_FONT
                        ).next_to(proj_arrow, UP, buff=0.06)

        cue(20)
        play_to(S[20][0] + 1.5,
                Create(tgt_frame),
                FadeIn(lbl_b),
                GrowArrow(proj_arrow),
                FadeIn(proj_lbl),
                )

        # ── Beat 13: Sub #173–#174 — Warp begins ──
        cue(21)

        # We construct a curved warped grid using the極坐标 projection function map_projection_warp
        # To show the curved grid in the target area, we copy r_grid and apply our projection function
        warped = r_grid.copy()
        warped.move_to(RIGHT * 3.0 + DOWN * 0.3)

        self.add(warped)
        self.remove(tgt_frame)

        # Animate the warp using our curved projection mapping (replacing the old shear matrix)
        # This completely resolves the "skew parallelogram blocking text/ugly" issue
        play_to(S[23][0],
                warped.animate.apply_function(self.map_projection_warp),
                FadeOut(tgt_frame),
                )

        # Color shift to warning tones
        play_to(S[23][1],
                *[warped[i].animate.set_stroke(RED, width=1.5)
                  for i in range(25)],
                )

        # ── Beat 14: Sub #175–#176 — 扭曲拉伸甚至旋转 ──
        cue(24)
        rot_arrow_deco = Arc(
            radius=0.6, start_angle=PI / 6, angle=PI / 2,
            arc_center=warped.get_center(),
            stroke_color=RED, stroke_width=2.5,
        )
        rot_arrow_deco.add_tip(tip_length=0.12)
        play_to(S[24][1],
                Create(rot_arrow_deco),
                )
        play_to(S[24][1] + 0.3, FadeOut(rot_arrow_deco))

        # ── Beat 15: Sub #177–#179 — Red cross: invalid result ──
        cue(25)

        cross_mark = Cross(warped, stroke_color=RED, stroke_width=4)

        play_to(S[25][1],
                FadeOut(proj_arrow), FadeOut(proj_lbl),
                )

        cue(26)
        # Curved cells label replaces parallelogram label (no more ugly skew parallelogram)
        para_lbl = Text("网格发生曲变", font_size=14, color=RED, font=CH_FONT
                        ).next_to(warped, DOWN, buff=0.25)
        play_to(S[27][0],
                Create(cross_mark),
                FadeIn(para_lbl, shift=UP * 0.08),
                )

        # ── Beat 16: Sub #180 — 不规则四边形 ──
        cue(28)
        irreg_lbl = Text("像元变形拉伸", font_size=14, color=RED, font=CH_FONT
                         ).next_to(para_lbl, DOWN, buff=0.1)
        play_to(S[28][1],
                FadeIn(irreg_lbl, shift=UP * 0.06),
                )

        # ── Beat 17: Sub #181–#182 — 栅格底层结构 = 规则矩阵 ──
        cue(29)

        # Clear old labels and grids on left side to clear stage for side-by-side contrast
        # Form group to animate moving warped grid to the left side
        warped_grp = VGroup(warped, cross_mark, para_lbl, irreg_lbl)

        # Side-by-side layout: Curved Grid (left) vs Clean Grid (right, green border)
        # Positioned UP * 0.2 to avoid overlap with the bottom warning card
        clean_matrix = make_grid(sz=0.45, rows=4, cols=4, opacity=0.3
                                 ).move_to(RIGHT * 3.0 + UP * 0.2)
        clean_border = SurroundingRectangle(
            clean_matrix, color=GREEN, buff=0.08, stroke_width=2,
        )
        clean_lbl = Text("横平竖直的行列矩阵", font_size=14, color=GREEN, font=CH_FONT
                         ).next_to(clean_border, UP, buff=0.15)

        # Warning card
        warn_card = RoundedRectangle(
            corner_radius=0.08, height=1.4, width=6.5,
            stroke_color=RED, fill_color=CARD, fill_opacity=0.96, stroke_width=1.8,
        ).move_to(DOWN * 2.2)
        warn_title = Text("存储矛盾", font_size=18, color=RED, weight=BOLD, font=CH_FONT
                          ).align_to(warn_card, UL).shift(RIGHT * 0.35 + DOWN * 0.2)
        warn_body = Text(
            "栅格数据只能以横平竖直的矩阵存储\n计算机无法保存弯曲或倾斜的网格",
            font_size=13, color=INK, font=CH_FONT, line_spacing=1.4,
        ).next_to(warn_title, DOWN, aligned_edge=LEFT, buff=0.1)
        warn_grp = VGroup(warn_card, warn_title, warn_body)

        play_to(S[29][1],
                FadeOut(r_grid), FadeOut(lbl_a), FadeOut(lbl_b),
                warped_grp.animate.move_to(LEFT * 3.0 + UP * 0.2).scale(0.9),
                FadeIn(clean_matrix, shift=DOWN * 0.12),
                Create(clean_border),
                FadeIn(clean_lbl),
                )

        # ── Beat 18: Sub #183–#184 — 无法存储歪斜图像 ──
        cue(30)
        play_to(S[30][1],
                FadeIn(warn_grp, shift=UP * 0.15),
                )

        # Hold for emphasis
        wait_to(S[32][1] - 0.8)

        # ── Beat 19: Sub #185–#188 — 重采样 hero title ──
        cue(33)

        # Clean ALL Act II elements
        act2_cleanup = VGroup(
            sec2, warped_grp, clean_matrix, clean_border,
            clean_lbl, warn_grp,
        )

        play_to(S[33][1],
                FadeOut(act2_cleanup, shift=DOWN * 0.2),
                )

        # Big "重采样" hero title
        hero_title = Text("重采样", font_size=72, color=INK, font=CH_FONT)
        hero_rule_l = Line(LEFT * 2.5, LEFT * 0.8,
                           stroke_color=AMBER, stroke_width=2, stroke_opacity=0.5)
        hero_rule_r = Line(RIGHT * 0.8, RIGHT * 2.5,
                           stroke_color=AMBER, stroke_width=2, stroke_opacity=0.5)
        hero_rules = VGroup(hero_rule_l, hero_rule_r)

        hero_grp = VGroup(hero_title)
        hero_grp.move_to(ORIGIN)
        hero_rules.move_to(hero_title.get_center())

        # Decorative diamonds
        d1 = Square(side_length=0.07, fill_color=AMBER, fill_opacity=0.35,
                     stroke_width=0).rotate(45 * DEGREES).move_to(hero_rule_l.get_left() + LEFT * 0.15)
        d2 = Square(side_length=0.07, fill_color=AMBER, fill_opacity=0.35,
                     stroke_width=0).rotate(45 * DEGREES).move_to(hero_rule_r.get_right() + RIGHT * 0.15)

        cue(34)
        play_to(S[36][1],
                Write(hero_title),
                Create(hero_rule_l), Create(hero_rule_r),
                FadeIn(d1), FadeIn(d2),
                )

        # Hold hero title
        wait_to(S[37][0] - 0.3)

        # Fade hero for Act III
        hero_all = VGroup(hero_grp, hero_rules, d1, d2)
        play_to(S[37][0],
                hero_all.animate.shift(UP * 3.0).set_opacity(0),
                )
        self.remove(hero_all)

        # ════════════════════════════════════════════════════════════
        #  ACT III: 重采样本质 (Sub #189–#206)
        # ════════════════════════════════════════════════════════════

        sec3 = section_title("重采样机制", AMBER)

        # ── Beat 20: Sub #189–#190 — 旧网格留在原地不去动它 ──
        cue(37)
        play_to(S[37][0] + 0.5, FadeIn(sec3, shift=DOWN * 0.12))

        # Left side: original straight raster grid (System A) — "不去动它"
        # Using a clean regular straight grid as requested by the user
        src_grid = make_grid(sz=0.5, rows=5, cols=5).shift(LEFT * 3.3 + DOWN * 0.5)
        src_lbl = Text("坐标系 A", font_size=14, color=MUTED, font=CH_FONT
                        ).next_to(src_grid, UP, buff=0.2)

        cue(38)
        play_to(S[38][1],
                FadeIn(src_grid, shift=LEFT * 0.15),
                FadeIn(src_lbl),
                )

        # ── Beat 21: Sub #191 — 保持原状不去动它 ──
        cue(39)
        stay_lbl = Text("保持原状", font_size=14, color=TEAL, font=CH_FONT
                        ).next_to(src_grid, DOWN, buff=0.15)
        play_to(S[39][1], FadeIn(stay_lbl, shift=UP * 0.06))
        play_to(S[39][1] + 0.3, FadeOut(stay_lbl))

        # ── Beat 22: Sub #192–#193 — 新坐标系B下铺设正规空白网格 ──
        cue(40)

        # Right side: regular blank grid (System B)
        tgt_grid = make_empty_grid(sz=0.5, rows=5, cols=5
                                   ).shift(RIGHT * 3.3 + DOWN * 0.5)
        tgt_lbl = Text("坐标系 B", font_size=14, color=BLUE, font=CH_FONT
                        ).next_to(tgt_grid, UP, buff=0.2)

        # Row-by-row staggered reveal
        tgt_rows = []
        for row in range(5):
            row_cells = VGroup(*[tgt_grid[row * 5 + c] for c in range(5)])
            tgt_rows.append(FadeIn(row_cells, shift=DOWN * 0.1))

        play_to(S[40][1],
                FadeIn(tgt_lbl),
                )
        play_to(S[41][1],
                LaggedStart(*tgt_rows, lag_ratio=0.35),
                )

        # ── Beat 23: Sub #194–#196 — 反算回老坐标系 ──
        cue(42)

        demo_idx = 12  # Cell (2, 2) in target grid B
        tgt_cell = tgt_grid[demo_idx]

        # Highlight target cell in System B
        play_to(S[43][0] + 0.5,
                tgt_cell.animate.set_stroke(BLUE, width=3).set_fill(BLUE, opacity=0.25),
                )

        # Create a flying representation of the target cell.
        # It starts as a straight square in System B, but will warp dynamically during reverse projection.
        flying_cell = Square(
            side_length=0.5, stroke_color=BLUE, stroke_width=2.5,
            fill_color=BLUE, fill_opacity=0.3,
        ).move_to(tgt_cell.get_center())

        # Map back to old coordinate system A
        # The landing point in A is slightly offset from the grid lines to show overlap
        src_map_pos = src_grid[12].get_center() + UP * 0.12 + RIGHT * 0.10

        # Curved arrow showing direction of reverse calculation
        arc_arrow = CurvedArrow(
            tgt_cell.get_center(), src_map_pos,
            color=AMBER, stroke_width=2.5, tip_length=0.12,
            angle=-TAU / 4,
        )

        # Build curved text "逆向反算" characters along the path of arc_arrow (read left-to-right)
        char_labels = ["算", "反", "向", "逆"]
        proportions = [0.38, 0.46, 0.54, 0.62]
        arc_lbls = VGroup()
        for char, prop in zip(char_labels, proportions):
            pt = arc_arrow.point_from_proportion(prop)
            eps = 0.01
            pt1 = arc_arrow.point_from_proportion(max(0.0, prop - eps))
            pt2 = arc_arrow.point_from_proportion(min(1.0, prop + eps))
            tangent = pt2 - pt1
            angle = np.arctan2(tangent[1], tangent[0])
            if np.cos(angle) < 0:
                angle += PI
            t_obj = Text(char, font=CH_FONT, font_size=14, color=AMBER)
            t_obj.rotate(angle)
            t_obj.move_to(pt + UP * 0.28) # Placed slightly above the curve
            arc_lbls.add(t_obj)

        # Create a flying representation of the target cell.
        flying_cell = Square(
            side_length=0.5, stroke_color=BLUE, stroke_width=2.5,
            fill_color=BLUE, fill_opacity=0.3,
        ).move_to(tgt_cell.get_center())

        # Target warped cell which will be exactly centered at src_map_pos
        # We warp first then move to prevent shifting due to global transform center
        target_warped_cell = Square(
            side_length=0.5, stroke_color=BLUE, stroke_width=2.5,
            fill_color=BLUE, fill_opacity=0.3,
        ).apply_function(self.map_projection_warp).move_to(src_map_pos)

        cue(44)
        # Animate the cell flying back and warping smoothly using Transform
        self.add(flying_cell)
        play_to(S[44][1],
                Create(arc_arrow),
                FadeIn(arc_lbls, lag_ratio=0.18),
                Transform(flying_cell, target_warped_cell),
                )

        # ── Beat 24: Sub #197 — 看看在什么位置 (Landing position) ──
        cue(45)

        landing_dot = Dot(src_map_pos, color=AMBER, radius=0.08, z_index=5)
        landing_ring = Circle(
            radius=0.15, stroke_color=AMBER, stroke_width=2, stroke_opacity=0.5,
        ).move_to(src_map_pos)

        play_to(S[45][1],
                GrowFromCenter(landing_dot),
                Create(landing_ring),
                landing_ring.animate.scale(1.5).set_opacity(0),
                )

        # ── Beat 25: Sub #198–#200 — 跨在几个旧格子之间 (Overlap analysis) ──
        # Underneath the warped flying_cell, we highlight the 4 overlapping cells in src_grid (System A)
        cue(46)

        overlap_idxs = [7, 8, 12, 13]
        neighbor_anims = [
            src_grid[idx].animate.set_stroke(AMBER, width=2.5).set_fill(opacity=0.95)
            for idx in overlap_idxs
        ]

        n_vals = ["10", "15", "12", "8"]
        n_labels = VGroup(*[
            MathTex(v, font_size=16, color=INK).move_to(src_grid[idx].get_center())
            for idx, v in zip(overlap_idxs, n_vals)
        ])

        play_to(S[46][1],
                *neighbor_anims,
                )

        cue(47)
        play_to(S[48][0] + 0.8,
                FadeIn(n_labels, lag_ratio=0.2),
                )

        # ── Beat 26: Sub #201–#203 — 插值算法 ──
        cue(49)

        # Interpolation formula placed at the top (UP * 1.8)
        interp_lbl = Text("插值计算：", font_size=18, color=AMBER, font=CH_FONT)
        interp_math = MathTex(
            r"10 \times w_1 + 15 \times w_2 + 12 \times w_3 + 8 \times w_4 = 11.8",
            font_size=20, color=INK,
        )
        formula_lbl = VGroup(interp_lbl, interp_math).arrange(RIGHT, buff=0.15).move_to(UP * 1.8)

        # Entering with FadeIn on text + Write on math formula
        play_to(S[49][1],
                FadeIn(interp_lbl, shift=UP * 0.08),
                Write(interp_math),
                )

        # ── Beat 27: Sub #202–#203 — 粒子汇聚融合 ──
        cue(50)

        particles = VGroup(*[
            Dot(src_grid[idx].get_center(), color=AMBER, radius=0.06, z_index=10)
            for idx in overlap_idxs
        ])
        self.add(particles)

        play_to(S[51][0],
                *[p.animate.move_to(landing_dot.get_center()) for p in particles],
                )
        play_to(S[51][1],
                FadeOut(particles),
                landing_dot.animate.scale(1.6).set_color(GREEN),
                )

        # ── Beat 28: Sub #204 — 填进新格子里 ──
        cue(52)

        # Result particle flies back to target grid cell in System B
        res_dot = Dot(landing_dot.get_center(), color=GREEN, radius=0.08, z_index=10)
        self.add(res_dot)

        play_to(S[52][0] + 1.2,
                res_dot.animate.move_to(tgt_cell.get_center()),
                FadeOut(arc_arrow),
                FadeOut(arc_lbls),
                FadeOut(flying_cell),
                )

        # Fill the demo cell in B using the resampled value from HEIGHTS_B (value is 2 -> BLUE)
        val_demo = HEIGHTS_B[2][2]
        demo_fill_color = DEM_PALETTE[val_demo]
        play_to(S[52][0] + 2.0,
                tgt_cell.animate.set_fill(demo_fill_color, opacity=0.85
                                          ).set_stroke(BORDER, width=1),
                FadeOut(res_dot),
                FadeOut(landing_dot),
                FadeOut(landing_ring),
                FadeOut(n_labels),
                FadeOut(formula_lbl),
                *[src_grid[idx].animate.set_stroke(BORDER, width=1.2).set_fill(opacity=0.75)
                  for idx in overlap_idxs],
                )

        # Quick sweep to fill ALL remaining cells in System B row-by-row (top-to-bottom)
        sweep = Line(
            tgt_grid.get_left() + LEFT * 0.08,
            tgt_grid.get_right() + RIGHT * 0.08,
            color=BLUE, stroke_width=2.5,
        ).move_to(tgt_grid.get_top())

        row_fill_anims = []
        for r in range(5):
            row_anims = []
            for c in range(5):
                idx = r * 5 + c
                if idx == demo_idx:
                    continue
                val_b = HEIGHTS_B[r][c]
                fc = DEM_PALETTE[val_b]
                row_anims.append(
                    tgt_grid[idx].animate.set_fill(fc, opacity=0.85
                                                    ).set_stroke(BORDER, width=1))
            if row_anims:
                row_fill_anims.append(AnimationGroup(*row_anims))

        play_to(S[52][1],
                FadeIn(sweep),
                sweep.animate.move_to(tgt_grid.get_bottom() + DOWN * 0.08),
                LaggedStart(*row_fill_anims, lag_ratio=0.5),
                rf=linear,
                )
        play_to(S[52][1] + 0.3, FadeOut(sweep))

        # ── Beat 29: Sub #205–#206 — 重采样的本质 ──
        cue(53)

        # Final summary title
        final_card = RoundedRectangle(
            corner_radius=0.08, height=1.2, width=9.0,
            stroke_color=AMBER, fill_color=CARD, fill_opacity=0.96, stroke_width=1.5,
        ).to_edge(DOWN, buff=0.5)
        final_txt = Text(
            "重采样 = 逆向投影 + 插值填充",
            font_size=26, color=INK, weight=BOLD, font=CH_FONT,
        ).move_to(final_card.get_center())
        final_grp = VGroup(final_card, final_txt)

        play_to(S[53][1],
                FadeIn(final_grp, shift=UP * 0.12),
                )

        # Hold and fade out everything
        wait_to(S[54][1] - 0.8)
        play_to(S[54][1],
                FadeOut(sec3, shift=UP * 0.15),
                FadeOut(src_grid), FadeOut(src_lbl),
                FadeOut(tgt_grid), FadeOut(tgt_lbl),
                FadeOut(final_grp, shift=DOWN * 0.15),
                )


class ProjectRasterSceneTimed(ProjectRasterScene):
    pass
