import axios from 'axios';
import fs from 'fs';

const api = 'http://localhost:4000/api/v1';
const credentials = { email: 'iomarkamel@gmail.com', password: '@1Doubleespresso' };

const randomIP = () => Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');

async function runTests() {
  const results = {};

  console.log('Running Task 3 & 7...');
  const loginResTrue = await axios.post(`${api}/auth/login`, { ...credentials, rememberMe: true }, {
    headers: { 'X-Forwarded-For': randomIP() }
  });
  results.task3_login_cookie = loginResTrue.headers['set-cookie'];
  results.task9_login_body = loginResTrue.data;
  
  const cookieTrue = loginResTrue.headers['set-cookie'][0];
  const tokenTrue = cookieTrue.split(';')[0].split('=')[1];

  const refreshRes = await axios.post(`${api}/auth/refresh`, {}, {
    headers: { 
      Cookie: `refresh_token=${tokenTrue}`,
      'X-Forwarded-For': randomIP()
    }
  });
  results.task7_refresh_cookie = refreshRes.headers['set-cookie'];

  console.log('Running Task 4 & 8...');
  const loginResFalse = await axios.post(`${api}/auth/login`, { ...credentials, rememberMe: false }, {
    headers: { 'X-Forwarded-For': randomIP() }
  });
  results.task4_login_cookie = loginResFalse.headers['set-cookie'];

  const cookieFalse = loginResFalse.headers['set-cookie'][0];
  const tokenFalse = cookieFalse.split(';')[0].split('=')[1];

  const adversarialRes = await axios.post(`${api}/auth/refresh`, { rememberMe: true }, {
    headers: { 
      Cookie: `refresh_token=${tokenFalse}`,
      'X-Forwarded-For': randomIP()
    }
  });
  results.task8_adversarial_cookie = adversarialRes.headers['set-cookie'];
  
  console.log('Running Task 5...');
  const loginResOmitted = await axios.post(`${api}/auth/login`, credentials, {
    headers: { 'X-Forwarded-For': randomIP() }
  });
  results.task5_omitted_cookie = loginResOmitted.headers['set-cookie'];

  fs.writeFileSync('verification-results.json', JSON.stringify(results, null, 2));
  console.log('Results written to verification-results.json');
}

runTests().catch(err => {
  console.error('Error:', err.response?.data || err.message);
  fs.writeFileSync('verification-error.json', JSON.stringify(err.response?.data || err.message, null, 2));
});
