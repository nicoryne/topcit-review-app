import Link from 'next/link'
import Image from 'next/image'

const pdfList = [
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

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">TOPCIT Reviewer</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Master the TOPCIT certification with interactive study materials and quizzes
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/quiz"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              Practice Quizzes
            </Link>
            <a
              href="#study-materials"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-800 text-white hover:bg-blue-700 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Study Materials
            </a>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-16">
        <div id="study-materials" className="mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-gray-800 dark:text-white">Study Materials</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive resources for all TOPCIT certification modules
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pdfList.map((pdf) => (
              <Link
                href={`/viewer/${pdf.id}`}
                key={pdf.id}
                className="transform transition-all duration-300 hover:scale-105"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full border border-gray-200 dark:border-gray-700 hover:shadow-xl">
                  <div className="bg-blue-600 h-2"></div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4 shadow-md">
                        <Image src="/file.svg" alt="PDF Icon" width={24} height={24} className="dark:invert" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          TOPCIT Module {pdf.id}
                        </span>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{pdf.title}</h2>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between items-center">
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">View material</span>
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs py-1 px-2 rounded-full">
                        PDF
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quiz section preview */}
        <div className="mt-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Test Your Knowledge</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Challenge yourself with our interactive quizzes designed to help you prepare for the TOPCIT
                certification. Track your progress and identify areas for improvement.
              </p>
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-all duration-300 shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Start Quizzes
              </Link>
            </div>
            <div className="md:w-1/2 bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold text-gray-800 dark:text-white">Available Quiz Categories</h3>
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs py-1 px-2 rounded-full">
                  {pdfList.length} Modules
                </span>
              </div>
              <ul className="space-y-3">
                {pdfList.map((pdf) => (
                  <li key={pdf.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-bold mr-3">
                        {pdf.id}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">{pdf.title}</span>
                    </div>
                    <Link href={`/quiz/${pdf.id}`} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                      Take Quiz
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Learning Games section */}
        <div className="mt-20 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Interactive Learning Games</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Make your TOPCIT preparation more engaging with our interactive learning games. 
              Different game formats help reinforce concepts in a fun and memorable way.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Time Attack Game */}
            <Link href="/games/timeattack" className="group">
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Time Attack</h3>
                  <p className="text-gray-600 dark:text-gray-300">Race against the clock to answer as many questions as possible before time runs out.</p>
                  <div className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium group-hover:underline">Play Now →</div>
                </div>
              </div>
            </Link>

            {/* Fill in the Blank Game */}
            <Link href="/games/fillinblank" className="group">
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Fill in the Blank</h3>
                  <p className="text-gray-600 dark:text-gray-300">Complete sentences by filling in missing key terms to test your knowledge of concepts.</p>
                  <div className="mt-4 text-blue-600 dark:text-blue-400 font-medium group-hover:underline">Play Now →</div>
                </div>
              </div>
            </Link>

            {/* Flashcards Game */}
            <Link href="/games/flashcards" className="group">
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Flashcards</h3>
                  <p className="text-gray-600 dark:text-gray-300">Review key terms and concepts with interactive flashcards for efficient memorization.</p>
                  <div className="mt-4 text-green-600 dark:text-green-400 font-medium group-hover:underline">Play Now →</div>
                </div>
              </div>
            </Link>

            {/* Matching Game */}
            <Link href="/games/matching" className="group">
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Matching Game</h3>
                  <p className="text-gray-600 dark:text-gray-300">Match related terms and concepts to reinforce your understanding of relationships.</p>
                  <div className="mt-4 text-yellow-600 dark:text-yellow-400 font-medium group-hover:underline">Play Now →</div>
                </div>
              </div>
            </Link>

            {/* Code Snippets Challenge */}
            <Link href="/games/codesnippets" className="group">
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Code Snippets</h3>
                  <p className="text-gray-600 dark:text-gray-300">Test your programming knowledge by analyzing and answering questions about code snippets.</p>
                  <div className="mt-4 text-pink-600 dark:text-pink-400 font-medium group-hover:underline">Play Now →</div>
                </div>
              </div>
            </Link>

            {/* All Games Link */}
            <Link href="/games" className="group">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-700 dark:to-indigo-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">View All Games</h3>
                  <p className="text-white/80">Explore all our interactive learning games in one place.</p>
                  <div className="mt-4 text-white font-medium group-hover:underline">Browse Games →</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <footer className="mt-20 text-center border-t border-gray-200 dark:border-gray-700 pt-10 text-gray-500 dark:text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} TOPCIT Reviewer | Built with Next.js</p>
        </footer>
      </div>
    </div>
  )
}
