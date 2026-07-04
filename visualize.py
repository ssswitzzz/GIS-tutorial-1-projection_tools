from manim import *
import numpy as np

# ==================== THEME CONFIGURATION ====================
# Colors (Modern Tech Palette)
COLOR_BG = "#0D0E15"          # Deep midnight dark space
COLOR_TEXT = "#F1F5F9"        # Slate-50
COLOR_MUTED = "#94A3B8"       # Slate-400
COLOR_CARD_BG = "#1E293B"     # Slate-800
COLOR_CARD_BORDER = "#334155" # Slate-700

COLOR_TEAL = "#00F5D4"        # Mint/Teal (WGS84, Degrees, Define CRS)
COLOR_GREEN = "#10B981"       # Emerald (Success, Applied Tags)
COLOR_BLUE = "#3B82F6"        # Slate Blue (Meters, Grid, Web Mercator)
COLOR_INDIGO = "#6366F1"      # Indigo (Target CRS, Output Calculations)
COLOR_RED = "#F43F5E"         # Rose Red (Unknown, Missing, Warning)
COLOR_ORANGE = "#F97316"      # Orange (Math Engine, Formula)
COLOR_YELLOW = "#FBBF24"      # Amber/Yellow (Data packets)

# Global font configuration
MarkupText.set_default(font="Source Han Serif CN", weight="SEMIBOLD")

def has_chinese(text):
    if not isinstance(text, str):
        return False
    return any(u'\u4e00' <= char <= u'\u9fff' for char in text)

# Patch Text constructor to automatically handle Chinese fonts
_original_text_init = Text.__init__
def _patched_text_init(self, text, *args, **kwargs):
    if has_chinese(text):
        kwargs["font"] = "Source Han Serif CN"
    else:
        if "font" in kwargs and kwargs["font"] == "Consolas":
            kwargs["font"] = "JetBrains Mono"
    _original_text_init(self, text, *args, **kwargs)
Text.__init__ = _patched_text_init


class GISComparison(Scene):
    def construct(self):
        # Set background color
        self.camera.background_color = COLOR_BG
        
        # 主标题 (Highlighted with matching colors)
        title_text = MarkupText(
            "<b>Define Projection</b> (<span color='#00F5D4'>定义投影</span>)  vs  <b>Project</b> (<span color='#3B82F6'>投影</span>)",
            font_size=22,
            color=COLOR_TEXT
        ).to_edge(UP, buff=0.4)
        title_line = Line(LEFT * 5.5, RIGHT * 5.5, color=COLOR_CARD_BORDER, stroke_width=1.5).next_to(title_text, DOWN, buff=0.15)
        title = VGroup(title_text, title_line)
        
        self.play(FadeIn(title))
        self.wait(0.5)
        
        # ================= PART 1: Define Projection =================
        part1_title = MarkupText("第一阶段：Define Projection (定义投影)", font_size=18, color=COLOR_TEAL).next_to(title_line, DOWN, buff=0.4)
        self.play(Write(part1_title))
        
        # 绘制“一张白纸” (GIS 属性卡片) - Upgrade to Glass Card style
        card_rect = RoundedRectangle(
            corner_radius=0.15,
            height=3.4,
            width=5.8,
            stroke_color=COLOR_CARD_BORDER,
            stroke_width=1.5,
            fill_color=COLOR_CARD_BG,
            fill_opacity=0.85
        ).shift(UP * 0.1)
        
        # Card table grid
        grid_lines = VGroup()
        for i in range(-3, 3):
            grid_lines.add(Line(
                card_rect.get_left() + RIGHT * 0.4 + UP * (i * 0.45 - 0.1),
                card_rect.get_right() - RIGHT * 0.4 + UP * (i * 0.45 - 0.1),
                stroke_width=0.7,
                color=COLOR_CARD_BORDER,
                stroke_opacity=0.3
            ))
        
        card_header = Text("shanghai_vertices.shp (RAW DATA)", font="Consolas", font_size=11, color=COLOR_MUTED).align_to(card_rect, UL).shift(RIGHT * 0.4 + DOWN * 0.3)
        card_status = Text("● CRS: UNKNOWN", font="Consolas", font_size=11, color=COLOR_RED).align_to(card_rect, UR).shift(LEFT * 0.4 + DOWN * 0.3)
        
        # Raw value on card: "100"
        val_analog = MarkupText("<b>100</b>", font_size=42, color=COLOR_TEXT).move_to(card_rect.get_left() + RIGHT * 1.6 + DOWN * 0.2)
        val_gis_title = Text("Naked Vertices (RAW):", font="Consolas", font_size=11, color=COLOR_MUTED).move_to(card_rect.get_right() - RIGHT * 1.8 + UP * 0.5)
        val_gis_x = Text("X: 121.000", font="Consolas", font_size=13, color=COLOR_TEXT).next_to(val_gis_title, DOWN, aligned_edge=LEFT, buff=0.15)
        val_gis_y = Text("Y:  31.000", font="Consolas", font_size=13, color=COLOR_TEXT).next_to(val_gis_x, DOWN, aligned_edge=LEFT, buff=0.15)
        
        card_group = VGroup(card_rect, grid_lines, card_header, card_status, val_analog, val_gis_title, val_gis_x, val_gis_y)
        
        self.play(FadeIn(card_group, shift=UP))
        self.wait(1)
        
        # 绘制“印章” - Beautiful shaded seal stamp tool
        stamp_top = Circle(radius=0.18, color=COLOR_TEAL, fill_color=COLOR_TEAL, fill_opacity=0.3)
        stamp_neck = Polygon(
            [-0.1, 0, 0], [0.1, 0, 0], [0.22, -0.5, 0], [-0.22, -0.5, 0],
            color=COLOR_TEAL, fill_color=COLOR_TEAL, fill_opacity=0.5
        )
        stamp_base = RoundedRectangle(
            corner_radius=0.06,
            height=0.3,
            width=1.3,
            color=COLOR_TEAL,
            fill_color=COLOR_TEAL,
            fill_opacity=0.9
        ).next_to(stamp_neck, DOWN, buff=0)
        stamp_txt = Text("WGS84", font="Consolas", font_size=9, color=COLOR_BG).move_to(stamp_base.get_center())
        stamp_tool = VGroup(stamp_top, stamp_neck, stamp_base, stamp_txt).shift(UP * 4.5)
        
        self.play(FadeIn(stamp_tool, shift=DOWN))
        self.wait(0.5)
        
        # Stamp Target Position
        target_pos = card_rect.get_bottom() + UP * 0.8 + RIGHT * 1.8
        
        # Stamp Drops Accelerating
        self.play(
            stamp_tool.animate.move_to(target_pos),
            run_time=0.4,
            rate_func=rate_functions.ease_in_cubic
        )
        
        # Concentric waves on impact
        ripple1 = Circle(radius=0.05, color=COLOR_TEAL, stroke_width=4).move_to(target_pos)
        ripple2 = Circle(radius=0.05, color=COLOR_TEAL, stroke_width=2.5).move_to(target_pos)
        ripple3 = Circle(radius=0.05, color=COLOR_TEAL, stroke_width=1.5).move_to(target_pos)
        
        # Custom rotated green ink seal
        stamped_label_box = RoundedRectangle(
            corner_radius=0.06,
            height=0.5,
            width=1.3,
            color=COLOR_GREEN,
            fill_color="#064E3B",
            fill_opacity=0.9
        ).move_to(target_pos).rotate(-12 * DEGREES)
        stamped_label_txt = Text("🏷️ WGS84", font="Consolas", font_size=9, color=COLOR_GREEN).move_to(stamped_label_box.get_center()).rotate(-12 * DEGREES)
        stamped_label = VGroup(stamped_label_box, stamped_label_txt)
        
        # Post-stamping updates: status to green, numbers appended with unit labels
        val_analog_stamped = MarkupText("<b>100 <span color='#00F5D4'>$</span></b>", font_size=42, color=COLOR_GREEN).move_to(val_analog.get_center())
        val_gis_x_stamped = Text("X: 121.000°", font="Consolas", font_size=13, color=COLOR_GREEN).move_to(val_gis_x.get_center())
        val_gis_y_stamped = Text("Y:  31.000°", font="Consolas", font_size=13, color=COLOR_GREEN).move_to(val_gis_y.get_center())
        card_status_stamped = Text("● CRS: WGS84 (DEG)", font="Consolas", font_size=11, color=COLOR_GREEN).move_to(card_status.get_center())
        
        # Bounce & Squash Deformation Effect
        self.play(
            card_rect.animate.scale([1.03, 0.94, 1.0], about_point=card_rect.get_bottom()),
            stamp_tool.animate.shift(UP * 0.15),
            run_time=0.07,
            rate_func=rate_functions.ease_out_quad
        )
        
        self.play(
            card_rect.animate.scale([1.0/1.03, 1.0/0.94, 1.0], about_point=card_rect.get_bottom()),
            stamp_tool.animate.shift(UP * 1.5 + LEFT * 0.5),
            Transform(val_analog, val_analog_stamped),
            Transform(val_gis_x, val_gis_x_stamped),
            Transform(val_gis_y, val_gis_y_stamped),
            Transform(card_status, card_status_stamped),
            card_rect.animate.set_stroke_color(COLOR_GREEN),
            FadeIn(stamped_label),
            FadeIn(ripple1), FadeIn(ripple2), FadeIn(ripple3),
            run_time=0.4
        )
        
        # Ripples spreading out and fading
        self.play(
            ripple1.animate.scale(6.0).set_opacity(0),
            ripple2.animate.scale(9.0).set_opacity(0),
            ripple3.animate.scale(12.0).set_opacity(0),
            run_time=0.6
        )
        self.remove(ripple1, ripple2, ripple3)
        self.play(FadeOut(stamp_tool))
        self.wait(0.5)
        
        # Warning label emphasizing coordinate values remained unchanged
        num_no_change = MarkupText("⚠️ <b>注意：</b>纸上的数字 100（坐标 121/31）<b>绝对没有改变</b>！", font_size=16, color=COLOR_RED).to_edge(DOWN, buff=0.8)
        self.play(Write(num_no_change))
        self.wait(2.5)
        
        # Clean up Part 1
        self.play(
            FadeOut(num_no_change),
            FadeOut(card_group),
            FadeOut(stamped_label),
            FadeOut(part1_title)
        )
        self.wait(0.5)
        
        # ================= PART 2: Project =================
        part2_title = MarkupText("第二阶段：Project (投影转换 = 数值转换)", font_size=18, color=COLOR_BLUE).next_to(title_line, DOWN, buff=0.4)
        self.play(Write(part2_title))
        
        # Left card (WGS84, Emerald Green)
        left_card = RoundedRectangle(corner_radius=0.12, height=2.4, width=3.6, color=COLOR_GREEN, stroke_width=1.5, fill_color=COLOR_CARD_BG, fill_opacity=0.85).shift(LEFT * 4.2 + DOWN * 0.2)
        left_header = Text("INPUT WGS84", font="Consolas", font_size=11, color=COLOR_GREEN).next_to(left_card.get_top(), DOWN, buff=0.25)
        left_val = MarkupText("100 <b>$</b>", font_size=28, color=COLOR_GREEN).move_to(left_card.get_center() + UP * 0.1)
        left_coord = Text("X: 121.000°\nY:  31.000°", font="Consolas", font_size=11, color=COLOR_MUTED).next_to(left_val, DOWN, buff=0.15)
        left_grp = VGroup(left_card, left_header, left_val, left_coord)
        
        # Right card (WebMercator, Blue/Indigo)
        right_card = RoundedRectangle(corner_radius=0.12, height=2.4, width=3.6, color=COLOR_BLUE, stroke_width=1.5, fill_color=COLOR_CARD_BG, fill_opacity=0.85).shift(RIGHT * 4.2 + DOWN * 0.2)
        right_header = Text("OUTPUT WebMercator", font="Consolas", font_size=11, color=COLOR_BLUE).next_to(right_card.get_top(), DOWN, buff=0.25)
        right_val = MarkupText("679 <b>￥</b>", font_size=28, color=COLOR_BLUE).move_to(right_card.get_center() + UP * 0.1)
        right_coord = Text("X: 13,469,903m\nY:  3,632,633m", font="Consolas", font_size=11, color=COLOR_MUTED).next_to(right_val, DOWN, buff=0.15)
        right_grp = VGroup(right_card, right_header, right_val, right_coord)
        
        # Conversion Engine Portal (Orange tech core)
        portal_outer = Circle(radius=1.2, color=COLOR_ORANGE, stroke_width=3).shift(DOWN * 0.2)
        portal_inner = Circle(radius=1.0, color=COLOR_ORANGE, stroke_width=1, stroke_opacity=0.4).shift(DOWN * 0.2)
        portal_dash = DashedVMobject(Circle(radius=1.1, color=COLOR_ORANGE, stroke_width=1.5)).shift(DOWN * 0.2)
        
        portal_txt_1 = Text("Math Engine", font="Consolas", font_size=11, color=COLOR_ORANGE).move_to(portal_outer.get_center() + UP * 0.3)
        portal_txt_2 = Text("λ, φ ➔ X, Y", font="Consolas", font_size=9, color=COLOR_MUTED).next_to(portal_txt_1, DOWN, buff=0.12)
        portal_formula = Text("x = R * λ * cos(φ0)", font="Consolas", font_size=8, color=COLOR_CARD_BORDER).next_to(portal_txt_2, DOWN, buff=0.1)
        portal_grp = VGroup(portal_outer, portal_inner, portal_dash, portal_txt_1, portal_txt_2, portal_formula)
        
        # Exchange rate / projection parameter info (Fixed Tofu Font issue)
        formula_banner = Text("1 $ = 6.79 ￥ (汇率/投影参数)", font="Source Han Serif CN", font_size=10, color=COLOR_ORANGE).next_to(portal_outer, DOWN, buff=0.25)
        
        self.play(FadeIn(left_grp), FadeIn(portal_grp), FadeIn(formula_banner))
        self.wait(0.5)
        
        # Animating data packet transmission
        packet = Dot(color=COLOR_YELLOW, radius=0.15).move_to(left_card.get_center())
        self.play(FadeIn(packet))
        
        # Fly to the portal
        self.play(
            packet.animate.move_to(portal_outer.get_center()), 
            run_time=0.6,
            rate_func=rate_functions.ease_out_cubic
        )
        
        # Portal operation: rotate rings, packet glows
        self.play(
            Rotate(portal_dash, angle=PI, about_point=portal_outer.get_center()),
            Rotate(portal_inner, angle=-PI, about_point=portal_outer.get_center()),
            packet.animate.scale(1.5).set_color(COLOR_ORANGE),
            run_time=0.8
        )
        
        # Transition out of portal with empty calculating state first
        right_val_empty = MarkupText("??? <b>￥</b>", font_size=28, color=COLOR_MUTED).move_to(right_card.get_center() + UP * 0.1)
        right_coord_empty = Text("X: Calculating...\nY: Calculating...", font="Consolas", font_size=11, color=COLOR_MUTED).next_to(right_val_empty, DOWN, buff=0.15)
        right_grp_init = VGroup(right_card, right_header, right_val_empty, right_coord_empty)
        
        self.play(
            packet.animate.move_to(right_card.get_center()).scale(0.6).set_color(COLOR_BLUE),
            FadeIn(right_grp_init),
            run_time=0.6
        )
        
        # Resolve to final values with a flashy screen burst
        self.play(
            FadeOut(packet), 
            Flash(right_card, color=COLOR_BLUE),
            Transform(right_val_empty, right_val),
            Transform(right_coord_empty, right_coord),
            run_time=0.8
        )
        self.wait(1)
        
        desc_project = MarkupText("Project 本质：读取原始坐标，按复杂的地球公式<b>重新计算数值</b>并生成新文件", font_size=16, color=COLOR_YELLOW).to_edge(DOWN, buff=0.8)
        self.play(Write(desc_project))
        self.wait(3)
        
        # Clear Stage
        self.play(
            FadeOut(left_grp),
            FadeOut(right_grp_init), # removes the transformed group
            FadeOut(portal_grp),
            FadeOut(formula_banner),
            FadeOut(desc_project),
            FadeOut(part2_title),
            FadeOut(title)
        )
        self.wait(1)


class NullIslandScene(Scene):
    def construct(self):
        self.camera.background_color = COLOR_BG
        
        # Title (High Contrast)
        title_text = MarkupText("“零度岛” (Null Island) 的产生原理", font_size=22, color=COLOR_TEXT).to_edge(UP, buff=0.4)
        title_line = Line(LEFT * 5.5, RIGHT * 5.5, color=COLOR_CARD_BORDER, stroke_width=1.5).next_to(title_text, DOWN, buff=0.15)
        title = VGroup(title_text, title_line)
        
        self.play(FadeIn(title))
        self.wait(0.5)
        
        # 1. Degree Grid (WGS84 representation, Mint Green)
        grid_deg = NumberPlane(
            x_range=[-180, 180, 45],
            y_range=[-90, 90, 30],
            x_length=10.5,
            y_length=5.0,
            background_line_style={"stroke_color": COLOR_TEAL, "stroke_width": 1.0, "stroke_opacity": 0.25},
            axis_config={"stroke_color": COLOR_TEAL, "stroke_width": 1.5, "stroke_opacity": 0.6}
        ).shift(DOWN * 0.4)
        
        grid_label = Text("参考坐标系单位：度 (Degree)", font="Source Han Serif CN", font_size=12, color=COLOR_TEAL).next_to(grid_deg, UP, buff=0.2)
        
        # Precise technical ticks / coordinate numbers along axes (Degrees)
        grid_labels = VGroup()
        for x_val in [-180, -90, 0, 90, 180]:
            label_text = f"{abs(x_val)}°W" if x_val < 0 else (f"{x_val}°E" if x_val > 0 else "0°")
            lbl = Text(label_text, font="Consolas", font_size=8, color=COLOR_MUTED)
            lbl.move_to(grid_deg.coords_to_point(x_val, 0) + DOWN * 0.2)
            grid_labels.add(lbl)
            
        for y_val in [-60, -30, 30, 60]:
            label_text = f"{abs(y_val)}°S" if y_val < 0 else f"{y_val}°N"
            lbl = Text(label_text, font="Consolas", font_size=8, color=COLOR_MUTED)
            lbl.move_to(grid_deg.coords_to_point(0, y_val) + LEFT * 0.25)
            grid_labels.add(lbl)
            
        self.play(Create(grid_deg), FadeIn(grid_labels), Write(grid_label))
        self.wait(0.5)
        
        # Shanghai point: (121, 31) in Degree grid
        shanghai_pos = grid_deg.coords_to_point(121, 31)
        shanghai_dot = Dot(shanghai_pos, color=COLOR_RED, radius=0.08)
        shanghai_pulse = Circle(radius=0.15, color=COLOR_RED, stroke_width=1.5, stroke_opacity=0.7).move_to(shanghai_pos)
        shanghai_label = Text("上海 (121°E, 31°N)", font="Source Han Serif CN", font_size=11, color=COLOR_RED).next_to(shanghai_dot, UP + RIGHT, buff=0.08)
        
        self.play(Create(shanghai_dot), Create(shanghai_pulse), Write(shanghai_label))
        self.wait(1.5)
        
        # Displaying coordinate metadata sheet (shanghai.prj file card)
        prj_rect = RoundedRectangle(
            corner_radius=0.1, 
            height=1.6, 
            width=2.4, 
            color=COLOR_TEAL, 
            stroke_width=1.5,
            fill_color=COLOR_CARD_BG, 
            fill_opacity=0.9
        ).to_edge(UP, buff=1.6).shift(RIGHT * 4.2)
        prj_title = Text("shanghai.prj", font="Consolas", font_size=11, color=COLOR_TEXT).move_to(prj_rect.get_top() + DOWN * 0.3)
        prj_desc = Text("坐标系身份证", font="Source Han Serif CN", font_size=10, color=COLOR_MUTED).next_to(prj_title, DOWN, buff=0.1)
        
        # Simulated lines inside document
        prj_lines = VGroup()
        for i in range(3):
            line = Line(
                prj_rect.get_left() + RIGHT * 0.3 + DOWN * (i * 0.15 + 0.95),
                prj_rect.get_right() - RIGHT * 0.3 + DOWN * (i * 0.15 + 0.95),
                stroke_width=1,
                color=COLOR_CARD_BORDER
            )
            prj_lines.add(line)
        prj_doc = VGroup(prj_rect, prj_title, prj_desc, prj_lines)
        
        self.play(FadeIn(prj_doc, shift=DOWN))
        self.wait(0.8)
        
        # Red cross deletes it
        red_x = Cross(prj_doc, stroke_color=COLOR_RED, stroke_width=4)
        self.play(Create(red_x))
        self.wait(0.5)
        
        # Warning shake glitch effect followed by collapse/implosion
        self.play(prj_doc.animate.shift(LEFT * 0.08), run_time=0.04)
        self.play(prj_doc.animate.shift(RIGHT * 0.16), run_time=0.04)
        self.play(prj_doc.animate.shift(LEFT * 0.08), run_time=0.04)
        
        warning_msg = MarkupText("⚠️ <b>CRITICAL WARNING: MISSING .PRJ FILE!</b>", font_size=13, color=COLOR_RED).to_edge(UP, buff=1.6).shift(LEFT * 3.0)
        self.play(
            FadeOut(prj_doc, scale=0.1),
            FadeOut(red_x, scale=0.1),
            Write(warning_msg)
        )
        self.wait(1)
        
        explain_text = MarkupText("软件丢失参考参数，被迫将原始数字 <b>121, 31</b> 强行识别为 <b>121米, 31米</b>！", font_size=15, color=COLOR_YELLOW).to_edge(DOWN, buff=0.8)
        self.play(Write(explain_text))
        self.wait(2.5)
        
        # 2. Projected Grid (Meters grid, Blue/Indigo theme)
        grid_meter = NumberPlane(
            x_range=[-20000000, 20000000, 5000000],
            y_range=[-10000000, 10000000, 2500000],
            x_length=10.5,
            y_length=5.0,
            background_line_style={"stroke_color": COLOR_BLUE, "stroke_width": 1.0, "stroke_opacity": 0.25},
            axis_config={"stroke_color": COLOR_BLUE, "stroke_width": 1.5, "stroke_opacity": 0.6}
        ).shift(DOWN * 0.4)
        
        grid_label_meter = Text("参考坐标系单位：米 (Meter)", font="Source Han Serif CN", font_size=12, color=COLOR_BLUE).next_to(grid_meter, UP, buff=0.2)
        
        # Meters Axis Labels
        grid_labels_meter = VGroup()
        for x_val in [-20000000, -10000000, 0, 10000000, 20000000]:
            label_text = f"{x_val // 1000000}M m" if x_val != 0 else "0m"
            lbl = Text(label_text, font="Consolas", font_size=8, color=COLOR_MUTED)
            lbl.move_to(grid_meter.coords_to_point(x_val, 0) + DOWN * 0.2)
            grid_labels_meter.add(lbl)
            
        for y_val in [-7500000, -5000000, -2500000, 2500000, 5000000, 7500000]:
            label_text = f"{y_val // 1000000}M m"
            lbl = Text(label_text, font="Consolas", font_size=8, color=COLOR_MUTED)
            lbl.move_to(grid_meter.coords_to_point(0, y_val) + LEFT * 0.25)
            grid_labels_meter.add(lbl)
            
        # Detailed Vector Buoy at Null Island (0,0)
        island_land = Circle(radius=0.22, color=COLOR_TEAL, fill_color=COLOR_CARD_BG, fill_opacity=0.9).move_to(grid_meter.coords_to_point(0,0))
        origin_dot = Dot(island_land.get_center(), color=COLOR_ORANGE, radius=0.04)
        island_flagpole = Line(island_land.get_center(), island_land.get_center() + UP * 0.45 + RIGHT * 0.15, color=COLOR_MUTED, stroke_width=2)
        island_flag = Polygon(
            island_flagpole.get_end(),
            island_flagpole.get_end() + DOWN * 0.18 + RIGHT * 0.25,
            island_flagpole.get_end() + DOWN * 0.18,
            color=COLOR_RED, fill_color=COLOR_RED, fill_opacity=0.9
        )
        island_label = Text("Null Island", font="Consolas", font_size=9, color=COLOR_TEAL).next_to(island_land, DOWN, buff=0.1)
        water_ring1 = Circle(radius=0.3, color=COLOR_BLUE, stroke_width=0.7, stroke_opacity=0.3).move_to(island_land.get_center())
        water_ring2 = Circle(radius=0.4, color=COLOR_BLUE, stroke_width=0.5, stroke_opacity=0.2).move_to(island_land.get_center())
        null_island = VGroup(island_land, origin_dot, island_flagpole, island_flag, island_label, water_ring1, water_ring2)
        
        # Shanghai point drifts to origin due to scale morph
        drift_dest = grid_meter.coords_to_point(121, 31)
        
        # HUD Metadata label details
        sh_label_box = RoundedRectangle(
            corner_radius=0.08, 
            height=1.0, 
            width=2.5, 
            color=COLOR_RED, 
            stroke_width=1,
            fill_color=COLOR_CARD_BG, 
            fill_opacity=0.85
        ).move_to(drift_dest + UP * 1.1 + RIGHT * 1.6)
        
        sh_label_f1 = Text("Shanghai (Lost CRS)", font="Consolas", font_size=10, color=COLOR_RED)
        sh_label_f2 = Text("Drifted to: (121m, 31m)", font="Consolas", font_size=9, color=COLOR_TEXT)
        sh_label_content = VGroup(sh_label_f1, sh_label_f2).arrange(DOWN, buff=0.1).move_to(sh_label_box.get_center())
        sh_label_final = VGroup(sh_label_box, sh_label_content)
        hud_line = Line(sh_label_box.get_bottom() + LEFT * 0.5, drift_dest, color=COLOR_RED, stroke_width=1, stroke_opacity=0.6)
        
        # Scale morphing animation
        self.play(
            Transform(grid_deg, grid_meter),
            Transform(grid_label, grid_label_meter),
            Transform(grid_labels, grid_labels_meter),
            shanghai_dot.animate.move_to(drift_dest),
            shanghai_pulse.animate.move_to(drift_dest),
            Transform(shanghai_label, sh_label_final),
            FadeIn(null_island),
            FadeIn(hud_line),
            FadeOut(explain_text),
            FadeOut(warning_msg),
            run_time=3
        )
        
        # Pulse waves around new point
        self.play(
            shanghai_pulse.animate.scale(5.0).set_opacity(0),
            run_time=0.8
        )
        self.wait(1.5)
        
        # Ending explanation
        ending_text = MarkupText("这就是为什么你的数据会瞬间<b>飞到非洲几内亚湾的非洲海里</b>！", font_size=18, color=COLOR_RED).to_edge(DOWN, buff=0.8)
        self.play(Write(ending_text))
        self.wait(3.5)
        
        # Clear Stage
        self.play(
            FadeOut(grid_deg),
            FadeOut(grid_label),
            FadeOut(grid_labels),
            FadeOut(shanghai_dot),
            FadeOut(shanghai_label),
            FadeOut(null_island),
            FadeOut(hud_line),
            FadeOut(ending_text),
            FadeOut(title)
        )
        self.wait(1)


class ProjectRasterScene(Scene):
    def construct(self):
        self.camera.background_color = COLOR_BG
        
        # Title
        title_text = MarkupText("Project Raster (投影栅格) 核心原理", font_size=22, color=COLOR_TEXT).to_edge(UP, buff=0.4)
        title_line = Line(LEFT * 5.5, RIGHT * 5.5, color=COLOR_CARD_BORDER, stroke_width=1.5).next_to(title_text, DOWN, buff=0.15)
        title = VGroup(title_text, title_line)
        
        self.play(FadeIn(title))
        self.wait(0.5)
        
        # ================= 1. Raster structure demo =================
        part1_title = MarkupText("1. 栅格结构：头文件参数与像元推算", font_size=18, color=COLOR_TEAL).next_to(title_line, DOWN, buff=0.4)
        self.play(Write(part1_title))
        
        # Draw a beautiful 5x5 terrain colorful DEM (Digital Elevation Model)
        grid_rows, grid_cols = 5, 5
        cell_size = 0.55
        
        dem_colors = [
            ["#10B981", "#059669", "#047857"], # Green (low valleys)
            ["#84CC16", "#65A30D", "#4D7C0F"], # Lime (lowlands)
            ["#EAB308", "#CA8A04", "#A16207"], # Yellow (plateau)
            ["#F97316", "#EA580C", "#C2410C"], # Orange (high hills)
            ["#EF4444", "#DC2626", "#B91C1C"], # Red (peaks)
        ]
        
        # Custom elevations for coordinates
        heights = [
            [0, 0, 1, 2, 2],
            [0, 1, 2, 3, 3],
            [1, 2, 3, 4, 4],
            [2, 3, 4, 4, 3],
            [2, 2, 3, 3, 2]
        ]
        
        cells = VGroup()
        for r in range(grid_rows):
            for c in range(grid_cols):
                h = heights[r][c]
                f_color = dem_colors[h][(r + c) % len(dem_colors[h])]
                cell = Square(
                    side_length=cell_size,
                    stroke_color=COLOR_CARD_BORDER,
                    stroke_width=1,
                    fill_color=f_color,
                    fill_opacity=0.8
                )
                x_pos = (c - grid_cols/2 + 0.5) * cell_size - 3.5
                y_pos = (grid_rows/2 - r - 0.5) * cell_size - 0.2
                cell.move_to([x_pos, y_pos, 0])
                cells.add(cell)
        
        self.play(Create(cells))
        self.wait(0.5)
        
        # Highlight Origin Cell (0,0) (top left cell)
        top_left_cell = cells[0]
        self.play(
            top_left_cell.animate.set_fill(COLOR_TEAL, opacity=0.9).set_stroke(COLOR_TEAL, width=2.5),
            run_time=0.6
        )
        
        # Info Box (fixed tofu text issue)
        info_rect = RoundedRectangle(
            corner_radius=0.1, 
            height=2.5, 
            width=4.0, 
            color=COLOR_CARD_BORDER, 
            stroke_width=1.5,
            fill_color=COLOR_CARD_BG, 
            fill_opacity=0.9
        ).shift(RIGHT * 1.5 + DOWN * 0.2)
        info_header = Text("Raster Header 文件头", font="Source Han Serif CN", font_size=11, color=COLOR_TEAL).next_to(info_rect.get_top(), DOWN, buff=0.2)
        info_content = Text(
            "Origin: (X0, Y0)\n"
            "Cell Size: 30m x 30m\n"
            "Columns: 5\n"
            "Rows: 5\n"
            "CRS: WGS84 (DEG)",
            font="Consolas", font_size=11, color=COLOR_TEXT
        ).next_to(info_header, DOWN, buff=0.2, aligned_edge=LEFT)
        info_grp = VGroup(info_rect, info_header, info_content)
        
        self.play(FadeIn(info_grp, shift=LEFT))
        
        # Arrow pointing to top-left cell origin
        origin_pointer = Arrow(start=info_rect.get_left() + UP * 0.7, end=top_left_cell.get_center(), color=COLOR_TEAL, stroke_width=3)
        origin_lbl = Text("左上角地理坐标 (X0, Y0)", font="Source Han Serif CN", font_size=10, color=COLOR_TEAL).next_to(origin_pointer, UP, buff=0.1)
        
        self.play(GrowArrow(origin_pointer), Write(origin_lbl))
        self.wait(2.5)
        
        # Clear Stage 1
        self.play(FadeOut(info_grp), FadeOut(origin_pointer), FadeOut(origin_lbl), FadeOut(part1_title))
        self.wait(0.5)
        
        # ================= 2. Distortion representation =================
        part2_title = MarkupText("2. 投影转换：网格因地球曲率发生扭曲变形", font_size=18, color=COLOR_BLUE).next_to(title_line, DOWN, buff=0.4)
        self.play(Write(part2_title))
        
        # Compute deformation matrix
        theta = 12 * DEGREES
        rot_matrix = [[np.cos(theta), -np.sin(theta), 0], [np.sin(theta), np.cos(theta), 0], [0, 0, 1]]
        shear_matrix = [[1, 0.25, 0], [0, 1, 0], [0, 0, 1]]
        combined_matrix = np.dot(shear_matrix, rot_matrix)
        
        deformed_cells = cells.copy()
        
        self.play(
            deformed_cells.animate.shift(RIGHT * 6.5).set_color(COLOR_RED),
            run_time=1.2
        )
        self.play(
            deformed_cells.animate.apply_matrix(combined_matrix),
            run_time=1.0
        )
        
        # Warning alert box for orthographic computer constraints
        warn_box = RoundedRectangle(
            corner_radius=0.1, 
            height=1.8, 
            width=5.8, 
            color=COLOR_RED, 
            stroke_width=1.5,
            fill_color="#270510", 
            fill_opacity=0.95
        ).shift(LEFT * 3.5 + DOWN * 0.2)
        
        warn_txt1 = Text("⚠️ 计算机存储限制：", font="Source Han Serif CN", font_size=12, color=COLOR_RED)
        warn_txt2 = Text("栅格数据在硬盘中必须按【正交行列矩阵】存储", font="Source Han Serif CN", font_size=10, color=COLOR_TEXT)
        warn_txt3 = Text("计算机无法直接保存倾斜或弯曲的物理像素！", font="Source Han Serif CN", font_size=10, color=COLOR_MUTED)
        warn_text_grp = VGroup(warn_txt1, warn_txt2, warn_txt3).arrange(DOWN, buff=0.15).move_to(warn_box.get_center())
        warn_grp = VGroup(warn_box, warn_text_grp)
        
        red_x = Cross(deformed_cells, stroke_color=COLOR_RED, stroke_width=5)
        
        self.play(FadeIn(warn_grp, shift=UP), Create(red_x))
        self.wait(3.5)
        
        self.play(FadeOut(warn_grp), FadeOut(red_x), FadeOut(part2_title))
        self.wait(0.5)
        
        # ================= 3. Resampling solution =================
        part3_title = MarkupText("3. 解决方案：重采样 (Resampling) 与反向插值", font_size=18, color=COLOR_GREEN).next_to(title_line, DOWN, buff=0.4)
        self.play(Write(part3_title))
        
        # Re-color the distorted grid as source
        self.play(deformed_cells.animate.set_opacity(0.85))
        
        # Build target grid (Clean, flat, axis-aligned target cells)
        target_cells = VGroup()
        for r in range(grid_rows):
            for c in range(grid_cols):
                cell = Square(
                    side_length=cell_size, 
                    stroke_color=COLOR_BLUE, 
                    stroke_width=1, 
                    fill_color=COLOR_CARD_BG, 
                    fill_opacity=0.1
                )
                x_pos = (c - grid_cols/2 + 0.5) * cell_size - 3.5
                y_pos = (grid_rows/2 - r - 0.5) * cell_size - 0.2
                cell.move_to([x_pos, y_pos, 0])
                target_cells.add(cell)
        
        lbl_old = Text("旧坐标系 A (变形的原始图像)", font="Source Han Serif CN", font_size=10, color=COLOR_MUTED).next_to(deformed_cells, UP, buff=0.2)
        lbl_new = Text("新坐标系 B (创建的新空白网格)", font="Source Han Serif CN", font_size=10, color=COLOR_BLUE).next_to(target_cells, UP, buff=0.2)
        
        self.play(Create(target_cells), Write(lbl_old), Write(lbl_new))
        self.wait(1)
        
        # Single pixel demo: cell (2,2) -> index 12
        demo_idx = 12
        demo_cell = target_cells[demo_idx]
        demo_center = Dot(demo_cell.get_center(), color=COLOR_BLUE, radius=0.06)
        
        self.play(
            demo_cell.animate.set_stroke(COLOR_BLUE, width=3).set_fill(COLOR_CARD_BG, opacity=0.4),
            Create(demo_center)
        )
        self.wait(0.5)
        
        # Inverse mapping: point coordinates mapped back to distorted grid
        deformed_center_pos = deformed_cells[12].get_center() + UP * 0.12 + RIGHT * 0.08
        proj_arrow = DoubleArrow(demo_center.get_center(), deformed_center_pos, color=COLOR_ORANGE, stroke_width=2.5)
        proj_arrow_lbl = Text("反向投影算回老坐标系", font="Source Han Serif CN", font_size=9, color=COLOR_ORANGE).next_to(proj_arrow, UP, buff=0.02).rotate(proj_arrow.get_angle())
        
        self.play(GrowArrow(proj_arrow), Write(proj_arrow_lbl))
        self.wait(1)
        
        dest_dot = Dot(deformed_center_pos, color=COLOR_YELLOW, radius=0.06)
        self.play(Create(dest_dot))
        
        # Query neighboring cells
        neighbors_idx = [7, 8, 12, 13]
        neighbor_anims = [deformed_cells[idx].animate.set_stroke(COLOR_YELLOW, width=2.5).set_fill(opacity=0.95) for idx in neighbors_idx]
        self.play(*neighbor_anims)
        self.wait(1)
        
        # Interpolation step: flow particles from neighbors to destination
        ripples = VGroup()
        for idx in neighbors_idx:
            particle = Dot(deformed_cells[idx].get_center(), color=COLOR_YELLOW, radius=0.05)
            ripples.add(particle)
            
        self.play(FadeIn(ripples))
        self.play(
            *[p.animate.move_to(dest_dot.get_center()) for p in ripples],
            run_time=0.8
        )
        self.play(FadeOut(ripples), dest_dot.animate.scale(1.5).set_color(COLOR_ORANGE))
        self.wait(0.5)
        
        # Send resampled value particle back to target cell
        fill_color = deformed_cells[12].get_fill_color()
        self.play(
            dest_dot.animate.move_to(demo_center.get_center()),
            FadeOut(proj_arrow),
            FadeOut(proj_arrow_lbl),
            run_time=0.8
        )
        
        self.play(
            demo_cell.animate.set_fill(fill_color, opacity=0.85).set_stroke(COLOR_BLUE, width=1),
            FadeOut(dest_dot),
            FadeOut(demo_center)
        )
        self.wait(1)
        
        # Complete sweep resampling scan
        sweep_line = Line(
            target_cells.get_top() + LEFT * 0.15,
            target_cells.get_bottom() + LEFT * 0.15,
            color=COLOR_TEAL,
            stroke_width=3
        )
        sweep_line.set_opacity(0.8)
        
        self.play(FadeIn(sweep_line))
        
        col_anims = []
        for col in range(grid_cols):
            anims = []
            for r in range(grid_rows):
                idx = r * grid_cols + col
                if idx == demo_idx:
                    continue
                def_cell = deformed_cells[idx]
                target_cell = target_cells[idx]
                resample_color = def_cell.get_fill_color()
                anims.append(target_cell.animate.set_fill(resample_color, opacity=0.85).set_stroke(COLOR_BLUE, width=1))
            col_anims.append(AnimationGroup(*anims, run_time=0.4))
            
        self.play(
            sweep_line.animate.move_to(target_cells.get_right() + RIGHT * 0.15),
            LaggedStart(*col_anims, lag_ratio=0.8),
            run_time=2.5,
            rate_func=rate_functions.linear
        )
        self.play(FadeOut(sweep_line))
        self.wait(2.5)
        
        # Clear Stage
        self.play(
            FadeOut(target_cells),
            FadeOut(deformed_cells),
            FadeOut(lbl_old),
            FadeOut(lbl_new),
            FadeOut(part3_title),
            FadeOut(title)
        )
        self.wait(1)
