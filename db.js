const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.NAME, 'postgres', process.env.PASS, {
	dialect: 'postgres',
	host: 'localhost'
});

sequelize
	.authenticate()
	.then(() => console.log('🥳 POSTGRES DATABASE IS NOW CONNECTED'))
	.catch(err => console.log(err));

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.USER = require('./models/user')(sequelize, Sequelize);
db.MESSAGE = require('./models/message')(sequelize, Sequelize);
db.CONVO = require('./models/convo')(sequelize, Sequelize);

db.USER.hasMany(db.MESSAGE);
db.USER.hasMany(db.CONVO);

db.MESSAGE.belongsTo(db.USER);
db.MESSAGE.belongsTo(db.CONVO);

db.CONVO.hasMany(db.MESSAGE);
db.CONVO.belongsTo(db.USER, { as: 'user1' });
db.CONVO.belongsTo(db.USER, { as: 'user2' });

module.exports = db;
