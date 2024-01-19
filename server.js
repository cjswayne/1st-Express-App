const express = require('express');
const path = require('path')
const fs = require('fs');
const PORT = 3333;

const app = express();

app.use(express.json());



async function getUserData(){
    const users = await fs.promises.readFile('./data.json', 'utf8');
    return JSON.parse(users);
}

async function saveUserData(usersArr) {
    await fs.promises.writeFile('./data.json', JSON.stringify(usersArr, null, 2))
}



// route to retrieve/get all users from json database

app.get('/api/users', async (req, res) => {
    // read data.json 
    // const users = await fs.promises.readFile('./data.json', 'utf8');

    const users = await getUserData();


    res.send(users);

})

// Route to add user to json db
app.post('/api/users', async (req, res) => {

    const users = await getUserData();


    if(!users.find(user => user.username === req.body.username) && req.body.username){
        users.push(req.body);

        await saveUserData(users);
        return res.send({message: 'User added successfully!'});
    }

    // await saveUserData(users);
    // console.log('data recieved');

    res.send({
        error:402,
        message: 'user already exists'
    })
    
})

// CRUD Creating, reading, u, deleting


app.listen(PORT, () => {
    console.log('Server started on port', PORT);
});