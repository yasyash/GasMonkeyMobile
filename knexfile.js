// Update with your config settings.

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      database: 'weather',
      user:     'weather',
      password: '31415'
    
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'weather',
      user:     'weather',
      password: '31415'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'weather',
      user:     'weather',
      password: '31415'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
