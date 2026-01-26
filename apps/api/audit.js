const fs = require('fs');
const path = require('path');

const ROOT_DIRS = ['src', 'prisma'];
const OUTPUT_FILE = 'audit_report.txt';

const PATTERNS = [
  /export\s+interface\s+\w+/,
  /export\s+abstract\s+class\s+\w+/,
  /export\s+type\s+\w+/,
  /export\s+class\s+\w+/,
  /export\s+enum\s+\w+/,
  /@Injectable\(\)/,
  /@Controller\(/,
  /@Module\(/,
  /@WebSocketGateway\(/,
  /@Processor\(/,
  /extends\s+\w+/,
  /implements\s+\w+/,
];

let output = [];

function log(text) {
  output.push(text);
}

function getDirectoryTree(dir, prefix = '', isLast = true) {
  const basename = path.basename(dir);
  const connector = isLast ? '└── ' : '├── ';

  if (prefix === '') {
    log(basename + '/');
  } else {
    log(prefix + connector + basename + '/');
  }

  try {
    const items = fs.readdirSync(dir).filter(item => {
      return !item.startsWith('.') &&
             item !== 'node_modules' &&
             item !== 'dist' &&
             item !== 'coverage';
    }).sort((a, b) => {
      const aIsDir = fs.statSync(path.join(dir, a)).isDirectory();
      const bIsDir = fs.statSync(path.join(dir, b)).isDirectory();
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });

    items.forEach((item, index) => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      const isLastItem = index === items.length - 1;
      const newPrefix = prefix + (prefix === '' ? '' : (isLast ? '    ' : '│   '));

      if (stat.isDirectory()) {
        getDirectoryTree(itemPath, newPrefix, isLastItem);
      } else {
        const fileConnector = isLastItem ? '└── ' : '├── ';
        log(newPrefix + fileConnector + item);
      }
    });
  } catch (err) {
    log(prefix + '  [Error reading directory]');
  }
}

function extractSignatures(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const matches = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      for (const pattern of PATTERNS) {
        if (pattern.test(trimmed)) {
          // Limpiar la línea para mostrar solo la firma
          let signature = trimmed
            .replace(/\{[\s\S]*$/, '{...}')  // Remover cuerpo
            .replace(/\s+/g, ' ')             // Normalizar espacios
            .substring(0, 120);               // Limitar longitud

          matches.push({
            line: index + 1,
            content: signature
          });
          break;
        }
      }
    });

    return matches;
  } catch (err) {
    return [];
  }
}

function scanDirectory(dir) {
  const results = [];

  function scan(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules' || item === 'dist') {
          continue;
        }

        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          scan(itemPath);
        } else if (item.endsWith('.ts') || item.endsWith('.prisma')) {
          const signatures = extractSignatures(itemPath);
          if (signatures.length > 0) {
            results.push({
              file: itemPath.replace(process.cwd() + path.sep, ''),
              signatures
            });
          }
        }
      }
    } catch (err) {
      // Skip
    }
  }

  scan(dir);
  return results;
}

function analyzeArchitecture(results) {
  const analysis = {
    core: { interfaces: 0, classes: 0, types: 0 },
    infra: { services: 0, repositories: 0, modules: 0 },
    presentation: { controllers: 0, guards: 0, gateways: 0 },
    shared: { types: 0, utils: 0 },
    issues: [],
    dependencies: []
  };

  for (const result of results) {
    const filePath = result.file.replace(/\\/g, '/');

    // Analizar ubicación
    if (filePath.includes('@core/')) {
      for (const sig of result.signatures) {
        if (sig.content.includes('interface')) analysis.core.interfaces++;
        if (sig.content.includes('class')) analysis.core.classes++;
        if (sig.content.includes('type')) analysis.core.types++;

        // Detectar imports de @infra en @core (violación de Clean Architecture)
        if (sig.content.includes('@infra/') || sig.content.includes('@presentation/')) {
          analysis.issues.push(`VIOLATION: ${filePath} imports from outer layer`);
        }
      }
    }

    if (filePath.includes('@infra/')) {
      for (const sig of result.signatures) {
        if (sig.content.includes('@Injectable')) analysis.infra.services++;
        if (sig.content.includes('Repository')) analysis.infra.repositories++;
        if (sig.content.includes('@Module')) analysis.infra.modules++;
      }
    }

    if (filePath.includes('@presentation/')) {
      for (const sig of result.signatures) {
        if (sig.content.includes('@Controller')) analysis.presentation.controllers++;
        if (sig.content.includes('Guard')) analysis.presentation.guards++;
        if (sig.content.includes('@WebSocketGateway')) analysis.presentation.gateways++;
      }
    }

    if (filePath.includes('@shared/')) {
      for (const sig of result.signatures) {
        if (sig.content.includes('type') || sig.content.includes('interface')) {
          analysis.shared.types++;
        }
      }
    }
  }

  return analysis;
}

// Main execution
log('='.repeat(80));
log('CERVAK FRAMEWORK - ARCHITECTURE AUDIT REPORT');
log('Generated: ' + new Date().toISOString());
log('='.repeat(80));
log('');

// Directory Tree
log('DIRECTORY STRUCTURE');
log('-'.repeat(40));
for (const dir of ROOT_DIRS) {
  if (fs.existsSync(dir)) {
    getDirectoryTree(dir);
    log('');
  }
}

// Signatures by file
log('');
log('EXPORTED SIGNATURES BY FILE');
log('-'.repeat(40));

let allResults = [];
for (const dir of ROOT_DIRS) {
  if (fs.existsSync(dir)) {
    const results = scanDirectory(dir);
    allResults = allResults.concat(results);

    for (const result of results) {
      log('');
      log(`FILE: ${result.file}`);
      for (const sig of result.signatures) {
        log(`  L${sig.line}: ${sig.content}`);
      }
    }
  }
}

// Architecture Analysis
log('');
log('');
log('ARCHITECTURE ANALYSIS');
log('-'.repeat(40));

const analysis = analyzeArchitecture(allResults);

log('');
log('@core/ Layer:');
log(`  - Interfaces: ${analysis.core.interfaces}`);
log(`  - Classes: ${analysis.core.classes}`);
log(`  - Types: ${analysis.core.types}`);

log('');
log('@infra/ Layer:');
log(`  - Injectable Services: ${analysis.infra.services}`);
log(`  - Repositories: ${analysis.infra.repositories}`);
log(`  - Modules: ${analysis.infra.modules}`);

log('');
log('@presentation/ Layer:');
log(`  - Controllers: ${analysis.presentation.controllers}`);
log(`  - Guards: ${analysis.presentation.guards}`);
log(`  - WebSocket Gateways: ${analysis.presentation.gateways}`);

log('');
log('@shared/ Layer:');
log(`  - Types/Interfaces: ${analysis.shared.types}`);

if (analysis.issues.length > 0) {
  log('');
  log('ARCHITECTURE VIOLATIONS:');
  for (const issue of analysis.issues) {
    log(`  - ${issue}`);
  }
}

// Summary
log('');
log('');
log('SUMMARY');
log('-'.repeat(40));
log(`Total files analyzed: ${allResults.length}`);
log(`Total signatures found: ${allResults.reduce((sum, r) => sum + r.signatures.length, 0)}`);

// Write to file
fs.writeFileSync(OUTPUT_FILE, output.join('\n'), 'utf-8');
console.log(`Audit report generated: ${OUTPUT_FILE}`);
console.log(`Total lines: ${output.length}`);
