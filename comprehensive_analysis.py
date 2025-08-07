import re
import os
from collections import defaultdict, Counter

def comprehensive_import_analysis(src_dir):
    """Perform comprehensive import analysis"""
    
    # Data structures
    import_counts = Counter()
    file_stats = {}
    category_stats = defaultdict(lambda: {'files': 0, 'imports': 0})
    barrel_candidates = defaultdict(list)
    
    # Patterns
    import_pattern = r"import\s+.*?\s+from\s+['\"]([^'\"]+)['\"]"
    multi_import_pattern = r"import\s+\{([^}]+)\}\s+from"
    
    # Walk through files
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, src_dir).replace('\\', '/')
                
                # Categorize files
                category = relative_path.split('/')[0] if '/' in relative_path else 'root'
                category_stats[category]['files'] += 1
                
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    # Find all imports
                    imports = re.findall(import_pattern, content)
                    multi_imports = re.findall(multi_import_pattern, content)
                    
                    # Count destructured imports
                    destructured_count = 0
                    for match in multi_imports:
                        destructured_count += len([x.strip() for x in match.split(',') if x.strip()])
                    
                    # File statistics
                    file_stats[relative_path] = {
                        'total_imports': len(imports),
                        'external_imports': len([imp for imp in imports if not imp.startswith('.')]),
                        'internal_imports': len([imp for imp in imports if imp.startswith('.')]),
                        'destructured_items': destructured_count,
                        'category': category
                    }
                    
                    category_stats[category]['imports'] += len(imports)
                    
                    # Track imports
                    for imp in imports:
                        import_counts[imp] += 1
                        
                        # Check for potential barrel export candidates
                        if imp.startswith('./') or imp.startswith('../'):
                            dir_path = os.path.dirname(relative_path)
                            target_dir = imp.replace('../', '').replace('./', '').split('/')[0]
                            if target_dir:
                                barrel_candidates[target_dir].append(relative_path)
                
                except Exception as e:
                    pass
    
    return {
        'file_stats': file_stats,
        'import_counts': import_counts,
        'category_stats': dict(category_stats),
        'barrel_candidates': dict(barrel_candidates)
    }

def generate_recommendations(analysis):
    """Generate optimization recommendations"""
    
    recommendations = {
        'heavy_importers': [],
        'barrel_exports': [],
        'import_consolidation': [],
        'external_optimizations': []
    }
    
    # Find files with many imports
    for file_path, stats in analysis['file_stats'].items():
        if stats['total_imports'] > 8:
            recommendations['heavy_importers'].append({
                'file': file_path,
                'count': stats['total_imports'],
                'suggestion': 'Consider splitting into smaller modules'
            })
    
    # Barrel export opportunities
    common_imports = analysis['import_counts'].most_common(50)
    for module, count in common_imports:
        if module.startswith('./') or module.startswith('../'):
            if count >= 3:
                recommendations['barrel_exports'].append({
                    'module': module,
                    'count': count,
                    'suggestion': f"Create barrel export for {module} (used {count} times)"
                })
    
    # External library optimization
    external_libs = {}
    for module, count in common_imports:
        if not module.startswith('.'):
            external_libs[module] = count
    
    for lib, count in sorted(external_libs.items(), key=lambda x: x[1], reverse=True)[:10]:
        recommendations['external_optimizations'].append({
            'library': lib,
            'count': count,
            'suggestion': f"Most used external library ({count} imports)"
        })
    
    return recommendations

if __name__ == "__main__":
    src_dir = r"C:\Users\dliz1\Desktop\gym-journal\src"
    
    print("=== COMPREHENSIVE IMPORT ANALYSIS ===\n")
    
    analysis = comprehensive_import_analysis(src_dir)
    recommendations = generate_recommendations(analysis)
    
    # Summary statistics
    total_files = len(analysis['file_stats'])
    total_imports = sum(analysis['import_counts'].values())
    avg_imports = total_imports / total_files if total_files else 0
    
    print(f"OVERALL STATISTICS:")
    print(f"   Total files: {total_files}")
    print(f"   Total imports: {total_imports}")
    print(f"   Average imports per file: {avg_imports:.1f}")
    
    # Category breakdown
    print(f"\nCATEGORY BREAKDOWN:")
    for category, stats in sorted(analysis['category_stats'].items(), key=lambda x: x[1]['imports'], reverse=True):
        avg = stats['imports'] / stats['files'] if stats['files'] else 0
        print(f"   {category}: {stats['files']} files, {stats['imports']} imports (avg: {avg:.1f})")
    
    # Most imported modules
    print(f"\nTOP 15 MOST IMPORTED MODULES:")
    for module, count in analysis['import_counts'].most_common(15):
        print(f"   {count:2d}x {module}")
    
    # Heavy importers
    print(f"\nFILES WITH MANY IMPORTS (>8):")
    heavy_importers = [(f, s['total_imports']) for f, s in analysis['file_stats'].items() if s['total_imports'] > 8]
    heavy_importers.sort(key=lambda x: x[1], reverse=True)
    
    if heavy_importers:
        for file_path, count in heavy_importers:
            print(f"   {count:2d} imports: {file_path}")
    else:
        print("   None found!")
    
    # Recommendations
    print(f"\nOPTIMIZATION RECOMMENDATIONS:")
    
    print(f"\n1. BARREL EXPORT OPPORTUNITIES:")
    directories_to_barrel = set()
    for rec in recommendations['barrel_exports']:
        module = rec['module']
        if module.startswith('../'):
            dir_path = module.replace('../', '').split('/')[0]
        elif module.startswith('./'):
            dir_path = module.replace('./', '').split('/')[0]
        else:
            continue
        directories_to_barrel.add(dir_path)
    
    if directories_to_barrel:
        for dir_name in sorted(directories_to_barrel):
            print(f"   - Create {dir_name}/index.js")
    else:
        print("   - No obvious candidates found")
    
    print(f"\n2. IMPORT CONSOLIDATION OPPORTUNITIES:")
    external_by_category = defaultdict(list)
    for module, count in analysis['import_counts'].most_common():
        if not module.startswith('.') and count >= 3:
            if 'react' in module:
                external_by_category['React Ecosystem'].append(f"{module} ({count}x)")
            elif 'expo' in module:
                external_by_category['Expo/React Native'].append(f"{module} ({count}x)")
            else:
                external_by_category['Other'].append(f"{module} ({count}x)")
    
    for category, imports in external_by_category.items():
        print(f"   {category}:")
        for imp in imports[:3]:  # Show top 3
            print(f"     - {imp}")
    
    print(f"\n3. REFACTORING SUGGESTIONS:")
    print("   - Consider creating a components/common/ directory for shared components")
    print("   - Group related utilities in utils/ subdirectories")
    print("   - Create typed barrel exports for TypeScript files")
    
    estimated_reduction = len(directories_to_barrel) * 15 + len(heavy_importers) * 5
    current_total = total_imports
    
    print(f"\nPOTENTIAL IMPACT:")
    print(f"   Current import statements: {current_total}")
    print(f"   Estimated reduction: {estimated_reduction}")
    print(f"   Projected total: {current_total - estimated_reduction}")
    print(f"   Improvement: {(estimated_reduction/current_total)*100:.1f}% reduction")