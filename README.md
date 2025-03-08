# CV & Cover Letter Generator

An AI-powered tool for creating tailored, ATS-optimized resumes and cover letters that match job descriptions and highlight your relevant experience.

## Features

- **AI-Driven Content Generation**: Creates customized resumes and cover letters based on your profile and target job descriptions
- **ATS Optimization**: Ensures your documents pass through Applicant Tracking Systems with proper formatting and keywords
- **Single-Page CV Format**: Professionally formatted resume that fits on a single page with all your key information
- **PDF Downloads**: Generate professional PDFs ready to submit to employers
- **Dark Mode Support**: Comfortable UI for day and night use
- **Data Persistence**: Your profile data is saved between sessions
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cvandcoverletter.git
   cd cvandcoverletter
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## How to Use

### Step 1: Enter Your Personal Information

In the "Details" tab:
- Fill in your name, job title, contact information, and professional summary
- Be thorough—this information will be used to generate your documents

### Step 2: Add Your Experience

In the "Experience" tab:
- Click "Add Experience" for each position
- Include job title, company name, dates, and detailed descriptions
- Emphasize achievements with numbers and metrics when possible

### Step 3: Add Your Education

In the "Education" tab:
- Add degrees, certifications, and other educational achievements
- Include institution names, graduation dates, and relevant details

### Step 4: List Your Projects (Optional)

In the "Projects" tab:
- Add relevant projects that showcase your skills
- Include project names, descriptions, and technologies used

### Step 5: Enter Your Skills

In the "Skills" tab:
- Organize skills by category
- Include both technical and soft skills relevant to your target roles

### Step 6: Enter a Job Description

In the middle panel:
- Paste the complete job description for your target position
- The more detailed the job description, the better tailored your documents will be

### Step 7: Generate Your Documents

- Click the "Generate" button in the job description panel
- The system will create both a resume and cover letter based on your profile and the job description
- Review both documents in the preview panels

### Step 8: Download and Use

- Use the download button to save your resume and cover letter as PDFs
- Use the copy button to copy the text to your clipboard
- Submit these documents with your job application

## Technology Stack

- **Framework**: Next.js (App Router)
- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI, Radix UI
- **State Management**: Zustand
- **PDF Generation**: html2pdf.js
- **AI Integration**: OpenAI GPT-4

## Advanced Configuration

### Customizing PDF Output

The PDF generation is handled in `src/hooks/useDocumentActions.ts`. You can customize:
- Page size and margins
- Font family and sizes
- Element spacing

### Customizing AI Prompts

The prompts used for generating content are in `src/actions/index.ts`. You can modify these to change how the AI generates your resume and cover letter.

## Troubleshooting

### PDF Generation Issues

If you encounter problems with PDF generation:
- Make sure html2pdf.js is properly installed
- Check that your browser allows downloading files
- Try using a different browser if issues persist

### AI Generation Issues

If the AI-generated content isn't satisfactory:
- Provide more detailed information in your profile
- Use more specific and detailed job descriptions
- Try regenerating the content for different results

## Building for Production

```bash
npm run build
# or
yarn build
```

To start the production server:
```bash
npm start
# or
yarn start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [OpenAI](https://openai.com/) for providing the AI capabilities
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful component library
- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) for PDF generation
- [Zustand](https://github.com/pmndrs/zustand) for state management
- [Next.js](https://nextjs.org/) for the React framework

---

Made with ❤️ to help job seekers land their dream positions
