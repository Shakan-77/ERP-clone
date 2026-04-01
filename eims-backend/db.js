const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'eims-clone',
  password: 'Saravan@oct2',
  port: 5432,
});

module.exports = pool;