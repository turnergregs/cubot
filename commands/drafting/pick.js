const { SlashCommandBuilder } = require('discord.js');
const { Drafts, Picks } = require('../../dbObjects.js');

module.exports = {

	data: new SlashCommandBuilder()
		.setName('pick')
		.setDescription('Pick a card for an async draft!')
		.addIntegerOption(option =>
			option.setName('draft')
					.setDescription('The draft you\'re reporting for')
					.setRequired(true)
					.setAutocomplete(true))
		.addStringOption(option => 
			option.setName('pick')
					.setDescription('Pick')
					.setRequired(true)
					.setAutocomplete(true)),
	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);
		const input = focusedOption.value;
		var choices = [];

		if (focusedOption.name === 'draft') {
			// Type: Rotisserie will have to change once I implement async regular drafting
			const openDrafts = await Drafts.findAll({where: {status: 'picking', private: false, type: 'Rotisserie'} });
			openDrafts.forEach(d => choices.push({ name: d.cubeId +' '+d.id, value: d.id}));

			const filtered = choices.filter(choice => choice.name.startsWith(input));
			await interaction.respond(
				filtered.map(choice => ({ name: choice.name, value: choice.value })),
			);

		} else if(focusedOption.name === 'pick'){
			const fs = require('node:fs');
			const draftId = interaction.options.getInteger('draft');
			if(input.length > 0){
				fs.readFile(`temp/draft${draftId}.txt`, 'utf8', async function(err, data){
				    if(err) {
				    	console.log(err);
				    } else {
				    	const cards = data.split('\n');
				    	const filteredCards = cards.filter(card => card.toLowerCase().startsWith(input.toLowerCase()));
				    	await interaction.respond(
				    		// discordAPI autocomplete only allows 25 results
							filteredCards.slice(0, 24).map(card => ({ name: card, value: card })),
						);
				    }
				});
			}
		}
	},
	async execute(interaction) {

		const draftId = interaction.options.getInteger('draft');
    		const draft = await Drafts.findByPk(draftId);
		if(!draft){
			await interaction.reply(`Draft ${draftId} not found`);
			return;
		}

		if(draft.status !== 'picking'){
			await interaction.reply(`All players have finished picking for draft ${draftId}`);
			return;
		}

		const pick = interaction.options.getString('pick');
		var invalidPick = false;
		var readFileError = false;

		// check if the pick is in the cube
		const fs = require('node:fs');
		fs.readFile(`temp/draft${draftId}.txt`, 'utf8', async function(err, data){
		    if(err) {
		    	console.log(err);
		    	await interaction.reply(`Error reading file.`);
				return;
		    } else if(!data.toLowerCase().includes(pick.toLowerCase())) {
		    	console.log(pick.toLowerCase());
		    	await interaction.reply(`${pick} not found in the cube, please try again.`);
				return;
		    }
		});
    
		// make sure it's this user's turn
		const pickTemplates = await Picks.findAll({where: {draftId: draftId, active: 0}});
		const lastPick = await Picks.findOne({where: {draftId: draftId}, order: [['id', 'DESC']]});

		// no one has picked yet and this isn't the first picker
		if(lastPick.active === 0 && interaction.user.id !== pickTemplates[0].userId){
			await interaction.reply(`It's not your turn to pick!`);
      			return;
		}

		// otherwise, get the index of the last person to pick and make sure the next person in order is who is picking
		const lastPickIndex = pickTemplates.map(function (p) {return p.userId;}).indexOf(lastPick.userId);
		const currentPickIndex = lastPickIndex === pickTemplates.length-1 ? 0 : lastPickIndex+1
		const currentPickerId = pickTemplates[currentPickIndex].userId;
		if(interaction.user.id !== currentPickerId){
			await interaction.reply(`It's not your turn to pick!`);
			return;
		}

		// check if this has already been picked
		const { count } = await Picks.findAndCountAll({where: {draftId: draftId, pick: pick}});
		if(count > 0){
			await interaction.reply(`${pick} has already been taken!`);
			return;
		}

		// register the pick
		const date = new Date();
		await Picks.create({
			draftId: draftId, 
			userId: interaction.user.id,
			pick: pick,
			active: 1,
			date: date.toISOString().split('T')[0]
		});

		const response = await interaction.reply(`Thank you for picking!`);
		
		// get all the player's picks to show them
		const picksSoFar = await Picks.findAll({
			attributes: ['pick'], 
			where: {
				draftId: draftId, 
				userId: interaction.user.id, 
				active: 1
			}
		});

		const content = 'Here are your picks so far:\n' + picksSoFar.map(function(val) {
			return val.pick;
		}).join('\n');

		await interaction.followUp(content);
		
		if(pickTemplates[pickTemplates.length-1].userId === interaction.user.id && picksSoFar.length === 45){
			// set draft to open if this is the last person in order to pick and they've picked 45 cards
			draft.status = 'open';
			draft.save();
			// then delete the temp cubelist file
			fs.unlink(`temp/draft${draftId}.txt`, function (err) {
				if(err) {
					console.log(`error deleting draft${draftId} file`);
				} else {
					console.log(`draft${draftId} file deleted`);
				}
			});
			await interaction.followUp(`Completed Rotisserie Draft!`);
		} else{
			// otherwise notify the next drafter
			const nextPickIndex = currentPickIndex === pickTemplates.length-1 ? 0 : currentPickIndex+1
			const nextPickerId = pickTemplates[nextPickIndex].userId;
			const nextPicker = await interaction.guild.members.fetch(nextPickerId)
			if(nextPicker){
				await interaction.followUp(`${nextPicker} It's your turn to pick for draft ${draftId}!`);
			}
		}
	}
};
