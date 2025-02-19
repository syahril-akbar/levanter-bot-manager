const { spawnSync, spawn } = require('child_process');
const { existsSync, writeFileSync, readFileSync } = require('fs');
const path = require('path');

const BOTS_CONFIG_FILE = 'bots.json';

let bots = [];

// Read bot configuration from JSON file
if (existsSync(BOTS_CONFIG_FILE)) {
  bots = JSON.parse(readFileSync(BOTS_CONFIG_FILE));
} else {
  console.error(`${BOTS_CONFIG_FILE} not found! Please create a JSON file with bot configurations.`);
  process.exit(1);
}

// Function to start a bot using Node.js
function startNode(botName) {
  const child = spawn('node', ['index.js'], { cwd: botName, stdio: 'inherit' });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.log(`Bot ${botName} exited with code ${code}. Restarting...`);
      startNode(botName);
    }
  });
}

// Function to start a bot using PM2
function startPm2(botName) {
  const pm2 = spawn('yarn', ['pm2', 'start', 'index.js', '--name', botName, '--attach'], {
    cwd: botName,
    stdio: 'inherit',
  });

  pm2.on('exit', (code) => {
    if (code !== 0) {
      console.log(`PM2 failed for ${botName}, falling back to Node.js...`);
      startNode(botName);
    }
  });
}

// Function to install bot dependencies
function installDependencies(botName) {
  spawnSync('yarn', ['install', '--force', '--non-interactive'], { cwd: botName, stdio: 'inherit' });
}

// Function to check if dependencies are properly installed
function checkDependencies(botName) {
  if (!existsSync(path.resolve(botName, 'package.json'))) {
    console.error(`package.json not found for ${botName}!`);
    process.exit(1);
  }

  const result = spawnSync('yarn', ['check', '--verify-tree'], { cwd: botName, stdio: 'inherit' });

  if (result.status !== 0) {
    console.log(`Dependencies missing for ${botName}. Installing...`);
    installDependencies(botName);
  }
}

// Function to clone bot repository if it does not exist
function cloneRepository(botName) {
  if (!existsSync(botName)) {
    spawnSync('git', ['clone', 'https://github.com/lyfe00011/levanter.git', botName], { stdio: 'inherit' });

    // Set SESSION_ID in the format levanter_botName
    const sessionId = `levanter_${botName}`;

    // Write basic configuration file (config.env)
    const configPath = path.join(botName, 'config.env');
    writeFileSync(configPath, `VPS=true\nSESSION_ID=${sessionId}`);

    console.log(`✅ Config file created for ${botName} with SESSION_ID=${sessionId}`);
  }
}

// Loop through each bot in the configuration
bots.forEach((bot) => {
  console.log(`Setting up bot: ${bot.name}`);
  cloneRepository(bot.name);
  checkDependencies(bot.name);
  startPm2(bot.name);
});
