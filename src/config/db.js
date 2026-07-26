const { Sequelize } = require('sequelize');

const dbUrl = process.env.CUSTOM_DATABASE_URL || process.env.DATABASE_URL;

const sequelize = dbUrl 
  ? new Sequelize(dbUrl, {
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 30,
            min: 0,
            acquire: 60000,
            idle: 10000
        },
        dialectOptions: {
            connectTimeout: 60000,
            ssl: {
                require: true,
                rejectUnauthorized: false
            },
            keepAlive: true
        }
    })
  : new Sequelize(
        process.env.DB_NAME || 'lifeos',
        process.env.DB_USER || 'postgres',
        process.env.DB_PASS || '',
        {
            host: process.env.DB_HOST || 'localhost',
            dialect: 'postgres',
            logging: false,
            pool: {
                max: 30,
                min: 0,
                acquire: 60000,
                idle: 10000
            }
        }
    );

module.exports = sequelize;
