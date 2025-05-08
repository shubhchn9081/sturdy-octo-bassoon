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
    os.makedirs("client/public/images/games/slots/aztec", exist_ok=True)
    os.makedirs("client/public/images/games/slots/celestial", exist_ok=True)
    
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
        # Add padding to ensure we don't get partial neighboring icons
        padding = int(icon_width * 0.25)  # 25% padding for better isolation
        left = col * icon_width + padding
        upper = row * icon_height + padding
        right = (col + 1) * icon_width - padding
        lower = (row + 1) * icon_height - padding
        
        icon = img1.crop((left, upper, right, lower))
        
        # Create transparent background
        if icon.mode != 'RGBA':
            icon = icon.convert('RGBA')
            
        # Apply additional processing to remove any partial neighboring icons
        # by adding an alpha threshold mask - make pixels near edges more likely to be transparent
        data = icon.getdata()
        new_data = []
        width, height = icon.size
        for y in range(height):
            for x in range(width):
                idx = y * width + x
                r, g, b, a = data[idx]
                
                # Check if near edge and not very prominent (semi-transparent or grayish)
                edge_threshold = min(width, height) // 10
                is_near_edge = (x < edge_threshold or x >= width - edge_threshold or 
                               y < edge_threshold or y >= height - edge_threshold)
                
                is_not_prominent = (r + g + b) / 3 < 100 or a < 200
                
                if is_near_edge and is_not_prominent:
                    new_data.append((r, g, b, 0))  # Make transparent
                else:
                    new_data.append((r, g, b, a))
        
        # Create a white background image
        background = Image.new('RGBA', icon.size, (255, 255, 255, 0))
        
        # Composite the icon onto the transparent background
        final_icon = Image.alpha_composite(background, icon)
        
        output_path = f"client/public/images/games/slots/{theme}/{filename}"
        final_icon.save(output_path, format="PNG")
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
        # Add padding to ensure we don't get partial neighboring icons
        padding = int(icon_width * 0.25)  # 25% padding for better isolation
        left = col * icon_width + padding
        upper = row * icon_height + padding
        right = (col + 1) * icon_width - padding
        lower = (row + 1) * icon_height - padding
        
        icon = img2.crop((left, upper, right, lower))
        
        # Create transparent background
        if icon.mode != 'RGBA':
            icon = icon.convert('RGBA')
            
        # Apply additional processing to remove any partial neighboring icons
        # by adding an alpha threshold mask - make pixels near edges more likely to be transparent
        data = icon.getdata()
        new_data = []
        width, height = icon.size
        for y in range(height):
            for x in range(width):
                idx = y * width + x
                r, g, b, a = data[idx]
                
                # Check if near edge and not very prominent (semi-transparent or grayish)
                edge_threshold = min(width, height) // 10
                is_near_edge = (x < edge_threshold or x >= width - edge_threshold or 
                               y < edge_threshold or y >= height - edge_threshold)
                
                is_not_prominent = (r + g + b) / 3 < 100 or a < 200
                
                if is_near_edge and is_not_prominent:
                    new_data.append((r, g, b, 0))  # Make transparent
                else:
                    new_data.append((r, g, b, a))
        
        icon.putdata(new_data)
        
        # Create a white background image
        background = Image.new('RGBA', icon.size, (255, 255, 255, 0))
        
        # Composite the icon onto the transparent background
        final_icon = Image.alpha_composite(background, icon)
        
        output_path = f"client/public/images/games/slots/{theme}/{filename}"
        final_icon.save(output_path, format="PNG")
        print(f"Saved {output_path}")
    
    # Image 3 - Aztec and Celestial themed icons
    img3_path = "attached_assets/ChatGPT Image May 8, 2025, 08_08_57 PM.png"
    
    if os.path.exists(img3_path):
        img3 = Image.open(img3_path)
        
        # Image dimensions and grid info (same as previous images)
        width, height = img3.size
        rows, cols = 5, 5
        icon_width = width // cols
        icon_height = height // rows
        
        # Dictionary to store icon info for image 3
        icons_info_3 = {
            # Row 1
            (0, 0): ("moon_crater.png", "space"),
            (0, 1): ("planet_orange.png", "space"),
            (0, 2): ("crystals_colorful.png", "fantasy"),
            (0, 3): ("sun_face.png", "celestial"),
            (0, 4): ("crescent_moon.png", "celestial"),
            
            # Row 2
            (1, 0): ("wild_planet.png", "space"),
            (1, 1): ("meteor.png", "space"),
            (1, 2): ("emerald.png", "fantasy"),
            (1, 3): ("aztec_face.png", "aztec"),
            (1, 4): ("roman_helmet.png", "adventure"),
            
            # Row 3
            (2, 0): ("aztec_chief.png", "aztec"),
            (2, 1): ("bonus_plate.png", "generic"),
            (2, 2): ("letter_q_green.png", "generic"),
            (2, 3): ("letter_q_gold.png", "generic"),
            (2, 4): ("letter_k_blue.png", "generic"),
            
            # Row 4
            (3, 0): ("diamond_blue.png", "fantasy"),
            (3, 1): ("pyramid.png", "aztec"),
            (3, 2): ("stone_face.png", "aztec"),
            (3, 3): ("coins_stack_gold.png", "classic"),
            (3, 4): ("number_10_gold.png", "generic"),
            
            # Row 5
            (4, 0): ("coins_small.png", "classic"),
            (4, 1): ("number_5_gold.png", "generic"),
            (4, 2): ("coins_medium.png", "classic"),
            (4, 3): ("lucky_seven.png", "classic"),
            (4, 4): ("seven_red.png", "classic"),
        }
        
        # Extract and save icons from image 3
        for (row, col), (filename, theme) in icons_info_3.items():
            # Add padding to ensure we don't get partial neighboring icons
            padding = int(icon_width * 0.25)  # 25% padding for better isolation
            left = col * icon_width + padding
            upper = row * icon_height + padding
            right = (col + 1) * icon_width - padding
            lower = (row + 1) * icon_height - padding
            
            icon = img3.crop((left, upper, right, lower))
            
            # Create a transparent background by replacing black
            if icon.mode != 'RGBA':
                icon = icon.convert('RGBA')
            
            # First make black background transparent
            data = icon.getdata()
            new_data = []
            for item in data:
                # If pixel is very dark (close to black), make it transparent
                if item[0] < 20 and item[1] < 20 and item[2] < 20:
                    new_data.append((0, 0, 0, 0))
                else:
                    new_data.append(item)
            
            icon.putdata(new_data)
            
            # Apply edge transparency to remove any artifacts at the edges
            data = icon.getdata()
            new_data = []
            width, height = icon.size
            for y in range(height):
                for x in range(width):
                    idx = y * width + x
                    r, g, b, a = data[idx]
                    
                    # Check if near edge and not very prominent
                    edge_threshold = min(width, height) // 10
                    is_near_edge = (x < edge_threshold or x >= width - edge_threshold or 
                                   y < edge_threshold or y >= height - edge_threshold)
                    
                    is_not_prominent = (r + g + b) / 3 < 100 or a < 200
                    
                    if is_near_edge and is_not_prominent:
                        new_data.append((r, g, b, 0))  # Make transparent
                    else:
                        new_data.append((r, g, b, a))
            
            icon.putdata(new_data)
            
            # Create a white background image
            background = Image.new('RGBA', icon.size, (255, 255, 255, 0))
            
            # Composite the icon onto the transparent background
            final_icon = Image.alpha_composite(background, icon)
            
            output_path = f"client/public/images/games/slots/{theme}/{filename}"
            final_icon.save(output_path, format="PNG")
            print(f"Saved {output_path}")
        
        print("Aztec and Celestial icons processed successfully!")
    else:
        print(f"Warning: Could not find {img3_path}")
    
    print("All icons extracted and saved successfully!")

if __name__ == "__main__":
    extract_icons()