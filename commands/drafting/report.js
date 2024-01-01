const { TextInputStyle, ModalBuilder, TextInputBuilder, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ActionRowBuilder } = require('discord.js');
const { Drafts, Records } = require('../../dbObjects.js');
const { Op } = require('sequelize');


module.exports = {

	data: new SlashCommandBuilder()
		.setName('report')
		.setDescription('Report your draft results!')
		.addIntegerOption(option =>
			option.setName('draft')
					.setDescription('The draft you\'re reporting for')
					.setRequired(true)
					.setAutocomplete(true))
		.addIntegerOption(option => 
			option.setName('wins')
					.setDescription('Wins')
					.setRequired(true)
					.addChoices(
						{ name: '3', value: 3 },
						{ name: '2', value: 2 },
						{ name: '1', value: 1 },
						{ name: '0', value: 0 }
					))
		.addIntegerOption(option => 
			option.setName('losses')
					.setDescription('Losses')
					.setRequired(true)
					.addChoices(
						{ name: '3', value: 3 },
						{ name: '2', value: 2 },
						{ name: '1', value: 1 },
						{ name: '0', value: 0 }
					))
		.addAttachmentOption(option =>
			option.setName('img')
					.setDescription('Share a pic of your deck!'))
		.addIntegerOption(option => 
			option.setName('draws')
					.setDescription('Draws')
					.addChoices(
						{ name: '3', value: 3 },
						{ name: '2', value: 2 },
						{ name: '1', value: 1 },
						{ name: '0', value: 0 }
					)),
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
	async modalSubmit(interaction){
		const record = await Records.findByPk(interaction.customId.split(' ')[1]);

		const colorsRaw = interaction.fields.getTextInputValue('colorInput');
		const availableColors = ['W', 'U', 'B', 'R', 'G', 'C'];
		const colorsInput = colorsRaw.split('');
		const colorsFinal = availableColors.filter(c => colorsInput.includes(c));
		record.colors = colorsFinal.join('');

		const tagsRaw = interaction.fields.getTextInputValue('tagsInput').toLowerCase();
		const tagsInput = tagsRaw.split(/[ ,]+/);
		const tagsFinal = JSON.stringify(tagsInput);
		record.tags = tagsFinal;

		record.save();

		await interaction.reply('Thank you! Your input has been recorded');
	},
	async execute(interaction) {

		const draftId = interaction.options.getInteger('draft');
		const draft = await Drafts.findByPk(draftId);
		// handle if this user has already reported
		const priorRecord = await Records.findOne({ where: {draftId: draftId, userId: interaction.user.id}});
		if(priorRecord.wins){
			await interaction.reply(`You already reported for this draft!`);
			return;
		}

		// pull up existing report and update with the report info
		const report = await Records.findOne({ where: {draftId: draftId, userId: interaction.user.id}});
		if(!report){
			await interaction.reply(`You didn't participate in that draft!`);
			return;
		}

		const wins = interaction.options.getInteger('wins');
		const losses = interaction.options.getInteger('losses');
		const draws = interaction.options.getInteger('draws') || 0;
		report.set({
			wins: wins,
			losses: losses,
			draws: draws,
			img: JSON.stringify(interaction.options.getAttachment('img'))
		});
		report.save();
		

		const modal = new ModalBuilder()
			.setCustomId('deckSubmit '+report.id)
			.setTitle('Thank you! Please describe your deck:');


		const colorInput = new TextInputBuilder()
			.setCustomId('colorInput')
			.setLabel("What were your deck's colors?")
			.setPlaceholder('W, UB, RUG, WUBRG, C, etc.')
			.setMaxLength(5)
			.setMinLength(1)
			.setStyle(TextInputStyle.Short)
			.setRequired(true);

		const tagsInput = new TextInputBuilder()
			.setCustomId('tagsInput')
			.setLabel("Describe your deck!")
			.setPlaceholder('Artifacts, Enchantments, Aggro, Control, Storm, etc.')
			.setStyle(TextInputStyle.Short)
			.setRequired(true);

		const colorRow = new ActionRowBuilder().addComponents(colorInput);
		const tagsRow = new ActionRowBuilder().addComponents(tagsInput);
		modal.addComponents(colorRow, tagsRow);

		await interaction.showModal(modal);

		// close the draft once everyone has reported
		const records = await Records.findAll({where: {draftId: draftId, wins: { [Op.ne]: null }} })
		if(records.length >= draft.players){
			draft.status = 'closed';
			draft.save();
		}

		// assign new trophyleader
		if(wins >= 3 && losses == 0){
			const trophyLeaderRoleId = '1185612501891682366';
			await interaction.guild.members.fetch();
			const trophyLeaderRole = await interaction.guild.roles.cache.get(trophyLeaderRoleId)
			const trophyLeader = trophyLeaderRole.members.first();
			if(trophyLeader !== interaction.member){
				const currentLeaderTrophies = await Records.findAndCountAll({
					where: {
						wins: { [Op.gte]: 3 },
						losses: 0,
						userId: trophyLeader.user.id
					}
				});
				const newLeaderTrophies = await Records.findAndCountAll({
					where: {
						wins: { [Op.gte]: 3 },
						losses: 0,
						userId: interaction.user.id
					}
				});
				
				if(newLeaderTrophies.count > currentLeaderTrophies.count){
					trophyLeader.roles.remove(trophyLeaderRole);
					interaction.member.roles.add(trophyLeaderRole);

					const displayName = interaction.member.nickname ? interaction.member.nickname : interaction.member.user.username;
					await interaction.followUp(`Congratulations ${displayName}, you are the new <@&${trophyLeaderRoleId}>!`);
				}
			}
		}

	},
};