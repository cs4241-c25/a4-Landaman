import { MongoClient } from "mongodb";

export const DB = "snakeApp";
export const HighScoreCollection = "highScores";

const client = new MongoClient(process.env.MONGODB_URI ?? "");

export interface HighScoreEntry {
  id: string;
  username: string;
  score: number;
  time: number;
  gameDescription: string;
  ageGroup: string;
  gameDate: Date;
  favoriteColor: string;
  scorePerMinute: number | null;
}

export default client;
