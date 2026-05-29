const { generateCompletion } = require('../services/openaiService');
const Job = require('../models/Job');
const { pool } = require('../config/db');

exports.buildResume = async (req, res) => {
    try {
        const { name, phone, email, location, linkedin, summary, skills, experience, education, projects, isFresher, achievements } = req.body;
        const systemPrompt = `You are an expert resume builder and recruitment consultant. 
        Generate a high-impact, professional ONE-PAGE CV in Markdown format. 
        
        CRITICAL RULES:
        1. If 'isFresher' is true (or user has no corporate history), prioritize and expand on 'Projects', 'Achievements', and 'Education'. 
        2. Highlight technical skills, academic achievements, and certifications for freshers to compensate for lack of corporate history.
        3. Respond in pure JSON format with a single key 'resume' containing the complete markdown.
        4. Use clear headers (##) and bullet points. 
        5. The tone must be professional, achievement-oriented, and recruitment-ready.
        6. Keep it concise to ensure it fits perfectly on one page when converted to PDF.`;
        
        const userPrompt = `Build an optimized ONE-PAGE resume for: 
        Name: ${name}
        Phone: ${phone}
        Email: ${email}
        Location: ${location}
        LinkedIn: ${linkedin}
        
        Professional Summary: ${summary}
        
        Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}
        
        Experience: ${JSON.stringify(experience)}
        
        Education: ${JSON.stringify(education)}
        
        Projects: ${JSON.stringify(projects)}

        Achievements & Certifications: ${JSON.stringify(achievements)}

        Fresher Mode Active: ${isFresher}
        
        Ensure the output is beautifully structured markdown.`;

        const resumeData = await generateCompletion(systemPrompt, userPrompt);
        res.status(200).json({ success: true, data: resumeData });
    } catch (error) {
        console.error("AI Controller Error:", error);
        res.status(500).json({ success: false, message: 'AI processing failed' });
    }
};

exports.analyzeResume = async (req, res) => {
    try {
        const { resumeText, jobDescription, resume_url, job_description } = req.body;
        
        let finalJd = jobDescription || job_description;
        let finalResume = resumeText || resume_url;

    
        if (!finalResume) {
            const [profileRows] = await pool.query('SELECT headline, summary, skills, experience, education, projects FROM job_seeker_profile WHERE user_id = ?', [req.user.id]);
            if (profileRows.length > 0) {
                const p = profileRows[0];
                
                
                const parseField = (field) => {
                    try {
                        return typeof field === 'string' ? JSON.parse(field) : field;
                    } catch (e) {
                        return field;
                    }
                };

                const skillsArr = parseField(p.skills) || [];
                const expArr = parseField(p.experience) || [];
                const eduArr = parseField(p.education) || [];
                const projArr = parseField(p.projects) || [];

                finalResume = `
PROFESSIONAL PROFILE
Headline: ${p.headline || 'Not Provided'}
Summary: ${p.summary || 'Not Provided'}

TECHNICAL SKILLS:
${Array.isArray(skillsArr) ? skillsArr.join(', ') : 'None listed'}

EXPERIENCE:
${Array.isArray(expArr) ? expArr.map(e => `- ${e.role} at ${e.company} (${e.period}): ${e.description}`).join('\n') : 'No experience listed'}

EDUCATION:
${Array.isArray(eduArr) ? eduArr.map(e => `- ${e.degree} from ${e.institution} (${e.year})`).join('\n') : 'No education listed'}

PROJECTS:
${Array.isArray(projArr) ? projArr.map(p => `- ${p.name}: ${p.description} (Link: ${p.link})`).join('\n') : 'No projects listed'}
                `.trim();
            }
        }

        console.log("--- FINAL RESUME FOR AI ---");
        console.log(finalResume);
        console.log("--- END FINAL RESUME ---");

        if (!finalJd || !finalResume || finalResume.length < 50) {
            return res.status(400).json({ 
                success: false, 
                message: 'Your resume seems empty. Please complete your profile with skills, experience, and projects before analyzing.' 
            });
        }

        const systemPrompt = "You are an expert technical recruiter analyzing resumes against job descriptions. Respond in JSON with a single key 'analysis' containing a detailed breakdown in markdown, and a key 'score' (0-100).";
        const userPrompt = `Analyze this Resume Text: ${finalResume} against this Job Description: ${finalJd}.`;

        const result = await generateCompletion(systemPrompt, userPrompt);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
         console.error("Analyze Resume Error:", error);
         res.status(500).json({ success: false, message: 'AI processing failed' });
    }
};

exports.interviewCoach = async (req, res) => {
    try {
        const { messages } = req.body;
        const systemPrompt = "You are an expert AI Interview Coach. Provide constructive feedback and the next interview question based on the conversation history. Respond in JSON with key 'feedback' containing your response.";
        const historyText = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
        const userPrompt = `Continue the interview based on this history:\n${historyText}\n\nProvide the next coach response.`;

        const result = await generateCompletion(systemPrompt, userPrompt);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'AI processing failed' });
    }
};

exports.generateJobDescription = async (req, res) => {
    try {
        const { role, requirements, tone } = req.body;
        const systemPrompt = "You are an expert HR Manager writing engaging job descriptions. Respond in JSON format with a single key 'description' containing the full JD in markdown.";
        const userPrompt = `Write a ${tone} job description for a ${role} with requirements: ${requirements}.`;

        const result = await generateCompletion(systemPrompt, userPrompt);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'AI processing failed' });
    }
};

exports.jobMatch = async (req, res) => {
    try {
        // Feature 5: AI Job Matching
        if (req.user.role !== 'job_seeker') return res.status(403).json({ success: false, message: 'Access denied' });

        const [profileRows] = await pool.query('SELECT skills, experience, headline FROM job_seeker_profile WHERE user_id = ?', [req.user.id]);
        if (profileRows.length === 0) return res.status(404).json({ success: false, message: 'Profile not found' });
        
        const userProfile = profileRows[0];
        
        // Fetch all recent jobs (Limit to 50 for quick AI context size, a vector DB should be used in prod)
        const jobs = await Job.findAll();
        const simplifiedJobs = jobs.map(j => ({ id: j.id, title: j.title, skills_required: j.skills_required })).slice(0, 50);

        const systemPrompt = `You are a sophisticated job matching AI. Given a user's profile and a list of available jobs, return the top 5 most relevant matches. 
        Respond in JSON with a key 'matches' which is an array of objects: { job_id: number, match_score: number (0-100), match_reasons: string[] }.`;
        
        const userPrompt = `User Profile:
            - Headline: ${userProfile.headline}
            - Skills: ${userProfile.skills}
            - Experience: ${userProfile.experience}
            
            Available Jobs JSON:
            ${JSON.stringify(simplifiedJobs)}
        `;

        const matchResult = await generateCompletion(systemPrompt, userPrompt);
        
        // Enrich job data with AI match info
        const finalMatches = matchResult.matches.map(m => {
            const job = jobs.find(j => j.id === m.job_id);
            if (!job) return null;
            return {
                ...job,
                match_score: m.match_score,
                match_reasons: m.match_reasons
            };
        }).filter(Boolean);
        
        res.status(200).json({ success: true, data: finalMatches });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'AI processing failed' });
    }
};
