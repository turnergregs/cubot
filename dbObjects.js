const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Drafts = require('./models/Drafts.js')(sequelize, Sequelize.DataTypes);
const Records = require('./models/Records.js')(sequelize, Sequelize.DataTypes);
const Picks = require('./models/Picks.js')(sequelize, Sequelize.DataTypes);


Records.belongsTo(Drafts, { foreignKey: 'draftId', as: 'draft' });
Drafts.hasMany(Records, { foreignKey: 'draftId', as: 'records'});

Picks.belongsTo(Drafts, { foreignKey: 'draftId', as: 'draft' });
Drafts.hasMany(Picks, { foreignKey: 'draftId', as: 'picks'});

module.exports = { Drafts, Records, Picks };
