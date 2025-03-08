import { useRef, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useCVStore } from '@/store'

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
    resetGeneratedContent 
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

  const handleDownloadCV = async () => {
    if (!generatedCV) return
    
    // Try to download as PDF first - strictly limit to 1 page
    const pdfSuccess = await downloadAsPDF('resume-pdf-content', 'resume.pdf', 1)
    
    // Fall back to text if PDF fails or if we just have raw content
    if (!pdfSuccess) {
      let content = ''
      
      if (generatedCV.content) {
        content = generatedCV.content
      } else if (generatedCV.sections) {
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
    
    toast.success('Resume downloaded')
  }

  const handleDownloadCoverLetter = async () => {
    if (!generatedCoverLetter || !generatedCoverLetter.content) return
    
    // Try to download as PDF first - no page limit needed for cover letter
    const pdfSuccess = await downloadAsPDF('cover-letter-pdf-content', 'cover-letter.pdf')
    
    // Fall back to text if PDF fails
    if (!pdfSuccess) {
      downloadTextFile(generatedCoverLetter.content, 'cover-letter.txt')
    }
    
    toast.success('Cover letter downloaded')
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