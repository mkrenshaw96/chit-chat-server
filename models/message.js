module.exports = (Sequelize, DataTypes) => {
	return Sequelize.define('message', {
		id: {
			primaryKey: true,
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false
		},
		text: {
			type: DataTypes.STRING,
			allowNull: false
		}
	});
};
