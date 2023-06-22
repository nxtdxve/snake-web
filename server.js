import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// MongoDB connection string
const dbURI = process.env.URI;

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Connect to MongoDB
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => app.listen(3000, () => console.log('Server is running on port 3000')))
  .catch(err => console.log(err));

// Define Score schema
const scoreSchema = new mongoose.Schema({
  username: String,
  score: Number
});

// Create Score model
const Score = mongoose.model('Score', scoreSchema);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Define route for adding a new score
app.post('/score', (req, res) => {
  console.log(req.body); // Add this line to log the request body
  
  const score = new Score({
    username: req.body.username,
    score: req.body.score
  });

  score.save()
    .then(result => res.send(result))
    .catch(err => console.log(err));
});

// Define route for getting top 5 scores
app.get('/topScores', (req, res) => {
  Score.find().sort({ score: -1 }).limit(5)
    .then(result => res.send(result))
    .catch(err => console.log(err));
});

export default app;