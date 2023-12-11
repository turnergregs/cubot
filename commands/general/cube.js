const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cube')
		.setDescription('Links to a cube based on the provided cubecobra id.')
		.addStringOption(option =>
			option
				.setName('cubecobra_id')
				.setDescription('The id of the cube')),
	async execute(interaction) {
		const cubecobra_id = interaction.options.getString('cubecobra_id') ?? '';
		if(cubecobra_id == ''){
			await interaction.reply(`invalid cube id`)
		}else{
			await interaction.reply(`https://cubecobra.com/cube/overview/${cubecobra_id}`);
		}
	},
};