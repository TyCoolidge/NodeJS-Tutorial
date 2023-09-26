// const fs = require('fs').promises;
// import fs from 'fs';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const resHandler = async (req, res, next) => {
    try {
        const data = await fs.readFile('my-page.html', 'utf8');
        res.send(data);
    } catch (err) {
        console.log(err);
    }
    // res.sendFile(path.join(__dirname, 'my-page.html'));
};

// module.exports = resHandler;

// export default resHandler;
