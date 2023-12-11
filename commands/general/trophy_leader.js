const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('trophy_leader')
		.setDescription('Links the current trophy leader.'),
	async execute(interaction) {
		//get trophy leader
		user = 'grenrut';
		count = 2;
		//@silent not working, gotta figure that out
		//ok I hear this should work:
		await interaction.reply({
  			content: `@${user} is the current trophy leader with ${count} trophies!`,
  			flags: [ 4096 ]
		});
		//okay yeah it works but doesn't actually link the user, I think it needs to grab the actual User object
	},
};