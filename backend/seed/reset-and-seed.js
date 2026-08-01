import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Assessment from '../models/Assessment.js';
import Response from '../models/Response.js';
import User from '../models/User.js';
import { getSampleAssessments } from './sample-assessments.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const resetAndSeed = async () => {
  try {
    await connectDB();

    console.log('Clearing old Assessments and Responses...');
    await Assessment.deleteMany();
    await Response.deleteMany();

    const adminUser = await User.findOne({ email: 'demo@assessflow.com' }); // Ensure you have a user with this email or just use the first user
    
    let adminUserId = adminUser?._id;
    if (!adminUserId) {
        const anyUser = await User.findOne();
        if (anyUser) adminUserId = anyUser._id;
    }

    if (!adminUserId) {
        console.error('No users found in database to assign as owner. Create a user first.');
        process.exit(1);
    }

    const sampleAssessments = getSampleAssessments(adminUserId);

    console.log('Seeding new Assessments...');
    const insertedAssessments = await Assessment.insertMany(sampleAssessments);

    console.log('Seeding dummy Responses...');
    // Create a dummy response for the first assessment
    const firstAssessment = insertedAssessments[0];
    const q1 = firstAssessment.categories[0].factors[0].questions[0]; // MCQ - '<nav>'
    const q2 = firstAssessment.categories[0].factors[1].questions[0]; // Text - 'background-color'
    const q3 = firstAssessment.categories[1].factors[0].questions[0]; // MCQ - 'let'

    const dummyResponse = new Response({
        assessmentId: firstAssessment._id,
        ownerId: adminUserId,
        respondentName: 'Jane Doe',
        status: 'submitted',
        answers: [
            { questionId: q1._id, value: '<nav>', isCorrect: true, pointsAwarded: 2 },
            { questionId: q2._id, value: 'background-color', isCorrect: true, pointsAwarded: 1 },
            { questionId: q3._id, value: 'var', isCorrect: false, pointsAwarded: 0 } // intentionally wrong
        ],
        earnedPoints: 3,
        totalPoints: 5,
        scorePercent: 60,
        starRating: 3
    });

    await dummyResponse.save();

    console.log('Database successfully reset and seeded!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

resetAndSeed();
