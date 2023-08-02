// const axios = require('axios');
// const cheerio = require('cheerio');

// // Send an HTTP GET request to the URL
// axios
//     .get('https://tns4lpgmziiypnxxzel5ss5nyu0nftol.lambda-url.us-east-1.on.aws/challenge')
//     .then(response => {
//         const $ = cheerio.load(response.data);
//         const elementsWithRampClass = $('ul li div span');
//         const attributeValues = [];
//         elementsWithRampClass.each((_, element) => {
//             const elementValue = $(element).attr('value');
//             attributeValues.push(elementValue);
//         });
//         const combinedValues = attributeValues.join('');
//     })
//     .catch(error => {
//         console.log('Error:', error);
//     });
