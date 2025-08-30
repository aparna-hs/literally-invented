# Claude Context - Literally Invented Project

## 🎮 Project Overview
**Team knowledge game called "Literally Invented"** with retro gaming aesthetic for internal team building.

### Current Status
- ✅ Level 1: Name-to-description matching game (17 people) - WORKING
- ✅ Level 2: Timeline ordering game (5 people) - WORKING  
- ✅ Supabase authentication with custom login system - WORKING
- ✅ Server-side answer validation with automatic score saving - WORKING
- ✅ Leaderboard displays total scores across levels - WORKING
- ✅ Security: Answers hidden from frontend, validated on server
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

-- game_answers table (secure - stores correct answers)
game_answers (
  id SERIAL PRIMARY KEY,
  level INTEGER,
  person_id TEXT,
  correct_description_id TEXT
)
```

### Database Functions
```sql
-- Server-side answer validation + automatic score saving
validate_level1_answers(user_answers JSONB, player_user_id INTEGER)
-- Input: {"1": "44", "2": "57", ...} (person_id: description_id)
-- Process: Validates answers, calculates score, saves to database automatically
-- Output: {score: 30, correct_matches: 3, total_questions: 17, perfect_score: false}
-- Security: Answers stored securely in game_answers table, not accessible from frontend
```

## 👥 Team Members (17 people)

### Names and IDs
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
- **✅ Implemented server-side validation with automatic score saving** (major security improvement)
- **✅ Updated Level 1 name**: "INVENTION STATION" → "KNOW YOUR CREW" 
- **✅ Updated subtitle**: "Drag to match who's who based on these clues! 🔍"
- **✅ Changed emoji**: 🎯 → 🔍 for detective theme consistency
- **✅ Flipped UI structure**: Descriptions fixed on top, drag names from bottom
- **✅ Updated to 17 real team members** with actual names
- **✅ Added 17 real descriptions**: Detailed fun facts with emojis  
- **✅ Removed redundant client-side score saving**: Database function handles everything
- **✅ Fixed scoring display**: Uses server validation results throughout
- **✅ Added unique constraint**: Prevents duplicate scores per user/level
- **✅ Security**: Answers now hidden from frontend inspection

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

*This file contains the complete context of the Literally Invented project for future Claude sessions.*
*Last Updated: 2025-07-27*