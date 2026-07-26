require('dotenv').config();
const { sequelize } = require('./src/models');

async function migrate() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        
        console.log('Adding developer_info column to CodingProfiles...');
        await sequelize.query('ALTER TABLE "CodingProfiles" ADD COLUMN IF NOT EXISTS "developer_info" JSONB DEFAULT \'{}\'::jsonb;');
        
        console.log('Successfully updated CodingProfiles.');
        process.exit(0);
    } catch (error) {
        console.error('Error running migration:', error);
        process.exit(1);
    }
}

migrate();
