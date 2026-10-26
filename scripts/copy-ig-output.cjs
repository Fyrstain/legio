const fs = require('fs');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '..');
const targetArgument = process.argv[2] ?? 'build/ig';
const targetPath = path.resolve(repositoryRoot, targetArgument);
const landingPage = path.join(repositoryRoot, 'ig-common', 'site', 'index.html');
const guides = { r4: 'ig', r5: 'ig-r5' };

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

for (const directory of Object.values(guides)) {
  assertDirectoryExists(path.join(repositoryRoot, directory, 'output'), `${directory} output directory`);
  if (!fs.existsSync(path.join(repositoryRoot, directory, 'output', 'index.html'))) {
    throw new Error(`${directory} output/index.html not found`);
  }
}
if (!fs.existsSync(landingPage)) throw new Error(`IG landing page not found: ${landingPage}`);

fs.rmSync(targetPath, { recursive: true, force: true });
fs.mkdirSync(targetPath, { recursive: true });
fs.copyFileSync(landingPage, path.join(targetPath, 'index.html'));
for (const [version, directory] of Object.entries(guides)) {
  copyDirectory(path.join(repositoryRoot, directory, 'output'), path.join(targetPath, version));
}

console.log(`FHIR R4 and R5 IGs copied to ${path.relative(repositoryRoot, targetPath)}`);
