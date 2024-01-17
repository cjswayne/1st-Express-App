const express = require('express');
const app = express();

const PORT = 3333;


// GET Route -- listen for localhost:3333/test

app.get('/test', (requestObj, responseObj) => {
    responseObj.send('<h1>Hi from the server</h1>');
})

app.get('/', (req, res) => {
    console.log(req);
    res.send('U r in root')
})

app.get('/api/recipe', (req, res) => {
    res.send({
        name:'cheese',
        ingredients:['cheese', 'time']
    })
})

app.listen(PORT, () => {
    console.log('Server started on port', PORT);
});