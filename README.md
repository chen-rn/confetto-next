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

- **Frontend:** Next.js with the app directory and server actions.
- **Authentication:** Clerk.js for user authentication and session management.
- **Backend:** Prisma ORM connected to a PostgreSQL database.
- **AI Services:**
  - Speech-to-Text: For transcribing user recordings.
  - Natural Language Processing (NLP): For analyzing transcripts, scoring, and generating feedback.
- **Storage:**
  - Cloud storage (e.g., AWS S3) for storing audio recordings.

#### 5.2 Database Schema

The database schema is defined using Prisma ORM. Here's a detailed breakdown of the models:
