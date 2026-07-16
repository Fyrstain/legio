const fs = require('fs');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '..');
const igOutputPath = path.join(repositoryRoot, 'ig', 'output');
const targetArgument = process.argv[2] ?? 'build/ig';
const targetPath = path.resolve(repositoryRoot, targetArgument);

function assertDirectoryExists(directoryPath, label) {
  if (!fs.existsSync(directoryPath) || !fs.statSync(directoryPath).isDirectory()) {
    throw new Error(`${label} not found: ${directoryPath}`);
  }
}

function copyDirectory(sourcePath, destinationPath) {
  fs.mkdirSync(destinationPath, { recursive: true });

  for (const entry of fs.readdirSync(sourcePath, { withFileTypes: true })) {
    const sourceEntryPath = path.join(sourcePath, entry.name);
    const destinationEntryPath = path.join(destinationPath, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourceEntryPath, destinationEntryPath);
      continue;
    }

    if (entry.isFile()) {
      fs.copyFileSync(sourceEntryPath, destinationEntryPath);
    }
  }
}

assertDirectoryExists(igOutputPath, 'IG output directory');

fs.rmSync(targetPath, { recursive: true, force: true });
copyDirectory(igOutputPath, targetPath);

console.log(`FHIR IG copied to ${path.relative(repositoryRoot, targetPath)}`);
