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

export default async function topScores(req, res) {
  if (mongoose.connections[0].readyState) {
    // Use current db connection
    return getTopScores(req, res);
  }
  // Use new db connection
  await mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  return getTopScores(req, res);
}

async function getTopScores(req, res) {
  try {
    const result = await Score.find().sort({ score: -1 }).limit(5);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
