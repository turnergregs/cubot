module.exports = (sequelize, DataTypes) => {
	return sequelize.define('drafts', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
	        primaryKey: true
		},
		cube_id: DataTypes.STRING,
		status: DataTypes.STRING,
		date: DataTypes.DATE,
	});
};