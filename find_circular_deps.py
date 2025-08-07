import re
import os
from collections import defaultdict, deque

def find_imports(file_path):
    """Extract all relative imports from a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find all import statements with relative paths
        import_pattern = r"import\s+.*?\s+from\s+['\"](\.[^'\"]*)['\"]"
        imports = re.findall(import_pattern, content)
        return imports
    except Exception as e:
        return []

def resolve_import_path(from_file, import_path, src_dir):
    """Resolve a relative import to an absolute path"""
    from_dir = os.path.dirname(from_file)
    
    # Handle relative imports
    if import_path.startswith('./'):
        resolved = os.path.join(from_dir, import_path[2:])
    elif import_path.startswith('../'):
        resolved = os.path.normpath(os.path.join(from_dir, import_path))
    else:
        return None
    
    # Try different extensions
    for ext in ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.ts']:
        full_path = os.path.join(src_dir, resolved + ext)
        if os.path.exists(full_path):
            return os.path.relpath(full_path, src_dir).replace('\\', '/')
    
    return None

def build_dependency_graph(src_dir):
    """Build a dependency graph of all files"""
    graph = defaultdict(set)
    all_files = []
    
    # Find all source files
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, src_dir).replace('\\', '/')
                all_files.append((file_path, relative_path))
    
    # Build dependency graph
    for file_path, relative_path in all_files:
        imports = find_imports(file_path)
        
        for import_path in imports:
            resolved = resolve_import_path(relative_path, import_path, src_dir)
            if resolved and resolved != relative_path:
                graph[relative_path].add(resolved)
    
    return graph, [f[1] for f in all_files]

def find_circular_dependencies(graph):
    """Find circular dependencies using DFS"""
    visited = set()
    rec_stack = set()
    cycles = []
    
    def dfs(node, path):
        if node in rec_stack:
            # Found a cycle
            cycle_start = path.index(node)
            cycle = path[cycle_start:] + [node]
            cycles.append(cycle)
            return True
        
        if node in visited:
            return False
        
        visited.add(node)
        rec_stack.add(node)
        
        for neighbor in graph.get(node, []):
            if neighbor in graph:  # Only follow edges to files that exist in our graph
                dfs(neighbor, path + [node])
        
        rec_stack.remove(node)
        return False
    
    for node in graph:
        if node not in visited:
            dfs(node, [])
    
    return cycles

def analyze_barrel_opportunities(graph, all_files):
    """Identify directories that would benefit from barrel exports"""
    dir_stats = defaultdict(lambda: {'files': set(), 'imported_from_outside': 0, 'total_imports': 0})
    
    # Analyze directory structure and import patterns
    for file in all_files:
        dir_path = os.path.dirname(file)
        dir_stats[dir_path]['files'].add(file)
    
    # Count imports between directories
    for importer, imports in graph.items():
        importer_dir = os.path.dirname(importer)
        
        for imported in imports:
            imported_dir = os.path.dirname(imported)
            dir_stats[imported_dir]['total_imports'] += 1
            
            if importer_dir != imported_dir:
                dir_stats[imported_dir]['imported_from_outside'] += 1
    
    # Filter directories that would benefit from barrel exports
    opportunities = []
    for dir_path, stats in dir_stats.items():
        if (len(stats['files']) >= 3 and  # At least 3 files
            stats['imported_from_outside'] >= 2 and  # Imported from outside at least twice
            '/' in dir_path):  # Not root directory
            opportunities.append((dir_path, len(stats['files']), stats['imported_from_outside']))
    
    return sorted(opportunities, key=lambda x: x[2], reverse=True)

if __name__ == "__main__":
    src_dir = r"C:\Users\dliz1\Desktop\gym-journal\src"
    
    print("Building dependency graph...")
    graph, all_files = build_dependency_graph(src_dir)
    
    print("Finding circular dependencies...")
    cycles = find_circular_dependencies(graph)
    
    print("Analyzing barrel export opportunities...")
    barrel_opportunities = analyze_barrel_opportunities(graph, all_files)
    
    print("=== CIRCULAR DEPENDENCY ANALYSIS ===\n")
    
    if cycles:
        print(f"Found {len(cycles)} circular dependencies:")
        for i, cycle in enumerate(cycles, 1):
            print(f"\nCircle {i}:")
            for j, file in enumerate(cycle):
                if j < len(cycle) - 1:
                    print(f"  {file} ->")
                else:
                    print(f"  {file}")
    else:
        print("No circular dependencies found!")
    
    print(f"\n=== BARREL EXPORT OPPORTUNITIES ===")
    print("Directories that would benefit from index.js files:\n")
    
    for dir_path, file_count, external_imports in barrel_opportunities:
        print(f"Directory: {dir_path}/")
        print(f"   Files: {file_count}, External imports: {external_imports}")
        
        # Show files in this directory
        files_in_dir = [f for f in all_files if os.path.dirname(f) == dir_path]
        for file in files_in_dir[:5]:  # Show first 5 files
            print(f"   - {os.path.basename(file)}")
        if len(files_in_dir) > 5:
            print(f"   - ... and {len(files_in_dir) - 5} more")
        print()
    
    print("=== SUMMARY ===")
    print(f"Total files analyzed: {len(all_files)}")
    print(f"Total dependencies: {sum(len(deps) for deps in graph.values())}")
    print(f"Circular dependencies: {len(cycles)}")
    print(f"Barrel export opportunities: {len(barrel_opportunities)}")