// Скрипт для решения проблем с импортами в TypeScript
const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src/pages');
const componentDir = path.join(__dirname, 'src/components');
const serviceDir = path.join(__dirname, 'src/services');

// Создает барреля для директорий, чтобы помочь TypeScript с импортами
function createBarrelFile(directory, outputFile) {
  const files = fs.readdirSync(directory)
    .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
    .map(file => file.replace(/\.(tsx|ts)$/, ''));

  const exports = files.map(file => `export { default as ${file} } from './${file}';`).join('\n');
  fs.writeFileSync(outputFile, exports);
  
  console.log(`Created barrel file for ${path.basename(directory)}`);
}

// Создаем барреля для страниц и компонентов
createBarrelFile(pagesDir, path.join(pagesDir, 'index.ts'));
createBarrelFile(componentDir, path.join(componentDir, 'index.ts'));
createBarrelFile(serviceDir, path.join(serviceDir, 'index.ts'));

console.log('TypeScript import helpers created successfully!'); 