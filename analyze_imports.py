import re
import os
from collections import defaultdict, Counter
import json

def analyze_imports(src_dir):
    import_counts = Counter()
    file_imports = defaultdict(list)
    relative_imports = defaultdict(list)
    external_imports = Counter()
    long_relative_imports = []
    files_with_many_imports = []
    
    # Walk through all source files
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, src_dir)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    # Find all import statements
                    import_pattern = r"import\s+.*?\s+from\s+['\"]([^'\"]+)['\"]"
                    imports = re.findall(import_pattern, content)
                    
                    file_imports[relative_path] = imports
                    
                    if len(imports) > 10:
                        files_with_many_imports.append((relative_path, len(imports)))
                    
                    for imp in imports:
                        import_counts[imp] += 1
                        
                        # Check if it's a relative import
                        if imp.startswith('./') or imp.startswith('../'):
                            relative_imports[relative_path].append(imp)
                            
                            # Count '../' patterns for complexity
                            depth = imp.count('../')
                            if depth >= 3:
                                long_relative_imports.append((relative_path, imp, depth))
                        else:
                            external_imports[imp] += 1
                            
                except Exception as e:
                    print(f"Error reading {file_path}: {e}")
    
    return {
        'total_imports': sum(import_counts.values()),
        'total_files': len(file_imports),
        'most_imported': import_counts.most_common(20),
        'external_imports': external_imports.most_common(10),
        'files_with_many_imports': sorted(files_with_many_imports, key=lambda x: x[1], reverse=True),
        'long_relative_imports': long_relative_imports,
        'relative_import_stats': {
            file: len(imports) for file, imports in relative_imports.items()
        }
    }

if __name__ == "__main__":
    src_dir = r"C:\Users\dliz1\Desktop\gym-journal\src"
    results = analyze_imports(src_dir)
    
    print("=== GYM JOURNAL IMPORT ANALYSIS ===\n")
    print(f"Total import statements: {results['total_imports']}")
    print(f"Total source files: {results['total_files']}")
    print(f"Average imports per file: {results['total_imports'] / results['total_files']:.1f}")
    
    print("\n=== TOP 20 MOST IMPORTED MODULES ===")
    for module, count in results['most_imported']:
        print(f"{count:3d}x {module}")
    
    print("\n=== TOP EXTERNAL LIBRARIES ===")
    for module, count in results['external_imports']:
        print(f"{count:3d}x {module}")
    
    print("\n=== FILES WITH >10 IMPORTS ===")
    for file_path, count in results['files_with_many_imports']:
        print(f"{count:2d} imports: {file_path}")
    
    print("\n=== COMPLEX RELATIVE IMPORTS (3+ levels) ===")
    for file_path, import_path, depth in results['long_relative_imports']:
        print(f"{depth} levels: {file_path} -> {import_path}")
    
    # Save detailed results
    with open('import_analysis.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nDetailed analysis saved to import_analysis.json")