const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'node_modules', 'izumi');
const destDir = __dirname;

// Create config.env from environment variables
function createConfigEnv() {
  let config = '';
  for (const key in process.env) {
    config += `${key}=${process.env[key]}\n`;
  }
  fs.writeFileSync(path.join(destDir, 'config.env'), config);
  console.log('✅ config.env created from environment variables');
}

// Move files from node_modules/izumi to root
function moveFiles(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue; // skip .git and node_modules inside izumi

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // If dest exists, remove it (file or folder)
    if (fs.existsSync(destPath)) {
      if (fs.lstatSync(destPath).isDirectory()) {
        fs.rmSync(destPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(destPath);
      }
    }

    fs.renameSync(srcPath, destPath);
  }
  console.log('📂 Moved files from node_modules/izumi to project root');
}

async function main() {
  try {
    console.log('📦 Installing dependencies...');
    execSync('npm install --force && npm install pm2@latest', { stdio: 'inherit' });

    createConfigEnv();

    // Check if izumi folder exists in node_modules
    if (!fs.existsSync(srcDir)) {
      console.log('❌ izumi package not found in node_modules. Make sure it is installed.');
      process.exit(1);
    }

    moveFiles(srcDir, destDir);

    // Now start pm2 from root
    console.log('▶️ Starting bot with pm2...');
    exec('pm2-runtime ecosystem.config.js', (err, stdout, stderr) => {
      if (err) {
        console.error('❌ PM2 start error:', err);
        return;
      }
      console.log(stdout);
    });
  } catch (e) {
    console.error('❌ Error:', e);
  }
}

main();
