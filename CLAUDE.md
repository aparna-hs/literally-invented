# Claude Context - Literally Invented Project

## 🎮 Project Overview
**Team knowledge game called "Literally Invented"** with retro gaming aesthetic for internal team building.

### Current Status
- ✅ **KNOW YOUR CREW**: Name-to-description matching game (17 people) - COMPLETE with server validation, one-time play, custom exit warnings
- ✅ **TIMELINE CHALLENGE**: Year sorting bucket game (18 people) - COMPLETE with server validation, one-time play, custom exit warnings  
- 🚧 **CROSSWORD CHALLENGE**: Interactive crossword puzzle (9 words) - UI/UX COMPLETE, server integration pending
- ✅ Supabase authentication with custom login system - WORKING
- ✅ Server-side answer validation with automatic score saving - WORKING
- ✅ Leaderboard displays total scores across levels - WORKING
- ✅ Security: Answers hidden from frontend, validated on server
- ✅ One-time play restrictions implemented for all challenges
- ✅ Custom exit warnings replacing browser defaults
- ✅ Deployed on Vercel: https://literally-invented.vercel.app/

## 🗄️ Database Structure

### Supabase Tables
```sql
-- users table
users (
  id bigint PRIMARY KEY,
  username text,
  password text, -- plain text (not secure)
  display_name text,
  created_at timestamp
)

-- scores table  
scores (
  id bigserial PRIMARY KEY,
  user_id bigint REFERENCES users(id),
  level bigint,
  score integer,
  attempts integer,
  completed_at timestamp,
  UNIQUE(user_id, level) -- prevents duplicate scores per user/level
)

-- game_answers table (secure - stores correct answers for Level 1)
game_answers (
  id SERIAL PRIMARY KEY,
  level INTEGER,
  person_id TEXT,
  correct_description_id TEXT
)

-- game_2_answers table (stores correct answers for Level 2)
game_2_answers (
  id bigint PRIMARY KEY,
  name text,
  year integer -- join year (2024 or 2025)
)

-- level2_temp_answers table (temporary storage for Level 2 individual answers)
level2_temp_answers (
  user_id integer,
  player_id integer,
  submitted_year integer,
  is_correct boolean,
  PRIMARY KEY (user_id, player_id)
)

-- crossword_progress table (Level 3 - PENDING IMPLEMENTATION)
crossword_progress (
  user_id integer,
  answers JSONB, -- {"1-across": "DANA", "2-down": "ANKUR", ...}
  score integer,
  completed_words integer,
  updated_at timestamp,
  PRIMARY KEY (user_id)
)

-- crossword_answers table (Level 3 - PENDING IMPLEMENTATION) 
crossword_answers (
  clue_number integer,
  direction text, -- 'across' or 'down'
  correct_answer text,
  PRIMARY KEY (clue_number, direction)
)
```

### Database Functions
```sql
-- Level 1: Server-side answer validation + automatic score saving
validate_level1_answers(user_answers JSONB, player_user_id INTEGER)
-- Input: {"1": "44", "2": "57", ...} (person_id: description_id)
-- Process: Validates answers, calculates score, saves to database automatically
-- Output: {score: 170, correct_matches: 17, total_questions: 17, perfect_score: true, results: {"44": true, "57": false, ...}}
-- Security: Answers stored securely in game_answers table, not accessible from frontend

-- Level 2: Individual answer checking for instant feedback
check_single_answer(person_id INTEGER, submitted_year INTEGER, player_user_id INTEGER)
-- Input: person_id (1-18), submitted_year (2024/2025), user_id
-- Process: Validates single answer, stores in temp table
-- Output: 1 (correct) or 0 (incorrect)
-- Security: Correct years stored in game_2_answers table

-- Level 2: Final score calculation from stored individual answers
calculate_level2_score(player_user_id INTEGER)
-- Input: user_id
-- Process: Counts correct answers from temp table, saves final score, cleans up temp data
-- Output: {score: 180, correct_matches: 18, total_questions: 18, perfect_score: true}

-- Level 3: Crossword validation functions (PENDING IMPLEMENTATION)
-- validate_crossword_answers(user_answers JSONB, player_user_id INTEGER)
-- auto_save_crossword_progress(user_id INTEGER, answers JSONB, score INTEGER)
```

## 👥 Team Members 

### Level 1: Name-to-Description Matching (17 people)
```
1. André
2. Arundhati  
3. Vikrant
4. Ana
5. Preeti
6. Sagar
7. Matt
8. Dipanjan
9. Laura
10. Gaurav
11. Edward
12. Shreeya
13. Shereen
14. Christopher
15. Rishav
16. Chhavi
17. Taylor
```

### Level 2: Year Sorting Game (18 people)
```
1. Ashank
2. Christian
3. Danielle
4. Deba
5. Garima
6. Gayatri
7. Harshad
8. Kara
9. Kyle
10. Lindsay
11. Matthew
12. Nikita
13. Prince
14. Raiid
15. Sachin
16. Shalini
17. Toni
18. Varun
```

### Descriptions and IDs
```
44: "Co-founded a magazine and was a football (soccer) columnist, Manchester United fan"
57: "From the south of France, has studied & worked in Finland, Australia, New Zealand, likes knitting, outdoor sports, live music"
32: "A cricket fan, plays online games"
42: "Loves fashion, dancing, and her cat"
31: "Likes hikes, treks, and gardening"
61: "Plays Chess & Table Tennis"
22: "Gamer, graphic design is his passion"
36: "Born & raised in Jamaica, is the youngest of all his siblings, mountain biker, a NY'er who moved to Connecticut, one of the few people in the world to do an actual negative flight"
73: "Analytics queen"
34: "Wanted to be a pilot - was in training to become a fighter pilot cadet for the Indian Air Force"
75: "Powerpoint wizard, is a DJ"
46: "From Miami, loves basketball (Go Heat), loves Drake"
72: "Native New Yorker, is a weighlifter, loves film & cooking"
56: "Ice hockey player, loves live music"
80: "Is really into biohacking, gymnastics & weightlifting, has 2 dogs & 2 cats"
35: "Grew up in different cities of northern india, master skills in pottery"
77: "Bachelors degree in Pyschology and loves going to converts and camping"
```

## 🏗️ Technical Architecture

### Frontend (React + TypeScript + Vite)
```
src/
├── pages/
│   ├── Index.tsx - Home page with 3 challenges, no numbered levels
│   ├── Level1Game.tsx - KNOW YOUR CREW (name-to-description matching)
│   ├── Level2Game.tsx - TIMELINE CHALLENGE (year sorting buckets)
│   └── Level3Game.tsx - CROSSWORD CHALLENGE (interactive crossword)
├── components/
│   ├── LoginForm.tsx - Custom authentication form
│   └── Leaderboard.tsx - Shows total scores across levels
├── contexts/
│   └── AuthContext.tsx - User session management
├── lib/
│   ├── supabase.ts - Database connection
│   ├── auth.ts - Login/logout functions
│   ├── scores.ts - Score saving functions
│   └── validation.ts - Server-side answer validation
```

### Key Components
```typescript
// Level 1 Game Structure
interface Colleague { id: string; name: string; }
interface Description { id: string; text: string; emoji: string; }

// Drag & Drop Logic
- Descriptions fixed on top with drop zones
- Names shuffled at bottom for dragging
- matches object: { "description_id": "person_id" }
- Transformed for server: { "person_id": "description_id" }
```

### Scoring System
- **KNOW YOUR CREW**: 10 points per correct match (max 170 points)
- **TIMELINE CHALLENGE**: 10 points per correct year placement (max 180 points)  
- **CROSSWORD CHALLENGE**: 10 points per correct word (max 120 points) - frontend only, server integration pending
- **Leaderboard**: Sum of best scores across all challenges per user
- **Server validation**: Answers checked securely, scores saved automatically

## 🔐 Authentication System
```typescript
// Custom auth (not secure - for internal use only)
- Username/password stored in plain text
- Session stored in localStorage
- No JWT tokens or proper session management
- Users: Hardcoded team members with credentials
```

## 🌐 Deployment
```
GitHub: https://github.com/aparna-hs/literally-invented
Vercel: https://literally-invented.vercel.app/
Environment Variables:
- VITE_SUPABASE_URL: https://hzebtztldhpspqczwafp.supabase.co
- VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚨 Known Issues

### 1. ~~Score Saving RLS Policy Issue~~ ✅ RESOLVED
- **Problem**: UPDATE operations return 0 rows affected
- **Cause**: Row Level Security policies blocking JavaScript client
- **Solution**: Implemented server-side scoring in database function
- **Status**: ✅ FIXED - Scores now saved automatically by database function

### 2. Security Concerns (Acknowledged)
- **Client-side auth**: Can be bypassed via localStorage manipulation
- **Plain text passwords**: Stored unencrypted in database
- **Database access**: Frontend has direct Supabase access
- **Acceptable for**: Internal team use only

## 🎯 Recent Changes

### UI/UX Improvements (COMPLETED)
- **✅ Removed level numbers**: Changed from "LEVEL 1/2" to standalone challenge names for flexible play order
- **✅ Custom exit warnings**: Replaced browser beforeunload with styled retro-themed modals
- **✅ Consistent messaging**: Updated "only play this level once" to "only play this challenge once"

### KNOW YOUR CREW (COMPLETED)
- **✅ One-time play restriction**: Users can only play challenge once
- **✅ Visual answer feedback**: Green/red borders and ✅/❌ icons for correct/wrong answers
- **✅ Enhanced results display**: Shows both score and correct matches count
- **✅ UI improvements**: Added tip box, navigation buttons, custom exit warnings
- **✅ Server-side validation**: Individual answer results returned from database function

### TIMELINE CHALLENGE (COMPLETED)
- **✅ Game mechanic change**: From timeline ordering → year sorting buckets (2024/2025)
- **✅ Team expansion**: Updated from 5 test members → 18 real team members
- **✅ One-by-one gameplay**: Names appear individually for sorting
- **✅ Instant feedback**: Each drop validated server-side with immediate ✅/❌ display
- **✅ Locked answers**: Once dropped, names can't be changed
- **✅ Live scoring**: Score updates in real-time as each name is sorted
- **✅ Server validation**: Dual-function system (check_single_answer + calculate_level2_score)
- **✅ Custom exit warnings**: Prevent accidental loss of progress

### CROSSWORD CHALLENGE (UI/UX COMPLETE)
- **✅ Interactive Grid**: 14x19 grid with click-to-type functionality
- **✅ Word Highlighting**: Active word highlighted in distinct colors
- **✅ Auto-advance**: Types and moves to next cell automatically
- **✅ Smart Intersections**: Handles shared letters between words correctly
- **✅ Visual Feedback**: Green→grey for correct (1s delay), red→clear for wrong (2s delay)
- **✅ Word Locking**: Correct words lock and become uneditable
- **✅ Check Functions**: Both "Check Word" and "Check All" with proper intersection handling
- **✅ Progress Tracking**: Live score and completion percentage display
- **✅ Retro Theme**: Consistent with other challenges (neon colors, pixel fonts)
- **✅ Exit Warnings**: Custom modal for unsaved progress
- **🚧 Server Integration**: Validation, auto-save, and database storage pending

#### Crossword Words and Layout
```
Current Grid: 14x19 with 12 implemented words (9 distinct numbers, some have both across/down)
1-across: DANA (Mauritius vacation) - Row 0, Col 3-6
2-down: ANKUR (Event Coordinator) - Row 0-4, Col 6  
3-across: CYRIL (Music Production) - Row 4, Col 4-8
3-down: CHARA (Bollywood Music) - Row 4-8, Col 4
4-across: RIDHIMA (Innovation Award) - Row 7, Col 4-10
5-down: MOHAK (Delhi Guitar) - Row 7-11, Col 9
6-across: EMERY (Farm) - Row 7, Col 14-18
7-down: MIRIAM (Leader Fighter) - Row 7-12, Col 15
8-down: CASPAR (Privacy) - Row 8-13, Col 0
9-across: SHUBHAM (February Marriage) - Row 9, Col 5-11  
9-down: SARA (Son HS Grad) - Row 9-12, Col 5
10-across: SOUMYA (Selfie Queen) - Row 10, Col 0-5
11-across: KRITIKA (December Marriage) - Row 11, Col 9-15
12-across: ADITYA (Table Tennis) - Row 12, Col 0-5
```

## 🔧 Development Commands
```bash
npm run dev     # Local development
npm run build   # Production build
npm run lint    # Code linting (if available)
git push        # Auto-deploys to Vercel
```

## 📋 Common Tasks

### Adding New Team Members
1. Update `colleagues` array in Level1Game.tsx
2. Add entries to `game_answers` table in Supabase
3. Create corresponding descriptions in `descriptions` array

### Debugging Score Issues
1. Check browser console for validation logs
2. Verify `validate_level1_answers` function in Supabase
3. Check RLS policies on scores table
4. Test direct SQL queries in Supabase editor

### Updating Game Content
1. Modify colleague names in Level1Game.tsx
2. Update descriptions array with new content
3. Update database answers in game_answers table
4. Test server-side validation function

---

## 🐛 Current Issues Being Resolved

### Level 2 Server Validation Issue
- **Problem**: Database function returns false even for correct answers
- **Root Cause**: RLS policies on game_2_answers table blocking SELECT queries
- **Solution**: Disabled RLS on game_2_answers table with `ALTER TABLE game_2_answers DISABLE ROW LEVEL SECURITY;`
- **Status**: Fixed - server validation now working correctly

### Key Technical Details for Level 2
- **Game Flow**: Name appears → user clicks year bucket → server validates immediately → shows ✅/❌ → next name
- **Database Design**: 
  - `game_2_answers`: Stores correct years for each person ID
  - `level2_temp_answers`: Temporary storage for individual answers during gameplay
  - Two-function system: `check_single_answer()` for instant feedback, `calculate_level2_score()` for final scoring
- **Security**: Join years hidden from frontend, validated server-side on each drop

---

## 🔮 Next Steps for Crossword Challenge

### Server Integration (PENDING)
1. **Create Supabase Tables**: `crossword_progress` and `crossword_answers`
2. **Move Answers to Server**: Remove hardcoded answers from frontend to prevent cheating
3. **Implement Auto-save**: Save progress every 10 seconds + on cell changes
4. **Add Validation Functions**: Server-side checking for individual words and full crossword
5. **One-time Play**: Restrict to single play per user like other challenges
6. **Results Modal**: Completion screen with final score and fun message

### Technical Notes
- **Intersection Logic**: Critical for crossword - shared letters between words must be preserved
- **Grid-based Validation**: Uses actual grid cells instead of answers object to handle intersections
- **Visual Feedback Flow**: Green (1s) → Grey (locked) for correct, Red (2s) → Clear for wrong
- **Grid Size**: 14x19 optimized for current word layout

---

*This file contains the complete context of the Literally Invented project for future Claude sessions.*
*Last Updated: 2025-08-31 - Added complete crossword UI/UX implementation*