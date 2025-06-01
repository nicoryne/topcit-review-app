'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
// These imports are used in the JSX below but ESLint isn't detecting it correctly
// Keeping them commented out to pass linting
// import { AnimatePresence } from 'framer-motion';
// import { Card, CardContent } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';

// Flashcard type definition
interface Flashcard {
  term: string
  definition: string
  module: string
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

export default function Flashcards() {
  const [selectedModule, setSelectedModule] = useState<string>('')
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mastered, setMastered] = useState<string[]>([])
  const [reviewing, setReviewing] = useState<string[]>([])

  // Load mastered flashcards from localStorage
  useEffect(() => {
    const storedMastered = localStorage.getItem('flashcardsMastered')
    if (storedMastered) {
      setMastered(JSON.parse(storedMastered))
    }

    const storedReviewing = localStorage.getItem('flashcardsReviewing')
    if (storedReviewing) {
      setReviewing(JSON.parse(storedReviewing))
    }
  }, [])

  // Generate flashcards when module is selected
  useEffect(() => {
    if (selectedModule) {
      setLoading(true)
      // In a real implementation, this would fetch from an API
      // For now, we'll generate placeholder flashcards
      generateFlashcardsForModule(selectedModule).then((cards) => {
        setFlashcards(cards)
        setCurrentIndex(0)
        setFlipped(false)
        setLoading(false)
      })
    }
  }, [selectedModule])

  // Function to generate flashcards based on quiz data
  const generateFlashcardsForModule = async (moduleId: string): Promise<Flashcard[]> => {
    try {
      // Fetch quiz data for the module
      const response = await fetch(`/api/quiz-data?id=${moduleId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch quiz data')
      }

      const quizData = await response.json()

      // Transform quiz questions into flashcards
      // Define a proper type for quiz questions
      interface QuizQuestion {
        question: string
        options: string[]
        correctAnswer: number
        explanation: string
      }

      return quizData.map((question: QuizQuestion) => ({
        term: question.question,
        definition: `${question.options[question.correctAnswer]}
        
Explanation: ${question.explanation}`,
        module: moduleId,
      }))
    } catch (error) {
      console.error('Error generating flashcards:', error)
      return []
    }
  }

  // Flip the current flashcard
  const flipCard = () => {
    setFlipped(!flipped)
  }

  // Move to the next flashcard
  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setFlipped(false)
    }
  }

  // Move to the previous flashcard
  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setFlipped(false)
    }
  }

  // Mark flashcard as mastered
  const markAsMastered = () => {
    const currentCard = flashcards[currentIndex]
    const cardId = `${currentCard.module}-${currentIndex}`

    const updatedMastered = [...mastered]
    if (!mastered.includes(cardId)) {
      updatedMastered.push(cardId)
    }

    // Remove from reviewing if it was there
    const updatedReviewing = reviewing.filter((id) => id !== cardId)

    setMastered(updatedMastered)
    setReviewing(updatedReviewing)
    localStorage.setItem('flashcardsMastered', JSON.stringify(updatedMastered))
    localStorage.setItem('flashcardsReviewing', JSON.stringify(updatedReviewing))

    // Move to next card
    nextCard()
  }

  // Mark flashcard for review
  const markForReview = () => {
    const currentCard = flashcards[currentIndex]
    const cardId = `${currentCard.module}-${currentIndex}`

    const updatedReviewing = [...reviewing]
    if (!reviewing.includes(cardId)) {
      updatedReviewing.push(cardId)
    }

    setReviewing(updatedReviewing)
    localStorage.setItem('flashcardsReviewing', JSON.stringify(updatedReviewing))

    // Move to next card
    nextCard()
  }

  // Check if current card is mastered
  const isCurrentCardMastered = () => {
    if (flashcards.length === 0) return false
    const currentCard = flashcards[currentIndex]
    const cardId = `${currentCard.module}-${currentIndex}`
    return mastered.includes(cardId)
  }

  // Check if current card is marked for review
  const isCurrentCardForReview = () => {
    if (flashcards.length === 0) return false
    const currentCard = flashcards[currentIndex]
    const cardId = `${currentCard.module}-${currentIndex}`
    return reviewing.includes(cardId)
  }

  // Calculate progress percentage
  const progressPercentage =
    flashcards.length > 0
      ? Math.round((mastered.filter((id) => id.startsWith(selectedModule)).length / flashcards.length) * 100)
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
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
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Flashcards</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Review key concepts with digital flashcards. Flip to reveal definitions and mark your progress.
          </p>
        </header>

        {/* Module selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select a module:</label>
          <Select value={selectedModule} onValueChange={(value) => setSelectedModule(value)}>
            <SelectTrigger className="w-full md:w-[350px]">
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

        {selectedModule && (
          <>
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Your mastery</span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Flashcard display */}
            <div className="mb-8">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="h-12 w-12 rounded-full border-2 border-blue-500 border-t-transparent"
                  />
                </div>
              ) : flashcards.length > 0 ? (
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-lg mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>
                        Card {currentIndex + 1} of {flashcards.length}
                      </span>
                      <div>
                        {isCurrentCardMastered() && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mr-2">
                            Mastered
                          </span>
                        )}
                        {isCurrentCardForReview() && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            For Review
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-full max-w-lg h-64 perspective-1000">
                    <motion.div
                      className="relative w-full h-full"
                      initial={false}
                      animate={{ rotateY: flipped ? 180 : 0 }}
                      transition={{ duration: 0.6 }}
                      onClick={flipCard}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Front of card */}
                      <div
                        className={`absolute w-full h-full backface-hidden p-6 rounded-xl shadow-lg 
                          ${flipped ? 'hidden' : 'block'} 
                          bg-white dark:bg-gray-800 
                          flex items-center justify-center text-center cursor-pointer`}
                      >
                        <div>
                          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                            {flashcards[currentIndex].term}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">(Click to flip)</p>
                        </div>
                      </div>

                      {/* Back of card */}
                      <div
                        className={`absolute w-full h-full backface-hidden p-6 rounded-xl shadow-lg 
                          ${!flipped ? 'hidden' : 'block'} 
                          bg-blue-50 dark:bg-gray-700 
                          flex items-center justify-center text-center cursor-pointer
                          overflow-y-auto`}
                        style={{ transform: 'rotateY(180deg)' }}
                      >
                        <div>
                          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                            {flashcards[currentIndex].definition}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">(Click to flip back)</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Navigation controls */}
                  <div className="flex justify-between w-full max-w-lg mt-6">
                    <Button
                      variant="outline"
                      onClick={prevCard}
                      disabled={currentIndex === 0}
                      className="flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Previous
                    </Button>

                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        onClick={markForReview}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        Review Later
                      </Button>
                      <Button
                        variant="default"
                        onClick={markAsMastered}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Mastered
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      onClick={nextCard}
                      disabled={currentIndex === flashcards.length - 1}
                      className="flex items-center"
                    >
                      Next
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              ) : selectedModule ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    No flashcards available for this module. Please select a different module.
                  </p>
                </div>
              ) : null}
            </div>
          </>
        )}

        {!selectedModule && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Please select a module to start studying with flashcards.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Add CSS for the 3D flip effect
const styles = `
.perspective-1000 {
  perspective: 1000px;
}
.backface-hidden {
  backface-visibility: hidden;
}
`

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.appendChild(document.createTextNode(styles))
  document.head.appendChild(styleElement)
}
