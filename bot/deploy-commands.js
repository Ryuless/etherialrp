require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');

// Client ID (from .env). Guild ID is optional — commands will be registered globally
const clientId = process.env.DISCORD_CLIENT_ID; // You need to add this to your .env file
const guildId = process.env.DISCORD_GUILD_ID; // Optional: keep for local/dev fast deploys
const deployGuildCommands = process.env.DEPLOY_GUILD_COMMANDS === 'true'; // Explicitly enable guild deploy for dev
const clearGuildCommands = process.env.CLEAR_GUILD_COMMANDS === 'true'; // Explicitly remove guild commands when needed
const token = process.env.DISCORD_BOT_TOKEN;

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		// Global commands are required so the bot works in every server.
		// Keep guild deploy disabled by default to avoid duplicate command entries.
		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);
		console.log('Successfully reloaded global (/) commands.');

		if (guildId && clearGuildCommands) {
			await rest.put(
				Routes.applicationGuildCommands(clientId, guildId),
				{ body: [] },
			);
			console.log('Successfully cleared guild (/) commands.');
		} else if (guildId && deployGuildCommands) {
			await rest.put(
				Routes.applicationGuildCommands(clientId, guildId),
				{ body: commands },
			);
			console.log('Successfully reloaded guild (/) commands.');
		}

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();
