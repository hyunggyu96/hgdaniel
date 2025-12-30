import matplotlib.font_manager as fm
import matplotlib.pyplot as plt
import os
import requests
import zipfile

def setup_korean_font():
    font_name = "NanumGothic"
    # Check if font already exists in system or matplotlib cache
    fonts = [f.name for f in fm.fontManager.ttflist]
    if any(font_name in f for f in fonts):
        print(f"✅ {font_name} already installed.")
        plt.rcParams['font.family'] = font_name
        plt.rcParams['axes.unicode_minus'] = False
        return True

    print(f"📂 {font_name} not found. Attempting to download...")
    
    # Download NanumGothic from Google Fonts (Static)
    font_url = "https://github.com/google/fonts/raw/main/ofl/nanumgothic/NanumGothic-Regular.ttf"
    font_path = os.path.join(os.getcwd(), "NanumGothic-Regular.ttf")
    
    try:
        response = requests.get(font_url)
        with open(font_path, "wb") as f:
            f.write(response.content)
        
        # Add to matplotlib
        fm.fontManager.addfont(font_path)
        plt.rcParams['font.family'] = font_name
        plt.rcParams['axes.unicode_minus'] = False
        print(f"✅ font setup complete: {font_name}")
        return True
    except Exception as e:
        print(f"❌ font setup failed: {e}")
        return False

if __name__ == "__main__":
    setup_korean_font()
    # Test plot
    plt.title("한글 테스트")
    plt.show()
