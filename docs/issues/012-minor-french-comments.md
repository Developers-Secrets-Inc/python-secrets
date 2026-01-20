# Minor: French Comments in International Codebase

## Priority
🟡 **Minor** - Code Maintainability

## Locations
- `src/hooks/courses/lessons/use-lesson-progress.ts:26-28`
- Potentially other files

## Problem Description
Code comments are written in French while the codebase is primarily in English:

```typescript
// hooks/courses/lessons/use-lesson-progress.ts
// Mise à jour optimiste ou simple invalidation
// On invalide quand même pour être sûr d'être synchro avec le serveur
```

## Impact
- **International contributors**: Cannot understand comments
- **Code reviews**: Non-French speakers miss context
- **Onboarding**: Confusing for new team members
- **Inconsistency**: Mixed language conventions

## Expected Behavior
All comments should be in English:

```typescript
// Optimistic update or simple invalidation
// Also invalidate to ensure sync with server
queryClient.setQueryData(queryKey, newData)
queryClient.invalidateQueries({ queryKey })
```

## Full Examples

### Before (French)
```typescript
// La solution est débloquée si le flag est vrai OU si la leçon est terminée
isUnlocked: progress?.solutionUnlocked || progress?.status === 'completed',

// On expose la fonction mutateAsync pour pouvoir utiliser "await" dans le composant
unlockSolution: () => mutation.mutateAsync({ solutionUnlocked: true }),
```

### After (English)
```typescript
// Solution is unlocked if flag is true OR if lesson is completed
isUnlocked: progress?.solutionUnlocked || progress?.status === 'completed',

// Expose mutateAsync to allow using "await" in component
unlockSolution: () => mutation.mutateAsync({ solutionUnlocked: true }),
```

## Labels
`minor` `code-quality` `internationalization` `documentation` `good-first-issue`

## Steps to Fix
1. Search all `.ts`, `.tsx` files for French comments
2. Translate to English
3. Add ESLint rule to enforce English comments (optional)
4. Update code style guide

## Search Command
```bash
# Find French comments (examples)
grep -r "est débloquée" src/
grep -r "Mise à jour" src/
grep -r "fonction" src/
```

## ESLint Rule (Optional)
```javascript
// .eslintrc.js
{
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Identifier[name=/^(est|la|le|les|un|une|des|pour|avec|sans|sur|dans)$/]',
        message: 'Use English for variable and function names'
      }
    ]
  }
}
```

## Better Approach
For comments, use a spell-checker or pre-commit hook:
```json
// .github/workflows/lint.yml
- name: Check comment language
  run: npx comment-language-checker --lang en
```

## Additional Context
This is a low-priority issue but affects team collaboration. The project appears to be international (English README, English variable names) so comments should follow suit.

## Convention
Establish in `docs/CONVENTIONS.md`:
```
- All code comments must be in English
- All documentation must be in English
- Variable and function names must be in English
```
