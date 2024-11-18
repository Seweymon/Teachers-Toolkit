const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const config = require('./config');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html as the default page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'front end.html'));
});

// MongoDB Connection
const client = new MongoClient(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db(config.dbName); // Use database name from config
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

connectToDatabase();

// User Authentication Routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const usersCollection = db.collection('users');
        await usersCollection.insertOne({ username, password });
        res.send('User registered');
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Error registering user');
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ username, password });
        if (user) {
            res.send('User logged in');
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        console.error('Error logging in user:', err);
        res.status(500).send('Error logging in user');
    }
});

app.post('/api/logout', (req, res) => {
    res.send('User logged out');
});

app.get('/api/profile', async (req, res) => {
    try {
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ username: 'exampleUser' }); // Adjust retrieval logic
        res.send(user);
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).send('Error fetching user profile');
    }
});

// Lesson Plan Routes
app.post('/api/lesson-plans', async (req, res) => {
    try {
        const lessonPlan = req.body;
        const lessonPlansCollection = db.collection('lessonPlans');
        await lessonPlansCollection.insertOne(lessonPlan);
        res.send('Lesson plan created');
    } catch (err) {
        console.error('Error creating lesson plan:', err);
        res.status(500).send('Error creating lesson plan');
    }
});

app.get('/api/lesson-plans', async (req, res) => {
    try {
        const lessonPlansCollection = db.collection('lessonPlans');
        const lessonPlans = await lessonPlansCollection.find().toArray();
        res.send(lessonPlans);
    } catch (err) {
        console.error('Error fetching lesson plans:', err);
        res.status(500).send('Error fetching lesson plans');
    }
});

app.get('/api/lesson-plans/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const lessonPlansCollection = db.collection('lessonPlans');
        const lessonPlan = await lessonPlansCollection.findOne({ _id: new ObjectId(id) });
        res.send(lessonPlan);
    } catch (err) {
        console.error('Error fetching lesson plan:', err);
        res.status(500).send('Error fetching lesson plan');
    }
});

app.put('/api/lesson-plans/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        const lessonPlansCollection = db.collection('lessonPlans');
        await lessonPlansCollection.updateOne({ _id: new ObjectId(id) }, { $set: update });
        res.send('Lesson plan updated');
    } catch (err) {
        console.error('Error updating lesson plan:', err);
        res.status(500).send('Error updating lesson plan');
    }
});

app.delete('/api/lesson-plans/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const lessonPlansCollection = db.collection('lessonPlans');
        await lessonPlansCollection.deleteOne({ _id: new ObjectId(id) });
        res.send('Lesson plan deleted');
    } catch (err) {
        console.error('Error deleting lesson plan:', err);
        res.status(500).send('Error deleting lesson plan');
    }
});

// Analytics Routes
app.get('/api/analytics', (req, res) => {
    res.send('Analytics data');
});

app.get('/api/analytics/:id', (req, res) => {
    res.send(`Analytics data for lesson plan with ID ${req.params.id}`);
});

// Contact Form Routes
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const contactsCollection = db.collection('contacts');
        await contactsCollection.insertOne({ name, email, message });
        res.send('Contact form submitted');
    } catch (err) {
        console.error('Error submitting contact form:', err);
        res.status(500).send('Error submitting contact form');
    }
});

// Resource Routes
app.get('/api/resources', async (req, res) => {
    try {
        const resourcesCollection = db.collection('resources');
        const resources = await resourcesCollection.find().toArray();
        res.send(resources);
    } catch (err) {
        console.error('Error fetching resources:', err);
        res.status(500).send('Error fetching resources');
    }
});

app.get('/api/resources/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resourcesCollection = db.collection('resources');
        const resource = await resourcesCollection.findOne({ _id: new ObjectId(id) });
        res.send(resource);
    } catch (err) {
        console.error('Error fetching resource:', err);
        res.status(500).send('Error fetching resource');
    }
});

// Dashboard Routes
app.get('/api/dashboard', (req, res) => {
    res.send('Dashboard data');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
