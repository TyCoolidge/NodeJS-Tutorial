const fs = require('fs').promises;

const text = 'This is a test';

fs.writeFile('node-message.txt', text).then(() => {
    console.log('File wrote');
});
