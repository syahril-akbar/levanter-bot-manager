# levanter-bot-manager

Automated script to manage and run multiple Levanter bot instances using PM2 or Node.js. This script includes features for cloning repositories, installing dependencies, and auto-restarting bots in case of errors.

## Description

This program is designed to simplify the deployment of Levanter bots on a **Pterodactyl** panel. With this script, you can run several bots simultaneously on a single server. **Important:** The Pterodactyl panel used must have **unlimited** specifications in terms of RAM, CPU, and storage. This approach is a life hack for those renting panels who want to run multiple bots on a single server without needing to rent multiple server panels.

## Features

- **Repository Cloning:** Automatically clones the bot repository if it does not exist.
- **Dependency Installation:** Checks for and installs the required dependencies.
- **Auto Restart:** Automatically restarts a bot in case of an error.
- **PM2 & Node.js Support:** Can be run using PM2 for process management or directly with Node.js.

## Usage

1. **Panel Requirements:** Ensure that your Pterodactyl panel has **unlimited** specifications for RAM, CPU, and storage.
2. **Bot Configuration:** Edit the `bots.json` file to add the names of the bots you wish to run.
3. **Run the Script:** Execute `index.js` to start deploying and managing your bots.

## Session ID Setup

To scan or generate your session ID, you can use this page: **[https://levanter-delta.vercel.app](https://levanter-delta.vercel.app)**

1. **Open the link** above.
2. **Check "Custom Session ID"** in the interface.
3. **Enter the exact name** as specified in `bots.json` (e.g., `sharilbot` or `sharilbot2`).
4. **Scan the QR code** (or use the provided methods) to complete the session setup.

> **Why this matters:**  
> The script automatically creates a session ID name based on your bot name in `bots.json`. If you do not match the session ID to the bot name, your bot may not start or link properly.

## File Structure

- **index.js:** The main script for managing and running the bots.
- **bots.json:** A configuration file containing the list of bots to be run.

## Notes

Ensure that each bot has a `package.json` file and the necessary dependencies so that the script can run the bot successfully. If any dependencies are missing, the script will automatically install them.
