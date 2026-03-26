import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import QuizView from '@/components/project/QuizView'

// ── Next.js mocks ─────────────────────────────────────────────────────────────

vi.mock('next/image', () => ({
  default: ({ alt, ...rest }: { alt: string; [k: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...rest} />
  ),
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeQuestion = (id: string, difficulty: 'beginner' | 'intermediate' | 'advanced') => ({
  id,
  question: `Question text for ${id}`,
  options: [
    { id: `${id}_a`, text: 'Option A' },
    { id: `${id}_b`, text: 'Option B' },
    { id: `${id}_c`, text: 'Option C' },
    { id: `${id}_d`, text: 'Option D' },
  ],
  correctId: `${id}_a`,
  explanation: `Explanation for ${id}`,
  difficulty,
  topic: `Topic for ${id}`,
})

const questions = [
  makeQuestion('q1', 'beginner'),
  makeQuestion('q2', 'beginner'),
  makeQuestion('q3', 'intermediate'),
  makeQuestion('q4', 'intermediate'),
  makeQuestion('q5', 'advanced'),
  makeQuestion('q6', 'advanced'),
]

const defaultProps = {
  projectIdea: 'A todo app',
  questions,
  onComplete: vi.fn().mockResolvedValue(undefined),
  userName: 'Alice Smith',
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('QuizView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runAllTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('renders the first question text', () => {
    render(<QuizView {...defaultProps} />)
    expect(screen.getByText('Question text for q1')).toBeInTheDocument()
  })

  it('shows the correct progress counter', () => {
    render(<QuizView {...defaultProps} />)
    expect(screen.getByText('1 / 6')).toBeInTheDocument()
  })

  it('shows the intro text with the first name on question 1', () => {
    render(<QuizView {...defaultProps} />)
    expect(screen.getByText(/Let.s see where you.re at, Alice!/)).toBeInTheDocument()
  })

  it('shows the difficulty badge on each question', () => {
    render(<QuizView {...defaultProps} />)
    expect(screen.getByText('beginner')).toBeInTheDocument()
  })

  it('shows the topic label', () => {
    render(<QuizView {...defaultProps} />)
    expect(screen.getByText('Topic for q1')).toBeInTheDocument()
  })

  it('renders all 4 answer options', () => {
    render(<QuizView {...defaultProps} />)
    expect(screen.getByText('Option A')).toBeInTheDocument()
    expect(screen.getByText('Option B')).toBeInTheDocument()
    expect(screen.getByText('Option C')).toBeInTheDocument()
    expect(screen.getByText('Option D')).toBeInTheDocument()
  })

  it('shows A B C D labels on options before selection', () => {
    render(<QuizView {...defaultProps} />)
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getByText('D')).toBeInTheDocument()
  })

  it('shows explanation after selecting an option', () => {
    render(<QuizView {...defaultProps} />)
    fireEvent.click(screen.getByText('Option A'))
    expect(screen.getByText('Explanation for q1')).toBeInTheDocument()
  })

  it('shows "Exactly right!" when the correct option is selected', () => {
    render(<QuizView {...defaultProps} />)
    fireEvent.click(screen.getByText('Option A')) // q1_a is correct
    expect(screen.getByText(/Exactly right!/)).toBeInTheDocument()
  })

  it('shows "Good to know:" when a wrong option is selected', () => {
    render(<QuizView {...defaultProps} />)
    fireEvent.click(screen.getByText('Option B')) // q1_b is wrong
    expect(screen.getByText(/Good to know:/)).toBeInTheDocument()
  })

  it('disables all options after selection', () => {
    render(<QuizView {...defaultProps} />)
    fireEvent.click(screen.getByText('Option A'))
    const buttons = screen.getAllByRole('button')
    // All 4 option buttons should now be disabled
    const optionButtons = buttons.filter((b) => b.hasAttribute('disabled'))
    expect(optionButtons.length).toBe(4)
  })

  it('advances to the next question after the animation delay', async () => {
    render(<QuizView {...defaultProps} />)
    fireEvent.click(screen.getByText('Option A'))

    // 1000ms feedback + 300ms animation
    await act(async () => { vi.advanceTimersByTime(1400) })

    expect(screen.getByText('Question text for q2')).toBeInTheDocument()
    expect(screen.getByText('2 / 6')).toBeInTheDocument()
  })

  it('does not show intro text on question 2', async () => {
    render(<QuizView {...defaultProps} />)
    fireEvent.click(screen.getByText('Option A'))
    await act(async () => { vi.advanceTimersByTime(1400) })

    expect(screen.queryByText(/Let.s see where you.re at/)).not.toBeInTheDocument()
  })

  it('uses readyText prop when provided', () => {
    render(<QuizView {...defaultProps} readyText="Custom ready text here" />)
    expect(screen.getByText('Custom ready text here')).toBeInTheDocument()
  })

  it('calls onComplete with all answers after the last question', async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined)
    render(<QuizView {...defaultProps} questions={[makeQuestion('q1', 'beginner')]} onComplete={onComplete} />)

    fireEvent.click(screen.getByText('Option B')) // wrong answer

    await act(async () => { vi.advanceTimersByTime(1100) })

    expect(onComplete).toHaveBeenCalledOnce()
    expect(onComplete).toHaveBeenCalledWith({ q1: 'q1_b' })
  })

  it('shows "Analyzing your results..." spinner while submitting', async () => {
    // onComplete never resolves so isSubmitting stays true
    const onComplete = vi.fn().mockReturnValue(new Promise(() => {}))
    render(<QuizView {...defaultProps} questions={[makeQuestion('q1', 'beginner')]} onComplete={onComplete} />)

    fireEvent.click(screen.getByText('Option A'))
    await act(async () => { vi.advanceTimersByTime(1100) })

    expect(screen.getByText(/Analyzing your results/)).toBeInTheDocument()
  })
})
