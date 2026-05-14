# Delete Confirmation Modal — Design Spec

## Goal
Prevent accidental quote deletion by requiring explicit confirmation before the delete API call is made.

## Approach
Add a `DeleteConfirmModal` component inline in `client/src/pages/CollectionPage.jsx`, following the same pattern as the existing `EditModal` and `ShuffleModal` components. A new `deletingQuote` state (null or a quote object) drives the modal's visibility.

## Behaviour

### Triggering
Clicking the trash `IconButton` on a `QuoteCard` sets `deletingQuote` to that quote object instead of immediately calling the API. No delete request is sent at this point.

### Modal content
- Flame badge header (same smallcaps style as other modals)
- Truncated quote preview: first 80 characters of `quote.text`, with `…` appended if longer
- One-line warning: "This can't be undone."
- Two buttons: **Delete** (destructive styling) and **Cancel**

### Confirming
Clicking **Delete** calls the existing `handleRemove(deletingQuote.id)` logic, then sets `deletingQuote` to null.

### Cancelling
Clicking **Cancel**, the backdrop, or the × button sets `deletingQuote` to null. No API call is made.

## Files changed
- `client/src/pages/CollectionPage.jsx` — only file touched
  - Add `deletingQuote` state
  - Add `DeleteConfirmModal` component
  - Change `onRemove` in `QuoteCard` calls to set `deletingQuote` instead of calling `handleRemove` directly
  - Render `DeleteConfirmModal` at the bottom of the page alongside the other modals

## Out of scope
- No new files
- No changes to the backend
- No reusable ConfirmModal abstraction
