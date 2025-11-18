import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Users, GraduationCap, X, Trash2, Edit, Eye } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [notification, setNotification] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfilePage, setShowProfilePage] = useState(false);
  const [viewingCourse, setViewingCourse] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [viewingInstructor, setViewingInstructor] = useState(null);
  const [adminName] = useState('Admin');
  const [adminData] = useState({
    name: 'Admin User',
    email: 'admin@learnhub.com',
    userId: 'ADM001',
    role: 'Administrator'
  });
  const [editingLecture, setEditingLecture] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [showLectureForm, setShowLectureForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showCourseEditForm, setShowCourseEditForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordResetForm, setPasswordResetForm] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showStudentPasswordReset, setShowStudentPasswordReset] = useState(false);
  const [showInstructorPasswordReset, setShowInstructorPasswordReset] = useState(false);
  const [instructorPasswordForm, setInstructorPasswordForm] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [studentPasswordForm, setStudentPasswordForm] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showEnrolledStudentsModal, setShowEnrolledStudentsModal] = useState(false);
  const [enrolledStudentsData, setEnrolledStudentsData] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30days');
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [lectureForm, setLectureForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: '',
    thumbnail: ''
  });
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    timerMinutes: 10,
    allowRetake: true,
    questions: []
  });
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    price: '',
    duration: '',
    image: '',
    lessons: 0
  });
  const [uploadingCourseThumbnail, setUploadingCourseThumbnail] = useState(false);
  const [uploadingLectureThumbnail, setUploadingLectureThumbnail] = useState(false);
  const [playingLecture, setPlayingLecture] = useState(null);

  // Check if admin is logged in and initialize page from URL
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setAdminToken(savedToken);
      // Initialize page state from URL immediately after setting token
      initializeFromURL();
    }
  }, []);

  // Initialize page state from URL
  const initializeFromURL = async () => {
    const hash = window.location.hash;
    
    if (hash.startsWith('#profile')) {
      setShowProfilePage(true);
      setViewingCourse(null);
      setViewingStudent(null);
    } else if (hash.startsWith('#course/')) {
      const courseId = hash.replace('#course/', '');
      setShowProfilePage(false);
      setViewingStudent(null);
      // Fetch course details directly by ID
      await fetchCourseById(courseId);
    } else if (hash.startsWith('#student/')) {
      const studentId = hash.replace('#student/', '');
      setShowProfilePage(false);
      setViewingCourse(null);
      // Fetch student details directly by ID
      await fetchStudentById(studentId);
    } else if (!hash || hash === '#dashboard') {
      setShowProfilePage(false);
      setViewingCourse(null);
      setViewingStudent(null);
    }
  };

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = async (e) => {
  if (e.state && e.state.page === 'analytics') {
    setShowAnalytics(true);
    setShowProfilePage(false);
    setViewingCourse(null);
    setViewingStudent(null);
    setViewingInstructor(null);
  } else if (e.state && e.state.page === 'profile') {
    setShowProfilePage(true);
    setShowAnalytics(false);
    setViewingCourse(null);
    setViewingStudent(null);
    setViewingInstructor(null);
  } else if (e.state && e.state.page === 'course') {
    setShowAnalytics(false);
        setShowProfilePage(false);
        setViewingStudent(null);
        setViewingInstructor(null);
        if (e.state.course && e.state.course._id) {
          await fetchCourseById(e.state.course._id);
        }
      } else if (e.state && e.state.page === 'student') {
        setShowProfilePage(false);
        setViewingCourse(null);
        setViewingInstructor(null);
        if (e.state.student && e.state.student._id) {
          await fetchStudentById(e.state.student._id);
        }
      } else if (e.state && e.state.page === 'instructor') {
        setShowProfilePage(false);
        setViewingCourse(null);
        setViewingStudent(null);
        if (e.state.instructor && e.state.instructor._id) {
          await fetchInstructorById(e.state.instructor._id);
        }
      } else {
  setShowProfilePage(false);
  setShowAnalytics(false);
  setViewingCourse(null);
  setViewingStudent(null);
  setViewingInstructor(null);
}
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Fetch course by ID (for refresh/direct navigation)
  const fetchCourseById = async (courseId) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching course by ID:', courseId);
      
      const response = await fetch(`${API_URL}/api/admin/courses/${courseId}`, {
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Course fetched:', data.course);
        setViewingCourse(data.course);
        // Fetch full details including lectures and quizzes
        await fetchCourseDetails(courseId);
      } else {
        console.error('❌ Failed to fetch course');
        showNotification('Course not found', 'error');
        navigateToDashboard();
      }
    } catch (error) {
      console.error('❌ Error fetching course:', error);
      showNotification('Failed to load course', 'error');
      navigateToDashboard();
    } finally {
      setLoading(false);
    }
  };

  // Fetch student by ID (for refresh/direct navigation)
  const fetchStudentById = async (studentId) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching student by ID:', studentId);
      
      const response = await fetch(`${API_URL}/api/admin/students/${studentId}`, {
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Student fetched:', data.student);
        setViewingStudent(data.student);
      } else {
        console.error('❌ Failed to fetch student');
        showNotification('Student not found', 'error');
        navigateToDashboard();
      }
    } catch (error) {
      console.error('❌ Error fetching student:', error);
      showNotification('Failed to load student', 'error');
      navigateToDashboard();
    } finally {
      setLoading(false);
    }
  };

  // Fetch instructor by ID (for refresh/direct navigation)
  const fetchInstructorById = async (instructorId) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching instructor by ID:', instructorId);
      
      const response = await fetch(`${API_URL}/api/admin/instructors/${instructorId}`, {
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Instructor fetched:', data.instructor);
        // Ensure coursesCreated is an array
        const instructor = {
          ...data.instructor,
          coursesCreated: Array.isArray(data.instructor.coursesCreated) 
            ? data.instructor.coursesCreated 
            : []
        };
        setViewingInstructor(instructor);
      } else {
        console.error('❌ Failed to fetch instructor, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        showNotification('Instructor not found', 'error');
        navigateToDashboard();
      }
    } catch (error) {
      console.error('❌ Error fetching instructor:', error);
      showNotification('Failed to load instructor', 'error');
      navigateToDashboard();
    } finally {
      setLoading(false);
    }
  };
  const navigateToProfile = () => {
    setShowProfilePage(true);
    setViewingCourse(null);
    setViewingStudent(null);
    window.history.pushState({ page: 'profile' }, '', '#profile');
  };

  // Navigate to dashboard
  const navigateToDashboard = () => {
    setShowProfilePage(false);
    setViewingCourse(null);
    setViewingStudent(null);
    window.history.pushState({ page: 'dashboard' }, '', '#dashboard');
  };

  // Navigate to course detail
  const navigateToCourse = async (course) => {
    console.log('Course data:', course); // Debug log
    setViewingCourse(course);
    setShowProfilePage(false);
    setViewingStudent(null);
    setViewingInstructor(null);
    window.history.pushState({ page: 'course', course }, '', `#course/${course._id}`);
    
    // Fetch full course details including lectures and quizzes
    await fetchCourseDetails(course._id);
  };

  // Validate password
  const validatePassword = (password) => {
    const errors = {};
    
    if (!password) {
      errors.password = 'Password is required';
      return errors;
    }
    
    if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      return errors;
    }
    
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[@$!%*#?&]/.test(password);
    
    if (!hasLetter) {
      errors.password = 'Password must contain at least one letter';
      return errors;
    }
    
    if (!hasNumber) {
      errors.password = 'Password must contain at least one number';
      return errors;
    }
    
    if (!hasSymbol) {
      errors.password = 'Password must contain at least one special character (@$!%*#?&)';
      return errors;
    }
    
    return errors;
  };

  // Handle student password reset by admin
  const handleStudentPasswordReset = async () => {
    setPasswordErrors({});
    
    const { email, newPassword, confirmPassword } = studentPasswordForm;
    
    if (!email || !email.trim()) {
      setPasswordErrors({ email: 'Student email is required' });
      return;
    }
    
    if (!newPassword || !confirmPassword) {
      setPasswordErrors({ password: 'Both password fields are required' });
      return;
    }
    
    const validationErrors = validatePassword(newPassword);
    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordErrors({ confirm: 'Passwords do not match' });
      return;
    }
    
    setLoading(true);
    try {
      // Find student by email
      const studentsResponse = await fetch(`${API_URL}/api/admin/students`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      if (!studentsResponse.ok) {
        throw new Error('Failed to fetch students');
      }
      
      const studentsData = await studentsResponse.json();
      const student = studentsData.students.find(s => s.email.toLowerCase() === email.toLowerCase().trim());
      
      if (!student) {
        setPasswordErrors({ email: 'Student not found with this email' });
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_URL}/api/admin/users/${student._id}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Student password reset successfully');
        setShowStudentPasswordReset(false);
        setStudentPasswordForm({ email: '', newPassword: '', confirmPassword: '' });
        setPasswordErrors({});
      } else {
        setPasswordErrors({ general: data.message || 'Failed to reset password' });
      }
    } catch (error) {
      setPasswordErrors({ general: 'Error resetting password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle instructor password reset by admin
  const handleInstructorPasswordReset = async () => {
    setPasswordErrors({});
    
    const { email, newPassword, confirmPassword } = instructorPasswordForm;
    
    if (!email || !email.trim()) {
      setPasswordErrors({ email: 'Instructor email is required' });
      return;
    }
    
    if (!newPassword || !confirmPassword) {
      setPasswordErrors({ password: 'Both password fields are required' });
      return;
    }
    
    const validationErrors = validatePassword(newPassword);
    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordErrors({ confirm: 'Passwords do not match' });
      return;
    }
    
    setLoading(true);
    try {
      // Find instructor by email
      const instructorsResponse = await fetch(`${API_URL}/api/admin/instructors`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      if (!instructorsResponse.ok) {
        throw new Error('Failed to fetch instructors');
      }
      
      const instructorsData = await instructorsResponse.json();
      const instructor = instructorsData.instructors.find(i => i.email.toLowerCase() === email.toLowerCase().trim());
      
      if (!instructor) {
        setPasswordErrors({ email: 'Instructor not found with this email' });
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_URL}/api/admin/users/${instructor._id}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Instructor password reset successfully');
        setShowInstructorPasswordReset(false);
        setInstructorPasswordForm({ email: '', newPassword: '', confirmPassword: '' });
        setPasswordErrors({});
      } else {
        setPasswordErrors({ general: data.message || 'Failed to reset password' });
      }
    } catch (error) {
      setPasswordErrors({ general: 'Error resetting password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };
  const handleAdminPasswordChange = async () => {
    setPasswordErrors({});
    
    const { email, newPassword, confirmPassword } = passwordResetForm;
    
    if (!email || !email.trim()) {
      setPasswordErrors({ email: 'Email is required' });
      return;
    }
    
    if (!newPassword || !confirmPassword) {
      setPasswordErrors({ password: 'Both password fields are required' });
      return;
    }
    
    const validationErrors = validatePassword(newPassword);
    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordErrors({ confirm: 'Passwords do not match' });
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim(), newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Password changed successfully');
        setShowPasswordResetModal(false);
        setPasswordResetForm({ email: '', newPassword: '', confirmPassword: '' });
        setPasswordErrors({});
      } else {
        setPasswordErrors({ general: data.message || 'Failed to change password' });
      }
    } catch (error) {
      setPasswordErrors({ general: 'Error changing password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Send OTP for forgot password
  const handleSendForgotPasswordOtp = async () => {
    setPasswordErrors({});
    
    const { email } = passwordResetForm;
    
    if (!email || !email.trim()) {
      setPasswordErrors({ email: 'Email is required' });
      return;
    }
    
    setSendingOtp(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/send-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(data.message || 'OTP sent to your email');
        setForgotPasswordStep(2);
      } else {
        setPasswordErrors({ email: data.message || 'Failed to send OTP' });
      }
    } catch (error) {
      setPasswordErrors({ email: 'Error sending OTP. Please try again.' });
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP for forgot password
  const handleVerifyForgotPasswordOtp = async () => {
    setPasswordErrors({});
    
    if (!forgotPasswordOtp || !forgotPasswordOtp.trim()) {
      setPasswordErrors({ otp: 'OTP is required' });
      return;
    }
    
    setVerifyingOtp(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: passwordResetForm.email.trim(),
          otp: forgotPasswordOtp.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('OTP verified successfully');
        setOtpVerified(true);
        setForgotPasswordStep(3);
      } else {
        setPasswordErrors({ otp: data.message || 'Invalid OTP' });
      }
    } catch (error) {
      setPasswordErrors({ otp: 'Error verifying OTP. Please try again.' });
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Handle forgot password from login page
  const handleForgotPasswordReset = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    
    const { email, newPassword, confirmPassword } = passwordResetForm;
    
    if (!otpVerified) {
      setPasswordErrors({ general: 'Please verify OTP first' });
      return;
    }
    
    if (!newPassword || !confirmPassword) {
      setPasswordErrors({ password: 'Both password fields are required' });
      return;
    }
    
    const validationErrors = validatePassword(newPassword);
    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordErrors({ confirm: 'Passwords do not match' });
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/reset-password-with-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          otp: forgotPasswordOtp.trim(),
          newPassword 
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Auto login after password reset
        setAdminToken(data.token);
        localStorage.setItem('admin_token', data.token);
        showNotification('Password reset successful! You are now logged in.');
        setShowForgotPassword(false);
        setPasswordResetForm({ email: '', newPassword: '', confirmPassword: '' });
        setForgotPasswordOtp('');
        setPasswordErrors({});
        setForgotPasswordStep(1);
        setOtpVerified(false);
      } else {
        setPasswordErrors({ general: data.message || 'Failed to reset password' });
      }
    } catch (error) {
      setPasswordErrors({ general: 'Error resetting password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Navigate to student detail
  const navigateToStudent = async (student) => {
    console.log('Student data:', student); // Debug log
    setViewingStudent(student);
    setShowProfilePage(false);
    setViewingCourse(null);
    setViewingInstructor(null);
    window.history.pushState({ page: 'student', student }, '', `#student/${student._id}`);
    
    // Fetch full student details including enrolled courses
    await fetchStudentDetails(student._id);
  };

  // Navigate to instructor detail
  const navigateToInstructor = async (instructor) => {
    console.log('🎯 Navigate to instructor called with:', instructor);
    
    // Ensure coursesCreated is an array
    const instructorData = {
      ...instructor,
      coursesCreated: Array.isArray(instructor.coursesCreated) 
        ? instructor.coursesCreated 
        : (typeof instructor.coursesCreated === 'number' ? [] : [])
    };
    
    setViewingInstructor(instructorData);
    setShowProfilePage(false);
    setViewingCourse(null);
    setViewingStudent(null);
    window.history.pushState({ page: 'instructor', instructor: instructorData }, '', `#instructor/${instructorData._id}`);
    
    // Fetch full instructor details including courses
    await fetchInstructorDetails(instructorData._id);
  };

  // Handle unenroll student
  const handleUnenrollStudent = (courseId, courseTitle) => {
    setShowDeleteConfirm({ 
      type: 'unenroll', 
      id: courseId,
      studentId: viewingStudent._id,
      name: courseTitle 
    });
  };

  // Confirm unenroll
  const confirmUnenroll = async (courseId, studentId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/students/${studentId}/unenroll/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Student unenrolled successfully');
        // Refresh student details
        await fetchStudentDetails(studentId);
      } else {
        showNotification(data.message || 'Failed to unenroll student', 'error');
      }
    } catch (error) {
      showNotification('Error unenrolling student', 'error');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  // Fetch full course details with lectures and quizzes
  const fetchCourseDetails = async (courseId) => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching course details for:', courseId);
      console.log('📧 Admin token:', adminToken ? 'Present' : 'Missing');
      
      // Try fetching lectures - might fail if admin doesn't have access
      let lecturesData = { lectures: [] };
      let quizzesData = { quizzes: [] };
      
      try {
        const lecturesResponse = await fetch(`${API_URL}/api/courses/${courseId}/lectures`, {
          headers: { 
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📚 Lectures response status:', lecturesResponse.status);
        
        if (lecturesResponse.ok) {
          lecturesData = await lecturesResponse.json();
          console.log('✅ Lectures fetched:', lecturesData.lectures?.length || 0);
        } else if (lecturesResponse.status === 403) {
          console.log('⚠️ Admin doesn\'t have direct lecture access, fetching count from Lecture model');
          // If admin doesn't have access, we'll show count only
          // The backend needs to be updated to allow admin access
        }
      } catch (lectureError) {
        console.error('❌ Error fetching lectures:', lectureError);
      }
      
      try {
        const quizzesResponse = await fetch(`${API_URL}/api/courses/${courseId}/quizzes`, {
          headers: { 
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📝 Quizzes response status:', quizzesResponse.status);
        
        if (quizzesResponse.ok) {
          quizzesData = await quizzesResponse.json();
          console.log('✅ Quizzes fetched:', quizzesData.quizzes?.length || 0);
        }
      } catch (quizError) {
        console.error('❌ Error fetching quizzes:', quizError);
      }
      
      console.log('📊 Final counts - Lectures:', lecturesData.lectures?.length || 0, 'Quizzes:', quizzesData.quizzes?.length || 0);
      
      // Update viewing course with full data
      setViewingCourse(prev => ({
        ...prev,
        lectures: lecturesData.lectures || [],
        quizzes: quizzesData.quizzes || [],
        lectureCount: lecturesData.lectures?.length || 0,
        quizCount: quizzesData.quizzes?.length || 0
      }));
      
    } catch (error) {
      console.error('❌ Error fetching course details:', error);
      showNotification('Failed to load complete course details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch student details with enrolled courses
  const fetchStudentDetails = async (studentId) => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching student details for:', studentId);
      
      const response = await fetch(`${API_URL}/api/admin/students/${studentId}`, {
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Student data received:', data);
        console.log('📚 Enrolled courses count:', data.student?.enrolledCourses?.length || 0);
        
        // Update viewing student with full data
        setViewingStudent(data.student);
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to load student details', 'error');
      }
    } catch (error) {
      console.error('❌ Error fetching student details:', error);
      showNotification('Failed to load student details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch instructor details with courses
  const fetchInstructorDetails = async (instructorId) => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching instructor details for:', instructorId);
      
      const response = await fetch(`${API_URL}/api/admin/instructors/${instructorId}`, {
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Instructor data received:', data);
        console.log('📚 Courses created count:', data.instructor?.coursesCreated?.length || 0);
        
        // Ensure coursesCreated is properly formatted as an array
        const instructor = {
          ...data.instructor,
          coursesCreated: Array.isArray(data.instructor?.coursesCreated) 
            ? data.instructor.coursesCreated 
            : [],
          totalStudents: data.instructor?.totalStudents || 0,
          activeCourses: data.instructor?.activeCourses || 0
        };
        
        // Update viewing instructor with full data
        setViewingInstructor(instructor);
      } else {
        const errorData = await response.json().catch(() => null);
        console.error('❌ Error response:', errorData);
        showNotification(errorData?.message || 'Failed to load instructor details', 'error');
      }
    } catch (error) {
      console.error('❌ Error fetching instructor details:', error);
      showNotification('Failed to load instructor details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async (period = '30days') => {
    try {
      setLoadingAnalytics(true);
      console.log('📊 Fetching analytics for period:', period);
      
      const response = await fetch(`${API_URL}/api/admin/analytics/dashboard?period=${period}`, {
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Analytics data received:', data);
        setAnalyticsData(data);
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to load analytics', 'error');
      }
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      showNotification('Failed to load analytics', 'error');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Fetch analytics when opening analytics page
  useEffect(() => {
    if (adminToken && showAnalytics) {
      fetchAnalytics(analyticsPeriod);
    }
  }, [showAnalytics, analyticsPeriod, adminToken]);

  // Fetch enrolled students for a course
  const fetchEnrolledStudents = async (courseId) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching enrolled students for course:', courseId);
      
      const response = await fetch(`${API_URL}/api/courses/${courseId}/enrolled-students`, {
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Enrolled students:', data);
        setEnrolledStudentsData(data.students || []);
        setShowEnrolledStudentsModal(true);
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to load enrolled students', 'error');
      }
    } catch (error) {
      console.error('❌ Error fetching enrolled students:', error);
      showNotification('Failed to load enrolled students', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when tab changes
  useEffect(() => {
    if (adminToken && !showProfilePage && !viewingCourse && !viewingStudent && !viewingInstructor) {
      if (activeTab === 'courses') fetchCourses();
      else if (activeTab === 'students') fetchStudents();
      else if (activeTab === 'instructors') fetchInstructors();
    }
  }, [activeTab, adminToken, showProfilePage, viewingCourse, viewingStudent, viewingInstructor]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await response.json();
      if (response.ok) {
        setAdminToken(data.token);
        localStorage.setItem('admin_token', data.token);
        showNotification('Login successful!');
      } else {
        showNotification(data.message || 'Login failed', 'error');
      }
    } catch (error) {
      showNotification('Network error. Check backend connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
    setShowProfileMenu(false);
  };

  const confirmLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('admin_token');
    setShowLogoutConfirm(false);
    showNotification('Logged out successfully');
  };

  // Handle course edit
  const handleEditCourse = () => {
    if (!viewingCourse) return;
    
    setCourseForm({
      title: viewingCourse.title || '',
      description: viewingCourse.description || '',
      category: viewingCourse.category || '',
      level: viewingCourse.level || '',
      price: viewingCourse.price || '',
      duration: viewingCourse.duration || '',
      image: viewingCourse.image || '',
      lessons: viewingCourse.lessons || 0
    });
    setEditingCourse(viewingCourse);
    setShowCourseEditForm(true);
  };

  const handleSaveCourse = async () => {
    if (!courseForm.title || !courseForm.category || !courseForm.level || !courseForm.price || !courseForm.duration) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/instructor/courses/${viewingCourse._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseForm)
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Course updated successfully');
        setShowCourseEditForm(false);
        await fetchCourseDetails(viewingCourse._id);
      } else {
        showNotification(data.message || 'Failed to update course', 'error');
      }
    } catch (error) {
      showNotification('Error updating course', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCourseThumbnail = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Please select an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image size should be less than 5MB', 'error');
      return;
    }

    setUploadingCourseThumbnail(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setCourseForm(prev => ({ ...prev, image: reader.result }));
        showNotification('Thumbnail uploaded successfully');
        setUploadingCourseThumbnail(false);
      };
      reader.onerror = () => {
        showNotification('Failed to read image file', 'error');
        setUploadingCourseThumbnail(false);
      };
    } catch (error) {
      showNotification('Error uploading thumbnail', 'error');
      setUploadingCourseThumbnail(false);
    }
  };

  const handleUploadLectureThumbnail = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Please select an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image size should be less than 5MB', 'error');
      return;
    }

    setUploadingLectureThumbnail(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setLectureForm(prev => ({ ...prev, thumbnail: reader.result }));
        showNotification('Thumbnail uploaded successfully');
        setUploadingLectureThumbnail(false);
      };
      reader.onerror = () => {
        showNotification('Failed to read image file', 'error');
        setUploadingLectureThumbnail(false);
      };
    } catch (error) {
      showNotification('Error uploading thumbnail', 'error');
      setUploadingLectureThumbnail(false);
    }
  };

  // Handle lecture operations
  const handleAddLecture = () => {
    setLectureForm({
      title: '',
      description: '',
      videoUrl: '',
      duration: '',
      thumbnail: ''
    });
    setEditingLecture(null);
    setShowLectureForm(true);
  };

  const handleEditLecture = (lecture) => {
    setLectureForm({
      title: lecture.title || '',
      description: lecture.description || '',
      videoUrl: lecture.videoUrl || '',
      duration: lecture.duration || '',
      thumbnail: lecture.thumbnail || ''
    });
    setEditingLecture(lecture);
    setShowLectureForm(true);
  };

  const handleSaveLecture = async () => {
    if (!lectureForm.title || !lectureForm.videoUrl || !lectureForm.duration) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const url = editingLecture 
        ? `${API_URL}/api/courses/${viewingCourse._id}/lectures/${editingLecture._id}`
        : `${API_URL}/api/courses/${viewingCourse._id}/lectures`;
      
      const method = editingLecture ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lectureForm)
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(editingLecture ? 'Lecture updated successfully' : 'Lecture added successfully');
        setShowLectureForm(false);
        await fetchCourseDetails(viewingCourse._id);
      } else {
        showNotification(data.message || 'Failed to save lecture', 'error');
      }
    } catch (error) {
      showNotification('Error saving lecture', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    setShowDeleteConfirm({ type: 'lecture', id: lectureId, name: 'this lecture' });
  };

  const confirmDeleteLecture = async (lectureId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/courses/${viewingCourse._id}/lectures/${lectureId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.ok) {
        showNotification('Lecture deleted successfully');
        await fetchCourseDetails(viewingCourse._id);
      } else {
        const data = await response.json();
        showNotification(data.message || 'Failed to delete lecture', 'error');
      }
    } catch (error) {
      showNotification('Error deleting lecture', 'error');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  // Handle quiz operations
  const handleAddQuiz = () => {
    setQuizForm({
      title: '',
      description: '',
      timerMinutes: 10,
      allowRetake: true,
      questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });
    setEditingQuiz(null);
    setShowQuizForm(true);
  };

  const handleEditQuiz = (quiz) => {
    setQuizForm({
      title: quiz.title || '',
      description: quiz.description || '',
      timerMinutes: quiz.timerMinutes || 10,
      allowRetake: quiz.allowRetake !== undefined ? quiz.allowRetake : true,
      questions: quiz.questions.map(q => ({
        questionText: q.questionText,
        options: [...q.options],
        correctAnswer: q.correctAnswer
      }))
    });
    setEditingQuiz(quiz);
    setShowQuizForm(true);
  };

  const handleSaveQuiz = async () => {
    if (!quizForm.title || quizForm.questions.length === 0) {
      showNotification('Please add at least one question', 'error');
      return;
    }

    // Validate questions
    for (let i = 0; i < quizForm.questions.length; i++) {
      const q = quizForm.questions[i];
      const filledOptions = q.options.filter(opt => opt && opt.trim());
      if (!q.questionText || filledOptions.length < 2) {
        showNotification(`Question ${i + 1} needs at least 2 options`, 'error');
        return;
      }
    }

    setLoading(true);
    try {
      const url = editingQuiz 
        ? `${API_URL}/api/courses/${viewingCourse._id}/quizzes/${editingQuiz._id}`
        : `${API_URL}/api/courses/${viewingCourse._id}/quizzes`;
      
      const method = editingQuiz ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quizForm)
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(editingQuiz ? 'Quiz updated successfully' : 'Quiz added successfully');
        setShowQuizForm(false);
        await fetchCourseDetails(viewingCourse._id);
      } else {
        showNotification(data.message || 'Failed to save quiz', 'error');
      }
    } catch (error) {
      showNotification('Error saving quiz', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    setShowDeleteConfirm({ type: 'quiz', id: quizId, name: 'this quiz' });
  };

  const confirmDeleteQuiz = async (quizId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/courses/${viewingCourse._id}/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.ok) {
        showNotification('Quiz deleted successfully');
        await fetchCourseDetails(viewingCourse._id);
      } else {
        const data = await response.json();
        showNotification(data.message || 'Failed to delete quiz', 'error');
      }
    } catch (error) {
      showNotification('Error deleting quiz', 'error');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  const addQuizQuestion = () => {
    setQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]
    }));
  };

  const removeQuizQuestion = (index) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateQuizQuestion = (index, field, value) => {
    setQuizForm(prev => {
      const updated = [...prev.questions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, questions: updated };
    });
  };

  const updateQuizOption = (qIndex, oIndex, value) => {
    setQuizForm(prev => {
      const updated = [...prev.questions];
      updated[qIndex].options[oIndex] = value;
      return { ...prev, questions: updated };
    });
  };

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/admin/courses`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCourses(data.courses || []);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/admin/students`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await response.json();
      if (response.ok) {
        setStudents(data.students || []);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/admin/instructors`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await response.json();
      if (response.ok) {
        setInstructors(data.instructors || []);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch instructors');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    setShowDeleteConfirm(null);
    setLoading(true);
    try {
      const endpoint = type === 'course' ? 'courses' : type === 'student' ? 'users' : 'users';
      const response = await fetch(`${API_URL}/api/admin/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (response.ok) {
        showNotification(`${type} deleted successfully`);
        if (type === 'course') fetchCourses();
        else if (type === 'student') fetchStudents();
        else fetchInstructors();
      } else {
        const data = await response.json();
        showNotification(data.message || 'Delete failed', 'error');
      }
    } catch (error) {
      showNotification('Delete failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search
  const filteredCourses = courses.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.instructor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.userId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInstructors = instructors.filter(i =>
    i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.userId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Login Screen
  if (!adminToken) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', top: '-250px', right: '-150px', animation: 'float 20s infinite ease-in-out' }}></div>
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', bottom: '-200px', left: '-100px', animation: 'float 15s infinite ease-in-out reverse' }}></div>
        
        <div style={{ width: '100%', maxWidth: '520px', position: 'relative', zIndex: 1 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 25px 70px rgba(0,0,0,0.25)', padding: '2.5rem 3rem', animation: 'slideUp 0.6s ease-out', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '64px', height: '64px', margin: '0 auto 1.25rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(102,126,234,0.35)' }}>
                <GraduationCap style={{ width: 36, height: 36, color: 'white' }} />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
                {showForgotPassword ? 'Reset Password' : 'Admin Portal'}
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
                {showForgotPassword ? 'Enter your details to reset your password' : 'Sign in to access the dashboard'}
              </p>
            </div>

            {showForgotPassword ? (
              // Forgot Password Form
              <form onSubmit={handleForgotPasswordReset}>
                {passwordErrors.general && (
                  <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '0.5rem', marginBottom: '1.25rem' }}>
                    <p style={{ color: '#dc2626', fontSize: '0.8125rem', margin: 0, fontWeight: 500 }}>{passwordErrors.general}</p>
                  </div>
                )}

                {/* Step 1: Enter Email */}
                {forgotPasswordStep === 1 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
                      Email Address <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={passwordResetForm.email}
                      onChange={(e) => {
                        setPasswordResetForm({...passwordResetForm, email: e.target.value});
                        setPasswordErrors({});
                      }}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: `1px solid ${passwordErrors.email ? '#dc2626' : '#d1d5db'}`, borderRadius: '0.5rem', outline: 'none', boxSizing: 'border-box', fontSize: '0.875rem', transition: 'all 0.2s', backgroundColor: 'white', fontFamily: 'inherit' }}
                      placeholder="admin@learnhub.com"
                      onFocus={(e) => !passwordErrors.email && (e.target.style.borderColor = '#667eea', e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.08)')}
                      onBlur={(e) => !passwordErrors.email && (e.target.style.borderColor = '#d1d5db', e.target.style.boxShadow = 'none')}
                    />
                    {passwordErrors.email && (
                      <p style={{ color: '#dc2626', fontSize: '0.6875rem', marginTop: '0.375rem', fontWeight: 500 }}>{passwordErrors.email}</p>
                    )}
                  </div>
                )}

                {/* Step 2: Enter OTP */}
                {forgotPasswordStep === 2 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ padding: '0.875rem', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                      <p style={{ color: '#0284c7', fontSize: '0.8125rem', margin: 0, fontWeight: 500 }}>
                        📧 OTP sent to {passwordResetForm.email}
                      </p>
                    </div>
                    
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
                      Enter OTP <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength="6"
                      value={forgotPasswordOtp}
                      onChange={(e) => {
                        setForgotPasswordOtp(e.target.value.replace(/\D/g, ''));
                        setPasswordErrors({});
                      }}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: `1px solid ${passwordErrors.otp ? '#dc2626' : '#d1d5db'}`, borderRadius: '0.5rem', outline: 'none', boxSizing: 'border-box', fontSize: '0.875rem', transition: 'all 0.2s', backgroundColor: 'white', fontFamily: 'monospace', letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.25rem' }}
                      placeholder="000000"
                      onFocus={(e) => !passwordErrors.otp && (e.target.style.borderColor = '#667eea', e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.08)')}
                      onBlur={(e) => !passwordErrors.otp && (e.target.style.borderColor = '#d1d5db', e.target.style.boxShadow = 'none')}
                    />
                    {passwordErrors.otp && (
                      <p style={{ color: '#dc2626', fontSize: '0.6875rem', marginTop: '0.375rem', fontWeight: 500 }}>{passwordErrors.otp}</p>
                    )}
                  </div>
                )}

                {/* Step 3: Enter New Password */}
                {forgotPasswordStep === 3 && (
                  <>
                    <div style={{ padding: '0.875rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                      <p style={{ color: '#16a34a', fontSize: '0.8125rem', margin: 0, fontWeight: 500 }}>
                        ✅ Email verified! Now set your new password.
                      </p>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
                        New Password <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordResetForm.newPassword}
                        onChange={(e) => {
                          setPasswordResetForm({...passwordResetForm, newPassword: e.target.value});
                          setPasswordErrors({});
                        }}
                        style={{ width: '100%', padding: '0.75rem 1rem', border: `1px solid ${passwordErrors.password ? '#dc2626' : '#d1d5db'}`, borderRadius: '0.5rem', outline: 'none', boxSizing: 'border-box', fontSize: '0.875rem', transition: 'all 0.2s', backgroundColor: 'white', fontFamily: 'inherit' }}
                        placeholder="Enter new password"
                        onFocus={(e) => !passwordErrors.password && (e.target.style.borderColor = '#667eea', e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.08)')}
                        onBlur={(e) => !passwordErrors.password && (e.target.style.borderColor = '#d1d5db', e.target.style.boxShadow = 'none')}
                      />
                      {passwordErrors.password && (
                        <p style={{ color: '#dc2626', fontSize: '0.6875rem', marginTop: '0.375rem', fontWeight: 500 }}>{passwordErrors.password}</p>
                      )}
                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginTop: '0.375rem', fontWeight: 500 }}>
                        Min 6 characters with letter, number & symbol (@$!%*#?&)
                      </p>
                    </div>

                    <div style={{ marginBottom: '1.75rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
                        Confirm Password <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordResetForm.confirmPassword}
                        onChange={(e) => {
                          setPasswordResetForm({...passwordResetForm, confirmPassword: e.target.value});
                          setPasswordErrors({});
                        }}
                        style={{ width: '100%', padding: '0.75rem 1rem', border: `1px solid ${passwordErrors.confirm ? '#dc2626' : '#d1d5db'}`, borderRadius: '0.5rem', outline: 'none', boxSizing: 'border-box', fontSize: '0.875rem', transition: 'all 0.2s', backgroundColor: 'white', fontFamily: 'inherit' }}
                        placeholder="Confirm new password"
                        onFocus={(e) => !passwordErrors.confirm && (e.target.style.borderColor = '#667eea', e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.08)')}
                        onBlur={(e) => !passwordErrors.confirm && (e.target.style.borderColor = '#d1d5db', e.target.style.boxShadow = 'none')}
                      />
                      {passwordErrors.confirm && (
                        <p style={{ color: '#dc2626', fontSize: '0.6875rem', marginTop: '0.375rem', fontWeight: 500 }}>{passwordErrors.confirm}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                {forgotPasswordStep === 1 && (
                  <button
                    type="button"
                    onClick={handleSendForgotPasswordOtp}
                    disabled={sendingOtp}
                    style={{ width: '100%', padding: '0.875rem', background: sendingOtp ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: sendingOtp ? 'not-allowed' : 'pointer', fontSize: '0.9375rem', transition: 'all 0.2s', boxShadow: sendingOtp ? 'none' : '0 4px 12px rgba(102,126,234,0.3)', letterSpacing: '0.01em' }}
                    onMouseEnter={(e) => !sendingOtp && (e.target.style.transform = 'translateY(-1px)', e.target.style.boxShadow = '0 6px 16px rgba(102,126,234,0.4)')}
                    onMouseLeave={(e) => !sendingOtp && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 4px 12px rgba(102,126,234,0.3)')}
                  >
                    {sendingOtp ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '14px', height: '14px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></span>
                        Sending OTP...
                      </span>
                    ) : 'Send OTP'}
                  </button>
                )}

                {forgotPasswordStep === 2 && (
                  <button
                    type="button"
                    onClick={handleVerifyForgotPasswordOtp}
                    disabled={verifyingOtp}
                    style={{ width: '100%', padding: '0.875rem', background: verifyingOtp ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: verifyingOtp ? 'not-allowed' : 'pointer', fontSize: '0.9375rem', transition: 'all 0.2s', boxShadow: verifyingOtp ? 'none' : '0 4px 12px rgba(102,126,234,0.3)', letterSpacing: '0.01em' }}
                    onMouseEnter={(e) => !verifyingOtp && (e.target.style.transform = 'translateY(-1px)', e.target.style.boxShadow = '0 6px 16px rgba(102,126,234,0.4)')}
                    onMouseLeave={(e) => !verifyingOtp && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 4px 12px rgba(102,126,234,0.3)')}
                  >
                    {verifyingOtp ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '14px', height: '14px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></span>
                        Verifying...
                      </span>
                    ) : 'Verify OTP'}
                  </button>
                )}

                {forgotPasswordStep === 3 && (
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '0.875rem', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9375rem', transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 12px rgba(102,126,234,0.3)', letterSpacing: '0.01em' }}
                    onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-1px)', e.target.style.boxShadow = '0 6px 16px rgba(102,126,234,0.4)')}
                    onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 4px 12px rgba(102,126,234,0.3)')}
                  >
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '14px', height: '14px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></span>
                        Resetting...
                      </span>
                    ) : 'Reset Password & Login'}
                  </button>
                )}

                <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setPasswordResetForm({ email: '', newPassword: '', confirmPassword: '' });
                      setForgotPasswordOtp('');
                      setPasswordErrors({});
                      setForgotPasswordStep(1);
                      setOtpVerified(false);
                    }}
                    style={{ background: 'none', border: 'none', color: '#667eea', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#5a67d8'}
                    onMouseLeave={(e) => e.target.style.color = '#667eea'}
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            ) : (
              // Login Form
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', boxSizing: 'border-box', fontSize: '0.875rem', transition: 'all 0.2s', backgroundColor: 'white', fontFamily: 'inherit' }}
                    placeholder="admin@learnhub.com"
                    onFocus={(e) => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div style={{ marginBottom: '0.875rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>Password</label>
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', boxSizing: 'border-box', fontSize: '0.875rem', transition: 'all 0.2s', backgroundColor: 'white', fontFamily: 'inherit' }}
                    placeholder="Enter your password"
                    onFocus={(e) => { e.target.style.borderColor = '#667eea'; e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div style={{ marginBottom: '1.75rem', textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setPasswordResetForm({ email: '', newPassword: '', confirmPassword: '' });
                      setPasswordErrors({});
                    }}
                    style={{ background: 'none', border: 'none', color: '#667eea', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#5a67d8'}
                    onMouseLeave={(e) => e.target.style.color = '#667eea'}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', padding: '0.875rem', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9375rem', transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 12px rgba(102,126,234,0.3)', letterSpacing: '0.01em' }}
                  onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-1px)', e.target.style.boxShadow = '0 6px 16px rgba(102,126,234,0.4)')}
                  onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 4px 12px rgba(102,126,234,0.3)')}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '14px', height: '14px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></span>
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </button>
              </form>
            )}

            <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500 }}>Secured by LearnHub</p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>© 2025 LearnHub. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {notification && (
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, backgroundColor: notification.type === 'error' ? '#ef4444' : '#10b981', color: 'white', padding: '1rem 1.5rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', animation: 'slideIn 0.3s ease-out' }}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div 
          onClick={() => {
  if (showProfilePage || viewingCourse || viewingStudent || viewingInstructor || showAnalytics) {
    window.history.back();
  } else {
    navigateToDashboard();
  }
}}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
             <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
      <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 1 }} />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" fill="url(#logo-gradient)" />
  <path d="M30 35 L30 65 L50 65 L50 75 L70 55 L50 35 L50 45 L40 45 L40 35 Z" fill="white" stroke="white" strokeWidth="2" strokeLinejoin="round" />
</svg>
<span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>LearnHub Admin</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => { 
                setShowAnalytics(true);
                setShowProfilePage(false);
                setViewingCourse(null);
                setViewingStudent(null);
                setViewingInstructor(null);
                window.history.pushState({ page: 'analytics' }, '', '#analytics');
              }}
              style={{ 
                padding: '0.75rem 1.5rem', 
                background: showAnalytics ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                color: showAnalytics ? 'white' : '#667eea',
                border: showAnalytics ? 'none' : '2px solid #667eea',
                borderRadius: '0.75rem', 
                cursor: 'pointer', 
                fontWeight: 600, 
                fontSize: '0.9375rem', 
                transition: 'all 0.3s',
                boxShadow: showAnalytics ? '0 4px 12px rgba(102,126,234,0.3)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                animation: 'pulse 2s ease-in-out infinite'
              }}
              onMouseEnter={(e) => { 
                if (!showAnalytics) {
                  e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                  e.target.style.color = 'white';
                  e.target.style.border = 'none';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102,126,234,0.4)';
                }
              }}
              onMouseLeave={(e) => { 
                if (!showAnalytics) {
                  e.target.style.background = 'white';
                  e.target.style.color = '#667eea';
                  e.target.style.border = '2px solid #667eea';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18"/>
                <path d="m19 9-5 5-4-4-3 3"/>
              </svg>
              Analytics
            </button>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.125rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(102,126,234,0.3)' }}
                onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 4px 12px rgba(102,126,234,0.4)'; }}
                onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 2px 8px rgba(102,126,234,0.3)'; }}
              >
                {adminName.charAt(0).toUpperCase()}
              </button>

              {showProfileMenu && (
                <div style={{ position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', minWidth: '200px', overflow: 'hidden', animation: 'fadeInDown 0.2s ease-out', border: '1px solid #e5e7eb' }}>
                  <button
                    onClick={() => { 
                      setShowProfileMenu(false); 
                      navigateToProfile();
                    }}
                    style={{ width: '100%', padding: '0.875rem 1.25rem', backgroundColor: 'white', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.9375rem', fontWeight: 500, color: '#374151', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #f3f4f6' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <Users style={{ width: 18, height: 18 }} />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{ width: '100%', padding: '0.875rem 1.25rem', backgroundColor: 'white', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.9375rem', fontWeight: 500, color: '#dc2626', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {viewingInstructor ? (
          // Instructor Detail Page
          <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
            {loading && (
              <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '1rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading instructor details...</p>
              </div>
            )}
            
            {/* Instructor Header */}
            <div style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', borderRadius: '1rem', padding: '3rem 2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', transform: 'translate(30%, -30%)' }}></div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ width: 120, height: 120, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', color: 'white', flexShrink: 0, backdropFilter: 'blur(10px)', border: '4px solid rgba(255,255,255,0.3)' }}>
                  {viewingInstructor.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>{viewingInstructor.name}</h1>
                  <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1rem' }}>{viewingInstructor.email}</p>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <GraduationCap style={{ width: 20, height: 20, color: 'white' }} />
                      <span style={{ color: 'white', fontWeight: 600 }}>ID: {viewingInstructor.userId}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BookOpen style={{ width: 20, height: 20, color: 'white' }} />
                      <span style={{ color: 'white', fontWeight: 600 }}>{viewingInstructor.coursesCreated?.length || 0} Courses Created</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span style={{ color: 'white', fontWeight: 600 }}>Joined: {new Date(viewingInstructor.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              {/* Left Column - Created Courses */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Course Statistics */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                      <path d="M3 3v18h18"/>
                      <path d="m19 9-5 5-4-4-3 3"/>
                    </svg>
                    Teaching Statistics
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <div style={{ padding: '1.5rem', backgroundColor: '#fef3c7', borderRadius: '0.75rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#b45309', margin: '0 0 0.5rem 0' }}>
                        {viewingInstructor.coursesCreated?.length || 0}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: 600, margin: 0 }}>Total Courses</p>
                    </div>
                    <div style={{ padding: '1.5rem', backgroundColor: '#f0f9ff', borderRadius: '0.75rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0284c7', margin: '0 0 0.5rem 0' }}>
                        {viewingInstructor.totalStudents || 0}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#0369a1', fontWeight: 600, margin: 0 }}>Total Students</p>
                    </div>
                    <div style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', borderRadius: '0.75rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#16a34a', margin: '0 0 0.5rem 0' }}>
                        {viewingInstructor.activeCourses || viewingInstructor.coursesCreated?.filter(c => c?.status === 'active').length || 0}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#15803d', fontWeight: 600, margin: 0 }}>Active Courses</p>
                    </div>
                  </div>
                </div>

                {/* Created Courses List */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BookOpen style={{ width: 24, height: 24, color: '#f59e0b' }} />
                    Created Courses ({viewingInstructor.coursesCreated?.length || 0})
                  </h2>
                  {viewingInstructor.coursesCreated && viewingInstructor.coursesCreated.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {viewingInstructor.coursesCreated.map((course, idx) => (
                        <div 
                          key={course._id || idx} 
                          onClick={() => {
                            setViewingInstructor(null);
                            navigateToCourse(course);
                          }}
                          style={{ padding: '1.25rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', cursor: 'pointer' }} 
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.backgroundColor = '#fef3c7'; }} 
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', margin: 0 }}>{course.title}</h3>
                                {course.status === 'active' && (
                                  <span style={{ padding: '0.25rem 0.625rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                                    Active
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                                Category: {course.category || 'Uncategorized'}
                              </p>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.8125rem', color: '#6b7280' }}>
                                <span>{course.students || 0} students enrolled</span>
                                <span>•</span>
                                <span>₹{course.price}</span>
                                <span>•</span>
                                <span>Created: {new Date(course.createdAt || Date.now()).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#f59e0b', flexShrink: 0 }}>
                              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>View</span>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12"/>
                                <polyline points="12 5 19 12 12 19"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                      <BookOpen style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.5 }} />
                      <p>No courses created yet</p>
                      <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>This instructor hasn't created any courses</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Instructor Information */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Quick Actions */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Quick Actions</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button 
                      onClick={() => showNotification('Send message feature coming soon!')}
                      style={{ width: '100%', padding: '0.875rem 1.25rem', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} 
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#fde68a'} 
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#fef3c7'}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      Send Message
                    </button>
                    <button 
                      onClick={() => {
                        setInstructorPasswordForm({
                          email: viewingInstructor.email,
                          newPassword: '',
                          confirmPassword: ''
                        });
                        setPasswordErrors({});
                        setShowInstructorPasswordReset(true);
                      }}
                      style={{ width: '100%', padding: '0.875rem 1.25rem', backgroundColor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} 
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#e0f2fe'} 
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f9ff'}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Reset Password
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm({ type: 'instructor', id: viewingInstructor._id, name: viewingInstructor.name })}
                      style={{ width: '100%', padding: '0.875rem 1.25rem', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} 
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'} 
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#fef2f2'}
                    >
                      <Trash2 style={{ width: 18, height: 18 }} />
                      Remove Instructor
                    </button>
                  </div>
                </div>

                {/* Instructor Details */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Personal Information</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Instructor ID</label>
                      <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 600, margin: 0, fontFamily: 'monospace', backgroundColor: '#f9fafb', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>{viewingInstructor.userId}</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                      <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 600, margin: 0 }}>{viewingInstructor.name}</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                      <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 600, margin: 0, wordBreak: 'break-all' }}>{viewingInstructor.email}</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Status</label>
                      <span style={{ display: 'inline-block', padding: '0.375rem 0.875rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600 }}>
                        {viewingInstructor.status || 'Active'}
                      </span>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registration Date</label>
                      <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 600, margin: 0 }}>{new Date(viewingInstructor.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Updated</label>
                      <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 600, margin: 0 }}>{new Date(viewingInstructor.updatedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                {/* Activity Overview */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    Recent Activity
                  </h2>
                  <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Activity tracking coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : viewingStudent ? (
          // Student Detail Page
          <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
            {loading && (
              <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '1rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading student details...</p>
              </div>
            )}
            
            {/* Student Header */}
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '1rem', padding: '3rem 2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', transform: 'translate(30%, -30%)' }}></div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ width: 120, height: 120, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', color: 'white', flexShrink: 0, backdropFilter: 'blur(10px)', border: '4px solid rgba(255,255,255,0.3)' }}>
                  {viewingStudent.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>{viewingStudent.name}</h1>
                  <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1rem' }}>{viewingStudent.email}</p>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span style={{ color: 'white', fontWeight: 600 }}>ID: {viewingStudent.userId}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BookOpen style={{ width: 20, height: 20, color: 'white' }} />
                      <span style={{ color: 'white', fontWeight: 600 }}>{viewingStudent.enrolledCourses?.length || 0} Courses Enrolled</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span style={{ color: 'white', fontWeight: 600 }}>Joined: {new Date(viewingStudent.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              {/* Left Column - Enrolled Courses */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Course Statistics */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                      <path d="M3 3v18h18"/>
                      <path d="m19 9-5 5-4-4-3 3"/>
                    </svg>
                    Learning Statistics
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <div style={{ padding: '1.5rem', backgroundColor: '#f0f9ff', borderRadius: '0.75rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0284c7', margin: '0 0 0.5rem 0' }}>
                        {viewingStudent.enrolledCourses?.length || 0}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#0369a1', fontWeight: 600, margin: 0 }}>Total Courses</p>
                    </div>
                    <div style={{ padding: '1.5rem', backgroundColor: '#fef3c7', borderRadius: '0.75rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ca8a04', margin: '0 0 0.5rem 0' }}>
                        {viewingStudent.completedCourses?.length || 0}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#a16207', fontWeight: 600, margin: 0 }}>Completed</p>
                    </div>
                    <div style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', borderRadius: '0.75rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#16a34a', margin: '0 0 0.5rem 0' }}>
                        {((viewingStudent.completedCourses?.length || 0) / (viewingStudent.enrolledCourses?.length || 1) * 100).toFixed(0)}%
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#15803d', fontWeight: 600, margin: 0 }}>Completion Rate</p>
                    </div>
                  </div>
                </div>

                {/* Enrolled Courses List */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BookOpen style={{ width: 24, height: 24, color: '#667eea' }} />
                    Enrolled Courses ({viewingStudent.enrolledCourses?.length || 0})
                  </h2>
                  {viewingStudent.enrolledCourses && viewingStudent.enrolledCourses.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {viewingStudent.enrolledCourses.map((enrollment, idx) => {
                        const course = enrollment.courseId;
                        
                        // Check if course data exists
                        if (!course) {
                          console.warn('⚠️ Course data missing for enrollment:', enrollment);
                          return null;
                        }
                        
                        return (
                          <div key={enrollment._id || idx} style={{ padding: '1.25rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem', border: '2px solid #e5e7eb', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#667eea'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', margin: 0 }}>{course.title || 'Course Title'}</h3>
                                  {enrollment.completionStatus === 'completed' && (
                                    <span style={{ padding: '0.25rem 0.625rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                                      Completed
                                    </span>
                                  )}
                                  {enrollment.completionStatus === 'in-progress' && (
                                    <span style={{ padding: '0.25rem 0.625rem', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                                      In Progress
                                    </span>
                                  )}
                                </div>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                                  Instructor: {course.instructor || 'Unknown'}
                                </p>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.8125rem', color: '#6b7280' }}>
                                  <span>Enrolled: {new Date(enrollment.enrolledAt || Date.now()).toLocaleDateString()}</span>
                                  {enrollment.progress !== undefined && (
                                    <>
                                      <span>•</span>
                                      <span>Progress: {enrollment.progress}%</span>
                                    </>
                                  )}
                                </div>
                                {enrollment.progress !== undefined && (
                                  <div style={{ marginTop: '0.75rem', width: '100%', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
                                    <div style={{ width: `${enrollment.progress}%`, height: '100%', backgroundColor: '#667eea', transition: 'width 0.3s' }}></div>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => handleUnenrollStudent(course._id || course.id, course.title)}
                                style={{ padding: '0.625rem 1rem', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s', flexShrink: 0 }}
                                onMouseEnter={(e) => { e.target.style.backgroundColor = '#fee2e2'; e.target.style.transform = 'scale(1.05)'; }}
                                onMouseLeave={(e) => { e.target.style.backgroundColor = '#fef2f2'; e.target.style.transform = 'scale(1)'; }}
                              >
                                Unenroll
                              </button>
                            </div>
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                      <BookOpen style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.5 }} />
                      <p>No courses enrolled yet</p>
                      <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>This student hasn't enrolled in any courses</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Student Information */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Quick Actions */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Quick Actions</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button 
                      onClick={() => showNotification('Send message feature coming soon!')}
                      style={{ width: '100%', padding: '0.875rem 1.25rem', backgroundColor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} 
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#e0f2fe'} 
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f9ff'}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      Send Message
                    </button>
                    <button 
                      onClick={() => {
                        setStudentPasswordForm({
                          email: viewingStudent.email,
                          newPassword: '',
                          confirmPassword: ''
                        });
                        setPasswordErrors({});
                        setShowStudentPasswordReset(true);
                      }}
                      style={{ width: '100%', padding: '0.875rem 1.25rem', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} 
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#fde68a'} 
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#fef3c7'}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Reset Password
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm({ type: 'student', id: viewingStudent._id, name: viewingStudent.name })}
                      style={{ width: '100%', padding: '0.875rem 1.25rem', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} 
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'} 
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#fef2f2'}
                    >
                      <Trash2 style={{ width: 18, height: 18 }} />
                      Remove Student
                    </button>
                  </div>
                </div>

                {/* Student Details */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Personal Information</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student ID</label>
                      <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 600, margin: 0, fontFamily: 'monospace', backgroundColor: '#f9fafb', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>{viewingStudent.userId}</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                      <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 600, margin: 0 }}>{viewingStudent.name}</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                      <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 600, margin: 0, wordBreak: 'break-all' }}>{viewingStudent.email}</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Status</label>
                      <span style={{ display: 'inline-block', padding: '0.375rem 0.875rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600 }}>
                        {viewingStudent.status || 'Active'}
                      </span>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registration Date</label>
                      <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 600, margin: 0 }}>{new Date(viewingStudent.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Updated</label>
                      <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 600, margin: 0 }}>{new Date(viewingStudent.updatedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                {/* Activity Overview */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    Recent Activity
                  </h2>
                  <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Activity tracking coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : viewingCourse ? (
          // Course Detail Page
          <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
            {loading && (
              <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '1rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading course details...</p>
              </div>
            )}
            
            {/* Course Header */}
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '1rem', padding: '3rem 2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', transform: 'translate(30%, -30%)' }}></div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'inline-block', padding: '0.5rem 1rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '9999px', marginBottom: '1rem', backdropFilter: 'blur(10px)' }}>
                    <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: 600 }}>{viewingCourse.category}</span>
                  </div>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', margin: '0 0 1rem 0', lineHeight: 1.2 }}>{viewingCourse.title}</h1>
                  <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1.5rem' }}>{viewingCourse.description || 'No description available'}</p>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <GraduationCap style={{ width: 20, height: 20, color: 'white' }} />
                      <span style={{ color: 'white', fontWeight: 600 }}>by {viewingCourse.instructor}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users style={{ width: 20, height: 20, color: 'white' }} />
                      <span style={{ color: 'white', fontWeight: 600 }}>{viewingCourse.students || 0} Students</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span style={{ color: 'white', fontWeight: 600 }}>Last Updated: {new Date(viewingCourse.updatedAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {(viewingCourse.thumbnail || viewingCourse.image) && (
                  <div style={{ width: '300px', height: '200px', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', flexShrink: 0 }}>
                    <img src={viewingCourse.thumbnail || viewingCourse.image} alt={viewingCourse.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              {/* Left Column - Course Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Course Stats */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                      <path d="M3 3v18h18"/>
                      <path d="m19 9-5 5-4-4-3 3"/>
                    </svg>
                    Course Statistics
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <div style={{ padding: '1.5rem', backgroundColor: '#f0f9ff', borderRadius: '0.75rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0284c7', margin: '0 0 0.5rem 0' }}>
                        {viewingCourse.lectures?.length || viewingCourse.lectureCount || viewingCourse.totalLectures || 0}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#0369a1', fontWeight: 600, margin: 0 }}>Lectures</p>
                    </div>
                    <div style={{ padding: '1.5rem', backgroundColor: '#fef3c7', borderRadius: '0.75rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ca8a04', margin: '0 0 0.5rem 0' }}>
                        {viewingCourse.quizzes?.length || viewingCourse.quizCount || viewingCourse.totalQuizzes || 0}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#a16207', fontWeight: 600, margin: 0 }}>Quizzes</p>
                    </div>
                    <div style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', borderRadius: '0.75rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#16a34a', margin: '0 0 0.5rem 0' }}>₹{viewingCourse.price}</p>
                      <p style={{ fontSize: '0.875rem', color: '#15803d', fontWeight: 600, margin: 0 }}>Price</p>
                    </div>
                  </div>
                </div>

                {/* Lectures List */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BookOpen style={{ width: 24, height: 24, color: '#667eea' }} />
                    Course Content - Lectures ({viewingCourse.lectures?.length || viewingCourse.lectureCount || 0})
                  </h2>
                  {viewingCourse.lectures && viewingCourse.lectures.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {viewingCourse.lectures.map((lecture, idx) => (
                        <div key={idx} style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem', border: '1px solid #e5e7eb', display: 'flex', gap: '1rem', alignItems: 'start' }}>
                          {lecture.thumbnail && (
                            <div style={{ width: '120px', height: '80px', borderRadius: '0.5rem', overflow: 'hidden', flexShrink: 0, border: '2px solid #e5e7eb' }}>
                              <img src={lecture.thumbnail} alt={lecture.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                              <span style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>{idx + 1}</span>
                              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>{lecture.title || lecture.name || `Lecture ${idx + 1}`}</h3>
                            </div>
                            {lecture.duration && (
                              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 2.5rem' }}>Duration: {lecture.duration}</p>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                            <button 
                              onClick={() => setPlayingLecture(lecture)}
                              style={{ padding: '0.5rem 1rem', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#0284c7', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.375rem' }} 
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#e0f2fe'} 
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f9ff'}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                              Play
                            </button>
                            <button 
                              onClick={() => handleEditLecture(lecture)}
                              style={{ padding: '0.5rem 1rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#374151', transition: 'all 0.2s' }} 
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'} 
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteLecture(lecture._id)}
                              style={{ padding: '0.5rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#dc2626', transition: 'all 0.2s' }} 
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'} 
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#fef2f2'}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : viewingCourse.lectureCount > 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                      <BookOpen style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.5 }} />
                      <p>{viewingCourse.lectureCount} lecture(s) found, but details not loaded</p>
                      <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Lecture data structure may need adjustment</p>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                      <BookOpen style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.5 }} />
                      <p>No lectures added yet</p>
                    </div>
                  )}
                </div>

                {/* Quizzes List */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                      <path d="M9 11l3 3L22 4"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                    Quizzes & Assessments ({viewingCourse.quizzes?.length || viewingCourse.quizCount || 0})
                  </h2>
                  {viewingCourse.quizzes && viewingCourse.quizzes.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {viewingCourse.quizzes.map((quiz, idx) => (
                        <div key={idx} style={{ padding: '1rem', backgroundColor: '#fffbeb', borderRadius: '0.75rem', border: '1px solid #fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                              <span style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>{idx + 1}</span>
                              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>{quiz.title || quiz.name || `Quiz ${idx + 1}`}</h3>
                            </div>
                            {quiz.questions && (
                              <p style={{ fontSize: '0.875rem', color: '#92400e', margin: '0.25rem 0 0 2.5rem' }}>{quiz.questions.length} Questions</p>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => handleEditQuiz(quiz)}
                              style={{ padding: '0.5rem 1rem', backgroundColor: 'white', border: '1px solid #fde68a', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#92400e', transition: 'all 0.2s' }} 
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#fef3c7'} 
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteQuiz(quiz._id)}
                              style={{ padding: '0.5rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#dc2626', transition: 'all 0.2s' }} 
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'} 
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#fef2f2'}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : viewingCourse.quizCount > 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 1rem', opacity: 0.5 }}>
                        <path d="M9 11l3 3L22 4"/>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                      <p>{viewingCourse.quizCount} quiz(zes) found, but details not loaded</p>
                      <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Quiz data structure may need adjustment</p>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 1rem', opacity: 0.5 }}>
                        <path d="M9 11l3 3L22 4"/>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                      <p>No quizzes added yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Management Tools */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Quick Actions */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Quick Actions</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button style={{ width: '100%', padding: '0.875rem 1.25rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }} onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 16px rgba(102,126,234,0.4)'; }} onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(102,126,234,0.3)'; }} onClick={handleEditCourse}>
                      <Edit style={{ width: 18, height: 18 }} />
                      Edit Course Info
                    </button>
                    <button style={{ width: '100%', padding: '0.875rem 1.25rem', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'} onMouseLeave={(e) => e.target.style.backgroundColor = '#fef2f2'} onClick={() => setShowDeleteConfirm({ type: 'course', id: viewingCourse._id, name: viewingCourse.title })}>
                      <Trash2 style={{ width: 18, height: 18 }} />
                      Delete Course
                    </button>
                  </div>
                </div>

                {/* Course Details */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Course Details</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course ID</label>
                      <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 600, margin: 0, fontFamily: 'monospace', backgroundColor: '#f9fafb', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>{viewingCourse._id}</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                      <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 600, margin: 0 }}>{viewingCourse.category}</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Instructor</label>
                      <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 600, margin: 0 }}>{viewingCourse.instructor}</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
                      <span style={{ display: 'inline-block', padding: '0.375rem 0.875rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600 }}>
                        {viewingCourse.status || 'Active'}
                      </span>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created</label>
                      <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 600, margin: 0 }}>{new Date(viewingCourse.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                {/* Enrolled Students */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users style={{ width: 20, height: 20, color: '#667eea' }} />
                    Enrolled Students
                  </h2>
                  <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem' }}>
                    <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#667eea', margin: '0 0 0.5rem 0' }}>{viewingCourse.students || 0}</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Total Students</p>
                  </div>
                  <button 
                    style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#374151', transition: 'all 0.2s' }} 
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'} 
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f9fafb'} 
                    onClick={() => fetchEnrolledStudents(viewingCourse._id)}
                  >
                    View All Students
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : showAnalytics ? (
          // Analytics Dashboard Page
          <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
            {/* Analytics Header */}
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '1rem', padding: '3rem 2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', transform: 'translate(30%, -30%)' }}></div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', margin: '0 0 0.5rem 0' }}>Analytics Dashboard</h1>
                  <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.9)', margin: 0 }}>Monitor your platform's performance and growth</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {['7days', '30days', '90days', '1year'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setAnalyticsPeriod(period)}
                      style={{
                        padding: '0.75rem 1.25rem',
                        backgroundColor: analyticsPeriod === period ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                        border: analyticsPeriod === period ? '2px solid white' : '2px solid transparent',
                        borderRadius: '0.5rem',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        transition: 'all 0.2s',
                        backdropFilter: 'blur(10px)'
                      }}
                      onMouseEnter={(e) => !analyticsPeriod === period && (e.target.style.backgroundColor = 'rgba(255,255,255,0.2)')}
                      onMouseLeave={(e) => analyticsPeriod !== period && (e.target.style.backgroundColor = 'rgba(255,255,255,0.1)')}
                    >
                      {period === '7days' ? '7 Days' : period === '30days' ? '30 Days' : period === '90days' ? '90 Days' : '1 Year'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loadingAnalytics ? (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ display: 'inline-block', width: '48px', height: '48px', border: '4px solid #f3f4f6', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '1.125rem' }}>Loading analytics data...</p>
              </div>
            ) : analyticsData ? (
              <>
                {/* Overview Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px solid #f0f9ff', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)', borderRadius: '50%', transform: 'translate(40%, -40%)', opacity: 0.3 }}></div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '0.75rem', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                          </svg>
                        </div>
                      </div>
                      <h3 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>
                        ₹{analyticsData.overview.totalRevenue.toLocaleString('en-IN')}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600, margin: 0 }}>Total Revenue</p>
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px solid #f0fdf4', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)', borderRadius: '50%', transform: 'translate(40%, -40%)', opacity: 0.3 }}></div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '0.75rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
                          <Users style={{ width: 24, height: 24, color: 'white' }} />
                        </div>
                      </div>
                      <h3 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>
                        {analyticsData.overview.totalStudents.toLocaleString()}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600, margin: 0 }}>Total Students</p>
                      {analyticsData.overview.studentGrowth !== 0 && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ color: analyticsData.overview.studentGrowth > 0 ? '#10b981' : '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>
                            {analyticsData.overview.studentGrowth > 0 ? '↑' : '↓'} {Math.abs(analyticsData.overview.studentGrowth)}%
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>vs previous period</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px solid #fef3c7', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)', borderRadius: '50%', transform: 'translate(40%, -40%)', opacity: 0.3 }}></div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '0.75rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
                          <GraduationCap style={{ width: 24, height: 24, color: 'white' }} />
                        </div>
                      </div>
                      <h3 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>
                        {analyticsData.overview.totalInstructors.toLocaleString()}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600, margin: 0 }}>Total Instructors</p>
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px solid #ede9fe', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)', borderRadius: '50%', transform: 'translate(40%, -40%)', opacity: 0.3 }}></div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '0.75rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}>
                          <BookOpen style={{ width: 24, height: 24, color: 'white' }} />
                        </div>
                      </div>
                      <h3 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>
                        {analyticsData.overview.totalCourses.toLocaleString()}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600, margin: 0 }}>Total Courses</p>
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                  {/* Revenue Trend Chart */}
                  <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                        <path d="M3 3v18h18"/>
                        <path d="m19 9-5 5-4-4-3 3"/>
                      </svg>
                      Revenue Trend ({analyticsPeriod === '7days' ? 'Last 7 Days' : analyticsPeriod === '30days' ? 'Last 30 Days' : analyticsPeriod === '90days' ? 'Last 90 Days' : 'Last Year'})
                    </h2>
                    <div style={{ height: '300px', position: 'relative' }}>
                      <svg width="100%" height="100%" viewBox="0 0 600 300" preserveAspectRatio="none">
                        {/* Grid lines */}
                        {[0, 1, 2, 3, 4].map((i) => (
                          <line key={i} x1="50" y1={50 + i * 55} x2="580" y2={50 + i * 55} stroke="#f3f4f6" strokeWidth="1"/>
                        ))}
                        
                        {/* Revenue line */}
                        <polyline
                          points={analyticsData.revenueTrend.map((d, i) => {
                            const x = 50 + (i / Math.max(analyticsData.revenueTrend.length - 1, 1)) * 530;
                            const maxRevenue = Math.max(...analyticsData.revenueTrend.map(d => d.revenue), 1);
                            const y = 270 - (d.revenue / maxRevenue) * 220;
                            return `${x},${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="url(#gradient1)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        
                        {/* Data points */}
                        {analyticsData.revenueTrend.map((d, i) => {
                          const x = 50 + (i / Math.max(analyticsData.revenueTrend.length - 1, 1)) * 530;
                          const maxRevenue = Math.max(...analyticsData.revenueTrend.map(d => d.revenue), 1);
                          const y = 270 - (d.revenue / maxRevenue) * 220;
                          return (
                            <g key={i}>
                              <circle cx={x} cy={y} r="5" fill="#667eea" stroke="white" strokeWidth="2"/>
                              <title>{`${d.date}: ₹${d.revenue.toLocaleString('en-IN')}`}</title>
                            </g>
                          );
                        })}
                        
                        {/* Gradient fill under line */}
                        <polygon
                          points={`50,270 ${analyticsData.revenueTrend.map((d, i) => {
                            const x = 50 + (i / Math.max(analyticsData.revenueTrend.length - 1, 1)) * 530;
                            const maxRevenue = Math.max(...analyticsData.revenueTrend.map(d => d.revenue), 1);
                            const y = 270 - (d.revenue / maxRevenue) * 220;
                            return `${x},${y}`;
                          }).join(' ')} 580,270`}
                          fill="url(#areaGradient1)"
                        />
                        
                        <defs>
                          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#667eea"/>
                            <stop offset="100%" stopColor="#764ba2"/>
                          </linearGradient>
                          <linearGradient id="areaGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(102,126,234,0.2)"/>
                            <stop offset="100%" stopColor="rgba(102,126,234,0)"/>
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* Y-axis labels */}
                      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: '50px', paddingBottom: '30px' }}>
                        {[4, 3, 2, 1, 0].map((i) => {
                          const maxRevenue = Math.max(...analyticsData.revenueTrend.map(d => d.revenue), 1);
                          const value = Math.round((maxRevenue / 4) * i);
                          return (
                            <span key={i} style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 500 }}>
                              ₹{value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
                            </span>
                          );
                        })}
                      </div>
                      
                      {/* X-axis labels */}
                      <div style={{ position: 'absolute', bottom: 0, left: '50px', right: 0, display: 'flex', justifyContent: 'space-between', paddingRight: '20px' }}>
                        {(() => {
                          const dataLength = analyticsData.revenueTrend.length;
                          let labelIndices = [];
                          
                          if (analyticsPeriod === '7days') {
                            // Show all 7 days
                            labelIndices = [0, 1, 2, 3, 4, 5, 6];
                          } else if (analyticsPeriod === '30days') {
                            // Show every 5th day (0, 5, 10, 15, 20, 25, 29)
                            labelIndices = [0, 5, 10, 15, 20, 25, 29];
                          } else if (analyticsPeriod === '90days') {
                            // Show every 15th day
                            labelIndices = [0, 15, 30, 45, 60, 75, 89];
                          } else if (analyticsPeriod === '1year') {
                            // Show every month (assuming 365 days, ~30 days apart)
                            labelIndices = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 364];
                          }
                          
                          return labelIndices.filter(idx => idx < dataLength).map((idx) => {
                            const d = analyticsData.revenueTrend[idx];
                            const date = new Date(d.date);
                            let label = '';
                            
                            if (analyticsPeriod === '7days') {
                              // Show day name (Mon, Tue, etc.)
                              label = date.toLocaleDateString('en-US', { weekday: 'short' });
                            } else if (analyticsPeriod === '30days') {
                              // Show date (1 Jan, 15 Jan, etc.)
                              label = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                            } else if (analyticsPeriod === '90days') {
                              // Show date
                              label = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                            } else if (analyticsPeriod === '1year') {
                              // Show month (Jan, Feb, etc.)
                              label = date.toLocaleDateString('en-US', { month: 'short' });
                            }
                            
                            return (
                              <span key={idx} style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 500, textAlign: 'center' }}>
                                {label}
                              </span>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Revenue by Category */}
                  <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Revenue by Category</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {analyticsData.revenueByCategory.slice(0, 5).map((cat, idx) => {
                        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
                        return (
                          <div key={idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>{cat.category}</span>
                              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors[idx] }}>₹{cat.revenue.toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ height: '8px', backgroundColor: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
                              <div style={{ width: `${cat.percentage}%`, height: '100%', backgroundColor: colors[idx], borderRadius: '9999px', transition: 'width 0.5s ease-out' }}></div>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>{cat.percentage}% of total</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Top Courses and Instructor Performance */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
                  {/* Top Courses */}
                  <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Top Performing Courses
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                      {analyticsData.topCourses.map((course, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem', border: '2px solid #e5e7eb', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#667eea'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}>
                          {course.image && (
                            <img src={course.image} alt={course.title} style={{ width: '80px', height: '60px', borderRadius: '0.5rem', objectFit: 'cover', flexShrink: 0 }} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827', margin: '0 0 0.25rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</h3>
                            <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>{course.instructor}</p>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                              <span style={{ color: '#10b981', fontWeight: 600 }}>{course.enrollments} enrollments</span>
                              <span style={{ color: '#3b82f6', fontWeight: 600 }}>₹{course.revenue.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructor Performance */}
                  <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <GraduationCap style={{ width: 24, height: 24, color: '#667eea' }} />
                      Top Instructors
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                      {analyticsData.instructorPerformance.slice(0, 5).map((instructor, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem', border: '2px solid #e5e7eb', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#667eea'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}>
                          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                            {instructor.name?.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827', margin: '0 0 0.25rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{instructor.name}</h3>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
                              <span>{instructor.coursesCreated} courses</span>
                              <span>•</span>
                              <span>{instructor.totalStudents} students</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981', margin: 0 }}>₹{instructor.totalRevenue.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    Recent Enrollments
                  </h2>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                          <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.recentActivity.map((activity, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                            <td style={{ padding: '1rem' }}>
                              <div>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', margin: 0 }}>{activity.studentName}</p>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.125rem 0 0 0' }}>{activity.studentEmail}</p>
                              </div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', margin: 0 }}>{activity.courseTitle}</p>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10b981' }}>₹{activity.amount.toLocaleString('en-IN')}</span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: 0 }}>{new Date(activity.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ) : showProfilePage ? (
          <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '1rem', padding: '3rem 2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', transform: 'translate(30%, -30%)' }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', margin: '0 0 0.5rem 0' }}>My Profile</h1>
                <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.9)', margin: 0 }}>Manage your account settings and view your activity</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                  <Users style={{ width: 24, height: 24, color: '#667eea' }} />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Account Information</h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', color: 'white', flexShrink: 0, boxShadow: '0 8px 24px rgba(102,126,234,0.3)' }}>
                    {adminData.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>{adminData.name}</h3>
                    <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '0.5rem' }}>{adminData.email}</p>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span style={{ padding: '0.375rem 0.875rem', backgroundColor: '#ede9fe', color: '#7c3aed', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600 }}>
                        {adminData.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                    <p style={{ fontSize: '1rem', color: '#111827', fontWeight: 600, margin: 0 }}>{adminData.name}</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                    <p style={{ fontSize: '1rem', color: '#111827', fontWeight: 600, margin: 0 }}>{adminData.email}</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Type</label>
                    <p style={{ fontSize: '1rem', color: '#111827', fontWeight: 600, margin: 0 }}>{adminData.role}</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Join Date</label>
                    <p style={{ fontSize: '1rem', color: '#111827', fontWeight: 600, margin: 0 }}>January 2025</p>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Change Password</h2>
                </div>
                <p style={{ fontSize: '0.9375rem', color: '#6b7280', marginBottom: '1.5rem' }}>Keep your account secure by regularly updating your password</p>
                <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                  <button
                    onClick={() => {
                      setPasswordResetForm({ email: adminData.email, newPassword: '', confirmPassword: '' });
                      setPasswordErrors({});
                      setShowPasswordResetModal(true);
                    }}
                    style={{ padding: '0.875rem 2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}
                    onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 16px rgba(102,126,234,0.4)'; }}
                    onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(102,126,234,0.3)'; }}
                  >
                    Change Password
                  </button>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <GraduationCap style={{ width: 24, height: 24, color: '#667eea' }} />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Platform Statistics</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                  <div style={{ padding: '1.5rem', backgroundColor: '#f0f9ff', borderRadius: '0.75rem', border: '2px solid #bae6fd' }}>
                    <BookOpen style={{ width: 24, height: 24, color: '#0284c7', marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0c4a6e', margin: '0 0 0.25rem 0' }}>{courses.length}</p>
                    <p style={{ fontSize: '0.875rem', color: '#0369a1', fontWeight: 600, margin: 0 }}>Total Courses</p>
                  </div>
                  <div style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', borderRadius: '0.75rem', border: '2px solid #bbf7d0' }}>
                    <Users style={{ width: 24, height: 24, color: '#16a34a', marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#14532d', margin: '0 0 0.25rem 0' }}>{students.length}</p>
                    <p style={{ fontSize: '0.875rem', color: '#15803d', fontWeight: 600, margin: 0 }}>Total Students</p>
                  </div>
                  <div style={{ padding: '1.5rem', backgroundColor: '#fef3c7', borderRadius: '0.75rem', border: '2px solid #fde68a' }}>
                    <GraduationCap style={{ width: 24, height: 24, color: '#ca8a04', marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#713f12', margin: '0 0 0.25rem 0' }}>{instructors.length}</p>
                    <p style={{ fontSize: '0.875rem', color: '#a16207', fontWeight: 600, margin: 0 }}>Total Instructors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <button
                onClick={() => { setActiveTab('courses'); setSearchQuery(''); }}
                style={{ flex: 1, padding: '0.75rem 1.5rem', backgroundColor: activeTab === 'courses' ? '#4f46e5' : 'transparent', border: 'none', borderRadius: '0.5rem', color: activeTab === 'courses' ? 'white' : '#6b7280', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
              >
                <BookOpen style={{ width: 20, height: 20 }} />
                Courses ({courses.length})
              </button>
              <button
                onClick={() => { setActiveTab('students'); setSearchQuery(''); }}
                style={{ flex: 1, padding: '0.75rem 1.5rem', backgroundColor: activeTab === 'students' ? '#4f46e5' : 'transparent', border: 'none', borderRadius: '0.5rem', color: activeTab === 'students' ? 'white' : '#6b7280', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
              >
                <Users style={{ width: 20, height: 20 }} />
                Students ({students.length})
              </button>
              <button
                onClick={() => { setActiveTab('instructors'); setSearchQuery(''); }}
                style={{ flex: 1, padding: '0.75rem 1.5rem', backgroundColor: activeTab === 'instructors' ? '#4f46e5' : 'transparent', border: 'none', borderRadius: '0.5rem', color: activeTab === 'instructors' ? 'white' : '#6b7280', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
              >
                <GraduationCap style={{ width: 20, height: 20 }} />
                Instructors ({instructors.length})
              </button>
            </div>

            <div style={{ marginBottom: '2rem', position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: 20, height: 20, pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', border: '2px solid #e5e7eb', borderRadius: '0.75rem', outline: 'none', boxSizing: 'border-box', fontSize: '0.9375rem', transition: 'all 0.2s', backgroundColor: 'white' }}
                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading...</div>}
            {error && <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>{error}</div>}

            {!loading && !error && (
              <>
                {activeTab === 'courses' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                    {filteredCourses.length === 0 ? (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
                        <BookOpen style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>No courses found</p>
                      </div>
                    ) : (
                      filteredCourses.map((course, idx) => (
                        <div 
                          key={course._id} 
                          onClick={() => navigateToCourse(course)}
                          style={{ backgroundColor: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'all 0.3s', animation: `fadeInUp 0.4s ease-out ${idx * 0.05}s backwards`, cursor: 'pointer' }} 
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }} 
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
                        >
                          {(course.thumbnail || course.image) && (
                            <div style={{ width: '100%', height: '200px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                              <img 
                                src={course.thumbnail || course.image} 
                                alt={course.title} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              />
                            </div>
                          )}
                          <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                              <div style={{ padding: '0.5rem', backgroundColor: '#ede9fe', borderRadius: '0.5rem' }}>
                                <BookOpen style={{ width: 20, height: 20, color: '#7c3aed' }} />
                              </div>
                              <div style={{ padding: '0.375rem 0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                                ₹{course.price}
                              </div>
                            </div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem', lineHeight: 1.3 }}>{course.title}</h3>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>by {course.instructor}</p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{ padding: '0.25rem 0.625rem', backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 500 }}>{course.category}</span>
                              <span style={{ padding: '0.25rem 0.625rem', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 500 }}>{course.students || 0} students</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'students' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {filteredStudents.length === 0 ? (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
                        <Users style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>No students found</p>
                      </div>
                    ) : (
                      filteredStudents.map((student, idx) => (
                        <div 
                          key={student._id} 
                          onClick={() => navigateToStudent(student)}
                          style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '2px solid #f3f4f6', transition: 'all 0.3s', animation: `fadeInUp 0.4s ease-out ${idx * 0.05}s backwards`, cursor: 'pointer' }} 
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(102,126,234,0.15)'; e.currentTarget.style.borderColor = '#667eea'; }} 
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#f3f4f6'; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: 'white', flexShrink: 0, boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
                              {student.name?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.name}</h3>
                              <p style={{ fontSize: '0.8125rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{student.email}</p>
                            </div>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ padding: '0.875rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                              <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Student ID</p>
                              <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 700, fontFamily: 'monospace', margin: 0 }}>{student.userId}</p>
                            </div>
                            <div style={{ padding: '0.875rem', backgroundColor: '#f0f9ff', borderRadius: '0.5rem' }}>
                              <p style={{ fontSize: '0.6875rem', color: '#0369a1', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Courses</p>
                              <p style={{ fontSize: '0.875rem', color: '#0284c7', fontWeight: 700, margin: 0 }}>{student.enrolledCourses?.length || 0} Enrolled</p>
                            </div>
                          </div>

                          <div style={{ paddingTop: '0.875rem', borderTop: '1px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '0.125rem', textTransform: 'uppercase', fontWeight: 600 }}>Joined</p>
                                <p style={{ fontSize: '0.8125rem', color: '#374151', fontWeight: 600, margin: 0 }}>{new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#667eea' }}>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>View Details</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="5" y1="12" x2="19" y2="12"/>
                                  <polyline points="12 5 19 12 12 19"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'instructors' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {filteredInstructors.length === 0 ? (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
                        <GraduationCap style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>No instructors found</p>
                      </div>
                    ) : (
                      filteredInstructors.map((instructor, idx) => (
                        <div 
                          key={instructor._id} 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🔥 Instructor card clicked:', instructor);
                            navigateToInstructor(instructor);
                          }}
                          style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '2px solid #f3f4f6', transition: 'all 0.3s', animation: `fadeInUp 0.4s ease-out ${idx * 0.05}s backwards`, cursor: 'pointer' }} 
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(245,158,11,0.15)'; e.currentTarget.style.borderColor = '#f59e0b'; }} 
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#f3f4f6'; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: 'white', flexShrink: 0, boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
                              {instructor.name?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{instructor.name}</h3>
                              <p style={{ fontSize: '0.8125rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{instructor.email}</p>
                            </div>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ padding: '0.875rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                              <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Instructor ID</p>
                              <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 700, fontFamily: 'monospace', margin: 0 }}>{instructor.userId}</p>
                            </div>
                            <div style={{ padding: '0.875rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem' }}>
                              <p style={{ fontSize: '0.6875rem', color: '#92400e', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Courses</p>
                              <p style={{ fontSize: '0.875rem', color: '#b45309', fontWeight: 700, margin: 0 }}>{instructor.coursesCreated || 0} Created</p>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                              <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Joined</p>
                              <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 600, margin: 0 }}>{new Date(instructor.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                          </div>

                          <div style={{ paddingTop: '0.875rem', borderTop: '1px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '0.125rem', textTransform: 'uppercase', fontWeight: 600 }}>Status</p>
                                <span style={{ display: 'inline-block', padding: '0.25rem 0.625rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                                  Active
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#f59e0b' }}>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>View Details</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="5" y1="12" x2="19" y2="12"/>
                                  <polyline points="12 5 19 12 12 19"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {viewingItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => setViewingItem(null)}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', maxWidth: '600px', width: '100%', padding: '2rem', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Details</h3>
              <button onClick={() => setViewingItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: 24, height: 24 }} />
              </button>
            </div>
            <pre style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.375rem', overflow: 'auto', fontSize: '0.875rem' }}>
              {JSON.stringify(viewingItem.data, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowDeleteConfirm(null)}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', maxWidth: '420px', width: '100%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'scaleIn 0.2s ease-out' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Trash2 style={{ width: 32, height: 32, color: '#dc2626' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Confirm {showDeleteConfirm.type === 'unenroll' ? 'Unenroll' : 'Delete'}</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9375rem' }}>
                {showDeleteConfirm.type === 'unenroll' && `Are you sure you want to unenroll this student from "${showDeleteConfirm.name}"? They will lose all progress in this course.`}
                {showDeleteConfirm.type === 'lecture' && 'Are you sure you want to delete this lecture? This action cannot be undone.'}
                {showDeleteConfirm.type === 'quiz' && 'Are you sure you want to delete this quiz? All student attempts will also be deleted.'}
                {(showDeleteConfirm.type === 'course' || showDeleteConfirm.type === 'student' || showDeleteConfirm.type === 'instructor') && 
                  `Are you sure you want to delete "${showDeleteConfirm.name}"? This action cannot be undone.`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => setShowDeleteConfirm(null)} 
                style={{ flex: 1, padding: '0.75rem 1.5rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (showDeleteConfirm.type === 'unenroll') {
                    confirmUnenroll(showDeleteConfirm.id, showDeleteConfirm.studentId);
                  } else if (showDeleteConfirm.type === 'lecture') {
                    confirmDeleteLecture(showDeleteConfirm.id);
                  } else if (showDeleteConfirm.type === 'quiz') {
                    confirmDeleteQuiz(showDeleteConfirm.id);
                  } else {
                    handleDelete(showDeleteConfirm.type, showDeleteConfirm.id);
                  }
                }}
                style={{ flex: 1, padding: '0.75rem 1.5rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(220,38,38,0.3)' }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = '#b91c1c'; e.target.style.boxShadow = '0 4px 12px rgba(220,38,38,0.4)'; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = '#dc2626'; e.target.style.boxShadow = '0 2px 8px rgba(220,38,38,0.3)'; }}
              >
                Yes, {showDeleteConfirm.type === 'unenroll' ? 'Unenroll' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }} onClick={() => setShowLogoutConfirm(false)}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', maxWidth: '420px', width: '100%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'scaleIn 0.2s ease-out' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Confirm Logout</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9375rem' }}>Are you sure you want to logout from your admin account?</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => setShowLogoutConfirm(false)} 
                style={{ flex: 1, padding: '0.75rem 1.5rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout} 
                style={{ flex: 1, padding: '0.75rem 1.5rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(220,38,38,0.3)' }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = '#b91c1c'; e.target.style.boxShadow = '0 4px 12px rgba(220,38,38,0.4)'; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = '#dc2626'; e.target.style.boxShadow = '0 2px 8px rgba(220,38,38,0.3)'; }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Edit Form Modal */}
      {showCourseEditForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '1rem', overflowY: 'auto' }} onClick={() => setShowCourseEditForm(false)}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', maxWidth: '700px', width: '100%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'scaleIn 0.2s ease-out', maxHeight: '90vh', overflowY: 'auto', margin: '2rem auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                Edit Course
              </h3>
              <button onClick={() => setShowCourseEditForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                <X style={{ width: 24, height: 24, color: '#6b7280' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  Course Title <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                  placeholder="Enter course title"
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  Description <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                  placeholder="Enter course description"
                  rows="4"
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Category <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({...courseForm, category: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  >
                    <option value="">Select Category</option>
                    <option value="development">Development</option>
                    <option value="design">Design</option>
                    <option value="business">Business</option>
                    <option value="marketing">Marketing</option>
                    <option value="data-science">Data Science</option>
                    <option value="photography">Photography</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Level <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({...courseForm, level: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  >
                    <option value="">Select Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Price (₹) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({...courseForm, price: e.target.value})}
                    placeholder="499"
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Duration <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})}
                    placeholder="e.g., 10 hours"
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  Course Thumbnail
                </label>
                {courseForm.image && (
                  <div style={{ marginBottom: '0.75rem', position: 'relative', width: '200px', height: '120px', borderRadius: '0.5rem', overflow: 'hidden', border: '2px solid #e5e7eb' }}>
                    <img src={courseForm.image} alt="Course thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => setCourseForm({...courseForm, image: ''})}
                      style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(220, 38, 38, 0.9)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                    >
                      <X style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadCourseThumbnail}
                  style={{ display: 'none' }}
                  id="course-thumbnail-upload"
                />
                <label
                  htmlFor="course-thumbnail-upload"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', backgroundColor: '#f0f9ff', color: '#0284c7', border: '2px dashed #bae6fd', borderRadius: '0.5rem', cursor: uploadingCourseThumbnail ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s' }}
                  onMouseEnter={(e) => !uploadingCourseThumbnail && (e.target.style.backgroundColor = '#e0f2fe')}
                  onMouseLeave={(e) => !uploadingCourseThumbnail && (e.target.style.backgroundColor = '#f0f9ff')}
                >
                  {uploadingCourseThumbnail ? (
                    <>
                      <div style={{ width: '16px', height: '16px', border: '2px solid #0284c7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      Upload Thumbnail
                    </>
                  )}
                </label>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>PNG, JPG up to 5MB</p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '2px solid #f3f4f6' }}>
                <button
                  onClick={() => setShowCourseEditForm(false)}
                  style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCourse}
                  disabled={loading}
                  style={{ flex: 1, padding: '0.75rem', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 12px rgba(102,126,234,0.3)' }}
                  onMouseEnter={(e) => !loading && (e.target.style.boxShadow = '0 6px 16px rgba(102,126,234,0.4)')}
                  onMouseLeave={(e) => !loading && (e.target.style.boxShadow = '0 4px 12px rgba(102,126,234,0.3)')}
                >
                  {loading ? 'Saving...' : 'Update Course'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lecture Form Modal */}
      {showLectureForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '1rem', overflowY: 'auto' }} onClick={() => setShowLectureForm(false)}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', maxWidth: '600px', width: '100%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'scaleIn 0.2s ease-out', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {editingLecture ? 'Edit Lecture' : 'Add New Lecture'}
              </h3>
              <button onClick={() => setShowLectureForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                <X style={{ width: 24, height: 24, color: '#6b7280' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  Title <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={lectureForm.title}
                  onChange={(e) => setLectureForm({...lectureForm, title: e.target.value})}
                  placeholder="Enter lecture title"
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  Description
                </label>
                <textarea
                  value={lectureForm.description}
                  onChange={(e) => setLectureForm({...lectureForm, description: e.target.value})}
                  placeholder="Enter lecture description"
                  rows="3"
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  Video URL <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="url"
                  value={lectureForm.videoUrl}
                  onChange={(e) => setLectureForm({...lectureForm, videoUrl: e.target.value})}
                  placeholder="https://cloudinary.com/video/..."
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  Duration <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={lectureForm.duration}
                  onChange={(e) => setLectureForm({...lectureForm, duration: e.target.value})}
                  placeholder="e.g., 15:30"
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  Thumbnail URL
                </label>
                {lectureForm.thumbnail && (
                  <div style={{ marginBottom: '0.75rem', position: 'relative', width: '200px', height: '120px', borderRadius: '0.5rem', overflow: 'hidden', border: '2px solid #e5e7eb' }}>
                    <img src={lectureForm.thumbnail} alt="Lecture thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => setLectureForm({...lectureForm, thumbnail: ''})}
                      style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(220, 38, 38, 0.9)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                    >
                      <X style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadLectureThumbnail}
                  style={{ display: 'none' }}
                  id="lecture-thumbnail-upload"
                />
                <label
                  htmlFor="lecture-thumbnail-upload"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', backgroundColor: '#f0f9ff', color: '#0284c7', border: '2px dashed #bae6fd', borderRadius: '0.5rem', cursor: uploadingLectureThumbnail ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s' }}
                  onMouseEnter={(e) => !uploadingLectureThumbnail && (e.target.style.backgroundColor = '#e0f2fe')}
                  onMouseLeave={(e) => !uploadingLectureThumbnail && (e.target.style.backgroundColor = '#f0f9ff')}
                >
                  {uploadingLectureThumbnail ? (
                    <>
                      <div style={{ width: '16px', height: '16px', border: '2px solid #0284c7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      Upload Thumbnail
                    </>
                  )}
                </label>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>PNG, JPG up to 5MB (Optional)</p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  onClick={() => setShowLectureForm(false)}
                  style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLecture}
                  disabled={loading}
                  style={{ flex: 1, padding: '0.75rem', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 12px rgba(102,126,234,0.3)' }}
                  onMouseEnter={(e) => !loading && (e.target.style.boxShadow = '0 6px 16px rgba(102,126,234,0.4)')}
                  onMouseLeave={(e) => !loading && (e.target.style.boxShadow = '0 4px 12px rgba(102,126,234,0.3)')}
                >
                  {loading ? 'Saving...' : editingLecture ? 'Update Lecture' : 'Add Lecture'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {playingLecture && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002, padding: '2rem' }} onClick={() => setPlayingLecture(null)}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', maxWidth: '1000px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', animation: 'scaleIn 0.3s ease-out', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            {/* Video Player Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{playingLecture.title}</h3>
                {playingLecture.duration && (
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>Duration: {playingLecture.duration}</p>
                )}
              </div>
              <button 
                onClick={() => setPlayingLecture(null)} 
                style={{ background: '#f3f4f6', border: 'none', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', borderRadius: '0.5rem', marginLeft: '1rem', flexShrink: 0 }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = '#e5e7eb'; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = '#f3f4f6'; }}
              >
                <X style={{ width: 20, height: 20, color: '#374151' }} />
              </button>
            </div>

            {/* Video Player */}
            <div style={{ backgroundColor: '#000', width: '100%', aspectRatio: '16/9' }}>
              <video
                controls
                autoPlay
                style={{ width: '100%', height: '100%', display: 'block', outline: 'none' }}
                src={playingLecture.videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Info Footer */}
            {playingLecture.description && (
              <div style={{ padding: '1.25rem 1.5rem', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>About this lecture</h4>
                <p style={{ fontSize: '0.9375rem', color: '#374151', margin: 0, lineHeight: 1.6 }}>{playingLecture.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quiz Form Modal */}
      {showQuizForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '1rem', overflowY: 'auto' }} onClick={() => setShowQuizForm(false)}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', maxWidth: '800px', width: '100%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'scaleIn 0.2s ease-out', maxHeight: '90vh', overflowY: 'auto', margin: '2rem auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {editingQuiz ? 'Edit Quiz' : 'Add New Quiz'}
              </h3>
              <button onClick={() => setShowQuizForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                <X style={{ width: 24, height: 24, color: '#6b7280' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Quiz Basic Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Quiz Title <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                    placeholder="Enter quiz title"
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Description
                  </label>
                  <textarea
                    value={quizForm.description}
                    onChange={(e) => setQuizForm({...quizForm, description: e.target.value})}
                    placeholder="Enter quiz description"
                    rows="2"
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Timer (minutes) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quizForm.timerMinutes}
                    onChange={(e) => setQuizForm({...quizForm, timerMinutes: parseInt(e.target.value) || 1})}
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Allow Retake
                  </label>
                  <select
                    value={quizForm.allowRetake ? 'true' : 'false'}
                    onChange={(e) => setQuizForm({...quizForm, allowRetake: e.target.value === 'true'})}
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              {/* Questions */}
              <div style={{ borderTop: '2px solid #f3f4f6', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                    Questions ({quizForm.questions.length})
                  </h4>
                  <button
                    onClick={addQuizQuestion}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e0f2fe'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f9ff'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add Question
                  </button>
                </div>

                {quizForm.questions.map((question, qIndex) => (
                  <div key={qIndex} style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1rem', border: '2px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <h5 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>Question {qIndex + 1}</h5>
                      {quizForm.questions.length > 1 && (
                        <button
                          onClick={() => removeQuizQuestion(qIndex)}
                          style={{ padding: '0.25rem 0.5rem', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500 }}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                        Question Text <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <textarea
                        value={question.questionText}
                        onChange={(e) => updateQuizQuestion(qIndex, 'questionText', e.target.value)}
                        placeholder="Enter your question"
                        rows="2"
                        style={{ width: '100%', padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                        Options (select correct answer)
                      </label>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={question.correctAnswer === oIndex}
                            onChange={() => updateQuizQuestion(qIndex, 'correctAnswer', oIndex)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateQuizOption(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                            style={{ flex: 1, padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '2px solid #f3f4f6' }}>
                <button
                  onClick={() => setShowQuizForm(false)}
                  style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuiz}
                  disabled={loading}
                  style={{ flex: 1, padding: '0.75rem', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 12px rgba(102,126,234,0.3)' }}
                  onMouseEnter={(e) => !loading && (e.target.style.boxShadow = '0 6px 16px rgba(102,126,234,0.4)')}
                  onMouseLeave={(e) => !loading && (e.target.style.boxShadow = '0 4px 12px rgba(102,126,234,0.3)')}
                >
                  {loading ? 'Saving...' : editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Password Reset Modal */}
      {showStudentPasswordReset && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002 }} onClick={() => { setShowStudentPasswordReset(false); setPasswordErrors({}); }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', maxWidth: '500px', width: '100%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'scaleIn 0.2s ease-out' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Reset Student Password</h3>
              <button onClick={() => { setShowStudentPasswordReset(false); setPasswordErrors({}); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                <X style={{ width: 24, height: 24, color: '#6b7280' }} />
              </button>
            </div>

            {passwordErrors.general && (
              <div style={{ padding: '0.875rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>{passwordErrors.general}</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  Student Email <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="email"
                  value={studentPasswordForm.email}
                  onChange={(e) => {
                    setStudentPasswordForm({...studentPasswordForm, email: e.target.value});
                    setPasswordErrors({});
                  }}
                  placeholder="student@example.com"
                  style={{ width: '100%', padding: '0.75rem', border: `2px solid ${passwordErrors.email ? '#dc2626' : '#e5e7eb'}`, borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f9fafb' }}
                  onFocus={(e) => !passwordErrors.email && (e.target.style.borderColor = '#667eea')}
                  onBlur={(e) => !passwordErrors.email && (e.target.style.borderColor = '#e5e7eb')}
                />
                {passwordErrors.email && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{passwordErrors.email}</p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  New Password <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="password"
                  value={studentPasswordForm.newPassword}
                  onChange={(e) => {
                    setStudentPasswordForm({...studentPasswordForm, newPassword: e.target.value});
                    setPasswordErrors({});
                  }}
                  placeholder="Enter new password"
                  style={{ width: '100%', padding: '0.75rem', border: `2px solid ${passwordErrors.password ? '#dc2626' : '#e5e7eb'}`, borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f9fafb' }}
                  onFocus={(e) => !passwordErrors.password && (e.target.style.borderColor = '#667eea')}
                  onBlur={(e) => !passwordErrors.password && (e.target.style.borderColor = '#e5e7eb')}
                />
                {passwordErrors.password && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{passwordErrors.password}</p>
                )}
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Min 6 characters with letter, number & symbol (@$!%*#?&)
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  Confirm Password <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="password"
                  value={studentPasswordForm.confirmPassword}
                  onChange={(e) => {
                    setStudentPasswordForm({...studentPasswordForm, confirmPassword: e.target.value});
                    setPasswordErrors({});
                  }}
                  placeholder="Confirm new password"
                  style={{ width: '100%', padding: '0.75rem', border: `2px solid ${passwordErrors.confirm ? '#dc2626' : '#e5e7eb'}`, borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f9fafb' }}
                  onFocus={(e) => !passwordErrors.confirm && (e.target.style.borderColor = '#667eea')}
                  onBlur={(e) => !passwordErrors.confirm && (e.target.style.borderColor = '#e5e7eb')}
                />
                {passwordErrors.confirm && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{passwordErrors.confirm}</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  onClick={() => { setShowStudentPasswordReset(false); setPasswordErrors({}); }}
                  style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStudentPasswordReset}
                  disabled={loading}
                  style={{ flex: 1, padding: '0.75rem', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 12px rgba(102,126,234,0.3)' }}
                  onMouseEnter={(e) => !loading && (e.target.style.boxShadow = '0 6px 16px rgba(102,126,234,0.4)')}
                  onMouseLeave={(e) => !loading && (e.target.style.boxShadow = '0 4px 12px rgba(102,126,234,0.3)')}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Instructor Password Reset Modal */}
      {showInstructorPasswordReset && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002 }} onClick={() => { setShowInstructorPasswordReset(false); setPasswordErrors({}); }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', maxWidth: '500px', width: '100%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'scaleIn 0.2s ease-out' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Reset Instructor Password</h3>
              <button onClick={() => { setShowInstructorPasswordReset(false); setPasswordErrors({}); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                <X style={{ width: 24, height: 24, color: '#6b7280' }} />
              </button>
            </div>

            {passwordErrors.general && (
              <div style={{ padding: '0.875rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>{passwordErrors.general}</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  Instructor Email <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="email"
                  value={instructorPasswordForm.email}
                  onChange={(e) => {
                    setInstructorPasswordForm({...instructorPasswordForm, email: e.target.value});
                    setPasswordErrors({});
                  }}
                  placeholder="instructor@example.com"
                  style={{ width: '100%', padding: '0.75rem', border: `2px solid ${passwordErrors.email ? '#dc2626' : '#e5e7eb'}`, borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f9fafb' }}
                  onFocus={(e) => !passwordErrors.email && (e.target.style.borderColor = '#f59e0b')}
                  onBlur={(e) => !passwordErrors.email && (e.target.style.borderColor = '#e5e7eb')}
                />
                {passwordErrors.email && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{passwordErrors.email}</p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  New Password <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="password"
                  value={instructorPasswordForm.newPassword}
                  onChange={(e) => {
                    setInstructorPasswordForm({...instructorPasswordForm, newPassword: e.target.value});
                    setPasswordErrors({});
                  }}
                  placeholder="Enter new password"
                  style={{ width: '100%', padding: '0.75rem', border: `2px solid ${passwordErrors.password ? '#dc2626' : '#e5e7eb'}`, borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f9fafb' }}
                  onFocus={(e) => !passwordErrors.password && (e.target.style.borderColor = '#f59e0b')}
                  onBlur={(e) => !passwordErrors.password && (e.target.style.borderColor = '#e5e7eb')}
                />
                {passwordErrors.password && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{passwordErrors.password}</p>
                )}
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Min 6 characters with letter, number & symbol (@$!%*#?&)
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  Confirm Password <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="password"
                  value={instructorPasswordForm.confirmPassword}
                  onChange={(e) => {
                    setInstructorPasswordForm({...instructorPasswordForm, confirmPassword: e.target.value});
                    setPasswordErrors({});
                  }}
                  placeholder="Confirm new password"
                  style={{ width: '100%', padding: '0.75rem', border: `2px solid ${passwordErrors.confirm ? '#dc2626' : '#e5e7eb'}`, borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f9fafb' }}
                  onFocus={(e) => !passwordErrors.confirm && (e.target.style.borderColor = '#f59e0b')}
                  onBlur={(e) => !passwordErrors.confirm && (e.target.style.borderColor = '#e5e7eb')}
                />
                {passwordErrors.confirm && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{passwordErrors.confirm}</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  onClick={() => { setShowInstructorPasswordReset(false); setPasswordErrors({}); }}
                  style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleInstructorPasswordReset}
                  disabled={loading}
                  style={{ flex: 1, padding: '0.75rem', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 12px rgba(245,158,11,0.3)' }}
                  onMouseEnter={(e) => !loading && (e.target.style.boxShadow = '0 6px 16px rgba(245,158,11,0.4)')}
                  onMouseLeave={(e) => !loading && (e.target.style.boxShadow = '0 4px 12px rgba(245,158,11,0.3)')}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Admin Password Change Modal */}
      {showPasswordResetModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002 }} onClick={() => { setShowPasswordResetModal(false); setPasswordErrors({}); }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', maxWidth: '500px', width: '100%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'scaleIn 0.2s ease-out' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Change Your Password</h3>
              <button onClick={() => { setShowPasswordResetModal(false); setPasswordErrors({}); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                <X style={{ width: 24, height: 24, color: '#6b7280' }} />
              </button>
            </div>

            {passwordErrors.general && (
              <div style={{ padding: '0.875rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>{passwordErrors.general}</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  Email Address <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="email"
                  value={passwordResetForm.email}
                  onChange={(e) => {
                    setPasswordResetForm({...passwordResetForm, email: e.target.value});
                    setPasswordErrors({});
                  }}
                  placeholder="admin@learnhub.com"
                  style={{ width: '100%', padding: '0.75rem', border: `2px solid ${passwordErrors.email ? '#dc2626' : '#e5e7eb'}`, borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f9fafb' }}
                  onFocus={(e) => !passwordErrors.email && (e.target.style.borderColor = '#667eea')}
                  onBlur={(e) => !passwordErrors.email && (e.target.style.borderColor = '#e5e7eb')}
                />
                {passwordErrors.email && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{passwordErrors.email}</p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  New Password <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="password"
                  value={passwordResetForm.newPassword}
                  onChange={(e) => {
                    setPasswordResetForm({...passwordResetForm, newPassword: e.target.value});
                    setPasswordErrors({});
                  }}
                  placeholder="Enter new password"
                  style={{ width: '100%', padding: '0.75rem', border: `2px solid ${passwordErrors.password ? '#dc2626' : '#e5e7eb'}`, borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f9fafb' }}
                  onFocus={(e) => !passwordErrors.password && (e.target.style.borderColor = '#667eea')}
                  onBlur={(e) => !passwordErrors.password && (e.target.style.borderColor = '#e5e7eb')}
                />
                {passwordErrors.password && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{passwordErrors.password}</p>
                )}
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Min 6 characters with letter, number & symbol (@$!%*#?&)
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  Confirm Password <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="password"
                  value={passwordResetForm.confirmPassword}
                  onChange={(e) => {
                    setPasswordResetForm({...passwordResetForm, confirmPassword: e.target.value});
                    setPasswordErrors({});
                  }}
                  placeholder="Confirm new password"
                  style={{ width: '100%', padding: '0.75rem', border: `2px solid ${passwordErrors.confirm ? '#dc2626' : '#e5e7eb'}`, borderRadius: '0.5rem', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f9fafb' }}
                  onFocus={(e) => !passwordErrors.confirm && (e.target.style.borderColor = '#667eea')}
                  onBlur={(e) => !passwordErrors.confirm && (e.target.style.borderColor = '#e5e7eb')}
                />
                {passwordErrors.confirm && (
                  <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{passwordErrors.confirm}</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  onClick={() => { setShowPasswordResetModal(false); setPasswordErrors({}); }}
                  style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdminPasswordChange}
                  disabled={loading}
                  style={{ flex: 1, padding: '0.75rem', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9375rem', transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 12px rgba(102,126,234,0.3)' }}
                  onMouseEnter={(e) => !loading && (e.target.style.boxShadow = '0 6px 16px rgba(102,126,234,0.4)')}
                  onMouseLeave={(e) => !loading && (e.target.style.boxShadow = '0 4px 12px rgba(102,126,234,0.3)')}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrolled Students Modal */}
      {showEnrolledStudentsModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002, padding: '2rem' }} onClick={() => setShowEnrolledStudentsModal(false)}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', maxWidth: '800px', width: '100%', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'scaleIn 0.2s ease-out', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #f3f4f6' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>Enrolled Students</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{viewingCourse?.title}</p>
              </div>
              <button onClick={() => setShowEnrolledStudentsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                <X style={{ width: 24, height: 24, color: '#6b7280' }} />
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading students...</p>
              </div>
            ) : enrolledStudentsData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                <Users style={{ width: 64, height: 64, margin: '0 auto 1rem', opacity: 0.5 }} />
                <p style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>No students enrolled yet</p>
                <p style={{ fontSize: '0.875rem' }}>This course doesn't have any enrolled students</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {enrolledStudentsData.map((student, idx) => (
                  <div key={student._id} style={{ padding: '1.25rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem', border: '2px solid #e5e7eb', transition: 'all 0.2s', cursor: 'pointer' }} 
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#667eea'; e.currentTarget.style.backgroundColor = '#f0f9ff'; }} 
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                    onClick={() => {
                      setShowEnrolledStudentsModal(false);
                      navigateToStudent(student);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                        {student.name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: '0 0 0.25rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.name}</h4>
                        <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0 0 0.25rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.email}</p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
                          <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>ID: {student.userId}</span>
                          <span>•</span>
                          <span>Enrolled: {new Date(student.enrolledAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>{student.progress || 0}%</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Progress</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px solid #f3f4f6', textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                Total: <strong style={{ color: '#111827' }}>{enrolledStudentsData.length}</strong> student{enrolledStudentsData.length !== 1 ? 's' : ''} enrolled
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-30px) translateX(30px);
          }
        }
        @keyframes bounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(102,126,234,0.3);
          }
          50% {
            box-shadow: 0 4px 20px rgba(102,126,234,0.5);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
