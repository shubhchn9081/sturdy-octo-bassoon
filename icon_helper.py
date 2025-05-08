import os
import shutil
from pathlib import Path

# This script helps you copy pre-cropped icons to the correct folders
# Just place all your icons in the 'slot_icons' folder and run this script
# Icons should be named with the pattern 'name_theme.png'
# For example: 'seven_classic.png', 'alien_space.png', etc.

def setup_slot_icons():
    # Ensure base directories exist
    base_path = "client/public/images/games/slots"
    themes = [
        "classic", "space", "fantasy", "sports", 
        "adventure", "generic", "aztec", "celestial"
    ]
    
    for theme in themes:
        os.makedirs(os.path.join(base_path, theme), exist_ok=True)
    
    # Source directory where you'll place all icons
    source_dir = "slot_icons"
    os.makedirs(source_dir, exist_ok=True)
    
    print(f"Please place all your slot icons in the '{source_dir}' folder.")
    print("Each icon should be named in the format: name_theme.png")
    print("For example: seven_classic.png, alien_space.png, etc.")
    print("Then run this script again to organize them automatically.")
    
    # Check if source directory has any PNG files
    png_files = list(Path(source_dir).glob("*.png"))
    
    if not png_files:
        print(f"\nNo PNG files found in {source_dir}. Please add your icon files first.")
        return
    
    # Process each PNG file
    successful_copies = 0
    for png_file in png_files:
        filename = png_file.name
        
        # Skip files that don't contain an underscore
        if "_" not in filename:
            print(f"Skipping {filename}: Missing theme identifier (e.g., name_theme.png)")
            continue
        
        # Extract theme from filename
        name_parts = filename.rsplit('_', 1)
        if len(name_parts) != 2:
            print(f"Skipping {filename}: Invalid filename format")
            continue
        
        name, theme_ext = name_parts
        theme = theme_ext.split('.')[0]
        
        # Check if theme is valid
        if theme not in themes:
            print(f"Skipping {filename}: Unknown theme '{theme}'")
            continue
        
        # Copy file to appropriate theme folder
        destination = os.path.join(base_path, theme, filename)
        shutil.copy2(png_file, destination)
        print(f"Copied {filename} to {theme} folder")
        successful_copies += 1
    
    print(f"\nSuccessfully organized {successful_copies} icons into theme folders.")
    print("Now update the server/routes/slots.ts file to reference these icons if needed.")

if __name__ == "__main__":
    setup_slot_icons()