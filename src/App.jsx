import React, { useState, useEffect } from 'react';
import { Search, Play, Star, Clock, Users, BookOpen, Award, Menu, X, ChevronRight, Filter, TrendingUp, Globe, Shield, Zap, Quote, Mail, Phone, Lock, Eye, EyeOff, LogOut } from 'lucide-react';
import InstructorDashboard from './InstructorDashboard.jsx';
import AdminDashboard from './AdminDashboard.jsx';

const API = import.meta.env.VITE_API_URL;

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [loginMethod, setLoginMethod] = useState('email');
  const [userType, setUserType] = useState('student');
  const [courseLectures, setCourseLectures] = useState({});
  const [playingVideo, setPlayingVideo] = useState(null);
  const [loadingLectures, setLoadingLectures] = useState(false);
  const [viewingEnrolledCourseLectures, setViewingEnrolledCourseLectures] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [viewingStudentCourse, setViewingStudentCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showQuitQuizConfirm, setShowQuitQuizConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
    otpSent: false,
    otpVerified: false
  });
  
  // OTP states - MOVED OUTSIDE AuthModal to fix state update issue
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [authFormData, setAuthFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [notification, setNotification] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [forgotPasswordOtpSent, setForgotPasswordOtpSent] = useState(false);
  const [forgotPasswordOtpVerified, setForgotPasswordOtpVerified] = useState(false);
  const [sendingForgotPasswordOtp, setSendingForgotPasswordOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null); 
  const [studentCourseTab, setStudentCourseTab] = useState('lectures');
  const [lectureProgress, setLectureProgress] = useState({});
  const [videoWatchTime, setVideoWatchTime] = useState({});
  const [viewFromMyCourses, setViewFromMyCourses] = useState(false);
  const [reviewScrollPosition, setReviewScrollPosition] = useState(0);
  const [footerPage, setFooterPage] = useState(null); // 'about', 'contact', 'privacy', 'terms', 'refund', 'cookies'
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCourseForPayment, setSelectedCourseForPayment] = useState(null);
  const [paymentAccepted, setPaymentAccepted] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [courseQuizzes, setCourseQuizzes] = useState({});
  const [studentQuizzes, setStudentQuizzes] = useState([]);
  const [takingQuiz, setTakingQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [quizTimeRemaining, setQuizTimeRemaining] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [showQuizResults, setShowQuizResults] = useState(null);
  const [quizReviewMode, setQuizReviewMode] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  // Password validation function
  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/[A-Za-z]/.test(password)) {
      return 'Password must contain at least one letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*...)';
    }
    return null;
  };

  // Browser history management - handle back/forward
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state) {
        setCurrentPage(event.state.currentPage || 'home');
        setViewingStudentCourse(event.state.viewingStudentCourse || null);
        // setViewingCourse(event.state.viewingCourse || null);
        // setEditingCourse(event.state.editingCourse || null);
        setViewFromMyCourses(event.state.viewFromMyCourses || false);
        setSelectedCourse(event.state.selectedCourse || null);
        setFooterPage(event.state.footerPage || null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Push state to history whenever navigation state changes
  useEffect(() => {
    const state = {
      currentPage,
      viewingStudentCourse,
      // viewingCourse,
      // editingCourse,
      viewFromMyCourses,
      selectedCourse,
      footerPage
    };
    
    // Push to browser history
    const url = new URL(window.location);
    url.searchParams.set('page', footerPage || currentPage);
    if (footerPage) {
      url.searchParams.set('footerPage', footerPage);
    } else {
      url.searchParams.delete('footerPage');
    }
    
    window.history.pushState(state, '', url);
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, footerPage]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileMenu && !e.target.closest('button')) {
        setShowProfileMenu(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Convert image to base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select an image file'));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Image size should be less than 5MB'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Generate unique ID for user
  const generateUserId = (name, role) => {
    // Get first 3 letters of name (uppercase)
    const namePrefix = name.substring(0, 3).toUpperCase().padEnd(3, 'X');
    // Generate random 2 digit number
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    // Role identifier: I for instructor, S for student
    const roleId = role === 'instructor' ? 'I' : 'S';
    
    return `${namePrefix}${randomNum}${roleId}`;
  };

  // Load user and lecture progress from localStorage on mount
useEffect(() => {
  const savedUser = localStorage.getItem('learnhub_user');
  const savedToken = localStorage.getItem('learnhub_token');
  const savedProgress = localStorage.getItem('learnhub_lecture_progress');
  
  if (savedUser && savedToken) {
    const parsedUser = JSON.parse(savedUser);
    // Generate ID if not exists
    if (!parsedUser.userId) {
      parsedUser.userId = generateUserId(parsedUser.name, parsedUser.role);
      localStorage.setItem('learnhub_user', JSON.stringify(parsedUser));
    }
    setUser(parsedUser);
    setToken(savedToken);
    
    // Set default dashboard based on role
    setCurrentPage(parsedUser.role === 'instructor' ? 'instructor-dashboard' : 'dashboard');
  }
  
  // Load saved lecture progress
  if (savedProgress) {
    try {
      setLectureProgress(JSON.parse(savedProgress));
    } catch (error) {
      console.error('Error loading lecture progress:', error);
    }
  }
}, []);

  // Fetch courses from backend
  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, searchQuery]);

  const fetchCourses = async () => {
    try {
      setApiError(null);
      const queryParams = new URLSearchParams();
      if (selectedCategory !== 'all') {
        queryParams.append('category', selectedCategory);
      }
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      
      // Add cache-busting timestamp to force fresh data
      queryParams.append('_t', Date.now().toString());
      
      const response = await fetch(`${API_URL}/api/courses?${queryParams}`);
      const data = await response.json();
      
      if (response.ok && data.courses) {
        // Ensure each course has both id and _id for compatibility
        const coursesWithIds = data.courses.map(course => ({
          ...course,
          id: course._id, // Map MongoDB _id to id for frontend consistency
          _id: course._id,
          // Add timestamp to force re-render when image changes
          _lastUpdated: Date.now()
        }));
        setCourses(coursesWithIds);
      } else {
        throw new Error(data.message || 'Failed to fetch courses');
      }
    } catch (error) {
  console.error("Failed to fetch courses:", error);

  // Keep using fallback courses if API fails
  if (courses.length === 0) {
    setCourses(fallbackCourses);
  }
}
  };

useEffect(() => {
  if (user && token) {
    if (user.role !== 'instructor') {
      // Only fetch for students
      fetchEnrolledCourses();
      fetchStudentQuizzes();
      fetchQuizzes();
    }
  }
}, [user, token]);

  // Fetch lectures for all enrolled courses when on My Courses page
  useEffect(() => {
    if (currentPage === 'my-courses' && enrolledCourses.length > 0 && token) {
      enrolledCourses.forEach(course => {
        const courseId = course.id || course.courseId;
        // Only fetch if not already loaded
        if (!courseLectures[courseId]) {
          fetchCourseLectures(courseId);
        }
      });
    }
  }, [currentPage, enrolledCourses, token]);

  const fetchEnrolledCourses = async () => {
    try {
      setApiError(null);
      const response = await fetch(`${API_URL}/api/user/enrolled-courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok && data.enrolledCourses) {
        // Ensure each course has both id and _id for compatibility
        const coursesWithIds = data.enrolledCourses.map(course => ({
          ...course,
          id: course._id, // Map MongoDB _id to id for frontend consistency
          _id: course._id
        }));
        setEnrolledCourses(coursesWithIds);
      } else {
        throw new Error(data.message || 'Failed to fetch enrolled courses');
      }
    } catch (error) {
      setApiError('Failed to load enrolled courses');
    }
  };

  // Quiz timer countdown effect with auto-submit
  useEffect(() => {
    if (takingQuiz && !showQuizResults && quizTimeRemaining > 0) {
      const timer = setInterval(() => {
        setQuizTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up! Auto-submit
            clearInterval(timer);
            handleQuizAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [takingQuiz, showQuizResults, quizTimeRemaining]);

  // Handle auto-submit when timer ends
  const handleQuizAutoSubmit = async () => {
    if (!takingQuiz || !token) return;
    
    showNotification('Time is up! Quiz submitted automatically.', 'warning');
    setIsLoading(true);
    
    try {
      // Map answers to the format backend expects - only include answered questions
      const answers = [];
      for (let i = 0; i < takingQuiz.questions.length; i++) {
        if (studentAnswers[i] !== undefined) {
          answers.push({
            questionIndex: i,
            selectedAnswer: studentAnswers[i] // Already 0-based, send as-is
          });
        }
      }

      const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000);

      console.log('⏰ Auto-submitting quiz (time expired):', {
        answersProvided: answers.length,
        totalQuestions: takingQuiz.questions.length
      });

      const response = await fetch(`${API_URL}/api/quizzes/${takingQuiz._id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers, timeSpent })
      });

      const data = await response.json();

      if (response.ok) {
        // Store student answers with the result for review
        const resultWithAnswers = {
          ...data.result,
          studentAnswers: answers,
          quizQuestions: takingQuiz.questions
        };
        setShowQuizResults(resultWithAnswers);
        setQuizReviewMode(false);
      } else {
        showNotification(data.message || 'Failed to submit quiz!', 'error');
        // Still show results even if submission fails
        setTakingQuiz(null);
        setStudentAnswers({});
        setCurrentQuestionIndex(0);
      }
    } catch (error) {
      console.error('❌ Auto-submit error:', error);
      showNotification('Error submitting quiz!', 'error');
      setTakingQuiz(null);
      setStudentAnswers({});
      setCurrentQuestionIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Razorpay SDK dynamically
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        // Check if already loaded
        if (typeof window.Razorpay !== 'undefined') {
          console.log('✅ Razorpay SDK already loaded');
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          console.log('✅ Razorpay SDK loaded successfully');
          resolve(true);
        };
        script.onerror = () => {
          console.error('❌ Failed to load Razorpay SDK');
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  // Track video watch progress
  const updateLectureProgress = (lectureId, progress) => {
    const newProgress = {
      ...lectureProgress,
      [lectureId]: Math.min(100, Math.max(0, progress))
    };
    
    setLectureProgress(newProgress);
    
    // Save to localStorage
    try {
      localStorage.setItem('learnhub_lecture_progress', JSON.stringify(newProgress));
    } catch (error) {
      console.error('Error saving lecture progress:', error);
    }
  };

  // Simulate progress tracking when video is played
  useEffect(() => {
    if (playingVideo) {
      const lectureId = playingVideo._id || playingVideo.id;
      const currentProgress = lectureProgress[lectureId] || 0;
      
      // Start tracking watch time
      const interval = setInterval(() => {
        setVideoWatchTime(prev => {
          const newTime = (prev[lectureId] || 0) + 1;
          // Assume average video is 10 minutes (600 seconds)
          // Update progress every 6 seconds = 1%
          const newProgress = Math.min(100, Math.floor(newTime / 6));
          
          if (newProgress > currentProgress) {
            updateLectureProgress(lectureId, newProgress);
          }
          
          return {
            ...prev,
            [lectureId]: newTime
          };
        });
      }, 1000); // Update every second
      
      return () => clearInterval(interval);
    }
  }, [playingVideo]);

  const fetchCourseLectures = async (courseId, forceRefresh = false) => {
    if (!courseId || !token) return;
    
    setLoadingLectures(true);
    try {
      // Add cache-busting timestamp
      const timestamp = Date.now();
      const response = await fetch(`${API_URL}/api/courses/${courseId}/lectures?_t=${timestamp}&refresh=${forceRefresh ? '1' : '0'}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.lectures) {
        // Force complete state replacement with new timestamp
        setCourseLectures(prev => {
          // Create completely new object to force re-render
          const updated = {};
          // Copy all other course lectures only if not forcing refresh
          if (!forceRefresh) {
            Object.keys(prev).forEach(key => {
              if (key !== courseId) {
                updated[key] = prev[key];
              }
            });
          }
          // Add fresh lectures with unique keys to force React to re-render
          updated[courseId] = data.lectures.map((lecture, index) => ({
            ...lecture,
            thumbnail: lecture.thumbnail || null,
            _lastUpdated: timestamp,
            _forceUpdate: Math.random(), // Random key to force re-render
            _uniqueKey: `${lecture._id || lecture.id}-${timestamp}-${index}` // Unique identifier
          }));
          return updated;
        });
      }
    } catch (error) {
      showNotification('Could not load lectures. Please try again.', 'error');
    } finally {
      setLoadingLectures(false);
    }
  };

// Fetch quizzes for a course
const fetchCourseQuizzes = async (courseId) => {
  if (!courseId || !token) return;
  
  setLoadingQuizzes(true);
  try {
    const response = await fetch(`${API_URL}/api/courses/${courseId}/quizzes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.quizzes) {
      setCourseQuizzes(prev => ({
        ...prev,
        [courseId]: data.quizzes
      }));
    }
  } catch (error) {
    console.error('Error fetching quizzes:', error);
  } finally {
    setLoadingQuizzes(false);
  }
};

// Fetch lectures when viewing a course - fetch for both cases but use differently
useEffect(() => {
  if (viewingStudentCourse && user && token) {
    const courseId = viewingStudentCourse._id || viewingStudentCourse.id;
    fetchCourseLectures(courseId);
    fetchCourseQuizzes(courseId); // This line fetches quizzes
  }
}, [viewingStudentCourse, user, token]);


  // Fetch lectures when viewing enrolled course lectures
  useEffect(() => {
    if (viewingEnrolledCourseLectures && user && token) {
      const courseId = viewingEnrolledCourseLectures._id || viewingEnrolledCourseLectures.id;
      fetchCourseLectures(courseId);
    }
  }, [viewingEnrolledCourseLectures, user, token]);

  const fetchQuizzes = async () => {
    const mockQuizzes = [
      {
        id: 1,
        title: 'Web Development Basics Quiz',
        category: 'development',
        questions: [
          {
            id: 1,
            question: 'What does HTML stand for?',
            options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'],
            correctAnswer: 0
          },
          {
            id: 2,
            question: 'Which CSS property controls text size?',
            options: ['text-size', 'font-size', 'text-style', 'font-style'],
            correctAnswer: 1
          },
          {
            id: 3,
            question: 'What is JavaScript primarily used for?',
            options: ['Styling web pages', 'Database management', 'Adding interactivity to websites', 'Server configuration'],
            correctAnswer: 2
          }
        ],
        duration: '10 minutes'
      },
      {
        id: 2,
        title: 'UI/UX Design Principles',
        category: 'design',
        questions: [
          {
            id: 1,
            question: 'What does UX stand for?',
            options: ['User Experience', 'Universal Export', 'Unique Expression', 'User Extension'],
            correctAnswer: 0
          },
          {
            id: 2,
            question: 'Which design principle focuses on visual hierarchy?',
            options: ['Proximity', 'Contrast', 'Balance', 'All of the above'],
            correctAnswer: 3
          }
        ],
        duration: '8 minutes'
      }
    ];
    setQuizzes(mockQuizzes);
  };

  const fetchStudentQuizzes = async () => {
    if (!user || !token || user.role === 'instructor') return;
    
    setLoadingQuizzes(true);
    try {
      const response = await fetch(`${API_URL}/api/student/quizzes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.quizzes) {
        setStudentQuizzes(data.quizzes);
      } else {
        console.log('No quizzes found or error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching student quizzes:', error);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Courses' },
    { id: 'development', name: 'Development' },
    { id: 'design', name: 'Design' },
    { id: 'business', name: 'Business' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'data-science', name: 'Data Science' }
  ];

  const fallbackCourses = [
    {
      id: 1,
      title: 'Complete Web Development Bootcamp',
      instructor: 'Priya Sharma',
      category: 'development',
      rating: 4.8,
      reviews: 2430,
      students: 8500,
      duration: '52 hours',
      price: 499,
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop',
      description: 'Master web development from scratch with HTML, CSS, JavaScript, React, Node.js, and more.',
      lessons: 245,
      level: 'Beginner',
      bestseller: true
    },
    {
      id: 2,
      title: 'UI/UX Design Masterclass',
      instructor: 'Rahul Verma',
      category: 'design',
      rating: 4.7,
      reviews: 1890,
      students: 6200,
      duration: '38 hours',
      price: 449,
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
      description: 'Learn professional UI/UX design principles, Figma, user research, and design thinking.',
      lessons: 180,
      level: 'Intermediate',
      bestseller: true
    },
    {
      id: 3,
      title: 'Python for Data Science',
      instructor: 'Dr. Amit Kumar',
      category: 'data-science',
      rating: 4.9,
      reviews: 3543,
      students: 12500,
      duration: '45 hours',
      price: 549,
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop',
      description: 'Comprehensive Python course covering data analysis, visualization, and machine learning.',
      lessons: 210,
      level: 'Beginner'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Priya Sharma',
      role: 'Software Developer at TCS',
      location: 'Mumbai, Maharashtra',
      image: 'PS',
      course: 'Web Development Bootcamp',
      rating: 5.0,
      text: 'LearnHub completely transformed my career! The Web Development course was incredibly detailed and practical. I landed my dream job at TCS within 3 months of completing the course. The instructors are top-notch and the community support is amazing!'
    },
    {
      id: 2,
      name: 'Rohan Desai',
      role: 'Product Designer at Flipkart',
      location: 'Bangalore, Karnataka',
      image: 'RD',
      course: 'UI/UX Design Masterclass',
      rating: 4.5,
      text: 'Best decision I made for my career! The UI/UX course is absolutely worth every rupee. The real-world projects helped me build an impressive portfolio. Now working at Flipkart and couldn\'t be happier. Highly recommend LearnHub to anyone serious about upskilling!'
    },
    {
      id: 3,
      name: 'Sneha Patel',
      role: 'Data Analyst at Infosys',
      location: 'Pune, Maharashtra',
      image: 'SP',
      course: 'Python for Data Science',
      rating: 4.8,
      text: 'The Python course exceeded all my expectations! The content is so well-structured and easy to follow. I went from zero coding knowledge to confidently working with data in just 6 months. The instructors respond quickly and the learning pace is perfect for working professionals.'
    },
    {
      id: 4,
      name: 'Arjun Kumar',
      role: 'Marketing Manager at Amazon',
      location: 'Hyderabad, Telangana',
      image: 'AK',
      course: 'Digital Marketing Mastery',
      rating: 4.7,
      text: 'Outstanding course content! The digital marketing strategies taught here are practical and up-to-date. I implemented these techniques at Amazon and saw immediate results. The ROI tracking module was especially valuable. LearnHub has the best instructors in India!'
    },
    {
      id: 5,
      name: 'Ananya Singh',
      role: 'Full Stack Developer at Wipro',
      location: 'Chennai, Tamil Nadu',
      image: 'AS',
      course: 'Complete Web Development',
      rating: 5.0,
      text: 'From learning basics to building complex applications, this course covered everything! The project-based approach helped me understand real-world scenarios. Got placed at Wipro with a great package. Thank you LearnHub for making my dreams come true!'
    },
    {
      id: 6,
      name: 'Vikram Reddy',
      role: 'Business Analyst at Deloitte',
      location: 'Delhi, NCR',
      image: 'VR',
      course: 'Business Analytics Pro',
      rating: 4.6,
      text: 'The Business Analytics course is a game-changer! The instructors explain complex concepts in simple terms. The real-world case studies from Indian companies made learning relatable. Now working at Deloitte and using these skills daily. Absolutely worth the investment!'
    },
    {
      id: 7,
      name: 'Kavya Menon',
      role: 'UX Researcher at Paytm',
      location: 'Noida, Uttar Pradesh',
      image: 'KM',
      course: 'UX Research Fundamentals',
      rating: 4.9,
      text: 'Fantastic learning experience! The UX Research course taught me how to conduct user interviews, analyze data, and create actionable insights. The mentors were always available to help. Landed a job at Paytm right after completion. LearnHub truly delivers on its promise!'
    },
    {
      id: 8,
      name: 'Rahul Joshi',
      role: 'DevOps Engineer at HCL',
      location: 'Kolkata, West Bengal',
      image: 'RJ',
      course: 'DevOps Masterclass',
      rating: 4.8,
      text: 'Best DevOps course available in India! Covers everything from Docker to Kubernetes with hands-on labs. The instructors have real industry experience and share valuable insights. Transitioned my career from support to DevOps engineering at HCL. Highly recommended!'
    },
    {
      id: 9,
      name: 'Divya Krishnan',
      role: 'AI Engineer at Tech Mahindra',
      location: 'Kochi, Kerala',
      image: 'DK',
      course: 'Machine Learning A-Z',
      rating: 4.7,
      text: 'This ML course is comprehensive and beginner-friendly! The projects helped me build a strong portfolio. The community is very supportive and the doubt-clearing sessions are incredibly helpful. Now working on exciting AI projects at Tech Mahindra. Thank you LearnHub!'
    },
    {
      id: 10,
      name: 'Aditya Verma',
      role: 'Cloud Architect at IBM',
      location: 'Gurugram, Haryana',
      image: 'AV',
      course: 'AWS Solutions Architect',
      rating: 5.0,
      text: 'Excellent course for cloud computing! The hands-on labs and real-world scenarios made learning AWS easy. Cleared my AWS certification on the first attempt. Got promoted to Cloud Architect at IBM within 6 months. LearnHub courses are industry-relevant and practical!'
    }
  ];

  const platformStats = [
    { value: '10K+', label: 'Students in India' },
    { value: '800+', label: 'Expert Instructors' },
    { value: '500+', label: 'Online Courses' },
    { value: '15+', label: 'Categories' }
  ];

  // Removed auto-scroll effect that was causing re-renders

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setEnrolledCourses([]);
    setCurrentPage('home');
    setViewingStudentCourse(null);
    setViewingCourse(null);
    setEditingCourse(null);
    setSelectedCourse(null);
    localStorage.removeItem('learnhub_user');
    localStorage.removeItem('learnhub_token');
    localStorage.removeItem('learnhub_page_state');
    // Keep lecture progress even after logout so students don't lose their progress
    // localStorage.removeItem('learnhub_lecture_progress');
    showNotification('Logged out successfully!');
  };

  const enrollCourse = async (courseId) => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    setEnrollingCourseId(courseId);
    try {
      // Use _id if available, otherwise use id
      const actualCourseId = courseId._id || courseId;
      
      const response = await fetch(`${API_URL}/api/courses/${actualCourseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Successfully enrolled in the course!');
        fetchEnrolledCourses(); // Refresh enrolled courses
        fetchCourses(); // Refresh courses to update student count
      } else {
        showNotification(data.message || 'Enrollment failed!', 'error');
      }
    } catch (error) {
      showNotification('Error enrolling in course. Please try again.', 'error');
      console.error('Enrollment error:', error);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handlePayment = async () => {
    if (!selectedCourseForPayment || !user || !token) return;
    
    setProcessingPayment(true);
    
    try {
      // Use _id for MongoDB compatibility
      const courseId = selectedCourseForPayment._id || selectedCourseForPayment.id;
      // Send the ORIGINAL price to backend - backend will handle discount calculation
      const originalPrice = selectedCourseForPayment.price;
      const discountAmount = Math.round(originalPrice * 0.3); // 30% discount
      const amount = originalPrice - discountAmount; // Final price after discount
      
      console.log('💳 Creating payment order:', { 
        courseId, 
        originalPrice,
        discountAmount,
        amount,
        courseTitle: selectedCourseForPayment.title 
      });
      
      // Create order on backend
      const orderResponse = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId: courseId,
          amount: amount, // Send final amount after discount
          originalPrice: originalPrice // Send original price for receipt
        })
      });
      
      const orderData = await orderResponse.json();
      
      console.log('📦 Order response:', orderData);
      
      if (!orderResponse.ok) {
        console.error('❌ Order creation failed:', orderData);
        throw new Error(orderData.message || 'Failed to create order');
      }
      
      if (!orderData.success || !orderData.orderId) {
        throw new Error('Invalid order response from server');
      }
      
      console.log('✅ Order created:', orderData);
      
      // Initialize Razorpay
      const options = {
        key: 'rzp_test_RclhbuLUaa6vsq', // Test key
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LearnHub',
        description: selectedCourseForPayment.title,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            console.log('✅ Payment successful, verifying...');
            
            // Verify payment on backend
            const verifyResponse = await fetch(`${API_URL}/api/payment/verify`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId,
                originalPrice: originalPrice // Send original price for receipt generation
              })
            });
            
            const verifyData = await verifyResponse.json();
            
            if (verifyResponse.ok && verifyData.success) {
              showNotification('Payment successful! You are now enrolled in the course.');
              
              // Prepare receipt data with correct calculations
              const originalPrice = selectedCourseForPayment.price;
              const discountAmount = Math.round(originalPrice * 0.3); // 30% discount
              const amountPaid = originalPrice - discountAmount;
              
              setReceiptData({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                date: new Date().toISOString(),
                courseTitle: selectedCourseForPayment.title,
                instructor: selectedCourseForPayment.instructor,
                originalPrice: originalPrice,
                discount: discountAmount,
                amountPaid: amountPaid,
                studentName: user.name,
                studentEmail: user.email
              });
              
              setShowPaymentModal(false);
              setSelectedCourseForPayment(null);
              setPaymentAccepted(false);
              setShowReceiptModal(true);
              
              fetchEnrolledCourses();
              fetchCourses();
            } else {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('❌ Payment verification error:', error);
            showNotification('Payment verification failed: ' + error.message, 'error');
          } finally {
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: '#4f46e5'
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
            showNotification('Payment cancelled', 'warning');
          }
        }
      };
      
      // Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Razorpay SDK not loaded. Please refresh the page.');
      }
      
      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response) {
        console.error('❌ Payment failed:', response.error);
        setProcessingPayment(false);
        showNotification('Payment failed: ' + response.error.description, 'error');
      });
      
      razorpay.open();
      
    } catch (error) {
      console.error('❌ Payment error:', error);
      showNotification('Error processing payment: ' + error.message, 'error');
      setProcessingPayment(false);
    }
  };

  const displayCourses = courses.length > 0 ? courses : fallbackCourses;
  
  const filteredCourses = displayCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openLoginModal = () => {
    setAuthMode('login');
    setUserType('student');
    setShowAuthModal(true);
  };

  const openInstructorModal = () => {
    setAuthMode('signup'); // Default to signup for instructors
    setUserType('instructor');
    setShowAuthModal(true);
  };

  const AuthModal = () => {
    const [showPassword, setShowPassword] = useState(false);
    // Initialize with authFormData to preserve values
    const [localFormData, setLocalFormData] = useState({
      name: authFormData.name || '',
      email: authFormData.email || '',
      password: authFormData.password || '',
      confirmPassword: authFormData.confirmPassword || '',
      otp: authFormData.otp || ''
    });

    if (!showAuthModal) return null;

    const closeModal = () => {
      setShowAuthModal(false);
      setLocalFormData({ name: '', email: '', password: '', confirmPassword: '', otp: '' });
      setAuthFormData({ name: '', email: '', password: '', confirmPassword: '', otp: '' });
      setOtpSent(false);
      setOtpVerified(false);
    };

    const handleSendOtp = async () => {
      if (!localFormData.email) {
        showNotification('Please enter your email first!', 'error');
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(localFormData.email)) {
        showNotification('Please enter a valid email address (e.g., user@example.com)!', 'error');
        return;
      }
      
      setSendingOtp(true);
      
      try {
        const emailToSend = localFormData.email.toLowerCase().trim();
        
        // Save to parent state before sending to preserve data
        setAuthFormData({
          ...localFormData,
          email: emailToSend
        });
        
        const response = await fetch(`${API_URL}/api/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: emailToSend,
            purpose: 'registration'
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setOtpSent(true);
          showNotification('OTP sent successfully! Check your email/console.');
        } else {
          showNotification(data.message || 'Failed to send OTP!', 'error');
        }
      } catch (error) {
        showNotification('Network error. Check if backend is running.', 'error');
      } finally {
        setSendingOtp(false);
      }
    };

    const handleVerifyOtp = async () => {
      if (!localFormData.otp || localFormData.otp.length !== 6) {
        showNotification('Please enter the 6-digit OTP!', 'error');
        return false;
      }

      if (!localFormData.email) {
        showNotification('Email is required!', 'error');
        return false;
      }

      const verifyData = {
        email: localFormData.email.toLowerCase().trim(),
        otp: localFormData.otp.trim(),
        purpose: 'registration'
      };
      
      try {
        const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(verifyData)
        });

        const data = await response.json();

        if (response.ok && data.verified) {
          setOtpVerified(true);
          // Save to parent state to preserve OTP value
          setAuthFormData({
            ...localFormData,
            email: localFormData.email.toLowerCase().trim(),
            otp: localFormData.otp.trim()
          });
          showNotification('Email verified successfully!', 'success');
          return true;
        } else {
          setOtpVerified(false);
          showNotification(data.message || 'Invalid OTP!', 'error');
          return false;
        }
      } catch (error) {
        showNotification('Network error during verification.', 'error');
        return false;
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      setIsLoading(true);
      if (authMode === 'signup') {
        // Validation checks
        if (!localFormData.name?.trim()) {
          showNotification('Please enter your full name!', 'error');
          setIsLoading(false);
          return;
        }
        if (!localFormData.email?.trim()) {
          showNotification('Please enter your email address!', 'error');
          setIsLoading(false);
          return;
        }
        if (!localFormData.password) {
          showNotification('Please enter a password!', 'error');
          setIsLoading(false);
          return;
        }
        
        // Password validation
        const passwordError = validatePassword(localFormData.password);
        if (passwordError) {
          showNotification(passwordError, 'error');
          setIsLoading(false);
          return;
        }
        
        if (!localFormData.confirmPassword) {
          showNotification('Please confirm your password!', 'error');
          setIsLoading(false);
          return;
        }
        if (localFormData.password !== localFormData.confirmPassword) {
          showNotification('Passwords do not match!', 'error');
          setIsLoading(false);
          return;
        }
        if (!localFormData.otp || localFormData.otp.length !== 6) {
          showNotification('Please enter the 6-digit OTP!', 'error');
          setIsLoading(false);
          return;
        }
        if (!otpVerified) {
          showNotification('Please verify your OTP by clicking the Verify button!', 'error');
          setIsLoading(false);
          return;
        }

        // OTP is already verified, proceed with registration

        try {
          const registrationData = {
            name: localFormData.name,
            email: localFormData.email.toLowerCase().trim(),
            password: localFormData.password,
            role: userType,
            otp: localFormData.otp.trim()
          };

          const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationData)
          });

          const data = await response.json();

          if (response.ok) {
            const userWithRole = { ...data.user, role: data.user.role || userType };
            // Generate unique user ID
            const userId = generateUserId(userWithRole.name, userWithRole.role);
            userWithRole.userId = userId;
            
            setUser(userWithRole);
            setToken(data.token);
            localStorage.setItem('learnhub_user', JSON.stringify(userWithRole));
            localStorage.setItem('learnhub_token', data.token);
            setShowAuthModal(false);
            setLocalFormData({ name: '', email: '', password: '', confirmPassword: '', otp: '' });
            setAuthFormData({ name: '', email: '', password: '', confirmPassword: '', otp: '' });
            setOtpSent(false);
            setOtpVerified(false);
            setOtpVerified(false);
            showNotification(`Account created successfully! Welcome to LearnHub${userType === 'instructor' ? ' as an Instructor' : ''}.`);
            if (userType === 'instructor') {
              setCurrentPage('instructor-dashboard');
            } else {
              setCurrentPage('dashboard');
            }
          } else {
            if (data.message && (data.message.includes('already exists') || data.message.includes('already registered'))) {
              showNotification('This email is already registered. Please login or use a different email.', 'error');
              setTimeout(() => {
                const switchToLogin = confirm('This email is already registered. Would you like to switch to login?');
                if (switchToLogin) {
                  setAuthMode('login');
                }
              }, 100);
            } else {
              showNotification(data.message || 'Registration failed! Please try again.', 'error');
            }
          }
        } catch (error) {
          showNotification('Unable to connect to server. Please check if the backend is running on port 5000.', 'error');
          console.error('Registration error:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Login
        if (!localFormData.password || !localFormData.email) {
          showNotification('Please enter your email and password!', 'error');
          setIsLoading(false);
          return;
        }

        const loginData = { 
          email: localFormData.email.toLowerCase().trim(),
          password: localFormData.password,
          role: userType
        };

        try {
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
          });

          const data = await response.json();

          if (response.ok) {
            const userWithRole = { ...data.user, role: data.user.role || userType };
            // Generate unique user ID if not exists
            if (!userWithRole.userId) {
              userWithRole.userId = generateUserId(userWithRole.name, userWithRole.role);
            }
            
            setUser(userWithRole);
            setToken(data.token);
            localStorage.setItem('learnhub_user', JSON.stringify(userWithRole));
            localStorage.setItem('learnhub_token', data.token);
            setShowAuthModal(false);
            setLocalFormData({ name: '', email: '', password: '', confirmPassword: '', otp: '' });
            setAuthFormData({ name: '', email: '', password: '', confirmPassword: '', otp: '' });
            setOtpSent(false);
            showNotification(`Welcome back, ${data.user.name}!`);
            if (userWithRole.role === 'instructor') {
              setCurrentPage('instructor-dashboard');
            } else {
              setCurrentPage('dashboard');
            }
          } else {
            if (data.message && data.message.includes('not found')) {
              showNotification('No account found with this email. Please sign up first.', 'error');
            } else if (data.message && data.message.includes('password')) {
              showNotification('Incorrect password. Please try again.', 'error');
            } else {
              showNotification(data.message || 'Login failed! Please check your credentials.', 'error');
            }
          }
        } catch (error) {
          showNotification('Unable to connect to server. Please check if the backend is running on port 5000.', 'error');
          console.error('Login error:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    return (
      <div 
        style={{ position: 'fixed', inset: '0', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            closeModal();
          }
        }}
      >
        <div 
          style={{ backgroundColor: 'white', borderRadius: '1rem', maxWidth: '28rem', width: '100%', margin: 'auto' }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <BookOpen style={{ width: 32, height: 32, color: '#4f46e5', marginRight: '0.5rem' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {authMode === 'login' ? 'Welcome Back!' : 'Join LearnHub'}
                </h2>
              </div>
              <button 
                onClick={closeModal}
                type="button"
                style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X style={{ width: 24, height: 24 }} />
              </button>
            </div>

            <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
              {authMode === 'login' 
                ? (userType === 'instructor' ? 'Instructor Login - Manage your courses' : 'Login to continue your learning journey')
                : (userType === 'instructor' ? 'Become an Instructor - Share your knowledge' : 'Create an account to start learning today')
              }
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {authMode === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={localFormData.name}
                    onChange={(e) => setLocalFormData({...localFormData, name: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                  Email Address
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="email"
                    value={localFormData.email}
                    onChange={(e) => setLocalFormData({...localFormData, email: e.target.value})}
                    disabled={otpVerified}
                    style={{ 
                      flex: 1, 
                      padding: '0.5rem', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '0.5rem', 
                      outline: 'none', 
                      boxSizing: 'border-box', 
                      fontSize: '0.875rem',
                      backgroundColor: otpVerified ? '#f3f4f6' : 'white',
                      cursor: otpVerified ? 'not-allowed' : 'text',
                      userSelect: otpVerified ? 'none' : 'auto'
                    }}
                    placeholder="Enter your email"
                  />
                  {authMode === 'signup' && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendingOtp || !localFormData.email || otpVerified}
                      style={{
                        padding: '0.75rem 1.25rem',
                        backgroundColor: otpVerified ? '#10b981' : (otpSent ? '#10b981' : (sendingOtp || !localFormData.email ? '#d1d5db' : '#4f46e5')),
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        cursor: (sendingOtp || !localFormData.email || otpVerified) ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {sendingOtp && (
                        <div style={{
                          width: '14px',
                          height: '14px',
                          border: '2px solid white',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.6s linear infinite'
                        }} />
                      )}
                      {otpVerified ? '✓ Verified' : (otpSent ? '✓ Sent' : (sendingOtp ? 'Sending...' : 'Send OTP'))}
                    </button>
                  )}
                </div>
                {authMode === 'signup' && otpSent && (
                  <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.5rem', fontWeight: 500 }}>
                    ✓ OTP sent! Enter the code and click Verify button
                  </p>
                )}
              </div>

              {authMode === 'signup' && otpSent && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                    Enter OTP
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={localFormData.otp}
                      onChange={(e) => {
                        const newValue = e.target.value.replace(/\D/g, ''); // Only digits
                        if (newValue.length <= 6) {
                          setLocalFormData({...localFormData, otp: newValue});
                        }
                      }}
                      maxLength="6"
                      disabled={otpVerified}
                      placeholder="Enter 6-digit OTP"
                      style={{ 
                        flex: 1,
                        padding: '0.5rem', 
                        border: `2px solid ${otpVerified ? '#10b981' : '#4f46e5'}`,
                        borderRadius: '0.375rem',
                        boxSizing: 'border-box',
                        backgroundColor: otpVerified ? '#f0fdf4' : 'white',
                        cursor: otpVerified ? 'not-allowed' : 'text',
                        fontSize: '0.875rem',
                        fontWeight: 'normal',
                        textAlign: 'center',
                        letterSpacing: '1px',
                        outline: 'none',
                        userSelect: otpVerified ? 'none' : 'auto'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={!localFormData.otp || localFormData.otp.length !== 6 || otpVerified}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: otpVerified ? '#10b981' : (!localFormData.otp || localFormData.otp.length !== 6 ? '#d1d5db' : '#4f46e5'),
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontWeight: 600,
                        cursor: (!localFormData.otp || localFormData.otp.length !== 6 || otpVerified) ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                        fontSize: '0.875rem'
                      }}
                    >
                      {otpVerified ? '✓ Verified' : 'Verify'}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                    Password
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAuthModal(false);
                        setShowForgotPassword(true);
                        setForgotPasswordStep(1);
                        setForgotPasswordData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
                        setForgotPasswordOtpSent(false);
                        setForgotPasswordOtpVerified(false);
                      }}
                      style={{ 
                        color: '#4f46e5', 
                        fontSize: '0.875rem', 
                        fontWeight: 500,
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        textDecoration: 'underline',
                        padding: 0
                      }}
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={localFormData.password}
                    onChange={(e) => setLocalFormData({...localFormData, password: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', paddingRight: '2.5rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', boxSizing: 'border-box', fontSize: '0.875rem' }}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {showPassword ? <EyeOff style={{ width: 20, height: 20, color: '#9ca3af' }} /> : <Eye style={{ width: 20, height: 20, color: '#9ca3af' }} />}
                  </button>
                </div>
                {authMode === 'signup' && (
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', lineHeight: 1.4 }}>
                    Must be 6+ characters with letters, numbers & special character
                  </p>
                )}
              </div>

              {authMode === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={localFormData.confirmPassword}
                    onChange={(e) => setLocalFormData({...localFormData, confirmPassword: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', boxSizing: 'border-box', fontSize: '0.875rem' }}
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  backgroundColor: isLoading ? '#9ca3af' : '#4f46e5',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isLoading && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite'
                  }} />
                )}
                {isLoading ? 'Please wait...' : (authMode === 'login' ? 'Login' : 'Create Account')}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p style={{ color: '#4b5563', margin: 0 }}>
                {authMode === 'login' ? (
                  <>
                    New user?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      style={{ color: '#4f46e5', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Sign up now
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      style={{ color: '#4f46e5', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Login here
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CourseCard = ({ course }) => {
    const isEnrolled = enrolledCourses.some(ec => ec.id === course.id || ec.courseId === course.id);
    
    return (
      <div 
        style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
          overflow: 'hidden', 
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: 'translateY(0)',
          position: 'relative'
        }}
        onClick={() => {
          setViewingStudentCourse(course);
          setViewFromMyCourses(false); // Coming from All Courses section
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}
      >
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img 
            src={course.image} 
            alt={course.title} 
            style={{ 
              width: '100%', 
              height: '12rem', 
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }} 
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          />
          {course.bestseller && (
            <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', backgroundColor: '#fbbf24', color: '#78350f', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
              BESTSELLER
            </div>
          )}
          {isEnrolled && (
            <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', backgroundColor: '#10b981', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
              ✓ ENROLLED
            </div>
          )}
          <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem', fontWeight: 600, color: '#4f46e5' }}>
            ₹{course.price}
          </div>
        </div>
        <div style={{ padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4f46e5', textTransform: 'uppercase' }}>{course.level}</span>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', margin: '0.25rem 0 0.5rem 0' }}>{course.title}</h3>
          <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: '0 0 0.75rem 0' }}>by {course.instructor}</p>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#111827', marginRight: '0.25rem' }}>{course.rating}</span>
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} style={{ width: 16, height: 16, color: i <= Math.floor(course.rating) ? '#fbbf24' : '#d1d5db', fill: i <= Math.floor(course.rating) ? '#fbbf24' : 'none' }} />
              ))}
            </div>
            <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>({course.reviews.toLocaleString()})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', color: '#4b5563' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Users style={{ width: 16, height: 16, marginRight: '0.25rem' }} />
              <span>{(course.students / 1000).toFixed(1)}k students</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Clock style={{ width: 16, height: 16, marginRight: '0.25rem' }} />
              <span>{course.duration}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

 // SHOW ADMIN DASHBOARD
  if (currentPage === 'admin-dashboard') {
    return <AdminDashboard onLogout={() => setCurrentPage('home')} />;
  }

  // SHOW INSTRUCTOR DASHBOARD
  if (currentPage === 'instructor-dashboard') {
    return <InstructorDashboard onLogout={() => setCurrentPage('home')} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '5rem',
          right: '1.5rem',
          backgroundColor: notification.type === 'success' ? '#10b981' : notification.type === 'error' ? '#ef4444' : '#f59e0b',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 99999,
          minWidth: '300px',
          animation: 'slideIn 0.3s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 500
        }}>
          {notification.type === 'success' && <span style={{ fontSize: '1.25rem' }}>✓</span>}
          {notification.type === 'error' && <span style={{ fontSize: '1.25rem' }}>✕</span>}
          {notification.type === 'warning' && <span style={{ fontSize: '1.25rem' }}>⚠</span>}
          <span>{notification.message}</span>
        </div>
      )}
      
      {/* Global Video Player Modal - Highest Z-Index */}
      {playingVideo && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: '0', 
            backgroundColor: 'rgba(0, 0, 0, 0.95)', 
            zIndex: 100000,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '2rem',
            backdropFilter: 'blur(8px)'
          }}
          onClick={() => setPlayingVideo(null)}
        >
          <div 
            style={{ 
              backgroundColor: 'white', 
              borderRadius: '1rem', 
              maxWidth: '1000px', 
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {playingVideo.title}
              </h3>
              <button 
                onClick={() => setPlayingVideo(null)}
                style={{ 
                  color: '#9ca3af', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                <X style={{ width: 24, height: 24 }} />
              </button>
            </div>
            <div style={{ aspectRatio: '16/9', backgroundColor: '#000', position: 'relative' }}>
              <video
                key={playingVideo._id || playingVideo.id}
                controls
                autoPlay
                controlsList="nodownload"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  console.error('Video load error:', e);
                  e.target.style.display = 'none';
                  const errorDiv = e.target.parentElement.querySelector('.video-error');
                  if (errorDiv) errorDiv.style.display = 'flex';
                }}
                onLoadStart={() => console.log('🎬 Video loading:', playingVideo.videoUrl)}
                onCanPlay={() => console.log('✅ Video ready to play')}
              >
                <source src={playingVideo.videoUrl} type="video/mp4" />
                <source src={playingVideo.videoUrl} type="video/webm" />
                <source src={playingVideo.videoUrl} type="video/ogg" />
                <source src={playingVideo.videoUrl} />
                Your browser does not support the video tag.
              </video>
              <div 
                className="video-error"
                style={{ 
                  display: 'none',
                  position: 'absolute',
                  inset: 0,
                  width: '100%', 
                  height: '100%', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  padding: '2rem',
                  textAlign: 'center',
                  backgroundColor: '#1f2937'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
                  Video Not Available
                </h3>
                <p style={{ fontSize: '1rem', color: '#d1d5db', marginBottom: '1rem' }}>
                  Unable to load this video. Please check your internet connection.
                </p>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  If the problem persists, contact your instructor.
                </p>
              </div>
            </div>
            {playingVideo.description && (
              <div style={{ padding: '1.5rem', color: '#6b7280', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                <p style={{ margin: 0, lineHeight: 1.6 }}>{playingVideo.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Receipt Modal */}
      {showReceiptModal && receiptData && (
        <div 
          style={{ 
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            zIndex: 10004,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => {
            setShowReceiptModal(false);
            setReceiptData(null);
          }}
        >
          <div 
            style={{ 
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'white',
              borderRadius: '1rem',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
              animation: 'scaleIn 0.3s ease-out',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              padding: '1.25rem 1.5rem',
              textAlign: 'center',
              position: 'relative'
            }}>
              <button 
                onClick={() => {
                  setShowReceiptModal(false);
                  setReceiptData(null);
                }}
                style={{ 
                  position: 'absolute',
                  top: '0.75rem',
                  right: '0.75rem',
                  color: 'white', 
                  background: 'rgba(255,255,255,0.2)', 
                  border: 'none', 
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
              
              {/* Animated Checkmark */}
              <div style={{ 
                width: '56px', 
                height: '56px', 
                margin: '0 auto 0.75rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <svg width="32" height="32" viewBox="0 0 40 40" style={{ 
                  animation: 'checkmarkDraw 0.6s ease-out forwards',
                  animationIterationCount: 'infinite',
                  animationDelay: '1s'
                }}>
                  <path
                    d="M 8 20 L 16 28 L 32 12"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: 50,
                      strokeDashoffset: 50,
                      animation: 'checkmarkStroke 0.6s ease-out forwards, checkmarkRepeat 0.6s ease-out 1s infinite'
                    }}
                  />
                </svg>
              </div>
              
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: '0 0 0.375rem 0' }}>
                Payment Successful!
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.95)', margin: 0 }}>
                Your enrollment is confirmed
              </p>
            </div>

            {/* Content */}
            <div style={{ padding: '1.25rem' }}>
              {/* Transaction Details */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                  <span style={{ color: '#6b7280', fontWeight: 500 }}>Transaction ID</span>
                  <span style={{ color: '#111827', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.6875rem' }}>{receiptData.paymentId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                  <span style={{ color: '#6b7280', fontWeight: 500 }}>Order ID</span>
                  <span style={{ color: '#111827', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.6875rem' }}>{receiptData.orderId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: '#6b7280', fontWeight: 500 }}>Date & Time</span>
                  <span style={{ color: '#111827', fontWeight: 600, fontSize: '0.75rem' }}>
                    {new Date(receiptData.date).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>
              </div>

              {/* Course Details */}
              <div style={{ 
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '0.625rem',
                padding: '0.875rem',
                marginBottom: '1rem'
              }}>
                <h3 style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#065f46', margin: '0 0 0.625rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Course Details
                </h3>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827', margin: '0 0 0.25rem 0', lineHeight: 1.3 }}>
                  {receiptData.courseTitle}
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#059669', margin: '0 0 0.75rem 0' }}>
                  by {receiptData.instructor}
                </p>
                
                <div style={{ borderTop: '1px solid #86efac', paddingTop: '0.625rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.75rem' }}>
                    <span style={{ color: '#065f46' }}>Original Price</span>
                    <span style={{ color: '#6b7280', textDecoration: 'line-through' }}>₹{receiptData.originalPrice}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                    <span style={{ color: '#065f46' }}>Discount (30%)</span>
                    <span style={{ color: '#059669', fontWeight: 600 }}>-₹{receiptData.discount}</span>
                  </div>
                  <div style={{ borderTop: '2px solid #86efac', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#065f46' }}>Amount Paid</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669' }}>₹{receiptData.amountPaid}</span>
                  </div>
                </div>
              </div>

              {/* Student Details */}
              <div style={{ marginBottom: '1rem', fontSize: '0.75rem' }}>
                <h3 style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#374151', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Student Details
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#6b7280' }}>Name</span>
                  <span style={{ color: '#111827', fontWeight: 600 }}>{receiptData.studentName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Email</span>
                  <span style={{ color: '#111827', fontWeight: 600, fontSize: '0.6875rem' }}>{receiptData.studentEmail}</span>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`${API_URL}/api/payment/receipt/${receiptData.orderId}`, {
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    });
                    
                    if (response.ok) {
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `LearnHub-Receipt-${receiptData.orderId}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                      showNotification('Receipt downloaded successfully!');
                    } else {
                      showNotification('Failed to download receipt', 'error');
                    }
                  } catch (error) {
                    showNotification('Error downloading receipt', 'error');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981';
                }}
              >
                <span>📄</span>
                Download Receipt
              </button>

              {/* Footer Note */}
              <p style={{ 
                marginTop: '1rem', 
                fontSize: '0.6875rem', 
                color: '#9ca3af', 
                textAlign: 'center',
                lineHeight: 1.3
              }}>
                You can access this course anytime from your dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedCourseForPayment && (
        <div 
          style={{ 
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            zIndex: 10003,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.3s ease-out',
            overflowY: 'auto'
          }}
          onClick={() => {
            if (!processingPayment) {
              setShowPaymentModal(false);
              setSelectedCourseForPayment(null);
              setPaymentAccepted(false);
            }
          }}
        >
          <div 
            style={{ 
              width: '100%',
              maxWidth: '580px',
              backgroundColor: 'white',
              borderRadius: '1.5rem',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
              animation: 'scaleIn 0.3s ease-out',
              overflow: 'hidden',
              maxHeight: '90vh',
              overflowY: 'auto',
              margin: '2rem auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', 
              padding: '2rem',
              color: 'white',
              position: 'relative'
            }}>
              <button 
                onClick={() => {
                  if (!processingPayment) {
                    setShowPaymentModal(false);
                    setSelectedCourseForPayment(null);
                    setPaymentAccepted(false);
                  }
                }}
                disabled={processingPayment}
                style={{ 
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  color: 'white', 
                  background: 'rgba(255,255,255,0.2)', 
                  border: 'none', 
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: processingPayment ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!processingPayment) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Shield style={{ width: 32, height: 32 }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>
                    Secure Checkout
                  </h2>
                  <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.9)', margin: '0.25rem 0 0 0' }}>
                    Complete your enrollment
                  </p>
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div style={{ padding: '2rem', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <img 
                  src={selectedCourseForPayment.image} 
                  alt={selectedCourseForPayment.title}
                  style={{ 
                    width: '120px', 
                    height: '80px', 
                    objectFit: 'cover', 
                    borderRadius: '0.75rem',
                    border: '2px solid #e5e7eb'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
                    {selectedCourseForPayment.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                    by {selectedCourseForPayment.instructor}
                  </p>
                </div>
              </div>

              {/* Pricing */}
              <div style={{ 
                backgroundColor: '#f0fdf4',
                border: '2px solid #86efac',
                borderRadius: '1rem',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.9375rem', color: '#166534', fontWeight: 500 }}>Original Price</span>
                  <span style={{ fontSize: '1rem', color: '#6b7280', textDecoration: 'line-through' }}>₹{selectedCourseForPayment.price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.9375rem', color: '#166534', fontWeight: 500 }}>Discount (30% OFF)</span>
                  <span style={{ fontSize: '1rem', color: '#059669', fontWeight: 600 }}>-₹{Math.round(selectedCourseForPayment.price * 0.3)}</span>
                </div>
                <div style={{ 
                  borderTop: '2px solid #86efac',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '1.125rem', color: '#166534', fontWeight: 700 }}>Total Amount</span>
                  <span style={{ fontSize: '1.75rem', color: '#059669', fontWeight: 700 }}>₹{selectedCourseForPayment.price - Math.round(selectedCourseForPayment.price * 0.3)}</span>
                </div>
              </div>

              {/* Payment Policy */}
              <div style={{ 
                backgroundColor: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ 
                  fontSize: '1rem', 
                  fontWeight: 700, 
                  color: '#92400e', 
                  margin: '0 0 1rem 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Shield style={{ width: 18, height: 18 }} />
                  Payment Policy
                </h4>
                <ul style={{ 
                  margin: 0, 
                  padding: '0 0 0 1.25rem', 
                  color: '#78350f',
                  fontSize: '0.875rem',
                  lineHeight: 1.8
                }}>
                  <li style={{ marginBottom: '0.5rem' }}>✓ Secure payment via Razorpay gateway</li>
                  <li style={{ marginBottom: '0.5rem' }}>✓ Your payment information is encrypted and secure</li>
                  <li style={{ marginBottom: '0.5rem' }}>✓ Lifetime access to course content after enrollment</li>
                  <li style={{ marginBottom: '0.5rem' }}>✓ 30-day money-back guarantee if not satisfied</li>
                  <li style={{ marginBottom: '0.5rem' }}>✓ No hidden charges or subscription fees</li>
                  <li>✓ Instant access upon successful payment</li>
                </ul>
              </div>

              {/* Terms Acceptance */}
              <div style={{ 
                backgroundColor: '#f9fafb',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                transition: 'all 0.3s ease'
              }}>
                <label 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'start', 
                    gap: '1rem',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  htmlFor="payment-terms"
                >
                  <div style={{ 
                    position: 'relative',
                    marginTop: '0.125rem',
                    flexShrink: 0
                  }}>
                    <input
                      type="checkbox"
                      id="payment-terms"
                      checked={paymentAccepted}
                      onChange={(e) => setPaymentAccepted(e.target.checked)}
                      style={{
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        accentColor: '#4f46e5'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      fontSize: '0.9375rem', 
                      color: '#374151',
                      margin: 0,
                      lineHeight: 1.6,
                      fontWeight: 500
                    }}>
                      I agree to the <button type="button" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Terms & Conditions</button>, <button type="button" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Refund Policy</button>, and confirm that all payment details are accurate.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{ padding: '2rem', backgroundColor: '#fafbfc' }}>
              <button
                onClick={handlePayment}
                disabled={!paymentAccepted || processingPayment}
                style={{
                  width: '100%',
                  padding: '1rem 2rem',
                  backgroundColor: (!paymentAccepted || processingPayment) ? '#d1d5db' : '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: 700,
                  fontSize: '1.0625rem',
                  cursor: (!paymentAccepted || processingPayment) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  boxShadow: (!paymentAccepted || processingPayment) ? 'none' : '0 4px 12px rgba(79, 70, 229, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (paymentAccepted && !processingPayment) {
                    e.currentTarget.style.backgroundColor = '#4338ca';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (paymentAccepted && !processingPayment) {
                    e.currentTarget.style.backgroundColor = '#4f46e5';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)';
                  }
                }}
              >
                {processingPayment ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield style={{ width: 20, height: 20 }} />
                    Continue to Payment
                  </>
                )}
              </button>
              
              <div style={{ 
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                color: '#6b7280'
              }}>
                <Shield style={{ width: 14, height: 14 }} />
                <span>Secured by Razorpay • 256-bit SSL Encryption</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* API Error Banner */}
      {apiError && (
        <div style={{
          position: 'fixed',
          top: '4.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#fef3c7',
          color: '#92400e',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.875rem',
          border: '1px solid #fbbf24'
        }}>
          <span>⚠️</span>
          <span>{apiError}</span>
          <button 
            onClick={() => setApiError(null)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#92400e', 
              cursor: 'pointer',
              padding: '0 0.5rem',
              fontSize: '1.25rem'
            }}
          >
            ×
          </button>
        </div>
      )}
      
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          
          @keyframes checkmarkStroke {
            from {
              stroke-dashoffset: 50;
            }
            to {
              stroke-dashoffset: 0;
            }
          }
          
          @keyframes checkmarkRepeat {
            0% {
              stroke-dashoffset: 50;
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              stroke-dashoffset: 0;
              opacity: 1;
            }
          }
        `}
      </style>

      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 1000, marginBottom: 0 }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }} onClick={() => {
              setCurrentPage('home');
              setViewingStudentCourse(null);
              setViewingCourse(null);
              setEditingCourse(null);
              setViewingEnrolledCourseLectures(null);
              setSelectedCourse(null);
              setViewFromMyCourses(false);
            }}>
              <BookOpen style={{ color: '#4f46e5', width: 32, height: 32 }} />
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>LearnHub</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {!user ? (
                <>
                  <button onClick={openInstructorModal} style={{ padding: '0.5rem 1rem', color: '#111827', fontWeight: 600, background: 'white', border: '1px solid #d1d5db', cursor: 'pointer', borderRadius: '0.5rem' }}>
                    Teach on LearnHub
                  </button>
                  <button onClick={openLoginModal} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#4f46e5', color: 'white', borderRadius: '0.5rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                    Login
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => {
                    const targetPage = user.role === 'instructor' ? 'instructor-dashboard' : 'dashboard';
                    setCurrentPage(targetPage);
                    setViewingStudentCourse(null);
                    setViewingCourse(null);
                    setEditingCourse(null);
                    setViewingEnrolledCourseLectures(null);
                    setSelectedCourse(null);
                    setViewFromMyCourses(false);
                  }} style={{ padding: '0.5rem 1rem', color: '#374151', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', textDecoration: (currentPage === 'dashboard' || currentPage === 'instructor-dashboard') ? 'underline' : 'none' }}>
                    Dashboard
                  </button>
                  
                  {/* User Profile Circle */}
                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        backgroundColor: '#4f46e5', 
                        color: 'white', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontWeight: 'bold', 
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4338ca';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#4f46e5';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </button>
                    
                    {/* Dropdown Menu */}
                    {showProfileMenu && (
                      <div style={{
                        position: 'absolute',
                        top: '50px',
                        right: '0',
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        minWidth: '180px',
                        zIndex: 1000,
                        overflow: 'hidden',
                        border: '1px solid #e5e7eb'
                      }}>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            setCurrentPage('profile');
                            setViewingStudentCourse(null);
                            setViewingCourse(null);
                            setEditingCourse(null);
                            setViewingEnrolledCourseLectures(null);
                            setSelectedCourse(null);
                            setViewFromMyCourses(false);
                          }}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            color: '#374151',
                            fontWeight: 500,
                            transition: 'background-color 0.2s',
                            borderBottom: '1px solid #e5e7eb'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Users style={{ width: 18, height: 18 }} />
                          Profile
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            setShowLogoutConfirm(true);
                          }}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            color: '#dc2626',
                            fontWeight: 500,
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fef2f2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <LogOut style={{ width: 18, height: 18 }} />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

                  {showAuthModal && <AuthModal />}



      {/* Quit Quiz Confirmation Modal */}
      {showQuitQuizConfirm && (
        <div 
          style={{ 
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            zIndex: 10002,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setShowQuitQuizConfirm(false)}
        >
          <div 
            style={{ 
              width: '100%',
              maxWidth: '480px',
              padding: '2rem',
              backgroundColor: 'white',
              border: '2px solid #f59e0b',
              borderRadius: '1.25rem',
              boxShadow: '0 20px 50px rgba(245, 158, 11, 0.3)',
              animation: 'scaleIn 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#fef3c7', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <span style={{ fontSize: '3rem' }}>⚠️</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e', margin: '0 0 0.75rem 0' }}>
                Quit Quiz?
              </h3>
              <p style={{ fontSize: '1rem', color: '#78350f', margin: 0, lineHeight: 1.6 }}>
                Are you sure you want to quit the quiz and go back? Your progress will not be saved.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowQuitQuizConfirm(false)}
                style={{
                  flex: 1,
                  padding: '0.875rem 1.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                  e.currentTarget.style.borderColor = '#9ca3af';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowQuitQuizConfirm(false);
                  setTakingQuiz(null);
                  setStudentAnswers({});
                  setCurrentQuestionIndex(0);
                  setQuizTimeRemaining(0);
                  showNotification('Quiz cancelled', 'warning');
                }}
                style={{
                  flex: 1,
                  padding: '0.875rem 1.5rem',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: '2px solid #f59e0b',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#d97706';
                  e.currentTarget.style.borderColor = '#d97706';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f59e0b';
                  e.currentTarget.style.borderColor = '#f59e0b';
                }}
              >
                Yes, Quit Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div 
          style={{ 
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div 
            style={{ 
              width: '100%',
              maxWidth: '400px',
              padding: '2rem',
              backgroundColor: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '1rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
              animation: 'scaleIn 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: '#fef2f2', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <LogOut style={{ width: 32, height: 32, color: '#dc2626' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>
                Confirm Logout
              </h3>
              <p style={{ fontSize: '1rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to logout? You'll need to login again to access your courses.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: '2px solid #dc2626',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                  e.currentTarget.style.borderColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.borderColor = '#dc2626';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div 
          style={{ 
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowForgotPassword(false);
              setForgotPasswordStep(1);
              setForgotPasswordData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
              setForgotPasswordOtpSent(false);
              setForgotPasswordOtpVerified(false);
            }
          }}
        >
          <div 
            style={{ 
              width: '100%',
              maxWidth: '480px',
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '1rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
              animation: 'scaleIn 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Lock style={{ width: 28, height: 28, color: '#4f46e5' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  Reset Password
                </h2>
              </div>
              <button 
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordStep(1);
                  setForgotPasswordData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
                  setForgotPasswordOtpSent(false);
                  setForgotPasswordOtpVerified(false);
                }}
                style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X style={{ width: 24, height: 24 }} />
              </button>
            </div>

            {/* Step Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              {[1, 2, 3].map((step) => (
                <div key={step} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    backgroundColor: forgotPasswordStep >= step ? '#4f46e5' : '#e5e7eb',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    transition: 'all 0.3s'
                  }}>
                    {forgotPasswordStep > step ? '✓' : step}
                  </div>
                  {step < 3 && (
                    <div style={{ 
                      flex: 1, 
                      height: '2px', 
                      backgroundColor: forgotPasswordStep > step ? '#4f46e5' : '#e5e7eb',
                      marginLeft: '0.5rem',
                      transition: 'all 0.3s'
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Email */}
            {forgotPasswordStep === 1 && (
              <div>
                <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                  Enter your email address to receive a verification code.
                </p>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotPasswordData.email}
                    onChange={(e) => setForgotPasswordData({...forgotPasswordData, email: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="Enter your email"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!forgotPasswordData.email) {
                      showNotification('Please enter your email address!', 'error');
                      return;
                    }

                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(forgotPasswordData.email)) {
                      showNotification('Please enter a valid email address!', 'error');
                      return;
                    }

                    setSendingForgotPasswordOtp(true);
                    try {
                      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          email: forgotPasswordData.email.toLowerCase().trim(),
                          purpose: 'password-reset'
                        })
                      });

                      const data = await response.json();

                      if (response.ok) {
                        setForgotPasswordOtpSent(true);
                        setForgotPasswordStep(2);
                        showNotification('Verification code sent to your email!');
                      } else {
                        showNotification(data.message || 'Failed to send verification code!', 'error');
                      }
                    } catch (error) {
                      showNotification('Network error. Please check if backend is running.', 'error');
                    } finally {
                      setSendingForgotPasswordOtp(false);
                    }
                  }}
                  disabled={sendingForgotPasswordOtp}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    backgroundColor: sendingForgotPasswordOtp ? '#9ca3af' : '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: sendingForgotPasswordOtp ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {sendingForgotPasswordOtp && (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                  )}
                  {sendingForgotPasswordOtp ? 'Sending...' : 'Send Verification Code'}
                </button>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {forgotPasswordStep === 2 && (
              <div>
                <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                  Enter the 6-digit code sent to <strong>{forgotPasswordData.email}</strong>
                </p>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={forgotPasswordData.otp}
                    onChange={(e) => {
                      const newValue = e.target.value.replace(/\D/g, '');
                      if (newValue.length <= 6) {
                        setForgotPasswordData({...forgotPasswordData, otp: newValue});
                      }
                    }}
                    maxLength="6"
                    style={{ 
                      width: '100%',
                      padding: '0.75rem', 
                      border: '2px solid #4f46e5',
                      borderRadius: '0.5rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      letterSpacing: '0.5rem'
                    }}
                    placeholder="000000"
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => {
                      setForgotPasswordStep(1);
                      setForgotPasswordData({...forgotPasswordData, otp: ''});
                      setForgotPasswordOtpSent(false);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.875rem',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={async () => {
                      if (!forgotPasswordData.otp || forgotPasswordData.otp.length !== 6) {
                        showNotification('Please enter the 6-digit code!', 'error');
                        return;
                      }

                      setIsLoading(true);
                      try {
                        const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            email: forgotPasswordData.email.toLowerCase().trim(),
                            otp: forgotPasswordData.otp.trim(),
                            purpose: 'password-reset'
                          })
                        });

                        const data = await response.json();

                        if (response.ok && data.verified) {
                          setForgotPasswordOtpVerified(true);
                          setForgotPasswordStep(3);
                          showNotification('Code verified! Now set your new password.');
                        } else {
                          showNotification(data.message || 'Invalid verification code!', 'error');
                        }
                      } catch (error) {
                        showNotification('Network error during verification.', 'error');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: '0.875rem',
                      backgroundColor: isLoading ? '#9ca3af' : '#4f46e5',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: 600,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {isLoading && (
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid white',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite'
                      }} />
                    )}
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: New Password */}
            {forgotPasswordStep === 3 && (
              <div>
                <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                  Create a strong password for your account.
                </p>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={forgotPasswordData.newPassword}
                    onChange={(e) => setForgotPasswordData({...forgotPasswordData, newPassword: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="Enter new password"
                  />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', lineHeight: 1.4 }}>
                    Must be 6+ characters with letters, numbers & special character
                  </p>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={forgotPasswordData.confirmPassword}
                    onChange={(e) => setForgotPasswordData({...forgotPasswordData, confirmPassword: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="Confirm new password"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!forgotPasswordData.newPassword || !forgotPasswordData.confirmPassword) {
                      showNotification('Please fill in both password fields!', 'error');
                      return;
                    }

                    if (forgotPasswordData.newPassword.length < 6) {
                      showNotification('Password must be at least 6 characters long!', 'error');
                      return;
                    }

                    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
                      showNotification('Passwords do not match!', 'error');
                      return;
                    }

                    setIsLoading(true);
                    try {
                      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          email: forgotPasswordData.email.toLowerCase().trim(),
                          otp: forgotPasswordData.otp.trim(),
                          newPassword: forgotPasswordData.newPassword
                        })
                      });

                      const data = await response.json();

                      if (response.ok) {
                        showNotification('Password reset successful! You are now logged in.');
                        
                        // Auto-login the user
                        try {
                          const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              email: forgotPasswordData.email.toLowerCase().trim(),
                              password: forgotPasswordData.newPassword
                            })
                          });

                          const loginData = await loginResponse.json();

                          if (loginResponse.ok) {
                            const userWithRole = { ...loginData.user, role: loginData.user.role || 'student' };
                            setUser(userWithRole);
                            setToken(loginData.token);
                            localStorage.setItem('learnhub_user', JSON.stringify(userWithRole));
                            localStorage.setItem('learnhub_token', loginData.token);
                            
                            // Close modal and redirect
                            setShowForgotPassword(false);
                            setForgotPasswordStep(1);
                            setForgotPasswordData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
                            setForgotPasswordOtpSent(false);
                            setForgotPasswordOtpVerified(false);
                            
                            // Redirect to appropriate dashboard
                            if (userWithRole.role === 'instructor') {
                              setCurrentPage('instructor-dashboard');
                            } else {
                              setCurrentPage('dashboard');
                            }
                          } else {
                            showNotification('Password reset successful! Please login.', 'warning');
                            setShowForgotPassword(false);
                            setForgotPasswordStep(1);
                            setForgotPasswordData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
                            setForgotPasswordOtpSent(false);
                            setForgotPasswordOtpVerified(false);
                            setTimeout(() => {
                              setAuthMode('login');
                              setShowAuthModal(true);
                            }, 500);
                          }
                        } catch (loginError) {
                          console.error('Auto-login error:', loginError);
                          showNotification('Password reset successful! Please login.', 'warning');
                          setShowForgotPassword(false);
                          setForgotPasswordStep(1);
                          setForgotPasswordData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
                          setForgotPasswordOtpSent(false);
                          setForgotPasswordOtpVerified(false);
                          setTimeout(() => {
                            setAuthMode('login');
                            setShowAuthModal(true);
                          }, 500);
                        }
                      } else {
                        showNotification(data.message || 'Failed to reset password!', 'error');
                      }
                    } catch (error) {
                      showNotification('Network error. Please try again.', 'error');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    backgroundColor: isLoading ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isLoading && (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                  )}
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Page */}
      {currentPage === 'profile' && user && !footerPage && (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
          {/* Profile Header */}
          <div style={{ background: 'linear-gradient(to right, #4f46e5, #7c3aed)', color: 'white', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>My Profile</h1>
              <p style={{ fontSize: '1.125rem', color: '#e0e7ff' }}>Manage your account settings and view your activity</p>
            </div>
          </div>

          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: user.role === 'instructor' ? '1fr' : '2fr 1fr', gap: '2rem' }}>
              {/* Left Column - Account Settings */}
              <div>
                {/* Profile Info Card */}
                <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Users style={{ width: 24, height: 24, color: '#4f46e5' }} />
                    Account Information
                  </h2>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                    <div style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '50%', 
                      backgroundColor: '#4f46e5', 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 'bold'
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>{user.name}</h3>
                      <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '0.5rem' }}>{user.email}</p>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ 
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem', 
                          backgroundColor: user.role === 'instructor' ? '#dcfce7' : '#dbeafe', 
                          color: user.role === 'instructor' ? '#065f46' : '#1e40af',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}>
                          {user.role}
                        </span>
                        {/* User ID Badge */}
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.25rem 0.75rem', 
                          backgroundColor: '#f3f4f6', 
                          color: '#374151',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          border: '1px solid #d1d5db'
                        }}>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>ID:</span>
                          <span style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{user.userId}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.5rem' }}>
                        Full Name
                      </label>
                      <div style={{ fontSize: '1rem', color: '#111827', fontWeight: 500 }}>{user.name}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.5rem' }}>
                        Email Address
                      </label>
                      <div style={{ fontSize: '1rem', color: '#111827', fontWeight: 500 }}>{user.email}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.5rem' }}>
                        User ID
                      </label>
                      <div style={{ 
                        fontSize: '1rem', 
                        color: '#111827', 
                        fontWeight: 600,
                        fontFamily: 'monospace',
                        letterSpacing: '0.1em',
                        backgroundColor: '#f9fafb',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #e5e7eb',
                        display: 'inline-block'
                      }}>
                        {user.userId}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.5rem' }}>
                        Account Type
                      </label>
                      <div style={{ fontSize: '1rem', color: '#111827', fontWeight: 500, textTransform: 'capitalize' }}>{user.role}</div>
                    </div>
                  </div>
                </div>

                {/* Change Password Card */}
                <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Lock style={{ width: 24, height: 24, color: '#4f46e5' }} />
                    Change Password
                  </h2>

                  {!showChangePassword ? (
                    <div>
                      <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                        Keep your account secure by regularly updating your password
                      </p>
                      <button
                        onClick={() => setShowChangePassword(true)}
                        style={{
                          padding: '0.75rem 1.5rem',
                          backgroundColor: '#4f46e5',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#4338ca';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#4f46e5';
                        }}
                      >
                        Change Password
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      
                      // Step 1: Send OTP - Use logged-in user's email
                      if (!passwordForm.otpSent) {
                        setIsLoading(true);
                        try {
                          const response = await fetch(`${API_URL}/api/auth/send-otp`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              email: user.email.toLowerCase().trim(),
                              purpose: 'password-reset',
                              name: user.name
                            })
                          });

                          const data = await response.json();

                          if (response.ok) {
                            setPasswordForm({...passwordForm, email: user.email, otpSent: true});
                            showNotification('Verification code sent to your email!');
                          } else {
                            showNotification(data.message || 'Failed to send verification code!', 'error');
                          }
                        } catch (error) {
                          showNotification('Network error. Please try again.', 'error');
                        } finally {
                          setIsLoading(false);
                        }
                        return;
                      }

                      // Step 2: Verify OTP
                      if (!passwordForm.otpVerified) {
                        if (!passwordForm.otp || passwordForm.otp.length !== 6) {
                          showNotification('Please enter the 6-digit verification code!', 'error');
                          return;
                        }

                        setIsLoading(true);
                        try {
                          const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              email: user.email.toLowerCase().trim(),
                              otp: passwordForm.otp.trim(),
                              purpose: 'password-reset'
                            })
                          });

                          const data = await response.json();

                          if (response.ok && data.verified) {
                            setPasswordForm({...passwordForm, otpVerified: true});
                            showNotification('Email verified! Now set your new password.');
                          } else {
                            showNotification(data.message || 'Invalid verification code!', 'error');
                          }
                        } catch (error) {
                          showNotification('Network error during verification.', 'error');
                        } finally {
                          setIsLoading(false);
                        }
                        return;
                      }

                      // Step 3: Reset Password
                      if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
                        showNotification('Please fill in both password fields!', 'error');
                        return;
                      }

                      const passwordError = validatePassword(passwordForm.newPassword);
                      if (passwordError) {
                        showNotification(passwordError, 'error');
                        return;
                      }

                      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                        showNotification('New passwords do not match!', 'error');
                        return;
                      }

                      setIsLoading(true);
                      try {
                        const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            email: user.email.toLowerCase().trim(),
                            otp: passwordForm.otp.trim(),
                            newPassword: passwordForm.newPassword
                          })
                        });

                        const data = await response.json();

                        if (response.ok) {
                          showNotification('Password changed successfully!');
                          setShowChangePassword(false);
                          setPasswordForm({ 
                            email: '', 
                            otp: '', 
                            newPassword: '', 
                            confirmPassword: '',
                            otpSent: false,
                            otpVerified: false
                          });
                        } else {
                          showNotification(data.message || 'Failed to change password!', 'error');
                        }
                      } catch (error) {
                        showNotification('Error changing password. Please try again.', 'error');
                      } finally {
                        setIsLoading(false);
                      }
                    }}>
                      {/* Email Field - Locked with User's Email */}
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                          Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="email"
                            value={user.email}
                            disabled
                            style={{ 
                              width: '100%', 
                              padding: '0.75rem 2.5rem 0.75rem 0.75rem',
                              border: '1px solid #d1d5db', 
                              borderRadius: '0.5rem', 
                              outline: 'none', 
                              boxSizing: 'border-box',
                              backgroundColor: '#f9fafb',
                              color: '#6b7280',
                              cursor: 'not-allowed'
                            }}
                          />
                          <div style={{ 
                            position: 'absolute', 
                            right: '0.75rem', 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none'
                          }}>
                            <Lock style={{ width: 18, height: 18, color: '#9ca3af' }} />
                          </div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Shield style={{ width: 12, height: 12 }} />
                          Using your registered email for security
                        </p>
                      </div>

                      {/* OTP Field */}
                      {passwordForm.otpSent && !passwordForm.otpVerified && (
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                            Verification Code
                          </label>
                          <input
                            type="text"
                            required
                            maxLength="6"
                            value={passwordForm.otp}
                            onChange={(e) => {
                              const newValue = e.target.value.replace(/\D/g, '');
                              if (newValue.length <= 6) {
                                setPasswordForm({...passwordForm, otp: newValue});
                              }
                            }}
                            placeholder="Enter 6-digit code"
                            style={{ 
                              width: '100%', 
                              padding: '0.75rem', 
                              border: '2px solid #4f46e5', 
                              borderRadius: '0.5rem', 
                              outline: 'none', 
                              boxSizing: 'border-box',
                              fontSize: '1.125rem',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              letterSpacing: '0.5rem'
                            }}
                          />
                          <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.5rem', fontWeight: 500 }}>
                            ✓ Code sent to {passwordForm.email}
                          </p>
                        </div>
                      )}

                      {/* Password Fields */}
                      {passwordForm.otpVerified && (
                        <>
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                              New Password
                            </label>
                            <input
                              type="password"
                              required
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                              placeholder="Enter new password"
                              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', boxSizing: 'border-box' }}
                            />
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', lineHeight: 1.4 }}>
                              Must be 6+ characters with letters, numbers & special character
                            </p>
                          </div>
                          <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              required
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                              placeholder="Confirm new password"
                              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', boxSizing: 'border-box' }}
                            />
                          </div>
                        </>
                      )}

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                          type="submit"
                          disabled={isLoading}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            backgroundColor: isLoading ? '#9ca3af' : '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          {isLoading && (
                            <div style={{
                              width: '16px',
                              height: '16px',
                              border: '2px solid white',
                              borderTopColor: 'transparent',
                              borderRadius: '50%',
                              animation: 'spin 0.6s linear infinite'
                            }} />
                          )}
                          {isLoading 
                            ? 'Processing...' 
                            : !passwordForm.otpSent 
                              ? 'Send Verification Code' 
                              : !passwordForm.otpVerified 
                                ? 'Verify Code' 
                                : 'Change Password'
                          }
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowChangePassword(false);
                            setPasswordForm({ 
                              email: '', 
                              otp: '', 
                              newPassword: '', 
                              confirmPassword: '',
                              otpSent: false,
                              otpVerified: false
                            });
                          }}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Right Column - Purchase History (Only for Students) */}
              {user.role !== 'instructor' && (
                <div>
                  <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <BookOpen style={{ width: 24, height: 24, color: '#10b981' }} />
                      Purchase History
                    </h2>

                    {enrolledCourses.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#6b7280' }}>
                        <BookOpen style={{ width: 48, height: 48, color: '#d1d5db', margin: '0 auto 1rem' }} />
                        <p style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#111827', fontWeight: 600 }}>No purchases yet</p>
                        <p style={{ fontSize: '0.875rem' }}>Your course purchases will appear here</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {enrolledCourses.map((course, index) => {
                          const courseDetails = displayCourses.find(c => c.id === course.id || c.id === course.courseId) || course;
                          // Mock enrollment date - in real app, this would come from backend
                          const enrollDate = new Date(Date.now() - (index * 7 * 24 * 60 * 60 * 1000));
                          
                          return (
                            <div 
                              key={course.id || course.courseId}
                              style={{ 
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                              }}
                            >
                              <div style={{ display: 'flex', gap: '1rem' }}>
                                <img 
                                  src={courseDetails.image} 
                                  alt={courseDetails.title}
                                  style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '0.375rem' }}
                                />
                                <div style={{ flex: 1 }}>
                                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
                                    {courseDetails.title}
                                  </h4>
                                  <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                    by {courseDetails.instructor}
                                  </p>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#6b7280' }}>
                                      {enrollDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                    <span style={{ fontWeight: 600, color: '#10b981' }}>
                                      ₹{Math.round(courseDetails.price * 0.7)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Total Spent */}
                        <div style={{ 
                          marginTop: '1rem',
                          paddingTop: '1rem',
                          borderTop: '2px solid #e5e7eb',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>Total Spent</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>
                            ₹{enrolledCourses.reduce((total, course) => {
                              const courseDetails = displayCourses.find(c => c.id === course.id || c.id === course.courseId) || course;
                              return total + Math.round(courseDetails.price * 0.7);
                            }, 0)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}



      {/* Student Course Detail Page */}
      {viewingStudentCourse && user && user.role !== 'instructor' && !footerPage && (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
          {/* Compact Hero Section */}
          <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: 700, 
                color: '#111827', 
                textTransform: 'uppercase', 
                backgroundColor: '#10b981', 
                padding: '0.375rem 0.875rem', 
                borderRadius: '9999px',
                display: 'inline-block',
                marginBottom: '0.75rem'
              }}>
                {viewingStudentCourse.level}
              </span>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>
                {viewingStudentCourse.title}
              </h1>
              <p style={{ fontSize: '1rem', color: '#e0e7ff', margin: 0 }}>
                by {viewingStudentCourse.instructor}
              </p>
            </div>
          </div>

          {/* Only show tabs if coming from My Courses (viewFromMyCourses is true) */}
          {viewFromMyCourses && (
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e5e7eb' }}>
                <button 
                  onClick={() => setStudentCourseTab('lectures')}
                  style={{ 
                    padding: '1rem 1.5rem', 
                    background: 'none', 
                    border: 'none', 
                    borderBottom: studentCourseTab === 'lectures' ? '3px solid #4f46e5' : 'none',
                    color: studentCourseTab === 'lectures' ? '#4f46e5' : '#6b7280',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Play style={{ width: 20, height: 20 }} />
                  Lectures
                </button>
                <button 
                  onClick={() => setStudentCourseTab('quizzes')}
                  style={{ 
                    padding: '1rem 1.5rem', 
                    background: 'none', 
                    border: 'none', 
                    borderBottom: studentCourseTab === 'quizzes' ? '3px solid #4f46e5' : 'none',
                    color: studentCourseTab === 'quizzes' ? '#4f46e5' : '#6b7280',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Award style={{ width: 20, height: 20 }} />
                  Quizzes
                </button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 2rem' }}>
            {/* Lectures Tab - Only show if from My Courses */}
            {viewFromMyCourses && studentCourseTab === 'lectures' && (
              <div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>
                  Course Lectures
                </h2>
                <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '2rem' }}>
                  Click on any lecture to start learning
                </p>

                {loadingLectures ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      border: '4px solid #e5e7eb',
                      borderTopColor: '#4f46e5',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      margin: '0 auto 1rem'
                    }} />
                    <p style={{ fontSize: '1rem' }}>Loading lectures...</p>
                  </div>
                ) : (!courseLectures[viewingStudentCourse._id || viewingStudentCourse.id] || courseLectures[viewingStudentCourse._id || viewingStudentCourse.id].length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: 'white', borderRadius: '0.75rem', color: '#6b7280' }}>
                    <Play style={{ width: 48, height: 48, color: '#d1d5db', margin: '0 auto 1rem' }} />
                    <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: '#111827', fontWeight: 600 }}>No lectures available yet</p>
                    <p style={{ fontSize: '0.875rem' }}>The instructor will add lectures soon</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {courseLectures[viewingStudentCourse._id || viewingStudentCourse.id].map((lecture, index) => {
                      const lectureId = lecture._id || lecture.id;
                      const progress = lectureProgress[lectureId] || 0;
                      
                      return (
                        <div 
                          key={lectureId}
                          style={{ 
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb', 
                            borderRadius: '0.75rem',
                            overflow: 'hidden',
                            transition: 'all 0.3s',
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                          }}
                          onClick={() => setPlayingVideo(lecture)}
                        >
                          {/* Lecture Thumbnail */}
                          <div style={{ position: 'relative', backgroundColor: '#1f2937', aspectRatio: '16/9', overflow: 'hidden' }}>
                            {lecture.thumbnail && (
                              <img 
                                src={lecture.thumbnail}
                                alt={lecture.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            <div style={{ 
                              position: 'absolute', 
                              inset: 0, 
                              background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <div style={{ 
                                backgroundColor: 'rgba(79, 70, 229, 0.9)', 
                                borderRadius: '50%',
                                padding: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Play style={{ width: 32, height: 32, color: 'white', fill: 'white' }} />
                              </div>
                            </div>
                            <div style={{ 
                              position: 'absolute', 
                              top: '0.75rem', 
                              left: '0.75rem',
                              backgroundColor: 'rgba(0, 0, 0, 0.7)',
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <Clock style={{ width: 14, height: 14 }} />
                              {lecture.duration}
                            </div>
                          </div>
                          
                          {/* Lecture Info */}
                          <div style={{ padding: '1rem' }}>
                            <div style={{ 
                              fontSize: '0.75rem', 
                              fontWeight: 700, 
                              color: '#4f46e5', 
                              textTransform: 'uppercase',
                              marginBottom: '0.5rem',
                              letterSpacing: '0.05em'
                            }}>
                              Lecture {index + 1}
                            </div>
                            <h4 style={{ 
                              fontSize: '1rem', 
                              fontWeight: 600, 
                              color: '#111827', 
                              marginBottom: '0.5rem',
                              lineHeight: 1.4,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {lecture.title}
                            </h4>
                            {lecture.description && (
                              <p style={{ 
                                fontSize: '0.875rem', 
                                color: '#6b7280', 
                                marginBottom: '0.75rem',
                                lineHeight: 1.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}>
                                {lecture.description}
                              </p>
                            )}
                            
                            {/* Progress Bar */}
                            <div style={{ marginTop: '0.75rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>
                                  {progress > 0 ? (progress === 100 ? 'Completed' : 'In Progress') : 'Not Started'}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: progress === 100 ? '#10b981' : '#4f46e5', fontWeight: 600 }}>
                                  {progress}%
                                </span>
                              </div>
                              <div style={{ 
                                backgroundColor: '#e5e7eb', 
                                borderRadius: '9999px', 
                                height: '6px',
                                overflow: 'hidden'
                              }}>
                                <div style={{ 
                                  backgroundColor: progress === 100 ? '#10b981' : '#4f46e5', 
                                  height: '100%', 
                                  borderRadius: '9999px', 
                                  width: `${progress}%`,
                                  transition: 'width 0.3s ease'
                                }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Quizzes Tab - Only show if from My Courses */}
            {viewFromMyCourses && studentCourseTab === 'quizzes' && (
              <div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>
                  Course Quizzes
                </h2>
                <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '2rem' }}>
                  Test your knowledge with these quizzes
                </p>

                {loadingQuizzes ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      border: '4px solid #e5e7eb',
                      borderTopColor: '#10b981',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      margin: '0 auto 1rem'
                    }} />
                    <p style={{ fontSize: '1rem' }}>Loading quizzes...</p>
                  </div>
                ) : (!courseQuizzes[viewingStudentCourse._id || viewingStudentCourse.id] || courseQuizzes[viewingStudentCourse._id || viewingStudentCourse.id].length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: 'white', borderRadius: '0.75rem', color: '#6b7280' }}>
                    <Award style={{ width: 48, height: 48, color: '#d1d5db', margin: '0 auto 1rem' }} />
                    <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: '#111827', fontWeight: 600 }}>No quizzes available yet</p>
                    <p style={{ fontSize: '0.875rem' }}>The instructor will add quizzes soon</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                    {courseQuizzes[viewingStudentCourse._id || viewingStudentCourse.id].map(quiz => (
                      <div 
                        key={quiz._id || quiz.id}
                        style={{ 
                          backgroundColor: 'white', 
                          borderRadius: '0.75rem', 
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                          padding: '1.5rem',
                          transition: 'all 0.3s ease',
                          border: '1px solid #e5e7eb'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'start', marginBottom: '1rem', gap: '1rem' }}>
                          <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            backgroundColor: '#d1fae5', 
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Award style={{ width: 28, height: 28, color: '#059669' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.25rem 0' }}>
                              {quiz.title}
                            </h3>
                            {quiz.description && (
                              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                                {quiz.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.375rem',
                            padding: '0.375rem 0.75rem',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '9999px',
                            fontSize: '0.8125rem',
                            color: '#4b5563',
                            fontWeight: 500
                          }}>
                            <Clock style={{ width: 14, height: 14 }} />
                            {quiz.timerMinutes} min
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.375rem',
                            padding: '0.375rem 0.75rem',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '9999px',
                            fontSize: '0.8125rem',
                            color: '#4b5563',
                            fontWeight: 500
                          }}>
                            <BookOpen style={{ width: 14, height: 14 }} />
                            {quiz.questions?.length || 0} questions
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            setTakingQuiz(quiz);
                            setCurrentQuestionIndex(0);
                            setStudentAnswers({});
                            setQuizTimeRemaining(quiz.timerMinutes * 60);
                            setQuizStartTime(Date.now());
                          }}
                          style={{ 
                            width: '100%', 
                            padding: '0.75rem', 
                            backgroundColor: '#10b981', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '0.5rem', 
                            fontWeight: 600, 
                            cursor: 'pointer',
                            fontSize: '0.9375rem',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#059669';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#10b981';
                          }}
                        >
                          Start Quiz
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Course Details - Show when NOT from My Courses (from All Courses) */}
            {!viewFromMyCourses && (
              <div>
                {/* Course Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                  <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <Clock style={{ width: 32, height: 32, color: '#4f46e5', margin: '0 auto 0.75rem' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
                      {viewingStudentCourse.duration}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Duration</div>
                  </div>
                  <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <BookOpen style={{ width: 32, height: 32, color: '#059669', margin: '0 auto 0.75rem' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
                      {viewingStudentCourse.lessons}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Lessons</div>
                  </div>
                  <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <Users style={{ width: 32, height: 32, color: '#f59e0b', margin: '0 auto 0.75rem' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
                      {viewingStudentCourse.students.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Students Enrolled</div>
                  </div>
                  <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <Filter style={{ width: 32, height: 32, color: '#dc2626', margin: '0 auto 0.75rem' }} />
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem', textTransform: 'capitalize' }}>
                      {viewingStudentCourse.category.replace('-', ' ')}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Category</div>
                  </div>
                </div>

                {/* About Course */}
                <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BookOpen style={{ width: 28, height: 28, color: '#4f46e5' }} />
                    About This Course
                  </h2>
                  <p style={{ fontSize: '1.125rem', color: '#4b5563', lineHeight: 1.8 }}>
                    {viewingStudentCourse.description}
                  </p>
                </div>

                {/* What You'll Learn */}
                <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Award style={{ width: 28, height: 28, color: '#059669' }} />
                    What You'll Learn
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    {['Master core concepts and fundamentals', 'Build real-world projects from scratch', 'Best practices and industry standards', 'Hands-on practical experience', 'Advanced techniques and strategies', 'Career-ready skills and knowledge'].map((item, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                        <div style={{ 
                          backgroundColor: '#d1fae5', 
                          borderRadius: '50%', 
                          padding: '0.25rem',
                          marginTop: '0.25rem',
                          flexShrink: 0
                        }}>
                          <div style={{ 
                            width: '1rem', 
                            height: '1rem', 
                            backgroundColor: '#059669',
                            borderRadius: '50%'
                          }} />
                        </div>
                        <span style={{ fontSize: '1rem', color: '#374151', lineHeight: 1.6 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Course Curriculum Section */}
                <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BookOpen style={{ width: 28, height: 28, color: '#4f46e5' }} />
                    Course Curriculum
                  </h2>
                  {enrolledCourses.some(ec => ec.id === viewingStudentCourse.id || ec.courseId === viewingStudentCourse.id) && (
                    <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '2rem' }}>
                      Go to <button onClick={() => {
                        setViewingStudentCourse(null);
                        setCurrentPage('my-courses');
                      }} style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>My Courses</button> section to watch the lectures and take quizzes
                    </p>
                  )}

                  {/* Lectures Section */}
                  <div style={{ marginBottom: '3rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Play style={{ width: 24, height: 24, color: '#4f46e5' }} />
                      Lectures
                    </h3>
                    {loadingLectures ? (
                      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#6b7280' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          border: '3px solid #e5e7eb',
                          borderTopColor: '#4f46e5',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                          margin: '0 auto 1rem'
                        }} />
                        <p style={{ fontSize: '0.875rem' }}>Loading lectures...</p>
                      </div>
                    ) : (!courseLectures[viewingStudentCourse._id || viewingStudentCourse.id] || courseLectures[viewingStudentCourse._id || viewingStudentCourse.id].length === 0) ? (
                      <div style={{ textAlign: 'center', padding: '2rem 1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', color: '#6b7280' }}>
                        <Play style={{ width: 40, height: 40, color: '#d1d5db', margin: '0 auto 1rem' }} />
                        <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No lectures available yet</p>
                        <p style={{ fontSize: '0.875rem' }}>The instructor will add lectures soon</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {courseLectures[viewingStudentCourse._id || viewingStudentCourse.id].map((lecture, index) => (
                          <div 
                            key={lecture._id || lecture.id}
                            style={{ 
                              backgroundColor: '#f9fafb',
                              border: '1px solid #e5e7eb', 
                              borderRadius: '0.5rem',
                              padding: '1.5rem',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                              <div style={{ 
                                backgroundColor: '#4f46e5', 
                                color: 'white',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.875rem',
                                flexShrink: 0
                              }}>
                                {index + 1}
                              </div>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ 
                                  fontSize: '1.125rem', 
                                  fontWeight: 600, 
                                  color: '#111827', 
                                  marginBottom: '0.5rem'
                                }}>
                                  {lecture.title}
                                </h4>
                                {lecture.description && (
                                  <p style={{ 
                                    fontSize: '0.9375rem', 
                                    color: '#6b7280', 
                                    lineHeight: 1.6,
                                    marginBottom: '0.75rem'
                                  }}>
                                    {lecture.description}
                                  </p>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock style={{ width: 14, height: 14 }} />
                                    <span>{lecture.duration}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Play style={{ width: 14, height: 14 }} />
                                    <span>Video Lecture</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quizzes Section */}
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award style={{ width: 24, height: 24, color: '#10b981' }} />
                      Quizzes
                    </h3>
                    {loadingQuizzes ? (
                      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#6b7280' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          border: '3px solid #e5e7eb',
                          borderTopColor: '#10b981',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                          margin: '0 auto 1rem'
                        }} />
                        <p style={{ fontSize: '0.875rem' }}>Loading quizzes...</p>
                      </div>
                    ) : (!courseQuizzes[viewingStudentCourse._id || viewingStudentCourse.id] || courseQuizzes[viewingStudentCourse._id || viewingStudentCourse.id].length === 0) ? (
                      <div style={{ textAlign: 'center', padding: '2rem 1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', color: '#6b7280' }}>
                        <Award style={{ width: 40, height: 40, color: '#d1d5db', margin: '0 auto 1rem' }} />
                        <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No quizzes available yet</p>
                        <p style={{ fontSize: '0.875rem' }}>The instructor will add quizzes soon</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {courseQuizzes[viewingStudentCourse._id || viewingStudentCourse.id].map((quiz, index) => (
                          <div 
                            key={quiz._id || quiz.id}
                            style={{ 
                              backgroundColor: '#f9fafb',
                              border: '1px solid #e5e7eb', 
                              borderRadius: '0.5rem',
                              padding: '1.5rem',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                              <div style={{ 
                                backgroundColor: '#10b981', 
                                color: 'white',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.875rem',
                                flexShrink: 0
                              }}>
                                {index + 1}
                              </div>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ 
                                  fontSize: '1.125rem', 
                                  fontWeight: 600, 
                                  color: '#111827', 
                                  marginBottom: '0.5rem'
                                }}>
                                  {quiz.title}
                                </h4>
                                {quiz.description && (
                                  <p style={{ 
                                    fontSize: '0.9375rem', 
                                    color: '#6b7280', 
                                    lineHeight: 1.6,
                                    marginBottom: '0.75rem'
                                  }}>
                                    {quiz.description}
                                  </p>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock style={{ width: 14, height: 14 }} />
                                    <span>{quiz.timerMinutes} minutes</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <BookOpen style={{ width: 14, height: 14 }} />
                                    <span>{quiz.questions?.length || 0} questions</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem', display: 'none' }}>
              {/* Left Column - Course Details */}
              <div>
                {/* Course Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                  <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <Clock style={{ width: 32, height: 32, color: '#4f46e5', margin: '0 auto 0.75rem' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
                      {viewingStudentCourse.duration}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Duration</div>
                  </div>
                  <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <BookOpen style={{ width: 32, height: 32, color: '#059669', margin: '0 auto 0.75rem' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
                      {viewingStudentCourse.lessons}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Lessons</div>
                  </div>
                  <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <Users style={{ width: 32, height: 32, color: '#f59e0b', margin: '0 auto 0.75rem' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
                      {viewingStudentCourse.students.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Students Enrolled</div>
                  </div>
                  <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <Filter style={{ width: 32, height: 32, color: '#dc2626', margin: '0 auto 0.75rem' }} />
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem', textTransform: 'capitalize' }}>
                      {viewingStudentCourse.category.replace('-', ' ')}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Category</div>
                  </div>
                </div>

                {/* About Course */}
                <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BookOpen style={{ width: 28, height: 28, color: '#4f46e5' }} />
                    About This Course
                  </h2>
                  <p style={{ fontSize: '1.125rem', color: '#4b5563', lineHeight: 1.8 }}>
                    {viewingStudentCourse.description}
                  </p>
                </div>

                {/* What You'll Learn */}
                <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Award style={{ width: 28, height: 28, color: '#059669' }} />
                    What You'll Learn
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    {['Master core concepts and fundamentals', 'Build real-world projects from scratch', 'Best practices and industry standards', 'Hands-on practical experience', 'Advanced techniques and strategies', 'Career-ready skills and knowledge'].map((item, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                        <div style={{ 
                          backgroundColor: '#d1fae5', 
                          borderRadius: '50%', 
                          padding: '0.25rem',
                          marginTop: '0.25rem',
                          flexShrink: 0
                        }}>
                          <div style={{ 
                            width: '1rem', 
                            height: '1rem', 
                            backgroundColor: '#059669',
                            borderRadius: '50%'
                          }} />
                        </div>
                        <span style={{ fontSize: '1rem', color: '#374151', lineHeight: 1.6 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Pricing & Actions */}
              <div style={{ display: 'none' }}>
                {/* Price Card */}
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '1.5rem', position: 'sticky', top: '2rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Course Price</div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#4f46e5', lineHeight: 1 }}>
                      ₹{viewingStudentCourse.price}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>One-time payment • Lifetime access</div>
                  </div>

                  {enrolledCourses.some(ec => ec.id === viewingStudentCourse.id || ec.courseId === viewingStudentCourse.id) ? (
                    <button 
                      style={{ 
                        width: '100%', 
                        padding: '1rem', 
                        backgroundColor: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '0.5rem', 
                        fontWeight: 600, 
                        fontSize: '1.125rem',
                        cursor: 'default',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>✓</span>
                      Already Enrolled
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        enrollCourse(viewingStudentCourse.id);
                      }}
                      disabled={enrollingCourseId === viewingStudentCourse.id}
                      style={{ 
                        width: '100%', 
                        padding: '1rem', 
                        backgroundColor: enrollingCourseId === viewingStudentCourse.id ? '#9ca3af' : '#4f46e5', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '0.5rem', 
                        fontWeight: 600, 
                        fontSize: '1.125rem',
                        cursor: enrollingCourseId === viewingStudentCourse.id ? 'not-allowed' : 'pointer',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (enrollingCourseId !== viewingStudentCourse.id) {
                          e.currentTarget.style.backgroundColor = '#4338ca';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(79, 70, 229, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (enrollingCourseId !== viewingStudentCourse.id) {
                          e.currentTarget.style.backgroundColor = '#4f46e5';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {enrollingCourseId === viewingStudentCourse.id && (
                        <div style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid white',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.6s linear infinite'
                        }} />
                      )}
                      {enrollingCourseId === viewingStudentCourse.id ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )}

                  <div style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center', marginBottom: '1.5rem' }}>
                    30-day money-back guarantee
                  </div>

                  {/* Course Features */}
                  <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                      This course includes:
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[
                        { icon: <Play />, text: `${viewingStudentCourse.lessons} video lectures` },
                        { icon: <Clock />, text: `${viewingStudentCourse.duration} on-demand video` },
                        { icon: <Award />, text: 'Certificate of completion' },
                        { icon: <Users />, text: 'Lifetime access' },
                        { icon: <BookOpen />, text: 'Downloadable resources' },
                        { icon: <Shield />, text: '30-day money-back guarantee' }
                      ].map((feature, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#374151' }}>
                          <div style={{ color: '#4f46e5', flexShrink: 0 }}>
                            {React.cloneElement(feature.icon, { style: { width: 18, height: 18 } })}
                          </div>
                          <span style={{ fontSize: '0.875rem' }}>{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Lectures Section - Only show if enrolled */}
              {enrolledCourses.some(ec => ec.id === viewingStudentCourse.id || ec.courseId === viewingStudentCourse.id) && viewFromMyCourses && (
                <div style={{ marginTop: '3rem', paddingTop: '3rem', borderTop: '2px solid #e5e7eb' }}>
                  <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: '0 0 2rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Play style={{ width: 28, height: 28, color: '#4f46e5' }} />
                    Course Lectures
                  </h2>

                  {/* Lectures List */}
                  <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    {loadingLectures ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          border: '4px solid #e5e7eb',
                          borderTopColor: '#4f46e5',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                          margin: '0 auto 1rem'
                        }} />
                        <p style={{ fontSize: '1rem' }}>Loading lectures...</p>
                      </div>
                    ) : (!courseLectures[viewingStudentCourse._id || viewingStudentCourse.id] || courseLectures[viewingStudentCourse._id || viewingStudentCourse.id].length === 0) ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
                        <Play style={{ width: 48, height: 48, color: '#d1d5db', margin: '0 auto 1rem' }} />
                        <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No lectures available yet</p>
                        <p style={{ fontSize: '0.875rem' }}>The instructor will add lectures soon</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {courseLectures[viewingStudentCourse._id || viewingStudentCourse.id].map((lecture, index) => {
                          const lectureId = lecture._id || lecture.id;
                          const progress = lectureProgress[lectureId] || 0;
                          
                          return (
                            <div 
                              key={lectureId}
                              style={{ 
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb', 
                                borderRadius: '0.75rem',
                                overflow: 'hidden',
                                transition: 'all 0.3s',
                                cursor: 'pointer',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                              }}
                              onClick={() => setPlayingVideo(lecture)}
                            >
                              {/* Lecture Thumbnail */}
                              <div style={{ position: 'relative', backgroundColor: '#1f2937', aspectRatio: '16/9', overflow: 'hidden' }}>
                                <img 
                                  src={lecture.thumbnail || (() => {
                                    const url = lecture.videoUrl || '';
                                    let videoId = '';
                                    if (url.includes('youtu.be/')) {
                                      videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
                                    } else if (url.includes('youtube.com/watch?v=')) {
                                      videoId = url.split('v=')[1]?.split('&')[0];
                                    } else if (url.includes('youtube.com/embed/')) {
                                      videoId = url.split('embed/')[1]?.split('?')[0];
                                    }
                                    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
                                  })()}
                                  alt={lecture.title}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                                <div style={{ 
                                  position: 'absolute', 
                                  inset: 0, 
                                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <div style={{ 
                                    backgroundColor: 'rgba(79, 70, 229, 0.9)', 
                                    borderRadius: '50%',
                                    padding: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    <Play style={{ width: 32, height: 32, color: 'white', fill: 'white' }} />
                                  </div>
                                </div>
                                <div style={{ 
                                  position: 'absolute', 
                                  top: '0.75rem', 
                                  left: '0.75rem',
                                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                  color: 'white',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}>
                                  <Clock style={{ width: 14, height: 14 }} />
                                  {lecture.duration}
                                </div>
                              </div>
                              
                              {/* Lecture Info */}
                              <div style={{ padding: '1rem' }}>
                                <div style={{ 
                                  fontSize: '0.75rem', 
                                  fontWeight: 700, 
                                  color: '#4f46e5', 
                                  textTransform: 'uppercase',
                                  marginBottom: '0.5rem',
                                  letterSpacing: '0.05em'
                                }}>
                                  Lecture {index + 1}
                                </div>
                                <h4 style={{ 
                                  fontSize: '1rem', 
                                  fontWeight: 600, 
                                  color: '#111827', 
                                  marginBottom: '0.5rem',
                                  lineHeight: 1.4,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical'
                                }}>
                                  {lecture.title}
                                </h4>
                                {lecture.description && (
                                  <p style={{ 
                                    fontSize: '0.875rem', 
                                    color: '#6b7280', 
                                    marginBottom: '0.75rem',
                                    lineHeight: 1.5,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                  }}>
                                    {lecture.description}
                                  </p>
                                )}
                                
                                {/* Progress Bar */}
                                <div style={{ marginTop: '0.75rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>
                                      {progress > 0 ? 'In Progress' : 'Not Started'}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 600 }}>
                                      {progress}%
                                    </span>
                                  </div>
                                  <div style={{ 
                                    backgroundColor: '#e5e7eb', 
                                    borderRadius: '9999px', 
                                    height: '6px',
                                    overflow: 'hidden'
                                  }}>
                                    <div style={{ 
                                      backgroundColor: progress === 100 ? '#10b981' : '#4f46e5', 
                                      height: '100%', 
                                      borderRadius: '9999px', 
                                      width: `${progress}%`,
                                      transition: 'width 0.3s ease'
                                    }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Course Curriculum Section - Show lecture titles only if from All Courses */}
              {enrolledCourses.some(ec => ec.id === viewingStudentCourse.id || ec.courseId === viewingStudentCourse.id) && !viewFromMyCourses && (
                <div style={{ marginTop: '3rem', paddingTop: '3rem', borderTop: '2px solid #e5e7eb' }}>
                  <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BookOpen style={{ width: 28, height: 28, color: '#4f46e5' }} />
                    Course Curriculum
                  </h2>
                  <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '2rem' }}>
                    Go to <button onClick={() => {
                      setViewingStudentCourse(null);
                      setCurrentPage('my-courses');
                    }} style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>My Courses</button> section to watch the lectures
                  </p>

                  {/* Lectures List - Title and Description Only */}
                  <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    {loadingLectures ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          border: '4px solid #e5e7eb',
                          borderTopColor: '#4f46e5',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                          margin: '0 auto 1rem'
                        }} />
                        <p style={{ fontSize: '1rem' }}>Loading curriculum...</p>
                      </div>
                    ) : (!courseLectures[viewingStudentCourse._id || viewingStudentCourse.id] || courseLectures[viewingStudentCourse._id || viewingStudentCourse.id].length === 0) ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
                        <BookOpen style={{ width: 48, height: 48, color: '#d1d5db', margin: '0 auto 1rem' }} />
                        <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No curriculum available yet</p>
                        <p style={{ fontSize: '0.875rem' }}>The instructor will add lectures soon</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {courseLectures[viewingStudentCourse._id || viewingStudentCourse.id].map((lecture, index) => (
                          <div 
                            key={lecture._id || lecture.id}
                            style={{ 
                              backgroundColor: '#f9fafb',
                              border: '1px solid #e5e7eb', 
                              borderRadius: '0.5rem',
                              padding: '1.5rem',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                              <div style={{ 
                                backgroundColor: '#4f46e5', 
                                color: 'white',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.875rem',
                                flexShrink: 0
                              }}>
                                {index + 1}
                              </div>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ 
                                  fontSize: '1.125rem', 
                                  fontWeight: 600, 
                                  color: '#111827', 
                                  marginBottom: '0.5rem'
                                }}>
                                  {lecture.title}
                                </h4>
                                {lecture.description && (
                                  <p style={{ 
                                    fontSize: '0.9375rem', 
                                    color: '#6b7280', 
                                    lineHeight: 1.6,
                                    marginBottom: '0.75rem'
                                  }}>
                                    {lecture.description}
                                  </p>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock style={{ width: 14, height: 14 }} />
                                    <span>{lecture.duration}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Play style={{ width: 14, height: 14 }} />
                                    <span>Video Lecture</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Video Player Modal */}
              {playingVideo && (
                <div 
                  style={{ 
                    position: 'fixed', 
                    inset: '0', 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                    zIndex: 10000, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '2rem' 
                  }}
                  onClick={() => setPlayingVideo(null)}
                >
                  <div 
                    style={{ 
                      backgroundColor: 'white', 
                      borderRadius: '1rem', 
                      maxWidth: '900px', 
                      width: '100%',
                      overflow: 'hidden'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                        {playingVideo.title}
                      </h3>
                      <button 
                        onClick={() => setPlayingVideo(null)}
                        style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                      >
                        <X style={{ width: 24, height: 24 }} />
                      </button>
                    </div>
                    <div style={{ aspectRatio: '16/9', backgroundColor: '#000' }}>
                      <video
                        key={playingVideo._id || playingVideo.id}
                        controls
                        autoPlay
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          console.error('Video load error:', e);
                        }}
                      >
                        <source src={playingVideo.videoUrl} type="video/mp4" />
                        <source src={playingVideo.videoUrl} type="video/webm" />
                        <source src={playingVideo.videoUrl} type="video/ogg" />
                        <source src={playingVideo.videoUrl} />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    {playingVideo.description && (
                      <div style={{ padding: '1.5rem', color: '#6b7280' }}>
                        {playingVideo.description}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

{currentPage === 'instructor-dashboard' && user && user.role === 'instructor' && (
  <InstructorDashboard
    user={user}
    token={token}
    showNotification={showNotification}
    setCurrentPage={setCurrentPage}
    convertImageToBase64={convertImageToBase64}
    fetchCourses={fetchCourses}
  />
)}
      
      {currentPage === 'dashboard' && user && user.role !== 'instructor' && !viewingStudentCourse && (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
          <div style={{ background: 'linear-gradient(to right, #4f46e5, #9333ea)', color: 'white', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Welcome back, {user.name}!</h1>
                  <p style={{ fontSize: '1.125rem', color: '#c7d2fe' }}>Continue your learning journey</p>
                </div>
                {/* User ID Badge */}
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  backdropFilter: 'blur(10px)',
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '9999px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.5rem',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    letterSpacing: '0.1em'
                  }}>
                    ID
                  </div>
                  <span style={{ fontSize: '1.125rem', fontWeight: 'bold', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
                    {user.userId}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb' }}>
              <button 
                onClick={() => {
                  setCurrentPage('dashboard');
                  setViewingStudentCourse(null);
                }}
                style={{ 
                  padding: '1rem 1.5rem', 
                  background: 'none', 
                  border: 'none', 
                  borderBottom: '3px solid #4f46e5',
                  color: '#4f46e5',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                All Courses
              </button>
              <button 
                onClick={() => {
                  setCurrentPage('my-courses');
                  setViewingStudentCourse(null);
                }}
                style={{ 
                  padding: '1rem 1.5rem', 
                  background: 'none', 
                  border: 'none', 
                  color: '#6b7280',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                My Courses ({enrolledCourses.length})
              </button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '9999px',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: selectedCategory === cat.id ? '#4f46e5' : 'white',
                    color: selectedCategory === cat.id ? 'white' : '#374151',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '0.5rem', padding: '0.5rem 1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award style={{ color: '#f59e0b', width: 18, height: 18 }} />
                <span style={{ fontWeight: 600, color: '#78350f', fontSize: '0.875rem' }}>Special Offer: Get 30% off on all courses today!</span>
              </div>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>Available Courses</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {filteredCourses.map(course => {
                const isEnrolled = enrolledCourses.some(ec => ec.id === course.id || ec.courseId === course.id);
                return (
                  <div 
                    key={course.id} 
                    onClick={() => {
                      setViewingStudentCourse(course);
                      setViewFromMyCourses(false); // Coming from All Courses section
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{ 
                      backgroundColor: 'white', 
                      borderRadius: '0.5rem', 
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: 'translateY(0)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={course.image} 
                        alt={course.title} 
                        style={{ 
                          width: '100%', 
                          height: '12rem', 
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                      />
                      {course.bestseller && (
                        <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', backgroundColor: '#fbbf24', color: '#78350f', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          BESTSELLER
                        </div>
                      )}
                      {isEnrolled && (
                        <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', backgroundColor: '#10b981', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          ✓ ENROLLED
                        </div>
                      )}
                      <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
                        <div style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          30% OFF
                        </div>
                        <div style={{ backgroundColor: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem', fontWeight: 600, color: '#4f46e5' }}>
                          ₹{course.price - Math.round(course.price * 0.3)} <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '0.75rem' }}>₹{course.price}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4f46e5', textTransform: 'uppercase' }}>{course.level}</span>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', margin: '0.25rem 0 0.5rem 0' }}>{course.title}</h3>
                      <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: '0 0 0.75rem 0' }}>by {course.instructor}</p>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#111827', marginRight: '0.25rem' }}>{course.rating}</span>
                        <div style={{ display: 'flex', alignItems: 'center', marginRight: '0.5rem' }}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} style={{ width: 16, height: 16, color: i <= Math.floor(course.rating) ? '#fbbf24' : '#d1d5db', fill: i <= Math.floor(course.rating) ? '#fbbf24' : 'none' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>({course.reviews.toLocaleString()})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Users style={{ width: 16, height: 16, marginRight: '0.25rem' }} />
                          <span>{(course.students / 1000).toFixed(1)}k students</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Clock style={{ width: 16, height: 16, marginRight: '0.25rem' }} />
                          <span>{course.duration}</span>
                        </div>
                      </div>
                      {isEnrolled ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          style={{ 
                            width: '100%', 
                            padding: '0.75rem', 
                            backgroundColor: '#10b981', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '0.5rem', 
                            fontWeight: 600, 
                            cursor: 'default',
                            pointerEvents: 'none'
                          }}
                        >
                          ✓ Enrolled
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open payment modal instead of direct enrollment
                            setSelectedCourseForPayment(course);
                            setShowPaymentModal(true);
                            setPaymentAccepted(false);
                          }}
                          disabled={enrollingCourseId === course.id}
                          style={{ 
                            width: '100%', 
                            padding: '0.75rem', 
                            backgroundColor: enrollingCourseId === course.id ? '#9ca3af' : '#4f46e5', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '0.5rem', 
                            fontWeight: 600, 
                            cursor: enrollingCourseId === course.id ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          {enrollingCourseId === course.id ? 'Processing...' : 'Enroll Now'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {currentPage === 'my-courses' && user && user.role !== 'instructor' && !viewingStudentCourse && (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
          <div style={{ background: 'linear-gradient(to right, #4f46e5, #9333ea)', color: 'white', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>My Enrolled Courses</h1>
              <p style={{ fontSize: '1.125rem', color: '#c7d2fe' }}>Continue learning where you left off</p>
            </div>
          </div>

          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb' }}>
              <button 
                onClick={() => setCurrentPage('dashboard')}
                style={{ 
                  padding: '1rem 1.5rem', 
                  background: 'none', 
                  border: 'none', 
                  color: '#6b7280',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                All Courses
              </button>
              <button 
                onClick={() => setCurrentPage('my-courses')}
                style={{ 
                  padding: '1rem 1.5rem', 
                  background: 'none', 
                  border: 'none', 
                  borderBottom: '3px solid #4f46e5',
                  color: '#4f46e5',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                My Courses ({enrolledCourses.length})
              </button>
            </div>

            {enrolledCourses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <BookOpen style={{ width: 64, height: 64, color: '#d1d5db', margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>No enrolled courses yet</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Start learning by enrolling in a course</p>
                <button 
                  onClick={() => setCurrentPage('dashboard')}
                  style={{ padding: '0.75rem 1.5rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                  {enrolledCourses.map(course => {
                  const courseDetails = displayCourses.find(c => c.id === course.id || c.id === course.courseId) || course;
                  const courseId = courseDetails._id || courseDetails.id;
                  
                  // Calculate average progress for this course
                  const lectures = courseLectures[courseId] || [];
                  const courseProgress = lectures.length > 0
                    ? Math.round(
                        lectures.reduce((sum, lecture) => {
                          const lectureId = lecture._id || lecture.id;
                          return sum + (lectureProgress[lectureId] || 0);
                        }, 0) / lectures.length
                      )
                    : 0;
                  
                  return (
                    <div 
                      key={course.id || course.courseId}
                      onClick={() => {
                        // Go to course detail page with tabs for enrolled courses
                        setViewingStudentCourse(courseDetails);
                        setViewFromMyCourses(true);
                        setStudentCourseTab('lectures'); // Default to lectures tab
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{ 
                        backgroundColor: 'white', 
                        borderRadius: '0.5rem', 
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        transform: 'translateY(0)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <img 
                          src={courseDetails.image} 
                          alt={courseDetails.title} 
                          style={{ 
                            width: '100%', 
                            height: '12rem', 
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                        />
                        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: '#10b981', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          ENROLLED
                        </div>
                      </div>
                      <div style={{ padding: '1rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>{courseDetails.title}</h3>
                        <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: '0 0 1rem 0' }}>by {courseDetails.instructor}</p>
                        <div style={{ backgroundColor: '#f3f4f6', borderRadius: '9999px', height: '0.5rem', marginBottom: '0.5rem' }}>
                          <div style={{ backgroundColor: '#4f46e5', height: '100%', borderRadius: '9999px', width: `${courseProgress}%` }}></div>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>{courseProgress}% complete</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingStudentCourse(courseDetails);
                            setViewFromMyCourses(true);
                            setStudentCourseTab('lectures'); // Default to lectures tab
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          style={{ 
                            width: '100%', 
                            padding: '0.75rem', 
                            backgroundColor: '#4f46e5', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '0.5rem', 
                            fontWeight: 600, 
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#4338ca';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#4f46e5';
                          }}
                        >
                          Continue Learning
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quiz Taking Page - Full Page */}
      {takingQuiz && !showQuizResults && user && user.role !== 'instructor' && (
        <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#f9fafb',
          zIndex: 10001,
          overflowY: 'auto'
        }}>
          {/* Main Header */}
          <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 1000, marginBottom: 0 }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen style={{ color: '#4f46e5', width: 32, height: 32 }} />
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>LearnHub</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* User Profile Circle */}
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      backgroundColor: '#4f46e5', 
                      color: 'white', 
                      border: 'none', 
                      fontWeight: 'bold', 
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Quiz Header with Timer and Back Button */}
          <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ maxWidth: '60rem', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Back Button */}
                <button
                  onClick={() => {
                    setShowQuitQuizConfirm(true);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9375rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  }}
                >
                  <ChevronRight style={{ width: 18, height: 18, transform: 'rotate(180deg)' }} />
                  Back
                </button>
                
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>
                    {takingQuiz.title}
                  </h1>
                  <p style={{ fontSize: '0.875rem', color: '#d1fae5', margin: 0 }}>
                    Question {currentQuestionIndex + 1} of {takingQuiz.questions?.length || 0}
                  </p>
                </div>
              </div>
              {/* Timer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.75rem 1.5rem', borderRadius: '9999px' }}>
                <Clock style={{ width: 24, height: 24 }} />
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                  {Math.floor(quizTimeRemaining / 60)}:{(quizTimeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div style={{ maxWidth: '60rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
            {takingQuiz.questions && takingQuiz.questions[currentQuestionIndex] && (
              <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                {/* Question */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ 
                    display: 'inline-block',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    padding: '0.375rem 0.875rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    marginBottom: '1rem'
                  }}>
                    Question {currentQuestionIndex + 1}
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827', lineHeight: 1.6 }}>
                    {takingQuiz.questions[currentQuestionIndex].questionText}
                  </h2>
                </div>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  {takingQuiz.questions[currentQuestionIndex].options?.map((option, optIndex) => {
                    const isSelected = studentAnswers[currentQuestionIndex] === optIndex; // Compare with 0-based index
                    
                    return (
                      <button
                        key={optIndex}
                        onClick={() => {
                          setStudentAnswers({
                            ...studentAnswers,
                            [currentQuestionIndex]: optIndex // Store as 0-based index to match backend
                          });
                        }}
                        style={{
                          padding: '1.25rem 1.5rem',
                          backgroundColor: isSelected ? '#dbeafe' : 'white',
                          border: `2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
                          borderRadius: '0.75rem',
                          fontSize: '1.0625rem',
                          fontWeight: isSelected ? 600 : 400,
                          color: isSelected ? '#1e40af' : '#374151',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#3b82f6';
                            e.currentTarget.style.backgroundColor = '#f0f9ff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.backgroundColor = 'white';
                          }
                        }}
                      >
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: `2px solid ${isSelected ? '#3b82f6' : '#d1d5db'}`,
                          backgroundColor: isSelected ? '#3b82f6' : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'white' }} />}
                        </div>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '2px solid #f3f4f6' }}>
                  <button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: currentQuestionIndex === 0 ? '#f3f4f6' : 'white',
                      color: currentQuestionIndex === 0 ? '#9ca3af' : '#374151',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontWeight: 600,
                      cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '0.9375rem'
                    }}
                  >
                    ← Previous
                  </button>
                  
                  {currentQuestionIndex < (takingQuiz.questions?.length || 0) - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#4f46e5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.9375rem',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4338ca';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#4f46e5';
                      }}
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        // Check if all questions are answered
                        const unanswered = takingQuiz.questions?.length - Object.keys(studentAnswers).length;
                        if (unanswered > 0) {
                          if (!window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) {
                            return;
                          }
                        }

                        setIsLoading(true);
                        try {
                          // Map answers to the format backend expects
                          const answers = [];
                          for (let i = 0; i < takingQuiz.questions.length; i++) {
                            if (studentAnswers[i] !== undefined) {
                              answers.push({
                                questionIndex: i,
                                selectedAnswer: studentAnswers[i] // Convert 0-based to 1-based for backend
                              });
                            }
                          }

                          const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000);

                          const response = await fetch(`${API_URL}/api/quizzes/${takingQuiz._id}/submit`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ answers, timeSpent })
                          });

                          const data = await response.json();

                          if (response.ok) {
                            // Fetch the quiz with correct answers for review
                            const quizResponse = await fetch(`${API_URL}/api/quizzes/${takingQuiz._id}/review`, {
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            });
                            
                            const quizData = await quizResponse.json();
                            
                            // Store student answers with the result and correct answers for review
                            const resultWithAnswers = {
                              ...data.result,
                              studentAnswers: answers,
                              quizQuestions: quizData.quiz?.questions || takingQuiz.questions
                            };
                            setShowQuizResults(resultWithAnswers);
                            setQuizReviewMode(false);
                            showNotification('Quiz submitted successfully!');
                          } else {
                            showNotification(data.message || 'Failed to submit quiz!', 'error');
                          }
                        } catch (error) {
                          showNotification('Error submitting quiz!', 'error');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading}
                      style={{
                        padding: '0.75rem 2rem',
                        backgroundColor: isLoading ? '#9ca3af' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontSize: '0.9375rem',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.backgroundColor = '#059669';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.backgroundColor = '#10b981';
                        }
                      }}
                    >
                      {isLoading && (
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid white',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.6s linear infinite'
                        }} />
                      )}
                      {isLoading ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                  )}
                </div>

                {/* Progress Dots */}
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
                  {takingQuiz.questions?.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '0.5rem',
                        border: 'none',
                        backgroundColor: studentAnswers[idx] !== undefined ? '#10b981' : (currentQuestionIndex === idx ? '#4f46e5' : '#e5e7eb'),
                        color: (studentAnswers[idx] !== undefined || currentQuestionIndex === idx) ? 'white' : '#6b7280',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

{/* Quiz Review Page - Full Page */}
{quizReviewMode && showQuizResults && user && user.role !== 'instructor' && (
  <div style={{ 
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f9fafb',
    zIndex: 10002,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden' // ✅ Remove scroll
  }}>
    {/* Main Header */}
    <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 1000, flexShrink: 0 }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen style={{ color: '#4f46e5', width: 32, height: 32 }} />
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>LearnHub</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: '#4f46e5', 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    {/* Review Header - Compact */}
    <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', padding: '1rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flexShrink: 0 }}>
      <div style={{ maxWidth: '60rem', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setQuizReviewMode(false)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '0.5rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
            }}
          >
            <ChevronRight style={{ width: 16, height: 16, transform: 'rotate(180deg)' }} />
            Back
          </button>
          
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.125rem 0' }}>
              Answer Review
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#e0e7ff', margin: 0 }}>
              Question {currentQuestionIndex + 1} of {showQuizResults.quizQuestions?.length || 0}
            </p>
          </div>
        </div>
        
        {/* Score Badge - Smaller */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '9999px' }}>
          <Award style={{ width: 18, height: 18 }} />
          <span style={{ fontSize: '1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
            {showQuizResults.percentage}%
          </span>
        </div>
      </div>
    </div>

    {/* Question Review Content - Compact & No Scroll */}
    <div style={{ 
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem',
      maxWidth: '60rem',
      margin: '0 auto',
      width: '100%',
      overflow: 'hidden' // ✅ Remove scroll
    }}>
      {showQuizResults.quizQuestions && showQuizResults.quizQuestions[currentQuestionIndex] && (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '1rem', 
          padding: '1.5rem', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden' // ✅ Remove scroll
        }}>
          
          {/* Question Header with Status - Compact */}
          <div style={{ marginBottom: '1rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ 
                display: 'inline-block',
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                padding: '0.25rem 0.625rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                Question {currentQuestionIndex + 1}
              </div>
              
              {/* Status Badge - Smaller */}
              {(() => {
                const studentAnswer = showQuizResults.studentAnswers?.find(a => a.questionIndex === currentQuestionIndex);
                const question = showQuizResults.quizQuestions[currentQuestionIndex];
                const isCorrect = studentAnswer && studentAnswer.selectedAnswer === question.correctAnswer;
                
                return (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: isCorrect ? '#d1fae5' : (studentAnswer ? '#fee2e2' : '#fef3c7'),
                    color: isCorrect ? '#065f46' : (studentAnswer ? '#991b1b' : '#78350f'),
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {isCorrect ? (
                      <>
                        <span style={{ fontSize: '0.875rem' }}>✓</span>
                        Correct
                      </>
                    ) : studentAnswer ? (
                      <>
                        <span style={{ fontSize: '0.875rem' }}>✗</span>
                        Incorrect
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: '0.875rem' }}>⊘</span>
                        Not Answered
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
            
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', lineHeight: 1.5, margin: 0 }}>
              {showQuizResults.quizQuestions[currentQuestionIndex].questionText}
            </h2>
          </div>

          {/* Options Review - Compact & Scrollable */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.75rem', 
            marginBottom: '1rem',
            flex: 1,
            overflowY: 'auto', // ✅ Only options scroll if needed
            paddingRight: '0.5rem'
          }}>
            {showQuizResults.quizQuestions[currentQuestionIndex].options?.map((option, optIndex) => {
              const studentAnswer = showQuizResults.studentAnswers?.find(a => a.questionIndex === currentQuestionIndex);
              const question = showQuizResults.quizQuestions[currentQuestionIndex];
              
              const isCorrectAnswer = optIndex === question.correctAnswer;
              const isStudentChoice = studentAnswer && studentAnswer.selectedAnswer === optIndex;
              
              let backgroundColor = 'white';
              let borderColor = '#e5e7eb';
              let textColor = '#374151';
              let icon = null;
              
              if (isCorrectAnswer) {
                backgroundColor = '#d1fae5';
                borderColor = '#10b981';
                textColor = '#065f46';
                icon = '✓';
              } else if (isStudentChoice && !isCorrectAnswer) {
                backgroundColor = '#fee2e2';
                borderColor = '#ef4444';
                textColor = '#991b1b';
                icon = '✗';
              }
              
              return (
                <div
                  key={optIndex}
                  style={{
                    padding: '0.875rem 1rem',
                    backgroundColor: backgroundColor,
                    border: `2px solid ${borderColor}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.9375rem',
                    fontWeight: (isCorrectAnswer || isStudentChoice) ? 600 : 400,
                    color: textColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    position: 'relative',
                    flexShrink: 0
                  }}
                >
                  {/* Option Icon - Smaller */}
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: `2px solid ${borderColor}`,
                    backgroundColor: isCorrectAnswer || isStudentChoice ? borderColor : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}>
                    {icon || String.fromCharCode(65 + optIndex)}
                  </div>
                  
                  <span style={{ flex: 1 }}>{option}</span>
                  
                  {/* Label - Smaller */}
                  {isCorrectAnswer && (
                    <span style={{
                      padding: '0.125rem 0.5rem',
                      backgroundColor: '#059669',
                      color: 'white',
                      borderRadius: '9999px',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em'
                    }}>
                      Correct
                    </span>
                  )}
                  {isStudentChoice && !isCorrectAnswer && (
                    <span style={{
                      padding: '0.125rem 0.5rem',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      borderRadius: '9999px',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em'
                    }}>
                      Your Answer
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation Buttons - Compact */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '2px solid #f3f4f6', flexShrink: 0 }}>
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: currentQuestionIndex === 0 ? '#f3f4f6' : 'white',
                color: currentQuestionIndex === 0 ? '#9ca3af' : '#374151',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem'
              }}
            >
              ← Previous
            </button>
            
            {currentQuestionIndex < (showQuizResults.quizQuestions?.length || 0) - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                style={{
                  padding: '0.625rem 1.25rem',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4338ca';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#4f46e5';
                }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={() => setQuizReviewMode(false)}
                style={{
                  padding: '0.625rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981';
                }}
              >
                Back to Results
              </button>
            )}
          </div>

          {/* Progress Dots - Smaller */}
          <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap', flexShrink: 0 }}>
            {showQuizResults.quizQuestions?.map((_, idx) => {
              const studentAnswer = showQuizResults.studentAnswers?.find(a => a.questionIndex === idx);
              const question = showQuizResults.quizQuestions[idx];
              const isCorrect = studentAnswer && studentAnswer.selectedAnswer === question.correctAnswer;
              
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '0.375rem',
                    border: currentQuestionIndex === idx ? '2px solid #4f46e5' : 'none',
                    backgroundColor: isCorrect ? '#10b981' : (studentAnswer ? '#ef4444' : '#9ca3af'),
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  </div>
)}

{/* Quiz Results Page - Full Page */}
{showQuizResults && !quizReviewMode && user && user.role !== 'instructor' && (
  <div style={{ 
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f9fafb',
    zIndex: 10001,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden' // ✅ Remove scroll
  }}>
    {/* Main Header */}
    <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 1000 }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen style={{ color: '#4f46e5', width: 32, height: 32 }} />
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>LearnHub</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: '#4f46e5', 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    {/* Results Header - Compact */}
    <div style={{ 
      background: showQuizResults.passed ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
      color: 'white', 
      padding: '1.5rem 1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      flexShrink: 0
    }}>
      <div style={{ maxWidth: '60rem', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>
          Quiz Results
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
          {takingQuiz?.title || 'Quiz Completed'}
        </p>
      </div>
    </div>

    {/* Results Content - Compact & No Scroll */}
    <div style={{ 
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      overflow: 'hidden' // ✅ Remove scroll
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '1rem', 
        padding: '2rem', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        {/* Result Icon - Smaller */}
        <div style={{ 
          width: '72px', 
          height: '72px', 
          margin: '0 auto 1.25rem',
          borderRadius: '50%',
          backgroundColor: showQuizResults.passed ? '#d1fae5' : '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '2.5rem' }}>
            {showQuizResults.passed ? '🎉' : '📚'}
          </span>
        </div>

        {/* Score - Compact */}
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: showQuizResults.passed ? '#059669' : '#dc2626', margin: '0 0 0.25rem 0' }}>
          {showQuizResults.percentage}%
        </h2>
        <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '1.5rem' }}>
          {showQuizResults.correctAnswers} out of {showQuizResults.totalQuestions} correct
        </p>

        {/* Status Badge - Smaller */}
        <div style={{
          display: 'inline-block',
          padding: '0.5rem 1.5rem',
          backgroundColor: showQuizResults.passed ? '#d1fae5' : '#fee2e2',
          color: showQuizResults.passed ? '#065f46' : '#991b1b',
          borderRadius: '9999px',
          fontSize: '1rem',
          fontWeight: 700,
          marginBottom: '1.5rem'
        }}>
          {showQuizResults.passed ? '✓ Passed' : '✗ Not Passed'}
        </div>

        {/* Stats Grid - Compact */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '1rem',
          marginBottom: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '2px solid #f3f4f6'
        }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.125rem' }}>
              {showQuizResults.correctAnswers}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>Correct</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '0.125rem' }}>
              {showQuizResults.totalQuestions - showQuizResults.correctAnswers}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>Incorrect</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5', marginBottom: '0.125rem' }}>
              {showQuizResults.totalQuestions}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>Total</div>
          </div>
        </div>

        {/* Actions - Compact */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={() => {
              setQuizReviewMode(true);
              setCurrentQuestionIndex(0);
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9375rem',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#059669';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#10b981';
            }}
          >
            Review Answers
          </button>
          <button
            onClick={() => {
              setShowQuizResults(null);
              setTakingQuiz(null);
              setStudentAnswers({});
              setCurrentQuestionIndex(0);
              setQuizReviewMode(false);
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9375rem',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4338ca';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4f46e5';
            }}
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    </div>
  </div>
)}



      {currentPage === 'quizzes' && user && user.role !== 'instructor' && !takingQuiz && !showQuizResults && (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
          <div style={{ background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Practice Quizzes</h1>
              <p style={{ fontSize: '1.125rem', color: '#d1fae5' }}>Test your knowledge and track your progress</p>
            </div>
          </div>

          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb' }}>
              <button 
                onClick={() => setCurrentPage('dashboard')}
                style={{ 
                  padding: '1rem 1.5rem', 
                  background: 'none', 
                  border: 'none', 
                  color: '#6b7280',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                All Courses
              </button>
              <button 
                onClick={() => setCurrentPage('my-courses')}
                style={{ 
                  padding: '1rem 1.5rem', 
                  background: 'none', 
                  border: 'none', 
                  color: '#6b7280',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                My Courses ({enrolledCourses.length})
              </button>
              <button 
                onClick={() => setCurrentPage('quizzes')}
                style={{ 
                  padding: '1rem 1.5rem', 
                  background: 'none', 
                  border: 'none', 
                  borderBottom: '3px solid #10b981',
                  color: '#10b981',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Quizzes
              </button>
            </div>

            {loadingQuizzes ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '4px solid #e5e7eb',
                  borderTopColor: '#10b981',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 1rem'
                }} />
                <p style={{ fontSize: '1rem' }}>Loading quizzes...</p>
              </div>
            ) : studentQuizzes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'white', borderRadius: '0.75rem', color: '#6b7280' }}>
                <Award style={{ width: 64, height: 64, color: '#d1d5db', margin: '0 auto 1rem' }} />
                <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem', fontWeight: 600 }}>No quizzes available yet</p>
                <p style={{ fontSize: '0.875rem' }}>Quizzes from your enrolled courses will appear here</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {studentQuizzes.map(quiz => {
                  const hasAttempted = quiz.lastAttempt !== null;
                  const canRetake = quiz.allowRetake || !hasAttempted;
                  
                  return (
                    <div 
                      key={quiz._id || quiz.id} 
                      style={{ 
                        backgroundColor: 'white', 
                        borderRadius: '0.75rem', 
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                        padding: '1.5rem',
                        transition: 'all 0.3s ease',
                        border: '1px solid #e5e7eb'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'start', marginBottom: '1rem', gap: '1rem' }}>
                        <div style={{ 
                          width: '48px', 
                          height: '48px', 
                          backgroundColor: '#d1fae5', 
                          borderRadius: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Award style={{ width: 28, height: 28, color: '#059669' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.25rem 0' }}>
                            {quiz.title}
                          </h3>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                            {quiz.courseTitle}
                          </p>
                        </div>
                      </div>

                      {quiz.description && (
                        <p style={{ fontSize: '0.9375rem', color: '#4b5563', marginBottom: '1rem', lineHeight: 1.5 }}>
                          {quiz.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.375rem',
                          padding: '0.375rem 0.75rem',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '9999px',
                          fontSize: '0.8125rem',
                          color: '#4b5563',
                          fontWeight: 500
                        }}>
                          <Clock style={{ width: 14, height: 14 }} />
                          {quiz.timerMinutes} min
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.375rem',
                          padding: '0.375rem 0.75rem',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '9999px',
                          fontSize: '0.8125rem',
                          color: '#4b5563',
                          fontWeight: 500
                        }}>
                          <BookOpen style={{ width: 14, height: 14 }} />
                          {quiz.totalQuestions} questions
                        </div>
                      </div>

                      {hasAttempted && quiz.lastAttempt && (
                        <div style={{ 
                          padding: '0.75rem', 
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #86efac',
                          borderRadius: '0.5rem',
                          marginBottom: '1rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#166534' }}>
                              Last Score
                            </span>
                            <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#059669' }}>
                              {quiz.lastAttempt.percentage}%
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#15803d' }}>
                            <span>{quiz.lastAttempt.correctAnswers}/{quiz.totalQuestions} correct</span>
                            <span>{new Date(quiz.lastAttempt.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}

                      {canRetake ? (
                        <button 
                          onClick={() => {
                            setTakingQuiz(quiz);
                            setCurrentQuestionIndex(0);
                            setStudentAnswers({});
                            setQuizTimeRemaining(quiz.timerMinutes * 60);
                            setQuizStartTime(Date.now());
                          }}
                          style={{ 
                            width: '100%', 
                            padding: '0.75rem', 
                            backgroundColor: '#10b981', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '0.5rem', 
                            fontWeight: 600, 
                            cursor: 'pointer',
                            fontSize: '0.9375rem',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#059669';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#10b981';
                          }}
                        >
                          {hasAttempted ? 'Retake Quiz' : 'Start Quiz'}
                        </button>
                      ) : (
                        <div>
                          <div style={{ 
                            padding: '0.75rem',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '0.5rem',
                            marginBottom: '0.75rem',
                            textAlign: 'center'
                          }}>
                            <span style={{ fontSize: '0.875rem', color: '#991b1b', fontWeight: 500 }}>
                              Retake not allowed - Quiz completed
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      
      {currentPage === 'home' && (
        <div>
          {/* Hero Section with Animated Gradient */}
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', 
            color: 'white', 
            padding: '5rem 1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animated background elements */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-10%',
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'float 6s ease-in-out infinite'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-30%',
              left: '-5%',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'float 8s ease-in-out infinite reverse'
            }} />
            
            <div style={{ maxWidth: '80rem', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <h1 style={{ 
                fontSize: '3.5rem', 
                fontWeight: 'bold', 
                marginBottom: '1.5rem',
                textShadow: '0 4px 12px rgba(0,0,0,0.2)',
                animation: 'fadeInUp 1s ease-out'
              }}>
                Learn Without Limits
              </h1>
              <p style={{ 
                fontSize: '1.5rem', 
                marginBottom: '2.5rem', 
                color: '#f3e8ff',
                maxWidth: '48rem',
                margin: '0 auto 2.5rem',
                lineHeight: 1.6,
                animation: 'fadeInUp 1s ease-out 0.2s backwards'
              }}>
                Join thousands of Indian learners mastering new skills with expert-led courses
              </p>
              
              {/* Search Bar with Shadow */}
              <div style={{ 
                maxWidth: '42rem', 
                margin: '0 auto 3rem',
                animation: 'fadeInUp 1s ease-out 0.4s backwards'
              }}>
                <div style={{ position: 'relative' }}>
                  <Search style={{ 
                    position: 'absolute', 
                    left: '1.5rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#9ca3af',
                    width: 24,
                    height: 24
                  }} />
                  <input
                    type="text"
                    placeholder="What do you want to learn today?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '1.25rem 1.5rem 1.25rem 4rem', 
                      borderRadius: '3rem', 
                      border: 'none', 
                      outline: 'none',
                      fontSize: '1.125rem',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 15px 50px rgba(0,0,0,0.4)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = '0 10px 40px rgba(0,0,0,0.3)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                </div>
              </div>
              
              {/* Stats with Icons */}
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                justifyContent: 'center', 
                gap: '3rem',
                animation: 'fadeInUp 1s ease-out 0.6s backwards'
              }}>
                {platformStats.map((stat, index) => (
                  <div key={index} style={{ 
                    textAlign: 'center',
                    transition: 'transform 0.3s ease',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ 
                      fontSize: '3rem', 
                      fontWeight: 'bold',
                      textShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}>
                      {stat.value}
                    </div>
                    <div style={{ 
                      color: '#f3e8ff',
                      fontSize: '1.125rem',
                      fontWeight: 500
                    }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trusted by Section */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem 1.5rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto', textAlign: 'center' }}>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '1rem', 
                marginBottom: '1.5rem',
                fontWeight: 500
              }}>
                Trusted by learners from top Indian institutions
              </p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '3rem',
                flexWrap: 'wrap',
                opacity: 0.6
              }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#374151' }}>IIT • NIT • BITS • VIT • DTU</span>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem 2rem' }}>
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              textAlign: 'center', 
              marginBottom: '1rem',
              color: '#111827'
            }}>
              Explore Top Categories
            </h2>
            <p style={{ 
              textAlign: 'center', 
              color: '#6b7280', 
              fontSize: '1.125rem', 
              marginBottom: '3rem',
              maxWidth: '40rem',
              margin: '0 auto 3rem'
            }}>
              Choose from our wide range of courses designed for Indian professionals
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem', justifyContent: 'center' }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '1rem 2rem',
                    borderRadius: '3rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: selectedCategory === cat.id ? '#4f46e5' : 'white',
                    color: selectedCategory === cat.id ? 'white' : '#374151',
                    boxShadow: selectedCategory === cat.id ? '0 8px 20px rgba(79, 70, 229, 0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
                    fontSize: '1.0625rem',
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== cat.id) {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== cat.id) {
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Courses Section */}
          <div style={{ backgroundColor: '#f9fafb', padding: '4rem 1.5rem' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                    Featured Courses
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: '1.0625rem' }}>
                    Hand-picked courses to boost your career
                  </p>
                </div>
                {/* Special Offer Badge */}
                <div style={{ 
                  backgroundColor: '#fef3c7', 
                  border: '2px solid #fbbf24', 
                  borderRadius: '3rem', 
                  padding: '0.75rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
                }}>
                  <Award style={{ color: '#f59e0b', width: 20, height: 20 }} />
                  <span style={{ fontWeight: 700, color: '#78350f', fontSize: '0.9375rem' }}>
                    Limited Time: 30% OFF on all courses!
                  </span>
                </div>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
                gap: '2rem' 
              }}>
                {filteredCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          </div>

          {/* Student Reviews Section */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '5rem 1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '100%',
              background: 'linear-gradient(180deg, rgba(79, 70, 229, 0.03) 0%, transparent 100%)',
              pointerEvents: 'none'
            }} />
            
            <div style={{ maxWidth: '80rem', margin: '0 auto', position: 'relative', zIndex: 1 }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 'bold', 
                  color: '#111827', 
                  marginBottom: '0.75rem' 
                }}>
                  What Our Students Say
                </h2>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '1.125rem',
                  maxWidth: '36rem',
                  margin: '0 auto'
                }}>
                  Join thousands of satisfied learners across India
                </p>
              </div>
              
              {/* Reviews Container with Scroll */}
              <div style={{ position: 'relative', padding: '0 4rem' }}>
                {/* Left Arrow */}
                <button
                  onClick={() => {
                    const container = document.getElementById('reviews-container');
                    const scrollAmount = 380; // width of card + gap
                    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                  }}
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    border: '2px solid #4f46e5',
                    color: '#4f46e5',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#4f46e5';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#4f46e5';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  <ChevronRight style={{ width: 24, height: 24, transform: 'rotate(180deg)' }} />
                </button>

                {/* Right Arrow */}
                <button
                  onClick={() => {
                    const container = document.getElementById('reviews-container');
                    const scrollAmount = 380; // width of card + gap
                    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                  }}
                  style={{
                    position: 'absolute',
                    right: '0',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    border: '2px solid #4f46e5',
                    color: '#4f46e5',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#4f46e5';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#4f46e5';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  <ChevronRight style={{ width: 24, height: 24 }} />
                </button>

                {/* Scrollable Reviews Container */}
                <div 
                  id="reviews-container"
                  style={{ 
                    display: 'flex',
                    gap: '2rem',
                    overflowX: 'hidden',
                    scrollBehavior: 'smooth',
                    padding: '1rem 0',
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none', // IE and Edge
                    scrollSnapType: 'x mandatory'
                  }}
                >
                  <style>
                    {`
                      #reviews-container::-webkit-scrollbar {
                        display: none; /* Chrome, Safari, Opera */
                      }
                    `}
                  </style>
                  {testimonials.map((testimonial) => (
                    <div 
                      key={testimonial.id}
                      style={{ 
                        backgroundColor: 'white',
                        borderRadius: '1rem',
                        padding: '2rem',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        border: '1px solid #f3f4f6',
                        transition: 'all 0.3s ease',
                        cursor: 'default',
                        position: 'relative',
                        minWidth: '360px',
                        maxWidth: '360px',
                        flexShrink: 0,
                        scrollSnapAlign: 'start'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 12px 35px rgba(79, 70, 229, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                      }}
                    >
                      {/* Quote Icon */}
                      <div style={{ 
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        opacity: 0.1
                      }}>
                        <Quote style={{ width: 48, height: 48, color: '#4f46e5' }} />
                      </div>
                      
                      {/* Rating */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        marginBottom: '1rem'
                      }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            style={{ 
                              width: 18, 
                              height: 18, 
                              color: star <= Math.floor(testimonial.rating) ? '#fbbf24' : (star === Math.ceil(testimonial.rating) && testimonial.rating % 1 !== 0 ? '#fbbf24' : '#d1d5db'), 
                              fill: star <= Math.floor(testimonial.rating) ? '#fbbf24' : (star === Math.ceil(testimonial.rating) && testimonial.rating % 1 !== 0 ? '#fbbf24' : 'none'),
                              opacity: star === Math.ceil(testimonial.rating) && testimonial.rating % 1 !== 0 ? 0.5 : 1
                            }} 
                          />
                        ))}
                        <span style={{ 
                          marginLeft: '0.5rem', 
                          fontWeight: 600, 
                          color: '#111827',
                          fontSize: '0.9375rem'
                        }}>
                          {testimonial.rating.toFixed(1)}
                        </span>
                      </div>
                      
                      {/* Course Badge */}
                      <div style={{ 
                        display: 'inline-block',
                        backgroundColor: '#ede9fe',
                        color: '#5b21b6',
                        padding: '0.375rem 0.875rem',
                        borderRadius: '9999px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        marginBottom: '1rem'
                      }}>
                        {testimonial.course}
                      </div>
                      
                      {/* Review Text */}
                      <p style={{ 
                        fontSize: '1rem', 
                        color: '#4b5563', 
                        lineHeight: 1.7,
                        marginBottom: '1.5rem',
                        fontStyle: 'italic'
                      }}>
                        "{testimonial.text}"
                      </p>
                      
                      {/* Reviewer Info */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #f3f4f6'
                      }}>
                        <div style={{ 
                          width: '48px', 
                          height: '48px', 
                          borderRadius: '50%', 
                          backgroundColor: '#4f46e5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1.125rem',
                          flexShrink: 0
                        }}>
                          {testimonial.image}
                        </div>
                        <div>
                          <div style={{ 
                            fontWeight: 600, 
                            color: '#111827',
                            fontSize: '1rem',
                            marginBottom: '0.125rem'
                          }}>
                            {testimonial.name}
                          </div>
                          <div style={{ 
                            fontSize: '0.875rem', 
                            color: '#6b7280',
                            lineHeight: 1.4
                          }}>
                            {testimonial.role}
                          </div>
                          <div style={{ 
                            fontSize: '0.8125rem', 
                            color: '#9ca3af',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            marginTop: '0.125rem'
                          }}>
                            <Globe style={{ width: 12, height: 12 }} />
                            {testimonial.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Trust Badge */}
              <div style={{ 
                marginTop: '3rem', 
                textAlign: 'center',
                padding: '1.5rem',
                backgroundColor: '#f0fdf4',
                borderRadius: '1rem',
                border: '2px solid #86efac'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <Shield style={{ width: 28, height: 28, color: '#16a34a' }} />
                  <span style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: 600, 
                    color: '#166534'
                  }}>
                    10,000+ Happy Students • 4.8★ Average Rating • 98% Course Completion
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section - Only show when user is not logged in */}
          {!user && (
            <div style={{ 
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              padding: '5rem 1.5rem',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative elements */}
              <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                borderRadius: '50%'
              }} />
              
              <div style={{ 
                maxWidth: '50rem', 
                margin: '0 auto', 
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
              }}>
                <h2 style={{ 
                  fontSize: '2.75rem', 
                  fontWeight: 'bold', 
                  marginBottom: '1.25rem',
                  textShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  Ready to Start Learning?
                </h2>
                <p style={{ 
                  fontSize: '1.25rem', 
                  marginBottom: '2.5rem', 
                  color: '#e9d5ff',
                  lineHeight: 1.6
                }}>
                  Join thousands of Indian students already learning on LearnHub. Get started today!
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => {
                      setAuthMode('signup');
                      setUserType('student');
                      setShowAuthModal(true);
                    }}
                    style={{ 
                      padding: '1rem 2.5rem', 
                      backgroundColor: 'white', 
                      color: '#4f46e5', 
                      border: 'none', 
                      borderRadius: '3rem', 
                      fontWeight: 700, 
                      fontSize: '1.125rem',
                      cursor: 'pointer',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                    }}
                  >
                    Get Started Free
                  </button>
                  <button 
                    onClick={openInstructorModal}
                    style={{ 
                      padding: '1rem 2.5rem', 
                      backgroundColor: 'transparent', 
                      color: 'white', 
                      border: '2px solid white', 
                      borderRadius: '3rem', 
                      fontWeight: 700, 
                      fontSize: '1.125rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#4f46e5';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Become an Instructor
                  </button>
                </div>
              </div>
            </div>
          )}

          <style>
            {`
              @keyframes float {
                0%, 100% {
                  transform: translateY(0) rotate(0deg);
                }
                50% {
                  transform: translateY(-20px) rotate(5deg);
                }
              }
              
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(30px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}
          </style>
        </div>
      )}

      {currentPage === 'course' && selectedCourse && (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '3rem 1.5rem' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <button onClick={() => setCurrentPage('home')} style={{ marginBottom: '2rem', padding: '0.5rem 1rem', background: 'none', border: '1px solid #d1d5db', borderRadius: '0.5rem', cursor: 'pointer' }}>
              ← Back to courses
            </button>
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{selectedCourse.title}</h1>
              <p style={{ fontSize: '1.25rem', color: '#4b5563', marginBottom: '2rem' }}>{selectedCourse.description}</p>
              <button onClick={() => enrollCourse(selectedCourse.id)} style={{ padding: '0.75rem 2rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                Enroll Now - ₹{selectedCourse.price}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Pages - Render ONLY when footerPage is set and HIDE everything else */}
      {footerPage === 'about' && (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', 
            color: 'white', 
            padding: '4rem 1.5rem', 
            position: 'relative', 
            overflow: 'hidden'
          }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1rem',
                animation: 'bounceIn 1s ease-out'
              }}>🎓</div>
              <h1 style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                marginBottom: '1rem',
                background: 'linear-gradient(to right, #ffffff, #c7d2fe, #a5b4fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'slideDown 0.8s ease-out'
              }}>About LearnHub</h1>
              <p style={{ 
                fontSize: '1.25rem', 
                color: '#c7d2fe', 
                maxWidth: '48rem', 
                margin: '0 auto',
                animation: 'fadeIn 1s ease-out 0.3s backwards'
              }}>Transforming education through innovation</p>
            </div>
          </div>
          
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
            {/* Mission Card */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '3rem' }}>🎯</div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Our Mission</h2>
              </div>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#4b5563', marginBottom: '1.5rem' }}>
                At LearnHub, we're on a mission to democratize education across India 🇮🇳. We believe that quality education should be accessible to everyone, regardless of their location or background. Our platform bridges the gap between aspiring learners and expert instructors, creating a vibrant learning community.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#ede9fe', borderRadius: '0.75rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💡</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5', marginBottom: '0.25rem' }}>Innovation</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Cutting-edge learning</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#dbeafe', borderRadius: '0.75rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🤝</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.25rem' }}>Community</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Learn together</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#d1fae5', borderRadius: '0.75rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.25rem' }}>Excellence</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Top-quality content</div>
                </div>
              </div>
            </div>

            {/* What We Offer */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '3rem' }}>✨</div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>What We Offer</h2>
              </div>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#4b5563', marginBottom: '2rem' }}>
                Our comprehensive platform connects ambitious students with industry-expert instructors from across India 🌟. We offer a diverse range of courses designed to help you master in-demand skills and accelerate your career growth.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {[
                  { emoji: '💻', title: 'Development', desc: 'Master programming languages, frameworks, and build real-world projects', color: '#ede9fe' },
                  { emoji: '🎨', title: 'Design', desc: 'Learn UI/UX, graphic design, and create stunning visual experiences', color: '#fce7f3' },
                  { emoji: '💼', title: 'Business', desc: 'Develop entrepreneurial skills, strategy, and leadership abilities', color: '#dbeafe' },
                  { emoji: '📊', title: 'Data Science', desc: 'Explore analytics, machine learning, and data-driven insights', color: '#d1fae5' },
                  { emoji: '📱', title: 'Marketing', desc: 'Master digital marketing, SEO, social media, and brand growth', color: '#fef3c7' },
                  { emoji: '🎯', title: 'Career Growth', desc: 'Interview prep, resume building, and professional development', color: '#fee2e2' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '1.5rem', backgroundColor: item.color, borderRadius: '0.75rem', border: '2px solid transparent', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#4f46e5'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{item.emoji}</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>{item.title}</h3>
                    <p style={{ fontSize: '0.9375rem', color: '#6b7280', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Our Story */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '3rem' }}>📖</div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Our Story</h2>
              </div>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#4b5563', marginBottom: '1.5rem' }}>
                Founded with a vision to revolutionize online education in India, LearnHub started as a small initiative to help students access quality learning resources 📚. Today, we've grown into a thriving community of over <strong>10,000+ students</strong> and <strong>800+ expert instructors</strong> 🎉.
              </p>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#4b5563' }}>
                Our journey has been incredible - from our first 100 students to becoming one of India's most trusted learning platforms 🌟. Every success story, every career transformation, and every milestone achieved by our students fuels our passion to do better every day! 💪
              </p>
            </div>

            {/* Why Choose Us */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '3rem' }}>💎</div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Why Choose LearnHub?</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {[
                  { emoji: '🎓', title: 'Expert Instructors', desc: 'Learn from industry professionals with years of experience' },
                  { emoji: '⚡', title: 'Lifetime Access', desc: 'One-time payment, unlimited learning forever' },
                  { emoji: '📱', title: 'Learn Anywhere', desc: 'Access courses on mobile, tablet, or desktop' },
                  { emoji: '🏅', title: 'Certificates', desc: 'Earn verified certificates upon course completion' },
                  { emoji: '💬', title: '24/7 Support', desc: 'Get help whenever you need it from our support team' },
                  { emoji: '🔄', title: 'Regular Updates', desc: 'Course content updated with latest industry trends' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '1.5rem', border: '2px solid #f3f4f6', borderRadius: '0.75rem', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.backgroundColor = '#f9fafb'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.backgroundColor = 'white'; }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.emoji}</div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>{item.title}</h3>
                    <p style={{ fontSize: '0.9375rem', color: '#6b7280', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {footerPage === 'contact' && (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', 
            color: 'white', 
            padding: '4rem 1.5rem', 
            position: 'relative', 
            overflow: 'hidden' 
          }}>
            {/* Animated particles */}
            <div style={{
              position: 'absolute',
              top: '20%',
              right: '15%',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'float 7s ease-in-out infinite',
              filter: 'blur(50px)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '10%',
              left: '10%',
              width: '350px',
              height: '350px',
              background: 'radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'float 9s ease-in-out infinite reverse',
              filter: 'blur(50px)'
            }} />
            <div style={{
              position: 'absolute',
              top: '60%',
              right: '5%',
              width: '250px',
              height: '250px',
              background: 'radial-gradient(circle, rgba(2, 132, 199, 0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'pulse 5s ease-in-out infinite',
              filter: 'blur(40px)'
            }} />
            
            <div style={{ maxWidth: '80rem', margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1rem',
                animation: 'bounceIn 1s ease-out'
              }}>💬</div>
              <h1 style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                marginBottom: '1rem',
                background: 'linear-gradient(to right, #ffffff, #bae6fd, #7dd3fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'slideDown 0.8s ease-out'
              }}>Get in Touch</h1>
              <p style={{ 
                fontSize: '1.25rem', 
                color: '#bae6fd', 
                maxWidth: '48rem', 
                margin: '0 auto',
                animation: 'fadeIn 1s ease-out 0.3s backwards'
              }}>We're here to help you succeed! 🚀</p>
            </div>
          </div>
          
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
            {/* Contact Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
              <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '1rem', border: '2px solid #86efac', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s', textAlign: 'center' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(16,185,129,0.2)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}>
                <div style={{ width: '64px', height: '64px', backgroundColor: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Mail style={{ width: 32, height: 32, color: '#059669' }} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>📧 Email Us</h3>
                <p style={{ fontSize: '0.9375rem', color: '#6b7280', marginBottom: '1rem' }}>Send us a message anytime!</p>
                <a href="mailto:support@learnhub.com" style={{ color: '#059669', textDecoration: 'none', fontWeight: 700, fontSize: '1.0625rem' }}>support@learnhub.com</a>
                <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#166534', fontWeight: 600 }}>⚡ Response within 24 hours</span>
                </div>
              </div>

              <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '1rem', border: '2px solid #93c5fd', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s', textAlign: 'center' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(59,130,246,0.2)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}>
                <div style={{ width: '64px', height: '64px', backgroundColor: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Phone style={{ width: 32, height: 32, color: '#1e40af' }} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>📞 Call Us</h3>
                <p style={{ fontSize: '0.9375rem', color: '#6b7280', marginBottom: '1rem' }}>Talk to our support team</p>
                <a href="tel:+918001234567" style={{ color: '#1e40af', textDecoration: 'none', fontWeight: 700, fontSize: '1.25rem' }}>+91 1800-123-4567</a>
                <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#1e3a8a', fontWeight: 600 }}>🕐 Mon-Sat, 9 AM - 6 PM IST</span>
                </div>
              </div>

              <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '1rem', border: '2px solid #fbbf24', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s', textAlign: 'center' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(251,191,36,0.2)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}>
                <div style={{ width: '64px', height: '64px', backgroundColor: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Globe style={{ width: 32, height: 32, color: '#92400e' }} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>📍 Visit Us</h3>
                <p style={{ fontSize: '0.9375rem', color: '#6b7280', marginBottom: '1rem' }}>Our headquarters</p>
                <p style={{ color: '#78350f', fontWeight: 700, fontSize: '1.0625rem', margin: 0 }}>Lucknow, Uttar Pradesh</p>
                <p style={{ color: '#78350f', fontWeight: 600, fontSize: '0.9375rem', marginTop: '0.25rem' }}>India 🇮🇳</p>
              </div>
            </div>

            {/* Additional Support Info */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem', textAlign: 'center' }}>
                🤝 How Can We Help You?
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {[
                  { emoji: '❓', title: 'Course Questions', desc: 'Get help with course content, materials, and assignments' },
                  { emoji: '💳', title: 'Payment Issues', desc: 'Resolve billing, refunds, and payment-related queries' },
                  { emoji: '🔧', title: 'Technical Support', desc: 'Fix login, video playback, or platform issues' },
                  { emoji: '🎓', title: 'Certification Help', desc: 'Assistance with certificates and completion records' },
                  { emoji: '👨‍🏫', title: 'Become Instructor', desc: 'Learn how to start teaching on LearnHub' },
                  { emoji: '💡', title: 'General Inquiries', desc: 'Any other questions? We\'re here to help!' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '1.5rem', border: '2px solid #f3f4f6', borderRadius: '0.75rem', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.backgroundColor = '#f0fdf4'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.backgroundColor = 'white'; }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.emoji}</div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>{item.title}</h3>
                    <p style={{ fontSize: '0.9375rem', color: '#6b7280', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Response Promise */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center', border: '3px solid #10b981' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                Our Support Promise
              </h3>
              <p style={{ fontSize: '1.125rem', color: '#6b7280', lineHeight: 1.8, maxWidth: '48rem', margin: '0 auto' }}>
                We're committed to providing you with the best support experience! 🌟 Our team responds to all queries within 24 hours, and we're constantly working to make your learning journey smoother and more enjoyable. Your success is our success! 🎯
              </p>
            </div>
          </div>
        </div>
      )}

      {footerPage === 'privacy' && (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #18181b 100%)', 
            color: 'white', 
            padding: '4rem 1.5rem', 
            position: 'relative', 
            overflow: 'hidden' 
          }}>
            {/* Glowing orbs */}
            <div style={{
              position: 'absolute',
              top: '15%',
              left: '20%',
              width: '350px',
              height: '350px',
              background: 'radial-gradient(circle, rgba(244, 114, 182, 0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'float 8s ease-in-out infinite',
              filter: 'blur(50px)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '20%',
              right: '15%',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'float 10s ease-in-out infinite reverse',
              filter: 'blur(60px)'
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              right: '30%',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(219, 39, 119, 0.2) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'pulse 7s ease-in-out infinite',
              filter: 'blur(45px)'
            }} />
            
            <div style={{ maxWidth: '80rem', margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1rem',
                animation: 'bounceIn 1s ease-out'
              }}>🔒</div>
              <h1 style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                marginBottom: '1rem',
                background: 'linear-gradient(to right, #ffffff, #fbcfe8, #f9a8d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'slideDown 0.8s ease-out'
              }}>Privacy Policy</h1>
              <p style={{ 
                fontSize: '1.25rem', 
                color: '#fbcfe8', 
                maxWidth: '48rem', 
                margin: '0 auto',
                animation: 'fadeIn 1s ease-out 0.3s backwards'
              }}>Your privacy matters to us 🛡️</p>
            </div>
          </div>
          
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem', textAlign: 'center', border: '2px solid #c7d2fe' }}>
              <p style={{ fontSize: '0.9375rem', color: '#6b7280' }}>
                📅 <strong>Last updated:</strong> {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Introduction */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem' }}>👋</div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Welcome!</h2>
              </div>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#4b5563' }}>
                At LearnHub, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information. We're committed to maintaining the trust you place in us! 🤝
              </p>
            </div>

            {/* Information We Collect */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.5rem' }}>📝</div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Information We Collect</h2>
              </div>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {[
                  { emoji: '👤', title: 'Personal Information', desc: 'Name, email address, phone number, and profile details you provide during registration' },
                  { emoji: '💳', title: 'Payment Information', desc: 'Billing details processed securely through Razorpay (we never store your card information)' },
                  { emoji: '📊', title: 'Usage Data', desc: 'Course progress, quiz scores, learning activities, and platform interactions' },
                  { emoji: '🌐', title: 'Technical Data', desc: 'IP address, browser type, device information, and cookies for improving user experience' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem', border: '2px solid #e5e7eb', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.backgroundColor = '#ede9fe'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = '#f9fafb'; }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                      <div style={{ fontSize: '2rem' }}>{item.emoji}</div>
                      <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>{item.title}</h3>
                        <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: 1.6 }}>{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How We Use Your Information */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.5rem' }}>⚙️</div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>How We Use Your Information</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {[
                  { emoji: '🎓', title: 'Deliver Courses', desc: 'Provide access to learning materials and track your progress' },
                  { emoji: '💬', title: 'Communication', desc: 'Send course updates, announcements, and support responses' },
                  { emoji: '🔧', title: 'Improve Platform', desc: 'Analyze usage patterns to enhance features and user experience' },
                  { emoji: '🛡️', title: 'Security', desc: 'Protect your account and prevent fraudulent activities' },
                  { emoji: '📧', title: 'Marketing', desc: 'Send promotional offers and new course recommendations (you can opt-out)' },
                  { emoji: '⚖️', title: 'Legal Compliance', desc: 'Meet legal obligations and enforce our terms of service' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '1.5rem', border: '2px solid #e5e7eb', borderRadius: '0.75rem', textAlign: 'center', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.emoji}</div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>{item.title}</h3>
                    <p style={{ fontSize: '0.9375rem', color: '#6b7280', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Security */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem', border: '3px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem' }}>🔐</div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Data Security</h2>
              </div>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#4b5563', marginBottom: '1.5rem' }}>
                We implement industry-standard security measures to protect your data:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {['🔒 SSL Encryption', '🛡️ Secure Servers', '🔑 Password Protection', '👁️ Regular Audits', '💳 PCI Compliance', '⚡ Real-time Monitoring'].map((item, idx) => (
                  <div key={idx} style={{ padding: '1rem', backgroundColor: '#d1fae5', borderRadius: '0.5rem', textAlign: 'center', fontWeight: 600, color: '#065f46' }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Your Rights */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.5rem' }}>✊</div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Your Rights</h2>
              </div>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#4b5563', marginBottom: '1.5rem' }}>
                You have complete control over your data! You can:
              </p>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {[
                  '✅ Access and download your personal data',
                  '✏️ Update or correct your information',
                  '🗑️ Request deletion of your account',
                  '🚫 Opt-out of marketing communications',
                  '📊 Request a copy of your learning data',
                  '🔒 Restrict data processing'
                ].map((right, idx) => (
                  <div key={idx} style={{ padding: '1rem', backgroundColor: '#ede9fe', borderRadius: '0.5rem', fontSize: '1.0625rem', color: '#4c1d95', fontWeight: 500 }}>
                    {right}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center', border: '2px solid #4f46e5' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💬</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                Questions About Privacy?
              </h3>
              <p style={{ fontSize: '1.0625rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                We're here to help! Contact our privacy team at:
              </p>
              <a href="mailto:privacy@learnhub.com" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 700, fontSize: '1.25rem' }}>
                privacy@learnhub.com
              </a>
            </div>
          </div>
        </div>
      )}

      {footerPage === 'terms' && (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)', 
            color: 'white', 
            padding: '4rem 1.5rem', 
            position: 'relative', 
            overflow: 'hidden' 
          }}>
            {/* Animated waves */}
            <div style={{
              position: 'absolute',
              top: '25%',
              left: '10%',
              width: '450px',
              height: '450px',
              background: 'radial-gradient(circle, rgba(129, 140, 248, 0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'float 9s ease-in-out infinite',
              filter: 'blur(55px)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '15%',
              right: '10%',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'float 11s ease-in-out infinite reverse',
              filter: 'blur(50px)'
            }} />
            <div style={{
              position: 'absolute',
              top: '55%',
              left: '45%',
              width: '350px',
              height: '350px',
              background: 'radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'pulse 6s ease-in-out infinite',
              filter: 'blur(45px)'
            }} />
            
            <div style={{ maxWidth: '80rem', margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1rem',
                animation: 'bounceIn 1s ease-out'
              }}>📜</div>
              <h1 style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                marginBottom: '1rem',
                background: 'linear-gradient(to right, #ffffff, #c7d2fe, #a5b4fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'slideDown 0.8s ease-out'
              }}>Terms & Conditions</h1>
              <p style={{ 
                fontSize: '1.25rem', 
                color: '#c7d2fe', 
                maxWidth: '48rem', 
                margin: '0 auto',
                animation: 'fadeIn 1s ease-out 0.3s backwards'
              }}>Your guide to using LearnHub responsibly ⚖️</p>
            </div>
          </div>
          
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem', textAlign: 'center', border: '2px solid #c7d2fe' }}>
              <p style={{ fontSize: '0.9375rem', color: '#6b7280' }}>
                📅 <strong>Last updated:</strong> {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Welcome Section */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem' }}>👋</div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Welcome to LearnHub!</h2>
              </div>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#4b5563' }}>
                These Terms & Conditions govern your use of LearnHub's platform and services. By creating an account or using our services, you agree to these terms. Please read them carefully! 📖
              </p>
            </div>

            {/* Acceptance of Terms */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.5rem' }}>✅</div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Acceptance of Terms</h2>
              </div>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#4b5563', marginBottom: '1.5rem' }}>
                By accessing LearnHub, you acknowledge that you have read, understood, and agree to be bound by these terms. If you don't agree with any part, please don't use our platform! 🚫
              </p>
              <div style={{ padding: '1.5rem', backgroundColor: '#ede9fe', borderRadius: '0.75rem', border: '2px solid #c7d2fe' }}>
                <p style={{ fontSize: '1rem', color: '#5b21b6', margin: 0, lineHeight: 1.6 }}>
                  <strong>Important:</strong> We may update these terms occasionally. Continued use after changes means you accept the updated terms. 🔄
                </p>
              </div>
            </div>

            {/* User Accounts */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.5rem' }}>👤</div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>User Accounts & Responsibilities</h2>
              </div>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {[
                  { emoji: '🔐', title: 'Account Security', desc: 'You\'re responsible for maintaining the confidentiality of your password and account. Don\'t share your credentials!' },
                  { emoji: '📧', title: 'Accurate Information', desc: 'Provide accurate, complete information during registration. Keep your profile updated.' },
                  { emoji: '🚫', title: 'One Account Per User', desc: 'Create only one account. Multiple accounts may result in suspension.' },
                  { emoji: '👨‍🎓', title: 'Age Requirement', desc: 'You must be at least 13 years old to use LearnHub. Users under 18 need parental consent.' },
                  { emoji: '⚠️', title: 'Account Activity', desc: 'You\'re responsible for all activities under your account. Report unauthorized access immediately!' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem', border: '2px solid #e5e7eb', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.backgroundColor = '#ede9fe'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = '#f9fafb'; }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                      <div style={{ fontSize: '2rem' }}>{item.emoji}</div>
                      <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>{item.title}</h3>
                        <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: 1.6 }}>{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Enrollment */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.5rem' }}>🎓</div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Course Enrollment & Access</h2>
              </div>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#4b5563', marginBottom: '1.5rem' }}>
                When you enroll in a course, you get:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {['✨ Lifetime access to course content', '📱 Access on any device', '📊 Progress tracking', '🏆 Certificate on completion', '💬 Instructor Q&A support', '🔄 Free content updates'].map((item, idx) => (
                  <div key={idx} style={{ padding: '1rem', backgroundColor: '#dbeafe', borderRadius: '0.5rem', fontSize: '1rem', color: '#1e40af', fontWeight: 500, textAlign: 'center' }}>
                    {item}
                  </div>
                ))}
              </div>
              <div style={{ padding: '1.5rem', backgroundColor: '#fef3c7', borderRadius: '0.75rem', border: '2px solid #fbbf24' }}>
                <p style={{ fontSize: '1rem', color: '#78350f', margin: 0, lineHeight: 1.6 }}>
                  <strong>⚠️ Important:</strong> Course access is for personal use only. Sharing accounts or course content is strictly prohibited and may result in account termination.
                </p>
              </div>
            </div>

            {/* Payment Terms */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.5rem' }}>💳</div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Payment & Pricing</h2>
              </div>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ padding: '1.5rem', border: '2px solid #e5e7eb', borderRadius: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>💰 Pricing</h3>
                  <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: 1.6 }}>
                    All prices are in Indian Rupees (INR). Prices may change, but enrolled courses maintain their original price.
                  </p>
                </div>
                <div style={{ padding: '1.5rem', border: '2px solid #e5e7eb', borderRadius: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>💳 Payment Processing</h3>
                  <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: 1.6 }}>
                    We use Razorpay for secure payment processing. All transactions are encrypted and protected by industry-standard security.
                  </p>
                </div>
                <div style={{ padding: '1.5rem', border: '2px solid #e5e7eb', borderRadius: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>🔄 Refunds</h3>
                  <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: 1.6 }}>
                    30-day money-back guarantee applies. See our Refund Policy for details. No refunds after 30 days of purchase.
                  </p>
                </div>
              </div>
            </div>

            {/* Prohibited Activities */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem', border: '3px solid #ef4444' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.5rem' }}>🚫</div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Prohibited Activities</h2>
              </div>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#4b5563', marginBottom: '1.5rem' }}>
                You may NOT:
              </p>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {[
                  '❌ Share your account with others',
                  '❌ Download or distribute course content',
                  '❌ Use content for commercial purposes',
                  '❌ Reverse engineer or copy our platform',
                  '❌ Post harmful, offensive, or illegal content',
                  '❌ Attempt to hack or disrupt our services',
                  '❌ Create fake accounts or impersonate others',
                  '❌ Spam instructors or other users'
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '0.5rem', fontSize: '1.0625rem', color: '#991b1b', fontWeight: 500 }}>
                    {item}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: '#fef2f2', borderRadius: '0.75rem', border: '2px solid #fca5a5' }}>
                <p style={{ fontSize: '1rem', color: '#7f1d1d', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
                  ⚠️ Violation of these terms may result in immediate account suspension or termination without refund!
                </p>
              </div>
            </div>

            {/* Intellectual Property */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.5rem' }}>©️</div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Intellectual Property</h2>
              </div>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#4b5563', marginBottom: '1.5rem' }}>
                All content on LearnHub (courses, videos, text, graphics, logos) is protected by copyright and owned by LearnHub or our instructors. You receive a limited, non-transferable license to access content for personal learning only. 📚
              </p>
            </div>

            {/* Contact */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center', border: '2px solid #4f46e5' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📧</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                Questions About Terms?
              </h3>
              <p style={{ fontSize: '1.0625rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                We're here to help clarify anything!
              </p>
              <a href="mailto:legal@learnhub.com" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 700, fontSize: '1.25rem' }}>
                legal@learnhub.com
              </a>
            </div>
          </div>
        </div>
      )}

      {footerPage === 'refund' && (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #14532d 100%)', 
            color: 'white', 
            padding: '4rem 1.5rem', 
            position: 'relative', 
            overflow: 'hidden' 
          }}>
            {/* Glowing spheres */}
            <div style={{
              position: 'absolute',
              top: '10%',
              right: '12%',
              width: '380px',
              height: '380px',
              background: 'radial-gradient(circle, rgba(134, 239, 172, 0.35) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'float 8s ease-in-out infinite',
              filter: 'blur(50px)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '12%',
              left: '8%',
              width: '420px',
              height: '420px',
              background: 'radial-gradient(circle, rgba(74, 222, 128, 0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'float 10s ease-in-out infinite reverse',
              filter: 'blur(55px)'
            }} />
            <div style={{
              position: 'absolute',
              top: '45%',
              left: '40%',
              width: '350px',
              height: '350px',
              background: 'radial-gradient(circle, rgba(34, 197, 94, 0.25) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'pulse 7s ease-in-out infinite',
              filter: 'blur(48px)'
            }} />
            
            <div style={{ maxWidth: '80rem', margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1rem',
                animation: 'bounceIn 1s ease-out'
              }}>💰</div>
              <h1 style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                marginBottom: '1rem',
                background: 'linear-gradient(to right, #ffffff, #bbf7d0, #86efac)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'slideDown 0.8s ease-out'
              }}>Refund Policy</h1>
              <p style={{ 
                fontSize: '1.25rem', 
                color: '#bbf7d0', 
                maxWidth: '48rem', 
                margin: '0 auto',
                animation: 'fadeIn 1s ease-out 0.3s backwards'
              }}>Your satisfaction is our priority! 🌟</p>
            </div>
          </div>
          
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem', textAlign: 'center', border: '2px solid #86efac' }}>
              <p style={{ fontSize: '0.9375rem', color: '#6b7280' }}>
                📅 <strong>Last updated:</strong> {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* 30-Day Guarantee - Hero Card */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem', border: '3px solid #10b981' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ 
                  width: '96px', 
                  height: '96px', 
                  margin: '0 auto 1.5rem',
                  borderRadius: '50%',
                  backgroundColor: '#d1fae5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '4rem' }}>✅</span>
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', marginBottom: '1rem' }}>
                  30-Day Money-Back Guarantee
                </h2>
                <p style={{ fontSize: '1.25rem', color: '#4b5563', lineHeight: 1.8, maxWidth: '48rem', margin: '0 auto' }}>
                  We're so confident you'll love our courses that we offer a <strong>no-questions-asked 30-day refund policy</strong>! Try any course risk-free and see the difference quality education makes. 🎓
                </p>
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.5rem' }}>📋</div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Refund Eligibility</h2>
              </div>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#4b5563', marginBottom: '1.5rem' }}>
                To be eligible for a refund, your request must meet these conditions:
              </p>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {[
                  { emoji: '⏰', title: 'Within 30 Days', desc: 'Request must be made within 30 days of course purchase', eligible: true },
                  { emoji: '📚', title: 'Course Progress', desc: 'You can request a refund regardless of how much content you\'ve accessed', eligible: true },
                  { emoji: '💳', title: 'Payment Method', desc: 'Refund will be processed to the original payment method', eligible: true },
                  { emoji: '🎯', title: 'One Refund Per Course', desc: 'Each course is eligible for one refund per student', eligible: true }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', borderRadius: '0.75rem', border: '2px solid #86efac', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(8px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.2)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                      <div style={{ fontSize: '2rem' }}>{item.emoji}</div>
                      <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#065f46', marginBottom: '0.5rem' }}>{item.title}</h3>
                        <p style={{ fontSize: '1rem', color: '#166534', lineHeight: 1.6 }}>{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Request */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.5rem' }}>🔄</div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>How to Request a Refund</h2>
              </div>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#4b5563', marginBottom: '2rem' }}>
                Getting your refund is quick and easy! Just follow these simple steps:
              </p>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {[
                  { step: '1️⃣', title: 'Contact Support', desc: 'Email us at support@learnhub.com with your order details', action: 'Send Email' },
                  { step: '2️⃣', title: 'Provide Information', desc: 'Include your name, registered email, course name, and reason for refund (optional)', action: 'What to Include' },
                  { step: '3️⃣', title: 'Receive Confirmation', desc: 'You\'ll get a confirmation email within 24 hours', action: 'Instant Reply' },
                  { step: '4️⃣', title: 'Get Your Refund', desc: 'Refund processed to original payment method within 5-7 business days', action: 'Quick Process' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem', border: '2px solid #e5e7eb', transition: 'all 0.3s', display: 'flex', alignItems: 'start', gap: '1.5rem' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.backgroundColor = '#f0fdf4'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.backgroundColor = '#f9fafb'; }}>
                    <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>{item.step}</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>{item.title}</h3>
                      <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: 1.6, marginBottom: '0.75rem' }}>{item.desc}</p>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '0.375rem 0.875rem',
                        backgroundColor: '#d1fae5',
                        color: '#065f46',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}>
                        {item.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-Refundable Items */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem', border: '2px solid #fbbf24' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.5rem' }}>⚠️</div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Non-Refundable Situations</h2>
              </div>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#4b5563', marginBottom: '1.5rem' }}>
                While we strive to make everyone happy, refunds cannot be issued in these cases:
              </p>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {[
                  '🚫 Requests made after 30 days of purchase',
                  '🚫 Courses purchased more than once by the same student',
                  '🚫 Violations of our Terms & Conditions',
                  '🚫 Account suspension due to policy violations',
                  '🚫 Downloaded certificates (indicates course completion)'
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem', fontSize: '1.0625rem', color: '#78350f', fontWeight: 500, border: '1px solid #fbbf24' }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Processing Time */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.5rem' }}>⚡</div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Refund Processing Timeline</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {[
                  { emoji: '📧', title: 'Response Time', time: '24 hours', desc: 'We acknowledge your refund request' },
                  { emoji: '✅', title: 'Approval', time: '1-2 days', desc: 'Request reviewed and approved' },
                  { emoji: '💳', title: 'Processing', time: '5-7 days', desc: 'Refund appears in your account' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#ede9fe', borderRadius: '0.75rem', border: '2px solid #c7d2fe', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#7c3aed'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#c7d2fe'; }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{item.emoji}</div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#5b21b6', marginBottom: '0.5rem' }}>{item.title}</h3>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '0.5rem' }}>{item.time}</div>
                    <p style={{ fontSize: '0.875rem', color: '#6b21a8', lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notes */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.5rem' }}>💡</div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Important Notes</h2>
              </div>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {[
                  { icon: '🔐', text: 'Your account remains active - you can enroll in other courses anytime' },
                  { icon: '💬', text: 'We value your feedback! Tell us why you\'re requesting a refund to help us improve' },
                  { icon: '🎯', text: 'Partial refunds are not available - it\'s all or nothing within 30 days' },
                  { icon: '🌟', text: 'Changed your mind? You can always re-enroll in the course later!' }
                ].map((note, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{note.icon}</div>
                    <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: 1.6, margin: 0 }}>{note.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact CTA */}
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center', border: '2px solid #10b981' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤝</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                Need Help with a Refund?
              </h3>
              <p style={{ fontSize: '1.0625rem', color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Our support team is here to make the process smooth and hassle-free!
              </p>
              <a 
                href="mailto:support@learnhub.com" 
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 2rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(16,185,129,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Mail style={{ width: 20, height: 20 }} />
                Contact Support
              </a>
            </div>
          </div>
        </div>
      )}

{footerPage === 'developer' && (
  <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
    <div style={{ 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', 
      color: 'white', 
      padding: '4rem 1.5rem', 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      {/* Animated particles */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite',
        filter: 'blur(50px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '15%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 10s ease-in-out infinite reverse',
        filter: 'blur(55px)'
      }} />
      
      <div style={{ maxWidth: '80rem', margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ 
          fontSize: '4rem', 
          marginBottom: '1rem',
          animation: 'bounceIn 1s ease-out'
        }}>👨‍💻</div>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          background: 'linear-gradient(to right, #ffffff, #c7d2fe, #a5b4fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'slideDown 0.8s ease-out'
        }}>Developer Portal</h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#c7d2fe', 
          maxWidth: '48rem', 
          margin: '0 auto',
          animation: 'fadeIn 1s ease-out 0.3s backwards'
        }}>Building the future of education, one line at a time 🚀</p>
      </div>
    </div>
    
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 1.5rem' }}>
 

      {/* Platform Statistics */}
      <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem' }}>📊</div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Platform Statistics</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {[
            { emoji: '👨‍🎓', value: '10,000+', label: 'Active Students', color: '#4f46e5' },
            { emoji: '👨‍🏫', value: '800+', label: 'Expert Instructors', color: '#059669' },
            { emoji: '📚', value: '500+', label: 'Live Courses', color: '#f59e0b' },
            { emoji: '⭐', value: '4.8/5', label: 'Average Rating', color: '#dc2626' }
          ].map((stat, idx) => (
            <div key={idx} style={{ 
              textAlign: 'center', 
              padding: '1.5rem', 
              backgroundColor: '#f9fafb', 
              borderRadius: '0.75rem',
              border: '2px solid #e5e7eb',
              transition: 'all 0.3s'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = stat.color;
              e.currentTarget.style.boxShadow = `0 8px 20px ${stat.color}33`;
            }} onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.emoji}</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color, marginBottom: '0.25rem' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem' }}>⚙️</div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Technology Stack</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {[
            { emoji: '⚛️', title: 'React.js', desc: 'Dynamic frontend with modern UI/UX', color: '#61dafb' },
            { emoji: '🟢', title: 'Node.js', desc: 'Scalable backend infrastructure', color: '#68a063' },
            { emoji: '🍃', title: 'MongoDB', desc: 'Flexible NoSQL database', color: '#4db33d' },
            { emoji: '🔐', title: 'JWT Auth', desc: 'Secure authentication system', color: '#4f46e5' },
            { emoji: '💳', title: 'Razorpay', desc: 'Payment gateway integration', color: '#0c2f54' },
            { emoji: '☁️', title: 'Cloud Storage', desc: 'Video & content delivery', color: '#f59e0b' }
          ].map((tech, idx) => (
            <div key={idx} style={{ 
              padding: '1.5rem', 
              border: '2px solid #e5e7eb', 
              borderRadius: '0.75rem',
              transition: 'all 0.3s'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = tech.color;
              e.currentTarget.style.backgroundColor = `${tech.color}10`;
              e.currentTarget.style.transform = 'translateY(-4px)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{tech.emoji}</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>{tech.title}</h3>
              <p style={{ fontSize: '0.9375rem', color: '#6b7280', lineHeight: 1.6 }}>{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Development Team */}
      <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem' }}>👥</div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Our Development Team</h2>
        </div>
        <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#4b5563', marginBottom: '2rem' }}>
          LearnHub is built and maintained by a dedicated team of developers, designers, and educators passionate about transforming online education in India. Our team works around the clock to ensure a seamless learning experience for all users.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            '🎨 UI/UX Design Team',
            '💻 Frontend Developers',
            '🖥️ Backend Engineers',
            '🔒 Security Specialists',
            '📊 Data Analysts',
            '🎯 Product Managers',
            '🐛 QA Testing Team',
            '☁️ DevOps Engineers'
          ].map((role, idx) => (
            <div key={idx} style={{ 
              padding: '1rem', 
              backgroundColor: '#ede9fe', 
              borderRadius: '0.5rem', 
              textAlign: 'center', 
              fontWeight: 600, 
              color: '#5b21b6',
              fontSize: '0.9375rem'
            }}>
              {role}
            </div>
          ))}
        </div>
      </div>

      {/* API & Integration */}
      <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem' }}>🔌</div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>API & Integrations</h2>
        </div>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {[
            { icon: '🔐', title: 'RESTful API', desc: 'Comprehensive API endpoints for all platform operations', status: 'Active' },
            { icon: '💳', title: 'Payment Integration', desc: 'Secure Razorpay payment gateway integration', status: 'Active' },
            { icon: '📧', title: 'Email Service', desc: 'Automated email notifications and OTP verification', status: 'Active' },
            { icon: '☁️', title: 'Cloud Storage', desc: 'Scalable video and content storage system', status: 'Active' },
            { icon: '📊', title: 'Analytics Dashboard', desc: 'Real-time data analytics and reporting', status: 'Active' }
          ].map((api, idx) => (
            <div key={idx} style={{ 
              padding: '1.5rem', 
              backgroundColor: '#f0fdf4', 
              borderRadius: '0.75rem',
              border: '2px solid #86efac',
              display: 'flex',
              alignItems: 'start',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '2rem', flexShrink: 0 }}>{api.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#065f46', margin: 0 }}>{api.title}</h3>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    backgroundColor: '#10b981', 
                    color: 'white', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600 
                  }}>
                    {api.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.9375rem', color: '#166534', lineHeight: 1.6, margin: 0 }}>{api.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Features */}
      <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '3px solid #10b981' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem' }}>🛡️</div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Security & Compliance</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {[
            { emoji: '🔒', title: 'SSL Encryption', desc: 'End-to-end encrypted connections' },
            { emoji: '🔑', title: 'JWT Authentication', desc: 'Secure token-based auth system' },
            { emoji: '🛡️', title: 'Data Protection', desc: 'GDPR compliant data handling' },
            { emoji: '👁️', title: 'Activity Monitoring', desc: '24/7 security surveillance' },
            { emoji: '🚨', title: 'Threat Detection', desc: 'Real-time threat analysis' },
            { emoji: '💾', title: 'Backup System', desc: 'Daily automated backups' }
          ].map((feature, idx) => (
            <div key={idx} style={{ 
              padding: '1.5rem', 
              textAlign: 'center', 
              backgroundColor: '#f0fdf4', 
              borderRadius: '0.75rem',
              border: '2px solid #86efac'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{feature.emoji}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#065f46', marginBottom: '0.5rem' }}>{feature.title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#166534', lineHeight: 1.5 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#d1fae5', borderRadius: '0.75rem' }}>
          <p style={{ fontSize: '1rem', color: '#065f46', margin: 0, fontWeight: 600 }}>
            🔐 All systems are monitored and secured with industry-standard protocols
          </p>
        </div>
      </div>
    </div>
{/* Compact Admin Access Card */}
<div style={{ 
  backgroundColor: 'white', 
  borderRadius: '0.75rem', 
  padding: '1.5rem', 
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
  marginTop: '2rem',
  border: '2px solid #4f46e5',
  textAlign: 'center',
  maxWidth: '600px',
  margin: '2rem auto 0'
}}>
  <div style={{ 
    width: '56px', 
    height: '56px', 
    margin: '0 auto 0.75rem',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
  }}>
    <Shield style={{ width: 28, height: 28, color: 'white' }} />
  </div>
  
  <h2 style={{ 
    fontSize: '1.25rem', 
    fontWeight: 'bold', 
    color: '#111827', 
    marginBottom: '0.375rem'
  }}>
    Administrative Access
  </h2>
  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem', lineHeight: 1.5 }}>
    Manage platform operations, monitor analytics, and control system settings
  </p>
  
  <button
    onClick={() => {
      setCurrentPage('admin-dashboard');
      setFooterPage(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }}
    style={{
      padding: '0.625rem 1.5rem',
      fontSize: '0.9375rem',
      fontWeight: 600,
      color: 'white',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
      transition: 'all 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.4)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)';
    }}
  >
    <Lock style={{ width: 16, height: 16 }} />
    <span>Admin Login</span>
    <ChevronRight style={{ width: 16, height: 16 }} />
  </button>
  
  <p style={{ fontSize: '0.6875rem', color: '#9ca3af', marginTop: '0.75rem' }}>
    🔐 Authorized personnel only
  </p>
</div>
    {/* Add rotation animation for gradient */}
    <style>
      {`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
)}

      {/* Professional Footer - Light Theme - Compact */}
      <footer style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(229, 231, 235, 0.8)',
        marginTop: '5rem',
        boxShadow: '0 -1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem 1rem' }}>
          {/* Footer Main Content */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            {/* About Section - Compact */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <BookOpen style={{ color: '#4f46e5', width: 24, height: 24 }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>LearnHub</h3>
              </div>
              <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, color: '#6b7280', marginBottom: '0.5rem' }}>
                Empowering Indian learners with world-class education.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>
                Quick Links
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  { label: 'About Us', page: 'about' },
                  { label: 'Become an Instructor', onClick: openInstructorModal },
                  { label: 'Developer', page: 'developer' }, // ADD THIS LINE
                  { label: 'Contact Support', page: 'contact' }
                ].map((link, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>
                    <button
                      onClick={() => {
                        if (link.page) {
                          setCurrentPage(null); // Clear current page
                          setFooterPage(link.page);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else if (link.onClick) {
                          link.onClick();
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        padding: 0,
                        textAlign: 'left',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#4f46e5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#6b7280';
                      }}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>
                Legal
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  { label: 'Privacy Policy', page: 'privacy' },
                  { label: 'Terms & Conditions', page: 'terms' },
                  { label: 'Refund Policy', page: 'refund' }
                ].map((item, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setCurrentPage(null); // Clear current page
                        setFooterPage(item.page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        padding: 0,
                        textAlign: 'left',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#4f46e5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#6b7280';
                      }}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info - Compact */}
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>
                Get in Touch
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail style={{ width: 16, height: 16, color: '#4f46e5' }} />
                  <a href="mailto:support@learnhub.com" style={{ fontSize: '0.8125rem', color: '#6b7280', textDecoration: 'none' }}>
                    support@learnhub.com
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone style={{ width: 16, height: 16, color: '#10b981' }} />
                  <a href="tel:+918001234567" style={{ fontSize: '0.8125rem', color: '#6b7280', textDecoration: 'none' }}>
                    +91 1800-123-4567
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Globe style={{ width: 16, height: 16, color: '#4f46e5' }} />
                  <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                    Lucknow, India
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom - Compact */}
          <div style={{ 
            paddingTop: '1rem',
            borderTop: '1px solid rgba(229, 231, 235, 0.8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              © {new Date().getFullYear()} LearnHub. All rights reserved.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                <Shield style={{ width: 12, height: 12, color: '#10b981' }} />
                <span>Secure</span>
              </div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                <Award style={{ width: 12, height: 12, color: '#4f46e5' }} />
                <span>Certified</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;