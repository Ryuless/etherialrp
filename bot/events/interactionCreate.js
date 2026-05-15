const { Events } = require('discord.js');
const { doc, getDoc, updateDoc } = require('firebase/firestore');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction, db) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction, db);

			if (interaction.user?.id) {
				try {
					const characterRef = doc(db, 'characters', interaction.user.id);
					const characterSnap = await getDoc(characterRef);
					if (characterSnap.exists()) {
						await updateDoc(characterRef, {
							lastActive: new Date()
						});
					}
				} catch (activityError) {
					console.error('Failed to update character lastActive:', activityError);
				}
			}
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	},
};
