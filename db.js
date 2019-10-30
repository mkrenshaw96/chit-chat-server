const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.HEROKU_URI, {
	dialectOptions: {
		ssl: true
	}
});

sequelize
	.authenticate()
	.then(() => console.log('🥳🥳🥳 POSTGRES DATABASE IS NOW CONNECTED 🥳🥳🥳'))
	.catch(err => console.log(err));

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.USER = require('./models/user')(sequelize, Sequelize);
db.MESSAGE = require('./models/message')(sequelize, Sequelize);
db.CONVO = require('./models/convo')(sequelize, Sequelize);
db.MEMBER = require('./models/member')(sequelize, Sequelize);

db.USER.belongsToMany(db.CONVO, { through: 'member' });
db.CONVO.belongsToMany(db.USER, { through: 'member' });
db.USER.hasMany(db.MESSAGE);
db.MESSAGE.belongsTo(db.USER);
db.CONVO.hasMany(db.MESSAGE);
db.MESSAGE.belongsTo(db.CONVO);

module.exports = db;
