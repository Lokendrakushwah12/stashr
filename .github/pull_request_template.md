## Description

<!-- Provide a clear and concise description of your changes -->

**What does this PR do?**


**Why is this change needed?**


**Related Issue:** Fixes #(issue number)

## Type of Change

<!-- Check all that apply -->

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring (no functional changes)
- [ ] UI/UX improvement
- [ ] Tests

## Testing

### How Has This Been Tested?

<!-- Describe the tests you ran to verify your changes -->

- [ ] Manual testing in browser
- [ ] Tested as Owner
- [ ] Tested as Editor (if collaboration feature)
- [ ] Tested as Viewer (if collaboration feature)
- [ ] Tested on mobile viewport (< 768px)
- [ ] Tested on desktop viewport (> 768px)
- [ ] Tested with empty state (no data)
- [ ] Tested with existing data

**Test Configuration:**
- Node version: 
- Browser: 
- Operating System: 

## Screenshots/Videos

<!-- Add screenshots or screen recordings to demonstrate the changes -->

### Before (if applicable)


### After


## Code Quality Checklist

### General

- [ ] Code follows the project's style guidelines
- [ ] Self-review performed
- [ ] No TypeScript `any` types added
- [ ] No direct `fetch` calls (used hooks and API layer)
- [ ] Used `??` instead of `||` for null coalescing
- [ ] All imports use `import type` where applicable

### TypeScript

- [ ] Proper types defined for all new interfaces
- [ ] No linter errors (`npm run lint` passes)
- [ ] Mongoose models have proper type definitions
- [ ] API request/response types match implementation

### React/Next.js

- [ ] Used custom hooks instead of direct API calls
- [ ] Loading and error states handled
- [ ] Used React Query for data fetching/mutations
- [ ] Async `params` properly awaited (Next.js 15)
- [ ] No `useEffect` with missing dependencies

### API Routes

- [ ] Authentication checked (`getServerSession`)
- [ ] Permissions validated (owner/editor/viewer)
- [ ] Input validation implemented
- [ ] Mongoose documents converted to objects (`.toObject()`)
- [ ] Error handling with proper status codes

### Database

- [ ] Mongoose models registered in `models/index.ts`
- [ ] Schema includes proper indexes
- [ ] Field validation added
- [ ] Timestamps enabled

### UI/UX

- [ ] Components are responsive
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] Consistent with existing design
- [ ] Loading states show feedback
- [ ] Error messages are user-friendly

## Documentation

- [ ] Code is commented where necessary
- [ ] README updated (if needed)
- [ ] API documentation updated (if new endpoints)
- [ ] CONTRIBUTING.md updated (if workflow changed)

## Breaking Changes

<!-- If this PR includes breaking changes, describe them here -->

**Does this PR introduce breaking changes?**
- [ ] No
- [ ] Yes (explain below)

**Migration steps for users (if applicable):**


## Additional Context

<!-- Add any other context, concerns, or notes about the PR here -->


## Reviewer Notes

<!-- Any specific areas you'd like reviewers to focus on? -->


---

**By submitting this PR, I confirm that:**
- [ ] I have read and followed the [Contributing Guidelines](CONTRIBUTING.md)
- [ ] I agree to the [Code of Conduct](CODE_OF_CONDUCT.md)
- [ ] My contributions are licensed under the project's license
