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
					.setRequired(true)),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();

		let choices = [];
    // Type: Rotisserie will have to change once I implement async regular drafting
		const openDrafts = await Drafts.findAll({where: {status: 'open', private: false, type: 'Rotisserie'} });
		openDrafts.forEach(d => choices.push({ name: d.cubeId +' '+d.id, value: d.id}));

		const filtered = choices.filter(choice => choice.name.startsWith(focusedValue));
		await interaction.respond(
			filtered.map(choice => ({ name: choice.name, value: choice.value })),
		);
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
    
		// make sure it's this user's turn
    const pickTemplates = await Picks.findAll({where: {draftId: draftId, active: 0}});
    const lastPick = await Picks.findOne({where: {draftId: draftId}, order: [['id', 'DESC']]};

    let currentPickerId = null;
    if(lastPick.active === 0){
      // no one has picked yet
      currentPickerId = pickTemplates[0].userId;
    } else{
      // otherwise, get the index of the last person to pick and make sure the next person in order is who is picking
      const lastPickIndex = pickTemplates.map(function (p) {return p.userId;}).indexOf(lastPick.userId));
      currentPickerId = pickTemplates[lastPickIndex+1].userId;
    }

    if(interaction.user.id !== currentPickerId){
      await interaction.reply(`It's not your turn to pick!`);
      return;
    }

    // register the pick
    const date = new Date();
    await Picks.create({
      draftId: draftId, 
			userId: interaction.user.id,
			pick: interaction.options.getString('pick'),
			active: 1,
			date: date.toISOString().split('T')[0]
    });

    const response = await interaction.reply(`Thank you for picking!`);

    // get all the player's picks to show them
    const picksSoFar = await Picks.findAll({
      attributes: ['pick'], 
      where: {
        draftId: draftId, 
        userId: userId, 
        active: 1
      }
    });

    const content = 'Here are your picks so far:\n' + picksSoFar.map(function(val) {
      return val.pick;
    }).join('\n');

    await response.followUp({content: content});

    // set draft to open if this is the last person in order to pick and they've picked 45 cards
    if(pickTemplates[pickTemplates.length-1].userId === interaction.user.id && picksSoFar.length === 45){
      draft.status = 'open';
      draft.save();
    }
};
