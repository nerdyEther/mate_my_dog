// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Load sensitive variables from environment
const PORT = process.env.PORT || 8000;
const uri = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json('Hello World');
});

app.post('/signup', async (req, res) => {
    const client = new MongoClient(uri);
    const { email, password } = req.body;
    const generatedUserId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await client.connect();
        const database = client.db('app-data');
        const users = database.collection('users');

        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.status(409).send('User already exists. Please login');
        }

        const sanitizedEmail = email.toLowerCase();

        const data = {
            user_id: generatedUserId,
            email: sanitizedEmail,
            hashed_password: hashedPassword
        };

        const insertedUser = await users.insertOne(data);

        const token = jwt.sign({ userId: generatedUserId }, jwtSecret, {
            expiresIn: '24h'
        });
        res.status(201).json({ token, userId: generatedUserId });

    } catch (err) {
        console.log(err);
        res.status(500).send('Error signing up');
    } finally {
        await client.close();
    }
});

app.post('/login', async (req, res) => {
    const client = new MongoClient(uri);
    const { email, password } = req.body;

    try {
        await client.connect();
        const database = client.db('app-data');
        const users = database.collection('users');

        const user = await users.findOne({ email });
        if (!user) {
            return res.status(400).send('Invalid Credentials');
        }

        const correctPassword = await bcrypt.compare(password, user.hashed_password);
        if (correctPassword) {
            const token = jwt.sign({ userId: user.user_id }, jwtSecret, {
                expiresIn: '24h'
            });
            return res.status(201).json({ token, userId: user.user_id });
        }

        res.status(400).json('Invalid Credentials');

    } catch (err) {
        console.log(err);
        res.status(500).send('Error logging in');
    } finally {
        await client.close();
    }
});

app.get('/messages', async (req, res) => {
    const { userId, correspondingUserId } = req.query;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db('app-data');
        const messages = database.collection('messages');

        const query = {
            from_userId: userId,
            to_userId: correspondingUserId
        };
        const foundMessages = await messages.find(query).toArray();
        res.send(foundMessages);
    } finally {
        await client.close();
    }
});

app.post('/message', async (req, res) => {
    const client = new MongoClient(uri);
    const message = req.body.message;

    try {
        await client.connect();
        const database = client.db('app-data');
        const messages = database.collection('messages');

        const insertedMessage = await messages.insertOne(message);
        res.send(insertedMessage);
    } finally {
        await client.close();
    }
});

app.get('/users', async (req, res) => {
    const client = new MongoClient(uri);
    const userIds = JSON.parse(req.query.userIds);

    try {
        await client.connect();
        const database = client.db('app-data');
        const users = database.collection('users');

        const pipeline = [
            {
                '$match': {
                    'user_id': {
                        '$in': userIds
                    }
                }
            }
        ];

        const foundUsers = await users.aggregate(pipeline).toArray();
        res.json(foundUsers);

    } finally {
        await client.close();
    }
});

app.put('/user', async (req, res) => {
    const client = new MongoClient(uri);
    const formData = req.body.formData;

    try {
        await client.connect();
        const database = client.db('app-data');
        const users = database.collection('users');

        const query = { user_id: formData.user_id };

        const updateDocument = {
            $set: {
                first_name: formData.first_name,
                breed: formData.breed,
                location: {
                    text: formData.location.text,
                    coordinates: {
                        lat: formData.location.coordinates.lat,
                        lon: formData.location.coordinates.lon
                    }
                },
                age: formData.age,
                url: formData.url,
                about: formData.about,
                matches: formData.matches
            },
        };

        const updatedUser = await users.updateOne(query, updateDocument);
        res.json(updatedUser);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating user");
    } finally {
        await client.close();
    }
});

app.get('/user', async (req, res) => {
    const client = new MongoClient(uri);
    const userId = req.query.userId;

    try {
        await client.connect();
        const database = client.db('app-data');
        const users = database.collection('users');

        const query = { user_id: userId };
        const user = await users.findOne(query);
        res.send(user);

    } finally {
        await client.close();
    }
});

app.put('/addmatch', async (req, res) => {
    const client = new MongoClient(uri);
    const { userId, matchedUserId } = req.body;

    try {
        await client.connect();
        const database = client.db('app-data');
        const users = database.collection('users');

        const query = { user_id: userId };
        const updateDocument = {
            $push: { matches: { user_id: matchedUserId } }
        };
        const user = await users.updateOne(query, updateDocument);
        res.send(user);
    } finally {
        await client.close();
    }
});

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

app.get('/getloc-users', async (req, res) => {
    const client = new MongoClient(uri);
    const userId = req.query.userId;

    try {
        await client.connect();
        const database = client.db('app-data');
        const usersCollection = database.collection('users');

        const allUsers = await usersCollection.find({}).toArray();

        const currentUser = allUsers.find(user => user.user_id === userId);
        if (!currentUser || !currentUser.location || !currentUser.location.coordinates) {
            return res.status(404).json({ error: 'User location not found' });
        }

        const { lat: userLat, lon: userLon } = currentUser.location.coordinates;

        const sortedUsers = allUsers
            .filter(user => user.user_id !== userId && user.location && user.location.coordinates)
            .map(user => {
                const { lat, lon } = user.location.coordinates;
                const distance = calculateDistance(userLat, userLon, lat, lon);
                return { ...user, distance };
            })
            .sort((a, b) => a.distance - b.distance);

        res.json(sortedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await client.close();
    }
});

app.listen(PORT, () => console.log('Server running on PORT ' + PORT));
