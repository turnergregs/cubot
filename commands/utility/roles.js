const { SlashCommandBuilder, ComponentType, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roles')
		.setDescription('Get your roles!'),
	async execute(interaction) {

		const content = "Choose your roles!";

		const roleOptions = [
			new StringSelectMenuOptionBuilder()
				.setLabel('drafter')
				.setDescription('Get pinged when drafts are happening!')
				.setValue('drafter')
				.setEmoji('🟢'),
			new StringSelectMenuOptionBuilder()
				.setLabel('cube-owner')
				.setDescription('You have a cube for us to draft!')
				.setValue('cube-owner')
				.setEmoji('🟣'),
			new StringSelectMenuOptionBuilder()
				.setLabel('dev')
				.setDescription('You want to help out with CuBot development')
				.setValue('dev')
				.setEmoji('🟠')
		];

		const roleSelect = new StringSelectMenuBuilder()
			.setCustomId('roles')
			.addOptions(roleOptions)
			.setMinValues(1)
			.setMaxValues(roleOptions.length);

		const roleRow = new ActionRowBuilder()
			.addComponents(roleSelect);

		const rolePicker = await interaction.reply({
			content: content,
			components: [roleRow],
			ephemeral: true
		});

		const collector = rolePicker.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });

		collector.on('collect', async i => {
			let count = 0;
			if(i.values.length > 0){
				const roles = await interaction.guild.roles.fetch();
				const filteredRoles = roles.filter(role => i.values.includes(role.name));
				filteredRoles.forEach(r => {
					console.log(i.user);
					console.log(r);
					i.member.roles.add(r);
					count += 1;
				});
			}
			try {
				await i.reply({content: `Added ${count} role/s!`, ephemeral: true});
			} catch(error){
				console.log("Error sending roles message:");
				console.log(error);
			}
			
		});
	},
};
