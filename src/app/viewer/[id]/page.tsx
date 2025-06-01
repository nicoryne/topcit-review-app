'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// PDF data mapping
const pdfData = [
  {
    id: '01',
    title: 'Software Development',
    filename: '01-TOPCIT-Software-Development.pdf',
  },
  {
    id: '02',
    title: 'Understanding & Using Data',
    filename: '02-TOPCIT-Understanding-Using-Data.pdf',
  },
  {
    id: '03',
    title: 'Overview of System Architecture',
    filename: '03-TOPCIT-Overview-of-System-Architecture.pdf',
  },
  {
    id: '04',
    title: 'Understanding Information Security',
    filename: '04-TOPCIT-Understanding-Information-Security.pdf',
  },
  {
    id: '05',
    title: 'Understanding the IT Business and Ethics',
    filename: '05-TOPCIT-Understanding-the-IT-Business-and-Ethics.pdf',
  },
  {
    id: '06',
    title: 'Project Management and Technical Communication',
    filename: '06-TOPCIT-Project-Management-and-Technical-Communication.pdf',
  },
]

export default function PDFViewer() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === 'string' ? params.id : params.id?.[0] || ''

  const [isLoading, setIsLoading] = useState(true)

  // Find the current PDF data
  const currentPdf = pdfData.find((pdf) => pdf.id === id)

  // Handle invalid ID
  useEffect(() => {
    if (!currentPdf) {
      router.push('/')
    } else {
      setIsLoading(false)
    }
  }, [currentPdf, router])

  if (isLoading || !currentPdf) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center text-blue-600 dark:text-blue-400 hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">{currentPdf.title}</h1>
          <div className="w-24"></div> {/* Empty div for flex spacing */}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 h-2"></div>

          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              TOPCIT Module {currentPdf.id}: {currentPdf.title}
            </h2>

            <div className="mb-6 flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                View and study this material to prepare for your TOPCIT certification
              </span>
              <a
                href={`/pdfs/${currentPdf.filename}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
              >
                Download PDF
              </a>
            </div>

            {/* PDF Viewer */}
            <div className="w-full aspect-[1/1.4] relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              <iframe
                src={`/pdfs/${currentPdf.filename}`}
                className="absolute inset-0 w-full h-full"
                title={`${currentPdf.title} PDF`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
