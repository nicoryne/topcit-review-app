import { NextResponse } from 'next/server';

// Define quiz categories with metadata
const quizCategories = [
  {
    id: '01',
    title: 'Software Development',
    description: 'Test your knowledge of software development principles, patterns, and practices.',
    totalQuestions: 40
  },
  {
    id: '02',
    title: 'Understanding & Using Data',
    description: 'Questions on databases, data processing, and analytics concepts.',
    totalQuestions: 40
  },
  {
    id: '03',
    title: 'Overview of System Architecture',
    description: 'Explore system design, architectural patterns, and infrastructure concepts.',
    totalQuestions: 40
  },
  {
    id: '04',
    title: 'Understanding Information Security',
    description: 'Test your knowledge of security principles, threats, and protection mechanisms.',
    totalQuestions: 40
  },
  {
    id: '05',
    title: 'Understanding the IT Business and Ethics',
    description: 'Questions on IT business concepts, ethical considerations, and professional practices.',
    totalQuestions: 40
  },
  {
    id: '06',
    title: 'Project Management and Technical Communication',
    description: 'Test your knowledge of project management methodologies and effective communication.',
    totalQuestions: 40
  }
];

export async function GET() {
  // Return the list of categories
  return NextResponse.json(quizCategories);
}
