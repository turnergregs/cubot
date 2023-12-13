const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ActionRowBuilder } = require('discord.js');
const { Drafts, Records } = require('../../dbObjects.js');

module.exports = {

	data: new SlashCommandBuilder()
		.setName('report')
		.setDescription('Report your draft results!')
		.addIntegerOption(option =>
			option.setName('draft')
					.setDescription('The draft you\'re reporting for')
					.setRequired(true)
					.setAutocomplete(true))
		.addAttachmentOption(option =>
			option.setName('img')
					.setDescription('Share a pic of your deck!')
					.setRequired(true)),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();

		let choices = [];
		const openDrafts = await Drafts.findAll({where: {status: 'open', private: false} });
		openDrafts.forEach(d => choices.push({ name: d.cubeId +' '+d.id, value: d.id}));

		const filtered = choices.filter(choice => choice.name.startsWith(focusedValue));
		await interaction.respond(
			filtered.map(choice => ({ name: choice.name, value: choice.value })),
		);
	},
	async execute(interaction) {

		const draftId = interaction.options.getInteger('draft')

		const content = `Thank you for reporting! Please fill out a little extra info:`;

		const winSelect = new StringSelectMenuBuilder()
			.setCustomId('wins')
			.setPlaceholder('Wins')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('0')
					.setDescription('0')
					.setValue('0'),
				new StringSelectMenuOptionBuilder()
					.setLabel('1')
					.setDescription('1')
					.setValue('1'),
				new StringSelectMenuOptionBuilder()
					.setLabel('2')
					.setDescription('2')
					.setValue('2'),
				new StringSelectMenuOptionBuilder()
					.setLabel('3')
					.setDescription('3')
					.setValue('3'),
				new StringSelectMenuOptionBuilder()
					.setLabel('4')
					.setDescription('4')
					.setValue('4'),
			);

		const winRow = new ActionRowBuilder()
			.addComponents(winSelect);

		const lossSelect = new StringSelectMenuBuilder()
			.setCustomId('losses')
			.setPlaceholder('Losses')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('0')
					.setDescription('0')
					.setValue('0'),
				new StringSelectMenuOptionBuilder()
					.setLabel('1')
					.setDescription('1')
					.setValue('1'),
				new StringSelectMenuOptionBuilder()
					.setLabel('2')
					.setDescription('2')
					.setValue('2'),
				new StringSelectMenuOptionBuilder()
					.setLabel('3')
					.setDescription('3')
					.setValue('3'),
				new StringSelectMenuOptionBuilder()
					.setLabel('4')
					.setDescription('4')
					.setValue('4'),
			);

		const lossRow = new ActionRowBuilder()
			.addComponents(lossSelect);

		const drawSelect = new StringSelectMenuBuilder()
			.setCustomId('draws')
			.setPlaceholder('Draws')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('0')
					.setDescription('0')
					.setValue('0'),
				new StringSelectMenuOptionBuilder()
					.setLabel('1')
					.setDescription('1')
					.setValue('1'),
				new StringSelectMenuOptionBuilder()
					.setLabel('2')
					.setDescription('2')
					.setValue('2'),
				new StringSelectMenuOptionBuilder()
					.setLabel('3')
					.setDescription('3')
					.setValue('3'),
				new StringSelectMenuOptionBuilder()
					.setLabel('4')
					.setDescription('4')
					.setValue('4'),
			);

		const drawRow = new ActionRowBuilder()
			.addComponents(drawSelect);

		const colorSelect = new StringSelectMenuBuilder()
			.setCustomId('colors')
			.setPlaceholder('Colors')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('W')
					.setDescription('W')
					.setValue('W'),
				new StringSelectMenuOptionBuilder()
					.setLabel('U')
					.setDescription('U')
					.setValue('U'),
				new StringSelectMenuOptionBuilder()
					.setLabel('B')
					.setDescription('B')
					.setValue('B'),
				new StringSelectMenuOptionBuilder()
					.setLabel('R')
					.setDescription('R')
					.setValue('R'),
				new StringSelectMenuOptionBuilder()
					.setLabel('G')
					.setDescription('G')
					.setValue('G'))
			.setMinValues(1)
			.setMaxValues(5);

		const colorRow = new ActionRowBuilder()
			.addComponents(colorSelect);

		await interaction.reply({
			content: content,
			components: [winRow, lossRow, drawRow, colorRow],
			ephemeral: true
		});

		// close the draft once everyone has reported
		const draft = await Drafts.findByPk(draftId);
		const records = await Records.findAll({where: {draftId: draftId} })
		if(records.length >= draft.players){
			draft.status = 'closed';
			draft.save();
		}
	},
};