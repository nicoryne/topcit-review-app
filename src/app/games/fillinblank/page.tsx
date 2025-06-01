'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Blank question type
interface BlankQuestion {
  id: string
  text: string // Text with [BLANK] placeholder
  answer: string // The word that should go in the blank
  moduleId: string
  difficulty: 'easy' | 'medium' | 'hard'
  context?: string // Optional context or hint
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

// Difficulty options
const difficultyOptions = [
  { id: 'easy', name: 'Easy' },
  { id: 'medium', name: 'Medium' },
  { id: 'hard', name: 'Hard' },
]

export default function FillInTheBlank() {
  const [selectedModule, setSelectedModule] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('medium')
  const [questions, setQuestions] = useState<BlankQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'hint'; message: string } | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState(0)
  const [maxScore, setMaxScore] = useState(0)
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'review' | 'finished'>('setup')
  const [loading, setLoading] = useState(false)
  const [highScores, setHighScores] = useState<Record<string, number>>({})
  const [attemptsRemaining, setAttemptsRemaining] = useState(2)
  const [hintsUsed, setHintsUsed] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)

  // Load high scores from localStorage
  useEffect(() => {
    const storedScores = localStorage.getItem('fillBlankHighScores')
    if (storedScores) {
      setHighScores(JSON.parse(storedScores))
    }
  }, [])

  // Generate blank questions from quiz data
  const generateBlankQuestions = async (moduleId: string): Promise<BlankQuestion[]> => {
    try {
      // Fetch quiz data for the module
      const response = await fetch(`/api/quiz-data?id=${moduleId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch quiz data')
      }

      const quizData = await response.json()

      // Define the quiz question type
      interface QuizQuestion {
        question: string
        options: string[]
        correctAnswer: number
        explanation: string
      }

      // Transform quiz questions into fill-in-the-blank questions
      return quizData
        .map((question: QuizQuestion, index: number) => {
          // Extract a key term from the correct answer
          const correctAnswer = question.options[question.correctAnswer]

          // Find a word to blank out - look for technical terms
          // For real implementation, this would use NLP or a curated list of terms
          const keyTerms = extractKeyTerms(correctAnswer)
          const blankTerm =
            keyTerms.length > 0 ? keyTerms[Math.floor(Math.random() * keyTerms.length)] : findWordToBlank(correctAnswer)

          // Create text with [BLANK]
          const textWithBlank = correctAnswer.replace(new RegExp(`\\b${escapeRegExp(blankTerm)}\\b`, 'i'), '[BLANK]')

          return {
            id: `blank-${index}`,
            text: textWithBlank,
            answer: blankTerm,
            moduleId,
            difficulty: determineDifficulty(blankTerm),
            context: question.question, // Use the question as context
          }
        })
        .filter((q: BlankQuestion) => q.text.includes('[BLANK]')) // Only keep questions where we successfully created a blank
    } catch (error) {
      console.error('Error generating blank questions:', error)
      return []
    }
  }

  // Extract key technical terms (simplified implementation)
  const extractKeyTerms = (text: string): string[] => {
    // This is a simplified implementation
    // In a real app, you would use NLP or a curated list of technical terms
    const words = text.split(/\s+/)

    // Look for capitalized words, words with special symbols, or longer words
    return words.filter((word) => {
      const cleaned = word.replace(/[.,;?!()]/g, '')
      return (
        cleaned.length > 5 && // Longer words are more likely to be technical terms
        !/^(a|an|the|and|or|but|for|in|on|at|by|of|to)$/i.test(cleaned) // Exclude common prepositions/conjunctions
      )
    })
  }

  // Find a suitable word to blank out
  const findWordToBlank = (text: string): string => {
    const words = text.split(/\s+/).filter((w) => w.length > 3)
    if (words.length === 0) return text.split(/\s+/)[0] || text
    return words[Math.floor(Math.random() * words.length)].replace(/[.,;?!()]/g, '')
  }

  // Determine difficulty of a question based on the blank word
  const determineDifficulty = (word: string): 'easy' | 'medium' | 'hard' => {
    if (word.length <= 4) return 'easy'
    if (word.length <= 7) return 'medium'
    return 'hard'
  }

  // Escape special characters in regex
  const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  // Start the game
  const startGame = async () => {
    setLoading(true)

    // Generate questions
    const allQuestions = await generateBlankQuestions(selectedModule)

    // Filter by difficulty
    const filteredQuestions = allQuestions.filter(
      (q) => selectedDifficulty === 'all' || q.difficulty === selectedDifficulty
    )

    // Shuffle and get a subset
    const shuffled = shuffleArray(filteredQuestions)
    const gameQuestions = shuffled.slice(0, 10) // Limit to 10 questions per game

    setQuestions(gameQuestions)
    setCurrentQuestionIndex(0)
    setUserAnswer('')
    setFeedback(null)
    setShowAnswer(false)
    setScore(0)
    setMaxScore(gameQuestions.length)
    setAttemptsRemaining(2)
    setHintsUsed(0)

    // Start game
    setGameState('playing')
    setLoading(false)

    // Focus on input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
  }

  // Fisher-Yates shuffle algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  // Check the user's answer
  const checkAnswer = () => {
    if (!userAnswer.trim()) return

    const currentQuestion = questions[currentQuestionIndex]
    const normalizedUserAnswer = userAnswer.trim().toLowerCase()
    const normalizedCorrectAnswer = currentQuestion.answer.toLowerCase()

    // Check if answer is correct (allowing for some flexibility)
    const isCorrect =
      normalizedUserAnswer === normalizedCorrectAnswer ||
      normalizedCorrectAnswer.includes(normalizedUserAnswer) ||
      normalizedUserAnswer.includes(normalizedCorrectAnswer)

    if (isCorrect) {
      // Correct answer
      setFeedback({
        type: 'success',
        message: 'Correct! Well done.',
      })
      setScore(score + 1)
      setShowAnswer(true)

      // Move to next question after delay
      setTimeout(moveToNext, 1500)
    } else {
      // Wrong answer
      const newAttemptsRemaining = attemptsRemaining - 1
      setAttemptsRemaining(newAttemptsRemaining)

      if (newAttemptsRemaining > 0) {
        // Still has attempts left
        setFeedback({
          type: 'error',
          message: `Incorrect. You have ${newAttemptsRemaining} attempt${
            newAttemptsRemaining === 1 ? '' : 's'
          } remaining.`,
        })
      } else {
        // No more attempts
        setFeedback({
          type: 'error',
          message: `Incorrect. The correct answer is "${currentQuestion.answer}".`,
        })
        setShowAnswer(true)

        // Move to next question after delay
        setTimeout(moveToNext, 2000)
      }
    }
  }

  // Get a hint
  const getHint = () => {
    const currentQuestion = questions[currentQuestionIndex]
    const answer = currentQuestion.answer

    setHintsUsed(hintsUsed + 1)

    // Create a hint by revealing the first letter or first few letters
    let hint = ''
    if (answer.length <= 4) {
      hint = `The answer starts with "${answer[0]}".`
    } else if (answer.length <= 7) {
      hint = `The answer starts with "${answer.substring(0, 2)}".`
    } else {
      hint = `The answer starts with "${answer.substring(0, 3)}".`
    }

    setFeedback({
      type: 'hint',
      message: hint,
    })
  }

  // Move to the next question
  const moveToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setUserAnswer('')
      setFeedback(null)
      setShowAnswer(false)
      setAttemptsRemaining(2)

      // Focus on input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    } else {
      // Game finished
      finishGame()
    }
  }

  // Finish the game
  const finishGame = () => {
    setGameState('finished')

    // Calculate score
    const finalScore = score

    // Check if this is a new high score
    const scoreKey = `${selectedModule}-${selectedDifficulty}`
    if (!highScores[scoreKey] || finalScore > highScores[scoreKey]) {
      const newHighScores = {
        ...highScores,
        [scoreKey]: finalScore,
      }
      setHighScores(newHighScores)
      localStorage.setItem('fillBlankHighScores', JSON.stringify(newHighScores))
    }
  }

  // Get current high score
  const getCurrentHighScore = () => {
    const scoreKey = `${selectedModule}-${selectedDifficulty}`
    return highScores[scoreKey] || 0
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!showAnswer) {
      checkAnswer()
    }
  }

  // Get text parts before and after [BLANK]
  const getTextParts = () => {
    if (questions.length === 0 || currentQuestionIndex >= questions.length) return ['', '']

    const text = questions[currentQuestionIndex].text
    const parts = text.split('[BLANK]')
    return parts
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white dark:from-gray-900 dark:to-gray-800">
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
          <h1 className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">Fill-in-the-Blank</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Complete sentences with missing technical terms to test your knowledge.
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
                      Select difficulty:
                    </label>
                    <Select value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Difficulties</SelectItem>
                        {difficultyOptions.map((option) => (
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
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {getCurrentHighScore()} / 10
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                      onClick={startGame}
                      disabled={!selectedModule || loading}
                    >
                      {loading ? 'Loading Questions...' : 'Start Fill-in-the-Blank'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === 'playing' && questions.length > 0 && (
          <div className="max-w-2xl mx-auto">
            {/* Progress bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Score: {score} / {currentQuestionIndex + (showAnswer ? 1 : 0)}
                </span>
              </div>
              <Progress
                value={((currentQuestionIndex + (showAnswer ? 1 : 0)) / questions.length) * 100}
                className="h-2"
              />
            </div>

            {/* Current question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6"
              >
                {/* Context/hint from original question */}
                {questions[currentQuestionIndex].context && (
                  <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Context:</h3>
                    <p className="text-gray-800 dark:text-gray-200">{questions[currentQuestionIndex].context}</p>
                  </div>
                )}

                {/* Fill in the blank question */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Complete the following statement:
                  </h3>

                  <form onSubmit={handleSubmit} className="flex flex-wrap items-center text-lg">
                    <span className="mr-1">{getTextParts()[0]}</span>

                    {showAnswer ? (
                      <span className="px-2 py-1 mx-1 font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900 rounded-md">
                        {questions[currentQuestionIndex].answer}
                      </span>
                    ) : (
                      <Input
                        ref={inputRef}
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        className="max-w-[200px] inline-block mx-1 font-medium text-center"
                        placeholder="answer"
                        disabled={showAnswer}
                      />
                    )}

                    <span className="ml-1">{getTextParts()[1]}</span>

                    {!showAnswer && (
                      <div className="w-full mt-6 flex justify-center">
                        <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                          Check Answer
                        </Button>
                      </div>
                    )}
                  </form>
                </div>

                {/* Feedback */}
                {feedback && (
                  <Alert
                    className={`mb-4 ${
                      feedback.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : feedback.type === 'error'
                        ? 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : 'bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    }`}
                  >
                    <AlertDescription>{feedback.message}</AlertDescription>
                  </Alert>
                )}

                {/* Action buttons */}
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={getHint}
                    disabled={showAnswer || hintsUsed >= 3}
                    className="text-sm"
                  >
                    Get Hint ({3 - hintsUsed} left)
                  </Button>

                  {showAnswer && (
                    <Button onClick={moveToNext} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                      {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish'}
                    </Button>
                  )}
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
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Game Complete!</h2>

                  <div className="py-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Score</p>
                    <p className="text-5xl font-bold text-yellow-600 dark:text-yellow-400">
                      {score} / {maxScore}
                    </p>

                    <div className="flex justify-center mt-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                        <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                          {Math.round((score / maxScore) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {score === maxScore && (
                    <div className="py-2">
                      <Badge className="bg-green-400 text-green-900 px-3 py-1 text-sm">Perfect Score!</Badge>
                    </div>
                  )}

                  {score > 0 && score === getCurrentHighScore() && score !== maxScore && (
                    <div className="py-2">
                      <Badge className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm">New High Score!</Badge>
                    </div>
                  )}

                  <div className="space-y-3 pt-4">
                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white" onClick={startGame}>
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
