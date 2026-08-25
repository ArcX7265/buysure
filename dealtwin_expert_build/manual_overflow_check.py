import sys
from pathlib import Path

TOOLS = Path(r"C:\Users\ADARSH\.codex\plugins\cache\openai-primary-runtime\presentations\26.819.11345\skills\presentations\container_tools")
sys.path.insert(0, str(TOOLS))

import render_slides
import slides_test
from pptx import Presentation

deck = Path(r"C:\Users\ADARSH\Documents\ChatGPT\IQOO Hackathon\DealTwin_Expert_Technical_Selection_Deck_Team_ANKOR.pptx")
render_dir = Path(r"C:\Users\ADARSH\AppData\Local\Temp\tmp0azc7qcb\imgs")
enlarged = Path(r"C:\Users\ADARSH\AppData\Local\Temp\tmp0azc7qcb\enlarged.pptx")

dpi = render_slides.calc_dpi_via_ooxml(str(deck), 1600, 900)
pad_emu = slides_test.px_to_emu(slides_test.PAD_PX, dpi)
prs = Presentation(str(enlarged))
pad_ratio_w = pad_emu / prs.slide_width
pad_ratio_h = pad_emu / prs.slide_height
paths = [str(render_dir / f"slide-{i}.png") for i in range(1, 9)]
failing = slides_test.inspect_images(paths, pad_ratio_w, pad_ratio_h, dpi)

if failing:
    print("FAIL: " + ", ".join(map(str, failing)))
    raise SystemExit(1)
print("PASS: no content overflows the slide canvas")
