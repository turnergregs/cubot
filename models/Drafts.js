module.exports = (sequelize, DataTypes) => {
	return sequelize.define('drafts', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
	        primaryKey: true
		},
		cubeId: DataTypes.STRING,
		status: DataTypes.STRING,
		players: DataTypes.INTEGER,
		private: DataTypes.BOOLEAN,
		date: DataTypes.DATEONLY,
		timestamps: true
	});
};