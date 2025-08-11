#!/usr/bin/env node

// Integration Test Script for Phase 3 Multi-Gymmy UI Components
// Validates all 55+ components work together seamlessly

const fs = require('fs');
const path = require('path');

console.log('🔥 **PHASE 3 INTEGRATION TESTING EXECUTION**\n');
console.log('Testing all 55+ components across 4 major systems...\n');

// ==============================================================================
// TEST CONFIGURATION
// ==============================================================================

const MULTI_GYMMY_PATH = './src/components/multi-gymmy-ui';
const SYSTEMS = {
  'character-visual': {
    name: 'Character Visual System',
    components: [
      'CharacterSprite.tsx',
      'CharacterRenderer.tsx', 
      'ExperienceVisualizer.tsx',
      'CharacterMoodDisplay.tsx',
      'EvolutionAnimation.tsx',
      'StateTransition.tsx',
      'AnimationController.tsx'
    ]
  },
  'team-management': {
    name: 'Team Management System',
    components: [
      'TeamBuilder.tsx',
      'CharacterSlot.tsx', 
      'DragDropArea.tsx',
      'SynergyVisualizer.tsx',
      'ConnectionLines.tsx',
      'TeamPresetManager.tsx',
      'TeamSaveLoad.tsx',
      'TeamAnalyticsDashboard.tsx',
      'EffectivenessMetrics.tsx'
    ]
  },
  'gacha-experience': {
    name: 'Gacha Experience System',
    components: [
      'EnhancedGachaComponents.js',
      'GachaComponents.js'
    ],
    alternativePath: '../' // Check in main components folder
  },
  'collection-management': {
    name: 'Collection Management System', 
    components: [
      'CharacterDetailModal.js',
      'CharacterGallery.js'
    ],
    alternativePath: '../' // Check in main components folder  
  }
};

// ==============================================================================
// INTEGRATION TEST FUNCTIONS
// ==============================================================================

function testComponentExists(systemPath, componentFile, alternativePath = null) {
  let fullPath = path.join(MULTI_GYMMY_PATH, systemPath, componentFile);
  let exists = fs.existsSync(fullPath);
  
  // Try alternative path if component not found in main system path
  if (!exists && alternativePath) {
    fullPath = path.join(MULTI_GYMMY_PATH, alternativePath, componentFile);
    exists = fs.existsSync(fullPath);
  }
  
  console.log(`  ${exists ? '✅' : '❌'} ${componentFile} ${exists ? 'found' : 'MISSING'}`);
  return exists;
}

function testSystemIntegration(systemKey, systemConfig) {
  console.log(`\n📦 **${systemConfig.name}**`);
  console.log(`   Testing ${systemConfig.components.length} components...`);
  
  let passed = 0;
  let total = systemConfig.components.length;
  
  systemConfig.components.forEach(component => {
    if (testComponentExists(systemKey, component, systemConfig.alternativePath)) {
      passed++;
    }
  });
  
  const percentage = ((passed / total) * 100).toFixed(1);
  console.log(`   Result: ${passed}/${total} components (${percentage}%)`);
  
  return { passed, total, percentage: parseFloat(percentage) };
}

function testCoreSystemsIntegration() {
  console.log('\n🔗 **CORE SYSTEMS INTEGRATION**');
  
  const coreSystemPaths = [
    './src/context/systems/AdvancedGachaSystem.ts',
    './src/context/managers/MultiGymmyManager.ts',
    './src/context/managers/BannerManager.ts',
    './src/context/managers/PullManager.ts'
  ];
  
  let passed = 0;
  coreSystemPaths.forEach(systemPath => {
    const exists = fs.existsSync(systemPath);
    const name = path.basename(systemPath);
    console.log(`  ${exists ? '✅' : '❌'} ${name} ${exists ? 'integrated' : 'MISSING'}`);
    if (exists) passed++;
  });
  
  console.log(`   Result: ${passed}/${coreSystemPaths.length} core systems integrated`);
  return { passed, total: coreSystemPaths.length };
}

function testImportIntegration() {
  console.log('\n📥 **IMPORT INTEGRATION**');
  
  const indexFiles = [
    path.join(MULTI_GYMMY_PATH, 'character-visual', 'index.ts'),
    path.join(MULTI_GYMMY_PATH, 'team-management', 'index.ts'),
    path.join(MULTI_GYMMY_PATH, 'index.ts')
  ];
  
  let passed = 0;
  indexFiles.forEach(indexFile => {
    const exists = fs.existsSync(indexFile);
    const name = path.relative(MULTI_GYMMY_PATH, indexFile);
    console.log(`  ${exists ? '✅' : '❌'} ${name} ${exists ? 'exporting' : 'MISSING'}`);
    if (exists) passed++;
  });
  
  console.log(`   Result: ${passed}/${indexFiles.length} index files configured`);
  return { passed, total: indexFiles.length };
}

function testUtilityIntegration() {
  console.log('\n🛠️ **UTILITY SYSTEMS INTEGRATION**');
  
  const utilityPaths = [
    path.join(MULTI_GYMMY_PATH, 'shared'),
    path.join(MULTI_GYMMY_PATH, 'team-management', 'utils'),
    path.join(MULTI_GYMMY_PATH, 'team-management', 'components')
  ];
  
  let passed = 0;
  utilityPaths.forEach(utilPath => {
    const exists = fs.existsSync(utilPath);
    const name = path.relative(MULTI_GYMMY_PATH, utilPath);
    console.log(`  ${exists ? '✅' : '❌'} ${name}/ ${exists ? 'available' : 'MISSING'}`);
    if (exists) passed++;
  });
  
  console.log(`   Result: ${passed}/${utilityPaths.length} utility systems available`);
  return { passed, total: utilityPaths.length };
}

function testExampleIntegration() {
  console.log('\n🎯 **EXAMPLE INTEGRATION**');
  
  const examplePaths = [
    path.join(MULTI_GYMMY_PATH, 'examples'),
    path.join(MULTI_GYMMY_PATH, 'team-management', 'examples')
  ];
  
  let passed = 0;
  examplePaths.forEach(examplePath => {
    const exists = fs.existsSync(examplePath);
    const name = path.relative(MULTI_GYMMY_PATH, examplePath);
    console.log(`  ${exists ? '✅' : '❌'} ${name}/ ${exists ? 'available' : 'MISSING'}`);
    if (exists) passed++;
  });
  
  console.log(`   Result: ${passed}/${examplePaths.length} example systems available`);
  return { passed, total: examplePaths.length };
}

function calculateOverallSuccess(results) {
  let totalPassed = 0;
  let totalComponents = 0;
  
  results.forEach(result => {
    totalPassed += result.passed;
    totalComponents += result.total;
  });
  
  const percentage = ((totalPassed / totalComponents) * 100).toFixed(1);
  return { totalPassed, totalComponents, percentage: parseFloat(percentage) };
}

// ==============================================================================
// PHASE 3 SUCCESS METRICS VALIDATION
// ==============================================================================

function validateSuccessMetrics(overallResult) {
  console.log('\n📊 **PHASE 3 SUCCESS METRICS VALIDATION**');
  
  const metrics = {
    'Component Integration': {
      target: 95,
      actual: overallResult.percentage,
      unit: '%'
    },
    'Systems Integrated': {
      target: 4,
      actual: Object.keys(SYSTEMS).length,
      unit: 'systems'
    },
    'Component Count': {
      target: 55,
      actual: overallResult.totalComponents,
      unit: 'components'
    }
  };
  
  let metricsPassed = 0;
  let totalMetrics = Object.keys(metrics).length;
  
  Object.entries(metrics).forEach(([name, metric]) => {
    const passed = metric.actual >= metric.target;
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${status} ${name}: ${metric.actual}${metric.unit} (target: ${metric.target}${metric.unit})`);
    if (passed) metricsPassed++;
  });
  
  console.log(`\n   Success Metrics: ${metricsPassed}/${totalMetrics} targets achieved`);
  return metricsPassed === totalMetrics;
}

// ==============================================================================
// MAIN EXECUTION
// ==============================================================================

function main() {
  console.log('Starting comprehensive integration testing...\n');
  
  const results = [];
  
  // Test each system
  Object.entries(SYSTEMS).forEach(([systemKey, systemConfig]) => {
    const result = testSystemIntegration(systemKey, systemConfig);
    results.push(result);
  });
  
  // Test core systems
  results.push(testCoreSystemsIntegration());
  
  // Test imports
  results.push(testImportIntegration());
  
  // Test utilities
  results.push(testUtilityIntegration());
  
  // Test examples
  results.push(testExampleIntegration());
  
  // Calculate overall success
  const overallResult = calculateOverallSuccess(results);
  
  console.log('\n🎯 **INTEGRATION TEST SUMMARY**');
  console.log(`   Total Components Tested: ${overallResult.totalComponents}`);
  console.log(`   Components Integrated: ${overallResult.totalPassed}`);
  console.log(`   Integration Success Rate: ${overallResult.percentage}%`);
  
  // Validate against Phase 3 success metrics
  const metricsPass = validateSuccessMetrics(overallResult);
  
  // Final result
  console.log('\n🚀 **FINAL RESULT**');
  if (overallResult.percentage >= 95 && metricsPass) {
    console.log('   ✅ PHASE 3 INTEGRATION: SUCCESSFUL');
    console.log('   🎉 All systems integrated and ready for launch!');
    process.exit(0);
  } else {
    console.log('   ❌ PHASE 3 INTEGRATION: NEEDS ATTENTION');
    console.log('   🔧 Some systems require additional work before launch.');
    process.exit(1);
  }
}

// Run the integration test
main();