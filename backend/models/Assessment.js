import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['MCQ', 'Rating', 'Text', 'Number'], required: true },
  options: [{ type: String }],
  isRequired: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  images: [{
    url: String,
    alt: String
  }],
  correctAnswer: { type: mongoose.Schema.Types.Mixed },
  points: { type: Number, default: 1 }
});

const factorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  questions: [questionSchema],
  order: { type: Number, default: 0 }
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  factors: [factorSchema],
  weight: { type: Number, default: 1 },
  order: { type: Number, default: 0 }
});

const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categories: [categorySchema],
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  passingThreshold: { type: Number, default: 50 }
}, { timestamps: true });

// Ensure unique title per user
assessmentSchema.index({ title: 1, createdBy: 1 }, { unique: true });

const Assessment = mongoose.model('Assessment', assessmentSchema);
export default Assessment;
