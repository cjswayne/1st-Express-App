const express = require('express');
const path = require('path')
const fs = require('fs');
const bcrypt = require('bcrypt');
const PORT = 3333;

const cors = require('cors');

const app = express();

app.use(express.json());

// Input validation function
function validateUserInput(userData) {
    const errors = [];
    
    if (!userData.username || typeof userData.username !== 'string' || userData.username.trim().length < 3) {
        errors.push('Username must be at least 3 characters long');
    }
    
    if (!userData.email || typeof userData.email !== 'string') {
        errors.push('Valid email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            errors.push('Invalid email format');
        }
    }
    
    if (!userData.password || typeof userData.password !== 'string' || userData.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    
    return errors;
}

async function getUserData(){
    try {
        const users = await fs.promises.readFile('./data.json', 'utf8');
        return JSON.parse(users);
    } catch (error) {
        console.error('Error reading user data:', error);
        return [];
    }
}

async function saveUserData(usersArr) {
    try {
        await fs.promises.writeFile('./data.json', JSON.stringify(usersArr, null, 2));
    } catch (error) {
        console.error('Error saving user data:', error);
        throw new Error('Failed to save user data');
    }
}


app.use(express.static('./public'));
app.use(cors())

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, './public/index.html'))
// })

// app.get('/css/styles.css', (req, res) => {
//     res.sendFile(path.join(__dirname, './public/css/styles.css'));
// })

// route to retrieve/get all users from json database

app.get('/api/users', async (req, res) => {
    try {
        const users = await getUserData();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

// Route to add user to json db
app.post('/api/users', async (req, res) => {
    try {
        // Validate input
        const validationErrors = validateUserInput(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 400,
                message: 'Validation failed',
                details: validationErrors
            });
        }

        const users = await getUserData();

        // Check if user already exists
        if (users.find(user => user.username === req.body.username)) {
            return res.status(409).json({
                error: 409,
                message: 'User already exists'
            });
        }

        // Hash password before storing
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        // Create new user object with hashed password
        const newUser = {
            username: req.body.username.trim(),
            email: req.body.email.trim(),
            password: hashedPassword
        };

        users.push(newUser);
        await saveUserData(users);
        
        res.status(201).json({ message: 'User added successfully!' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

// CRUD Creating, reading, u, deleting


app.listen(PORT, () => {
    console.log('Server started on port', PORT);
});