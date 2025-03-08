'use server'

import { 
  UserDetails, 
  Experience, 
  Education, 
  SkillCategory, 
  GeneratedCV, 
  GeneratedCoverLetter,
  Project
} from '@/types'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

// Define schemas for structured output
const cvSchema = z.object({
  content: z.string(),
  sections: z.object({
    summary: z.string(),
    experience: z.array(
      z.object({
        title: z.string(),
        company: z.string(),
        period: z.string(),
        description: z.string()
      })
    ),
    education: z.array(
      z.object({
        degree: z.string(),
        institution: z.string(),
        period: z.string()
      })
    ),
    projects: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        technologies: z.array(z.string())
      })
    ),
    skills: z.array(z.string())
  })
})

const coverLetterSchema = z.object({
  content: z.string(),
  sections: z.object({
    introduction: z.string(),
    body: z.array(z.string()),
    conclusion: z.string()
  })
})

// Wrap array in an object to satisfy OpenAI's JSON schema requirements
const skillsAnalysisSchema = z.object({
  skills: z.array(z.string())
})

// These are placeholder server actions that will be implemented later
// For now, they just return mock data for UI development

export async function generateCV(jobDescription: string, userDetails: UserDetails, experiences: Experience[], educations: Education[], skillCategories: SkillCategory[], projects: Project[] = [], language: string = 'english'): Promise<GeneratedCV> {
  try {
    console.log('Starting CV generation with:', { 
      jobDescriptionLength: jobDescription?.length,
      userDetails: !!userDetails,
      experiencesCount: experiences?.length,
      educationsCount: educations?.length,
      skillCategoriesCount: skillCategories?.length,
      projectsCount: projects?.length,
      language
    })
    
    // Log more detailed information for debugging
    console.log('Experiences being processed:', experiences?.map(e => `${e.jobTitle} at ${e.company}`))
    console.log('Educations being processed:', educations?.map(e => `${e.degree} from ${e.institution}`))
    console.log('Skill categories being processed:', skillCategories?.map(s => `${s.name} (${s.skills.length} skills)`))
    console.log('Projects being processed:', projects?.map(p => p.name))
    
    // Format user data for the prompt, handling empty arrays
    const formattedExperiences = experiences && experiences.length > 0 
      ? experiences.map(exp => 
          `${exp.jobTitle} at ${exp.company}, ${exp.location} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})\n${exp.description}`
        ).join('\n\n')
      : 'No work experience provided.'

    const formattedEducation = educations && educations.length > 0
      ? educations.map(edu => 
          `${edu.degree} from ${edu.institution}, ${edu.location} (${edu.startDate} - ${edu.current ? 'Present' : edu.endDate})${edu.description ? `\n${edu.description}` : ''}`
        ).join('\n\n')
      : 'No education details provided.'
      
    const formattedProjects = projects && projects.length > 0
      ? projects.map(project => {
          const technologies = project.technologies && project.technologies.length > 0
            ? `\nTechnologies: ${project.technologies.join(', ')}`
            : '\nTechnologies: None';
          return `${project.name} (${project.startDate} - ${project.endDate || 'Present'})\n${project.description}${technologies}`;
        }).join('\n\n')
      : 'No projects provided.'

    const formattedSkills = skillCategories && skillCategories.length > 0
      ? skillCategories.map(category => 
          `${category.name}: ${category.skills.join(', ')}`
        ).join('\n')
      : 'No skills provided.'

    // Create the prompt for the AI
    const prompt = `
      You are an expert CV writer with 15+ years of experience specializing in ATS optimization. Create a highly tailored resume that perfectly matches this specific job description while authentically representing the candidate's qualifications.
      
      TARGET LANGUAGE: ${language.toUpperCase()}
      Output the entire resume in ${language} language. Translate all content, including section headings, bullet points, and phrases into ${language}.
      
      USER DETAILS:
      Name: ${userDetails.fullName}
      Title: ${userDetails.jobTitle || 'Professional'}
      Email: ${userDetails.email}
      Phone: ${userDetails.phone}
      Location: ${userDetails.location}
      LinkedIn: ${userDetails.linkedin || 'Not provided'}
      Website: ${userDetails.website || 'Not provided'}
      Summary/About: ${userDetails.summary || 'Not provided'}
      
      WORK EXPERIENCE:
      ${formattedExperiences}

      EDUCATION:
      ${formattedEducation}
      
      PROJECTS:
      ${formattedProjects}

      SKILLS:
      ${formattedSkills}

      JOB DESCRIPTION:
      ${jobDescription}

      DETAILED INSTRUCTIONS:
      1. Start with a comprehensive keyword analysis of the job description to identify:
         - Primary hard skills and technical competencies required
         - Soft skills and qualities emphasized
         - Industry-specific terminology and buzzwords
         - Key responsibilities and deliverables
         - Company values and culture indicators
      
      2. Create a compelling professional summary (3-5 lines) that:
         - Positions the candidate as an ideal fit for THIS SPECIFIC role
         - Front-loads the most relevant qualifications and achievements
         - Incorporates 3-5 key skills/terms from the job description
         - Quantifies experience level and impact where possible
         - Aligns with the company's mission or values when apparent from the job description
      
      3. For work experiences, transform the provided information to:
         - Highlight accomplishments that DIRECTLY relate to the job requirements
         - Begin each bullet with strong action verbs
         - Include metrics, percentages, and quantifiable results
         - Demonstrate growth, leadership, and complexity of work
         - Emphasize transferable skills for career transitions
         - Feature keywords from the job description naturally
         - Prioritize experiences that best match the job's requirements
      
      4. For education and certifications:
         - Highlight relevant coursework or specializations that match job requirements
         - Include GPA only if exceptional (3.5+)
         - Format consistently with most recent credentials first
      
      5. For projects:
         - Showcase those most relevant to the target position
         - Emphasize technologies and methodologies mentioned in the job description
         - Describe problem-solving approach and outcomes
      
      6. For skills section:
         - Create a strategic organization of technical skills based on job relevance
         - List skills in order of importance to the position
         - Include ALL technical skills from the job description that the candidate possesses
         - Incorporate both hard and soft skills in appropriate balance
      
      7. Ensure the resume is:
         - ATS-optimized with appropriate section headings and keywords
         - Limited to 1-2 pages maximum
         - Clean and scannable with consistent formatting
         - Front-loaded with the most relevant information
         - Free of objective statements, references, or personal pronouns
      
      8. Apply job description keyword matching:
         - Identify 15-20 key terms from the job description
         - Naturally incorporate these terms throughout the resume
         - Use exact phrasing for technical skills and tools
         - Adapt industry terminology to match the employer's language
         - Ensure critical requirements from the job description are addressed
      
      9. Language adaptation:
         - Use appropriate ${language} terminology for all standard resume sections (e.g., "Education", "Experience", "Skills")
         - Ensure the language style is formal and professional in ${language}
         - Adapt any English idioms or phrases to culturally appropriate equivalents in ${language}
         - Use proper grammar and punctuation specific to ${language}
      
      The CV must be formatted for modern ATS systems, scoring 90%+ match for keyword relevance, while remaining readable and authentic for human reviewers.
      
      Your response MUST include both:
      1. A summary field with a professional summary in ${language}
      2. Properly structured sections for experience, education, projects (if provided), and skills in ${language}
      3. NO fluff or unnecessary content - every line should demonstrate value
      4. For each experience, only include achievements and responsibilities most relevant to this job
    `

    console.log('Calling OpenAI API for CV generation...')
    
    try {
      // Generate the CV with structured output
      const result = await generateObject({
        model: openai('gpt-4o', {
          structuredOutputs: true,
        }),
        schema: cvSchema,
        prompt
      })

      // Validate and log the returned structure
      const generatedCV = result.object;
      console.log('CV generation successful, checking returned structure')
      
      // Check if all provided experiences are reflected in the returned structure
      if (experiences.length > 0 && generatedCV.sections.experience.length < experiences.length) {
        console.warn(`Warning: Only ${generatedCV.sections.experience.length} of ${experiences.length} experiences were included in the CV`)
      }
      
      // Check if all provided educations are reflected in the returned structure
      if (educations.length > 0 && generatedCV.sections.education.length < educations.length) {
        console.warn(`Warning: Only ${generatedCV.sections.education.length} of ${educations.length} educations were included in the CV`)
      }
      
      // Check if all provided projects are reflected in the returned structure
      if (projects.length > 0 && (!generatedCV.sections.projects || generatedCV.sections.projects.length < projects.length)) {
        console.warn(`Warning: Only ${generatedCV.sections.projects?.length || 0} of ${projects.length} projects were included in the CV`)
      }
      
      // Check if skills are included from all categories
      if (skillCategories.length > 0) {
        const totalSkillsProvided = skillCategories.reduce((total, category) => total + category.skills.length, 0);
        if (generatedCV.sections.skills.length < totalSkillsProvided) {
          console.warn(`Warning: Only ${generatedCV.sections.skills.length} of ${totalSkillsProvided} skills were included in the CV`)
        }
      }
      
      console.log('CV structure validation complete')
      return generatedCV;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown API error';
      console.error('API Error details:', error)
      throw new Error(`API Error: ${errorMessage}`)
    }
  } catch (error) {
    console.error('Error generating CV:', error)
    throw new Error('Failed to generate CV. Please try again.')
  }
}

export async function generateCoverLetter(jobDescription: string, userDetails: UserDetails, experiences: Experience[], educations: Education[] = [], skillCategories: SkillCategory[] = [], projects: Project[] = [], language: string = 'english'): Promise<GeneratedCoverLetter> {
  try {
    console.log('Starting cover letter generation with:', { 
      jobDescriptionLength: jobDescription?.length,
      userDetails: !!userDetails,
      experiencesCount: experiences?.length,
      educationsCount: educations?.length,
      skillCategoriesCount: skillCategories?.length,
      projectsCount: projects?.length,
      language
    })
    
    // Format user data for the prompt, handling empty arrays
    const formattedExperiences = experiences && experiences.length > 0
      ? experiences.map(exp => 
          `${exp.jobTitle} at ${exp.company}, ${exp.location} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})\n${exp.description}`
        ).join('\n\n')
      : 'No work experience provided.'
      
    const formattedEducation = educations && educations.length > 0
      ? educations.map(edu => 
          `${edu.degree} from ${edu.institution}, ${edu.location} (${edu.startDate} - ${edu.current ? 'Present' : edu.endDate})${edu.description ? `\n${edu.description}` : ''}`
        ).join('\n\n')
      : 'No education details provided.'
      
    const formattedProjects = projects && projects.length > 0
      ? projects.map(project => {
          const technologies = project.technologies && project.technologies.length > 0
            ? `\nTechnologies: ${project.technologies.join(', ')}`
            : '\nTechnologies: None';
          return `${project.name} (${project.startDate} - ${project.endDate || 'Present'})\n${project.description}${technologies}`;
        }).join('\n\n')
      : 'No projects provided.'

    const formattedSkills = skillCategories && skillCategories.length > 0
      ? skillCategories.map(category => 
          `${category.name}: ${category.skills.join(', ')}`
        ).join('\n')
      : 'No skills provided.'

    // Create the prompt for the AI
    const prompt = `
      You are a modern career coach who helps candidates write authentic, human cover letters that connect with recruiters on platforms like LinkedIn. Create a conversational yet professional cover letter that shows genuine interest and relevant qualifications.
      
      TARGET LANGUAGE: ${language.toUpperCase()}
      Output the entire cover letter in ${language} language. Translate all content, including greetings, body paragraphs, and closing statements into ${language}.
      
      USER DETAILS:
      Name: ${userDetails.fullName}
      Title: ${userDetails.jobTitle || 'Professional'}
      Email: ${userDetails.email}
      Phone: ${userDetails.phone}
      Location: ${userDetails.location}
      Summary/About: ${userDetails.summary || 'Not provided'}
      
      WORK EXPERIENCE:
      ${formattedExperiences}
      
      EDUCATION:
      ${formattedEducation}
      
      PROJECTS:
      ${formattedProjects}
      
      SKILLS:
      ${formattedSkills}
      
      JOB DESCRIPTION:
      ${jobDescription}
      
      COVER LETTER GUIDELINES:
      
      1. Write in a warm, natural human voice that shows personality while remaining professional
      2. Keep the letter concise (300-400 words) - but ensure it fully addresses the key points from the job description
      3. Use a conversational tone that feels like the candidate speaking naturally
      4. Focus on 3-4 most relevant experiences/skills that directly connect to the job
      5. Show genuine enthusiasm for the specific role and company
      6. Avoid clichés, jargon, and overly formal language
      7. Include relevant keywords from the job description naturally
      8. Format for easy scanning with short paragraphs (2-4 sentences each)
      9. Demonstrate understanding of the company's mission or values when apparent from the job description
      10. Use appropriate language conventions, greetings, and professional tone specific to ${language}
      
      STRUCTURE:
      
      • Opening (3-4 sentences):
        - Address with a friendly but professional greeting appropriate in ${language}
        - Clearly state the position being applied for
        - Add a brief, genuine statement about interest in the role/company
        - Include how you discovered the position if relevant
      
      • Main section (2-3 paragraphs):
        - Connect the candidate's 3-4 most relevant experiences directly to key job requirements
        - Focus on specific achievements and skills that demonstrate capability
        - Include 2-3 brief examples with results where possible
        - Show how the candidate would add value in this specific role
        - Address any specific requirements mentioned in the job description
      
      • Brief closing:
        - Express sincere interest in discussing the opportunity further
        - Mention availability for interviews or next steps
        - Include a simple, professional sign-off appropriate in ${language}
      
      This should feel like a personalized message from the candidate to a hiring manager, not a formal letter. It should be genuine, highlight only the most relevant qualifications, and show the human behind the resume.
      
      The cover letter must appear authentic - like something a real person would write to express genuine interest in a role they're qualified for, not AI-generated text.
      
      Create the entire cover letter in ${language}, including appropriate greetings and closings for that language.
    `

    console.log('Calling OpenAI API for cover letter generation...')
    
    try {
      // Generate the cover letter with structured output
      const result = await generateObject({
        model: openai('gpt-4o', {
          structuredOutputs: true,
        }),
        schema: coverLetterSchema,
        prompt
      })

      console.log('Cover letter generation response type:', typeof result)
      console.log('Cover letter generation successful, detailed result:', JSON.stringify(result, null, 2))
      
      // Ensure the content field is properly set
      if (!result.object.content && result.object.sections) {
        // Combine sections into content if content is missing
        const introduction = result.object.sections.introduction || '';
        const body = Array.isArray(result.object.sections.body) 
          ? result.object.sections.body.join('\n\n') 
          : '';
        const conclusion = result.object.sections.conclusion || '';
        
        result.object.content = `${introduction}\n\n${body}\n\n${conclusion}`;
        console.log('Reconstructed content from sections:', result.object.content.substring(0, 100) + '...');
      }
      
      // Fallback if sections are somehow missing
      if (!result.object.content) {
        console.error('Error: No content found in cover letter response');
        result.object.content = "Dear Hiring Manager,\n\nI am writing to express my interest in the position. I believe my skills and experience make me a strong candidate for this role.\n\nI would welcome the opportunity to discuss how I can contribute to your team. Thank you for considering my application.\n\nSincerely,\n" + userDetails.fullName;
        console.log('Using fallback content instead');
      }
      
      return result.object;
    } catch (error: unknown) {
      // Log the error details for debugging
      console.error('API Error details:', error)
      
      // Return a fallback cover letter in case of errors
      const fallbackCoverLetter: GeneratedCoverLetter = {
        content: `Dear Hiring Manager,

I am writing to express my interest in the position described in the job posting. With my background in ${experiences?.[0]?.jobTitle || 'the field'}, I believe I can make a valuable contribution to your team.

My experience at ${experiences?.[0]?.company || 'previous companies'} has prepared me well for this role. I have developed skills in problem-solving, communication, and teamwork that would allow me to excel in this position.

I would welcome the opportunity to discuss my qualifications further. Thank you for considering my application.

Sincerely,
${userDetails.fullName}`,
        sections: {
          introduction: "Dear Hiring Manager,\n\nI am writing to express my interest in the position described in the job posting.",
          body: ["My experience has prepared me well for this role. I have developed skills that would allow me to excel in this position."],
          conclusion: "I would welcome the opportunity to discuss my qualifications further. Thank you for considering my application.\n\nSincerely,\n" + userDetails.fullName
        }
      };
      
      console.log('Using fallback cover letter instead:', fallbackCoverLetter);
      return fallbackCoverLetter;
    }
  } catch (error) {
    console.error('Error generating cover letter:', error)
    
    // Create a simple fallback cover letter if everything else fails
    const simpleFallback: GeneratedCoverLetter = {
      content: `Dear Hiring Manager,

I am writing to express my interest in the position. I believe my skills and experience make me a strong candidate for this role.

I would welcome the opportunity to discuss how I can contribute to your team. Thank you for considering my application.

Sincerely,
${userDetails?.fullName || 'Candidate'}`,
      sections: {
        introduction: "Dear Hiring Manager,",
        body: ["I am writing to express my interest in the position."],
        conclusion: "Sincerely,\n" + (userDetails?.fullName || 'Candidate')
      }
    };
    
    console.log('Using simple fallback cover letter due to error:', simpleFallback);
    return simpleFallback;
  }
}

export async function analyzeJobDescription(jobDescription: string): Promise<string[]> {
  try {
    // Create the prompt
    const prompt = `
      Analyze the following job description and extract the key skills and technologies required:

      JOB DESCRIPTION:
      ${jobDescription}

      Return an object with a 'skills' array containing the skills and technologies mentioned in or implied by the job description.
      Focus on both hard skills (technologies, tools, programming languages, frameworks, methodologies) 
      and important soft skills or domain knowledge.
      
      Analyze the job description thoroughly and include both explicitly mentioned skills
      and those that are implicitly required based on the job responsibilities.
      
      Prioritize the skills by relevance to the job, and include up to 20 skills.
    `

    console.log('Calling OpenAI API for job description analysis...')
    
    try {
      // Generate the skills analysis with structured output
      const result = await generateObject({
        model: openai('gpt-4o', {
          structuredOutputs: true,
        }),
        schema: skillsAnalysisSchema,
        prompt
      })

      console.log('Job description analysis successful, result:', JSON.stringify(result.object))
      
      return result.object.skills
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown API error';
      console.error('API Error details:', error)
      throw new Error(`API Error: ${errorMessage}`)
    }
  } catch (error) {
    console.error('Error analyzing job description:', error)
    throw new Error('Failed to analyze job description. Please try again.')
  }
}

// Server actions for data persistence
export async function saveUserDetails(data: UserDetails) {
  try {
    console.log('Saving user details to server:', data)
    // In a real app, this would save to a database
    return { success: true, data }
  } catch (error) {
    console.error('Error saving user details:', error)
    throw new Error('Failed to save user details')
  }
}

// Resume upload functions have been removed as they were unstable and buggy 