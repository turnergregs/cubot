const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pack')
		.setDescription('Shows a sample pack based on the provided cubecobra id.')
		.addStringOption(option =>
			option
				.setName('cubecobra_id')
				.setDescription('The id of the cube')),
	async execute(interaction) {
		const cubecobra_id = interaction.options.getString('cubecobra_id') ?? '';
		if(cubecobra_id == ''){
			await interaction.reply(`invalid cube id`)
		}else{
			const seed = Math.random(999999999);
			await interaction.reply(`p1p1 from ${cubecobra_id}!\n
									https://cubecobra.com/cube/samplepackimage/${cubecobra_id}/${seed}`);
		}
	},
};