const mariadb = require('mariadb');

const core = mariadb.createPool({
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    connectionLimit: 10
});

module.exports = {
    getConnection: async () => {
        return await core.getConnection();
    }
}