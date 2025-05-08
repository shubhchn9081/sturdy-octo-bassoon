from PIL import Image
import os

def extract_icons():
    # Create output directories
    os.makedirs("client/public/images/games/slots/classic", exist_ok=True)
    os.makedirs("client/public/images/games/slots/space", exist_ok=True)
    os.makedirs("client/public/images/games/slots/fantasy", exist_ok=True)
    os.makedirs("client/public/images/games/slots/sports", exist_ok=True)
    os.makedirs("client/public/images/games/slots/adventure", exist_ok=True)
    os.makedirs("client/public/images/games/slots/generic", exist_ok=True)
    
    # Image 1 - Main slot icons
    img1_path = "attached_assets/ChatGPT Image May 8, 2025, 07_59_38 PM.png"
    img1 = Image.open(img1_path)
    
    # Image dimensions and grid info
    width, height = img1.size
    rows, cols = 5, 5
    icon_width = width // cols
    icon_height = height // rows
    
    # Dictionary to store icon info (row, col): (filename, theme_folder)
    icons_info = {
        # Row 1
        (0, 0): ("bonus_purple.png", "generic"),
        (0, 1): ("crystal_purple.png", "space"),
        (0, 2): ("saxophone_gold.png", "classic"),
        (0, 3): ("moai_head.png", "adventure"),
        (0, 4): ("ring_turquoise.png", "adventure"),
        
        # Row 2
        (1, 0): ("scatter_mask.png", "adventure"),
        (1, 1): ("gem_green.png", "adventure"),
        (1, 2): ("snake_red.png", "adventure"),
        (1, 3): ("alien_green.png", "space"),
        (1, 4): ("cherries_red.png", "classic"),
        
        # Row 3
        (2, 0): ("wild_red.png", "generic"),
        (2, 1): ("mushroom_red.png", "fantasy"),
        (2, 2): ("horseshoe_gold.png", "classic"),
        (2, 3): ("clover_four_leaf.png", "classic"),
        (2, 4): ("leaf_green.png", "classic"),
        
        # Row 4
        (3, 0): ("bonus_star.png", "generic"),
        (3, 1): ("dragon_gold.png", "fantasy"),
        (3, 2): ("gold_bar.png", "classic"),
        (3, 3): ("coins_stack.png", "classic"),
        (3, 4): ("dragon_red.png", "fantasy"),
        
        # Row 5
        (4, 0): ("wild_football.png", "sports"),
        (4, 1): ("boot_orange.png", "sports"),
        (4, 2): ("jersey_green.png", "sports"),
        (4, 3): ("trophy_gold.png", "sports"),
        (4, 4): ("gloves_goalkeeper.png", "sports"),
    }
    
    # Extract and save icons
    for (row, col), (filename, theme) in icons_info.items():
        left = col * icon_width
        upper = row * icon_height
        right = left + icon_width
        lower = upper + icon_height
        
        icon = img1.crop((left, upper, right, lower))
        output_path = f"client/public/images/games/slots/{theme}/{filename}"
        icon.save(output_path, format="PNG")
        print(f"Saved {output_path}")
    
    # Image 2 - Themed slot game icons
    img2_path = "attached_assets/ChatGPT Image May 8, 2025, 07_59_52 PM.png"
    img2 = Image.open(img2_path)
    
    # Image dimensions and grid info (same as image 1)
    width, height = img2.size
    rows, cols = 5, 5
    icon_width = width // cols
    icon_height = height // rows
    
    # Dictionary to store icon info for image 2
    icons_info_2 = {
        # Row 1
        (0, 0): ("cosmic_spins_logo.png", "space"),
        (0, 1): ("planet_purple.png", "space"),
        (0, 2): ("diamond_blue.png", "space"),
        (0, 3): ("letter_k_green.png", "space"),
        (0, 4): ("moon_gray.png", "space"),
        
        # Row 2
        (1, 0): ("temple_quest_logo.png", "adventure"),
        (1, 1): ("mask_gold.png", "adventure"),
        (1, 2): ("letter_q_red.png", "adventure"),
        (1, 3): ("letter_j_blue.png", "adventure"),
        (1, 4): ("pyramid_gold.png", "adventure"),
        
        # Row 3
        (2, 0): ("lucky_sevens_logo.png", "classic"),
        (2, 1): ("seven_red_triple.png", "classic"),
        (2, 2): ("seven_red_single.png", "classic"),
        (2, 3): ("seven_red_single.png", "classic"),  # Duplicate, will be overwritten
        (2, 4): ("cherry_red.png", "classic"),
        
        # Row 4
        (3, 0): ("dragons_gold_logo.png", "fantasy"),
        (3, 1): ("dragon_red_face.png", "fantasy"),
        (3, 2): ("coin_dragon.png", "fantasy"),
        (3, 3): ("bar_symbol.png", "classic"),
        (3, 4): ("lemon_yellow.png", "classic"),
        
        # Row 5
        (4, 0): ("football_frenzy_logo.png", "sports"),
        (4, 1): ("football_ball.png", "sports"),
        (4, 2): ("trophy_cup.png", "sports"),
        (4, 3): ("letter_a_red.png", "sports"),
        (4, 4): ("letter_k_blue_boot.png", "sports"),
    }
    
    # Extract and save icons from image 2
    for (row, col), (filename, theme) in icons_info_2.items():
        left = col * icon_width
        upper = row * icon_height
        right = left + icon_width
        lower = upper + icon_height
        
        icon = img2.crop((left, upper, right, lower))
        output_path = f"client/public/images/games/slots/{theme}/{filename}"
        icon.save(output_path, format="PNG")
        print(f"Saved {output_path}")
    
    print("All icons extracted and saved successfully!")

if __name__ == "__main__":
    extract_icons()