module.exports = (sequelize, DataTypes) => {
	return sequelize.define('picks', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
	        primaryKey: true
		},
		draftId: DataTypes.INTEGER,
		userId: DataTypes.STRING,
		pick: DataTypes.STRING,
		active: DataTypes.BOOLEAN,
		date: DataTypes.DATEONLY
	});
};
