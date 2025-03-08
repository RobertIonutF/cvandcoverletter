import { FileText, Briefcase, CheckCircle, Users, Award, Zap } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">About CV Builder</h1>
          <p className="text-xl text-muted-foreground">
            Our mission is to help job seekers create professional, tailored documents that stand out to employers.
          </p>
        </div>

        <div className="grid gap-12">
          <section>
            <h2 className="text-2xl font-bold mb-6">Our Story</h2>
            <p className="text-muted-foreground mb-4">
              CV Builder was created by a team of career experts and developers who recognized a common challenge: 
              job seekers struggle to create resumes and cover letters that effectively showcase their skills and 
              experience in a way that resonates with employers and passes through Applicant Tracking Systems (ATS).
            </p>
            <p className="text-muted-foreground mb-4">
              We built this tool to leverage the power of AI to analyze job descriptions and create tailored documents 
              that highlight the most relevant qualifications for each position. Our goal is to help job seekers 
              increase their chances of landing interviews and ultimately securing their dream jobs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">What Sets Us Apart</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">AI-Powered Analysis</h3>
                  <p className="text-muted-foreground">
                    Our tool analyzes job descriptions to identify key requirements and keywords, ensuring your 
                    documents are tailored to each position.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">ATS-Friendly Formatting</h3>
                  <p className="text-muted-foreground">
                    We ensure your resume uses formatting that passes through Applicant Tracking Systems, 
                    increasing your chances of reaching human recruiters.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Industry Expertise</h3>
                  <p className="text-muted-foreground">
                    Our team includes career coaches and industry professionals who understand what employers 
                    are looking for in different fields.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Personalized Results</h3>
                  <p className="text-muted-foreground">
                    Unlike generic templates, our tool creates truly personalized documents that highlight 
                    your unique qualifications for each position.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Our Team</h2>
            <p className="text-muted-foreground mb-8">
              CV Builder was created by a passionate team of career experts, developers, and designers 
              committed to helping job seekers succeed in their career journeys.
            </p>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium">Career Experts</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Professionals with years of experience in recruitment and career coaching
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium">AI Specialists</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Experts in natural language processing and machine learning
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium">UX Designers</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Focused on creating an intuitive and seamless user experience
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Our Commitment</h2>
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground">
                  We&apos;re committed to continuously improving our tools based on user feedback and the latest 
                  industry trends. Our goal is to provide the most effective resources to help you succeed 
                  in your job search and career advancement.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 