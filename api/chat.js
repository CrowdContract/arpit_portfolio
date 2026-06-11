// api/chat.js — Vercel Serverless Function (also works on Render via Express)
const Groq = require("groq-sdk");

const RESUME_CONTEXT = `
You are Arpit Kumar's AI assistant on his personal portfolio website. Answer questions about Arpit naturally and helpfully, as if you know him personally. Keep answers concise (2-4 sentences unless a detailed answer is needed).

=== ARPIT KUMAR — FULL RESUME CONTEXT ===

PERSONAL INFO:
- Name: Arpit Kumar | Roll No: 23111
- B.Tech CSE, Indian Institute of Information Technology (IIIT) Una, 2023–2027, CGPA: 7.52
- Email: arpit0112ak@gmail.com | Phone: +91 9199473527
- Location: Tatanagar, Jharkhand
- GitHub: https://github.com/CrowdContract
- LinkedIn: https://www.linkedin.com/in/arpit-kumar-18a079370/

EDUCATION:
- B.Tech CSE — IIIT Una (2023–2027) | CGPA: 7.52
- Senior Secondary — CBSE Board (2022) | 86.6%
- Secondary — ICSE Board (2020) | 92.8%

EXPERIENCE:
- Full-Stack Developer Intern @ ModelSuite.ai (Feb 2026 – Apr 2026, Remote)
  • Built GitHub integration — webhook receiver for push events, CI/CD failure detection, auto-closes PRs with comments, real-time bell pushing PR opened/closed/merged events via Socket.IO
  • Built full-stack features on a live multi-tenant SaaS platform (React, Node.js, Express, MongoDB) — timezone-aware activity reporting, inline admin approve/reject workflows, company-scoped global settings
  • Fixed a production MongoDB aggregation crash; resolved 12,000+ ESLint errors across the codebase
  • Integrated Cursor and Claude Code into daily dev workflow; resolved critical senior-flagged PR issues

PROJECTS:
1. NextGen EduTrack (Jan 2025 – Dec 2025)
   - AI-Powered Project Collaboration Platform | MERN, React, Tailwind, JWT, Groq (LLaMA 3.3), Multer
   - Full-stack platform for students, teachers, admins with role-based dashboards, real-time notifications, project lifecycle tracking
   - Integrated AI features using Groq (LLaMA 3.3): project summarization, code generation/explanation, chatbot, automated grading
   - JWT + HTTP-only cookies + RBAC + scalable REST APIs using Node.js, Express, MongoDB
   - Responsive UI with React, Redux Toolkit, Tailwind CSS, Framer Motion, file uploads via Multer
   - GitHub: https://github.com/CrowdContract/NextGen-EduTrack

2. SmartDocAI (Jul 2024 – Oct 2024)
   - Freelance AI Assistant | Streamlit, Whisper, Python, EasyOCR, LLM APIs
   - AI-powered assistant to extract text from images/audio, generate concise summaries, convert content to speech
   - Integrated OCR (EasyOCR), Speech-to-Text (Whisper), LLM-based summarization
   - Designed for individuals with Specific Learning Disabilities (SLDs)
   - GitHub: https://github.com/CrowdContract/SmartDocAI

3. VideoMindAI — AI video summarization and analysis tool
   GitHub: https://github.com/CrowdContract/VideoMindAI

4. CivicReport — Civic issue reporting platform
   GitHub: https://github.com/CrowdContract/CivicReport

5. Planto — Plant care assistant app
   GitHub: https://github.com/CrowdContract/planto

6. Fullstack E-Commerce MERN App
   GitHub: https://github.com/CrowdContract/fullstack-ecommerce-mern

TECHNICAL SKILLS:
- Languages: JavaScript, Java, C++, HTML, Python
- Frontend: React.js, Next.js, Tailwind CSS, Vite, Framer Motion
- Backend: Node.js, Express.js, REST APIs, Postman
- Databases: MongoDB, MySQL
- Cloud & DevOps: Render, Vercel, Git, GitHub, System Design Fundamentals
- AI/ML: LLM APIs (Groq, Gemini, OpenAI), EasyOCR, Whisper

KEY COURSES: Data Structures & Algorithms, Compiler Design, DBMS, Advanced CN, Operating System, OOP, Web Development, Software Engineering Principles

POSITIONS OF RESPONSIBILITY:
- Volunteer, Career Development Cell (CDC), IIIT Una (Aug 2024 – Jan 2026) — Coordinated HR and recruiter outreach during internship drives
- Member, Force Coding Club, IIIT Una (Sep 2023 – Aug 2025)

ACHIEVEMENTS:
- Solved 250+ Competitive Programming Problems across major coding platforms (Codelio Profile)
- Completed MERN Stack Course, Udemy | Node.js, Express, MongoDB Bootcamp (Jonas Schmedtmann)
- Top 5/250+ teams at Inter-College Hackathon
- Top 3 rank at Unstop BuildFolio Hackathon

PERSONALITY / SOFT SKILLS:
- Arpit is a proactive, curious developer who enjoys building real-world solutions
- Known for working well under pressure (24-hour hackathons, same-day PR fixes)
- Passionate about AI/LLM integrations in practical applications
- Available for freelance work and open to full-time opportunities after graduation (2027)

FAQ QUICK ANSWERS:
- "Are you available for freelance?" → Yes, Arpit is currently available for freelance work.
- "What stack does Arpit use?" → MERN stack (MongoDB, Express, React, Node.js) + Tailwind CSS, Framer Motion, and AI/LLM integrations.
- "What is Arpit's CGPA?" → 7.52 (current) at IIIT Una.
- "How to contact Arpit?" → Email: arpit0112ak@gmail.com | Phone: +91 9199473527
- "Where is Arpit located?" → Tatanagar, Jharkhand, India.
- "Does Arpit have internship experience?" → Yes, Full-Stack Developer Intern at ModelSuite.ai (Feb–Apr 2026).
`;

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, history = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return res.status(500).json({ error: "Groq API key not configured" });
  }

  try {
    const groq = new Groq({ apiKey: groqKey });

    const messages = [
      { role: "system", content: RESUME_CONTEXT },
      ...history.slice(-6), // Keep last 6 exchanges for context
      { role: "user", content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 512,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "I couldn't generate a response.";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Groq error:", err);
    return res.status(500).json({ error: "Failed to get AI response" });
  }
};
