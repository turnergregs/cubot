module.exports = (sequelize, DataTypes) => {
	return sequelize.define('records', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
	        primaryKey: true
		},
		draft_id: DataTypes.INTEGER,
		user_id: DataTypes.STRING,
		wins: DataTypes.INTEGER,
		losses: DataTypes.INTEGER,
		draws: DataTypes.INTEGER,
		img: DataTypes.TEXT,
		timestamps: true
	});
};