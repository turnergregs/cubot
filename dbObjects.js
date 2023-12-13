const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Drafts = require('./models/Drafts.js')(sequelize, Sequelize.DataTypes);
const Records = require('./models/Records.js')(sequelize, Sequelize.DataTypes);

Records.belongsTo(Drafts, { foreignKey: 'draftId', as: 'draft' });
Drafts.hasMany(Records, { foreignKey: 'draftId', as: 'records'});

module.exports = { Drafts, Records };