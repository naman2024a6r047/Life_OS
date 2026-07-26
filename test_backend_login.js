require('dotenv').config();
const { sequelize } = require('./src/models');
const User = require('./src/models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function test() {
    try {
        await sequelize.authenticate();
        // find user aabe55fe-921a-4c61-a319-375b9905ce1b
        const user = await User.findByPk('aabe55fe-921a-4c61-a319-375b9905ce1b');
        if (!user) return console.log('User not found');
        
        // generate token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // hit the endpoint
        const res = await axios.put('http://localhost:5000/api/dev/profile', {
            developer_info: { test: 'API Call Worked' },
            portfolio_links: []
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Status:', res.status);
        console.log('Response:', res.data.developer_info);
        
        process.exit(0);
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
        process.exit(1);
    }
}
test();
