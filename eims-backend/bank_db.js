const { Pool } = require('pg');

const bankDB = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'bank-db',
    password: 'Saravan@oct2',
    port: 5432,
});

module.exports = bankDB;