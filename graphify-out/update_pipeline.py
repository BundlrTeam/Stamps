import json
from pathlib import Path
from graphify.extract import collect_files, extract

# Step 1: Create .graphify_detect.json
r = json.loads(Path('graphify-out/.graphify_incremental.json').read_text(encoding="utf-8"))
detect_data = {
    'files': r.get('new_files', {}),
    'all_files': r.get('files', {}),
    'total_files': r.get('new_total', 0),
    'total_words': r.get('total_words', 0),
    'skipped_sensitive': r.get('skipped_sensitive', []),
    'needs_graph': True,
}
Path('graphify-out/.graphify_detect.json').write_text(json.dumps(detect_data, ensure_ascii=False), encoding="utf-8")
print("Saved .graphify_detect.json")

# Step 2: Run AST extraction on changed code files
code_files = []
for f in detect_data['files'].get('code', []):
    code_files.extend(collect_files(Path(f)) if Path(f).is_dir() else [Path(f)])

if code_files:
    result = extract(code_files, cache_root=Path('.'), parallel=False)
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"AST extracted: {len(result['nodes'])} nodes, {len(result['edges'])} edges")
else:
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps({'nodes':[],'edges':[],'input_tokens':0,'output_tokens':0}), encoding="utf-8")
    print("No code files changed")

# Step 3: Create Prompt for Semantic extraction on changed files
all_changed_files = []
for type_files in detect_data['files'].values():
    all_changed_files.extend(type_files)

# Exclude SCSS files from semantic extraction as they are styling only
all_changed_files = [f for f in all_changed_files if not f.endswith('.scss')]

spec_content = Path('C:/Users/pddaa/.gemini/config/skills/graphify/references/extraction-spec.md').read_text(encoding="utf-8")
import re
prompt_template_match = re.search(r'```\n(You are a graphify extraction subagent\..*?\nCHUNK_PATH)\n```', spec_content, re.DOTALL)
prompt_template = prompt_template_match.group(1)

project_root = Path('c:/Git/Stamps').resolve()
chunk_path = (project_root / "graphify-out/.graphify_chunk_update.json").as_posix()
file_list_str = "\n".join(all_changed_files)

prompt = prompt_template
prompt = prompt.replace("CHUNK_NUM", "1")
prompt = prompt.replace("TOTAL_CHUNKS", "1")
prompt = prompt.replace("FILE_LIST", file_list_str)
prompt = prompt.replace("DEEP_MODE", "false")
prompt = prompt.replace("CHUNK_PATH", chunk_path)

Path("graphify-out/prompt_update.txt").write_text(prompt, encoding="utf-8")
print(f"Generated prompt_update.txt with {len(all_changed_files)} files to extract")
