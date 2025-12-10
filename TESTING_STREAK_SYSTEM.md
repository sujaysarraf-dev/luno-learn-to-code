# 🧪 Testing Guide: Streak System & Daily Challenges

## Prerequisites

1. ✅ Database migration completed (already done!)
2. ✅ Server running with new routes
3. ✅ Frontend running

## Step-by-Step Testing

### 1. Start Your Servers

```bash
# From project root
npm run dev
```

This will start both:
- Backend server on `http://localhost:5000`
- Frontend on `http://localhost:5173`

### 2. Login to Your Account

1. Open `http://localhost:5173` in your browser
2. Login with your existing account (or create a new one)
3. You'll be redirected to the Dashboard

### 3. Check the Streak Widget

On the Dashboard, you should see:
- **Streak Widget** at the top (purple gradient card)
- Current streak: `0` (if new user)
- Longest streak: `0`
- Total days active: `0`
- Daily challenge card (if available)

### 4. Test Activity Tracking

#### Test 1: Complete a Lesson
1. Click on any lesson from the dashboard
2. View the lesson content
3. **Expected**: Activity is automatically recorded
4. Go back to dashboard
5. **Expected**: Streak should show `1 day` and "✓ Active Today"

#### Test 2: Complete a Quiz
1. From a lesson page, click "🧪 Take Quiz"
2. Answer all questions and submit
3. **Expected**: Quiz activity is recorded with points
4. Go back to dashboard
5. **Expected**: Streak maintained, points added

#### Test 3: Complete Daily Challenge
1. On dashboard, find the "Daily Challenge" card
2. Click the challenge button (e.g., "Start Challenge" or "Complete Challenge")
3. Complete the required action
4. **Expected**: Challenge marked as completed, points earned

### 5. Test Streak Increment

1. Complete an activity today (lesson or quiz)
2. **Wait until tomorrow** (or manually test by changing date in database)
3. Complete another activity
4. **Expected**: Streak should increment to `2 days`

### 6. Test Badge System

Complete activities to earn badges:
- **Week Warrior**: 7-day streak
- **Monthly Master**: 30-day streak
- **Getting Started**: 10 total days active
- **Dedicated Learner**: 50 total days active

### 7. Verify API Endpoints

You can test the API directly:

```bash
# Get user streak (requires authentication)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/streak/streak

# Get today's challenge
curl http://localhost:5000/api/streak/challenge/today

# Record activity (requires authentication)
curl -X POST http://localhost:5000/api/streak/activity \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"activityType": "lesson", "activityId": 1, "points": 5}'
```

## What to Look For

### ✅ Success Indicators

1. **Dashboard Shows Streak Widget**
   - Purple gradient card visible
   - Shows current streak number
   - Shows "Active Today" status

2. **Activity Tracking Works**
   - Completing lessons records activity
   - Completing quizzes records activity
   - Points are awarded

3. **Daily Challenges Appear**
   - Challenge card shows on dashboard
   - Can complete challenges
   - Points are awarded on completion

4. **Badges Awarded**
   - Badges appear in "Recent Badges" section
   - Badges are awarded at milestones

5. **Streak Increments**
   - Streak increases with consecutive days
   - Longest streak updates
   - Total days active increases

### ❌ Common Issues

1. **Streak Widget Not Showing**
   - Check browser console for errors
   - Verify API endpoint is accessible
   - Check authentication token

2. **Activities Not Recording**
   - Check server logs for errors
   - Verify database connection
   - Check API response in browser DevTools

3. **Daily Challenge Not Appearing**
   - Challenge is generated on first request
   - Check server logs for generation errors
   - Verify `daily_challenges` table exists

## Quick Test Checklist

- [ ] Server is running (`npm run dev`)
- [ ] Can login to dashboard
- [ ] Streak widget appears on dashboard
- [ ] Can view a lesson (activity recorded)
- [ ] Can complete a quiz (activity recorded)
- [ ] Daily challenge appears
- [ ] Can complete daily challenge
- [ ] Streak counter updates
- [ ] Badges appear when milestones reached

## Manual Database Verification

You can check the database directly:

```sql
-- Check user streaks
SELECT * FROM user_streaks WHERE user_id = YOUR_USER_ID;

-- Check daily activities
SELECT * FROM daily_activities WHERE user_id = YOUR_USER_ID ORDER BY activity_date DESC;

-- Check daily challenges
SELECT * FROM daily_challenges ORDER BY challenge_date DESC LIMIT 5;

-- Check badges
SELECT * FROM user_badges WHERE user_id = YOUR_USER_ID;
```

## Testing Different Scenarios

### Scenario 1: New User
- Streak starts at 0
- First activity creates streak record
- Streak becomes 1 after first activity

### Scenario 2: Consecutive Days
- Complete activity Day 1 → Streak = 1
- Complete activity Day 2 → Streak = 2
- Complete activity Day 3 → Streak = 3

### Scenario 3: Missed Day
- Complete activity Day 1 → Streak = 1
- Miss Day 2 → Streak resets to 0
- Complete activity Day 3 → Streak = 1 (new streak)

### Scenario 4: Badge Unlock
- Complete 7 consecutive days → "Week Warrior" badge
- Complete 30 consecutive days → "Monthly Master" badge

## Need Help?

If something isn't working:
1. Check browser console (F12) for errors
2. Check server terminal for errors
3. Verify database tables exist
4. Check API endpoints are accessible
5. Verify authentication token is valid

