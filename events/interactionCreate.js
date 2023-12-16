const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			// handle slash commands
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
				} else {
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
		} else if(interaction.isAutocomplete()){
			// handle autocomplete
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.autocomplete(interaction);
			} catch (error) {
				console.error(error);
			}
		} else if(interaction.isModalSubmit()){
			// handle modal submit
			try {
				const idBase = interaction.customId.split(' ')[0];
				switch(idBase){
					case 'deckSubmit':
						await interaction.client.commands.get('report').modalSubmit(interaction);
						break;
					default:
						console.log('interaction not found');
				}
			} catch (error) {
				console.error(error);
			}
		} else{
			return;
		}

		
	},
};