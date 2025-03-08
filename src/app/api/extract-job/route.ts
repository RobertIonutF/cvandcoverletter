import { NextResponse } from 'next/server'
import { z } from 'zod'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Schema for the request body
const requestSchema = z.object({
  url: z.string().url({ message: 'Please provide a valid URL' }),
})

export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    const body = await request.json()
    const { url } = requestSchema.parse(body)

    // Fetch the content from the job posting URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.statusText}` },
        { status: 400 }
      )
    }

    // Get HTML content
    const html = await response.text()

    // Use OpenAI to extract the relevant job information
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert at extracting job posting information. Extract all relevant details from the HTML content of a job posting webpage.`
        },
        {
          role: 'user',
          content: `Extract the following information from this job posting HTML:
          
          1. Job title
          2. Company name
          3. Location (remote/onsite/hybrid and city/country if available)
          4. Required skills and qualifications
          5. Job responsibilities
          6. Company description
          7. Salary information (if available)
          8. Benefits (if available)
          
          Format the information into a comprehensive and detailed job description that's ready to be used for resume and cover letter tailoring.
          
          HTML content:
          ${html.slice(0, 150000)} // Limit the content to avoid token issues
          `
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    })

    const extractedContent = aiResponse.choices[0]?.message?.content

    if (!extractedContent) {
      return NextResponse.json(
        { error: 'Failed to extract job information' },
        { status: 500 }
      )
    }

    // Return the extracted information
    return NextResponse.json({
      success: true,
      jobDescription: extractedContent
    })
  } catch (error) {
    console.error('Error extracting job information:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to extract job information' },
      { status: 500 }
    )
  }
} 