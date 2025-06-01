'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
// import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

// Question type
interface Question {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

// Module options
const moduleOptions = [
  { id: '01', name: 'Module 01: Software Development' },
  { id: '02', name: 'Module 02: Understanding & Using Data' },
  { id: '03', name: 'Module 03: Overview of System Architecture' },
  { id: '04', name: 'Module 04: Understanding Information Security' },
  { id: '05', name: 'Module 05: Understanding the IT Business and Ethics' },
  { id: '06', name: 'Module 06: Project Management and Technical Communication' },
]

// Time options (in seconds)
const timeOptions = [
  { id: '60', name: '1 Minute' },
  { id: '120', name: '2 Minutes' },
  { id: '180', name: '3 Minutes' },
  { id: '300', name: '5 Minutes' },
]

export default function TimeAttack() {
  const [selectedModule, setSelectedModule] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('120') // Default 2 minutes
  const [questions, setQuestions] = useState<Question[]>([])
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup')
  const [loading, setLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [highScores, setHighScores] = useState<Record<string, number>>({})
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Load high scores from localStorage
  useEffect(() => {
    const storedScores = localStorage.getItem('timeAttackHighScores')
    if (storedScores) {
      setHighScores(JSON.parse(storedScores))
    }
  }, [])

  // Shuffle questions when starting a new game
  const shuffleQuestions = (questions: Question[]) => {
    return [...questions].sort(() => Math.random() - 0.5)
  }

  // Fetch questions for the selected module
  useEffect(() => {
    if (selectedModule && gameState === 'setup') {
      setLoading(true)
      fetch(`/api/quiz-data?id=${selectedModule}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch quiz data')
          }
          return res.json()
        })
        .then((data) => {
          setQuestions(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error loading questions:', error)
          setLoading(false)
        })
    }
  }, [selectedModule, gameState])

  // Start game timer
  const startGame = () => {
    // Reset game state
    setScore(0)
    setCurrentIndex(0)
    setStreak(0)
    setMaxStreak(0)
    setSelectedOption(null)

    // Shuffle questions and start with a subset
    const shuffled = shuffleQuestions(questions)
    setShuffledQuestions(shuffled)

    // Set timer
    setTimeLeft(parseInt(selectedTime))

    // Start game
    setGameState('playing')

    // Start countdown
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up
          clearInterval(timerRef.current!)
          setGameState('finished')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Handle answer selection
  const handleOptionSelect = (optionIndex: number) => {
    // Prevent multiple selections
    if (selectedOption !== null) return

    setSelectedOption(optionIndex)

    // Check if answer is correct
    const currentQuestion = shuffledQuestions[currentIndex]
    const isCorrect = optionIndex === currentQuestion.correctAnswer

    if (isCorrect) {
      // Update score - base score + streak bonus
      const newStreak = streak + 1
      const streakBonus = Math.floor(newStreak / 3) // Bonus every 3 consecutive correct answers
      setScore((prev) => prev + 1 + streakBonus)
      setStreak(newStreak)
      setMaxStreak((prev) => Math.max(prev, newStreak))
    } else {
      setStreak(0)
    }

    // Move to next question after a short delay
    setTimeout(() => {
      setSelectedOption(null)
      setCurrentIndex((prev) => prev + 1)

      // If we've shown all questions, reshuffle and continue
      if (currentIndex >= shuffledQuestions.length - 1) {
        setShuffledQuestions(shuffleQuestions(questions))
        setCurrentIndex(0)
      }
    }, 750)
  }

  // Format time display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate time urgency for animation
  const timeUrgency = timeLeft <= parseInt(selectedTime) * 0.2 ? 'urgent' : 'normal'

  // Calculate progress percentage
  const progressPercentage = parseInt(selectedTime) > 0 ? Math.round((timeLeft / parseInt(selectedTime)) * 100) : 0

  // Save high score
  useEffect(() => {
    if (gameState === 'finished') {
      const scoreKey = `${selectedModule}-${selectedTime}`
      if (!highScores[scoreKey] || score > highScores[scoreKey]) {
        const newHighScores = {
          ...highScores,
          [scoreKey]: score,
        }
        setHighScores(newHighScores)
        localStorage.setItem('timeAttackHighScores', JSON.stringify(newHighScores))
      }
    }
  }, [gameState, score, selectedModule, selectedTime, highScores])

  // Get current high score
  const getCurrentHighScore = () => {
    const scoreKey = `${selectedModule}-${selectedTime}`
    return highScores[scoreKey] || 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/games" className="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Games
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">Time Attack</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Answer as many questions as possible before the timer runs out. Build a streak for bonus points!
          </p>
        </header>

        {gameState === 'setup' && (
          <div className="max-w-md mx-auto">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select a module:
                    </label>
                    <Select value={selectedModule} onValueChange={(value) => setSelectedModule(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a module" />
                      </SelectTrigger>
                      <SelectContent>
                        {moduleOptions.map((module) => (
                          <SelectItem key={module.id} value={module.id}>
                            {module.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select time limit:
                    </label>
                    <Select value={selectedTime} onValueChange={(value) => setSelectedTime(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose time limit" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedModule && (
                    <div className="py-2">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">High Score:</h3>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {getCurrentHighScore()} points
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      onClick={startGame}
                      disabled={!selectedModule || loading}
                    >
                      {loading ? 'Loading Questions...' : 'Start Time Attack'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === 'playing' && shuffledQuestions.length > 0 && (
          <div className="max-w-3xl mx-auto">
            {/* Timer and score display */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Score</span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{score}</h2>
                </div>

                <motion.div
                  animate={timeUrgency}
                  variants={{
                    normal: { scale: 1 },
                    urgent: { scale: [1, 1.05, 1], transition: { duration: 0.5, repeat: Infinity } },
                  }}
                  className={`text-center ${
                    timeUrgency === 'urgent' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <span className="text-sm text-gray-500 dark:text-gray-400">Time Left</span>
                  <h2 className="text-2xl font-bold">{formatTime(timeLeft)}</h2>
                </motion.div>

                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Streak</span>
                  <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">{streak}🔥</h2>
                </div>
              </div>

              <div className="mt-3">
                <Progress
                  value={progressPercentage}
                  className={`h-2 ${
                    timeUrgency === 'urgent' ? 'bg-red-200 dark:bg-red-900' : 'bg-blue-200 dark:bg-blue-900'
                  }`}
                />
              </div>
            </div>

            {/* Current question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  {shuffledQuestions[currentIndex].question}
                </h3>

                <div className="space-y-3">
                  {shuffledQuestions[currentIndex].options.map((option, index) => (
                    <motion.button
                      key={index}
                      className={`w-full text-left p-3 rounded-md transition-colors
                        ${
                          selectedOption === null
                            ? 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            : selectedOption === index
                            ? index === shuffledQuestions[currentIndex].correctAnswer
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                            : index === shuffledQuestions[currentIndex].correctAnswer && selectedOption !== null
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                      onClick={() => handleOptionSelect(index)}
                      disabled={selectedOption !== null}
                      whileHover={{ scale: selectedOption === null ? 1.02 : 1 }}
                      whileTap={{ scale: selectedOption === null ? 0.98 : 1 }}
                    >
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center justify-center h-8 w-8 rounded-full mr-3 text-sm
                          ${
                            selectedOption === null
                              ? 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                              : selectedOption === index
                              ? index === shuffledQuestions[currentIndex].correctAnswer
                                ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                                : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
                              : index === shuffledQuestions[currentIndex].correctAnswer && selectedOption !== null
                              ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                              : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                          }`}
                        >
                          {String.fromCharCode(65 + index)} {/* A, B, C, D */}
                        </span>
                        <span className="text-gray-800 dark:text-gray-200">{option}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="max-w-md mx-auto">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Time&apos;s Up!</h2>

                  <div className="py-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Score</p>
                    <p className="text-5xl font-bold text-red-600 dark:text-red-400">{score}</p>

                    <div className="flex justify-center space-x-4 mt-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Max Streak</p>
                        <p className="text-xl font-semibold text-green-600 dark:text-green-400">{maxStreak}🔥</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">High Score</p>
                        <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                          {getCurrentHighScore()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {score > 0 && score === getCurrentHighScore() && (
                    <div className="py-2">
                      <Badge className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm">New High Score!</Badge>
                    </div>
                  )}

                  <div className="space-y-3 pt-4">
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={startGame}>
                      Play Again
                    </Button>

                    <Button variant="outline" className="w-full" onClick={() => setGameState('setup')}>
                      Change Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
