import asyncHandler from 'express-async-handler';
import Response from '../models/Response.js';
import Assessment from '../models/Assessment.js';
import mongoose from 'mongoose';

export const submitResponse = asyncHandler(async (req, res) => {
  const { assessmentId, respondentName, answers } = req.body;

  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) { res.status(404); throw new Error('Assessment not found'); }

  const finalRespondentName = req.user?.name || respondentName || 'Anonymous';

  if (req.user) {
    const existing = await Response.findOne({ assessmentId, userId: req.user._id, status: 'submitted' });
    if (existing) {
      res.status(409);
      throw new Error('You have already submitted this assessment.');
    }
  }

  const response = await Response.create({
    assessmentId,
    ownerId: assessment.createdBy, // Denormalized for fast fetching
    userId: req.user ? req.user._id : null,
    respondentName: finalRespondentName,
    answers
  });

  res.status(201).json(response);
});

export const getResponses = asyncHandler(async (req, res) => {
  // Query responses directly by ownerId (eliminates N+1 lookup)
  const responses = await Response.find({ ownerId: req.user._id })
    .populate('assessmentId', 'title')
    .sort('-submittedAt');

  res.json(responses);
});

export const getResponseById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400); throw new Error('Invalid response ID');
  }

  const response = await Response.findById(req.params.id).populate('assessmentId', 'title categories');
  if (!response) { res.status(404); throw new Error('Response not found'); }

  // Verify ownership via denormalized ownerId
  if (response.ownerId.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized to view this response');
  }

  // Build answer map for O(1) lookup
  const answerMap = {};
  response.answers.forEach(a => {
    answerMap[a.questionId.toString()] = {
      value: a.value,
      isCorrect: a.isCorrect,
      pointsAwarded: a.pointsAwarded
    };
  });

  // Construct structured data
  const structure = [];
  if (response.assessmentId && response.assessmentId.categories) {
    response.assessmentId.categories.forEach(cat => {
      const categoryNode = { category: cat.name, factors: [] };
      
      cat.factors.forEach(fac => {
        const factorNode = { factor: fac.name, questions: [] };
        
        fac.questions.forEach(q => {
          const ansData = answerMap[q._id.toString()];
          if (ansData !== undefined) {
            factorNode.questions.push({
              question: q.text,
              type: q.type.toLowerCase(), // 'mcq', 'rating', 'text', 'number'
              answer: ansData.value,
              isCorrect: ansData.isCorrect,
              pointsAwarded: ansData.pointsAwarded,
              possiblePoints: q.points || 1
            });
          }
        });

        if (factorNode.questions.length > 0) {
          categoryNode.factors.push(factorNode);
        }
      });

      if (categoryNode.factors.length > 0) {
        structure.push(categoryNode);
      }
    });
  }

  res.json({
    assessment: { title: response.assessmentId ? response.assessmentId.title : 'Unknown Assessment' },
    respondent: response.respondentName,
    submittedAt: response.submittedAt,
    earnedPoints: response.earnedPoints,
    totalPoints: response.totalPoints,
    scorePercent: response.scorePercent,
    starRating: response.starRating,
    structure
  });
});
