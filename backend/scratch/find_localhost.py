import os

search_dir = "../frontend/src"
target = "localhost:8000"

found = []
for root, dirs, files in os.walk(search_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if target in content:
                        found.append(filepath)
            except Exception as e:
                pass

print("Files containing 'localhost:8000':")
for f in found:
    print(f)
