import sys
from pathlib import Path
from pptx import Presentation

TOOLS = Path(r"C:\Users\ADARSH\.codex\plugins\cache\openai-primary-runtime\presentations\26.819.11345\skills\presentations\container_tools")
sys.path.insert(0, str(TOOLS))
import render_slides
import slides_test

deck = r"C:\Users\ADARSH\Documents\ChatGPT\IQOO Hackathon\DealTwin_Technical_Selection_Deck_Team_ANKOR.pptx"
img_dir = Path(r"C:\Users\ADARSH\AppData\Local\Temp\tmp4be8k7dp\imgs")
dpi = render_slides.calc_dpi_via_ooxml(deck, 1600, 900)
pad = slides_test.px_to_emu(100, dpi)
prs = Presentation(deck)
w1 = int(prs.slide_width) + 2 * int(pad)
h1 = int(prs.slide_height) + 2 * int(pad)
paths = [str(img_dir / f"slide-{i}.png") for i in range(1, 9)]
failing = slides_test.inspect_images(paths, int(pad) / w1, int(pad) / h1, dpi)
print("PASS" if not failing else "FAIL: " + ",".join(map(str, failing)))
