require('dotenv').config();
const { sequelize } = require('./src/models');

async function migrate() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        
        console.log('Adding portfolio_links column to CodingProfiles...');
        await sequelize.query('ALTER TABLE "CodingProfiles" ADD COLUMN IF NOT EXISTS "portfolio_links" JSONB DEFAULT \'[]\'::jsonb;');
        
        console.log('Successfully updated CodingProfiles.');
        process.exit(0);
    } catch (error) {
        console.error('Error running migration:', error);
        process.exit(1);
    }
}

migrate();
