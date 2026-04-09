# 🚀 START HERE - Job Polling Pattern Guide

Welcome! This directory now contains complete documentation on how job creation and polling works across the Skyverses AI generators.

## 📚 Documentation Files

| File | Size | Read Time | Purpose |
|------|------|-----------|---------|
| **START_HERE.md** (this file) | 2KB | 2 min | Navigation guide |
| **QUICK_REFERENCE.md** | 8KB | 5 min | 👈 **START HERE if coding** |
| **JOB_POLLING_PATTERN_ANALYSIS.md** | 20KB | 15 min | Deep technical reference with all line numbers |
| **VIDEO_vs_IMAGE_PATTERN.md** | 16KB | 10 min | Side-by-side comparison showing pattern reuse |
| **FILES_CREATED.md** | 8KB | 3 min | Summary of all documentation |

## 🎯 What Are You Trying To Do?

### I need to understand the basic pattern
→ **Read:** QUICK_REFERENCE.md (5 min)
- Copy-paste templates
- 6 key points explained
- Complete flow diagram

### I'm implementing a new AI generator  
→ **Use:** QUICK_REFERENCE.md + JOB_POLLING_PATTERN_ANALYSIS.md
- Follow checklist in FILES_CREATED.md
- Copy templates from QUICK_REFERENCE.md
- Verify against exact line numbers in JOB_POLLING_PATTERN_ANALYSIS.md

### I need exact code locations for debugging
→ **Reference:** JOB_POLLING_PATTERN_ANALYSIS.md
- Video polling: lines 305-344
- Image polling: lines 250-287
- Video job creation: lines 420-443
- Image job creation: lines 332-366

### I want to understand how reusable the pattern is
→ **Study:** VIDEO_vs_IMAGE_PATTERN.md
- Shows 90% code reuse between generators
- Identical polling algorithm
- Only API/model-specific parts differ

### I'm looking for a specific feature (e.g., refund logic)
→ **Jump to:**
- **Credit refunds:** JOB_POLLING_PATTERN_ANALYSIS.md line 320 (video) or 262 (image)
- **ID swapping:** JOB_POLLING_PATTERN_ANALYSIS.md line 436 (video) or 360 (image)
- **Error handling:** QUICK_REFERENCE.md "Credit Deduction TIMING" section
- **Logging phases:** QUICK_REFERENCE.md "Logging Phases" section

## 🔑 The Core Pattern in 30 Seconds

```typescript
// 1. Create job via API → get serverJobId
const res = await api.createJob(payload);
const serverJobId = res.data.jobId;

// 2. Swap IDs: local → server
setResults(prev => prev.map(r => 
  r.id === localId ? { ...r, id: serverJobId } : r
));

// 3. Deduct credits (AFTER successful API call)
useCredits(cost);

// 4. Start polling
pollJobStatus(serverJobId);

// 5. In polling: 3 branches
if (error) {
  addCredits(cost);  // REFUND
  status = 'error';
  return;  // exit
}
if (done) {
  url = response.videoUrl;
  status = 'done';
  return;  // exit
}
// else: keep polling every 5s
```

**That's it.** Everything else is implementation details.

## 📍 Key Files in Codebase

| Generator | File | Polling Function | Job Creation |
|-----------|------|------------------|--------------|
| **Video** | `AIVideoGeneratorWorkspace.tsx` | Lines 305-344 | Lines 420-443 |
| **Image** | `useImageGenerator.ts` | Lines 250-287 | Lines 332-366 |
| **Banner** | `SocialBannerWorkspace.tsx` | N/A (direct) | Lines 201-264 |

## ✅ Checklist: Before You Code

- [ ] Read QUICK_REFERENCE.md (5 min)
- [ ] Understand the 3 branches: error, done, processing
- [ ] Know where to swap IDs (line 436 or 360)
- [ ] Know when to deduct credits (after API success)
- [ ] Know the poll intervals (5s normal, 10s on error)
- [ ] Have your API endpoints planned
- [ ] Know your response format

## 🚨 Common Mistakes to Avoid

❌ **Deduct credits on button click**
✅ Deduct AFTER successful job creation

❌ **Forget to swap task ID to serverJobId**
✅ Update state: `r.id === localId ? { ...r, id: serverJobId } : r`

❌ **Refund twice on error**
✅ Use `isRefunded` flag to prevent double-refund

❌ **Poll every 1 second**
✅ Poll every 5 seconds (10s on network error)

❌ **Use localId for polling**
✅ Always use serverJobId for polling

## 📋 Minimal Copy-Paste Template

From **QUICK_REFERENCE.md** "The Job Polling Pattern" section:

```typescript
const pollJobStatus = async (jobId: string, resultId: string, cost: number) => {
  try {
    const response = await api.getJobStatus(jobId);
    const jobStatus = response.data?.status;

    // ERROR: Refund and exit
    if (jobStatus === 'failed') {
      if (!isRefunded) {
        addCredits(cost);
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error', isRefunded: true } : r));
      }
      return;
    }

    // SUCCESS: Update URL and exit
    if (jobStatus === 'done') {
      const url = response.data.result.url;
      setResults(prev => prev.map(r => r.id === resultId ? { ...r, url, status: 'done' } : r));
      return;
    }

    // PROCESSING: Keep polling
    setTimeout(() => pollJobStatus(jobId, resultId, cost), 5000);
  } catch (e) {
    // NETWORK ERROR: Retry with backoff
    setTimeout(() => pollJobStatus(jobId, resultId, cost), 10000);
  }
};
```

Copy this, adapt to your API response format, done! ✨

## 🔗 Cross-References

**Want to see how video does it?**
→ Lines 305-344 in AIVideoGeneratorWorkspace.tsx

**Want to see how image does it?**  
→ Lines 250-287 in useImageGenerator.ts

**Want to compare side-by-side?**
→ Read VIDEO_vs_IMAGE_PATTERN.md

**Want detailed explanation?**
→ Read JOB_POLLING_PATTERN_ANALYSIS.md

**Want a quick decision tree?**
→ This file (START_HERE.md) sections above

## 📞 Still Have Questions?

1. **"Where do I deduct credits?"** → QUICK_REFERENCE.md line "Credit Deduction TIMING"
2. **"What's the exact line number?"** → JOB_POLLING_PATTERN_ANALYSIS.md (all have line numbers)
3. **"How do I implement this?"** → FILES_CREATED.md "Implementation Checklist"
4. **"Is the pattern really the same?"** → VIDEO_vs_IMAGE_PATTERN.md "Summary" section

## 🎓 Learning Path

**Day 1:** Read START_HERE.md + QUICK_REFERENCE.md (30 min total)

**Day 2:** Study VIDEO_vs_IMAGE_PATTERN.md to see pattern reuse (20 min)

**Day 3:** Implement first generator using QUICK_REFERENCE.md template (2-3 hours)

**Day 4+:** Reference JOB_POLLING_PATTERN_ANALYSIS.md for exact line numbers if needed

## ✨ Bottom Line

The job polling pattern is **99% identical** across all generators. The template is:

1. **Create job** → get `serverJobId`
2. **Swap IDs** in state
3. **Deduct credits**
4. **Poll every 5s** with 3 branches:
   - Error → refund, exit
   - Done → update URL, exit
   - Processing → poll again

That's the entire pattern. Everything else is just adapting API response formats.

---

**Next Step:** Open `QUICK_REFERENCE.md` → 👈 **Start here for hands-on coding**

