'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { parsePDFAndExtractResume } from '@/actions'
import { useCVStore } from '@/store'
import { Upload, FileUp, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function ResumeUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  
  const { 
    setUserDetails, 
    addExperience, 
    addEducation, 
    addSkillCategory,
    addProject
  } = useCVStore()
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please upload a PDF file')
        return
      }
      setFile(selectedFile)
    }
  }
  
  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }
    
    try {
      setIsUploading(true)
      
      // Create FormData to send the file to the server
      const formData = new FormData()
      formData.append('pdfFile', file)
      
      setIsExtracting(true)
      setIsUploading(false)
      
      console.log('Sending PDF to server for parsing and extraction...')
      
      // Call the server action to parse the PDF and extract resume data
      const extractedData = await parsePDFAndExtractResume(formData)
      
      console.log('Received extracted data:', JSON.stringify(extractedData, null, 2))
      
      // Update the store with extracted data
      if (extractedData.userDetails) {
        // Ensure required fields are present
        setUserDetails({
          fullName: extractedData.userDetails.fullName,
          jobTitle: extractedData.userDetails.jobTitle,
          email: extractedData.userDetails.email || '',
          phone: extractedData.userDetails.phone || '',
          location: extractedData.userDetails.location || '',
          summary: extractedData.userDetails.summary || '',
          website: extractedData.userDetails.website,
          linkedin: extractedData.userDetails.linkedin,
          github: extractedData.userDetails.github
        })
      } else {
        console.warn('No user details extracted from PDF')
      }
      
      if (extractedData.experiences && extractedData.experiences.length > 0) {
        console.log(`Adding ${extractedData.experiences.length} experiences`)
        extractedData.experiences.forEach(exp => {
          // Add ID to experience and ensure required fields
          addExperience({
            ...exp,
            id: crypto.randomUUID(),
            location: exp.location || 'Not specified',
            current: exp.current || false
          })
        })
      } else {
        console.warn('No experiences extracted from PDF')
      }
      
      if (extractedData.educations && extractedData.educations.length > 0) {
        console.log(`Adding ${extractedData.educations.length} educations`)
        extractedData.educations.forEach(edu => {
          // Add ID to education and ensure required fields
          addEducation({
            ...edu,
            id: crypto.randomUUID(),
            location: edu.location || 'Not specified',
            current: edu.current || false
          })
        })
      } else {
        console.warn('No educations extracted from PDF')
      }
      
      if (extractedData.projects && extractedData.projects.length > 0) {
        console.log(`Adding ${extractedData.projects.length} projects`)
        // Add projects to the store
        extractedData.projects.forEach(project => {
          addProject({
            ...project,
            id: crypto.randomUUID(),
            startDate: project.startDate || 'Not specified',
            endDate: project.endDate || 'Present',
            technologies: project.technologies || [],
            url: project.url || 'Not available'
          })
        })
      } else {
        console.warn('No projects extracted from PDF')
      }
      
      if (extractedData.skills && extractedData.skills.length > 0) {
        console.log(`Adding ${extractedData.skills.length} skills`)
        // Group skills into a single category
        addSkillCategory({
          id: crypto.randomUUID(),
          name: 'Extracted Skills',
          skills: extractedData.skills
        })
      } else {
        console.warn('No skills extracted from PDF')
      }
      
      toast.success('Resume information extracted successfully')
      setFile(null)
      
      // Reset the file input
      const fileInput = document.getElementById('resume-upload') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    } catch (error) {
      console.error('Error processing PDF:', error)
      
      // Provide more specific error messages based on the error
      if (error instanceof Error) {
        if (error.message.includes('API Error')) {
          toast.error('Error communicating with AI service. Please try again later.')
        } else if (error.message.includes('validation')) {
          toast.error('Error validating extracted data. The PDF might not contain all required information.')
        } else if (error.message.includes('very little text')) {
          toast.error('The PDF contains very little text. It might be scanned or protected.')
        } else {
          toast.error(`Failed to extract information: ${error.message}`)
        }
      } else {
        toast.error('Failed to extract information from the PDF')
      }
    } finally {
      setIsUploading(false)
      setIsExtracting(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload Resume
        </CardTitle>
        <CardDescription>
          Upload your existing resume to automatically fill in your details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="resume-upload">Resume PDF</Label>
            <Input
              id="resume-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isUploading || isExtracting}
            />
          </div>
          {file && (
            <Alert>
              <FileUp className="h-4 w-4" />
              <AlertTitle>Ready to upload</AlertTitle>
              <AlertDescription>
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setFile(null)
            const fileInput = document.getElementById('resume-upload') as HTMLInputElement
            if (fileInput) {
              fileInput.value = ''
            }
          }}
          disabled={!file || isUploading || isExtracting}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleUpload} 
          disabled={!file || isUploading || isExtracting}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : isExtracting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Extracting...
            </>
          ) : (
            'Extract Information'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 