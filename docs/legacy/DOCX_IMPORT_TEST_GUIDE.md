# DOCX Import Feature — Test Guide

## Feature Summary
The DOCX import feature allows users to upload a Word document (`.docx` file) and automatically extract slide outlines based on document headings and content.

**Implementation Status:** ✅ Complete

### Files Modified/Created
1. **New Hook:** `/hooks/useDocxImport.ts` (86 lines)
   - `parseDocx(file: File): Promise<DocxOutline[]>`
   - Handles DOCX validation, parsing, and content extraction
   - Uses mammoth library for DOCX → HTML conversion
   - Uses DOM parser to extract headings as slide titles and paragraphs as slide bodies

2. **Updated Component:** `/components/slide-studio/SlideSidebar.tsx` (288 lines)
   - Added DOCX import section UI (lines 257-284)
   - Added handler `handleDocxImport()` (lines 75-98)
   - Added imports for `useDocxImport` hook and `FileText` icon
   - Integrated with existing slide studio state management

3. **Installed Dependency:** `mammoth@2.5.0`
   - Lightweight DOCX parser (~15KB gzip)
   - Client-side only, no backend calls

## Architecture Flow

```
User clicks "Tải DOCX Outline" button
  ↓
File input triggers (accept=".docx")
  ↓
handleDocxImport() called with selected file
  ↓
parseDocx(file) → mammoth.convertToHtml()
  ↓
Extract headings (h1-h6) as slide titles
Extract paragraphs/li as slide bodies (bullet format)
  ↓
Return outline: DocxOutline[] = [
  { title: "...", body: "• ...\n• ...\n• ..." },
  ...
]
  ↓
Set state:
  - slideCount = outline.length (clamped 4-12)
  - deckTopic = comma-separated titles
  ↓
User clicks "Tạo toàn bộ Deck"
  ↓
generateDeck() uses updated topic/count
  ↓
AI generates slide content + BG images
```

## Test Checklist

### ✅ Unit Tests (Hook Logic)

- [ ] **Parse Simple DOCX** (2-3 headings)
  ```
  Input: test_outline.docx (4 headings with content)
  Expected: 4 DocxOutline objects with correct titles and bodies
  ```

- [ ] **Heading Extraction**
  ```
  Expected: All h1-h6 headings → slide titles
  Expected: Heading text trimmed and normalized
  ```

- [ ] **Content Extraction**
  ```
  Expected: Paragraphs between headings collected
  Expected: Multiple paragraphs joined with \n
  Expected: Format: "• paragraph text"
  ```

- [ ] **Edge Cases**
  - Empty DOCX → throws "No content found"
  - No headings → throws "No content found"
  - Consecutive headings → each creates slide with empty body
  - Multiple paragraphs per section → joined with \n

### ✅ UI Tests (Component Integration)

- [ ] **Button Renders**
  - DOCX import section visible in SlideSidebar
  - Button text: "Tải DOCX Outline"
  - FileText icon displays correctly

- [ ] **File Input Works**
  - Click button → file picker opens
  - Only .docx files selectable (accept=".docx")
  - Can select a DOCX file

- [ ] **Loading State**
  - While parsing: Button shows spinner + "Đang xử lý..."
  - Disabled during loading (cursor: not-allowed)

- [ ] **State Updates**
  - After import:
    - `slideCount` = outline.length (clamped 4-12)
    - `deckTopic` = titles joined by ", "
    - UI reflects new values

- [ ] **Error Handling**
  - Invalid file type → alert shown
  - Corrupted DOCX → alert shown
  - Network issue → alert shown

### ✅ Integration Tests (Full Flow)

- [ ] **End-to-End Generation**
  1. Import sample DOCX (4 slides)
  2. Verify slideCount = 4, deckTopic populated
  3. Click "Tạo toàn bộ Deck"
  4. Verify generateDeck() starts
  5. Verify slides generated from DOCX content
  6. Verify BG images generated for each slide

- [ ] **Persistence**
  - Import DOCX → deck generated
  - Reload page
  - Verify slides still present (localStorage)

- [ ] **Export**
  - Import DOCX → generate deck
  - Export to PPTX/PDF/PNG
  - Verify exported file contains DOCX content

### ✅ Edge Cases

- [ ] **Large DOCX** (20+ slides)
  - Expected: slideCount clamped to 12
  - Only first 12 slides used

- [ ] **Complex Formatting**
  - Tables → converted to text
  - Lists (ul/ol) → bullet format
  - Images → ignored (AI generates BGs)
  - Bold/italics → stripped to plain text

- [ ] **Special Characters**
  - Unicode (日本語, 한국어, etc.) → preserved
  - Symbols & special chars → preserved
  - HTML entities (&amp;) → decoded

- [ ] **Concurrent Operations**
  - Don't crash if importing while generating
  - File input disabled during load

## Manual Test Steps

### Scenario 1: Simple DOCX Import

1. Start slide studio
2. Look for "📄 Import DOCX Outline" section
3. Click "Tải DOCX Outline" button
4. Select `/tmp/test_outline.docx`
5. Verify:
   - Loading spinner shows
   - After 1-2 seconds, disappears
   - `slideCount` changed to 4
   - `deckTopic` shows all 4 titles

### Scenario 2: Generate After Import

1. Complete Scenario 1
2. Select style (e.g., "Corporate")
3. Select language (e.g., "English")
4. Click "Tạo toàn bộ Deck"
5. Verify:
   - Modal shows 4 slides
   - Click "Confirm"
   - AI starts generating slides
   - 4 slides created with imported titles
   - BG images generate sequentially

### Scenario 3: Error Handling

1. Click "Tải DOCX Outline"
2. Try to select non-.docx file (e.g., .txt)
3. Verify: Alert shows "Invalid file type"

### Scenario 4: Persistence

1. Complete Scenario 2 (deck generated)
2. Reload page (Cmd+R)
3. Return to slide studio
4. Verify:
   - 4 slides still visible
   - Titles match imported content
   - BG images preserved

## Test DOCX Files

### Create Your Own Test DOCX

Use Microsoft Word or Google Docs:

1. Create document with structure:
   ```
   # Introduction to AI Presentations
   What is AI-powered slide generation?
   Benefits over traditional slide creation
   
   # Getting Started with the Platform
   Simple 3-step setup process
   Importing your existing content
   
   # Advanced Features & Customization
   AI-powered background generation
   Multi-language support
   
   # Case Studies & Results
   Enterprise adoption success stories
   ```

2. Save as `.docx`
3. Upload to slide studio
4. Verify: 4 slides extracted with correct content

### Pre-built Test DOCX

Located at: `/tmp/test_outline.docx`

Contains:
- 4 headings (h1)
- 2-3 paragraphs per heading
- Total size: 2KB

## Browser DevTools Debugging

### Check Console Logs

```javascript
// In browser console:
localStorage.getItem('skyverses_AI-SLIDE-CREATOR_vault')
// Should show: { deckTopic: "..., ..., ...", slideCount: 4, ... }
```

### Network Calls

When generating deck after DOCX import:
1. aiTextViaProxy() call with outline prompt
2. imagesApi.createJob() × 4 (for BG images)
3. Check Network tab for timing

### Component State

In React DevTools:
1. Select SlideSidebar component
2. Props should show:
   - `deckTopic` = imported titles
   - `slideCount` = outline length
   - `slides` = generated Slide[] array

## Performance Benchmarks

| Operation | Target | Notes |
|-----------|--------|-------|
| DOCX parse | <1s | File read + mammoth conversion |
| UI update | <100ms | State updates trigger re-renders |
| Full generation | 30-60s | AI outline + 4× BG generation |
| Export | 5-10s | PPTX/PDF rendering |

## Known Limitations & Future Improvements

### Current Limitations
1. Only extracts text content (no images)
2. Heading levels all treated as slide titles (no hierarchy)
3. Max 12 slides (hardcoded limit)
4. No preview before generation

### Future Enhancements
- [ ] Show outline preview before generation
- [ ] Allow selecting which slides to use
- [ ] Heading hierarchy support (H2 as sub-content)
- [ ] Image extraction from DOCX
- [ ] Custom heading-to-title mapping
- [ ] Batch import multiple DOCXes
- [ ] Drag-drop support for file upload

## Success Criteria

✅ Feature is production-ready when:
1. All unit tests pass
2. All integration tests pass
3. No console errors in DevTools
4. DOCX parsing works with real-world documents
5. Exported presentations include imported content
6. localStorage persistence verified
7. Performance acceptable (no lag, loading states visible)

---

**Test Environment:**
- Browser: Chrome/Safari/Firefox (latest)
- Node: v18+
- React: 19.2.3
- TypeScript: 5.4.5

**Questions or Issues?**
1. Check browser console for errors
2. Verify test DOCX exists: `/tmp/test_outline.docx`
3. Check mammoth dependency installed: `npm ls mammoth`
4. Clear localStorage: `localStorage.clear()`

