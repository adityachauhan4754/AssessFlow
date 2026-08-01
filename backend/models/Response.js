import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  isCorrect: { type: Boolean },
  pointsAwarded: { type: Number, default: 0 }
});

const responseSchema = new mongoose.Schema({
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // Denormalized owner ID
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  respondentName: { type: String },
  answers: [answerSchema],
  status: { type: String, enum: ['draft', 'submitted'], default: 'submitted' },
  earnedPoints: { type: Number },
  totalPoints: { type: Number },
  scorePercent: { type: Number },
  starRating: { type: Number },
  submittedAt: { type: Date, default: Date.now }
});

const Response = mongoose.model('Response', responseSchema);
export default Response;
