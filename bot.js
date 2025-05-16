const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function moveFiles(srcDir, destDir) {
  const files = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const file of files) {
    if (file.name === '.' || file.name === '..') continue;
    const srcPath = path.join(srcDir, file.name);
    const destPath = path.join(destDir, file.name);
    fs.renameSync(srcPath, destPath);
  }
  fs.rmdirSync(srcDir);
}

// Step 1: Write all environment variables to config.env
let config = '';
for (const key in process.env) {
  config += `${key}=${process.env[key]}\n`;
}
fs.writeFileSync('config.env', config);
console.log('✅ config.env created from environment variables');

const repo = 'https://github.com/Akshay-Eypz/izumi-bot.git';

if (fs.existsSync('./ecosystem.config.js')) {
  console.log('✅ Bot detected. Starting...');
  exec('pm2-runtime ecosystem.config.js');
} else {
  console.log('⬇️ Bot not found. Cloning repository...');
  exec(`git clone ${repo} temp`, (err) => {
    if (err) return console.error('❌ Git clone error:', err);

    console.log('📂 Moving files to root...');
    try {
      moveFiles('temp', '.');
      console.log('✅ Files moved successfully');

      console.log('📦 Installing dependencies...');
      exec('npm install --force && npm install pm2@latest', (err) => {
        if (err) return console.error('❌ Install error:', err);

        console.log('▶️ Starting bot with PM2...');
        exec('pm2-runtime ecosystem.config.js');
      });
    } catch (err) {
      console.error('❌ Move error:', err);
    }
  });
}
