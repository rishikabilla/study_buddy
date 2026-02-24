const knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: "./studybuddy.sqlite" 
    },
    useNullAsDefault: true
  });
  
  const initDB = async () => {
    if (!(await knex.schema.hasTable('courses'))) {
      await knex.schema.createTable('courses', (table) => {
        table.increments('id').primary();
        table.string('title').notNullable();
      });
    }
  
    if (!(await knex.schema.hasTable('notes'))) {
      await knex.schema.createTable('notes', (table) => {
        table.increments('id').primary();
        table.integer('course_id').references('id').inTable('courses').onDelete('CASCADE');
        table.string('title').notNullable();
        table.text('content');
        table.text('summary'); 
      });
    }
    console.log("✅ Database & Tables Ready!");
  };
  
  initDB();
  module.exports = knex;