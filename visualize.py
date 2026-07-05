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
        kwargs.setdefault("font", "Source Han Serif CN")
        kwargs.setdefault("weight", SEMIBOLD)
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

        # ── Cue 39: Back-projection mapping
        # Highlight target cell (2, 2) -> index 12
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

        # ── Cue 47: Interpolation Blending
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

        # ── Cue 51: Sweep and Fill all remaining cells
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
