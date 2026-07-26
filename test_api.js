const axios = require('axios');

async function test() {
    try {
        // 1. Login to get token
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'naman@test.com', // wait, I don't know the user's password. 
            password: 'password'
        });
    } catch (e) {
        console.error('Login failed, cannot test via API');
    }
}
test();
