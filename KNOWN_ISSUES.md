# Known Issues & Bugs

## 1. Score Updates Not Working in Database

**Status:** 🔴 Active Issue  
**Priority:** High  
**Affected:** Score saving functionality for both Level 1 and Level 2

### Problem Description
- Scores are calculated correctly in the frontend (e.g., Level 1: 100 points, Level 2: 50 points)
- `saveScore()` function appears to execute successfully with no errors
- Console shows "Score saved successfully" message
- BUT database records remain unchanged (scores stay at previous values)
- Supabase update query returns `updateResult: []` indicating zero rows were updated

### What We've Tried

1. **Fixed JavaScript Logic**
   - ✅ Confirmed score calculation is correct (Level 1: 10 points per match, Level 2: 50 for correct)
   - ✅ Verified update query structure: `UPDATE scores SET score = X WHERE user_id = Y AND level = Z`
   - ✅ Added extensive debugging - all values are correct

2. **Database Direct Testing**
   - ✅ Manual SQL update works: `UPDATE scores SET score = 100 WHERE user_id = 2 AND level = 1;`
   - ✅ Confirmed table structure and column names are correct
   - ✅ Verified record exists and user_id/level matching works

3. **RLS Policy Attempts**
   - ❌ Created basic UPDATE policy: `CREATE POLICY "Allow authenticated users to update scores"`
   - ❌ Tried permissive policy with `USING (true)` and `WITH CHECK (true)`
   - ❌ Attempted UUID vs int8 fixes (auth.uid() vs user_id type mismatch)

### Current Understanding
- **Root Cause:** Row Level Security (RLS) policies blocking JavaScript client updates
- **Evidence:** Direct SQL works, but Supabase JavaScript client returns empty update result
- **User Setup:** Custom authentication with integer user IDs (not standard Supabase UUID auth)

### Technical Details
```javascript
// This executes without errors but updates 0 rows
await supabase
  .from('scores')
  .update({ score: 100, attempts: 1, completed_at: new Date().toISOString() })
  .eq('user_id', 2)
  .eq('level', 1)
  .select()
// Returns: { updateResult: [], updateError: null }
```

```sql
-- This works perfectly in SQL editor
UPDATE scores 
SET score = 100, attempts = 1, completed_at = NOW() 
WHERE user_id = 2 AND level = 1;
-- Returns: 1 row updated
```

### Potential Solutions to Try

1. **Disable RLS Temporarily**
   ```sql
   ALTER TABLE "public"."scores" DISABLE ROW LEVEL SECURITY;
   ```

2. **Create Proper RLS Policy for Custom Auth**
   - Need policy that works with integer user IDs instead of auth.uid()
   - May need to link custom users table to Supabase auth

3. **Alternative Approach**
   - Use Supabase database functions instead of direct updates
   - Implement server-side update logic that bypasses RLS

4. **Debug Further**
   - Check if user is properly authenticated in Supabase context
   - Verify JWT token contains correct user information

### Workaround
Currently none - score saving is completely broken.

### Files Involved
- `/src/lib/scores.ts` - Main score saving logic
- `/src/pages/Level1Game.tsx` - Level 1 score calculation and saving
- `/src/pages/Level2Game.tsx` - Level 2 score calculation and saving
- Supabase `scores` table with RLS policies

---

*Last Updated: 2025-07-27*
*Reporter: Development Team*