# Documentation Created - Summary

Three comprehensive guides have been created to help you understand the job/polling pattern across the codebase.

## 📄 Files Created

### 1. **JOB_POLLING_PATTERN_ANALYSIS.md** (502 lines)
   - **Purpose:** Complete technical reference with exact code and line numbers
   - **Contents:**
     - Full code snippets for video job creation (lines 420-443)
     - Full code snippets for video polling (lines 305-344)
     - Full code snippets for image job creation (lines 332-366)
     - Full code snippets for image polling (lines 250-287)
     - Social banner direct generation pattern (lines 201-264)
     - API request/response structures
     - Logging patterns and phases
     - Credit deduction rules
     - Implementation checklist
   - **Best for:** Deep understanding, copying exact code patterns

### 2. **QUICK_REFERENCE.md** (284 lines)
   - **Purpose:** Fast lookup guide with copy-paste templates
   - **Contents:**
     - File locations and line numbers (table)
     - Copy-paste job creation template
     - Copy-paste polling template
     - 6 key implementation points with examples
     - API contract examples
     - Common mistakes vs correct approaches (table)
     - State management helpers (copy-paste ready)
     - Complete flow diagram
     - TypeScript interfaces needed
   - **Best for:** Quick lookups while coding, copy-paste templates

### 3. **VIDEO_vs_IMAGE_PATTERN.md** (300+ lines)
   - **Purpose:** Side-by-side comparison showing algorithm is identical
   - **Contents:**
     - Import patterns comparison
     - Polling function signature (identical)
     - Fetch status (identical approach)
     - Error handling (same logic, different code style)
     - Success handling (same algorithm)
     - Processing/continue polling (identical)
     - Network error handling (identical 10s retry)
     - Job creation setup (same pattern)
     - API call & ID swap (CRITICAL step explained)
     - Usage preference handling (credits vs key mode)
     - Key differences table
     - Core algorithm diagram (universal)
   - **Best for:** Understanding how reusable the pattern is

## 🎯 Quick Navigation

**I need to understand the polling pattern:** → Start with `QUICK_REFERENCE.md`

**I'm implementing a new generator:** → Use `QUICK_REFERENCE.md` + copy from templates

**I need exact code locations:** → Reference `JOB_POLLING_PATTERN_ANALYSIS.md`

**I want to see how similar video/image are:** → Study `VIDEO_vs_IMAGE_PATTERN.md`

**I found a bug in polling logic:** → Check error handling section in `JOB_POLLING_PATTERN_ANALYSIS.md` lines 315-327 (video) or 254-269 (image)

## 🔑 Key Takeaways

### The Universal Pattern
Every async AI generation with job polling follows this flow:

```
1. Create local task object with temporary ID
2. Add to results UI immediately (status='processing')
3. Call API createJob() → get serverJobId
4. SWAP: Replace local ID with serverJobId in state
5. Deduct credits (ONLY after successful API call)
6. Start polling loop with serverJobId
7. Poll every 5s:
   - If error → refund credits, set status='error', exit
   - If done → update URL, set status='done', exit
   - If processing → wait 5s, poll again
8. On network error → wait 10s, retry (don't refund)
```

### Critical Implementation Points

| Point | Location | Why Important |
|-------|----------|---------------|
| ID Swap | Lines 436 (video), 360 (image) | Must use serverJobId for polling |
| Credit Deduction | After API success | Don't charge user for failed API calls |
| Refund Logic | Lines 320 (video), 262 (image) | Use `isRefunded` flag to prevent double-refund |
| Poll Interval | 5000ms | Prevents API overload, responsive enough |
| Network Retry | 10000ms | Gives connection time to recover |
| Logging | `[PHASE]` prefix | Helps debug user-facing issues |

### Files You Need to Understand

1. **For polling logic:**
   - `AIVideoGeneratorWorkspace.tsx`: Lines 305-344 (pollVideoJobStatus)
   - `useImageGenerator.ts`: Lines 250-287 (pollImageJobStatus)
   - Both are 90% identical

2. **For job creation:**
   - `AIVideoGeneratorWorkspace.tsx`: Lines 420-443
   - `useImageGenerator.ts`: Lines 332-366
   - Both follow same pattern

3. **For state setup:**
   - `AIVideoGeneratorWorkspace.tsx`: Lines 394-414
   - `useImageGenerator.ts`: Lines 305-326
   - Create result objects before polling starts

## 📋 Checklist for New Implementation

When adding a new AI generator with polling:

- [ ] Create `JobRequest` and `JobResponse` types
- [ ] Implement `createJob(payload)` returning `{ data: { jobId } }`
- [ ] Implement `getJobStatus(jobId)` returning `{ data: { status, result? } }`
- [ ] Create `pollJobStatus(jobId, resultId, cost)` function following template
- [ ] Handle 3 branches: error (refund), done (update url), processing (recurse)
- [ ] Use 5s polling interval, 10s network retry
- [ ] Log all phases with `[PHASE]` prefix
- [ ] Swap task ID to serverJobId after API success
- [ ] Deduct credits after successful job creation
- [ ] Add `isRefunded` flag to prevent double-refunds
- [ ] Test error handling and credit refunds
- [ ] Test network failures and retry behavior

## 🚀 Example: Minimal 3-Minute Implementation

```typescript
// 1. Define types
interface JobRequest { type: string; input: any; config: any; engine: any; enginePayload: any; }
interface JobResponse { data: { jobId: string; status: string; result?: { url: string } } }

// 2. Implement API methods (in your API module)
export const myApi = {
  createJob: (payload: JobRequest) => fetch(...).then(r => r.json()),
  getJobStatus: (jobId: string) => fetch(...).then(r => r.json())
};

// 3. Copy polling function from QUICK_REFERENCE.md template
const pollMyJobStatus = async (jobId: string, resultId: string, cost: number) => {
  try {
    const response = await myApi.getJobStatus(jobId);
    const jobStatus = response.data?.status;

    if (jobStatus === 'failed') { /* refund and return */ }
    if (jobStatus === 'done') { /* update url and return */ }
    setTimeout(() => pollMyJobStatus(jobId, resultId, cost), 5000);
  } catch (e) {
    setTimeout(() => pollMyJobStatus(jobId, resultId, cost), 10000);
  }
};

// 4. In your job creation code:
const res = await myApi.createJob(payload);
if (res.data.jobId) {
  const serverJobId = res.data.jobId;
  setResults(prev => prev.map(r => r.id === task.id ? { ...r, id: serverJobId } : r));
  useCredits(task.cost);
  pollMyJobStatus(serverJobId, serverJobId, task.cost);
}

// Done! Just adapt the status checks to your API's response format.
```

## 📞 Support

If you need clarification on any pattern:

1. **For polling logic:** See `JOB_POLLING_PATTERN_ANALYSIS.md` (lines 305-344 video or 250-287 image)
2. **For quick answer:** See `QUICK_REFERENCE.md` (copy-paste section)
3. **For comparison:** See `VIDEO_vs_IMAGE_PATTERN.md` (algorithm is universal)

All code snippets include exact line numbers so you can verify against the source files.

