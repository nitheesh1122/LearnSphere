# 🔧 Quiz Console Errors - Troubleshooting Guide

## 🚨 Common Console Errors & Fixes

### **Error 1: "Quiz not found or invalid course"**
**Cause**: The quiz ID doesn't match any quiz in the database or belongs to a different course.

**Fix**: 
1. Check if the quiz lesson was properly saved
2. Verify you're clicking "Configure Quiz" on the correct lesson
3. Look for "Quiz Builder Debug" messages in console

### **Error 2: TypeScript type errors**
**Cause**: Quiz data structure doesn't match the expected interface.

**Fix**: I've added type casting to resolve this. The error should be fixed now.

### **Error 3: "Cannot read property 'questions' of undefined"**
**Cause**: Quiz data is null or undefined.

**Fix**: 
1. Make sure the quiz lesson was created properly
2. Check that the quiz record exists in the database
3. Verify the lesson type is "QUIZ"

### **Error 4: Navigation/Redirect loops**
**Cause**: Invalid course ID or authentication issues.

**Fix**: 
1. Make sure you're logged in as an instructor
2. Verify you own the course
3. Check the course ID is valid

## 🔍 Debug Information

Check your browser console (F12) for these debug messages:

```
Quiz Builder Debug: { quizId: "...", quiz: {...}, courseId: "..." }
Quiz not found or invalid course: { quizFound: true/false, courseId: "...", expectedCourseId: "..." }
```

## 🛠 Quick Fix Steps

### **Step 1: Verify Quiz Creation**
1. Go to course edit page
2. Create a new lesson with "Quiz" type
3. Save the lesson
4. Check if the lesson appears with quiz icon (purple HelpCircle)

### **Step 2: Test Navigation**
1. Click the "⋋" menu on the quiz lesson
2. Select "Configure Quiz"
3. Check console for debug messages
4. Should navigate to quiz builder page

### **Step 3: Check Quiz Builder**
1. You should see:
   - Quiz Settings section
   - "Add Questions" section with 4 buttons
   - No console errors
   - Quiz title and course name in header

## 🎯 Expected Console Output

**Working correctly:**
```
Quiz Builder Debug: { quizId: "abc-123", quiz: {...}, courseId: "course-456" }
```

**Not working:**
```
Quiz not found or invalid course: { quizFound: false, courseId: undefined, expectedCourseId: "course-456" }
```

## 📋 What Should Work Now

After the fixes:
- ✅ TypeScript errors resolved
- ✅ Proper type casting for quiz data
- ✅ Debug logging for troubleshooting
- ✅ Better error handling

## 🚀 If Still Not Working

1. **Clear browser cache** and refresh the page
2. **Check browser console** for specific error messages
3. **Verify lesson creation** - was it saved as "Quiz" type?
4. **Check database** - was quiz record created?
5. **Share console output** if errors persist

## 📞 Next Steps

1. Try creating a new quiz lesson
2. Check console for debug messages
3. Navigate to quiz builder
4. Look for the 4 question type buttons
5. If you see errors, share the exact console message

The type errors should be resolved now. Try the quiz creation flow and let me know what specific console error you're seeing!
