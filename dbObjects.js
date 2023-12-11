const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Drafts = require('./models/Drafts.js')(sequelize, Sequelize.DataTypes);
const Records = require('./models/Records.js')(sequelize, Sequelize.DataTypes);

Records.belongsTo(Drafts, { foreignKey: 'draft_id', as: 'draft' });

// Reflect.defineProperty(Users.prototype, 'addItem', {
// 	value: async item => {
// 		const userItem = await UserItems.findOne({
// 			where: { user_id: this.user_id, item_id: item.id },
// 		});

// 		if (userItem) {
// 			userItem.amount += 1;
// 			return userItem.save();
// 		}

// 		return UserItems.create({ user_id: this.user_id, item_id: item.id, amount: 1 });
// 	},
// });

// Reflect.defineProperty(Users.prototype, 'getItems', {
// 	value: () => {
// 		return UserItems.findAll({
// 			where: { user_id: this.user_id },
// 			include: ['item'],
// 		});
// 	},
// });

module.exports = { Drafts, Records };