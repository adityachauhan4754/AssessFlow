import mongoose from 'mongoose';

export const getSampleAssessments = (userId) => [
  {
    title: 'Frontend Fundamentals',
    description: 'A test to assess core web development concepts.',
    status: 'published',
    createdBy: userId,
    passingThreshold: 70,
    categories: [
      {
        name: 'HTML & CSS',
        factors: [
          {
            name: 'Semantics',
            questions: [
              {
                type: 'MCQ',
                text: 'Which HTML tag is used for the main navigation block?',
                options: ['<nav>', '<main>', '<header>', '<section>'],
                correctAnswer: '<nav>',
                points: 2,
                isRequired: true
              }
            ]
          },
          {
            name: 'Styling',
            questions: [
              {
                type: 'Text',
                text: 'What property in CSS is used to change the background color?',
                correctAnswer: 'background-color',
                points: 1,
                isRequired: true
              }
            ]
          }
        ]
      },
      {
        name: 'JavaScript',
        factors: [
          {
            name: 'Core Concepts',
            questions: [
              {
                type: 'MCQ',
                text: 'Which keyword is used to declare a block-scoped variable?',
                options: ['var', 'let', 'function', 'import'],
                correctAnswer: 'let',
                points: 2,
                isRequired: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    title: 'Employee Satisfaction Survey 2026',
    description: 'Anonymous survey for Q3 2026',
    status: 'published',
    createdBy: userId,
    passingThreshold: 0,
    categories: [
      {
        name: 'Workplace',
        factors: [
          {
            name: 'Environment',
            questions: [
              {
                type: 'Rating',
                text: 'How would you rate the current remote work policy?',
                points: 0,
                isRequired: true
              },
              {
                type: 'Text',
                text: 'Any additional comments about the office environment?',
                points: 0,
                isRequired: false
              }
            ]
          }
        ]
      }
    ]
  }
];
