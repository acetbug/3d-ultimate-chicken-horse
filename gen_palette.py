from PIL import Image, ImageDraw
import colorsys

# ================= 配置区域 =================
OUTPUT_FILENAME = "master_palette.png"
IMG_SIZE = 1024        # 图片分辨率 1024x1024
GRID_COLS = 32         # 网格列数 (32列)
GRID_ROWS = 32         # 网格行数 (32行)
CELL_SIZE = IMG_SIZE // GRID_COLS
# ===========================================

def hsv2rgb(h, s, v):
    """辅助函数：将 HSV (0-1) 转为 RGB (0-255)"""
    r, g, b = colorsys.hsv_to_rgb(h, s, v)
    return int(r * 255), int(g * 255), int(b * 255)

def hex2rgb(hex_color):
    """辅助函数：将 Hex 颜色转为 RGB"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def draw_cell(draw, col, row, color):
    """在指定行列绘制一个色块"""
    x0 = col * CELL_SIZE
    y0 = row * CELL_SIZE
    x1 = x0 + CELL_SIZE
    y1 = y0 + CELL_SIZE
    draw.rectangle([x0, y0, x1, y1], fill=color)

def main():
    # 创建画布
    image = Image.new("RGB", (IMG_SIZE, IMG_SIZE), "white")
    draw = ImageDraw.Draw(image)

    print(f"开始生成色卡 {IMG_SIZE}x{IMG_SIZE} (格子: {GRID_COLS}x{GRID_ROWS})...")

    # ==========================================
    # 区域 1: 游戏专用材质 (前 6 行)
    # ==========================================
    # 我们预定义一些常用的材质颜色，方便快速拾取
    
    custom_materials = [
        # Row 0: 木头 (深 -> 浅)
        ["#3E2723", "#4E342E", "#5D4037", "#6D4C41", "#795548", "#8D6E63", "#A1887F", "#BCAAA4"], 
        # Row 1: 金属/石材 (蓝灰系)
        ["#263238", "#37474F", "#455A64", "#546E7A", "#607D8B", "#78909C", "#90A4AE", "#B0BEC5"],
        # Row 2: 危险/陷阱 (红/黄/黑)
        ["#B71C1C", "#C62828", "#D32F2F", "#E53935", "#F57F17", "#F9A825", "#FBC02D", "#FDD835"],
        # Row 3: 自然环境 (草地/树叶/水)
        ["#1B5E20", "#2E7D32", "#388E3C", "#43A047", "#01579B", "#0277BD", "#0288D1", "#039BE5"],
        # Row 4: 特殊道具 (冰/蜜/紫传送门)
        ["#E1F5FE", "#B3E5FC", "#81D4FA", "#4FC3F7", "#FFF8E1", "#FFECB3", "#FFE082", "#FFD54F", "#4A148C", "#6A1B9A", "#7B1FA2", "#8E24AA"],
        # Row 5: 角色皮肤/毛发 (动物色)
        ["#FAFAFA", "#F5F5F5", "#EEEEEE", "#E0E0E0", "#3E2723", "#4E342E", "#5D4037", "#6D4C41", "#FFF3E0", "#FFE0B2", "#FFCC80", "#FFB74D"]
    ]

    current_row = 0
    
    # 绘制自定义材质
    for material_row in custom_materials:
        for col, hex_color in enumerate(material_row):
            # 如果预定义颜色不够填满一行，就重复最后一个颜色，或者留白
            if col < GRID_COLS:
                draw_cell(draw, col, current_row, hex2rgb(hex_color))
        # 填满这一行剩余的部分（用该行最后一个颜色填充，防止空缺）
        last_color = hex2rgb(material_row[-1])
        for col in range(len(material_row), GRID_COLS):
             draw_cell(draw, col, current_row, last_color)
        current_row += 1

    # ==========================================
    # 区域 2: 全光谱彩虹色 (占据中间大部分)
    # ==========================================
    # 这是一个通用的调色板。
    # X轴: 色相 (Hue) 0-360
    # Y轴: 亮度 (Value/Lightness) 暗 -> 亮
    
    spectrum_rows = GRID_ROWS - current_row - 4 # 留最后4行给灰阶
    
    for r in range(spectrum_rows):
        # 亮度从 20% 到 95% 变化
        value = 0.2 + (0.75 * (r / spectrum_rows))
        
        for c in range(GRID_COLS):
            # 色相从 0 到 1 变化
            hue = c / GRID_COLS
            # 饱和度保持较高，适合卡通风格 (0.7 - 0.9)
            saturation = 0.85
            
            rgb = hsv2rgb(hue, saturation, value)
            draw_cell(draw, c, current_row + r, rgb)

    current_row += spectrum_rows

    # ==========================================
    # 区域 3: 灰阶 (最后 4 行)
    # ==========================================
    # 专门用于金属、石头、阴影细节
    
    # 纯黑白灰
    for r in range(2): # 2行冷灰
        for c in range(GRID_COLS):
            # 线性灰度 0 - 255
            gray_val = int((c / (GRID_COLS - 1)) * 255)
            draw_cell(draw, c, current_row + r, (gray_val, gray_val, gray_val))
            
    # 暖灰 (Sepia tone) - 适合老旧物体
    for c in range(GRID_COLS):
        gray_val = int((c / (GRID_COLS - 1)) * 255)
        # 给灰色加一点点红/黄色调
        warm_gray = (min(gray_val + 20, 255), min(gray_val + 15, 255), gray_val)
        draw_cell(draw, c, current_row + 2, warm_gray)
        
    # 冷灰 (Cool Gray) - 适合科幻金属
    for c in range(GRID_COLS):
        gray_val = int((c / (GRID_COLS - 1)) * 255)
        # 给灰色加一点点蓝
        cool_gray = (gray_val, min(gray_val + 10, 255), min(gray_val + 20, 255))
        draw_cell(draw, c, current_row + 3, cool_gray)

    # ==========================================
    # 保存
    # ==========================================
    image.save(OUTPUT_FILENAME)
    print(f"成功！色卡已保存为: {OUTPUT_FILENAME}")
    print("使用方法: 在 Blender 中将材质 Base Color 设为此图，并将插值改为 'Closest'")

if __name__ == "__main__":
    main()