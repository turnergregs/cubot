const { SlashCommandBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('report')
		.setDescription('Report your draft results!'),
	async execute(interaction) {

		const findCubeThread = async function(cube_id){
			const cubeListsChannel = interaction.guild.channels.cache.find(channel => channel.name === 'austin-cube-lists');
			const activeThreads = await cubeListsChannel.threads.fetchActive();
			for(thread of activeThreads.threads){
				// no idea why they make you do thread[1]
				const messages = await thread[1].messages.fetch();
				console.log(messages);
				for(message of messages){
					//why are these all empty strings??
					console.log(message.content);
				}
			}
		}

		await findCubeThread('tempocube');
	},
};