'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// Type definitions
type Question = {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

// Define quiz categories with titles
const categoryTitles: Record<string, string> = {
  '01': 'Software Development',
  '02': 'Understanding & Using Data',
  '03': 'Overview of System Architecture',
  '04': 'Understanding Information Security',
  '05': 'Understanding the IT Business and Ethics',
  '06': 'Project Management and Technical Communication',
}

// Define animation variants for Framer Motion
// Currently not used directly but keeping for future UI enhancements
/* 
const questionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const optionVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.3 }
  }),
  hover: { scale: 1.02, transition: { duration: 0.2 } }
};
*/

const timerVariants = {
  normal: { scale: 1 },
  urgent: { scale: [1, 1.05, 1], transition: { duration: 0.5, repeat: Infinity } },
}

export default function Quiz() {
  const params = useParams()
  const router = useRouter()
  const categoryId = typeof params.categoryId === 'string' ? params.categoryId : params.categoryId?.[0] || ''

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30) // 30 seconds per question
  const [isQuizCompleted, setIsQuizCompleted] = useState(false)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  // Confetti effect temporarily disabled
  // const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true)

  // State to store questions loaded from API
  const [questions, setQuestions] = useState<Question[]>([])

  // Toggle explanation
  const toggleExplanation = () => {
    setShowExplanation((prev) => !prev)
  }

  // Handle next question function declaration (needed to define before handleTimeUp)
  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
      setShowFeedback(false)
      setShowExplanation(false)
      setTimeLeft(30)
    } else {
      // Quiz completed
      setIsQuizCompleted(true)

      // Store quiz result in localStorage
      try {
        // Get existing results
        const existingResults = localStorage.getItem('quizResults')
        const resultsObj = existingResults ? JSON.parse(existingResults) : {}

        // Update with new result
        resultsObj[categoryId] = {
          score,
          total: questions.length,
          maxStreak,
          completed: true,
          completedAt: new Date().toISOString(),
        }

        localStorage.setItem('quizResults', JSON.stringify(resultsObj))
      } catch (error) {
        console.error('Error saving quiz results:', error)
      }
    }
  }, [categoryId, currentQuestionIndex, maxStreak, questions.length, score])

  // Alias for handleNextQuestion to maintain compatibility with JSX
  const nextQuestion = handleNextQuestion

  // Handle time up (now safe to reference handleNextQuestion)
  const handleTimeUp = useCallback(() => {
    if (!isAnswered) {
      setIsAnswered(true)
      setShowFeedback(true)
      setStreak(0) // Reset streak on time up

      // Move to next question after 2 seconds
      setTimeout(() => {
        handleNextQuestion()
      }, 2000)
    }
  }, [isAnswered, handleNextQuestion])

  // Handle option selection - aliased as handleAnswer for JSX references
  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return

    setSelectedOption(optionIndex)
    setIsAnswered(true)
    setShowFeedback(true)

    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = optionIndex === currentQuestion.correctAnswer

    if (isCorrect) {
      setScore((prev) => prev + 1)
      setStreak((prev) => {
        const newStreak = prev + 1
        if (newStreak > maxStreak) {
          setMaxStreak(newStreak)
        }

        // Show confetti on streak milestones
        if (newStreak % 3 === 0) {
          // setShowConfetti(true);
          // setTimeout(() => setShowConfetti(false), 2000);
        }

        return newStreak
      })
    } else {
      setStreak(0) // Reset streak on wrong answer
    }
  }

  // Alias for handleOptionSelect to maintain compatibility with JSX
  const handleAnswer = handleOptionSelect

  // Make sure categoryId is valid
  useEffect(() => {
    if (!categoryId || !categoryTitles[categoryId]) {
      router.push('/quiz')
    }
  }, [categoryId, router])

  // Load questions from API
  useEffect(() => {
    if (categoryId) {
      setIsLoading(true)
      fetch(`/api/quiz-data?id=${categoryId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch quiz data')
          }
          return res.json()
        })
        .then((data) => {
          setQuestions(data)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error('Error loading quiz:', error)
          setIsLoading(false)
        })
    }
  }, [categoryId])

  // Timer effect - handleTimeUp now declared before this useEffect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (questions.length > 0 && !isAnswered && !isQuizCompleted) {
      setTimeLeft(30) // Reset timer for each question

      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer as NodeJS.Timeout)
            handleTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [currentQuestionIndex, handleTimeUp, isAnswered, isQuizCompleted, questions.length])

  // Retry quiz - aliased as restartQuiz for JSX references
  const handleRetryQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setScore(0)
    setShowFeedback(false)
    setShowExplanation(false)
    setTimeLeft(30)
    setIsQuizCompleted(false)
    setStreak(0)
    setMaxStreak(0)
  }

  // Alias for handleRetryQuiz to maintain compatibility with JSX
  const restartQuiz = handleRetryQuiz

  // If no category or no questions, show loading
  if (!categoryId || !categoryTitles[categoryId] || questions.length === 0 || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Loading quiz...</h2>
      </div>
    )
  }

  // Current question
  const currentQuestion = questions[currentQuestionIndex]

  // If quiz is completed, show results
  if (isQuizCompleted) {
    const percentageScore = Math.round((score / questions.length) * 100)

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-12">
          <header className="text-center mb-12">
            <Link
              href="/quiz"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Quiz Selection
            </Link>
            <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Quiz Results</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Module {categoryId}: {categoryTitles[categoryId]}
            </p>
          </header>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="mb-4">
                {percentageScore >= 80 ? (
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                ) : percentageScore >= 60 ? (
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                {percentageScore >= 80 ? 'Excellent!' : percentageScore >= 60 ? 'Good Job!' : 'Keep Practicing!'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {percentageScore >= 80
                  ? "You're mastering this topic!"
                  : percentageScore >= 60
                  ? "You're on the right track!"
                  : "You'll improve with more practice!"}
              </p>

              <div className="text-5xl font-bold mb-6 text-blue-600 dark:text-blue-400">{percentageScore}%</div>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                  <div className="font-bold text-2xl text-blue-600 dark:text-blue-400">{score}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Score</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                  <div className="font-bold text-2xl text-green-600 dark:text-green-400">{maxStreak}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Max Streak</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={restartQuiz}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-300"
                >
                  Try Again
                </button>
                <Link
                  href="/quiz"
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-6 rounded-md transition duration-300"
                >
                  Back to Categories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render the quiz
  // Animation variants for quiz content
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  }

  const questionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.2 } },
  }

  const optionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
    hover: {
      scale: 1.02,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      transition: { duration: 0.2 },
    },
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Quiz header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/quiz"
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Back to Categories</span>
            </Link>
          </motion.div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full shadow-sm border border-gray-200 dark:border-gray-600">
              Score: <span className="font-semibold ml-1">{score}</span>
            </div>
            <motion.div
              className={`px-3 py-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-600 ${
                streak >= 3
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
                  : 'bg-white dark:bg-gray-700'
              }`}
              animate={streak >= 3 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              Streak: <span className="font-semibold ml-1">{streak}</span>
            </motion.div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quiz progress */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="flex justify-between items-center">
            <div className="text-lg font-medium text-gray-800 dark:text-white">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>

            {/* Timer */}
            <motion.div
              className={`px-4 py-2 rounded-full font-medium ${
                timeLeft < 10
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              }`}
              variants={timerVariants}
              animate={timeLeft < 10 ? 'urgent' : 'normal'}
            >
              {timeLeft}s
            </motion.div>
          </div>
        </div>

        {/* Main quiz card */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Question */}
          <div className="px-6 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={questionVariants}
                className="mb-8"
              >
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">{currentQuestion.question}</h2>

                {/* Options */}
                <div className="space-y-4">
                  {currentQuestion.options.map((option, index) => (
                    <motion.button
                      key={index}
                      variants={optionVariants}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      whileHover={!isAnswered ? 'hover' : undefined}
                      onClick={() => handleAnswer(index)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 rounded-lg border transition-colors duration-300 ${
                        isAnswered
                          ? index === currentQuestion.correctAnswer
                            ? 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-600'
                            : index === selectedOption
                            ? 'bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-600'
                            : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-600'
                          : 'bg-white border-gray-200 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-blue-500'
                      }`}
                    >
                      <div className="flex">
                        <span
                          className={`flex items-center justify-center w-6 h-6 rounded-full mr-3 ${
                            isAnswered
                              ? index === currentQuestion.correctAnswer
                                ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200'
                                : index === selectedOption
                                ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {String.fromCharCode(65 + index) /* A, B, C, D */}
                        </span>
                        <span className="text-gray-800 dark:text-gray-200">{option}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Feedback after answering */}
            {isAnswered && showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-lg ${
                  selectedOption === currentQuestion.correctAnswer
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start">
                  {selectedOption === currentQuestion.correctAnswer ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-green-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-red-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  <div>
                    <p
                      className={`font-medium ${
                        selectedOption === currentQuestion.correctAnswer
                          ? 'text-green-800 dark:text-green-200'
                          : 'text-red-800 dark:text-red-200'
                      }`}
                    >
                      {selectedOption === currentQuestion.correctAnswer
                        ? `Correct! ${streak >= 2 ? `+${streak} streak bonus!` : ''}`
                        : 'Incorrect!'}
                    </p>

                    {showExplanation ? (
                      <p className="mt-1 text-gray-700 dark:text-gray-300">{currentQuestion.explanation}</p>
                    ) : (
                      <button
                        onClick={toggleExplanation}
                        className="mt-1 text-blue-600 dark:text-blue-400 underline text-sm"
                      >
                        Show explanation
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Navigation controls */}
          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-between">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            {isAnswered && (
              <motion.button
                onClick={nextQuestion}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-300"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
