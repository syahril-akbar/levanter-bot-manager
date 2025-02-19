const { spawnSync, existsSync, writeFileSync, readFileSync, mkdirSync } = require('fs');
const path = require('path');

const BOTS_CONFIG_FILE = 'bots.json';
const REPO_URL = process.env.REPO_URL || 'https://github.com/lyfe00011/levanter.git';

// 📌 Read the list of bots from bots.json
let bots = [];
if (existsSync(BOTS_CONFIG_FILE)) {
  bots = JSON.parse(readFileSync(BOTS_CONFIG_FILE));
} else {
  console.error(`🚨 File ${BOTS_CONFIG_FILE} not found! Please make sure it exists.`);
  process.exit(1);
}

// 🔒 Validate bot name to ensure safety
function sanitizeBotName(botName) {
  return botName.replace(/[^a-zA-Z0-9_]/g, '');
}

// 🔑 Generate SESSION_ID in the format "levanter_botName"
function generateSessionId(botName) {
  return `levanter_${botName}`;
}

// 🛠️ Execute a command with error handling
function safeSpawnSync(command, args, options) {
  try {
    const result = spawnSync(command, args, options);
    if (result.error) throw result.error;
    return result;
  } catch (err) {
    console.error(`⚠️ Error executing ${command}: ${err.message}`);
    return null;
  }
}

// 📦 Ensure PM2 is installed
function checkAndInstallPM2() {
  console.log("🔍 Checking if PM2 is installed...");
  const result = spawnSync('pm2', ['--version'], { stdio: 'ignore' });

  if (result.status !== 0) {
    console.log("⚠️ PM2 not found, installing...");
    const installResult = safeSpawnSync('yarn', ['global', 'add', 'pm2'], { stdio: 'inherit' });

    if (!installResult) {
      console.error("❌ Failed to install PM2. Please install it manually using: yarn global add pm2");
      process.exit(1);
    }
  } else {
    console.log("✅ PM2 is already installed.");
  }
}

// 📂 Clone repository and create a config file
function cloneRepository(botName) {
  if (!existsSync(botName)) {
    console.log(`📥 Cloning repository for bot: ${botName}`);
    safeSpawnSync('git', ['clone', REPO_URL, botName], { stdio: 'inherit' });

    const sessionId = generateSessionId(botName);
    const configPath = path.join(botName, 'config.env');

    writeFileSync(configPath, `VPS=true\nSESSION_ID=${sessionId}`, { mode: 0o600 });

    console.log(`✅ Config file created for ${botName} with SESSION_ID=${sessionId}`);
  }
}

// 📦 Install dependencies if necessary
function installDependencies(botName) {
  console.log(`📦 Checking dependencies for ${botName}...`);

  const result = spawnSync('yarn', ['check', '--verify-tree'], {
    cwd: botName,
    stdio: 'ignore',
  });

  if (result.status !== 0) {
    console.log(`🔄 Installing dependencies for ${botName}...`);
    safeSpawnSync('yarn', ['install', '--silent'], { cwd: botName, stdio: 'inherit' });
  } else {
    console.log(`✅ Dependencies for ${botName} are already installed.`);
  }
}

// 🚀 Start bot using PM2
function startBotWithPM2(botName) {
  console.log(`▶️ Starting bot ${botName} with PM2...`);

  // Ensure logs directory exists
  if (!existsSync('logs')) {
    mkdirSync('logs');
  }

  const result = safeSpawnSync('pm2', [
    'start', 'index.js',
    '--name', botName,
    '--cwd', botName,
    '--restart-delay', '5000', // Delay restart by 5 seconds
    '--output', `logs/${botName}-out.log`, // Log stdout
    '--error', `logs/${botName}-error.log`, // Log stderr
    '--watch' // Restart if files change
  ], { stdio: 'inherit' });

  if (result) {
    console.log(`✅ Bot ${botName} started successfully with PM2!`);
  } else {
    console.error(`❌ Failed to start bot ${botName} with PM2.`);
  }
}

// 🔄 Main process
checkAndInstallPM2();

bots.forEach((bot) => {
  const botName = sanitizeBotName(bot.name);
  console.log(`🔧 Setting up bot: ${botName}`);
  cloneRepository(botName);
  installDependencies(botName);
  startBotWithPM2(botName);
});
