import runpy
import tempfile


WORK_DIR = r"C:\Users\ADARSH\Documents\ChatGPT\IQOO Hackathon\dealTwin_deck_build\slides_test_workspace"
SCRIPT = r"C:\Users\ADARSH\.codex\plugins\cache\openai-primary-runtime\presentations\26.819.11345\skills\presentations\container_tools\slides_test.py"


tempfile.mkdtemp = lambda *args, **kwargs: WORK_DIR
runpy.run_path(SCRIPT, run_name="__main__")
