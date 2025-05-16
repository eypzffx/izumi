const { exec } = require('child_process');
const fs = require('fs');

// Step 1: Write all environment variables to config.env
let config = '';
for (const key in process.env) {
  config += `${key}=${process.env[key]}\n`;
}
fs.writeFileSync('config.env', config);
console.log(' config.env created from environment variables');

// Step 2: Check if bot is already cloned (ecosystem.config.js is a good indicator)
if (fs.existsSync('./ecosystem.config.js')) {
  console.log(' Bot detected. Starting...');
  exec('pm2-runtime ecosystem.config.js');
} else {
  console.log('Bot not found. Cloning repository...');
  exec('git clone https://github.com/Akshay-Eypz/izumi-bot.git temp', (err) => {
    if (err) return console.error('Git clone error:', err);

    console.log('Moving files to root...');
    exec('mv temp/* ./ && mv temp/.* ./', (err) => {
      if (err) return console.error('Move error:', err);

      exec('rm -rf temp', (err) => {
        if (err) return console.error('Cleanup error:', err);

        console.log('Installing dependencies...');
        exec('npm install --force && npm install pm2@latest', (err) => {
          if (err) return console.error('Install error:', err);

          console.log('Starting bot with PM2...');
          exec('pm2-runtime ecosystem.config.js');
        });
      });
    });
  });
}
