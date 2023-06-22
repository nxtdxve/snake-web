import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection string
const dbURI = process.env.URI;

// Define Score schema
const scoreSchema = new mongoose.Schema({
  username: String,
  score: Number
});

// Create Score model
const Score = mongoose.model('Score', scoreSchema);

export default async function score(req, res) {
  if (mongoose.connections[0].readyState) {
    // Use current db connection
    return postScore(req, res);
  }
  // Use new db connection
  await mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  return postScore(req, res);
}

async function postScore(req, res) {
  try {
    const { username, score } = req.body;
    const newScore = new Score({
      username,
      score
    });
    const result = await newScore.save();
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
