import { Metadata } from 'next'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { FileText, Briefcase, CheckCircle, Sparkles } from 'lucide-react'
import { AnimatedButton } from '@/components/ui/animated-button'

export const metadata: Metadata = {
  title: 'CV & Cover Letter Generator | Create ATS-Friendly Documents',
  description: 'Generate tailored resumes and cover letters that match job descriptions and highlight your relevant skills and experience.',
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
            <div className="flex-1 space-y-8 text-center md:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5 mr-2" />
                <span>AI-Powered CV & Cover Letter Generator</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  Land Your Dream Job with the Perfect Application
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Our AI-powered tool creates tailored resumes and cover letters that match job descriptions and highlight your relevant skills and experience.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center md:justify-start">
                <AnimatedButton href="/cv" size="lg">
                  Get Started
                </AnimatedButton>
                <Button variant="outline" size="lg" asChild>
                  <a href="#how-it-works">
                    Learn More
                  </a>
                </Button>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className="relative w-full aspect-square md:aspect-[4/3] overflow-hidden rounded-xl shadow-xl">
        <Image
                  src="https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Professional workspace with laptop and resume"
                  fill
          priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30 relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 max-w-3xl mx-auto">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
              <span>Key Features</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Why Choose Our CV Builder
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Our tools help you create professional documents tailored to each job application.
            </p>
          </div>
          
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
            <div className="group flex flex-col items-center space-y-4 text-center rounded-lg p-6 transition-all hover:bg-primary/5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">ATS-Friendly Resumes</h3>
                <p className="text-muted-foreground">
                  Create resumes that pass through Applicant Tracking Systems with optimized keywords and formatting.
                </p>
              </div>
            </div>
            
            <div className="group flex flex-col items-center space-y-4 text-center rounded-lg p-6 transition-all hover:bg-primary/5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Job-Tailored Content</h3>
                <p className="text-muted-foreground">
                  Match your skills and experience to job descriptions for higher relevance and impact.
                </p>
              </div>
            </div>
            
            <div className="group flex flex-col items-center space-y-4 text-center rounded-lg p-6 transition-all hover:bg-primary/5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Professional Results</h3>
                <p className="text-muted-foreground">
                  Get polished, professional documents that make a strong impression on potential employers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 max-w-3xl mx-auto">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
              <span>Simple Process</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Three simple steps to create your tailored resume and cover letter.
            </p>
          </div>
          
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            
            <div className="flex flex-col items-center space-y-4 text-center relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl relative z-10">
                1
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Enter Your Details</h3>
                <p className="text-muted-foreground">
                  Add your personal information, work experience, education, and skills.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-4 text-center relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl relative z-10">
                2
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Paste Job Description</h3>
                <p className="text-muted-foreground">
                  Add the job description to tailor your documents to the specific role.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-4 text-center relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl relative z-10">
                3
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Generate & Download</h3>
                <p className="text-muted-foreground">
                  Get your tailored resume and cover letter ready to send to employers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-3xl mx-auto">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Land Your Dream Job?
              </h2>
              <p className="mx-auto max-w-[700px] md:text-xl opacity-90">
                Create your tailored resume and cover letter in minutes.
              </p>
            </div>
            <AnimatedButton href="/cv" variant="secondary" size="lg">
              Get Started Now
            </AnimatedButton>
          </div>
        </div>
      </section>
    </div>
  )
}
