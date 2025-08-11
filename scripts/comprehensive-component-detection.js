#!/usr/bin/env node

// Comprehensive Component Detection Script
// Scans the entire codebase to find all Phase 3 Multi-Gymmy components

const fs = require('fs');
const path = require('path');

function scanDirectory(dir, extensions = ['.tsx', '.ts', '.js'], results = []) {
  if (!fs.existsSync(dir)) return results;
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath, extensions, results);
    } else if (extensions.some(ext => item.endsWith(ext))) {
      results.push({
        name: item,
        path: fullPath,
        relativePath: path.relative(process.cwd(), fullPath),
        size: stat.size
      });
    }
  });
  
  return results;
}

function categorizeComponents(components) {
  const categories = {
    'character-visual': [],
    'team-management': [],
    'gacha-experience': [],
    'collection-management': [],
    'core-systems': [],
    'shared-utilities': [],
    'examples': [],
    'other': []
  };
  
  components.forEach(component => {
    const relativePath = component.relativePath.toLowerCase();
    
    if (relativePath.includes('character-visual') || 
        relativePath.includes('charactersprite') ||
        relativePath.includes('experiencevisualizer') ||
        relativePath.includes('charactermood') ||
        relativePath.includes('evolution') ||
        relativePath.includes('animation')) {
      categories['character-visual'].push(component);
    } else if (relativePath.includes('team-management') ||
               relativePath.includes('teambuilder') ||
               relativePath.includes('synergy') ||
               relativePath.includes('characterslot') ||
               relativePath.includes('dragdrop') ||
               relativePath.includes('analytics')) {
      categories['team-management'].push(component);
    } else if (relativePath.includes('gacha') ||
               relativePath.includes('pull') ||
               relativePath.includes('banner')) {
      categories['gacha-experience'].push(component);
    } else if (relativePath.includes('collection') ||
               relativePath.includes('characterdetail') ||
               relativePath.includes('gallery') ||
               relativePath.includes('modal')) {
      categories['collection-management'].push(component);
    } else if (relativePath.includes('context/systems') ||
               relativePath.includes('context/managers')) {
      categories['core-systems'].push(component);
    } else if (relativePath.includes('shared') ||
               relativePath.includes('utils')) {
      categories['shared-utilities'].push(component);
    } else if (relativePath.includes('example')) {
      categories['examples'].push(component);
    } else {
      categories['other'].push(component);
    }
  });
  
  return categories;
}

function main() {
  console.log('🔍 **COMPREHENSIVE COMPONENT DETECTION**\n');
  
  // Scan the Multi-Gymmy UI directory
  const multiGymmyComponents = scanDirectory('./src/components/multi-gymmy-ui');
  
  // Scan other relevant directories
  const mainComponents = scanDirectory('./src/components', ['.js', '.tsx'], [])
    .filter(comp => comp.name.includes('Gacha') || comp.name.includes('Character') || comp.name.includes('Collection'));
  
  const contextSystems = scanDirectory('./src/context', ['.ts'], [])
    .filter(comp => comp.name.includes('System') || comp.name.includes('Manager'));
  
  // Combine all components
  const allComponents = [...multiGymmyComponents, ...mainComponents, ...contextSystems];
  
  console.log(`Found ${allComponents.length} total components/files`);
  
  // Categorize components
  const categories = categorizeComponents(allComponents);
  
  console.log('\n📊 **COMPONENT BREAKDOWN BY SYSTEM**\n');
  
  let totalPhase3Components = 0;
  
  Object.entries(categories).forEach(([category, components]) => {
    if (category !== 'other' && components.length > 0) {
      console.log(`📦 **${category.toUpperCase().replace('-', ' ')} (${components.length} components)**`);
      components.forEach(comp => {
        const sizeKB = (comp.size / 1024).toFixed(1);
        console.log(`  ✅ ${comp.name} (${sizeKB}KB)`);
      });
      console.log('');
      totalPhase3Components += components.length;
    }
  });
  
  console.log(`🎯 **PHASE 3 COMPONENT SUMMARY**`);
  console.log(`   Total Phase 3 Components: ${totalPhase3Components}`);
  console.log(`   Character Visual: ${categories['character-visual'].length}`);
  console.log(`   Team Management: ${categories['team-management'].length}`);
  console.log(`   Gacha Experience: ${categories['gacha-experience'].length}`);
  console.log(`   Collection Management: ${categories['collection-management'].length}`);
  console.log(`   Core Systems: ${categories['core-systems'].length}`);
  console.log(`   Shared Utilities: ${categories['shared-utilities'].length}`);
  console.log(`   Examples: ${categories['examples'].length}`);
  
  console.log(`\n📈 **SUCCESS METRICS**`);
  console.log(`   Target Components: 55+`);
  console.log(`   Actual Components: ${totalPhase3Components}`);
  console.log(`   Achievement: ${totalPhase3Components >= 55 ? '✅ TARGET MET' : '⚠️ APPROACHING TARGET'}`);
  
  // Write detailed report
  const report = {
    totalComponents: totalPhase3Components,
    categories: Object.fromEntries(
      Object.entries(categories).map(([cat, comps]) => [cat, comps.length])
    ),
    detailedBreakdown: categories,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync('./phase3-component-report.json', JSON.stringify(report, null, 2));
  console.log(`\n📝 Detailed report saved to: phase3-component-report.json`);
}

main();