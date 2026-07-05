from manim import *
import numpy as np

class ProjectRasterScene(Scene):
    # Werner Projection Warp helper (identical warp math to srt_74_86_vertices.py)
    def warp_point(self, p, warp=False):
        if not warp:
            return p
        x, y = p[0], p[1]
        lon = x * (100.0 / 6.0) * (np.pi / 180.0)
        lat = y * (50.0 / 3.0) * (np.pi / 180.0)
        lat = np.clip(lat, -np.pi/2 + 0.05, np.pi/2 - 0.05)
        rho = np.pi/2 - lat
        if abs(rho) < 1e-6:
            E = 0.0
        else:
            E = lon * np.cos(lat) / rho
        px = rho * np.sin(E)
        py = rho * np.cos(E)
        scale = 1.95
        nx = px * scale
        ny = 2.2 - py * scale
        return np.array([nx, ny, 0])

    def make_grid_lines(self, color, warp=False):
        lines = VGroup()
        # Vertical lines (25): x from −12 to 12, step 1
        y_lo, y_hi = -4.5, 4.5
        for x in np.linspace(-12, 12, 25):
            path = VMobject(color=color, stroke_width=0.7, stroke_opacity=0.40)
            pts = [
                self.warp_point(np.array([x, y_val, 0]), warp=warp)
                for y_val in np.linspace(y_lo, y_hi, 80)
            ]
            path.set_points_as_corners(pts)
            lines.add(path)

        # Horizontal lines (9): y from −4 to 4, step 1
        for y in range(-4, 5):
            path = VMobject(color=color, stroke_width=0.7, stroke_opacity=0.40)
            pts = [
                self.warp_point(np.array([x_val, float(y), 0]), warp=warp)
                for x_val in np.linspace(-12, 12, 80)
            ]
            path.set_points_as_corners(pts)
            lines.add(path)

        return lines.set_z_index(-10)

    def make_texture(self):
        COLOR_PAPER_INK = "#1A1A1A"
        return VGroup(*[
            Dot(
                [np.random.uniform(-7, 7), np.random.uniform(-3.7, 3.7), 0],
                radius=0.006, color=COLOR_PAPER_INK,
            ).set_opacity(0.18)
            for _ in range(90)
        ]).set_z_index(-10)

    def construct(self):
        # ── Color Palette (Premium Warm Editorial Paper - Same as srt_74_86_vertices.py) ──
        COLOR_BG = "#F9F6EE"
        COLOR_TEXT = "#2C2823"
        COLOR_MUTED = "#7E7568"
        COLOR_GRID = "#E5DEC9"
        COLOR_LINE = "#D4901B"
        COLOR_TEAL = "#108B7A"
        COLOR_BLUE = "#2A65D6"
        COLOR_GREEN = "#2D8A4E"
        COLOR_RED = "#C85A48"
        COLOR_CARD = "#F0EAE1"
        COLOR_CARD_2 = "#ECE5D9"
        COLOR_BORDER = "#D3C8B7"

        self.camera.background_color = COLOR_BG
        np.random.seed(154)

        # ── Paper Grid Background & Texture ──
        geo_grid = self.make_grid_lines(COLOR_GRID, warp=False)
        texture = self.make_texture()
        self.add(geo_grid, texture)

        # ── Timings relative to sub 152 start (00:05:22,233) ──
        subtitles = [
            (0.000, 0.800, "那么"),                                 # 152
            (0.867, 4.400, "为什么栅格数据要再单独做一个投影工具呢"), # 153
            (4.967, 7.633, "其实这也要从数据结构讲起"),             # 154
            (8.267, 11.033, "矢量数据存储的是顶点坐标"),             # 155
            (11.533, 13.567, "而栅格数据的头文件中"),                 # 156
            (13.633, 15.533, "存储的是以下几个数据"),                # 157
            (16.233, 16.567, "第一个"),                             # 158
            (16.567, 19.400, "是左上角像元的实际地理坐标"),         # 159
            (19.933, 22.467, "然后是像元在x方向上的宽度"),          # 160
            (22.833, 24.300, "在y方向上的宽度"),                    # 161
            (24.867, 25.600, "行列数"),                             # 162
            (25.833, 27.433, "以及一个旋转参数"),                   # 163
            (28.333, 29.200, "也就是说"),                           # 164
            (29.233, 30.233, "栅格数据"),                           # 165
            (30.233, 33.067, "根本不存每个像素的地理坐标"),         # 166
            (33.400, 35.333, "而是通过左上角的坐标"),               # 167
            (35.600, 36.433, "再加上x"),                            # 168
            (36.433, 39.533, "y方向各自的宽度和行列数"),            # 169
            (39.600, 41.367, "推算出所有格子的坐标"),               # 170
            (42.267, 43.967, "当我们把这个格网"),                   # 171
            (43.967, 47.167, "从坐标系a投影到坐标系b的时候"),       # 172
            (47.633, 49.567, "由于地球表面的曲率变化"),             # 173
            (49.667, 51.233, "原本的正方形格子"),                   # 174
            (51.400, 54.567, "在新的坐标系下会发生扭曲拉伸"),       # 175
            (54.700, 55.633, "甚至旋转"),                           # 176
            (56.300, 58.567, "如果强行用矢量的公式去算"),           # 177
            (58.800, 60.600, "原本正方形的像素格子"),               # 178
            (60.800, 63.067, "就会变成倾斜的平行四边形"),           # 179
            (63.300, 64.667, "或者不规则的四边形"),                 # 180
            (65.267, 67.700, "可是 栅格数据的底层结构"),             # 181
            (68.000, 70.167, "只是横平竖直的行列矩阵而已"),         # 182
            (70.467, 73.033, "计算机没有办法存储一副格子"),         # 183
            (73.033, 75.233, "全部都是歪着的栅格图像"),             # 184
            (75.367, 76.767, "为了解决这个矛盾"),                   # 185
            (76.967, 78.267, "投影栅格工具"),                       # 186
            (78.367, 80.233, "必须使出它的核心大招"),               # 187
            (80.633, 81.500, "重采样"),                             # 188
            (82.433, 83.900, "他的逻辑非常聪明"),                   # 189
            (84.367, 85.867, "既然旧格子扭曲了"),                   # 190
            (86.167, 87.767, "那我就根本不去动它"),                 # 191
            (88.300, 90.200, "而是直接在新的坐标系下"),             # 192
            (90.233, 93.467, "铺好一张横平竖直的新的空白网格"),     # 193
            (94.300, 95.033, "接着"),                               # 194
            (95.033, 97.400, "he拿着新网格里的每一个格子"),         # 195
            (97.500, 99.367, "反算回老坐标系中"),                   # 196
            (99.800, 102.067, "看看这个时候他在什么位置"),           # 197
            (103.033, 105.667, "既然新旧格子不可能完美重合"),       # 198
            (106.000, 106.867, "新格子"),                           # 199
            (107.000, 110.000, "多半会尴尬的跨在几个旧格子之间"),   # 200
            (110.767, 113.400, "这个时候就需要使用插值算法"),       # 201
            (113.967, 115.867, "把这几个旧格子的数值"),             # 202
            (115.900, 117.567, "按规则融合一下"),                   # 203
            (117.767, 121.267, "算出一个全新的像素值填进新格子里"), # 204
            (121.800, 123.633, "这就是重采样的本质"),               # 205
            (123.967, 125.900, "也是投影栅格的一个特性"),           # 206
        ]

        self.elapsed = 0

        def bridge_to(t):
            if t > self.elapsed:
                self.wait(t - self.elapsed)
                self.elapsed = t

        def run_until(t, *anims, rate_func=smooth):
            runtime = max(0.05, t - self.elapsed)
            if anims:
                self.play(*anims, run_time=runtime, rate_func=rate_func)
            else:
                self.wait(runtime)
            self.elapsed = t

        def cue(i):
            bridge_to(subtitles[i][0])

        # ── Grid builder helper ──
        def get_raster_grid(size=0.5, rows=5, cols=5, fill_opacity=0.75):
            grid = VGroup()
            heights = [
                [0, 0, 1, 2, 2],
                [0, 1, 2, 3, 3],
                [1, 2, 3, 4, 4],
                [2, 3, 4, 4, 3],
                [2, 2, 3, 3, 2]
            ]
            dem_colors = [COLOR_GREEN, COLOR_TEAL, COLOR_BLUE, COLOR_LINE, COLOR_RED]
            for r in range(rows):
                for col_idx in range(cols):
                    val = heights[r][col_idx]
                    color = dem_colors[val]
                    cell = Square(
                        side_length=size,
                        stroke_color=COLOR_BORDER,
                        stroke_width=1,
                        fill_color=color,
                        fill_opacity=fill_opacity
                    )
                    x = (col_idx - cols/2 + 0.5) * size
                    y = (rows/2 - r - 0.5) * size
                    cell.move_to(np.array([x, y, 0]))
                    grid.add(cell)
            return grid

        # ─── Title Section ───
        main_title = Text("栅格数据结构与投影变换", font_size=36, color=COLOR_TEXT).shift(UP * 3.25)
        self.add(main_title)

        # ═════════════ PART 1: DATA STRUCTURE (0.000s to 41.367s) ═════════════
        cue(0)
        # Vector vs Raster comparison cards (Same styling as srt_74_86_vertices.py geometry_card)
        vector_card = RoundedRectangle(corner_radius=0.08, height=4.0, width=4.6, stroke_color=COLOR_BORDER, fill_color=COLOR_CARD, fill_opacity=0.92, stroke_width=2).shift(LEFT * 3.3 + DOWN * 0.4)
        v_title = Text("矢量数据 (Vector)", font_size=20, color=COLOR_TEXT).align_to(vector_card, UL).shift(RIGHT * 0.4 + DOWN * 0.35)
        v_desc = Text("存储顶点坐标序列", font_size=15, color=COLOR_MUTED).next_to(v_title, DOWN, aligned_edge=LEFT, buff=0.12)
        
        # Draw vector geometry
        v_c = LEFT * 3.3 + DOWN * 0.8
        poly_shape = Polygon(
            v_c + np.array([-1.2, 0.5, 0]),
            v_c + np.array([1.2, 0.8, 0]),
            v_c + np.array([0.8, -0.8, 0]),
            v_c + np.array([-0.8, -1.0, 0]),
            stroke_color=COLOR_TEAL,
            stroke_width=3,
            fill_color=COLOR_TEAL,
            fill_opacity=0.12
        )
        v_points = VGroup(*[
            Dot(pt, color=COLOR_RED, radius=0.075) for pt in poly_shape.get_vertices()
        ])
        v_labels = VGroup(*[
            MathTex(rf"v_{{ {i} }}: (x_{i}, y_{i})", font_size=15, color=COLOR_TEXT).next_to(pt, UP + RIGHT, buff=0.08)
            for i, pt in enumerate(poly_shape.get_vertices())
        ])
        vector_group = VGroup(vector_card, v_title, v_desc, poly_shape, v_points, v_labels)

        raster_card = RoundedRectangle(corner_radius=0.08, height=4.0, width=4.6, stroke_color=COLOR_BORDER, fill_color=COLOR_CARD, fill_opacity=0.92, stroke_width=2).shift(RIGHT * 3.3 + DOWN * 0.4)
        r_title = Text("栅格数据 (Raster)", font_size=20, color=COLOR_TEXT).align_to(raster_card, UL).shift(RIGHT * 0.4 + DOWN * 0.35)
        r_desc = Text("像元阵列与地理参考参数", font_size=15, color=COLOR_MUTED).next_to(r_title, DOWN, aligned_edge=LEFT, buff=0.12)
        r_grid_preview = get_raster_grid(size=0.45, rows=4, cols=4).move_to(RIGHT * 3.3 + DOWN * 1.0)
        raster_group = VGroup(raster_card, r_title, r_desc, r_grid_preview)

        # Show initial layout
        run_until(1.200, FadeIn(vector_group), FadeIn(raster_group))

        # ── Sub 155: Highlight vector vertices
        bridge_to(8.267)
        run_until(10.500, v_points.animate.scale(1.3).set_color(COLOR_LINE))

        # ── Sub 156-157: Transition vector card out, shift raster grid to left
        bridge_to(11.533)
        r_grid = get_raster_grid(size=0.6, rows=5, cols=5).shift(LEFT * 3.3 + DOWN * 0.6)
        
        # Build Raster Header Document Card
        header_card = RoundedRectangle(corner_radius=0.08, height=4.2, width=5.0, stroke_color=COLOR_BORDER, fill_color=COLOR_CARD_2, fill_opacity=0.96, stroke_width=1.5).shift(RIGHT * 2.8 + DOWN * 0.4)
        h_title = Text("Raster Header (文件头)", font_size=20, color=COLOR_TEAL).align_to(header_card, UL).shift(RIGHT * 0.4 + DOWN * 0.35)
        
        # Header parameters texts
        param_origin = Text("1. Origin (原点坐标): (X₀, Y₀)", font_size=16, color=COLOR_TEXT)
        param_dx = Text("2. Cell Width (像元宽 dx): 30m", font_size=16, color=COLOR_TEXT)
        param_dy = Text("3. Cell Height (像元高 dy): 30m", font_size=16, color=COLOR_TEXT)
        param_dims = Text("4. Dimensions (行列数): 5 × 5", font_size=16, color=COLOR_TEXT)
        param_rot = Text("5. Rotation (旋转参数): 0.0°", font_size=16, color=COLOR_TEXT)
        
        params_vgroup = VGroup(param_origin, param_dx, param_dy, param_dims, param_rot).arrange(DOWN, aligned_edge=LEFT, buff=0.22).next_to(h_title, DOWN, aligned_edge=LEFT, buff=0.3)
        header_group = VGroup(header_card, h_title, params_vgroup)

        run_until(14.500, FadeOut(vector_group), Transform(raster_group, r_grid), FadeIn(header_group))

        # ── Sub 158-159: Highlight Left-Top Origin
        bridge_to(16.233)
        origin_dot = Dot(r_grid[0].get_corner(UL), color=COLOR_RED, radius=0.08)
        origin_label = MathTex(r"(X_0, Y_0)", font_size=18, color=COLOR_RED).next_to(origin_dot, UL, buff=0.1)
        run_until(19.000, param_origin.animate.set_color(COLOR_RED), FadeIn(origin_dot), FadeIn(origin_label))

        # ── Sub 160: Highlight dx
        bridge_to(19.933)
        dx_arrow = DoubleArrow(r_grid[0].get_corner(UL), r_grid[0].get_corner(UR), color=COLOR_BLUE, stroke_width=2.5, tip_length=0.12)
        dx_lbl = MathTex(r"dx", font_size=16, color=COLOR_BLUE).next_to(dx_arrow, UP, buff=0.05)
        run_until(22.000, param_dx.animate.set_color(COLOR_BLUE), FadeIn(dx_arrow), FadeIn(dx_lbl))

        # ── Sub 161: Highlight dy
        bridge_to(22.833)
        dy_arrow = DoubleArrow(r_grid[0].get_corner(UL), r_grid[0].get_corner(DL), color=COLOR_LINE, stroke_width=2.5, tip_length=0.12)
        dy_lbl = MathTex(r"dy", font_size=16, color=COLOR_LINE).next_to(dy_arrow, LEFT, buff=0.05)
        run_until(24.000, param_dy.animate.set_color(COLOR_LINE), FadeIn(dy_arrow), FadeIn(dy_lbl))

        # ── Sub 162: Highlight rows/cols
        bridge_to(24.867)
        run_until(25.500, param_dims.animate.set_color(COLOR_GREEN))

        # ── Sub 163: Highlight rotation
        bridge_to(25.833)
        run_until(27.000, param_rot.animate.set_color(COLOR_TEAL))

        # ── Sub 164-170: Show coordinate calculations, sweep/calculate all cells
        bridge_to(30.233)
        # Clear specific parameter colorings and show formula card
        formula_box = RoundedRectangle(corner_radius=0.08, height=1.3, width=4.5, stroke_color=COLOR_BORDER, fill_color=COLOR_CARD, fill_opacity=0.9, stroke_width=1.2).next_to(params_vgroup, DOWN, buff=0.25).align_to(params_vgroup, LEFT)
        formula_txt1 = MathTex(r"X = X_0 + \mathrm{col} \times dx", font_size=18, color=COLOR_TEXT)
        formula_txt2 = MathTex(r"Y = Y_0 - \mathrm{row} \times dy", font_size=18, color=COLOR_TEXT)
        formula_grp = VGroup(formula_box, formula_txt1, formula_txt2)
        formula_txt1.move_to(formula_box.get_center() + UP * 0.22)
        formula_txt2.move_to(formula_box.get_center() + DOWN * 0.22)

        # Scanning line
        scan_line = Line(r_grid.get_left() + LEFT*0.1, r_grid.get_right() + RIGHT*0.1, color=COLOR_TEAL, stroke_width=3).move_to(r_grid.get_top())

        run_until(31.500, FadeIn(formula_grp), FadeOut(dx_arrow), FadeOut(dx_lbl), FadeOut(dy_arrow), FadeOut(dy_lbl), FadeOut(origin_dot), FadeOut(origin_label))
        run_until(32.500, FadeIn(scan_line))

        # Animate scan and flash grid cells
        grid_sweep_anims = []
        for r in range(5):
            row_cells = VGroup(*[r_grid[r*5 + c] for c in range(5)])
            grid_sweep_anims.append(row_cells.animate.set_opacity(0.95))

        run_until(
            38.000,
            scan_line.animate.move_to(r_grid.get_bottom() + DOWN*0.1),
            LaggedStart(*grid_sweep_anims, lag_ratio=0.8),
            rate_func=linear
        )
        run_until(39.000, FadeOut(scan_line))
        run_until(41.367, FadeOut(header_group), FadeOut(formula_grp), r_grid.animate.move_to(ORIGIN + DOWN*0.4).scale(1.2))
        bridge_to(42.267)

        # ═════════════ PART 2: GRID WARPING & DILEMMA (42.267s to 75.233s) ═════════════
        # Warp the grid by shearing and rotating (identical warp math to srt_74_86_vertices.py)
        theta_val = 14 * DEGREES
        rot_mat = [[np.cos(theta_val), -np.sin(theta_val), 0], [np.sin(theta_val), np.cos(theta_val), 0], [0, 0, 1]]
        shr_mat = [[1.0, 0.25, 0], [0.0, 1.0, 0], [0.0, 0.0, 1.0]]
        warp_mat = np.dot(shr_mat, rot_mat)

        warped_grid = r_grid.copy()
        
        # Subtitle 172-176: Warp Grid animation
        run_until(
            46.500,
            warped_grid.animate.apply_matrix(warp_mat).set_color(COLOR_RED),
            rate_func=smooth
        )
        bridge_to(56.300)

        # Subtitle 177-180: Cross out the warped grid (invalid)
        red_cross = Cross(warped_grid, stroke_color=COLOR_RED, stroke_width=4.5)
        
        # Ram Limit Alert
        ram_box = RoundedRectangle(corner_radius=0.08, height=2.0, width=7.5, stroke_color=COLOR_RED, fill_color=COLOR_CARD, fill_opacity=0.98, stroke_width=2.0).to_edge(UP, buff=1.4)
        ram_title = Text("⚠️ 计算机存储限制 (Dilemma)", font_size=20, color=COLOR_RED)
        ram_desc = Text("栅格数据在硬盘中只能以「横平竖直」的规则矩阵存储。\n计算机无法直接保存弯曲、倾斜或拉伸的网格结构！", font_size=15, color=COLOR_TEXT).next_to(ram_title, DOWN, aligned_edge=LEFT, buff=0.18)
        ram_grp = VGroup(ram_box, ram_title, ram_desc)
        ram_title.align_to(ram_box, UL).shift(RIGHT * 0.4 + DOWN * 0.3)

        run_until(59.000, Create(red_cross), FadeIn(ram_grp, shift=UP))
        bridge_to(70.467)

        # Clean Stage 2
        run_until(
            73.500,
            FadeOut(ram_grp),
            FadeOut(red_cross),
            FadeOut(r_grid)
        )
        bridge_to(75.367)

        # ═════════════ PART 3: THE SOLUTION: RESAMPLING (75.367s to end) ═════════════
        # Shift warped grid to left, and show a clean blank grid on the right
        target_grid = get_raster_grid(size=0.55, rows=5, cols=5, fill_opacity=0.08).shift(RIGHT * 3.3 + DOWN * 0.6)
        # Re-set warped grid to left
        warped_grid.move_to(LEFT * 3.3 + DOWN * 0.6).scale(0.8)

        lbl_src = Text("旧坐标系 A (扭曲原图)", font_size=15, color=COLOR_MUTED).next_to(warped_grid, UP, buff=0.25)
        lbl_tgt = Text("新坐标系 B (目标网格)", font_size=15, color=COLOR_BLUE).next_to(target_grid, UP, buff=0.25)

        bridge_to(82.433)
        run_until(
            87.000,
            FadeIn(warped_grid),
            FadeIn(lbl_src),
            Create(target_grid),
            FadeIn(lbl_tgt)
        )
        bridge_to(95.033)

        # ── Highlight target cell (2, 2) -> index 12
        demo_idx = 12
        tgt_cell = target_grid[demo_idx]
        demo_dot = Dot(tgt_cell.get_center(), color=COLOR_BLUE, radius=0.075)

        run_until(
            96.500,
            tgt_cell.animate.set_stroke(COLOR_BLUE, width=3).set_fill(COLOR_BLUE, opacity=0.25),
            FadeIn(demo_dot)
        )
        bridge_to(97.500)

        # Map back to old warped grid
        src_map_pos = warped_grid[12].get_center() + UP * 0.14 + RIGHT * 0.09
        src_map_dot = Dot(src_map_pos, color=COLOR_LINE, radius=0.075)
        
        map_arrow = Arrow(tgt_cell.get_center(), src_map_pos, color=COLOR_LINE, stroke_width=2.5, tip_length=0.12)
        map_lbl = Text("逆向投影反算", font_size=14, color=COLOR_LINE).next_to(map_arrow, UP, buff=0.08)

        run_until(99.500, GrowArrow(map_arrow), FadeIn(map_lbl), FadeIn(src_map_dot))
        bridge_to(103.033)

        # Highlight overlap neighbors in source grid
        overlap_idxs = [7, 8, 12, 13]
        neighbor_anims = [
            warped_grid[idx].animate.set_stroke(COLOR_LINE, width=2.5).set_fill(opacity=0.95)
            for idx in overlap_idxs
        ]
        
        # Display neighbor value labels
        n_vals = ["10", "15", "12", "8"]
        n_labels = VGroup()
        for idx, val_txt in zip(overlap_idxs, n_vals):
            lbl = Text(val_txt, font_size=16, color=COLOR_TEXT).move_to(warped_grid[idx].get_center())
            n_labels.add(lbl)

        run_until(106.000, *neighbor_anims, FadeIn(n_labels))
        bridge_to(110.767)

        # Flow particles to mapped dot
        particles = VGroup(*[
            Dot(warped_grid[idx].get_center(), color=COLOR_LINE, radius=0.06)
            for idx in overlap_idxs
        ])
        
        lbl_cn = Text("插值计算: ", font_size=20, color=COLOR_LINE)
        lbl_math = MathTex(r"10 \times w_1 + 15 \times w_2 + 12 \times w_3 + 8 \times w_4 = 11.8", font_size=20, color=COLOR_LINE)
        formula_lbl = VGroup(lbl_cn, lbl_math).arrange(RIGHT, buff=0.15).to_edge(UP, buff=1.4)

        run_until(112.500, FadeIn(particles), Write(formula_lbl))
        run_until(
            114.500,
            *[p.animate.move_to(src_map_dot.get_center()) for p in particles]
        )
        run_until(115.500, FadeOut(particles), src_map_dot.animate.scale(1.5).set_color(COLOR_GREEN))
        bridge_to(117.767)

        # Flow result particle back to Target Grid
        res_particle = Dot(src_map_dot.get_center(), color=COLOR_GREEN, radius=0.08)
        run_until(
            119.500,
            res_particle.animate.move_to(tgt_cell.get_center()),
            FadeOut(map_arrow),
            FadeOut(map_lbl)
        )
        
        # Fill demo target grid cell with final color
        resample_color = warped_grid[12].get_fill_color()
        run_until(
            121.267,
            tgt_cell.animate.set_fill(resample_color, opacity=0.9).set_stroke(COLOR_BORDER, width=1),
            FadeOut(res_particle),
            FadeOut(demo_dot),
            FadeOut(src_map_dot),
            FadeOut(n_labels),
            FadeOut(formula_lbl),
            *[warped_grid[idx].animate.set_stroke(COLOR_BORDER, width=1).set_fill(opacity=0.75) for idx in overlap_idxs]
        )
        bridge_to(121.800)

        # ── Sweep and Fill all remaining cells
        sweep_line = Line(target_grid.get_left() + LEFT*0.1, target_grid.get_right() + RIGHT*0.1, color=COLOR_BLUE, stroke_width=3).move_to(target_grid.get_left())
        run_until(122.500, FadeIn(sweep_line))

        # Sweep animate remaining grid cells
        col_anims = []
        for col in range(5):
            anims = []
            for r in range(5):
                idx = r * 5 + col
                if idx == demo_idx:
                    continue
                fill_col = warped_grid[idx].get_fill_color()
                anims.append(target_grid[idx].animate.set_fill(fill_col, opacity=0.9).set_stroke(COLOR_BORDER, width=1))
            col_anims.append(AnimationGroup(*anims, run_time=0.3))

        run_until(
            125.000,
            sweep_line.animate.move_to(target_grid.get_right() + RIGHT*0.1),
            LaggedStart(*col_anims, lag_ratio=0.8),
            rate_func=linear
        )
        run_until(125.900, FadeOut(sweep_line), FadeOut(target_grid), FadeOut(warped_grid), FadeOut(lbl_src), FadeOut(lbl_tgt), FadeOut(main_title))


class ProjectRasterSceneTimed(ProjectRasterScene):
    pass
