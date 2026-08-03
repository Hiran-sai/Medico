const fs = require('fs');
const path = require('path');

const root = __dirname;
const projectRoot = path.resolve(root, '..');
const distDir = path.join(projectRoot, 'dist');
const frontendDist = path.join(projectRoot, 'frontend', 'dist');
const adminDist = path.join(projectRoot, 'admin', 'dist');

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(path.join(distDir, 'admin'), { recursive: true });

copyDir(frontendDist, distDir);
copyDir(adminDist, path.join(distDir, 'admin'));

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`Missing build output: ${src}`);
  }

  fs.cpSync(src, dest, { recursive: true });
}
