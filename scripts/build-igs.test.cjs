const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { withCopiedFiles } = require('./build-igs.cjs');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'legio-build-igs-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const source = path.join(root, 'source');
  const destination = path.join(root, 'destination');
  fs.mkdirSync(path.join(source, 'package'), { recursive: true });
  fs.mkdirSync(path.join(source, 'content'));
  fs.mkdirSync(path.join(destination, 'content'), { recursive: true });
  fs.writeFileSync(path.join(source, 'package', 'package.json'), '{}');
  fs.writeFileSync(path.join(source, 'content', 'fyr.css'), 'template');
  fs.writeFileSync(path.join(destination, 'content', 'existing.css'), 'keep');
  return { source, destination };
}

test('removes Publisher files in staged directories and preserves existing files', (t) => {
  const { source, destination } = fixture(t);
  const stagedPackage = path.join(destination, 'package');

  withCopiedFiles(source, destination, 'shared template', () => {
    assert.equal(fs.readFileSync(path.join(stagedPackage, 'package.json'), 'utf8'), '{}');
    fs.writeFileSync(path.join(stagedPackage, '.index.json'), 'generated');
    fs.mkdirSync(path.join(stagedPackage, 'cache'));
    fs.writeFileSync(path.join(stagedPackage, 'cache', 'state'), 'generated');
  });

  assert.equal(fs.existsSync(stagedPackage), false);
  assert.equal(fs.existsSync(path.join(destination, 'content', 'fyr.css')), false);
  assert.equal(fs.readFileSync(path.join(destination, 'content', 'existing.css'), 'utf8'), 'keep');
});

test('cleans staged directories when Publisher fails', (t) => {
  const { source, destination } = fixture(t);
  const stagedPackage = path.join(destination, 'package');

  assert.throws(() => withCopiedFiles(source, destination, 'shared template', () => {
    fs.writeFileSync(path.join(stagedPackage, '.index.db'), 'generated');
    throw new Error('Publisher failed');
  }), /Publisher failed/);

  assert.equal(fs.existsSync(stagedPackage), false);
  assert.equal(fs.readFileSync(path.join(destination, 'content', 'existing.css'), 'utf8'), 'keep');
});

test('rejects a destination file collision without changing existing files', (t) => {
  const { source, destination } = fixture(t);
  const existingFile = path.join(destination, 'content', 'fyr.css');
  fs.writeFileSync(existingFile, 'local');

  assert.throws(() => withCopiedFiles(source, destination, 'shared template', () => {}), /conflicts with/);

  assert.equal(fs.readFileSync(existingFile, 'utf8'), 'local');
  assert.equal(fs.existsSync(path.join(destination, 'package')), false);
});
