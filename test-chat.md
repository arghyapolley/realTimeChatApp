# Chat App Testing Guide

## ✅ Current Status
- **Backend Server**: Running on http://localhost:5001 ✅
- **Frontend Server**: Running on http://localhost:3000 ✅
- **CORS Configuration**: Properly configured ✅

## 🧪 How to Test Multiple Users

### Method 1: Different Browsers
1. Open **Chrome** and go to `http://localhost:3000`
2. Open **Safari** and go to `http://localhost:3000`
3. Open **Firefox** and go to `http://localhost:3000`

### Method 2: Different Browser Windows
1. Open **Chrome** and go to `http://localhost:3000`
2. Open a **new incognito window** in Chrome and go to `http://localhost:3000`
3. Open a **new tab** and go to `http://localhost:3000`

### Method 3: Different Browser Profiles
1. Open Chrome with your main profile and go to `http://localhost:3000`
2. Open Chrome with a different profile and go to `http://localhost:3000`

## 📝 Test Steps

### Step 1: Join with First User
1. Enter username: `Alice`
2. Click "Join Chat"
3. Verify you see the chat interface
4. Verify connection status shows "Connected"

### Step 2: Join with Second User
1. In a different browser/window, enter username: `Bob`
2. Click "Join Chat"
3. Verify both users can see each other in the online count
4. Verify both users see the "Bob joined the chat" message

### Step 3: Send Messages
1. Alice sends: "Hello Bob!"
2. Bob sends: "Hi Alice! How are you?"
3. Verify both users see all messages
4. Verify messages are properly aligned (own messages on right, others on left)

### Step 4: Test Typing Indicators
1. Alice starts typing (you should see "Alice is typing...")
2. Bob starts typing (you should see "Alice, Bob are typing...")
3. Stop typing and verify indicators disappear

### Step 5: Test Leave Functionality
1. Click "Leave Chat" button
2. Verify you return to the join screen
3. Verify other users see the "User left the chat" message

## 🔧 Troubleshooting

### If users can't join:
1. Check browser console for errors
2. Verify both servers are running
3. Try refreshing the page
4. Check if username is already taken

### If messages don't appear:
1. Check connection status
2. Verify Socket.IO connection in browser console
3. Check backend logs for errors

### If CORS errors appear:
1. Verify backend CORS configuration
2. Check that frontend is connecting to correct port (5001)
3. Restart both servers if needed

## 🎯 Expected Behavior

✅ Multiple users can join simultaneously
✅ All users see join/leave notifications
✅ Messages are delivered to all connected users
✅ Typing indicators work for all users
✅ Users can leave and rejoin
✅ Connection status is accurate
✅ Message alignment is correct (own vs others)
✅ Timestamps are displayed
✅ Auto-scroll to latest messages works

## 🚀 Ready to Test!

Your chat application is now fully configured and ready for testing with multiple users! 