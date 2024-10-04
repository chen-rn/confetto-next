# Confetto - AI-Powered MMI Interview Prep

## Product Requirements Document (PRD)

### Table of Contents

1. [Introduction](#1-introduction)
2. [Objectives and Goals](#2-objectives-and-goals)
3. [Target Audience](#3-target-audience)
4. [Product Overview](#4-product-overview)
   4.1 [Features](#41-features)
   4.2 [User Stories](#42-user-stories)
5. [Technical Requirements](#5-technical-requirements)
   5.1 [Architecture](#51-architecture)
   5.2 [Database Schema](#52-database-schema)
   5.3 [Data Flow](#53-data-flow)
6. [Pages and User Interface](#6-pages-and-user-interface)
   6.1 [Page Descriptions](#61-page-descriptions)
   6.2 [Wireframes (Optional)](#62-wireframes-optional)

### 1. Introduction

The AI-Powered MMI Interview Prep App is designed to assist medical school applicants in preparing for Multiple Mini Interviews (MMIs) by simulating realistic interview scenarios using artificial intelligence. The app provides an interactive platform where users can practice responding to MMI questions, receive comprehensive scoring, and obtain detailed feedback to improve their performance.

### 2. Objectives and Goals

**Primary Objective:** To create an accessible and effective tool that enhances the MMI preparation process for medical school applicants.

**Goals:**

- Simulate realistic MMI interview scenarios using AI.
- Provide personalized scoring and feedback based on user responses.
- Track user progress over time to highlight improvements.
- Ensure a user-friendly interface that is intuitive and engaging.

### 3. Target Audience

- **Primary Users:** Individuals preparing for medical school admissions who will undergo MMI interviews.
- **Secondary Users:** Pre-med advisors, educational institutions offering preparatory courses, and coaching professionals.

### 4. Product Overview

#### 4.1 Features

1. **AI-Simulated MMI Questions:**

   - Randomized selection from a vast question bank.
   - Covers various categories like ethical dilemmas, situational judgments, and policy discussions.

2. **Recording and Interactive Response:**

   - Users record their responses (up to 5 minutes).
   - Optional AI-driven back-and-forth interaction simulating an interviewer.

3. **Scoring System:**

   - Comprehensive scoring out of 100.
   - Breakdown into key categories:
     - Communication Skills
     - Critical Thinking
     - Ethical Reasoning
     - Professionalism

4. **Detailed Feedback:**

   - Highlights strengths and areas for improvement.
   - Provides actionable advice for enhancement.

5. **Progress Tracking:**

   - History of past sessions.
   - Visual representation of performance over time.

6. **User Authentication and Profile Management:**

   - Secure sign-up and login via Clerk.js.
   - Personalized dashboard and settings.

#### 4.2 User Stories

1. As a user, I want to practice MMI questions so that I can prepare for my medical school interviews.
2. As a user, I want to receive detailed feedback on my responses so that I know where to improve.
3. As a user, I want to track my progress over time so that I can see how I am improving.
4. As a user, I want a user-friendly interface so that I can focus on my preparation without technical difficulties.

### 5. Technical Requirements

#### 5.1 Architecture

- **Frontend:** Next.js with the App Router and server components.
- **UI Framework:** React with Shadcn UI, Radix UI, and Tailwind CSS for styling.
- **Authentication:** Clerk.js for user authentication and session management.
- **Backend:** Prisma ORM connected to a PostgreSQL database.
- **AI Services:**
  - **Speech-to-Text:** Transcribe user recordings using a service like Google Cloud Speech-to-Text API.
  - **Natural Language Processing (NLP):** Analyze transcripts, score responses, and generate feedback using OpenAI's GPT-4 API.
- **Storage:**
  - **Cloud Storage:** Firebase Storage for storing audio recordings.
- **State Management:**
  - Utilize React's built-in state and context APIs, minimize use of client-side state where possible.
- **Performance Optimization:**
  - Implement server-side rendering (SSR) and static site generation (SSG) where appropriate.
  - Optimize images and assets for web performance.

#### 5.2 Database Schema

The database schema is defined using Prisma ORM and includes the following models:

- **User**

  ```prisma
  model User {
    id               Int               @id @default(autoincrement())
    name             String
    email            String            @unique
    practiceSessions PracticeSession[]
    createdAt        DateTime          @default(now())
    updatedAt        DateTime          @updatedAt
  }
  ```

- **Question**

  ```prisma
  model Question {
    id               Int               @id @default(autoincrement())
    content          String
    category         String
    practiceSessions PracticeSession[]
    createdAt        DateTime          @default(now())
    updatedAt        DateTime          @updatedAt
  }
  ```

- **PracticeSession**

  ```prisma
  model PracticeSession {
    id                Int             @id @default(autoincrement())
    user              User            @relation(fields: [userId], references: [id])
    userId            Int
    question          Question        @relation(fields: [questionId], references: [id])
    questionId        Int
    startTime         DateTime
    endTime           DateTime?
    recordingUrl      String?
    transcript        String?
    score             Score?
    feedback          Feedback?
    createdAt         DateTime        @default(now())
    updatedAt         DateTime        @updatedAt
  }
  ```

- **Score**

  ```prisma
  model Score {
    id                Int             @id @default(autoincrement())
    practiceSession   PracticeSession @relation(fields: [practiceSessionId], references: [id])
    practiceSessionId Int             @unique
    totalScore        Float
    categoryScores    Json
    createdAt         DateTime        @default(now())
    updatedAt         DateTime        @updatedAt
  }
  ```

- **Feedback**

  ```prisma
  model Feedback {
    id                Int             @id @default(autoincrement())
    practiceSession   PracticeSession @relation(fields: [practiceSessionId], references: [id])
    practiceSessionId Int             @unique
    content           String
    createdAt         DateTime        @default(now())
    updatedAt         DateTime        @updatedAt
  }
  ```

#### 5.3 Data Flow

1. **User Authentication:**

   - User signs up or logs in via Clerk.js.
   - Authentication tokens are securely managed.

2. **Session Initiation:**

   - User navigates to start a new practice session.
   - A random question is fetched from the PostgreSQL database using Prisma.

3. **Recording Response:**

   - User records their response using the Web Audio API.
   - Audio file is uploaded to Firebase Storage.

4. **Transcription:**

   - The audio URL is sent to the Speech-to-Text service.
   - Transcribed text is saved to the database.

5. **NLP Analysis:**

   - Transcribed text is sent to the NLP service (e.g., GPT-4).
   - Service returns a scoring object and feedback.
   - Score and feedback are saved in the database associated with the practice session.

6. **Displaying Results:**

   - User is redirected to the results page.
   - Scores and feedback are fetched from the database and displayed.

7. **Progress Tracking:**
   - User's practice sessions are aggregated to show progress over time.
   - Data visualization components display the user's improvement.

### 6. Pages and User Interface

#### 6.1 Page Descriptions

1. **Home Page:**

   - **URL:** `/`
   - **Description:** Introduces the app with a compelling hero section, feature highlights, and testimonials. Contains call-to-action buttons for sign-up and login.

2. **Sign-Up / Login Page:**

   - **URL:** `/sign-in`
   - **Description:** Utilizes Clerk.js components for user authentication. Provides options for email/password and social logins.

3. **Dashboard:**

   - **URL:** `/dashboard`
   - **Description:** Displays user statistics, recent practice sessions, and a button to start a new session. Shows progress charts using dynamic data.

4. **Practice Session Page:**

   - **URL:** `/session`
   - **Description:** Presents the MMI question and a recorder interface. Includes a timer and guidelines. Users can start, pause, and stop recording.

5. **Results Page:**

   - **URL:** `/session/results`
   - **Description:** Shows the user's score with a breakdown by category. Displays detailed AI-generated feedback and the transcribed response.

6. **Profile Settings Page:**

   - **URL:** `/profile`
   - **Description:** Allows users to update personal information, change passwords, and set preferences.

7. **History Page:**

   - **URL:** `/history`
   - **Description:** Lists all past practice sessions with dates and scores. Users can click on a session to view detailed results.

8. **Error Page:**

   - **URL:** `/error`
   - **Description:** Generic error handling page that informs the user of any issues and provides navigation options.

#### 6.2 Wireframes (Optional)

While wireframes are optional at this stage, they can be created using tools like Figma or Sketch to provide visual guidance for the UI/UX design.

**Note:** Ensure that all pages are responsive and adhere to accessibility standards. Use Tailwind CSS for consistent styling and Radix UI components for interactive elements like modals and dropdowns.
