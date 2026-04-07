# Style Sense

## Current State
- Users upload a portrait, enter a Groq API key, and receive skin tone analysis, color palette, and 4 outfit recommendations.
- Each outfit card shows a stylized SVG illustration (OutfitIllustration) with palette colors applied.
- There is no virtual try-on or prompt copy functionality.

## Requested Changes (Diff)

### Add
- **Virtual Try-On via Fashn.ai API**: A "Visualize Outfit" button on each outfit card (in both AnalysisHub results and OutfitShowcase) that opens a modal.
  - Modal collects the user's Fashn.ai API key (stored in localStorage), sends the uploaded portrait + a generated garment image description to Fashn.ai's `/run` endpoint, polls for result, and displays the generated try-on image.
  - Fashn.ai API key input field added to the AnalysisHub API key section (alongside the existing Groq key).
- **Copy Prompt button**: Below the try-on result (or if try-on fails/is skipped), display the full Stable Diffusion / AI image generation prompt that was constructed for this outfit + person. A "Copy Prompt" button lets users copy it to clipboard so they can paste it into tools like Midjourney, DALL-E, or Stable Diffusion.
  - The prompt is generated using Groq vision to describe the person's features, then combined with the outfit description.

### Modify
- **AnalysisHub**: Each outfit card gets a "Visualize Outfit" button.
- **OutfitShowcase**: Each static outfit card's "View Details" button becomes "Visualize Outfit" (opens a prompt-only modal since no user photo in showcase).
- **AnalysisHub**: Add Fashn.ai API key input field below the existing Groq key field.

### Remove
- Nothing removed.

## Implementation Plan
1. Create `VirtualTryOnModal.tsx` component:
   - Props: `outfit`, `palette`, `userImageBase64`, `groqApiKey`, `isOpen`, `onClose`
   - States: fashnApiKey (from localStorage), tryOnStatus (idle/loading/success/error), tryOnImageUrl, generatedPrompt, promptLoading
   - On open: auto-generate the AI prompt using Groq (describe person from portrait + outfit)
   - "Try On" button: calls Fashn.ai `/run` endpoint with portrait + outfit description, polls `/status/{id}` until done, shows result image
   - "Copy Prompt" button: copies the generated prompt to clipboard (always visible once prompt is ready)
   - Fashn.ai key input inside the modal with localStorage persistence
2. Update `AnalysisHub.tsx`:
   - Add `fashnApiKey` state + input field (below Groq key)
   - Pass `imagePreview` (base64) and outfit data to modal
   - Add "Visualize Outfit" button to each outfit card in the lookbook grid
3. Update `OutfitShowcase.tsx`:
   - Change "View Details" to "Visualize Outfit" — opens a prompt-only modal (no user photo, skips try-on, shows prompt + copy button)
