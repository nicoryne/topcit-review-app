import Link from "next/link";
import Image from "next/image";

const pdfList = [
  {
    id: "01",
    title: "Software Development",
    filename: "01-TOPCIT-Software-Development.pdf"
  },
  {
    id: "02",
    title: "Understanding & Using Data",
    filename: "02-TOPCIT-Understanding-Using-Data.pdf"
  },
  {
    id: "03",
    title: "Overview of System Architecture",
    filename: "03-TOPCIT-Overview-of-System-Architecture.pdf"
  },
  {
    id: "04",
    title: "Understanding Information Security",
    filename: "04-TOPCIT-Understanding-Information-Security.pdf"
  },
  {
    id: "05",
    title: "Understanding the IT Business and Ethics",
    filename: "05-TOPCIT-Understanding-the-IT-Business-and-Ethics.pdf"
  },
  {
    id: "06",
    title: "Project Management and Technical Communication",
    filename: "06-TOPCIT-Project-Management-and-Technical-Communication.pdf"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">TOPCIT Reviewer</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">Master the TOPCIT certification with interactive study materials and quizzes</p>
          
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/quiz" 
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Practice Quizzes
            </Link>
            <a 
              href="#study-materials" 
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-800 text-white hover:bg-blue-700 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Comprehensive resources for all TOPCIT certification modules</p>
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
                        <Image 
                          src="/file.svg" 
                          alt="PDF Icon" 
                          width={24} 
                          height={24} 
                          className="dark:invert"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">TOPCIT Module {pdf.id}</span>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{pdf.title}</h2>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between items-center">
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">View material</span>
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs py-1 px-2 rounded-full">PDF</span>
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
              <p className="text-gray-600 dark:text-gray-300 mb-6">Challenge yourself with our interactive quizzes designed to help you prepare for the TOPCIT certification. Track your progress and identify areas for improvement.</p>
              <Link 
                href="/quiz" 
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-all duration-300 shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Start Quizzes
              </Link>
            </div>
            <div className="md:w-1/2 bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold text-gray-800 dark:text-white">Available Quiz Categories</h3>
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs py-1 px-2 rounded-full">{pdfList.length} Modules</span>
              </div>
              <ul className="space-y-3">
                {pdfList.map((pdf, index) => (
                  <li key={pdf.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-bold mr-3">{pdf.id}</span>
                      <span className="text-gray-700 dark:text-gray-300">{pdf.title}</span>
                    </div>
                    <Link 
                      href={`/quiz/${pdf.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      Take Quiz
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <footer className="mt-20 text-center border-t border-gray-200 dark:border-gray-700 pt-10 text-gray-500 dark:text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} TOPCIT Reviewer | Built with Next.js</p>
        </footer>
      </div>
    </div>
  );
}
