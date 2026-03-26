import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import QuizResults from '@/components/project/QuizResults'

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

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const fullResult = {
  level: 'intermediate',
  levelLabel: 'Confident Builder',
  summary: 'You have a solid foundation and are ready to go deeper.',
  strengths: ['HTML basics', 'CSS layout'],
  focusAreas: ['JavaScript', 'React hooks'],
  encouragement: 'You are crushing it!',
  nextStep: "We'll start with advanced JS patterns.",
}

const defaultProps = {
  result: fullResult,
  projectId: 'proj-123',
  projectIdea: 'A personal finance tracker',
  existingQuiz: null,
  userName: 'Alice',
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('QuizResults', () => {
  it('renders the level label prominently', () => {
    render(<QuizResults {...defaultProps} />)
    expect(screen.getByText('Confident Builder')).toBeInTheDocument()
  })

  it('renders the level badge', () => {
    render(<QuizResults {...defaultProps} />)
    expect(screen.getByText('intermediate level')).toBeInTheDocument()
  })

  it('renders the summary text', () => {
    render(<QuizResults {...defaultProps} />)
    expect(screen.getByText(fullResult.summary)).toBeInTheDocument()
  })

  it('renders all strengths', () => {
    render(<QuizResults {...defaultProps} />)
    expect(screen.getByText('HTML basics')).toBeInTheDocument()
    expect(screen.getByText('CSS layout')).toBeInTheDocument()
  })

  it('renders all focus areas', () => {
    render(<QuizResults {...defaultProps} />)
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('React hooks')).toBeInTheDocument()
  })

  it('renders the encouragement message', () => {
    render(<QuizResults {...defaultProps} />)
    expect(screen.getByText('You are crushing it!')).toBeInTheDocument()
  })

  it('renders the next step', () => {
    render(<QuizResults {...defaultProps} />)
    expect(screen.getByText("We'll start with advanced JS patterns.")).toBeInTheDocument()
  })

  it('renders the project idea', () => {
    render(<QuizResults {...defaultProps} />)
    expect(screen.getByText('A personal finance tracker')).toBeInTheDocument()
  })

  it('renders "See My Roadmap" CTA button', () => {
    render(<QuizResults {...defaultProps} />)
    expect(screen.getByRole('button', { name: /See My Roadmap/i })).toBeInTheDocument()
  })

  it('renders a Dashboard link', () => {
    render(<QuizResults {...defaultProps} />)
    const link = screen.getByRole('link', { name: /Dashboard/i })
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('shows all three level badge colours for each level', () => {
    const levels = ['beginner', 'intermediate', 'advanced'] as const
    levels.forEach((level) => {
      const { unmount } = render(
        <QuizResults {...defaultProps} result={{ ...fullResult, level }} />
      )
      expect(screen.getByText(`${level} level`)).toBeInTheDocument()
      unmount()
    })
  })

  it('falls back to existingQuiz level when result is null', () => {
    render(
      <QuizResults
        {...defaultProps}
        result={null}
        existingQuiz={{
          questions: [],
          answers: {},
          score: 80,
          level: 'advanced',
        }}
      />
    )
    expect(screen.getByText('advanced level')).toBeInTheDocument()
  })

  it('uses default fallback strings when result and existingQuiz are both null', () => {
    render(<QuizResults {...defaultProps} result={null} existingQuiz={null} />)
    // levelLabel fallback is "Explorer"
    expect(screen.getByText('Explorer')).toBeInTheDocument()
    expect(screen.getByText("You've got this!")).toBeInTheDocument()
  })

  it('does not render strengths section when strengths array is empty', () => {
    render(<QuizResults {...defaultProps} result={{ ...fullResult, strengths: [] }} />)
    expect(screen.queryByText('Strengths')).not.toBeInTheDocument()
  })

  it('does not render focus areas section when focusAreas array is empty', () => {
    render(<QuizResults {...defaultProps} result={{ ...fullResult, focusAreas: [] }} />)
    expect(screen.queryByText("We'll Focus On")).not.toBeInTheDocument()
  })

  it('disables the CTA and shows "Building your roadmap..." while loading', async () => {
    // fetch never resolves, so isGenerating stays true
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))

    render(<QuizResults {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /See My Roadmap/i }))

    await waitFor(() => {
      expect(screen.getByText(/Building your roadmap/)).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /Building your roadmap/i })).toBeDisabled()

    vi.unstubAllGlobals()
  })

  it('navigates to roadmap page after successful generation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))

    render(<QuizResults {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /See My Roadmap/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard/project/proj-123/roadmap')
    })

    vi.unstubAllGlobals()
  })
})
