import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useCVStore } from '@/store'
import { 
  Document, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  Packer
} from 'docx'
import { generateCV, generateCoverLetter } from '@/actions'
import { GeneratedCV, GeneratedCoverLetter } from '@/types'

export default function useDocumentActions() {
  // State for download operations
  const [isPending, setIsPending] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState<'docx' | 'txt'>('docx')
  
  const cvContentRef = useRef<HTMLDivElement>(null)
  const coverLetterContentRef = useRef<HTMLDivElement>(null)
  
  const { 
    generatedCV, 
    generatedCoverLetter,
    resetGeneratedContent,
    userDetails,
    projects,
    jobDescription,
    experiences,
    educations,
    skillCategories
  } = useCVStore()
  
  // Tracking downloads for analytics
  const trackDownload = (documentType: string, format: string) => {
    // Implement tracking logic here if needed
    console.log(`Downloaded ${documentType} as ${format}`)
  }

  // Helper function to download CV as Word
  const downloadAsWord = async (filename: string, cvContent: GeneratedCV | null = null) => {
    if (typeof window === 'undefined') {
      return false
    }
    
    // Use provided content if available, otherwise use from store
    const cv = cvContent || generatedCV
    
    if (!cv) {
      toast.error('No CV content to download')
      return false
    }

    try {
      // Show loading toast for better UX
      const loadingToast = toast.loading('Creating ATS-friendly document...')
      
      // Create sections for the document
      const docSections = []

      // Document title with user name
      docSections.push(
        new Paragraph({
          text: userDetails?.fullName || 'Curriculum Vitae',
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          thematicBreak: true, // Adds a border below this paragraph
        })
      )

      // Add user details at the top if available (ATS-friendly header)
      if (userDetails) {
        // Job title if available - clear professional title for ATS
        if (userDetails.jobTitle) {
          docSections.push(
            new Paragraph({
              text: userDetails.jobTitle,
              alignment: AlignmentType.CENTER,
              spacing: { after: 240 },
              style: 'Subtitle',
            })
          )
        }

        // Contact info (email, phone, location) - critical for ATS
        const contactInfo = []
        if (userDetails.email) contactInfo.push(userDetails.email)
        if (userDetails.phone) contactInfo.push(userDetails.phone)
        if (userDetails.location) contactInfo.push(userDetails.location)

        if (contactInfo.length > 0) {
          docSections.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 120 },
              children: contactInfo.map((info, index) => {
                if (index < contactInfo.length - 1) {
                  return [new TextRun(info), new TextRun(' | ')];
                }
                return [new TextRun(info)];
              }).flat(),
              style: 'ContactInfo',
            })
          )
        }

        // Online profiles as clear text (ATS may not follow hyperlinks)
        const onlineProfiles = []
        if (userDetails.linkedin) onlineProfiles.push({ text: 'LinkedIn', url: userDetails.linkedin })
        if (userDetails.github) onlineProfiles.push({ text: 'GitHub', url: userDetails.github })
        if (userDetails.website) onlineProfiles.push({ text: 'Website', url: userDetails.website })

        if (onlineProfiles.length > 0) {
          docSections.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 360 },
              children: onlineProfiles.map((profile, index) => {
                const elements = []
                elements.push(new TextRun({ text: profile.text, style: 'Hyperlink', color: '0366d6' }))
                
                if (index < onlineProfiles.length - 1) {
                  elements.push(new TextRun(' | '))
                }
                
                return elements
              }).flat(),
              style: 'ContactInfo',
            })
          )
        }
      }
      
      // Add CV sections - FULL CONTENT with ATS-friendly and attractive formatting
      // Summary Section - clear section heading for ATS parsing
      if (cv.sections?.summary) {
        docSections.push(
          new Paragraph({
            text: 'SUMMARY',
            heading: HeadingLevel.HEADING_2,
            style: 'SectionHeading',
            spacing: { before: 240, after: 120 },
            border: {
              bottom: { color: '4472C4', size: 1, space: 1, style: 'single' },
            },
          }),
          new Paragraph({
            text: cv.sections.summary,
            spacing: { after: 240 },
          })
        )
      }

      // Experience Section - clearly labeled for ATS systems
      if (cv.sections?.experience && cv.sections.experience.length > 0) {
        docSections.push(
          new Paragraph({
            text: 'EXPERIENCE',
            heading: HeadingLevel.HEADING_2,
            style: 'SectionHeading',
            spacing: { before: 240, after: 120 },
            border: {
              bottom: { color: '4472C4', size: 1, space: 1, style: 'single' },
            },
          })
        )
        
        cv.sections.experience.forEach(job => {
          // Job title and company - ATS looks for these first
          docSections.push(
            new Paragraph({
              spacing: { after: 0 },
              children: [
                new TextRun({ text: job.title, bold: true, size: 26 }),
                new TextRun(' | '),
                new TextRun({ text: job.company, italics: true }),
              ],
              style: 'JobTitle',
            })
          )
          
          // Period if available - clear dates for ATS parsing
          if (job.period) {
            docSections.push(
              new Paragraph({
                text: job.period,
                spacing: { after: 120 },
                style: 'DateRange',
              })
            )
          }
          
          // Description - parsed by ATS for keywords
          if (job.description) {
            // Split description by new lines to create proper paragraphs
            const descriptionLines = job.description.split('\n');
            descriptionLines.forEach(line => {
              if (line.trim()) {
                docSections.push(
                  new Paragraph({
                    text: line.trim(),
                    spacing: { after: 80 },
                    style: 'BodyText',
                    bullet: {
                      level: 0
                    }
                  })
                )
              }
            })
            
            // Add extra spacing after job
            docSections.push(
              new Paragraph({
                text: '',
                spacing: { after: 160 },
              })
            )
          }
        })
      }

      // Education Section - clearly labeled for ATS
      if (cv.sections?.education && cv.sections.education.length > 0) {
        docSections.push(
          new Paragraph({
            text: 'EDUCATION',
            heading: HeadingLevel.HEADING_2,
            style: 'SectionHeading',
            spacing: { before: 240, after: 120 },
            border: {
              bottom: { color: '4472C4', size: 1, space: 1, style: 'single' },
            },
          })
        )
        
        cv.sections.education.forEach(edu => {
          // Degree and institution - key information for ATS
          docSections.push(
            new Paragraph({
              spacing: { after: 0 },
              children: [
                new TextRun({ text: edu.degree || 'Degree', bold: true, size: 26 }),
                new TextRun(' | '),
                new TextRun({ text: edu.institution || 'Institution', italics: true }),
              ],
              style: 'JobTitle',
            })
          )
          
          // Period if available
          if (edu.period) {
            docSections.push(
              new Paragraph({
                text: edu.period,
                spacing: { after: 120 },
                style: 'DateRange',
              })
            )
          }
          
          // Extra spacing between education entries
          docSections.push(
            new Paragraph({
              text: '',
              spacing: { after: 120 },
            })
          )
        })
      }

      // Skills Section - critical for ATS keyword matching
      if (cv.sections?.skills) {
        docSections.push(
          new Paragraph({
            text: 'SKILLS',
            heading: HeadingLevel.HEADING_2,
            style: 'SectionHeading',
            spacing: { before: 240, after: 120 },
            border: {
              bottom: { color: '4472C4', size: 1, space: 1, style: 'single' },
            },
          })
        )
        
        // If skills is a string
        if (typeof cv.sections.skills === 'string') {
          docSections.push(
            new Paragraph({
              text: cv.sections.skills,
              spacing: { after: 240 },
              style: 'BodyText',
            })
          )
        } 
        // If skills is an array - format for readability
        else if (Array.isArray(cv.sections.skills)) {
          // Create columns of skills for better layout
          const chunks = [];
          const chunkSize = Math.ceil(cv.sections.skills.length / 3); // Display in 3 columns
          
          for (let i = 0; i < cv.sections.skills.length; i += chunkSize) {
            chunks.push(cv.sections.skills.slice(i, i + chunkSize));
          }
          
          chunks.forEach(chunk => {
            docSections.push(
              new Paragraph({
                text: chunk.join(', '),
                spacing: { after: 120 },
                style: 'BodyText',
              })
            );
          });
        }
      }
      
      // Projects - if present
      if (cv.sections?.projects && cv.sections.projects.length > 0) {
        docSections.push(
          new Paragraph({
            text: 'PROJECTS',
            heading: HeadingLevel.HEADING_2,
            style: 'SectionHeading',
            spacing: { before: 240, after: 120 },
            border: {
              bottom: { color: '4472C4', size: 1, space: 1, style: 'single' },
            },
          })
        )
        
        cv.sections.projects.forEach(project => {
          // Project name
          docSections.push(
            new Paragraph({
              spacing: { after: 0 },
              children: [
                new TextRun({ text: project.name, bold: true, size: 26 }),
              ],
              style: 'JobTitle',
            })
          )
          
          // Project description
          if (project.description) {
            docSections.push(
              new Paragraph({
                text: project.description,
                spacing: { after: 80 },
                style: 'BodyText',
              })
            )
          }
          
          // Technologies used
          if (project.technologies && project.technologies.length > 0) {
            docSections.push(
              new Paragraph({
                children: [
                  new TextRun({ text: 'Technologies: ', bold: true }),
                  new TextRun(project.technologies.join(', ')),
                ],
                spacing: { after: 160 },
                style: 'SkillsList',
              })
            )
          }
        })
      }

      // Create a document with ATS-friendly settings and enhanced styling
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: docSections,
        }],
        styles: {
          paragraphStyles: [
            {
              id: 'Normal',
              paragraph: {
                spacing: { line: 276 }, // 1.15 spacing
              },
              run: {
                font: 'Calibri',
                size: 24, // 12pt
              },
            },
            {
              id: 'Title',
              run: {
                font: 'Calibri',
                size: 36, // 18pt
                bold: true,
                color: '2F5496',  // Blue color
              },
              paragraph: {
                spacing: { after: 240 },
              },
            },
            {
              id: 'Subtitle',
              run: {
                font: 'Calibri',
                size: 28, // 14pt
                italics: true,
                color: '404040',  // Dark gray
              },
              paragraph: {
                spacing: { after: 120 },
              },
            },
            {
              id: 'SectionHeading',
              run: {
                font: 'Calibri',
                size: 28, // 14pt
                bold: true,
                color: '2F5496',  // Blue color
              },
              paragraph: {
                spacing: { before: 240, after: 120 },
              },
            },
            {
              id: 'JobTitle',
              run: {
                font: 'Calibri',
                size: 26, // 13pt
                bold: true,
              },
              paragraph: {
                spacing: { before: 160, after: 0 },
              },
            },
            {
              id: 'DateRange',
              run: {
                font: 'Calibri',
                size: 22, // 11pt
                italics: true,
                color: '595959',  // Gray
              },
              paragraph: {
                spacing: { after: 120 },
              },
            },
            {
              id: 'BodyText',
              run: {
                font: 'Calibri',
                size: 24, // 12pt
              },
              paragraph: {
                spacing: { after: 120, line: 276 },
              },
            },
            {
              id: 'ContactInfo',
              run: {
                font: 'Calibri',
                size: 22, // 11pt
                color: '595959',  // Gray
              },
              paragraph: {
                spacing: { after: 120 },
              },
            },
            {
              id: 'SkillsList',
              run: {
                font: 'Calibri',
                size: 22, // 11pt
              },
              paragraph: {
                spacing: { after: 120 },
              },
            },
          ],
        },
      })

      // Generate Document
      const blob = await Packer.toBlob(doc)
      
      // Create and trigger download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.dismiss(loadingToast)
        toast.success('ATS-friendly CV downloaded')
      }, 100)
      
      return true
    } catch (error) {
      console.error('Error generating Word document:', error)
      toast.error('Failed to generate Word document')
      return false
    }
  }

  // Helper function to download CV as text file
  const downloadCVAsText = async (filename: string, cvContent: GeneratedCV | null = null) => {
    // Use provided content if available, otherwise use from store
    const cv = cvContent || generatedCV
    
    if (!cv) {
      toast.error('No CV content to download')
      return false
    }
    
    try {
      // Show loading toast
      const loadingToast = toast.loading('Creating text version...')
      
      // Create a complete text version of the CV with all sections
      let textContent = ''
      
      // Add user details
      if (userDetails) {
        textContent += `${userDetails.fullName}\n`
        if (userDetails.jobTitle) textContent += `${userDetails.jobTitle}\n`
        
        const contactInfo = []
        if (userDetails.email) contactInfo.push(userDetails.email)
        if (userDetails.phone) contactInfo.push(userDetails.phone)
        if (userDetails.location) contactInfo.push(userDetails.location)
        
        if (contactInfo.length > 0) {
          textContent += `${contactInfo.join(' | ')}\n`
        }
        
        // Add online profiles
        const profiles = []
        if (userDetails.linkedin) profiles.push('LinkedIn')
        if (userDetails.github) profiles.push('GitHub')
        if (userDetails.website) profiles.push('Website')
        
        if (profiles.length > 0) {
          textContent += `${profiles.join(' | ')}\n`
        }
        
        textContent += '\n'
      }
      
      // Add CV sections
      if (cv.sections) {
        // Summary section
        if (cv.sections.summary) {
          textContent += 'SUMMARY\n'
          textContent += '=======\n'
          textContent += `${cv.sections.summary}\n\n`
        }
        
        // Experience section
        if (cv.sections.experience && cv.sections.experience.length > 0) {
          textContent += 'EXPERIENCE\n'
          textContent += '==========\n'
          
          cv.sections.experience.forEach(job => {
            textContent += `${job.title} | ${job.company}\n`
            if (job.period) textContent += `${job.period}\n`
            if (job.description) textContent += `${job.description}\n`
            textContent += '\n'
          })
        }
        
        // Education section
        if (cv.sections.education && cv.sections.education.length > 0) {
          textContent += 'EDUCATION\n'
          textContent += '=========\n'
          
          cv.sections.education.forEach(edu => {
            textContent += `${edu.degree} | ${edu.institution}\n`
            if (edu.period) textContent += `${edu.period}\n`
            textContent += '\n'
          })
        }
        
        // Skills section
        if (cv.sections.skills) {
          textContent += 'SKILLS\n'
          textContent += '======\n'
          
          if (typeof cv.sections.skills === 'string') {
            textContent += `${cv.sections.skills}\n\n`
          } else if (Array.isArray(cv.sections.skills)) {
            textContent += `${cv.sections.skills.join(', ')}\n\n`
          }
        }
        
        // Projects section
        if (cv.sections.projects && cv.sections.projects.length > 0) {
          textContent += 'PROJECTS\n'
          textContent += '========\n'
          
          cv.sections.projects.forEach(project => {
            textContent += `${project.name}\n`
            if (project.description) textContent += `${project.description}\n`
            if (project.technologies && project.technologies.length > 0) {
              textContent += `Technologies: ${project.technologies.join(', ')}\n`
            }
            textContent += '\n'
          })
        }
      }
      
      // Create blob and trigger download immediately
      const blob = new Blob([textContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Clean up with slight delay
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.dismiss(loadingToast)
        toast.success('CV text file downloaded')
      }, 100)
      
      return true
    } catch (error) {
      console.error('Error generating text file:', error)
      toast.error('Failed to generate text file')
      return false
    }
  }
  
  // Helper function to regenerate CV in current language
  const regenerateCV = async ({ 
    language = 'en'
  }: { 
    language: string, 
    preserveFormat?: boolean 
  }) => {
    try {
      toast.loading(`Regenerating CV in ${language}...`)
      
      if (!userDetails || !jobDescription) {
        toast.error('Missing job description or user details')
        return null
      }
      
      // Make sure we use the latest data from the store
      const store = useCVStore.getState()
      const latestExperiences = store.experiences || []
      const latestEducations = store.educations || []
      const latestSkillCategories = store.skillCategories || []
      const latestProjects = store.projects || []
      
      console.log('Regenerating CV with language:', language)
      
      // Generate a new CV using the server action with the specified language
      const regeneratedCV = await generateCV(
        jobDescription,
        userDetails,
        latestExperiences,
        latestEducations,
        latestSkillCategories,
        latestProjects,
        language // Make sure to pass the language parameter correctly
      )
      
      if (!regeneratedCV) {
        toast.error('CV generation failed')
        return null
      }
      
      // Update the store with the new CV
      useCVStore.setState({ generatedCV: regeneratedCV })
      
      toast.success(`CV regenerated in ${language}`)
      return regeneratedCV
    } catch (error) {
      console.error('Error regenerating CV:', error)
      toast.error('Error occurred during CV regeneration')
      return null
    }
  }
  
  // Helper function to regenerate cover letter in current language
  const regenerateCoverLetter = async ({ 
    language = 'en'
  }: { 
    language: string, 
    preserveFormat?: boolean 
  }) => {
    try {
      if (!userDetails || !jobDescription) {
        toast.error('Missing job description or user details')
        return null
      }
      
      // Generate a new cover letter using the server action
      const regeneratedCoverLetter = await generateCoverLetter(
        jobDescription,
        userDetails,
        experiences || [],
        educations || [],
        skillCategories || [],
        projects || [],
        language || 'en'
      )
      
      if (!regeneratedCoverLetter) {
        return null
      }
      
      // Update the store with the new cover letter
      useCVStore.setState({ generatedCoverLetter: regeneratedCoverLetter })
      
      return regeneratedCoverLetter
    } catch (error) {
      console.error('Error regenerating cover letter:', error)
      return null
    }
  }

  // Handler for downloading CV
  const handleDownloadCV = async () => {
    setIsPending(true)
    
    try {
      // Show a single loading toast
      const loadingToast = toast.loading('Preparing your CV for download...')
      
      // Get current store state
      const store = useCVStore.getState()
      const currentLanguage = store.language || 'en'
      
      // Only regenerate if necessary (if CV doesn't exist or language changed)
      let cvToDownload = store.generatedCV
      
      if (!cvToDownload) {
        // No CV exists, generate one
        cvToDownload = await regenerateCV({
          language: currentLanguage
        })
        
        if (!cvToDownload) {
          toast.dismiss(loadingToast)
          toast.error('Failed to generate CV')
          setIsPending(false)
          return
        }
      }
      
      // Download using the format preference
      const format = downloadFormat || 'docx'
      let success = false
      
      if (format === 'docx') {
        // Download directly as Word document
        success = await downloadAsWord(
          `cv-${currentLanguage}.docx`, 
          cvToDownload
        )
      } else {
        // Download directly as text
        success = await downloadCVAsText(
          `cv-${currentLanguage}.txt`, 
          cvToDownload
        )
      }
      
      // Clean up and notify
      toast.dismiss(loadingToast)
      
      if (success) {
        toast.success('CV downloaded successfully')
        trackDownload('cv', format)
      } else {
        toast.error('Failed to download CV')
      }
    } catch (error) {
      console.error('Error downloading CV:', error)
      toast.error('Failed to download CV')
    } finally {
      setIsPending(false)
    }
  }

  // Helper function to download cover letter as Word
  const downloadCoverLetterAsWord = async (filename: string, coverLetterContent: GeneratedCoverLetter | null = null) => {
    if (typeof window === 'undefined') {
      return false
    }
    
    // Use provided content if available, otherwise use from store
    const coverLetter = coverLetterContent || generatedCoverLetter
    
    if (!coverLetter || !coverLetter.content) {
      toast.error('No cover letter content to download')
      return false
    }

    try {
      // Show loading toast for better UX
      const loadingToast = toast.loading('Creating professional cover letter...')
      
      // Create sections for the document
      const docSections = []

      // Add userDetails if available - Professional format
      if (userDetails) {
        // Sender info block with elegant styling
        docSections.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            children: [
              new TextRun({ 
                text: userDetails.fullName, 
                bold: true, 
                size: 28,
                color: '2F5496' // Professional blue color
              })
            ],
            style: 'SenderName',
          })
        )
        
        // Job title if available
        if (userDetails.jobTitle) {
          docSections.push(
            new Paragraph({
              text: userDetails.jobTitle,
              alignment: AlignmentType.LEFT,
              spacing: { after: 160 },
              style: 'SenderTitle',
            })
          )
        }

        // Contact details in proper business letter format with styled appearance
        const contactInfo = []
        if (userDetails.email) contactInfo.push(userDetails.email)
        if (userDetails.phone) contactInfo.push(userDetails.phone)
        if (userDetails.location) contactInfo.push(userDetails.location)

        // Add each contact item on its own line with modern styling
        contactInfo.forEach(info => {
          docSections.push(
            new Paragraph({
              text: info,
              alignment: AlignmentType.LEFT,
              spacing: { after: 40 },
              style: 'ContactInfo',
            })
          )
        })

        // Add online profiles with elegant formatting
        const profiles = []
        if (userDetails.linkedin) profiles.push({ name: 'LinkedIn', link: userDetails.linkedin })
        if (userDetails.github) profiles.push({ name: 'GitHub', link: userDetails.github })
        if (userDetails.website) profiles.push({ name: 'Website', link: userDetails.website })
        
        profiles.forEach(profile => {
          docSections.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: { after: 40 },
              children: [
                new TextRun({ text: profile.name + ': ', bold: true, size: 22 }),
                new TextRun({ text: profile.link, color: '0366d6', size: 22 })
              ],
              style: 'ContactInfo',
            })
          )
        })

        // Separator line between header and letter content
        docSections.push(
          new Paragraph({
            text: '',
            spacing: { before: 120, after: 120 },
            border: {
              bottom: { color: 'DDDDDD', size: 1, space: 1, style: 'single' },
            },
          })
        )

        // Add date - formal business letter format with modern styling
        const today = new Date()
        const formattedDate = today.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })

        docSections.push(
          new Paragraph({
            text: formattedDate,
            alignment: AlignmentType.LEFT,
            spacing: { before: 160, after: 240 },
            style: 'DateStyle',
          })
        )
        
        // Recipient block with professional styling
        docSections.push(
          new Paragraph({
            text: 'Hiring Manager',
            alignment: AlignmentType.LEFT,
            spacing: { after: 40 },
            style: 'RecipientInfo',
          })
        )
        
        docSections.push(
          new Paragraph({
            text: 'Company Name',
            alignment: AlignmentType.LEFT,
            spacing: { after: 40 },
            style: 'RecipientInfo',
          })
        )
        
        docSections.push(
          new Paragraph({
            text: 'Company Address',
            alignment: AlignmentType.LEFT,
            spacing: { after: 240 },
            style: 'RecipientInfo',
          })
        )
        
        // Greeting with professional style
        docSections.push(
          new Paragraph({
            text: 'Dear Hiring Manager,',
            alignment: AlignmentType.LEFT,
            spacing: { after: 240 },
            style: 'Greeting',
          })
        )
      }

      // Convert content string to elegantly formatted paragraphs
      if (coverLetter.content) {
        // Split by double newlines to get paragraphs
        const paragraphs = coverLetter.content.split('\n\n')
        paragraphs.forEach((para, index) => {
          if (para.trim()) {
            // Process each paragraph with proper styling
            docSections.push(
              new Paragraph({
                text: para.trim(),
                alignment: AlignmentType.LEFT,
                spacing: { after: 240 },
                style: 'BodyText',
                // Add first-line indent to all paragraphs except the first one
                indent: index > 0 ? { firstLine: 720 } : undefined,
              })
            )
          }
        })
      } else if (coverLetter.sections) {
        // Process structured content if available with elegant styling
        if (coverLetter.sections.introduction) {
          docSections.push(
            new Paragraph({
              text: coverLetter.sections.introduction,
              alignment: AlignmentType.LEFT,
              spacing: { after: 240 },
              style: 'BodyText',
            })
          )
        }

        if (coverLetter.sections.body && Array.isArray(coverLetter.sections.body)) {
          coverLetter.sections.body.forEach((para, index) => {
            docSections.push(
              new Paragraph({
                text: para,
                alignment: AlignmentType.LEFT,
                spacing: { after: 240 },
                style: 'BodyText',
                // Add first-line indent to all body paragraphs except the first one
                indent: index > 0 ? { firstLine: 720 } : undefined,
              })
            )
          })
        }

        if (coverLetter.sections.conclusion) {
          docSections.push(
            new Paragraph({
              text: coverLetter.sections.conclusion,
              alignment: AlignmentType.LEFT,
              spacing: { after: 240 },
              style: 'BodyText',
            })
          )
        }
      }

      // Add signature - professional closing with elegant styling
      docSections.push(
        new Paragraph({
          text: 'Sincerely,',
          alignment: AlignmentType.LEFT,
          spacing: { after: 480 }, // Extra space for signature
          style: 'Closing',
        })
      )

      // Name in signature with professional styling
      docSections.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [
            new TextRun({ 
              text: userDetails?.fullName || '', 
              bold: true,
              size: 26,
              color: '2F5496' // Professional blue color
            })
          ],
          style: 'SignatureName',
        })
      )
      
      // Job title under signature with elegant styling
      if (userDetails?.jobTitle) {
        docSections.push(
          new Paragraph({
            text: userDetails.jobTitle,
            alignment: AlignmentType.LEFT,
            spacing: { after: 240 },
            style: 'SignatureTitle',
          })
        )
      }

      // Create a professional document with elegant styling
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: docSections,
        }],
        styles: {
          paragraphStyles: [
            {
              id: 'Normal',
              paragraph: {
                spacing: { line: 276 }, // 1.15 spacing
              },
              run: {
                font: 'Calibri',
                size: 24, // 12pt
              },
            },
            {
              id: 'SenderName',
              run: {
                font: 'Calibri',
                size: 28, // 14pt
                bold: true,
                color: '2F5496', // Professional blue
              },
              paragraph: {
                spacing: { after: 120 },
              },
            },
            {
              id: 'SenderTitle',
              run: {
                font: 'Calibri',
                size: 24, // 12pt
                italics: true,
                color: '404040', // Dark gray
              },
              paragraph: {
                spacing: { after: 160 },
              },
            },
            {
              id: 'ContactInfo',
              run: {
                font: 'Calibri',
                size: 22, // 11pt
                color: '595959', // Gray
              },
              paragraph: {
                spacing: { after: 40 },
              },
            },
            {
              id: 'DateStyle',
              run: {
                font: 'Calibri',
                size: 22, // 11pt
                color: '595959', // Gray
              },
              paragraph: {
                spacing: { before: 160, after: 240 },
              },
            },
            {
              id: 'RecipientInfo',
              run: {
                font: 'Calibri',
                size: 24, // 12pt
              },
              paragraph: {
                spacing: { after: 40 },
              },
            },
            {
              id: 'Greeting',
              run: {
                font: 'Calibri',
                size: 24, // 12pt
              },
              paragraph: {
                spacing: { after: 240 },
              },
            },
            {
              id: 'BodyText',
              run: {
                font: 'Calibri',
                size: 24, // 12pt
              },
              paragraph: {
                spacing: { after: 240, line: 276 }, // 1.15 spacing
              },
            },
            {
              id: 'Closing',
              run: {
                font: 'Calibri',
                size: 24, // 12pt
              },
              paragraph: {
                spacing: { after: 480 },
              },
            },
            {
              id: 'SignatureName',
              run: {
                font: 'Calibri',
                size: 26, // 13pt
                bold: true,
                color: '2F5496', // Professional blue
              },
              paragraph: {
                spacing: { after: 60 },
              },
            },
            {
              id: 'SignatureTitle',
              run: {
                font: 'Calibri',
                size: 24, // 12pt
                italics: true,
                color: '404040', // Dark gray
              },
              paragraph: {
                spacing: { after: 240 },
              },
            },
          ],
        },
      })

      // Generate Document
      const blob = await Packer.toBlob(doc)
      
      // Create and trigger download
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Cleanup with appropriate delay
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.dismiss(loadingToast)
        toast.success('Professional cover letter downloaded')
      }, 100)
      
      return true
    } catch (error) {
      console.error('Error generating Word document:', error)
      toast.error('Failed to generate Word document')
      return false
    }
  }

  // Helper to download cover letter as text file
  const downloadCoverLetterAsText = async (filename: string, coverLetterContent: GeneratedCoverLetter | null = null) => {
    // Use provided content if available, otherwise use from store
    const coverLetter = coverLetterContent || generatedCoverLetter
    
    if (!coverLetter || !coverLetter.content) {
      toast.error('No cover letter content to download')
      return false
    }
    
    try {
      // Create simplified text content
      let textContent = ''
      
      // Add basic header
      if (userDetails) {
        textContent += `${userDetails.fullName}\n`
        
        const contactInfo = []
        if (userDetails.email) contactInfo.push(userDetails.email)
        if (userDetails.phone) contactInfo.push(userDetails.phone)
        if (userDetails.location) contactInfo.push(userDetails.location)
        
        if (contactInfo.length > 0) {
          textContent += `${contactInfo.join(' | ')}\n`
        }
        
        // Add date
        textContent += `\n${new Date().toLocaleDateString()}\n\n`
      }
      
      // Add cover letter content
      if (coverLetter.content) {
        textContent += coverLetter.content
      }
      
      // Add signature
      textContent += '\n\nSincerely,\n\n'
      textContent += userDetails?.fullName || ''
      
      // Create blob and trigger download immediately
      const blob = new Blob([textContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Clean up with slight delay
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)
      
      return true
    } catch (error) {
      console.error('Error generating text file:', error)
      toast.error('Failed to generate text file')
      return false
    }
  }

  const handleDownloadCoverLetter = async () => {
    setIsPending(true)
    
    try {
      // Show a single loading toast
      const loadingToast = toast.loading('Preparing your cover letter for download...')
      
      // Get current store state
      const store = useCVStore.getState()
      const currentLanguage = store.language || 'en'
      
      // Only regenerate if necessary
      let coverLetterToDownload = store.generatedCoverLetter
      
      if (!coverLetterToDownload) {
        // No cover letter exists, generate one
        coverLetterToDownload = await regenerateCoverLetter({
          language: currentLanguage
        })
        
        if (!coverLetterToDownload) {
          toast.dismiss(loadingToast)
          toast.error('Failed to generate cover letter')
          setIsPending(false)
          return
        }
      }
      
      // Download using the format preference
      const format = downloadFormat || 'docx'
      let success = false
      
      if (format === 'docx') {
        // Download directly as Word document
        success = await downloadCoverLetterAsWord(
          `cover-letter-${currentLanguage}.docx`, 
          coverLetterToDownload
        )
      } else {
        // Download directly as text
        success = await downloadCoverLetterAsText(
          `cover-letter-${currentLanguage}.txt`, 
          coverLetterToDownload
        )
      }
      
      // Clean up and notify
      toast.dismiss(loadingToast)
      
      if (success) {
        toast.success('Cover letter downloaded successfully')
        trackDownload('cover-letter', format)
      } else {
        toast.error('Failed to download cover letter')
      }
    } catch (error) {
      console.error('Error downloading cover letter:', error)
      toast.error('Failed to download cover letter')
    } finally {
      setIsPending(false)
    }
  }

  const handleCopyCV = () => {
    if (!generatedCV) return
    
    let content = ''
    
    if (generatedCV.content) {
      content = generatedCV.content
    } else if (cvContentRef.current) {
      content = cvContentRef.current.innerText
    }
    
    if (content) {
      navigator.clipboard.writeText(content)
      toast.success('Resume copied to clipboard')
    }
  }

  const handleCopyCoverLetter = () => {
    if (!generatedCoverLetter || !generatedCoverLetter.content) return
    
    navigator.clipboard.writeText(generatedCoverLetter.content)
    toast.success('Cover letter copied to clipboard')
  }

  return {
    cvContentRef,
    coverLetterContentRef,
    handleDownloadCV,
    handleDownloadCoverLetter,
    handleCopyCV,
    handleCopyCoverLetter,
    resetGeneratedContent,
    isPending,
    setDownloadFormat,
    downloadFormat
  }
} 