# DOCX Import Feature — QA Testing Checklist

## 🎯 Testing Objective

Verify that the DOCX import feature correctly parses Word documents, extracts content, populates the slide studio, and integrates with the AI deck generation pipeline.

---

## ✅ Pre-Test Setup

- [ ] Dev server running on `http://localhost:3001`
- [ ] Test DOCX file available at `/tmp/test_presentation.docx`
- [ ] Browser console open (F12) for error tracking
- [ ] Network tab ready to monitor API calls
- [ ] User authenticated in the app

---

## 📋 Test Cases

### Test 1: Button Visibility and Access
**Objective:** Verify the DOCX import button is visible and accessible

**Steps:**
1. Navigate to `/product/ai-slide-creator`
2. Look for the slide studio sidebar on the left
3. Scroll down to find the "📄 Import DOCX Outline" button

**Expected Result:**
- Button visible between "🖼️ Ảnh tham chiếu" section and "🪄 Tạo toàn bộ Deck" button
- Button has dashed border, blue text, white background
- Button is clickable and not disabled

**Pass/Fail:** ___

---

### Test 2: File Selection Dialog
**Objective:** Verify file input opens and accepts only DOCX files

**Steps:**
1. Click "📄 Import DOCX Outline" button
2. Verify file picker opens
3. Try selecting a `.txt` file (should reject or be hidden)
4. Select `/tmp/test_presentation.docx`

**Expected Result:**
- File picker opens correctly
- Only DOCX files are shown/accepted (file input should have `.docx` filter)
- File is selected without error

**Pass/Fail:** ___

---

### Test 3: Parsing and State Update
**Objective:** Verify DOCX is parsed and state is updated correctly

**Steps:**
1. Select `/tmp/test_presentation.docx`
2. Wait for loading to complete (should see spinner briefly)
3. Check that:
   - Spinner disappears
   - No error messages appear
   - "Số lượng Slide" (slideCount) updates to a number (3-4)
   - "Chủ đề Deck" (deckTopic) updates with comma-separated heading titles

**Expected Result:**
- Parsing completes within 1-2 seconds
- slideCount: 3 or 4 (from test file structure)
- deckTopic: Contains "Introduction, Main Content, Conclusion" (or similar)
- No console errors

**Pass/Fail:** ___

---

### Test 4: Error Handling - Wrong File Type
**Objective:** Verify graceful error handling for invalid file types

**Steps:**
1. Click "📄 Import DOCX Outline" button
2. Try to select a `.pdf` or `.txt` file
3. Observe behavior

**Expected Result:**
- File picker may filter it out (preferred)
- OR alert message appears: "Invalid file type. Please upload a DOCX file."
- File input resets
- No broken UI state

**Pass/Fail:** ___

---

### Test 5: Error Handling - Corrupted DOCX
**Objective:** Verify handling of corrupted/invalid DOCX files

**Steps:**
1. Create a fake `.docx` file (just rename a `.txt` to `.docx`)
2. Click "📄 Import DOCX Outline" button
3. Select the fake file

**Expected Result:**
- Spinner shows briefly
- Alert appears: "Error parsing DOCX file. Please check the file and try again."
- File input resets
- UI remains responsive

**Pass/Fail:** ___

---

### Test 6: Full Generation with Imported Outline
**Objective:** Verify imported outline is used for deck generation

**Steps:**
1. Import `/tmp/test_presentation.docx` (as in Test 3)
2. Verify slideCount and deckTopic are populated
3. Click "🪄 Tạo toàn bộ Deck" button
4. Wait for generation to complete (should show progress)

**Expected Result:**
- Generation starts without error
- 3-4 slides are created with titles from DOCX
- Each slide has content from DOCX paragraphs (as bullet points)
- Background images generate for each slide
- No console errors during generation

**Pass/Fail:** ___

---

### Test 7: Content Verification
**Objective:** Verify extracted content is correct and formatted properly

**Steps:**
1. After generation (Test 6), click on the first slide
2. Verify:
   - Title matches DOCX heading
   - Body contains bullet points from DOCX paragraphs
3. Check subsequent slides for same pattern

**Expected Result:**
- Slide titles match DOCX heading text
- Body text is formatted as bullet points
- Content is readable and properly formatted
- No missing or corrupted text

**Pass/Fail:** ___

---

### Test 8: Brand Identity in Generated BG
**Objective:** Verify brand context is included in background image prompts

**Steps:**
1. Before generation, add optional brand identity (if UI supports it):
   - Brand Slogan: "Innovation Through AI"
   - Brand Description: "AI-powered content creation platform"
2. Import DOCX and generate deck
3. Check browser network tab for image generation API calls

**Expected Result:**
- API calls include brand context in prompt
- Generated backgrounds appear cohesive
- No errors in generation

**Pass/Fail:** ___

---

### Test 9: LocalStorage Persistence
**Objective:** Verify that imported outline persists in localStorage

**Steps:**
1. Import `/tmp/test_presentation.docx`
2. Note the slideCount and deckTopic values
3. Refresh page (F5)
4. Navigate back to slide studio

**Expected Result:**
- slideCount value is preserved
- deckTopic value is preserved
- No re-import needed after refresh

**Pass/Fail:** ___

---

### Test 10: Mobile Responsiveness
**Objective:** Verify button and dialogs work on mobile viewport

**Steps:**
1. Open DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Set viewport to 375×667 (iPhone SE)
4. Try importing DOCX file on mobile view

**Expected Result:**
- Button remains accessible on mobile
- File picker opens on mobile
- Parsing works without issues
- No layout breakage
- State updates display correctly

**Pass/Fail:** ___

---

## 🔍 Browser Console Checks

After each test, verify:

- [ ] No TypeScript errors in console
- [ ] No "Cannot read property" errors
- [ ] No "mammoth" library errors
- [ ] No API call failures (check Network tab)
- [ ] No memory leaks (DevTools → Memory)

**Console Log:** ___________

---

## 📊 Summary

| Test # | Description | Pass/Fail | Notes |
|--------|-------------|-----------|-------|
| 1 | Button Visibility | ___ | |
| 2 | File Selection | ___ | |
| 3 | Parsing & State | ___ | |
| 4 | Invalid File Type | ___ | |
| 5 | Corrupted DOCX | ___ | |
| 6 | Full Generation | ___ | |
| 7 | Content Verification | ___ | |
| 8 | Brand Identity | ___ | |
| 9 | LocalStorage | ___ | |
| 10 | Mobile | ___ | |

**Overall Status:** ___________

---

## 🐛 Issues Found

Issue #1:
- **Description:** ___________
- **Steps to Reproduce:** ___________
- **Expected vs Actual:** ___________
- **Severity:** [ ] Critical [ ] High [ ] Medium [ ] Low

Issue #2:
- **Description:** ___________
- **Steps to Reproduce:** ___________
- **Expected vs Actual:** ___________
- **Severity:** [ ] Critical [ ] High [ ] Medium [ ] Low

---

## ✅ Sign-Off

- **Tested By:** ___________
- **Date:** ___________
- **Overall Result:** [ ] PASS [ ] FAIL [ ] PARTIAL
- **Ready for Production:** [ ] Yes [ ] No

**Notes:** ___________

