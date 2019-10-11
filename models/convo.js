module.exports = (Sequelize, DataTypes) => {
	return Sequelize.define('convo', {
		id: {
			primaryKey: true,
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		creator: {
			type: DataTypes.STRING,
			allowNull: false
		}
	});
};
