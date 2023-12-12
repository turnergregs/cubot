const { SlashCommandBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('report')
		.setDescription('Report your draft results!'),
	async execute(interaction) {

		const findCubeThread = async function(cube_id){
			let cubeListsChannel = interaction.guild.channels.cache.find(channel => channel.name === 'austin-cube-lists');
			// console.log(cubeListsChannel.threads.cache);
			const activeThreads = await cubeListsChannel.threads.fetchActive();
			// console.log(activeThreads.threads);
			for(thread of activeThreads.threads){
				console.log(thread);
			}
			cubeListsChannel.threads.cache.fetchActiveThreads()
				.then(fetched => console.log(`There are ${fetched.threads.size} threads.`))
			//return thread;
		}

		await findCubeThread('tempocube');
	},
};