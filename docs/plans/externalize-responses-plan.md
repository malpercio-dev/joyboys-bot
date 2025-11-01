# Plan: Externalize Bot Responses with Random Selection

## Overview
Move all hardcoded user-facing response strings to a centralized file and implement random selection from multiple response options for each action type.

## Goals
1. Extract all hardcoded response strings from the codebase
2. Create a structured responses file with multiple options per action
3. Create a utility function to randomly select responses
4. Update all code to use the centralized response system
5. Maintain the bot's irreverent, sarcastic tone across all variations

## Current Hardcoded Responses Found

### Registration Command (`src/commands/register.ts`)
- Command description: "Register your snail with BigNickBot"
- Modal title: "Register with BigNickBot"
- Modal placeholder: "Your in-game name"
- Server-only error: "This command can only be used in a server."
- Permission error: "You don't have permission to use this command. You need the member or admin role."

### Registration Modal (`src/interactions/modals/register.ts`)
- Empty name validation: "Nice try, but that name doesn't work. Try again when you've got your act together."
- Too long validation: "That name is too long. Keep it under 100 characters, will you?"
- Welcome embed title: "Welcome!"
- Welcome embed description (first-time): "Well, well, look who decided to join us. Welcome, {inGameName}. Try not to mess this up."
- Name updated embed title: "Name Updated"
- Name updated embed description (re-registration): "Changed your mind about your name, did you? Fine, you're now {inGameName}. Don't make me update this again."
- Generic error: "Something went wrong. Try again later."

### Interaction Handler (`src/utils/interactionHandler.ts`)
- Command execution error: "There was an error while executing this command!"
- Modal submission error: "There was an error processing your submission!"

## Implementation Plan

### 1. Create Response Data Structure

**File**: `src/config/responses.ts`

Structure:
```typescript
export interface ResponseSet {
  responses: string[];
}

export interface Responses {
  registration: {
    commandDescription: string; // Single string - shown in Discord help
    modalTitle: string; // Single string - consistent UI
    modalPlaceholder: string; // Single string - consistent UI
    serverOnlyError: ResponseSet; // Variable - random selection
    permissionError: ResponseSet; // Variable - random selection
    validation: {
      emptyName: ResponseSet; // Variable - random selection
      nameTooLong: ResponseSet; // Variable - random selection
    };
    success: {
      firstTime: {
        title: string; // Single string - consistent UI
        description: ResponseSet; // Variable - random selection
      };
      reRegistration: {
        title: string; // Single string - consistent UI
        description: ResponseSet; // Variable - random selection
      };
    };
    genericError: ResponseSet; // Variable - random selection
  };
  errors: {
    commandExecution: ResponseSet; // Variable - random selection
    modalSubmission: ResponseSet; // Variable - random selection
  };
}
```

### 2. Create Response Utility Function

**File**: `src/utils/responses.ts`

Functions:
- `getRandomResponse(set: ResponseSet, replacements?: Record<string, string>): string`
  - Randomly selects from response set
  - Supports string replacements (e.g., `{inGameName}` → actual name)
  - Handles empty arrays gracefully (returns default message)

### 3. Response Data File

**File**: `src/config/responses.ts` (expand the structure)

Each action will have 3-5 variations to choose from, maintaining the bot's tone:
- Sarcastic/dry wit
- Light insults acceptable
- Casual, irreverent tone

Example variations:
```typescript
validation: {
  emptyName: {
    responses: [
      "Nice try, but that name doesn't work. Try again when you've got your act together.",
      "What, you thought I'd accept an empty name? Come back when you've decided on something.",
      "Nope. Empty names aren't a thing here. Try again.",
      // ... more variations
    ]
  },
  // ...
}
```

### 4. Update Files

**Files to modify:**
1. `src/commands/register.ts` - Use response utility for all strings
2. `src/interactions/modals/register.ts` - Use response utility for all strings
3. `src/utils/interactionHandler.ts` - Use response utility for error messages

**Update pattern:**
```typescript
// Before:
content: "Nice try, but that name doesn't work. Try again when you've got your act together."

// After:
content: getRandomResponse(responses.registration.validation.emptyName)
```

### 5. Testing Considerations

- Test that responses are randomly selected (not always same)
- Test that string replacements work correctly (e.g., `{inGameName}`)
- Ensure all existing tests still pass (may need to adjust assertions if they check exact strings)
- Consider adding tests for response utility function

## File Structure

```
src/
├── config/
│   ├── index.ts (existing)
│   └── responses.ts (new - contains all response data)
├── utils/
│   └── responses.ts (new - response selection utility)
└── ...
```

## Response Variations Strategy

For each response category, create 3-5 variations that:
- Maintain consistent tone (irreverent, sarcastic)
- Convey the same information
- Feel natural and varied
- Don't break functionality (e.g., don't change required placeholders)

## Edge Cases

1. **Empty response arrays**: Return a default fallback message
2. **String replacements**: Handle missing replacements gracefully (keep placeholder or provide default)
3. **Type safety**: Ensure TypeScript catches missing response keys
4. **Command descriptions**: Some are single strings (not arrays) - keep as single string or allow variations?

## Decisions Made

1. **Keep consistent (single strings):**
   - Command descriptions (Discord shows in help)
   - Modal titles
   - Modal placeholders
   - Embed titles
   
2. **Variable (random selection from arrays):**
   - Error messages
   - Validation messages
   - Embed descriptions
   - All user-facing error content

3. **Response format**: TypeScript for type safety and easier maintenance

4. **Variations per response**: 3-5 variations per response type for good variety without maintenance burden

## Implementation Steps

1. ✅ Create `src/config/responses.ts` with full response data structure
2. ✅ Create `src/utils/responses.ts` with selection utility
3. ✅ Update `src/commands/register.ts` to use responses
4. ✅ Update `src/interactions/modals/register.ts` to use responses
5. ✅ Update `src/utils/interactionHandler.ts` to use responses
6. ✅ Run tests and fix any that check exact strings
7. ✅ Verify random selection works in practice

## Testing Strategy

- Update existing tests to check for response patterns rather than exact strings
- Test response utility function directly
- Integration test: verify bot responds with valid messages (not undefined/null)
- Manual test: run bot and verify variety in responses across multiple interactions
