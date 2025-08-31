# Claude Context - Literally Invented Project

## 🎮 Project Overview
**Team knowledge game called "Literally Invented"** with retro gaming aesthetic for internal team building.

### Current Status
- ✅ Level 1: Name-to-description matching game (17 people) - COMPLETE with one-time play restriction
- 🚧 Level 2: Year sorting bucket game (18 people) - IN PROGRESS (redesigned from timeline ordering)
- ✅ Supabase authentication with custom login system - WORKING
- ✅ Server-side answer validation with automatic score saving - WORKING
- ✅ Leaderboard displays total scores across levels - WORKING
- ✅ Security: Answers hidden from frontend, validated on server
- ✅ One-time play restrictions implemented for both levels
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
│   ├── Index.tsx - Home page with login/game selection
│   ├── Level1Game.tsx - Name-to-description matching (main game)
│   └── Level2Game.tsx - Timeline ordering game
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
- **Level 1**: 10 points per correct match (max 170 points)
- **Level 2**: 50 points for perfect timeline (max 50 points)
- **Leaderboard**: Sum of best scores across all levels per user
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

### Level 1 Enhancements (COMPLETED)
- **✅ One-time play restriction**: Users can only play Level 1 once
- **✅ Visual answer feedback**: Green/red borders and ✅/❌ icons for correct/wrong answers
- **✅ Enhanced results display**: Shows both score and correct matches count
- **✅ UI improvements**: Added tip box, navigation buttons, removed "Play Again" option
- **✅ Server-side validation**: Individual answer results returned from database function

### Level 2 Redesign (IN PROGRESS)
- **✅ Game mechanic change**: From timeline ordering → year sorting buckets (2024/2025)
- **✅ Team expansion**: Updated from 5 test members → 18 real team members
- **✅ One-by-one gameplay**: Names appear individually for sorting
- **✅ Instant feedback**: Each drop validated server-side with immediate ✅/❌ display
- **✅ Locked answers**: Once dropped, names can't be changed
- **✅ Live scoring**: Score updates in real-time as each name is sorted
- **🚧 Server validation**: Implementing dual-function system (check_single_answer + calculate_level2_score)

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

*This file contains the complete context of the Literally Invented project for future Claude sessions.*
*Last Updated: 2025-08-31*