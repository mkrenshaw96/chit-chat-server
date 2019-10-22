module.exports = (Sequelize, DataTypes) => {
	return Sequelize.define('convo', {
		id: {
			primaryKey: true,
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false
		}
	});
};
