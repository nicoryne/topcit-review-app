'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import confetti from 'canvas-confetti'

// Term pair type
interface TermPair {
  id: string
  term: string
  definition: string
}

// Game level type
interface GameLevel {
  pairs: number
  name: string
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

// Game levels
const gameLevels: GameLevel[] = [
  { pairs: 5, name: 'Beginner (5 pairs)' },
  { pairs: 8, name: 'Intermediate (8 pairs)' },
  { pairs: 12, name: 'Advanced (12 pairs)' },
]

export default function ConceptMatching() {
  const [selectedModule, setSelectedModule] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<number>(8) // Default to intermediate
  const [termPairs, setTermPairs] = useState<TermPair[]>([])
  const [cards, setCards] = useState<
    { id: string; content: string; type: 'term' | 'definition'; matched: boolean; selected: boolean }[]
  >([])
  const [firstSelection, setFirstSelection] = useState<number | null>(null)
  const [secondSelection, setSecondSelection] = useState<number | null>(null)
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup')
  const [moves, setMoves] = useState(0)
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [bestScores, setBestScores] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  // Load best scores from localStorage
  useEffect(() => {
    const storedScores = localStorage.getItem('matchingGameBestScores')
    if (storedScores) {
      setBestScores(JSON.parse(storedScores))
    }
  }, [])

  // Run timer when game is active
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (timerActive) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive])

  // Generate term pairs from quiz data
  const generateTermPairs = async (moduleId: string, pairCount: number): Promise<TermPair[]> => {
    try {
      // Fetch quiz data for the module
      const response = await fetch(`/api/quiz-data?id=${moduleId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch quiz data')
      }

      const quizData = await response.json()

      // Define a proper type for quiz questions
      interface QuizQuestion {
        question: string
        options: string[]
        correctAnswer: number
      }

      // Transform quiz questions into term pairs
      const pairs = quizData.map((question: QuizQuestion, index: number) => ({
        id: `pair-${index}`,
        term: question.question,
        definition: question.options[question.correctAnswer],
      }))

      // Shuffle and take required number of pairs
      return shuffleArray(pairs).slice(0, pairCount) as TermPair[]
    } catch (error) {
      console.error('Error generating term pairs:', error)
      return []
    }
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

  // Prepare and start the game
  const startGame = async () => {
    setLoading(true)

    // Generate term pairs
    const pairs = await generateTermPairs(selectedModule, selectedLevel)
    setTermPairs(pairs)

    // Create and shuffle cards
    const termCards = pairs.map((pair: TermPair) => ({
      id: pair.id,
      content: pair.term,
      type: 'term' as const,
      matched: false,
      selected: false,
    }))

    const definitionCards = pairs.map((pair: TermPair) => ({
      id: pair.id,
      content: pair.definition,
      type: 'definition' as const,
      matched: false,
      selected: false,
    }))

    // Shuffle all cards
    const allCards = shuffleArray([...termCards, ...definitionCards])
    setCards(allCards)

    // Reset game state
    setFirstSelection(null)
    setSecondSelection(null)
    setMoves(0)
    setMatchedPairs(0)
    setTimer(0)

    // Start game
    setGameState('playing')
    setTimerActive(true)
    setLoading(false)
  }

  // Handle card selection
  const handleCardSelect = (index: number) => {
    // Ignore if card is already matched or selected
    if (cards[index].matched || cards[index].selected) return

    // Ignore if two cards are already flipped and not yet processed
    if (firstSelection !== null && secondSelection !== null) return

    // Update card selection state
    const updatedCards = [...cards]
    updatedCards[index].selected = true
    setCards(updatedCards)

    // Set selections
    if (firstSelection === null) {
      setFirstSelection(index)
    } else {
      setSecondSelection(index)

      // Increment moves counter
      setMoves(moves + 1)

      // Check for match
      setTimeout(() => {
        checkForMatch(firstSelection, index)
      }, 750)
    }
  }

  // Check if selected cards match
  const checkForMatch = (first: number, second: number) => {
    const firstCard = cards[first]
    const secondCard = cards[second]

    const updatedCards = [...cards]

    // Check if cards have the same id and different types
    if (firstCard.id === secondCard.id && firstCard.type !== secondCard.type) {
      // It's a match!
      updatedCards[first].matched = true
      updatedCards[second].matched = true

      // Trigger confetti on successful match
      if (typeof window !== 'undefined') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }

      // Increment matched pairs
      const newMatchedPairs = matchedPairs + 1
      setMatchedPairs(newMatchedPairs)

      // Check if game is finished
      if (newMatchedPairs === termPairs.length) {
        finishGame()
      }
    }

    // Reset selections
    updatedCards[first].selected = false
    updatedCards[second].selected = false

    setCards(updatedCards)
    setFirstSelection(null)
    setSecondSelection(null)
  }

  // Finish the game
  const finishGame = () => {
    setGameState('finished')
    setTimerActive(false)

    // Calculate score (lower is better)
    const score = moves

    // Check if this is a new best score
    const scoreKey = `${selectedModule}-${selectedLevel}`
    if (!bestScores[scoreKey] || score < bestScores[scoreKey]) {
      const newBestScores = {
        ...bestScores,
        [scoreKey]: score,
      }
      setBestScores(newBestScores)
      localStorage.setItem('matchingGameBestScores', JSON.stringify(newBestScores))
    }
  }

  // Format time display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get current best score
  const getCurrentBestScore = () => {
    const scoreKey = `${selectedModule}-${selectedLevel}`
    return bestScores[scoreKey] || '-'
  }

  // Determine card layout based on pair count
  const getCardGridClass = () => {
    if (selectedLevel <= 6) {
      return 'grid-cols-4'
    } else if (selectedLevel <= 10) {
      return 'grid-cols-4 md:grid-cols-4'
    } else {
      return 'grid-cols-4 md:grid-cols-6'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
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
          <h1 className="text-3xl font-bold text-green-600 dark:text-green-400">Concept Matching</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Match related terms and concepts by finding their pairs. Flip cards to reveal them and find all matches.
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
                    <Select value={selectedModule} onValueChange={(value: string) => setSelectedModule(value)}>
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
                    <Select
                      value={selectedLevel.toString()}
                      onValueChange={(value: string) => setSelectedLevel(parseInt(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {gameLevels.map((level) => (
                          <SelectItem key={level.pairs} value={level.pairs.toString()}>
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedModule && (
                    <div className="py-2">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Best Score (Moves):</h3>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{getCurrentBestScore()}</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={startGame}
                      disabled={!selectedModule || loading}
                    >
                      {loading ? 'Loading Cards...' : 'Start Matching Game'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="max-w-6xl mx-auto">
            {/* Game info bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Moves</span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{moves}</h2>
                </div>

                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Pairs Found</span>
                  <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {matchedPairs} / {termPairs.length}
                  </h2>
                </div>

                <div className="text-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Time</span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatTime(timer)}</h2>
                </div>
              </div>

              <div className="mt-3">
                <Progress value={(matchedPairs / termPairs.length) * 100} className="h-2" />
              </div>
            </div>

            {/* Game board */}
            <div className={`grid ${getCardGridClass()} gap-3 mb-6`}>
              <AnimatePresence>
                {cards.map((card, index) => (
                  <motion.div
                    key={`${card.id}-${card.type}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    whileHover={{ scale: card.matched ? 1 : 1.03 }}
                    onClick={() => handleCardSelect(index)}
                  >
                    <div
                      className={`relative h-32 md:h-40 rounded-lg shadow-md cursor-pointer transform transition-transform 
                        ${card.matched ? 'bg-green-100 dark:bg-green-900 opacity-80' : 'bg-white dark:bg-gray-800'}`}
                      style={{ perspective: '1000px' }}
                    >
                      <div
                        className={`absolute w-full h-full rounded-lg backface-hidden transform transition-all duration-500
                          ${card.selected || card.matched ? 'rotate-y-180' : ''}`}
                        style={{
                          transformStyle: 'preserve-3d',
                          backfaceVisibility: 'hidden',
                          transform: card.selected || card.matched ? 'rotateY(180deg)' : '',
                        }}
                      >
                        {/* Card back */}
                        <div className="absolute w-full h-full flex items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-blue-500 text-white text-2xl p-2">
                          <span className="text-center">🔄</span>
                        </div>
                      </div>

                      {/* Card front (content) */}
                      <div
                        className={`absolute w-full h-full rounded-lg p-3 flex items-center justify-center backface-hidden transform transition-all duration-500
                          ${card.selected || card.matched ? '' : 'rotate-y-180'}
                          ${card.type === 'term' ? 'bg-blue-50 dark:bg-blue-900' : 'bg-green-50 dark:bg-green-900'}`}
                        style={{
                          transformStyle: 'preserve-3d',
                          backfaceVisibility: 'hidden',
                          transform: card.selected || card.matched ? '' : 'rotateY(180deg)',
                        }}
                      >
                        <div className="text-center overflow-auto max-h-full text-sm">
                          {card.content}

                          {card.matched && (
                            <div className="absolute top-1 right-1">
                              <span className="text-green-600 dark:text-green-400">✓</span>
                            </div>
                          )}

                          <div className="absolute bottom-1 left-1">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                card.type === 'term'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                                  : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                              }`}
                            >
                              {card.type === 'term' ? 'Term' : 'Definition'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Reset button */}
            <div className="text-center">
              <Button variant="outline" onClick={() => setGameState('setup')} className="inline-flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                Reset Game
              </Button>
            </div>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="max-w-md mx-auto">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Well Done!</h2>

                  <div className="py-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Stats</p>

                    <div className="flex justify-center space-x-8 mt-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Moves</p>
                        <p className="text-3xl font-semibold text-green-600 dark:text-green-400">{moves}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                        <p className="text-3xl font-semibold text-blue-600 dark:text-blue-400">{formatTime(timer)}</p>
                      </div>
                    </div>
                  </div>

                  {moves === getCurrentBestScore() && (
                    <div className="py-2">
                      <Badge className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm">New Best Score!</Badge>
                    </div>
                  )}

                  <div className="space-y-3 pt-4">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={startGame}>
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

// Add CSS for the 3D flip effect
const styles = `
.backface-hidden {
  backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}
`

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.appendChild(document.createTextNode(styles))
  document.head.appendChild(styleElement)
}
