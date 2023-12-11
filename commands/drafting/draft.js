const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
const { Drafts } = require('../../dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('draft')
		.setDescription('Start a draft of the provided cubecobra_id')
		.addStringOption(option =>
			option
				.setName('cubecobra_id')
				.setDescription('The id of the cube')),
	async execute(interaction) {
		// error handling
		const cubecobra_id = interaction.options.getString('cubecobra_id') ?? '';
		if(cubecobra_id == ''){
			await interaction.reply(`invalid cube id`);
			return;
		}

		// create draft object
		date = new Date();
		const draft = await Drafts.create({ 
			cube_id: cubecobra_id, 
			status: 'open',
			date: date.getDate()
		});

		// set up info about drafters
		const drafters = [];
		const getContent = function(drafters) {
			content = `Created ${cubecobra_id} draft: ${draft.id}`;
			for(drafter of drafters){
				content += `\n${drafter.username}`;
			}
			return content;
		};

		// create join/leave button row
		const join = new ButtonBuilder()
			.setCustomId('join')
			.setLabel('Join')
			.setStyle(ButtonStyle.Success);

		const leave = new ButtonBuilder()
			.setCustomId('leave')
			.setLabel('Leave')
			.setStyle(ButtonStyle.Danger);

		const buttonRow = new ActionRowBuilder()
			.addComponents(join, leave);

		// send draft message with join/leave buttons
		const response = await interaction.reply({
			content: `Created ${cubecobra_id} draft: ${draft.id}`,
			components: [buttonRow]
		});

		// set up handler for button clicks
		const collector = response.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 3_600_000
		});

		collector.on('collect', async i => {
			const user = i.user;
			const buttonId = i.customId;
			if(buttonId == 'join'){
				index = drafters.indexOf(user);
				if(index == -1){
					drafters.push(user);
				}
				await i.update({
					content: getContent(drafters), 
					components: [buttonRow] 
				});
			} else if(buttonId == 'leave'){
				index = drafters.indexOf(user);
				if(index > -1){
					drafters.splice(index, 1);
				}
				await i.update({
					content: getContent(drafters),
					components: [buttonRow]
				});
			}
		});

		// set up start/close buttons for draft owner
		const start = new ButtonBuilder()
			.setCustomId('start')
			.setLabel('Start')
			.setStyle(ButtonStyle.Success);

		const close = new ButtonBuilder()
			.setCustomId('close')
			.setLabel('Close')
			.setStyle(ButtonStyle.Secondary);

		const ephemButtonRow = new ActionRowBuilder()
			.addComponents(start, close);

		// send message to draft owner to start or close draft
		const followUp = await interaction.followUp({
			content: 'Start the draft when everyone joins!',
			components: [ephemButtonRow],
			ephemeral: true
		});

		// set up handler for start/close button clicks
		const followUpCollector = followUp.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 3_600_000
		});

		followUpCollector.on('collect', async i => {
			ephemButtonRow.components[0].setDisabled(true);
			ephemButtonRow.components[1].setDisabled(true);
			await i.update({
				content: getContent(drafters),
				components: [ephemButtonRow]
			});

			const buttonId = i.customId;
			if(buttonId == 'start'){
				await i.followUp({content: `starting ${cubecobra_id} draft ${draft.id} with ${drafters.length} drafters!`});
				await interaction.deleteReply();
			} else if(buttonId == 'close'){
				await i.followUp({content: `closing draft`});
				await interaction.deleteReply();
			}
			await Drafts.update({status: 'closed'}, {where: {id: draft.id}});
		});
	},
};