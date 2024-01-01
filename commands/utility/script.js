const { SlashCommandBuilder } = require('discord.js');
const { Drafts, Records } = require('../../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('script')
		.setDescription('Run some db scripts')
		.addStringOption(option =>
			option.setName('script')
				.setDescription('Which script to run')
				.setRequired(true)
				.addChoices(
					{ name: 'Close Open', value: 'closeOpen' },
					{ name: 'Close All', value: 'closeAll' },
					{ name: 'Close One', value: 'closeOne' },
					{ name: 'Delete Open', value: 'deleteOpen' },
					{ name: 'Delete All', value: 'deleteAll' },
					{ name: 'Delete One', value: 'deleteOne' },
					{ name: 'List Open', value: 'listOpen' },
					{ name: 'List All', value: 'listAll' },
					{ name: 'List One', value: 'listOne' },
					{ name: 'List Records for Draft', value: 'listDraftRecords' },
				))
		.addIntegerOption(option =>
			option.setName('id')
					.setDescription('The ID of the draft or record')
					.setRequired(false)),
	async execute(interaction) {

		await interaction.reply(`starting script`);
		console.log(`starting scripts`);

		if(interaction.user.username !== 'grenrut'){
			await interaction.reply({content: `Nice try pal`, ephemeral: true});
			return;
		}

		const closeDrafts = async function(options){
			let count = 0;
			let drafts = await Drafts.findAll({where: options});
			for(draft of drafts){
				draft.status = 'closed';
				draft.save();
				count += 1;
			}
			return count;
		}

		const deleteDrafts = async function(options){
			let count = 0;
			let drafts = await Drafts.findAll({where: options});
			for(draft of drafts){
				draft.destroy();
				count += 1;
			}
			return count;
		}

		const getDrafts = async function(options){
			const drafts = await Drafts.findAll({where: options});
			for(const draft of drafts){
				draft.reported = await Records.count({where: {draftId: draft.id, wins: { [Op.ne]: null }}});
			}
			return drafts;
		}

		const getRecords = async function(options){
			const records = await Records.findAll({where: options});
			for(const record of records){
				const member = await interaction.guild.members.fetch(record.userId);
				record.username = member.user.username;
			}
			return records;
		}

		const script = interaction.options.getString('script');

		let content = "";
		let updated = 0;
		let results = {};
		const id = interaction.options.getInteger('id');
		switch(script){
			case "closeOpen":
				updated += await closeDrafts({status: 'open'});
				content = `Closed ${updated} open drafts`;
				break;
			case "closeAll":
				updated += await closeDrafts({});
				content = `Closed ${updated} drafts`;
				break;
			case "closeOne":
				if(!id){
					content = 'No draftId provided';
					break;
				}
				updated += await closeDrafts({id: id});
				content = `Closed ${updated} drafts`;
				break;
			case "deleteOpen":
				updated += await deleteDrafts({status: 'open'});
				content = `Deleted ${updated} open drafts`;
				break;
			case "deleteAll":
				updated += await deleteDrafts({});
				content = `Deleted ${updated} drafts`;
				break;
			case "deleteOne":
				if(!id){
					content = 'No draftId provided';
					break;
				}
				updated += await deleteDrafts({id: id});
				content = `Deleted ${updated} drafts`;
				break;
			case "listOpen":
				results = await getDrafts({status: 'open'});
				results.forEach(d => {
					content += `${d.cubeId}(${d.id}) ${d.status} - ${d.reported}/${d.players} reported, ${d.date}\n`;
				})
				break;
			case "listAll":
				results = await getDrafts({});
				results.forEach(d => {
					content += `${d.cubeId}(${d.id}) ${d.status} - ${d.reported}/${d.players} reported, ${d.date}\n`;
				})
				break;
			case "listOne":
				if(!id){
					content = 'No draftId provided';
					break;
				}
				results = await getDrafts({id: id});
				if(results.length === 0){
					content = 'No drafts found for that Id';
					break;
				}
				results.forEach(d => {
					content += `${d.cubeId}(${d.id}) ${d.status} - ${d.reported}/${d.players} reported, ${d.date}\n`;
				})
				break;
			case "listDraftRecords":
				if(!id){
					content = 'No draftId provided';
					break;
				}
				results = await getRecords({draftId: id});
				if(results.length === 0){
					content = 'No records found for that draftId';
					break;
				}
				results.forEach(r => {
					if(r.wins){
						const draws = r.draws ? r.draws : 0;
						content += `${r.username}: ${r.wins}-${r.losses}-${draws}\n`;
					} else{
						content += `${r.username}: not reported\n`;
					}
				})
				break;
			default: 
				content = "invalid script";
				break;
		}

		const extraContent = [];
		if(content.length <= 2000){
			await interaction.followUp(content);
		} else {
			const lines = content.split('\n');
			let newContent = ``;
			while(lines.length > 0){
				const line = lines.shift();
				if(newContent.length > 1500){
					extraContent.push(newContent);
					newContent = ``;
				}
				newContent += line + `\n`;
			}
			extraContent.push(newContent);
			for(const message of extraContent){
				await interaction.followUp(message);
			}
		}


		
	},
};

