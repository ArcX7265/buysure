from pathlib import Path
import importlib.util
import tempfile

ROOT = Path(__file__).resolve().parent
TEMP_ROOT = ROOT / "_report_work" / "temp"
TEMP_ROOT.mkdir(parents=True, exist_ok=True)
tempfile.tempdir = str(TEMP_ROOT)

renderer_path = Path(r"C:\Users\ADARSH\.codex\plugins\cache\openai-primary-runtime\documents\26.819.11345\skills\documents\render_docx.py")
spec = importlib.util.spec_from_file_location("docx_renderer", renderer_path)
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)


class FixedTemporaryDirectory:
    counter = 0

    def __init__(self, prefix="tmp", **_kwargs):
        FixedTemporaryDirectory.counter += 1
        name = "profile" if FixedTemporaryDirectory.counter == 1 else "convert"
        self.path = TEMP_ROOT / name
        self.path.mkdir(parents=True, exist_ok=True)

    def __enter__(self):
        return str(self.path)

    def __exit__(self, exc_type, exc, tb):
        return False


renderer.tempfile.TemporaryDirectory = FixedTemporaryDirectory

renderer.rasterize(
    str(ROOT / "DealTwin_Super_Detailed_Project_Report.docx"),
    str(ROOT / "_report_work" / "render1"),
    144,
    verbose=True,
    emit_pdf=True,
)
