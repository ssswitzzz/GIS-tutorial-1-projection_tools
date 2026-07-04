from manim import *
import numpy as np

# Color Palette (Premium Warm Ivory Light Paper Theme)
COLOR_BG = "#F9F6EE"      # Warm ivory/cream paper background
COLOR_PAPER = "#1A1A1A"   # Dark charcoal/black for primary elements and dots
COLOR_TEXT = "#2C2823"    # Deep dark brown/charcoal for title text
COLOR_MUTED = "#7E7568"   # Soft medium grey-brown for secondary texts
COLOR_GRID = "#E5DEC9"    # Soft warm beige/light grey for the grid lines
COLOR_LINE = "#D4901B"    # Rich dark amber/golden yellow for lines
COLOR_TEAL = "#108B7A"    # Deep rich teal for teal accent
COLOR_BLUE = "#2A65D6"    # Deep rich sapphire blue for blue accent
COLOR_GREEN = "#2D8A4E"   # Deep rich emerald green for green accent
COLOR_RED = "#C85A48"     # Rich terracotta red for red accent
COLOR_CARD = "#F0EAE1"    # Slightly darker warm ivory/grey-beige for cards
COLOR_CARD_2 = "#ECE5D9"  # Lighter grey-beige for table background card
COLOR_BORDER = "#D3C8B7"  # Soft warm grey-beige for card borders

# Set default font for Chinese characters to serif (Source Han Serif CN) to match LaTeX aesthetics
MarkupText.set_default(font="Source Han Serif CN", weight="SEMIBOLD")

def has_chinese(text):
    return isinstance(text, str) and any("\u4e00" <= c <= "\u9fff" for c in text)

_original_text_init = Text.__init__

def _patched_text_init(self, text, *args, **kwargs):
    if has_chinese(text):
        kwargs.setdefault("font", "Source Han Serif CN")
        kwargs.setdefault("weight", SEMIBOLD)
    _original_text_init(self, text, *args, **kwargs)

Text.__init__ = _patched_text_init


def _fmt_m(n):
    """Format integer with LaTeX-safe thousand separators: 13513449 → '13{,}513{,}449'."""
    s = f"{n:,}"
    return s.replace(",", "{,}")


class VertexStructureTransform(Scene):
    """SRT 74-86: vertex storage, define projection, and projection transform.

    Timings derived from 7月3日.srt, subtitles 74-86.
    Base = 02:41.566 (sub 74 start). Total ≈ 32.5s (30.467s content + 2s hold).
    """

    R_EARTH = 6378137.0      # WGS84 semi-major axis (metres)

    # ── Werner Projection Warp helper ──────────────────────────────────

    def warp_point(self, p, warp=False):
        """Warp a single point p = [x, y, z] to Werner projection if warp=True."""
        if not warp:
            return p
        x, y = p[0], p[1]
        
        # Scale screen x and y to radians (lat, lon)
        # x range [-6, 6] represents longitude [-100, 100] deg
        # y range [-3, 3] represents latitude [-50, 50] deg
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

    def werner_meters(self, lon_deg, lat_deg):
        """Return (x, y) in Werner projection metres."""
        # Central meridian lambda_0 = 121.40 (centered near Shanghai)
        lon_rad = np.radians(lon_deg - 121.40)
        lat_rad = np.radians(lat_deg)
        
        rho = self.R_EARTH * (np.pi / 2 - lat_rad)
        
        if abs(rho) < 1e-6:
            E = 0.0
        else:
            E = lon_rad * self.R_EARTH * np.cos(lat_rad) / rho
            
        x = rho * np.sin(E)
        y = self.R_EARTH * (np.pi / 2) - rho * np.cos(E)
        
        return (x, y)

    # ── construct ──────────────────────────────────────────────────

    def construct(self):
        self.camera.background_color = COLOR_BG
        np.random.seed(74)

        # ─── Precise timings from SRT 74-86 ───
        subtitles = [
            (0.000,  1.900, "从数据结构的角度来说"),       # 74
            (2.134,  4.534, "无论是点线还是面"),             # 75
            (4.867,  7.300, "存储的时候都是存顶点坐标"),     # 76
            (8.000, 10.034, "点就是一对坐标(x, y)"),        # 77
            (10.634, 12.800, "线是一串有序的坐标点序列"),    # 78
            (13.600, 16.034, "而面也是一串坐标点序列"),      # 79
            (16.467, 18.634, "只不过它的起点和终点重合"),    # 80
            (18.634, 20.000, "围成了一个闭合的圈"),          # 81
            (20.800, 22.934, "因此我们在定义投影的时候"),    # 82
            (23.267, 25.734, "就是对这些点的数字贴个标签"),  # 83
            (26.267, 27.334, "在投影的时候"),                # 84
            (27.400, 28.867, "就是把这些点的数字"),          # 85
            (28.900, 30.467, "进行空间几何变换"),            # 86
        ]

        self.elapsed = 0

        # ─── Background grid (geographic — will Transform to Werner later) ───
        geo_grid = self.make_grid_lines(COLOR_BLUE, warp=False)
        texture = self.make_texture()
        self.add(geo_grid, texture)

        # Pre-build Werner grid (same structure, warped + blue)
        warped_grid = self.make_grid_lines(COLOR_BLUE, warp=True)

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

        # ─── Geo coordinates for labels ───
        geo_coords = [
            (121.38, 31.11),
            (121.41, 31.10),
            (121.47, 31.14),
            (121.44, 31.23),
            (121.36, 31.25),
        ]

        # ─── Title ───
        title = Text("几何 = 顶点坐标", font_size=36, color=COLOR_TEXT).shift(UP * 3.25)
        sub = Text("数据结构视角", font_size=22, color=COLOR_MUTED).next_to(title, DOWN, buff=0.15)

        # ─── Vertex positions (screen coordinates) ───
        # Shifted down by 0.6 to avoid overlap with matrix card
        self.vertex_positions = [
            np.array([-2.55, -1.72, 0]),
            np.array([-1.25, -2.00, 0]),
            np.array([ 0.72, -1.15, 0]),
            np.array([ 0.34,  0.44, 0]),
            np.array([-1.78,  0.74, 0]),
            np.array([-2.55, -1.72, 0]),   # closing vertex = v0
        ]

        # ═════════════ CUE 0 (sub 74) ═════════════
        cue(0)
        run_until(1.900, FadeIn(title, shift=UP * 0.25), FadeIn(sub, shift=UP * 0.2))

        # ═════════════ CUE 1 (sub 75): Geometry Cards ═════════════
        cue(1)
        point_card = self.geometry_card("点", COLOR_TEAL, LEFT * 3.7 + UP * 0.3)
        line_card  = self.geometry_card("线", COLOR_LINE, UP * 0.3)
        poly_card  = self.geometry_card("面", COLOR_GREEN, RIGHT * 3.7 + UP * 0.3)
        trio = VGroup(point_card, line_card, poly_card)
        run_until(
            4.534,
            LaggedStart(
                FadeIn(point_card, shift=UP * 0.5),
                FadeIn(line_card,  shift=UP * 0.5),
                FadeIn(poly_card,  shift=UP * 0.5),
                lag_ratio=0.22,
            ),
        )

        # ═════════════ CUE 2 (sub 76): Show coords + table ═════════════
        cue(2)
        data_panel = self.vertex_table().to_edge(RIGHT, buff=0.55).shift(DOWN * 0.22)
        vertices   = self.make_vertices()
        ghost_paths = self.make_ghost_paths(vertices)
        run_until(
            7.300,
            trio.animate.scale(0.64).arrange(DOWN, buff=0.18)
                .to_edge(LEFT, buff=0.45).shift(DOWN * 0.15),
            FadeIn(data_panel, shift=LEFT * 0.4),
            LaggedStart(*[GrowFromCenter(d) for d in vertices], lag_ratio=0.08),
            FadeIn(ghost_paths, lag_ratio=0.1),
        )

        # ═════════════ CUE 3 (sub 77): Highlight Point ═════════════
        cue(3)
        point_focus = Circle(radius=0.26, color=COLOR_TEAL, stroke_width=4).move_to(vertices[0])
        point_label = MathTex(r"(121.38,\; 31.11)", font_size=24, color=COLOR_TEAL)
        point_label.next_to(point_focus, UR, buff=0.18)
        run_until(
            10.034,
            trio[0].animate.scale(1.18).set_z_index(3),
            GrowFromCenter(point_focus),
            Write(point_label),
            Circumscribe(data_panel[2], color=COLOR_TEAL),
        )

        # ═════════════ CUE 4 (sub 78): Highlight Line ═════════════
        cue(4)
        ordered    = self.ordered_polyline(vertices)
        order_nums = self.order_numbers(vertices[:5], COLOR_LINE)
        run_until(
            12.800,
            FadeOut(point_focus), FadeOut(point_label), FadeOut(ghost_paths),
            trio[0].animate.scale(1 / 1.18),
            trio[1].animate.scale(1.18).set_z_index(3),
            Create(ordered),
            LaggedStart(*[FadeIn(n, scale=0.5) for n in order_nums], lag_ratio=0.11),
            Circumscribe(data_panel[3], color=COLOR_LINE),
        )

        # ═════════════ CUE 5 (sub 79): Highlight Polygon ═════════════
        cue(5)
        polygon   = self.closed_polygon(vertices)
        poly_nums = self.order_numbers(vertices[:5], COLOR_GREEN)
        run_until(
            16.034,
            FadeOut(order_nums),
            ordered.animate.set_stroke(opacity=0.25),
            trio[1].animate.scale(1 / 1.18),
            trio[2].animate.scale(1.18).set_z_index(3),
            Create(polygon),
            LaggedStart(*[FadeIn(n, scale=0.5) for n in poly_nums], lag_ratio=0.08),
            Circumscribe(data_panel[4], color=COLOR_GREEN),
        )

        # ═════════════ CUE 6 (sub 80): Start = End overlap ═════════════
        cue(6)
        start_ring = Circle(radius=0.20, color=COLOR_GREEN, stroke_width=4).move_to(vertices[0])
        end_ring   = Circle(radius=0.32, color=COLOR_GREEN, stroke_width=2).move_to(vertices[0])
        # Place v0=v5 tag to the LEFT to avoid overlapping the vertex dot & order badge
        equal_tag  = MathTex(r"v_0 = v_5", font_size=26, color=COLOR_GREEN)
        equal_tag.next_to(start_ring, LEFT, buff=0.22)
        run_until(
            18.634,
            trio[2].animate.scale(1 / 1.18),
            GrowFromCenter(start_ring), GrowFromCenter(end_ring),
            Write(equal_tag),
            polygon.animate.set_fill(COLOR_GREEN, opacity=0.11).set_stroke(width=5),
        )

        # ═════════════ CUE 7 (sub 81): Flash overlap node ═════════════
        cue(7)
        run_until(
            20.000,
            Flash(vertices[0].get_center(), color=COLOR_GREEN, flash_radius=0.75),
            polygon.animate.set_fill(COLOR_GREEN, opacity=0.20),
            Rotate(end_ring, angle=TAU, about_point=vertices[0].get_center()),
        )

        # ═════════════ CUE 8 (sub 82): DEFINE PROJECTION transition ═════════════
        cue(8)
        define_label = self.define_projection_badge().to_edge(UP, buff=0.30)
        run_until(
            22.934,
            FadeOut(title), FadeOut(sub),
            FadeOut(trio),            # clean up left-side cards
            FadeOut(poly_nums), FadeOut(start_ring), FadeOut(end_ring),
            FadeOut(equal_tag), FadeOut(ordered),
            FadeIn(define_label, shift=DOWN * 0.25),
            polygon.animate.set_stroke(COLOR_TEAL, width=3).set_fill(COLOR_TEAL, opacity=0.08),
        )

        # ═════════════ CUE 9 (sub 83): "贴标签" — coordinates → °E/°N ═════════════
        cue(9)

        # Directions pointing AWAY from polygon interior to avoid edge overlap
        label_dirs = [DL, DOWN, RIGHT, UR, UL]

        # Phase A: show raw coordinate numbers (consistently format to 2 decimal places)
        coord_labels = VGroup()
        for i, dot in enumerate(vertices[:5]):
            lon, lat = geo_coords[i]
            lbl = MathTex(f"{lon:.2f},\\; {lat:.2f}", font_size=18, color=COLOR_PAPER)
            lbl.next_to(dot, label_dirs[i], buff=0.18)
            coord_labels.add(lbl)

        no_move = Text("坐标数字不移动，只获得坐标系身份", font_size=22, color=COLOR_PAPER)
        no_move.next_to(define_label, DOWN, buff=0.30)

        run_until(
            24.400,
            LaggedStart(*[FadeIn(lbl, shift=UP * 0.12) for lbl in coord_labels], lag_ratio=0.06),
            Write(no_move),
        )

        # Phase B: append °E / °N — the "label" sticks on
        degree_tags = VGroup()
        for i in range(5):
            lon, lat = geo_coords[i]
            tagged = MathTex(
                f"{lon:.2f}^\\circ\\!E,\\; {lat:.2f}^\\circ\\!N",
                font_size=18, color=COLOR_TEAL,
            )
            tagged.move_to(coord_labels[i], aligned_edge=LEFT)
            degree_tags.add(tagged)

        run_until(
            25.734,
            *[Transform(coord_labels[i], degree_tags[i]) for i in range(5)],
        )

        # ═════════════ CUE 10 (sub 84): PROJECT badge + matrix ═════════════
        cue(10)
        project_label = self.project_badge().to_edge(UP, buff=0.30)
        matrix = self.transform_matrix().next_to(project_label, DOWN, buff=0.35)
        run_until(
            27.334,
            Transform(define_label, project_label),
            FadeOut(no_move),
            FadeIn(matrix, shift=DOWN * 0.2),
            coord_labels.animate.set_opacity(0.3),
        )

        # ═════════════ CUE 11 (sub 85): Werner warp ═════════════
        cue(11)

        # Compute projected vertex positions via Werner transform
        target_points = [
            self.warp_point(p, warp=True) for p in self.vertex_positions
        ]
        target_dots    = VGroup(*[Dot(p, radius=0.065, color=COLOR_BLUE) for p in target_points])
        target_polygon = Polygon(
            *target_points[:5],
            color=COLOR_BLUE, fill_color=COLOR_BLUE, fill_opacity=0.16, stroke_width=5,
        )

        run_until(
            28.867,
            FadeOut(coord_labels),
            FadeOut(texture),
            # Smoothly warp the straight grid into Werner (same structure → clean Transform)
            Transform(geo_grid, warped_grid),
            Transform(polygon, target_polygon),
            *[Transform(vertices[i], target_dots[i]) for i in range(6)],
        )

        # ═════════════ CUE 12 (sub 86): Final — numbers change ═════════════
        cue(12)
        number_change = self.number_change_panel().to_edge(RIGHT, buff=0.55).shift(DOWN * 0.22)
        final_title = Text("投影 = 坐标几何变换", font_size=30, color=COLOR_BLUE)
        final_title.to_edge(DOWN, buff=0.45)
        run_until(
            30.467,
            Transform(data_panel[0], number_change[0]),
            FadeOut(VGroup(*data_panel[1:])),
            FadeIn(VGroup(*number_change[1:])),
            Flash(target_points[2], color=COLOR_BLUE, flash_radius=0.8),
            Write(final_title),
            matrix[1].animate.set_color(COLOR_BLUE),
            rate_func=smooth,
        )
        
        # ─── Hold final frame ───
        bridge_to(32.467)
        self.play(
            FadeOut(geo_grid),
            FadeOut(polygon),
            FadeOut(vertices),
            FadeOut(final_title),
            FadeOut(matrix),
            FadeOut(data_panel[0]),
            FadeOut(number_change[1]),
            FadeOut(number_change[2]),
            FadeOut(number_change[3]),
            run_time=2.0
        )

    # ═══════════════════════════════════════════════════════════════
    # HELPER METHODS
    # ═══════════════════════════════════════════════════════════════

    def make_grid_lines(self, color, warp=False):
        """Create a rectilinear grid of lines, possibly warped into Werner projection."""
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
        """Subtle noise dots that add a papery feel to the background."""
        return VGroup(*[
            Dot(
                [np.random.uniform(-7, 7), np.random.uniform(-3.7, 3.7), 0],
                radius=0.006, color=COLOR_PAPER,
            ).set_opacity(0.18)
            for _ in range(90)
        ]).set_z_index(-10)

    def geometry_card(self, label, color, pos):
        rect = RoundedRectangle(
            corner_radius=0.08, width=2.05, height=1.36,
            color=color, fill_color=COLOR_CARD, fill_opacity=0.92, stroke_width=2,
        )
        big = Text(label, font_size=42, color=color).move_to(rect.get_center() + UP * 0.12)
        eng_map = {"点": "Point", "线": "Polyline", "面": "Polygon"}
        small = Tex(
            rf"\textbf{{{eng_map[label]}}}", font_size=20, color=COLOR_MUTED,
        ).next_to(big, DOWN, buff=0.04)
        return VGroup(rect, big, small).move_to(pos)

    def vertex_table(self):
        rect = RoundedRectangle(
            corner_radius=0.08, width=3.6, height=3.95,
            color=COLOR_BORDER, fill_color=COLOR_CARD_2, fill_opacity=0.96, stroke_width=1.5,
        )
        header = Text("顶点序列", font_size=22, color=COLOR_PAPER).move_to(rect.get_top() + DOWN * 0.36)
        row1 = Tex(r"\textbf{Point} \quad $v_0: (x_0, y_0)$",                  font_size=20, color=COLOR_TEAL)
        row2 = Tex(r"\textbf{Polyline} \quad $[v_0, v_1, v_2, \dots]$",         font_size=20, color=COLOR_LINE)
        row3 = Tex(r"\textbf{Polygon} \quad $[v_0, \dots, v_5],\ v_0 = v_5$",   font_size=20, color=COLOR_GREEN)
        rows = VGroup(row1, row2, row3).arrange(DOWN, aligned_edge=LEFT, buff=0.36)
        rows.move_to(rect.get_center() + DOWN * 0.16)
        return VGroup(rect, header, row1, row2, row3)

    def make_vertices(self):
        return VGroup(*[Dot(p, radius=0.07, color=COLOR_PAPER).set_z_index(4) for p in self.vertex_positions])

    def make_ghost_paths(self, vertices):
        path = VMobject(color=COLOR_MUTED, stroke_width=2, stroke_opacity=0.35)
        path.set_points_as_corners([d.get_center() for d in vertices[:5]])
        return path

    def ordered_polyline(self, vertices):
        path = VMobject(color=COLOR_LINE, stroke_width=5)
        path.set_points_as_corners([d.get_center() for d in vertices[:5]])
        return path

    def closed_polygon(self, vertices):
        return Polygon(
            *[d.get_center() for d in vertices[:5]],
            color=COLOR_GREEN, fill_color=COLOR_GREEN, fill_opacity=0.08, stroke_width=4,
        )

    def order_numbers(self, vertices, color):
        nums = VGroup()
        for i, dot in enumerate(vertices):
            n  = MathTex(str(i), font_size=18, color=COLOR_BG)
            bg = Circle(radius=0.14, color=color, fill_color=color, fill_opacity=1, stroke_width=0)
            g  = VGroup(bg, n).move_to(dot.get_center() + DOWN * 0.34 + RIGHT * 0.12).set_z_index(6)
            nums.add(g)
        return nums

    def define_projection_badge(self):
        rect = RoundedRectangle(
            corner_radius=0.08, width=3.78, height=0.62,
            color=COLOR_TEAL, fill_color=COLOR_CARD, fill_opacity=0.95, stroke_width=2,
        )
        en  = Tex(r"\textbf{DEFINE PROJECTION}", font_size=20, color=COLOR_TEAL)
        sep = Tex(r"/", font_size=18, color=COLOR_MUTED)
        zh  = Text("贴标签", font_size=17, color=COLOR_PAPER)
        txt = VGroup(en, sep, zh).arrange(RIGHT, buff=0.12).move_to(rect)
        return VGroup(rect, txt)

    def project_badge(self):
        rect = RoundedRectangle(
            corner_radius=0.08, width=3.78, height=0.62,
            color=COLOR_BLUE, fill_color=COLOR_CARD, fill_opacity=0.95, stroke_width=2,
        )
        en  = Tex(r"\textbf{PROJECT}", font_size=20, color=COLOR_BLUE)
        sep = Tex(r"/", font_size=18, color=COLOR_MUTED)
        zh  = Text("几何变换", font_size=17, color=COLOR_PAPER)
        txt = VGroup(en, sep, zh).arrange(RIGHT, buff=0.12).move_to(rect)
        return VGroup(rect, txt)

    def transform_matrix(self):
        matrix_tex = MathTex(
            r"\begin{bmatrix} x' \\ y' \\ 1 \end{bmatrix} ="
            r"\begin{bmatrix} a & b & t_x \\ c & d & t_y \\ 0 & 0 & 1 \end{bmatrix}"
            r"\begin{bmatrix} x \\ y \\ 1 \end{bmatrix}",
            font_size=22, color=COLOR_MUTED,
        )
        box = RoundedRectangle(
            corner_radius=0.06, width=3.20, height=1.15,
            color=COLOR_BLUE, fill_color=COLOR_CARD, fill_opacity=0.88, stroke_width=1.2,
        )
        matrix_tex.move_to(box)
        return VGroup(box, matrix_tex)

    def number_change_panel(self):
        rect = RoundedRectangle(
            corner_radius=0.08, width=3.6, height=3.95,
            color=COLOR_BLUE, fill_color=COLOR_CARD_2, fill_opacity=0.96, stroke_width=1.5,
        )
        header = Text("变换后坐标 (Werner投影)", font_size=18, color=COLOR_BLUE).move_to(rect.get_top() + DOWN * 0.32)
        
        # Werner formula annotation
        formula = MathTex(
            r"\rho = R(\tfrac{\pi}{2} - \phi),\ \theta = \tfrac{\lambda R \cos\phi}{\rho}\\",
            r"x' = \rho \sin\theta,\ y' = R\tfrac{\pi}{2} - \rho \cos\theta",
            font_size=15, color=COLOR_MUTED,
        )
        formula.arrange(DOWN, buff=0.08)
        formula.next_to(header, DOWN, buff=0.20)

        # Compute actual Werner projection metre values
        geo = [(121.38, 31.11), (121.41, 31.10)]
        rows = VGroup()
        for i, (lon, lat) in enumerate(geo):
            mx, my = self.werner_meters(lon, lat)
            mx_s, my_s = _fmt_m(int(round(mx))), _fmt_m(int(round(my)))
            src = MathTex(
                f"v_{i}: {lon:.2f}^\\circ\\!E,\\; {lat:.2f}^\\circ\\!N",
                font_size=22, color=COLOR_MUTED,
            )
            dst = MathTex(
                r"\rightarrow\; " + mx_s + r"\,\mathrm{m},\; " + my_s + r"\,\mathrm{m}",
                font_size=22, color=COLOR_BLUE,
            )
            group = VGroup(src, dst).arrange(DOWN, aligned_edge=LEFT, buff=0.08)
            rows.add(group)
        rows.arrange(DOWN, aligned_edge=LEFT, buff=0.24)
        rows.next_to(formula, DOWN, buff=0.24)
        
        # Center the contents vertically inside the box
        content = VGroup(header, formula, rows)
        content.move_to(rect.get_center() + UP * 0.05)
        
        return VGroup(rect, header, formula, rows)
