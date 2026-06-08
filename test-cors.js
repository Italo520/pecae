const https = require('https');

const data = JSON.stringify({
  name: 'Admin',
  email: 'admin@pecae.com.br',
  password: 'Admin@pecae123',
  type: 'BUYER',
  termsAccepted: true
});

const options = {
  hostname: 'api-pecae.italohub.cloud',
  port: 443,
  path: '/api/v1/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Origin': 'https://pecae.italohub.cloud'
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log('HEADERS:', res.headers);
  res.on('data', (d) => process.stdout.write(d));
});

req.on('error', (error) => console.error(error));
req.write(data);
req.end();
