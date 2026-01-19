# Notifications System

## What

Toast notifications and celebration animations for user feedback.

## Why

- **Immediate Feedback**: Users know right away if submission succeeded/failed
- **Motivation**: Confetti celebration on success encourages users
- **Clarity**: Clear error messages help users fix mistakes

## How

### Toast Notifications

The system uses `sonner` for toast notifications.

**Installation:**

```bash
pnpm add sonner
```

**Setup:**

**File:** `src/app/providers.tsx` (or root layout)

```typescript
'use client'

import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="bottom-right" />
    </>
  )
}
```

**Usage in Hook:**

**File:** `src/hooks/api/challenges/use-submit-challenge.ts`

```typescript
import { toast } from 'sonner'

export function useSubmitChallenge() {
  const mutation = useMutation({
    // ... mutation config

    onSuccess: (data) => {
      // Success toasts based on score
      if (data.summary.passed === data.summary.total && data.summary.total > 0) {
        toast.success(`🎉 Challenge completed! ${data.summary.passed}/${data.summary.total} tests passed`, {
          duration: 5000,
          action: {
            label: 'View History',
            onClick: () => router.push('./submissions'),
          },
        })
      } else if (data.summary.failed > 0) {
        toast.info(`${data.summary.passed}/${data.summary.total} tests passed. Keep trying!`, {
          duration: 4000,
        })
      } else if (data.status === 'error') {
        toast.error('Code execution failed. Check for syntax errors.', {
          duration: 5000,
        })
      }
    },

    onError: (error: Error) => {
      toast.error(`Submission failed: ${error.message}`, {
        duration: 5000,
      })
    },
  })

  return { /* ... */ }
}
```

**Custom Styles:**

**File:** `src/app/globals.css`

```css
.sonner {
  --normal-bg: hsl(var(--background));
  --normal-border: hsl(var(--border));
  --normal-text: hsl(var(--foreground));
  --success-bg: hsl(var(--green-50));
  --success-border: hsl(var(--green-200));
  --success-text: hsl(var(--green-900));
}

.sonner-success {
  background: hsl(var(--green-50));
  border-color: hsl(var(--green-200));
  color: hsl(var(--green-900));
}

.sonser-error {
  background: hsl(var(--red-50));
  border-color: hsl(var(--red-200));
  color: hsl(var(--red-900));
}
```

### Confetti Celebration

**Installation:**

```bash
pnpm add canvas-confetti
```

**Implementation:**

**File:** `src/hooks/api/challenges/use-submit-challenge.ts`

```typescript
import confetti from 'canvas-confetti'

function triggerConfetti() {
  const duration = 3000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      return clearInterval(interval)
    }

    const particleCount = 50 * (timeLeft / duration)

    // Left side burst
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    })

    // Right side burst
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    })
  }, 250)
}
```

**Call on Success:**

```typescript
onSuccess: (data) => {
  if (data.summary.passed === data.summary.total && data.summary.total > 0) {
    triggerConfetti()
  }
}
```

### Custom Confetti Patterns

#### Simple Burst

```typescript
function simpleBurst() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a'],
  })
}
```

#### Cannon Effect

```typescript
function cannonEffect() {
  const count = 200
  const defaults = { origin: { y: 0.7 } }

  function fire(particleRatio: number, opts: any) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    })
  }

  setTimeout(() => fire(0.25, { spread: 26, startVelocity: 55 }), 0)
  setTimeout(() => fire(0.2, { spread: 60 }), 100)
  setTimeout(() => fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 }), 200)
  setTimeout(() => fire(0.1, { speed: 90, decay: 0.92, scalar: 0.6 }), 300)
  setTimeout(() => fire(0.1, { speed: 90, decay: 0.92, scalar: 0.6 }), 450)
}
```

#### Realistic Look

```typescript
function realisticConfetti() {
  const end = Date.now() + 1000
  const colors = ['#ff0000', '#00ff00', '#0000ff']

  ;(function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }())
}
```

### In-App Notifications

For persistent notifications within the app:

```typescript
import { useStore } from '@/stores/notification-store'

// In component
const { addNotification } = useStore()

addNotification({
  type: 'success',
  title: 'Challenge completed!',
  message: 'All tests passed. Great job!',
  duration: 5000,
})
```

## Notification Types

| Type | Component | Duration | Use Case |
|------|-----------|----------|----------|
| `success` | `toast.success()` | 4000-5000ms | All tests passed |
| `info` | `toast.info()` | 3000-4000ms | Some tests passed |
| `error` | `toast.error()` | 5000ms | Execution/submission failed |
| `warning` | `toast.warning()` | 4000ms | Edge cases (timeouts, etc.) |
| `loading` | `toast.loading()` | Until resolved | Long-running operations |

## Best Practices

1. **Be Specific**
   ```typescript
   // ✅ GOOD
   toast.success('3/4 tests passed. Keep trying!')

   // ❌ BAD
   toast.success('Submitted!')
   ```

2. **Include Next Steps**
   ```typescript
   toast.success('Challenge completed! View your solution in the history.', {
     action: {
       label: 'View',
       onClick: () => router.push('./submissions')
     }
   })
   ```

3. **Handle Dismissal**
   ```typescript
   toast.success('Message', {
     dismissable: true,
     onDismiss: () => console.log('Toast dismissed')
   })
   ```

4. **Don't Overwhelm**
   ```typescript
   // Debounce rapid toasts
   const lastToast = useRef<string>()
   const showToast = (message: string) => {
     if (lastToast.current === message) return
     lastToast.current = message
     toast.info(message)
   }
   ```

## Sound Effects (Optional)

```typescript
import successSound from '@/sounds/success.mp3'
import errorSound from '@/sounds/error.mp3'

function playSound(type: 'success' | 'error') {
  const audio = new Audio(type === 'success' ? successSound : errorSound)
  audio.volume = 0.3 // 30% volume
  audio.play().catch(() => {
    // Auto-play blocked, ignore
  })
}

// Use in toast
onSuccess: () => {
  playSound('success')
  toast.success('Done!')
}
```

## Accessibility

1. **ARIA Live Regions**
   ```typescript
   toast.success('Message', {
     description: 'Screen reader description'
   })
   ```

2. **Keyboard Navigation**
   - Sonner toasts are keyboard accessible by default
   - Press `Esc` to dismiss
   - `Tab` to navigate between action buttons

3. **Duration**
   - Keep between 3-5 seconds
   - Longer for important messages
   - Infinite duration for critical errors (with dismiss button)

## Testing

```typescript
import { toast } from 'sonner'

describe('Notifications', () => {
  beforeEach(() => {
    // Clear all toasts before each test
    toast.dismiss()
  })

  it('shows success toast', () => {
    toast.success('Test passed')

    expect(screen.getByText('Test passed')).toBeInTheDocument()
  })

  it('shows confetti on success', () => {
    const { getByText } = render(<SuccessComponent />)

    fireEvent.click(getByText('Submit'))

    // Verify confetti was called
    expect(confetti).toHaveBeenCalled()
  })
})
```

## Dependencies

- `sonner` - Toast notifications
- `canvas-confetti` - Confetti animation

## Next Steps

- → [Go to Error Handling](./error-handling.md) for error message patterns
- → [Go to Performance](./performance.md) for optimization tips
