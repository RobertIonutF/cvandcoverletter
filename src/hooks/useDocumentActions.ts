import { useRef, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useCVStore } from '@/store'
import { 
  Document, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  BorderStyle, 
  ExternalHyperlink, 
  Packer
} from 'docx'

interface PDFOptions {
  margin: number[]
  filename: string
  image: { type: string; quality: number }
  html2canvas: { 
    scale: number
    useCORS: boolean
    letterRendering: boolean
    logging: boolean
  }
  jsPDF: { 
    unit: string
    format: string
    orientation: string
    compress: boolean
    precision: number
  }
  pagebreak?: { mode: string[], before?: string[] }
  maxPages?: number
}

// Define a type for the html2pdf module instance
type Html2PdfInstance = {
  from: (element: HTMLElement) => Html2PdfInstance
  set: (options: PDFOptions) => Html2PdfInstance
  save: () => Promise<void>
  toPdf: () => unknown
}

// Define a type for the html2pdf module factory function
type Html2PdfFactory = () => Html2PdfInstance

export function useDocumentActions() {
  const cvContentRef = useRef<HTMLDivElement>(null)
  const coverLetterContentRef = useRef<HTMLDivElement>(null)
  const [html2pdfModule, setHtml2pdfModule] = useState<Html2PdfFactory | null>(null)
  
  const { 
    generatedCV, 
    generatedCoverLetter,
    resetGeneratedContent,
    userDetails,
    experiences,
    educations,
    skillCategories,
    projects
  } = useCVStore()
  
  // Only load html2pdf on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Dynamically import html2pdf only on client side
      import('html2pdf.js')
        .then(module => {
          setHtml2pdfModule(() => module.default as Html2PdfFactory)
        })
        .catch(err => {
          console.error('Failed to load html2pdf:', err)
        })
    }
  }, [])
  
  // Helper to download content as a PDF file
  const downloadAsPDF = async (elementId: string, filename: string, maxPages: number | null = null) => {
    // Make sure we're on the client side
    if (typeof window === 'undefined') {
      return false
    }
    
    // Check if html2pdf is loaded
    if (!html2pdfModule) {
      toast.error('PDF generation library not available')
      return false
    }
    
    const element = document.getElementById(elementId)
    if (!element) {
      toast.error('Could not find the content to download')
      return false
    }

    // Show loading toast
    const loadingToast = toast.loading('Generating PDF...')

    try {
      // Create a clean wrapper div
      const wrapper = document.createElement('div')
      wrapper.style.width = '8.5in'
      wrapper.style.margin = '0'
      wrapper.style.padding = '0'
      wrapper.style.position = 'absolute'
      wrapper.style.left = '-9999px'
      wrapper.style.top = '0'
      
      // Clone the content
      const content = element.cloneNode(true) as HTMLElement
      
      // Reset any transforms or scaling that might affect page breaks
      content.style.transform = 'none'
      content.style.transformOrigin = '0 0'
      content.style.width = '8.5in'
      content.style.margin = '0'
      content.style.padding = '0.2in'
      content.style.boxSizing = 'border-box'
      
      // Append content to wrapper
      wrapper.appendChild(content)
      
      // Add wrapper to document
      document.body.appendChild(wrapper)
      
      // Add styling
      const styleElement = document.createElement('style')
      styleElement.textContent = `
        body {
          margin: 0;
          padding: 0;
        }
        @page {
          size: letter;
          margin: 0;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        #${elementId} {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        body, p, div, h1, h2, h3, span, li {
          color: black !important;
          background: white !important;
          line-height: 1.2 !important;
          font-family: 'Calibri', 'Segoe UI', Arial, sans-serif !important;
        }
        p, div, span, li { 
          font-size: 9pt !important; 
          margin-bottom: 0.05in !important;
        }
        h1 { 
          font-size: 14pt !important; 
          font-weight: bold !important; 
          margin: 0 0 0.1in 0 !important;
        }
        h2 { 
          font-size: 11pt !important; 
          font-weight: bold !important; 
          margin: 0.05in 0 !important;
          padding-bottom: 0.03in !important;
          text-transform: uppercase !important;
        }
        h3 { 
          font-size: 10pt !important; 
          font-weight: bold !important; 
          margin: 0 !important;
        }
        section {
          margin-bottom: 0.1in !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
        header {
          margin-bottom: 0.08in !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
        .contact-info {
          display: flex !important;
          flex-wrap: wrap !important;
          justify-content: center !important;
          gap: 4px !important;
          font-size: 8pt !important;
        }
        .experience-item, .education-item {
          margin-bottom: 0.08in !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
        .skill-tag {
          color: #1a56db !important;
          background-color: #e1effe !important;
          border: 1px solid #93c5fd !important;
          padding: 1px 4px !important;
          border-radius: 3px !important;
          display: inline-block !important;
          margin: 1px !important;
          font-size: 8pt !important;
        }
        .project-item {
          border: 1px solid #e5e7eb !important;
          background-color: #f9fafb !important;
          padding: 4px !important;
          margin-bottom: 4px !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
        a {
          color: #1a56db !important;
          text-decoration: none !important;
        }
        ul, ol {
          margin: 0.03in 0 !important;
          padding-left: 0.15in !important;
        }
        li {
          margin-bottom: 0.02in !important;
        }
      `
      wrapper.appendChild(styleElement)
      
      // Configure html2pdf options with single page layout
      const opt: PDFOptions = {
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: { 
          unit: 'in',
          format: 'letter', 
          orientation: 'portrait',
          compress: true,
          precision: 4
        },
        // Ensure single page
        pagebreak: { mode: ['avoid-all', 'css'] },
        margin: [0, 0, 0, 0]
      }
      
      // Set max pages to 1 to enforce single page
      if (maxPages === 1) {
        opt.maxPages = 1
      }
      
      // Generate and download the PDF
      await html2pdfModule()
        .set(opt)
        .from(content)
        .save()
      
      // Clean up
      document.body.removeChild(wrapper)
      toast.dismiss(loadingToast)
      return true
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast)
      toast.error('Could not generate PDF. Trying alternate format...')
      return false
    }
  }

  // Helper to download content as a text file (fallback)
  const downloadTextFile = (content: string, filename: string) => {
    const element = document.createElement('a')
    const file = new Blob([content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    return true
  }

  // Helper to download content as a Word document
  const downloadAsWord = async (filename: string) => {
    if (typeof window === 'undefined') {
      return false
    }
    
    if (!generatedCV) {
      toast.error('No resume content to download')
      return false
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading('Generating Word document...')

      // Create sections for the document
      const docSections = []

      // Header with name and job title
      if (userDetails) {
        docSections.push(
          new Paragraph({
            text: userDetails.fullName,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          })
        )

        if (userDetails.jobTitle) {
          docSections.push(
            new Paragraph({
              text: userDetails.jobTitle,
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            })
          )
        }

        // Contact info in a single line
        const contactInfo = []
        if (userDetails.email) contactInfo.push(userDetails.email)
        if (userDetails.phone) contactInfo.push(userDetails.phone)
        if (userDetails.location) contactInfo.push(userDetails.location)

        if (contactInfo.length > 0) {
          docSections.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: contactInfo.map((info, index) => {
                if (index < contactInfo.length - 1) {
                  return [new TextRun(info), new TextRun(' | ')];
                }
                return [new TextRun(info)];
              }).flat(),
            })
          )
        }

        // Online profiles
        const onlineProfiles = []
        if (userDetails.linkedin) onlineProfiles.push({ text: 'LinkedIn', url: userDetails.linkedin })
        if (userDetails.github) onlineProfiles.push({ text: 'GitHub', url: userDetails.github })
        if (userDetails.website) onlineProfiles.push({ text: 'Website', url: userDetails.website })

        if (onlineProfiles.length > 0) {
          docSections.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
              children: onlineProfiles.map((profile, index) => {
                const link = new ExternalHyperlink({
                  children: [new TextRun({ text: profile.text, style: 'Hyperlink' })],
                  link: profile.url,
                });
                
                if (index < onlineProfiles.length - 1) {
                  return [link, new TextRun(' | ')];
                }
                return [link];
              }).flat(),
            })
          )
        }
      }

      // Summary
      if (userDetails?.summary) {
        docSections.push(
          new Paragraph({
            text: 'SUMMARY',
            heading: HeadingLevel.HEADING_2,
          })
        )

        docSections.push(
          new Paragraph({
            text: userDetails.summary,
            spacing: { after: 200 },
          })
        )
      }

      // Work Experience
      if (experiences && experiences.length > 0) {
        docSections.push(
          new Paragraph({
            text: 'EXPERIENCE',
            heading: HeadingLevel.HEADING_2,
          })
        )

        experiences.forEach((exp) => {
          // Job Title and Company
          docSections.push(
            new Paragraph({
              spacing: { before: 160 },
              children: [
                new TextRun({
                  text: `${exp.jobTitle} | `,
                  bold: true,
                }),
                new TextRun({
                  text: exp.company,
                  bold: true,
                }),
              ],
            })
          )

          // Location and Date
          const dateRange = exp.current
            ? `${exp.startDate} - Present`
            : `${exp.startDate} - ${exp.endDate || ''}`;

          docSections.push(
            new Paragraph({
              spacing: { before: 60, after: 120 },
              children: [
                new TextRun({
                  text: `${exp.location} | ${dateRange}`,
                  italics: true,
                }),
              ],
            })
          )

          // Description - split by newlines to ensure proper paragraphs
          const descLines = exp.description.split('\n').filter(line => line.trim().length > 0)
          
          descLines.forEach(line => {
            docSections.push(
              new Paragraph({
                text: line,
                spacing: { after: 100 },
              })
            )
          })
        })
      }

      // Education
      if (educations && educations.length > 0) {
        docSections.push(
          new Paragraph({
            text: 'EDUCATION',
            heading: HeadingLevel.HEADING_2,
          })
        )

        educations.forEach((edu) => {
          // Degree and Institution
          docSections.push(
            new Paragraph({
              spacing: { before: 160 },
              children: [
                new TextRun({
                  text: `${edu.degree} | `,
                  bold: true,
                }),
                new TextRun({
                  text: edu.institution,
                  bold: true,
                }),
              ],
            })
          )

          // Location and Date
          const dateRange = edu.current
            ? `${edu.startDate} - Present`
            : `${edu.startDate} - ${edu.endDate || ''}`;

          docSections.push(
            new Paragraph({
              spacing: { before: 60, after: 120 },
              children: [
                new TextRun({
                  text: `${edu.location} | ${dateRange}`,
                  italics: true,
                }),
              ],
            })
          )

          // Description if available
          if (edu.description) {
            docSections.push(
              new Paragraph({
                text: edu.description,
                spacing: { after: 100 },
              })
            )
          }
        })
      }

      // Skills
      if (skillCategories && skillCategories.length > 0) {
        docSections.push(
          new Paragraph({
            text: 'SKILLS',
            heading: HeadingLevel.HEADING_2,
          })
        )

        skillCategories.forEach((category) => {
          if (category.skills.length === 0) return

          docSections.push(
            new Paragraph({
              spacing: { before: 120 },
              children: [
                new TextRun({
                  text: `${category.name}: `,
                  bold: true,
                }),
                new TextRun(category.skills.join(', ')),
              ],
            })
          )
        })
      }

      // Projects
      if (projects && projects.length > 0) {
        docSections.push(
          new Paragraph({
            text: 'PROJECTS',
            heading: HeadingLevel.HEADING_2,
          })
        )

        projects.forEach((project) => {
          // Project Name
          docSections.push(
            new Paragraph({
              spacing: { before: 160 },
              children: [
                new TextRun({
                  text: project.name,
                  bold: true,
                }),
              ],
            })
          )

          // Description
          docSections.push(
            new Paragraph({
              text: project.description,
              spacing: { after: 60 },
            })
          )

          // Technologies
          if (project.technologies && project.technologies.length > 0) {
            docSections.push(
              new Paragraph({
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: 'Technologies: ',
                    bold: true,
                  }),
                  new TextRun(project.technologies.join(', ')),
                ],
              })
            )
          }
        })
      }

      // Create a new document
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 720, // 0.5 inch (720 twips)
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: docSections,
        }],
        styles: {
          default: {
            document: {
              run: {
                font: 'Calibri',
                size: 22, // 11pt
              },
              paragraph: {
                spacing: { line: 276 }, // 1.15 line spacing
              },
            },
            heading1: {
              run: {
                font: 'Calibri',
                size: 28, // 14pt
                bold: true,
              },
              paragraph: {
                spacing: { after: 120 }, // 6pt after
              },
            },
            heading2: {
              run: {
                font: 'Calibri',
                size: 24, // 12pt
                bold: true,
                color: '2E74B5', // Blue for sections
              },
              paragraph: {
                spacing: { before: 240, after: 120 }, // 12pt before, 6pt after
                border: {
                  bottom: {
                    color: '2E74B5',
                    size: 1,
                    style: BorderStyle.SINGLE,
                  },
                },
              },
            },
          },
        },
      })

      // Create a blob from the document
      const buffer = await Packer.toBlob(doc)
      
      // Create a download link
      const link = document.createElement('a')
      link.href = URL.createObjectURL(buffer)
      link.download = filename
      
      // Add to body and click (needed for Firefox)
      document.body.appendChild(link)
      
      // Use setTimeout to ensure the link is properly processed by the browser
      setTimeout(() => {
        link.click()
        
        // Clean up
        document.body.removeChild(link)
        // Release the object URL to free memory
        setTimeout(() => URL.revokeObjectURL(link.href), 100)
        
        toast.dismiss(loadingToast)
      }, 0)
      
      return true
    } catch (error) {
      console.error('Error generating Word document:', error)
      toast.error('Could not generate Word document. Trying alternate format...')
      return false
    }
  }

  const handleDownloadCV = async () => {
    if (!generatedCV) return
    
    try {
      // Download as Word document
      const wordSuccess = await downloadAsWord('resume.docx')
      
      if (wordSuccess) {
        toast.success('Resume downloaded as Word document')
      } else {
        // Fall back to PDF if Word fails
        toast.info('Trying PDF format instead...')
        const pdfSuccess = await downloadAsPDF('resume-pdf-content', 'resume.pdf', 1)
        
        if (pdfSuccess) {
          toast.success('Resume downloaded as PDF')
        } else {
          // Fall back to text as last resort
          await fallbackToText()
          toast.success('Resume downloaded as text file')
        }
      }
    } catch (error) {
      console.error('Error downloading resume:', error)
      toast.error('Failed to download resume. Please try again.')
    }
  }

  // Helper function for text fallback
  const fallbackToText = async () => {
    let content = ''
    
    if (generatedCV?.content) {
      content = generatedCV.content
    } else if (generatedCV?.sections) {
      // Format structured sections into text
      const sections = generatedCV.sections
      
      // Add header
      content += 'RESUME\n\n'
      
      // Add summary
      if (sections.summary) {
        content += 'SUMMARY\n'
        content += sections.summary + '\n\n'
      }
      
      // Add experience
      if (sections.experience && sections.experience.length > 0) {
        content += 'EXPERIENCE\n'
        sections.experience.forEach(exp => {
          content += `${exp.title} at ${exp.company} (${exp.period})\n`
          content += exp.description + '\n\n'
        })
      }
      
      // Add education
      if (sections.education && sections.education.length > 0) {
        content += 'EDUCATION\n'
        sections.education.forEach(edu => {
          content += `${edu.degree} - ${edu.institution} (${edu.period})\n`
        })
        content += '\n'
      }
      
      // Add skills
      if (sections.skills && sections.skills.length > 0) {
        content += 'SKILLS\n'
        content += sections.skills.join(', ') + '\n\n'
      }
      
      // Add projects
      if (sections.projects && sections.projects.length > 0) {
        content += 'PROJECTS\n'
        sections.projects.forEach(project => {
          content += `${project.name}\n`
          content += project.description + '\n'
          if (project.technologies && project.technologies.length > 0) {
            content += `Technologies: ${project.technologies.join(', ')}\n`
          }
          content += '\n'
        })
      }
    }
    
    if (content) {
      downloadTextFile(content, 'resume.txt')
    }
  }

  // Helper to download cover letter as a Word document
  const downloadCoverLetterAsWord = async (filename: string) => {
    if (typeof window === 'undefined') {
      return false
    }
    
    if (!generatedCoverLetter || !generatedCoverLetter.content) {
      toast.error('No cover letter content to download')
      return false
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading('Generating Word document...')

      // Create a new document
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch (1440 twips)
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: [
            // User details at the top
            ...(userDetails ? [
              // User's name
              new Paragraph({
                text: userDetails.fullName,
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 120 },
              }),
              
              // Contact info
              new Paragraph({
                children: [
                  new TextRun({
                    text: [
                      userDetails.email,
                      userDetails.phone,
                      userDetails.location
                    ].filter(Boolean).join(' | '),
                    size: 20, // 10pt
                  })
                ],
                spacing: { after: 240 },
              }),
              
              // Date
              new Paragraph({
                text: new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }),
                spacing: { after: 240 },
              }),
              
              // Spacing before content
              new Paragraph({
                text: '',
                spacing: { after: 240 },
              }),
            ] : []),
            
            // Cover Letter Content - format with proper paragraphs
            ...generatedCoverLetter.content.split('\n\n')
              .filter(para => para.trim().length > 0)
              .map(para => new Paragraph({
                text: para,
                spacing: { after: 240 },
              })),
              
            // Signature
            new Paragraph({
              text: 'Sincerely,',
              spacing: { after: 360 },
            }),
            
            new Paragraph({
              text: userDetails?.fullName || '',
            }),
          ],
        }],
        styles: {
          default: {
            document: {
              run: {
                font: 'Calibri',
                size: 24, // 12pt
              },
              paragraph: {
                spacing: { line: 360 }, // 1.5 line spacing
              },
            },
            heading1: {
              run: {
                font: 'Calibri',
                size: 28, // 14pt
                bold: true,
              },
            },
          },
        },
      })

      // Create a blob from the document
      const buffer = await Packer.toBlob(doc)
      
      // Create a download link
      const link = document.createElement('a')
      link.href = URL.createObjectURL(buffer)
      link.download = filename
      
      // Add to body and click (needed for Firefox)
      document.body.appendChild(link)
      
      // Use setTimeout to ensure the link is properly processed by the browser
      setTimeout(() => {
        link.click()
        
        // Clean up
        document.body.removeChild(link)
        // Release the object URL to free memory
        setTimeout(() => URL.revokeObjectURL(link.href), 100)
        
        toast.dismiss(loadingToast)
      }, 0)
      
      return true
    } catch (error) {
      console.error('Error generating cover letter Word document:', error)
      toast.error('Could not generate Word document. Trying alternate format...')
      return false
    }
  }

  const handleDownloadCoverLetter = async () => {
    if (!generatedCoverLetter || !generatedCoverLetter.content) return
    
    try {
      // Download as Word document
      const wordSuccess = await downloadCoverLetterAsWord('cover-letter.docx')
      
      if (wordSuccess) {
        toast.success('Cover letter downloaded as Word document')
      } else {
        // Fall back to PDF if Word fails
        toast.info('Trying PDF format instead...')
        const pdfSuccess = await downloadAsPDF('cover-letter-pdf-content', 'cover-letter.pdf')
        
        if (pdfSuccess) {
          toast.success('Cover letter downloaded as PDF')
        } else {
          // Fall back to text as last resort
          downloadTextFile(generatedCoverLetter.content, 'cover-letter.txt')
          toast.success('Cover letter downloaded as text file')
        }
      }
    } catch (error) {
      console.error('Error downloading cover letter:', error)
      toast.error('Failed to download cover letter. Please try again.')
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
    resetGeneratedContent
  }
} 