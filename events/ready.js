const { Events } = require('discord.js');
const { Drafts, Records, Picks } = require('../dbObjects.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		Drafts.sync();
		Records.sync();
		Picks.sync();
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};