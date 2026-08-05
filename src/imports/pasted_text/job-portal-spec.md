You are an expert Senior React Developer, UI/UX Designer, and Frontend Architect.

Build a production-quality responsive Job & College Placement Portal with a beautiful modern UI.

The application should feel like a combination of LinkedIn Jobs, Internshala, Notion, and Stripe.

Do NOT create a basic CRUD application.
Create a polished modern web application.

==================================
TECH STACK
==================================

Frontend
- React (Vite)
- Tailwind CSS
- shadcn/ui
- React Router
- React Hook Form
- Zod
- Lucide React Icons
- Framer Motion
- Sonner Toast
- html2pdf.js (PDF download)

Backend
- Supabase

Authentication
- Supabase Auth

Database
- Supabase PostgreSQL

Storage
- Supabase Storage

AI
- Gemini/OpenAI API integration placeholder

==================================
SUPABASE
==================================

Project URL

https://dzfpymaahnavhldjmsyw.supabase.co

Publishable Key

(sb_publishable key provided by user)

Create a reusable Supabase client.

Authentication should use Supabase Auth.

==================================
DESIGN SYSTEM
==================================

Theme

Modern
Minimal
Professional

Border Radius

18px

Shadows

Soft floating shadows

Spacing

Generous whitespace

Typography

Heading

Poppins

Body

Inter

Primary Color

#4F46E5

Secondary

#06B6D4

Success

#22C55E

Warning

#F59E0B

Error

#EF4444

Background

#F8FAFC

Card

White

Text

#111827

Muted

#6B7280

Animations

Framer Motion

Page transitions

Card hover lift

Button hover

Fade animations

Skeleton loading

==================================
APPLICATION FLOW
==================================

Landing Page

↓

Login/Register

↓

Choose Role

↓

Student Dashboard

OR

Recruiter Dashboard

==================================
ROLES
==================================

Student

Recruiter

==================================
LANDING PAGE
==================================

Beautiful Hero

Large Heading

Find Your Dream Job with AI Resume Builder

Subtitle

Create ATS Friendly Resume
Apply to jobs in one click

Buttons

Get Started

Browse Jobs

Illustration

Modern illustration

Floating cards

Gradient background

Feature Section

Cards

AI Resume Builder

Browse Jobs

Upload Resume

One Click Apply

Recruiter Hiring

Top Companies

Footer

Responsive

==================================
AUTHENTICATION
==================================

Supabase Login

Register

Forgot Password

Role Selection

Student

Recruiter

After Signup

Create Profile

==================================
NAVIGATION
==================================

Student

Dashboard

Jobs

Resume

Applications

Profile

Recruiter

Dashboard

Jobs

Applicants

Profile

Desktop

Sidebar

Mobile

Bottom Navigation

==================================
STUDENT DASHBOARD
==================================

Top Navbar

Search

Notifications

Profile

Greeting

Statistics

Applications

Resume Status

Saved Jobs

Quick Action Cards

AI Resume

Upload Resume

Browse Jobs

Applications

Recent Jobs

Beautiful Job Cards

==================================
JOB LIST
==================================

Search

Location Filter

Category Filter

Salary Filter

Job Card

Company Logo

Job Title

Location

Salary

Skills

View Details

Apply

Hover Effects

==================================
JOB DETAILS
==================================

Large Hero Card

Company

Title

Location

Salary

Description

Requirements

Benefits

Sticky Apply Button

If Resume Missing

Display

Upload Resume

OR

Generate AI Resume

==================================
UPLOAD RESUME
==================================

Drag and Drop Upload

Only PDF

Upload to Supabase Storage

After Upload

Preview File

Replace Resume

Delete Resume

==================================
AI RESUME BUILDER
==================================

This is the main feature.

Create a beautiful stepper.

Step 1

Personal Information

Name

Email

Phone

Address

LinkedIn

Github

Step 2

Education

College

Degree

Branch

CGPA

Year

Step 3

Skills

Technical Skills

Soft Skills

Languages

Frameworks

Databases

Step 4

Projects

Project Name

Description

Technologies

Multiple Projects

Step 5

Experience

Optional

Company

Role

Description

Duration

Step 6

Achievements

Certificates

Awards

Step 7

Preview

Display Resume

Generate Button

Generate Resume

Loading Animation

"AI is creating your ATS Friendly Resume"

Show animated progress.

AI Integration Placeholder

After AI returns resume

Display formatted Resume Preview

Buttons

Download PDF

Save Resume

Upload to Supabase Storage

Store URL in Database

==================================
APPLICATION FLOW
==================================

When Apply button clicked

Check

Does user have resume?

YES

Automatically attach resume

Save Application

Success Toast

NO

Open Modal

Choose

Upload Resume

OR

Generate AI Resume

After Resume Created

Return

Automatically Apply

==================================
APPLICATION PAGE
==================================

Beautiful cards

Company

Job

Applied Date

Status Badge

Applied

Reviewing

Interview

Accepted

Rejected

View Resume

==================================
PROFILE PAGE
==================================

Avatar

Editable Information

Resume Status

Upload Resume

Download Resume

Logout

==================================
RECRUITER DASHBOARD
==================================

Statistics

Jobs Posted

Applicants

Interviews

Cards

Post Job

Manage Jobs

Applicants

==================================
POST JOB
==================================

Title

Company

Location

Salary

Description

Skills

Requirements

Submit

Beautiful Form

==================================
MY JOBS
==================================

Card List

Edit

Delete

View Applicants

==================================
APPLICANTS PAGE
==================================

Table

Student

College

Resume

Status

Actions

View Resume

Download Resume

Accept

Reject

==================================
EMPTY STATES
==================================

No Jobs

Illustration

No Applications

Illustration

No Resume

Illustration

==================================
LOADING STATES
==================================

Skeleton Cards

Loading Dashboard

Loading Jobs

Loading Resume

==================================
NOTIFICATIONS
==================================

Use Sonner Toast

Login Success

Resume Uploaded

Resume Generated

Application Submitted

Job Posted

==================================
DATABASE TABLES
==================================

profiles

id

name

email

role

phone

college

avatar

jobs

id

title

company

location

salary

description

skills

recruiter_id

created_at

resumes

id

student_id

resume_type

uploaded

ai_generated

resume_url

created_at

applications

id

student_id

job_id

resume_id

status

created_at

==================================
SUPABASE STORAGE
==================================

Bucket

resumes

Store PDF

Return Public URL

==================================
RESPONSIVENESS
==================================

Desktop

Tablet

Mobile

Completely Responsive

==================================
ACCESSIBILITY
==================================

Keyboard Navigation

ARIA Labels

Focus States

==================================
CODE QUALITY
==================================

Use reusable components.

Create custom hooks.

Separate API logic.

Use loading and error states.

Create reusable cards.

Avoid duplicate code.

Follow best React practices.

==================================
FINAL GOAL
==================================

The application should look like a real startup product rather than a college CRUD project.

The UI should be modern, premium, elegant, highly animated, responsive, and polished.

Prioritize excellent user experience, beautiful cards, subtle animations, smooth page transitions, and professional layouts.