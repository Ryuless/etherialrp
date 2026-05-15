require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');

// Client ID (from .env). Guild ID is optional — commands will be registered globally
const clientId = process.env.DISCORD_CLIENT_ID; // You need to add this to your .env file
const guildId = process.env.DISCORD_GUILD_ID; // Optional: keep for local/dev fast deploys
const forceGlobal = process.env.FORCE_GLOBAL === 'true'; // Set to 'true' to force global deploy
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

		// If a guild ID is provided and not forcing global, deploy to that guild for immediate availability (dev).
		// Otherwise deploy global application commands so the bot works in any server.
		if (guildId && !forceGlobal) {
			await rest.put(
				Routes.applicationGuildCommands(clientId, guildId),
				{ body: commands },
			);
			console.log('Successfully reloaded guild (/) commands.');
		} else {
			await rest.put(
				Routes.applicationCommands(clientId),
				{ body: commands },
			);
			console.log('Successfully reloaded global (/) commands.');
		}

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();
