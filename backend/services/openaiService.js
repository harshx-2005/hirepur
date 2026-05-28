const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

exports.generateCompletion = async (systemPrompt, userPrompt) => {
    try {
        if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY.includes('AIza')) {
            // Using the real Gemini model
            console.log("Using Google Gemini API (2.5 Flash)...");
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash"
            });

            // Prompt Gemini to return JSON
            const fullPrompt = `${systemPrompt}\n\nUSER INPUT:\n${userPrompt}\n\nIMPORTANT: Return ONLY a valid JSON object matching the requested schema. Do not output markdown blocks or surrounding text.`;
            
            const result = await model.generateContent(fullPrompt);
            const responseText = result.response.text();
            
            try {
                // Strip markdown code blocks if the model wrapped the JSON
                const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(cleanJson);
            } catch (jsonErr) {
                console.error("Failed to parse Gemini JSON:", responseText);
                return generateMockResponse(systemPrompt, userPrompt);
            }
        } else {
             console.log("No valid Google API Key found. Falling back to Mock AI Mode.");
             return generateMockResponse(systemPrompt, userPrompt);
        }
    } catch (error) {
        console.error("Google API Error Detail:", error.message || error);
        return generateMockResponse(systemPrompt, userPrompt);
    }
};

function generateMockResponse(systemPrompt, userPrompt) {
   if (systemPrompt.includes('resume writer')) {
       return {
           resume: "# Finalized Premium Resume\n\n**EXPERIENCE**\n\n* **Senior Software Engineer**, Tech Solutions (2021-Present)\nLed a team of 4 engineers to rebuild the core platform.\n\n**SKILLS**\n\n* JavaScript, React, Node.js, Python, SQL, Cloud Architecture\n\n**EDUCATION**\n\n* B.S. in Computer Science, State University (2020)"
       };
   } else if (systemPrompt.includes('analyzing resumes')) {
       return { 
           analysis: "Your resume is excellent but missing specific mentions of **Docker** and **Kubernetes** which are highly valued for this role. Consider quantifying your achievements with metrics.",
           score: 82 
       };
   } else if (systemPrompt.includes('Interview Coach') || systemPrompt.includes('Mock Interview')) {
       // Make mock interview more dynamic based on input
       const lastMsg = userPrompt.toLowerCase();
       let feedback = "That is a very professional start!";
       let nextQuestion = "Next question: How do you handle conflict in a distributed team?";

       if (lastMsg.includes('full stack') || lastMsg.includes('developer')) {
           feedback = "Great. A Full Stack role requires a blend of problem-solving and architectural thinking.";
           nextQuestion = "Can you describe a challenging technical problem you solved recently? What was your approach?";
       } else if (lastMsg.includes('mern') || lastMsg.includes('react') || lastMsg.includes('node')) {
           feedback = "Excellent. The MERN stack is highly effective for modern applications. State management is often a key focus.";
           nextQuestion = "Can you explain how you'd optimize a React application that is experiencing slow initial renders?";
       } else if (lastMsg.includes('conflict') || lastMsg.includes('teammate') || lastMsg.includes('team')) {
           feedback = "Resolve conflict with communication is the best way. Good answer.";
           nextQuestion = "Tell me about a time you led a project or took initiative on a difficult task.";
       } else if (lastMsg.includes('mean') || lastMsg.includes('explain') || lastMsg.includes('what')) {
           feedback = "Understood. In an interview, we often look for your analytical process.";
           nextQuestion = "Let's pivot: What is your favorite programming language and why?";
       }

       return { 
           feedback: `${feedback} I recommend using the STAR method for more depth. ${nextQuestion}`
       };
   } else if (systemPrompt.includes('HR Manager')) {
       return { 
           description: "# Software Engineer Job Description\n\n## Overview\nWe are looking for a dynamic engineer to join our fast-paced team.\n\n## Responsibilities\n- Develop scalable microservices.\n- Collaborate with cross-functional teams.\n\n## Requirements\n- 3+ years experience.\n- Strong problem-solving skills."
       };
   } else if (systemPrompt.includes('job matching AI')) {
       return { 
           matches: [
               { job_id: 1, match_score: 95, match_reasons: ["Strong React background", "Relevant industry experience"] },
               { job_id: 2, match_score: 88, match_reasons: ["Backend expertise", "Node.js mastery"] }
           ]
       };
   }
   return {};
}
