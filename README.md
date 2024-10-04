Product Requirements Document (PRD)
AI-Powered MMI Interview Prep App
Table of Contents
Introduction
Objectives and Goals
Target Audience
Product Overview
4.1 Features
4.2 User Stories
Technical Requirements
5.1 Architecture
5.2 Database Schema
5.3 Data Flow
Pages and User Interface
6.1 Page Descriptions
6.2 Wireframes (Optional)
Non-Functional Requirements
Assumptions and Dependencies
Risks and Mitigations
Success Metrics
Appendix

1. Introduction
   The AI-Powered MMI Interview Prep App is designed to assist medical school applicants in preparing for Multiple Mini Interviews (MMIs) by simulating realistic interview scenarios using artificial intelligence. The app provides an interactive platform where users can practice responding to MMI questions, receive comprehensive scoring, and obtain detailed feedback to improve their performance.

2. Objectives and Goals
   Primary Objective: To create an accessible and effective tool that enhances the MMI preparation process for medical school applicants.
   Goals:
   Simulate realistic MMI interview scenarios using AI.
   Provide personalized scoring and feedback based on user responses.
   Track user progress over time to highlight improvements.
   Ensure a user-friendly interface that is intuitive and engaging.
3. Target Audience
   Primary Users: Individuals preparing for medical school admissions who will undergo MMI interviews.
   Secondary Users: Pre-med advisors, educational institutions offering preparatory courses, and coaching professionals.
4. Product Overview
   4.1 Features
   AI-Simulated MMI Questions:

Randomized selection from a vast question bank.
Covers various categories like ethical dilemmas, situational judgments, and policy discussions.
Recording and Interactive Response:

Users record their responses (up to 5 minutes).
Optional AI-driven back-and-forth interaction simulating an interviewer.
Scoring System:

Comprehensive scoring out of 100.
Breakdown into key categories:
Communication Skills
Critical Thinking
Ethical Reasoning
Professionalism
Detailed Feedback:

Highlights strengths and areas for improvement.
Provides actionable advice for enhancement.
Progress Tracking:

History of past sessions.
Visual representation of performance over time.
User Authentication and Profile Management:

Secure sign-up and login via Clerk.js.
Personalized dashboard and settings.
4.2 User Stories
As a user, I want to practice MMI questions so that I can prepare for my medical school interviews.
As a user, I want to receive detailed feedback on my responses so that I know where to improve.
As a user, I want to track my progress over time so that I can see how I am improving.
As a user, I want a user-friendly interface so that I can focus on my preparation without technical difficulties. 5. Technical Requirements
5.1 Architecture
Frontend: Next.js with the app directory and server actions.
Authentication: Clerk.js for user authentication and session management.
Backend: Prisma ORM connected to a PostgreSQL database.
AI Services:
Speech-to-Text: For transcribing user recordings.
Natural Language Processing (NLP): For analyzing transcripts, scoring, and generating feedback.
Storage:
Cloud storage (e.g., AWS S3) for storing audio recordings.
5.2 Database Schema
Refer to the Prisma schema detailed below:

prisma
Copy code
generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

model User {
id String @id // Clerk user ID
practiceSessions PracticeSession[]
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model Question {
id Int @id @default(autoincrement())
content String
category String
practiceSessions PracticeSession[]
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model PracticeSession {
id Int @id @default(autoincrement())
user User @relation(fields: [userId], references: [id])
userId String // Clerk user ID
question Question @relation(fields: [questionId], references: [id])
questionId Int
startTime DateTime
endTime DateTime?
recordingUrl String?
transcript String?
score Score?
feedback Feedback?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model Score {
id Int @id @default(autoincrement())
practiceSession PracticeSession @relation(fields: [practiceSessionId], references: [id])
practiceSessionId Int @unique
totalScore Float
categoryScores Json
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model Feedback {
id Int @id @default(autoincrement())
practiceSession PracticeSession @relation(fields: [practiceSessionId], references: [id])
practiceSessionId Int @unique
content String
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}
5.3 Data Flow
User Authentication and Authorization:

Users sign up or log in using Clerk.js components.
Clerk.js manages user sessions and provides user IDs for database operations.
Practice Session Workflow:

Starting a Session:

User selects or is assigned a question.
A PracticeSession record is created with the user's Clerk ID and question ID.
Recording Response:

User records their response via a client-side component.
Audio file is uploaded to cloud storage.
recordingUrl is updated in the PracticeSession record.
AI Processing:

Audio is transcribed using speech-to-text services.
Transcript is analyzed using NLP services for scoring and feedback.
Score and Feedback records are created and linked to the PracticeSession.
Reviewing Results:

User accesses the feedback page to view scores and detailed feedback.
Users can replay their recording.
Progress Tracking:

Users can view their history of PracticeSession records.
Visual charts display performance trends over time. 6. Pages and User Interface
6.1 Page Descriptions
Authentication Pages:

Sign-Up (/sign-up):
Users create an account using Clerk.js components.
Sign-In (/sign-in):
Users log in to their account.
Dashboard (/dashboard):

Displays user's overall progress.
Recent practice sessions and quick stats.
Button to start a new practice session.
Practice Session Pages:

Question Selection (/practice):
Users select a specific question or choose a random one.
Instructions (/practice/[sessionId]/instructions):
Displays the selected question and any relevant instructions.
Recording (/practice/[sessionId]/record):
Users record their response.
Recording interface with time limit display.
Review and Feedback (/practice/[sessionId]/review):
Displays scores and detailed feedback.
Audio playback of user's response.
Progress Tracking (/progress):

History of all past practice sessions.
Visual charts showing performance over time.
Settings/Profile (/settings):

Update personal information.
Manage preferences.
6.2 Wireframes (Optional)
(Note: Wireframes can be added to provide visual guidance on the UI layout for each page.)
