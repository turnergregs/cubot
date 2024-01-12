const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, UserSelectMenuBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const { Drafts, Records } = require('../../dbObjects.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('draft')
		.setDescription('Start a draft of the provided cubecobra_id')
		.addStringOption(option =>
			option
				.setName('cubecobra_id')
				.setDescription('The id of the cube')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('type')
				.setDescription('Regular, Rotisserie')),
		.addBooleanOption(option =>
			option
				.setName('private')
				.setDescription('unrecorded draft?')),
	async execute(interaction) {
		// error handling
		const cubecobraId = interaction.options.getString('cubecobra_id') ?? '';
		if(cubecobraId == ''){
			await interaction.reply(`invalid cube id`);
			return;
		}

		// create draft object
		const draftType = interaction.options.getString('type');
		const date = new Date();
		const draft = await Drafts.create({ 
			cubeId: cubecobraId, 
			status: 'open',
			type: draftType || 'Regular',
			private: interaction.options.getBoolean('private') || false,
			date: date.toISOString().split('T')[0]
		});

		// set up info about drafters
		const drafters = [];
		const getContent = function(drafters) {
			content = `Created ${cubecobraId} ${draftType === 'Regular' ? '' : draftType} draft: ${draft.id}`;
			for(drafter of drafters){
				content += `\n${drafter.nickname ? drafter.nickname : drafter.user.username}`;
			}
			return content;
		};
		const getDisplayName = function(member){
			return member.nickname ? member.nickname : member.user.username;
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
			content: `Created ${cubecobraId} draft: ${draft.id}`,
			components: [buttonRow]
		});

		// set up handler for button clicks
		const collector = response.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 3_600_000
		});

		collector.on('collect', async i => {
			const member = i.member;
			const buttonId = i.customId;
			if(buttonId == 'join'){
				index = drafters.indexOf(member);
				if(index == -1){
					drafters.push(member);
				}
				await i.update({
					content: getContent(drafters), 
					components: [buttonRow] 
				});
			} else if(buttonId == 'leave'){
				index = drafters.indexOf(member);
				if(index > -1){
					drafters.splice(index, 1);
				}
				await i.update({
					content: getContent(drafters),
					components: [buttonRow]
				});
			}
		});

		// set up draft manager buttons for draft owner
		const start = new ButtonBuilder()
			.setCustomId('start')
			.setLabel('Start')
			.setStyle(ButtonStyle.Success);

		const close = new ButtonBuilder()
			.setCustomId('close')
			.setLabel('Close')
			.setStyle(ButtonStyle.Secondary);

		const startCloseButtonRow = new ActionRowBuilder()
			.addComponents(start, close);

		const addUserSelect = new UserSelectMenuBuilder({
			custom_id: 'addUser',
			placeholder: 'Manually add users',
			max_values: 8,
		});

		const addUserRow = new ActionRowBuilder()
			.addComponents(addUserSelect);

		const kickUserSelect = new UserSelectMenuBuilder({
			custom_id: 'kickUser',
			placeholder: 'Manually kick users',
			max_values: 8,
		});

		const kickUserRow = new ActionRowBuilder()
			.addComponents(kickUserSelect);

		// send message to draft owner to start or close draft
		const followUp = await interaction.followUp({
			content: 'Start the draft when everyone joins!',
			components: [startCloseButtonRow, addUserRow, kickUserRow],
			ephemeral: true
		});

		// set up handler for start/close button clicks
		const startCloseCollector = followUp.createMessageComponentCollector({
			time: 3_600_000
		});

		startCloseCollector.on('collect', async i => {
			const disableButtons = async function(){
				startCloseButtonRow.components[0].setDisabled(true);
				startCloseButtonRow.components[1].setDisabled(true);
				await i.update({
					content: getContent(drafters),
					components: [startCloseButtonRow, addUserRow, kickUserRow]
				});
			};
			
			if(i.customId == 'start'){
				await disableButtons();
				// starting draft
				const startMessage = await i.channel.send({
					content: `${cubecobraId} draft! (${drafters.length} players)`
				});
				await interaction.deleteReply();

				// lock the current drafters into the draft to have a record of people who need to report.
				drafters.forEach(async (drafter) => {
					await Records.create({
						draftId: draft.id,
						userId: drafter.user.id
					});
				})

				// currently this just randomizes the drafters
				// in the future, we could implement a ladder or elo system to make a more genuine tournament bracket
				let shuffled = drafters
				    .map(value => ({ value, sort: Math.random() }))
				    .sort((a, b) => a.sort - b.sort)
				    .map(({ value }) => value)

				// randomized draft seating chart
				let seatingText = "Draft Seating:";
				for(let i = 0; i < shuffled.length; i++){
					seatingText += `\n${i+1}: ${getDisplayName(shuffled[i])}`;
				}

				await startMessage.reply({content: seatingText});

				// build pairings, including a bye for odd number players
				pairings = [];
				if(shuffled.length % 2 !== 0){
					shuffled.push({nickname: "bye"});
				}

				// this will make the pairings cross-pod
				const matches = shuffled.length / 2;
				for(let i = 0; i < matches; i += 1){
					pairings.push([getDisplayName(shuffled[i]), getDisplayName(shuffled[i+matches])]);
				}

				let pairingText = "Round 1 Pairings:";
				for(pairing of pairings){
					pairingText += `\n${pairing[0]} vs ${pairing[1]}`;
				}

				await Drafts.update({players: drafters.length}, {where: {id: draft.id}});
				await startMessage.reply({content: pairingText});

				if(draftType === 'Rotisserie' && shuffled.length > 0){
					// create pick templates to track drafter order
					for(drafter of shuffled){
						Picks.create({ 
							draftId: draftId, 
							userId: drafter.user.id,
							pick: null,
							active: 0,
							date.toISOString().split('T')[0]
						});
					}
					// set draft status as picking
					draft.status = 'picking';
					draft.save();

					// get cardlist from cubecobra and store in temp file to track what's available
					const https = require('https');
					const fs = require('node:fs');
					https.get(`https://cubecobra.com/cube/api/cubelist/${cubecobraId}`, res => {
						let data = [];
						
						res.on('data', chunk => {
							data.push(chunk);
						});
						
						res.on('end', () => {
							// const cards = JSON.parse(Buffer.concat(data).toString());
							const cardString = Buffer.concat(data).toString();
						
							fs.writeFile(`/temp/draft${draftId}.txt`, cardString, err => {
								if(err){
									console.error(err);
								}
			  				});
						});
					}).on('error', err => {
						console.log(`Error pulling cards from ${cubecobraId}: `, err.message);
					});
					
					await startMessage.reply({content: `${shuffled[0]}, you pick first! Use the /pick command followed by the draftId(${draftId}) and the card you want to make your pick`});
				}

			} else if(i.customId == 'close'){
				await disableButtons();
				await i.followUp({content: `closing draft`});
				await interaction.deleteReply();
				await Drafts.update({status: 'closed'}, {where: {id: draft.id}});
			} else if(i.customId == 'addUser'){

				const newDrafters = [];

				i.members.forEach(member => {
					if(drafters.indexOf(member) == -1){
						drafters.push(member);
						newDrafters.push(getDisplayName(member));
					}
				})	

				await response.edit({
					content: getContent(drafters), 
					components: [buttonRow] 
				});

				await i.reply(`Added ${newDrafters.join(', ')} to the draft!`);
			} else if(i.customId == 'kickUser'){

				const kickDrafters = [];

				i.members.forEach(member => {
					index = drafters.indexOf(member);
					if(index > -1){
						drafters.splice(index, 1);
						kickDrafters.push(getDisplayName(member));
					}
				})	

				await response.edit({
					content: getContent(drafters), 
					components: [buttonRow] 
				});

				await i.reply(`Removed ${kickDrafters.join(', ')} from the draft!`);
			}
		});
	},
};
