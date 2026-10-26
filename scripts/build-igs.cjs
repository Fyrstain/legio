const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const commonInput = path.join(root, 'ig-common', 'input');
const commonTemplate = path.join(root, 'ig-common', 'my-template');
const publisherJar = path.join(root, 'ig-common', 'input-cache', 'publisher.jar');
const targets = { r4: 'ig', r5: 'ig-r5' };
const args = process.argv.slice(2);
const target = args.find((arg) => !arg.startsWith('--')) || 'both';
const sushiOnly = args.includes('--sushi-only');

if (!['both', 'r4', 'r5'].includes(target) || args.some((arg) => arg.startsWith('--') && arg !== '--sushi-only')) {
  console.error('Usage: node scripts/build-igs.cjs [both|r4|r5] [--sushi-only]');
  process.exit(2);
}

function run(command, commandArgs, cwd) {
  const result = spawnSync(command, commandArgs, {
    cwd,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed in ${path.relative(root, cwd)} (exit ${result.status})`);
}

function listFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : entry.isFile() ? [fullPath] : [];
  });
}

function withCopiedFiles(sourceRoot, destinationRoot, label, build) {
  const files = listFiles(sourceRoot);
  const copies = files.map((source) => ({
    source,
    destination: path.join(destinationRoot, path.relative(sourceRoot, source)),
  }));
  for (const { destination } of copies) {
    if (fs.existsSync(destination)) {
      throw new Error(`${label} conflicts with ${path.relative(root, destination)}`);
    }
  }

  const addedFiles = [];
  const addedDirs = [];
  try {
    for (const { source, destination } of copies) {
      const missing = [];
      for (let parent = path.dirname(destination); !fs.existsSync(parent); parent = path.dirname(parent)) {
        missing.push(parent);
      }
      for (const directory of missing.reverse()) {
        fs.mkdirSync(directory);
        addedDirs.push(directory);
      }
      fs.copyFileSync(source, destination);
      addedFiles.push(destination);
    }
    console.log(`Added ${addedFiles.length} ${label} file(s) to ${path.relative(root, destinationRoot)}`);
    build();
  } finally {
    for (const file of addedFiles) fs.rmSync(file);
    for (const directory of addedDirs.reverse()) fs.rmdirSync(directory);
  }
}

function ensurePublisher() {
  if (fs.existsSync(publisherJar)) return;
  fs.mkdirSync(path.dirname(publisherJar), { recursive: true });
  const url = 'https://github.com/HL7/fhir-ig-publisher/releases/latest/download/publisher.jar';
  const curl = process.platform === 'win32' ? 'curl.exe' : 'curl';
  try {
    run(curl, ['--fail', '--location', '--retry', '3', '--output', publisherJar, url], root);
  } catch (error) {
    fs.rmSync(publisherJar, { force: true });
    throw error;
  }
}

try {
  if (!sushiOnly && !fs.existsSync(path.join(commonTemplate, 'package', 'package.json'))) {
    throw new Error('Shared template missing: ig-common/my-template/package/package.json');
  }
  if (!sushiOnly) {
    ensurePublisher();
    console.log(`Using IG Publisher from ${path.relative(root, publisherJar)}`);
  }
  for (const version of target === 'both' ? ['r4', 'r5'] : [target]) {
    const project = path.join(root, targets[version]);
    withCopiedFiles(commonInput, path.join(project, 'input'), 'shared input', () => {
      console.log(`Building ${version.toUpperCase()} in ${path.relative(root, project)}`);
      if (process.platform === 'win32') {
        run(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'sushi.cmd .'], project);
      } else {
        run('sushi', ['.'], project);
      }
      if (sushiOnly) return;

      const started = Date.now();
      const publish = () => run('java', ['-Dfile.encoding=UTF-8', '-jar', publisherJar, '-ig', '.', '-no-sushi'], project);
      withCopiedFiles(commonTemplate, path.join(project, 'my-template'), 'shared template', publish);
      const output = path.join(project, 'output', 'index.html');
      if (!fs.existsSync(output) || fs.statSync(output).mtimeMs < started - 2000) {
        throw new Error(`Publisher did not create ${path.relative(root, output)}`);
      }
      const qaFile = path.join(project, 'output', 'qa.txt');
      if (!fs.existsSync(qaFile)) throw new Error(`QA report missing for ${version}`);
      const match = fs.readFileSync(qaFile, 'utf8').match(/^err = (\d+),/m);
      if (!match) throw new Error(`QA summary missing for ${version}`);
      if (Number(match[1]) > 0) console.warn(`QA contains ${match[1]} error(s) for ${version}: ${qaFile}`);
    });
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
