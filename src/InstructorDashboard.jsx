import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Award, TrendingUp, Plus, Edit, Trash2, Play, Eye, Clock, Star, Search, Filter, BarChart, DollarSign, Target, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;


const InstructorDashboard = ({ user, token, showNotification, setCurrentPage, convertImageToBase64, fetchCourses }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [viewingCourse, setViewingCourse] = useState(null);
  const [showAnalyticsPage, setShowAnalyticsPage] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [showCourseDetail, setShowCourseDetail] = useState(null);
  const [activeCourseSection, setActiveCourseSection] = useState('lectures');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(false);
  
  // Add Lecture States
  const [showAddLecture, setShowAddLecture] = useState(false);
  const [lectureForm, setLectureForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: '',
    thumbnail: '',
    order: 0
  });
  const [videoUploadMethod, setVideoUploadMethod] = useState('url'); // 'url' or 'upload'
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [addingLecture, setAddingLecture] = useState(false);
  const [lectureDurationFormat, setLectureDurationFormat] = useState('time');
  const [lectureTimeValues, setLectureTimeValues] = useState({ hours: '', minutes: '', seconds: '' });
  const [lectures, setLectures] = useState([]);
  const [lectureThumbnailFile, setLectureThumbnailFile] = useState(null);
  const [lectureThumbnailPreview, setLectureThumbnailPreview] = useState('');
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  
  // Enrolled Students States
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  // Edit Lecture States
  const [editingLecture, setEditingLecture] = useState(null);
  const [editLectureForm, setEditLectureForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnail: ''
  });
  const [editLectureThumbnailFile, setEditLectureThumbnailFile] = useState(null);
  const [editLectureThumbnailPreview, setEditLectureThumbnailPreview] = useState('');
  const [updatingLecture, setUpdatingLecture] = useState(false);
  const [editVideoUploadMethod, setEditVideoUploadMethod] = useState('url');
  const [editVideoFile, setEditVideoFile] = useState(null);
  const [editVideoPreview, setEditVideoPreview] = useState('');
  const [editUploadingVideo, setEditUploadingVideo] = useState(false);
  const [editUploadProgress, setEditUploadProgress] = useState(0);
  
  // Delete Lecture States
  const [deletingLecture, setDeletingLecture] = useState(null);
  const [showDeleteLectureConfirm, setShowDeleteLectureConfirm] = useState(false);
  
  // Quiz States
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    timerMinutes: 30,
    allowRetake: true,
    questions: [
      {
        questionText: '',
        options: ['', ''],
        correctAnswer: 0
      }
    ]
  });
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(0);
  const [viewingQuiz, setViewingQuiz] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editQuizForm, setEditQuizForm] = useState(null);
  const [updatingQuiz, setUpdatingQuiz] = useState(false);
  const [deletingQuiz, setDeletingQuiz] = useState(null);
  const [showDeleteQuizConfirm, setShowDeleteQuizConfirm] = useState(false);
  const [editExpandedQuestion, setEditExpandedQuestion] = useState(0);
  
  // Create Course Form States
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'development',
    level: 'Beginner',
    price: '',
    duration: '',
    image: '',
    lessons: 0,
    discount: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [createDurationFormat, setCreateDurationFormat] = useState('hours');
  const [createTimeValues, setCreateTimeValues] = useState({ hours: '', minutes: '', seconds: '' });
  
  // Edit Course States
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editCourseData, setEditCourseData] = useState(null);
  const [updatingCourse, setUpdatingCourse] = useState(false);
  const [durationFormat, setDurationFormat] = useState('hours'); // 'hours' or 'time'
  const [timeValues, setTimeValues] = useState({ hours: '', minutes: '', seconds: '' });

  // Fetch instructor's courses
  useEffect(() => {
    if (user && token) {
      fetchInstructorCourses();
    }
  }, [user, token]);

  // Fetch lectures when course detail is opened
  useEffect(() => {
    if (showCourseDetail && activeCourseSection === 'lectures') {
      fetchLectures();
    }
    if (showCourseDetail && activeCourseSection === 'students') {
      fetchEnrolledStudents();
    }
    if (showCourseDetail && activeCourseSection === 'quizzes') {
      fetchQuizzes();
    }
  }, [showCourseDetail, activeCourseSection]);

  const fetchInstructorCourses = async () => {
    setLoading(true);
    try {
      const timestamp = Date.now();
      const response = await fetch(`${API_URL}/api/instructor/courses?_t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok && data.courses) {
        const coursesWithIds = data.courses.map(course => ({
          ...course,
          _id: course._id || course.id,
          id: course._id || course.id,
          _lastUpdated: Date.now()
        }));
        setInstructorCourses(coursesWithIds);
      } else {
        throw new Error(data.message || 'Failed to fetch courses');
      }
    } catch (error) {
      showNotification('Could not fetch courses. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch lectures for a course
  const fetchLectures = async () => {
    if (!showCourseDetail) return;
    
    try {
      const response = await fetch(`${API_URL}/api/courses/${showCourseDetail._id}/lectures`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok && data.lectures) {
        setLectures(data.lectures);
      } else {
        throw new Error(data.message || 'Failed to fetch lectures');
      }
    } catch (error) {
      showNotification('Could not fetch lectures', 'error');
      setLectures([]);
    }
  };

  // Fetch enrolled students for a course
  const fetchEnrolledStudents = async () => {
    if (!showCourseDetail) return;
    
    setLoadingStudents(true);
    try {
      const response = await fetch(`${API_URL}/api/courses/${showCourseDetail._id}/enrolled-students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok && data.students) {
        setEnrolledStudents(data.students);
      } else {
        throw new Error(data.message || 'Failed to fetch enrolled students');
      }
    } catch (error) {
      showNotification('Could not fetch enrolled students', 'error');
      setEnrolledStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Fetch quizzes for a course
  const fetchQuizzes = async () => {
    if (!showCourseDetail) return;
    
    setLoadingQuizzes(true);
    try {
      const response = await fetch(`${API_URL}/api/courses/${showCourseDetail._id}/quizzes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok && data.quizzes) {
        setQuizzes(data.quizzes);
      } else {
        throw new Error(data.message || 'Failed to fetch quizzes');
      }
    } catch (error) {
      showNotification('Could not fetch quizzes', 'error');
      setQuizzes([]);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  // Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Please select an image file', 'error');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image size should be less than 5MB', 'error');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload Image to Cloudinary
  const uploadImageToCloudinary = async () => {
    if (!imageFile) return null;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('thumbnail', imageFile);

      // This will be used after course is created
      // For now, we'll return the preview
      return imagePreview;
    } catch (error) {
      showNotification('Failed to upload image', 'error');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle Course Creation
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!courseForm.title.trim()) {
      showNotification('Course title is required', 'error');
      return;
    }
    if (!courseForm.description.trim()) {
      showNotification('Course description is required', 'error');
      return;
    }
    if (!courseForm.price || courseForm.price <= 0) {
      showNotification('Please enter a valid price', 'error');
      return;
    }

    setCreatingCourse(true);

    try {
      // Create course first
      const courseData = {
        title: courseForm.title.trim(),
        description: courseForm.description.trim(),
        category: courseForm.category,
        level: courseForm.level,
        price: parseFloat(courseForm.price),
        lessons: parseInt(courseForm.lessons) || 0,
        image: imagePreview || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
        discount: courseForm.discount ? parseInt(courseForm.discount) : 0
      };

      const response = await fetch(`${API_URL}/api/instructor/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseData)
      });

      const data = await response.json();

      if (response.ok) {
        // If there's an image file, upload it to Cloudinary
        if (imageFile && data.course) {
          try {
            const formData = new FormData();
            formData.append('thumbnail', imageFile);

            const uploadResponse = await fetch(`${API_URL}/api/admin/courses/${data.course._id}/upload-thumbnail`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            });

            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              console.log('✅ Thumbnail uploaded:', uploadData.imageUrl);
            }
          } catch (uploadError) {
            console.error('Image upload error:', uploadError);
            // Continue anyway, course is already created
          }
        }

        showNotification('Course created successfully!', 'success');
        setShowCreateCourse(false);
        resetCourseForm();
        fetchInstructorCourses();
      } else {
        throw new Error(data.message || 'Failed to create course');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to create course', 'error');
    } finally {
      setCreatingCourse(false);
    }
  };

  // Reset Form
  const resetCourseForm = () => {
    setCourseForm({
      title: '',
      description: '',
      category: 'development',
      level: 'Beginner',
      price: '',
      image: '',
      lessons: 0,
      discount: ''
    });
    setImageFile(null);
    setImagePreview('');
  };

  // Reset Lecture Form
  const resetLectureForm = () => {
    setLectureForm({
      title: '',
      description: '',
      videoUrl: '',
      duration: '',
      thumbnail: '',
      order: 0
    });
    setVideoFile(null);
    setVideoPreview('');
    setVideoUploadMethod('url');
    setUploadProgress(0);
    setLectureDurationFormat('time');
    setLectureTimeValues({ hours: '', minutes: '', seconds: '' });
    setLectureThumbnailFile(null);
    setLectureThumbnailPreview('');
  };

  // Reset Quiz Form
  const resetQuizForm = () => {
    setQuizForm({
      title: '',
      description: '',
      timerMinutes: 30,
      allowRetake: true,
      questions: [
        {
          questionText: '',
          options: ['', ''],
          correctAnswer: 0
        }
      ]
    });
    setExpandedQuestion(0);
  };

  // Fetch single quiz for viewing/editing
  const fetchSingleQuiz = async (quizId) => {
    try {
      const response = await fetch(`${API_URL}/api/courses/${showCourseDetail._id}/quizzes/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok && data.quiz) {
        return data.quiz;
      } else {
        throw new Error(data.message || 'Failed to fetch quiz');
      }
    } catch (error) {
      showNotification('Could not fetch quiz details', 'error');
      return null;
    }
  };

  // Handle View Quiz
  const handleViewQuiz = async (quiz) => {
    const fullQuiz = await fetchSingleQuiz(quiz._id);
    if (fullQuiz) {
      setViewingQuiz(fullQuiz);
    }
  };

  // Handle Edit Quiz
  const handleEditQuiz = async (quiz) => {
    // If we already have full quiz data (from viewingQuiz), use it directly
    const fullQuiz = quiz.questions && quiz.questions.length > 0 ? quiz : await fetchSingleQuiz(quiz._id);
    
    if (fullQuiz) {
      // Close viewing mode if open
      setViewingQuiz(null);
      
      // Set editing mode
      setEditingQuiz(fullQuiz);
      setEditQuizForm({
        title: fullQuiz.title,
        description: fullQuiz.description || '',
        timerMinutes: fullQuiz.timerMinutes,
        allowRetake: fullQuiz.allowRetake,
        questions: fullQuiz.questions.map(q => ({
          questionText: q.questionText,
          options: [...q.options],
          correctAnswer: q.correctAnswer,
          order: q.order !== undefined ? q.order : 0
        }))
      });
      setEditExpandedQuestion(0);
    }
  };

  // Update Edit Quiz Question
  const updateEditQuestion = (index, field, value) => {
    const newQuestions = [...editQuizForm.questions];
    newQuestions[index][field] = value;
    setEditQuizForm({ ...editQuizForm, questions: newQuestions });
  };

  // Add Edit Quiz Option
  const addEditOption = (questionIndex) => {
    const newQuestions = [...editQuizForm.questions];
    if (newQuestions[questionIndex].options.length >= 6) {
      showNotification('Maximum 6 options allowed per question', 'error');
      return;
    }
    newQuestions[questionIndex].options.push('');
    setEditQuizForm({ ...editQuizForm, questions: newQuestions });
  };

  // Remove Edit Quiz Option
  const removeEditOption = (questionIndex, optionIndex) => {
    const newQuestions = [...editQuizForm.questions];
    if (newQuestions[questionIndex].options.length <= 2) {
      showNotification('Question must have at least 2 options', 'error');
      return;
    }
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    if (newQuestions[questionIndex].correctAnswer >= newQuestions[questionIndex].options.length) {
      newQuestions[questionIndex].correctAnswer = 0;
    }
    setEditQuizForm({ ...editQuizForm, questions: newQuestions });
  };

  // Update Edit Quiz Option
  const updateEditOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...editQuizForm.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setEditQuizForm({ ...editQuizForm, questions: newQuestions });
  };

  // Set Edit Quiz Correct Answer
  const setEditCorrectAnswer = (questionIndex, optionIndex) => {
    const newQuestions = [...editQuizForm.questions];
    newQuestions[questionIndex].correctAnswer = optionIndex;
    setEditQuizForm({ ...editQuizForm, questions: newQuestions });
  };

  // Add Edit Quiz Question
  const addEditQuestion = () => {
    setEditQuizForm({
      ...editQuizForm,
      questions: [
        ...editQuizForm.questions,
        {
          questionText: '',
          options: ['', ''],
          correctAnswer: 0
        }
      ]
    });
    setEditExpandedQuestion(editQuizForm.questions.length);
  };

  // Remove Edit Quiz Question
  const removeEditQuestion = (index) => {
    if (editQuizForm.questions.length === 1) {
      showNotification('Quiz must have at least one question', 'error');
      return;
    }
    const newQuestions = editQuizForm.questions.filter((_, i) => i !== index);
    setEditQuizForm({ ...editQuizForm, questions: newQuestions });
    if (editExpandedQuestion === index) {
      setEditExpandedQuestion(0);
    } else if (editExpandedQuestion > index) {
      setEditExpandedQuestion(editExpandedQuestion - 1);
    }
  };

  // Handle Update Quiz
  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    
    if (!editQuizForm.title.trim()) {
      showNotification('Quiz title is required', 'error');
      return;
    }
    if (!editQuizForm.timerMinutes || editQuizForm.timerMinutes < 1) {
      showNotification('Timer must be at least 1 minute', 'error');
      return;
    }
    
    for (let i = 0; i < editQuizForm.questions.length; i++) {
      const q = editQuizForm.questions[i];
      if (!q.questionText.trim()) {
        showNotification(`Question ${i + 1} text is required`, 'error');
        setEditExpandedQuestion(i);
        return;
      }
      
      const filledOptions = q.options.filter(opt => opt.trim());
      if (filledOptions.length < 2) {
        showNotification(`Question ${i + 1} must have at least 2 options`, 'error');
        setEditExpandedQuestion(i);
        return;
      }
      
      if (!q.options[q.correctAnswer] || !q.options[q.correctAnswer].trim()) {
        showNotification(`Question ${i + 1} has invalid correct answer selection`, 'error');
        setEditExpandedQuestion(i);
        return;
      }
    }

    setUpdatingQuiz(true);

    try {
      const quizData = {
        title: editQuizForm.title.trim(),
        description: editQuizForm.description.trim(),
        timerMinutes: parseInt(editQuizForm.timerMinutes),
        allowRetake: editQuizForm.allowRetake,
        questions: editQuizForm.questions.map((q, idx) => ({
          questionText: q.questionText.trim(),
          options: q.options.filter(opt => opt.trim()),
          correctAnswer: q.correctAnswer,
          order: idx
        }))
      };

      const response = await fetch(`${API_URL}/api/courses/${showCourseDetail._id}/quizzes/${editingQuiz._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quizData)
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Quiz updated successfully!', 'success');
        setEditingQuiz(null);
        setEditQuizForm(null);
        fetchQuizzes();
      } else {
        throw new Error(data.message || 'Failed to update quiz');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to update quiz', 'error');
    } finally {
      setUpdatingQuiz(false);
    }
  };

  // Handle Delete Quiz
  const handleDeleteQuiz = async () => {
    if (!deletingQuiz) return;

    try {
      const response = await fetch(
        `${API_URL}/api/courses/${showCourseDetail._id}/quizzes/${deletingQuiz._id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        showNotification('Quiz deleted successfully!', 'success');
        setShowDeleteQuizConfirm(false);
        setDeletingQuiz(null);
        setViewingQuiz(null);
        fetchQuizzes();
      } else {
        throw new Error('Failed to delete quiz');
      }
    } catch (error) {
      showNotification('Failed to delete quiz', 'error');
    }
  };

  // Add Question
  const addQuestion = () => {
    setQuizForm({
      ...quizForm,
      questions: [
        ...quizForm.questions,
        {
          questionText: '',
          options: ['', ''],
          correctAnswer: 0
        }
      ]
    });
    setExpandedQuestion(quizForm.questions.length);
  };

  // Remove Question
  const removeQuestion = (index) => {
    if (quizForm.questions.length === 1) {
      showNotification('Quiz must have at least one question', 'error');
      return;
    }
    const newQuestions = quizForm.questions.filter((_, i) => i !== index);
    setQuizForm({ ...quizForm, questions: newQuestions });
    if (expandedQuestion === index) {
      setExpandedQuestion(0);
    } else if (expandedQuestion > index) {
      setExpandedQuestion(expandedQuestion - 1);
    }
  };

  // Update Question
  const updateQuestion = (index, field, value) => {
    const newQuestions = [...quizForm.questions];
    newQuestions[index][field] = value;
    setQuizForm({ ...quizForm, questions: newQuestions });
  };

  // Add Option
  const addOption = (questionIndex) => {
    const newQuestions = [...quizForm.questions];
    if (newQuestions[questionIndex].options.length >= 6) {
      showNotification('Maximum 6 options allowed per question', 'error');
      return;
    }
    newQuestions[questionIndex].options.push('');
    setQuizForm({ ...quizForm, questions: newQuestions });
  };

  // Remove Option
  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...quizForm.questions];
    if (newQuestions[questionIndex].options.length <= 2) {
      showNotification('Question must have at least 2 options', 'error');
      return;
    }
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    // Adjust correct answer if needed
    if (newQuestions[questionIndex].correctAnswer >= newQuestions[questionIndex].options.length) {
      newQuestions[questionIndex].correctAnswer = 0;
    }
    setQuizForm({ ...quizForm, questions: newQuestions });
  };

  // Update Option
  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...quizForm.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuizForm({ ...quizForm, questions: newQuestions });
  };

  // Set Correct Answer
  const setCorrectAnswer = (questionIndex, optionIndex) => {
    const newQuestions = [...quizForm.questions];
    newQuestions[questionIndex].correctAnswer = optionIndex;
    setQuizForm({ ...quizForm, questions: newQuestions });
  };

  // Handle Create Quiz
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!quizForm.title.trim()) {
      showNotification('Quiz title is required', 'error');
      return;
    }
    if (!quizForm.timerMinutes || quizForm.timerMinutes < 1) {
      showNotification('Timer must be at least 1 minute', 'error');
      return;
    }
    
    // Validate questions
    for (let i = 0; i < quizForm.questions.length; i++) {
      const q = quizForm.questions[i];
      if (!q.questionText.trim()) {
        showNotification(`Question ${i + 1} text is required`, 'error');
        setExpandedQuestion(i);
        return;
      }
      
      const filledOptions = q.options.filter(opt => opt.trim());
      if (filledOptions.length < 2) {
        showNotification(`Question ${i + 1} must have at least 2 options`, 'error');
        setExpandedQuestion(i);
        return;
      }
      
      if (!q.options[q.correctAnswer] || !q.options[q.correctAnswer].trim()) {
        showNotification(`Question ${i + 1} has invalid correct answer selection`, 'error');
        setExpandedQuestion(i);
        return;
      }
    }

    setCreatingQuiz(true);

    try {
      const quizData = {
        title: quizForm.title.trim(),
        description: quizForm.description.trim(),
        timerMinutes: parseInt(quizForm.timerMinutes),
        allowRetake: quizForm.allowRetake,
        questions: quizForm.questions.map((q, idx) => ({
          questionText: q.questionText.trim(),
          options: q.options.filter(opt => opt.trim()),
          correctAnswer: q.correctAnswer,
          order: idx
        }))
      };

      const response = await fetch(`${API_URL}/api/courses/${showCourseDetail._id}/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quizData)
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Quiz created successfully!', 'success');
        setShowCreateQuiz(false);
        resetQuizForm();
        fetchQuizzes();
      } else {
        throw new Error(data.message || 'Failed to create quiz');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to create quiz', 'error');
    } finally {
      setCreatingQuiz(false);
    }
  };

  // Handle create time value changes
  const handleCreateTimeValueChange = (field, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    let numValue = parseInt(value) || 0;
    
    // Validate ranges
    if (field === 'hours') {
      numValue = Math.min(Math.max(0, numValue), 999);
    } else {
      numValue = Math.min(Math.max(0, numValue), 59);
    }
    
    const newTimeValues = { ...createTimeValues, [field]: numValue.toString() };
    setCreateTimeValues(newTimeValues);
    
    // Update duration in courseForm
    const h = (newTimeValues.hours || '0').padStart(2, '0');
    const m = (newTimeValues.minutes || '0').padStart(2, '0');
    const s = (newTimeValues.seconds || '0').padStart(2, '0');
    setCourseForm({ ...courseForm, duration: `${h}:${m}:${s}` });
  };

  // Handle lecture time value changes
  const handleLectureTimeValueChange = (field, value) => {
    if (value && !/^\d+$/.test(value)) return;
    
    let numValue = parseInt(value) || 0;
    
    if (field === 'hours') {
      numValue = Math.min(Math.max(0, numValue), 999);
    } else {
      numValue = Math.min(Math.max(0, numValue), 59);
    }
    
    const newTimeValues = { ...lectureTimeValues, [field]: numValue.toString() };
    setLectureTimeValues(newTimeValues);
    
    const h = (newTimeValues.hours || '0').padStart(2, '0');
    const m = (newTimeValues.minutes || '0').padStart(2, '0');
    const s = (newTimeValues.seconds || '0').padStart(2, '0');
    setLectureForm({ ...lectureForm, duration: `${h}:${m}:${s}` });
  };

  // Handle Video Upload
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      showNotification('Please select a valid video file (MP4, MOV, AVI, MKV, WEBM)', 'error');
      return;
    }

    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      showNotification('Video size should be less than 100MB', 'error');
      return;
    }

    setVideoFile(file);
    
    // Create preview and get video duration
    const reader = new FileReader();
    reader.onloadend = () => {
      const videoUrl = reader.result;
      setVideoPreview(videoUrl);
      
      // Create video element to get duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = Math.floor(video.duration);
        
        // Convert to HH:MM:SS
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;
        
        // Update time values
        setLectureTimeValues({
          hours: hours.toString(),
          minutes: minutes.toString(),
          seconds: seconds.toString()
        });
        
        // Update lecture form duration
        const h = hours.toString().padStart(2, '0');
        const m = minutes.toString().padStart(2, '0');
        const s = seconds.toString().padStart(2, '0');
        setLectureForm({ ...lectureForm, duration: `${h}:${m}:${s}` });
        
        showNotification(`Duration auto-detected: ${h}:${m}:${s}`, 'success');
      };
      
      video.src = videoUrl;
    };
    reader.readAsDataURL(file);
  };

  // Handle Lecture Thumbnail Upload
  const handleLectureThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Please select an image file', 'error');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image size should be less than 5MB', 'error');
      return;
    }

    setLectureThumbnailFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLectureThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle Edit Lecture Thumbnail Upload
  const handleEditLectureThumbnailUpload = async (e) => {
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

    setEditLectureThumbnailFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditLectureThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle Edit Lecture Click
  const handleEditLectureClick = (lecture) => {
    setEditingLecture(lecture);
    setEditLectureForm({
      title: lecture.title,
      description: lecture.description || '',
      videoUrl: lecture.videoUrl,
      thumbnail: lecture.thumbnail || ''
    });
    setEditLectureThumbnailPreview(lecture.thumbnail || '');
    setEditVideoUploadMethod('url');
    setEditVideoFile(null);
    setEditVideoPreview('');
  };

  // Handle Edit Video Upload
  const handleEditVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      showNotification('Please select a valid video file (MP4, MOV, AVI, MKV, WEBM)', 'error');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      showNotification('Video size should be less than 100MB', 'error');
      return;
    }

    setEditVideoFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditVideoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload Edit Video to Cloudinary
  const uploadEditVideoToCloudinary = async () => {
    if (!editVideoFile || !showCourseDetail) return null;

    setEditUploadingVideo(true);
    setEditUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', editVideoFile);

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setEditUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.videoUrl);
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));

        xhr.open('POST', `${API_URL}/api/courses/${showCourseDetail._id}/lectures/upload-video`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });
    } catch (error) {
      showNotification('Failed to upload video', 'error');
      return null;
    } finally {
      setEditUploadingVideo(false);
    }
  };

  // Handle Update Lecture
  const handleUpdateLecture = async (e) => {
    e.preventDefault();
    
    if (!editLectureForm.title.trim()) {
      showNotification('Lecture title is required', 'error');
      return;
    }

    setUpdatingLecture(true);

    try {
      let finalVideoUrl = editLectureForm.videoUrl;

      // If using upload method, upload video first
      if (editVideoUploadMethod === 'upload' && editVideoFile) {
        finalVideoUrl = await uploadEditVideoToCloudinary();
        if (!finalVideoUrl) {
          throw new Error('Video upload failed');
        }
      } else if (editVideoUploadMethod === 'url' && !editLectureForm.videoUrl.trim()) {
        showNotification('Video URL is required', 'error');
        setUpdatingLecture(false);
        return;
      }

      let finalThumbnailUrl = editLectureForm.thumbnail;
      
      // Upload new thumbnail if changed
      if (editLectureThumbnailFile) {
        setUploadingThumbnail(true);
        try {
          const formData = new FormData();
          formData.append('thumbnail', editLectureThumbnailFile);

          const thumbnailResponse = await fetch(
            `${API_URL}/api/courses/${showCourseDetail._id}/lectures/${editingLecture._id}/upload-thumbnail`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            }
          );

          if (thumbnailResponse.ok) {
            const thumbnailData = await thumbnailResponse.json();
            finalThumbnailUrl = thumbnailData.thumbnailUrl;
          }
        } catch (thumbnailError) {
          console.error('Thumbnail upload error:', thumbnailError);
        } finally {
          setUploadingThumbnail(false);
        }
      }

      // Update lecture
      const updateData = {
        title: editLectureForm.title.trim(),
        description: editLectureForm.description.trim(),
        videoUrl: finalVideoUrl,
        thumbnail: finalThumbnailUrl
      };

      const response = await fetch(
        `${API_URL}/api/courses/${showCourseDetail._id}/lectures/${editingLecture._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        }
      );

      if (response.ok) {
        showNotification('Lecture updated successfully!', 'success');
        setEditingLecture(null);
        setEditLectureForm({ title: '', description: '', videoUrl: '', thumbnail: '' });
        setEditLectureThumbnailFile(null);
        setEditLectureThumbnailPreview('');
        setEditVideoFile(null);
        setEditVideoPreview('');
        fetchLectures();
      } else {
        throw new Error('Failed to update lecture');
      }
    } catch (error) {
      showNotification('Failed to update lecture', 'error');
    } finally {
      setUpdatingLecture(false);
    }
  };

  // Handle Delete Lecture
  const handleDeleteLecture = async () => {
    if (!deletingLecture) return;

    try {
      const response = await fetch(
        `${API_URL}/api/courses/${showCourseDetail._id}/lectures/${deletingLecture._id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        showNotification('Lecture deleted successfully!', 'success');
        setShowDeleteLectureConfirm(false);
        setDeletingLecture(null);
        fetchLectures();
        fetchInstructorCourses();
      } else {
        throw new Error('Failed to delete lecture');
      }
    } catch (error) {
      showNotification('Failed to delete lecture', 'error');
    }
  };

  // Upload Video to Cloudinary
  const uploadVideoToCloudinary = async () => {
    if (!videoFile || !showCourseDetail) return null;

    setUploadingVideo(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', videoFile);

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.videoUrl);
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));

        xhr.open('POST', `${API_URL}/api/courses/${showCourseDetail._id}/lectures/upload-video`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });
    } catch (error) {
      showNotification('Failed to upload video', 'error');
      return null;
    } finally {
      setUploadingVideo(false);
    }
  };

  // Handle Add Lecture
  const handleAddLecture = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!lectureForm.title.trim()) {
      showNotification('Lecture title is required', 'error');
      return;
    }

    setAddingLecture(true);

    try {
      let finalVideoUrl = lectureForm.videoUrl;

      // If using upload method, upload video first
      if (videoUploadMethod === 'upload' && videoFile) {
        finalVideoUrl = await uploadVideoToCloudinary();
        if (!finalVideoUrl) {
          throw new Error('Video upload failed');
        }
      } else if (videoUploadMethod === 'url' && !lectureForm.videoUrl.trim()) {
        showNotification('Video URL is required', 'error');
        setAddingLecture(false);
        return;
      }

      const lectureData = {
        title: lectureForm.title.trim(),
        description: lectureForm.description.trim(),
        videoUrl: finalVideoUrl,
        duration: lectureForm.duration.trim(),
        order: lectures.length + 1
      };

      const response = await fetch(`${API_URL}/api/courses/${showCourseDetail._id}/lectures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(lectureData)
      });

      const data = await response.json();

      if (response.ok) {
        // Upload thumbnail if provided
        if (lectureThumbnailFile && data.lecture) {
          setUploadingThumbnail(true);
          try {
            const formData = new FormData();
            formData.append('thumbnail', lectureThumbnailFile);

            const thumbnailResponse = await fetch(
              `${API_URL}/api/courses/${showCourseDetail._id}/lectures/${data.lecture._id}/upload-thumbnail`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`
                },
                body: formData
              }
            );

            if (thumbnailResponse.ok) {
              console.log('✅ Thumbnail uploaded successfully');
            }
          } catch (thumbnailError) {
            console.error('Thumbnail upload error:', thumbnailError);
          } finally {
            setUploadingThumbnail(false);
          }
        }

        showNotification('Lecture added successfully!', 'success');
        setShowAddLecture(false);
        resetLectureForm();
        fetchLectures();
        fetchInstructorCourses(); // Update course lessons count
      } else {
        throw new Error(data.message || 'Failed to add lecture');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to add lecture', 'error');
    } finally {
      setAddingLecture(false);
    }
  };
  const handleEditCourseClick = (course) => {
    setEditCourseData({
      ...course,
      discount: course.discount || ''
    });
    setImagePreview(course.image || '');
    
    setIsEditingCourse(true);
  };

  // Handle duration format change
  const handleDurationChange = (value) => {
    if (durationFormat === 'hours') {
      setEditCourseData({ ...editCourseData, duration: value ? `${value} hours` : '' });
    } else {
      // Update from time values
      const h = timeValues.hours.padStart(2, '0');
      const m = timeValues.minutes.padStart(2, '0');
      const s = timeValues.seconds.padStart(2, '0');
      setEditCourseData({ ...editCourseData, duration: `${h}:${m}:${s}` });
    }
  };

  // Handle time value changes
  const handleTimeValueChange = (field, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    let numValue = parseInt(value) || 0;
    
    // Validate ranges
    if (field === 'hours') {
      numValue = Math.min(Math.max(0, numValue), 999);
    } else {
      numValue = Math.min(Math.max(0, numValue), 59);
    }
    
    const newTimeValues = { ...timeValues, [field]: numValue.toString() };
    setTimeValues(newTimeValues);
    
    // Update duration in editCourseData
    const h = (newTimeValues.hours || '0').padStart(2, '0');
    const m = (newTimeValues.minutes || '0').padStart(2, '0');
    const s = (newTimeValues.seconds || '0').padStart(2, '0');
    setEditCourseData({ ...editCourseData, duration: `${h}:${m}:${s}` });
  };

  // Handle Update Course
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!editCourseData.title.trim()) {
      showNotification('Course title is required', 'error');
      return;
    }
    if (!editCourseData.description.trim()) {
      showNotification('Course description is required', 'error');
      return;
    }
    if (!editCourseData.price || editCourseData.price <= 0) {
      showNotification('Please enter a valid price', 'error');
      return;
    }

    setUpdatingCourse(true);

    try {
      // First, upload new thumbnail if changed
      let finalImageUrl = editCourseData.image;
      
      if (imageFile) {
        try {
          const formData = new FormData();
          formData.append('thumbnail', imageFile);

          const uploadResponse = await fetch(`${API_URL}/api/admin/courses/${editCourseData._id}/upload-thumbnail`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            finalImageUrl = uploadData.imageUrl;
            console.log('✅ Thumbnail uploaded:', finalImageUrl);
          } else {
            throw new Error('Failed to upload thumbnail');
          }
        } catch (uploadError) {
          console.error('Thumbnail upload error:', uploadError);
          showNotification('Failed to upload thumbnail', 'error');
          setUpdatingCourse(false);
          return;
        }
      }

      // Update course data
      const updateData = {
        title: editCourseData.title.trim(),
        description: editCourseData.description.trim(),
        category: editCourseData.category,
        level: editCourseData.level,
        price: parseFloat(editCourseData.price),
        lessons: parseInt(editCourseData.lessons) || 0,
        image: finalImageUrl,
        discount: editCourseData.discount ? parseInt(editCourseData.discount) : 0
      };

      const response = await fetch(`${API_URL}/api/instructor/courses/${editCourseData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Course updated successfully!', 'success');
        setIsEditingCourse(false);
        setEditCourseData(null);
        setImageFile(null);
        setImagePreview('');
        fetchInstructorCourses();
        
        // Update the course detail view if it's open
        if (showCourseDetail && showCourseDetail._id === editCourseData._id) {
          setShowCourseDetail(data.course);
        }
      } else {
        throw new Error(data.message || 'Failed to update course');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to update course', 'error');
    } finally {
      setUpdatingCourse(false);
    }
  };

  // Calculate dashboard stats
  const stats = {
    totalCourses: instructorCourses.length,
    totalStudents: instructorCourses.reduce((sum, course) => sum + (course.students || 0), 0),
    avgRating: instructorCourses.length > 0 
      ? (instructorCourses.reduce((sum, course) => sum + (course.rating || 0), 0) / instructorCourses.length).toFixed(1)
      : '0.0',
    totalRevenue: instructorCourses.reduce((sum, course) => sum + ((course.students || 0) * (course.price || 0)), 0)
  };

  const categories = [
    { id: 'all', name: 'All Courses' },
    { id: 'development', name: 'Development' },
    { id: 'design', name: 'Design' },
    { id: 'business', name: 'Business' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'data-science', name: 'Data Science' }
  ];

  const filteredCourses = instructorCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteCourse = async () => {
    setDeletingCourse(true);
    try {
      const response = await fetch(`${API_URL}/api/instructor/courses/${showCourseDetail._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showNotification('Course deleted successfully!', 'success');
        setShowCourseDetail(null);
        fetchInstructorCourses();
      } else {
        throw new Error('Failed to delete course');
      }
    } catch (error) {
      showNotification('Failed to delete course', 'error');
    } finally {
      setDeletingCourse(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f4f6',
            borderTopColor: '#4f46e5',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ fontSize: '1rem', color: '#6b7280' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Create Course Page
  if (showCreateCourse) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Create New Course
              </h1>
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>
                Share your knowledge with students worldwide
              </p>
            </div>
            <button
              onClick={() => {
                setShowCreateCourse(false);
                resetCourseForm();
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9375rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
          <form onSubmit={handleCreateCourse} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Course Title */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    placeholder="e.g., Complete Web Development Bootcamp"
                    required
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                    Description *
                  </label>
                  <textarea
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    placeholder="Describe what students will learn in this course..."
                    required
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Category & Level */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                      Category *
                    </label>
                    <select
                      value={courseForm.category}
                      onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none',
                        cursor: 'pointer',
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="development">Development</option>
                      <option value="design">Design</option>
                      <option value="business">Business</option>
                      <option value="marketing">Marketing</option>
                      <option value="data-science">Data Science</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                      Level *
                    </label>
                    <select
                      value={courseForm.level}
                      onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none',
                        cursor: 'pointer',
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    placeholder="499"
                    required
                    min="0"
                    step="1"
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    💡 Course duration will be automatically calculated based on lectures and quizzes
                  </p>
                </div>

                {/* Discount (Optional) */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                    Discount (%) <span style={{ color: '#9ca3af', fontWeight: 400 }}>- Optional</span>
                  </label>
                  <input
                    type="number"
                    value={courseForm.discount}
                    onChange={(e) => setCourseForm({ ...courseForm, discount: e.target.value })}
                    placeholder="e.g., 30"
                    min="0"
                    max="100"
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                  {courseForm.discount && (
                    <p style={{ fontSize: '0.875rem', color: '#10b981', marginTop: '0.5rem', fontWeight: 500 }}>
                      Discounted Price: ₹{(courseForm.price * (1 - courseForm.discount / 100)).toFixed(0)}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column - Image Upload */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                  Course Thumbnail
                </label>
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '0.75rem',
                  padding: '2rem',
                  textAlign: 'center',
                  backgroundColor: '#f9fafb',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  minHeight: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#4f46e5';
                  e.currentTarget.style.backgroundColor = '#f8f9ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}>
                  {imagePreview ? (
                    <div style={{ width: '100%' }}>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{ 
                          width: '100%', 
                          height: '300px', 
                          objectFit: 'cover', 
                          borderRadius: '0.5rem',
                          marginBottom: '1rem'
                        }} 
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <label style={{ cursor: 'pointer', width: '100%' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <svg style={{ width: '64px', height: '64px', margin: '0 auto 1rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                        Click to upload course thumbnail
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        PNG, JPG, WEBP up to 5MB
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                        Recommended: 800x500px
                      </p>
                    </label>
                  )}
                </div>

                {/* Info Box */}
                <div style={{ 
                  backgroundColor: '#eff6ff', 
                  border: '2px solid #bfdbfe', 
                  borderRadius: '0.75rem', 
                  padding: '1rem', 
                  marginTop: '1.5rem' 
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <svg style={{ width: '20px', height: '20px', color: '#3b82f6', flexShrink: 0, marginTop: '0.125rem' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: 600, marginBottom: '0.25rem' }}>
                        Course Creation Tips
                      </p>
                      <ul style={{ fontSize: '0.8125rem', color: '#1e3a8a', margin: '0.5rem 0 0 1rem', paddingLeft: 0, lineHeight: 1.6 }}>
                        <li>Use clear, descriptive titles</li>
                        <li>Write detailed course descriptions</li>
                        <li>Upload high-quality thumbnail images</li>
                        <li>Set competitive pricing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
              <button
                type="button"
                onClick={() => {
                  setShowCreateCourse(false);
                  resetCourseForm();
                }}
                style={{
                  padding: '0.875rem 2rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingCourse || uploadingImage}
                style={{
                  padding: '0.875rem 2rem',
                  background: creatingCourse ? '#9ca3af' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: creatingCourse ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!creatingCourse) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.3)';
                }}
              >
                {creatingCourse ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                    Creating Course...
                  </>
                ) : (
                  <>
                    <Plus style={{ width: 20, height: 20 }} />
                    Create Course
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Edit Lecture Page
  if (editingLecture && showCourseDetail) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Edit Lecture
              </h1>
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>
                Course: {showCourseDetail.title}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingLecture(null);
                setEditLectureForm({ title: '', description: '', videoUrl: '', thumbnail: '' });
                setEditLectureThumbnailFile(null);
                setEditLectureThumbnailPreview('');
                setEditVideoFile(null);
                setEditVideoPreview('');
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9375rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            >
              ← Back to Course
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
          <form onSubmit={handleUpdateLecture} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Lecture Title */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                    Lecture Title *
                  </label>
                  <input
                    type="text"
                    value={editLectureForm.title}
                    onChange={(e) => setEditLectureForm({ ...editLectureForm, title: e.target.value })}
                    placeholder="e.g., Introduction to Variables"
                    required
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                    Description
                  </label>
                  <textarea
                    value={editLectureForm.description}
                    onChange={(e) => setEditLectureForm({ ...editLectureForm, description: e.target.value })}
                    placeholder="Describe what students will learn in this lecture..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Lecture Thumbnail */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                    Lecture Thumbnail <span style={{ color: '#9ca3af', fontWeight: 400 }}>- Optional</span>
                  </label>
                  <div style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    textAlign: 'center',
                    backgroundColor: '#f9fafb',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}>
                    {editLectureThumbnailPreview ? (
                      <div style={{ width: '100%' }}>
                        <img 
                          src={editLectureThumbnailPreview} 
                          alt="Thumbnail Preview" 
                          style={{ 
                            width: '100%', 
                            height: '160px', 
                            objectFit: 'cover', 
                            borderRadius: '0.5rem',
                            marginBottom: '1rem'
                          }} 
                        />
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                          <label style={{ 
                            padding: '0.5rem 1rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleEditLectureThumbnailUpload}
                              style={{ display: 'none' }}
                            />
                            Change Thumbnail
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setEditLectureThumbnailFile(null);
                              setEditLectureThumbnailPreview(editingLecture.thumbnail || '');
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label style={{ cursor: 'pointer', width: '100%' }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditLectureThumbnailUpload}
                          style={{ display: 'none' }}
                        />
                        <svg style={{ width: '48px', height: '48px', margin: '0 auto 0.75rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>
                          Click to upload thumbnail
                        </p>
                        <p style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                          JPG, PNG, WEBP up to 5MB
                        </p>
                      </label>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    💡 Tip: Upload a thumbnail or we'll use the first frame of your video
                  </p>
                </div>
              </div>

              {/* Right Column - Video Upload */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                  Video Source *
                </label>

                {/* Upload Method Toggle */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditVideoUploadMethod('url');
                      setEditVideoFile(null);
                      setEditVideoPreview('');
                    }}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: editVideoUploadMethod === 'url' ? '#3b82f6' : 'white',
                      color: editVideoUploadMethod === 'url' ? 'white' : '#6b7280',
                      border: `2px solid ${editVideoUploadMethod === 'url' ? '#3b82f6' : '#e5e7eb'}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    🔗 Video URL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditVideoUploadMethod('upload');
                      setEditLectureForm({ ...editLectureForm, videoUrl: '' });
                    }}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: editVideoUploadMethod === 'upload' ? '#3b82f6' : 'white',
                      color: editVideoUploadMethod === 'upload' ? 'white' : '#6b7280',
                      border: `2px solid ${editVideoUploadMethod === 'upload' ? '#3b82f6' : '#e5e7eb'}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    📤 Upload Video
                  </button>
                </div>

                {/* Video URL Input */}
                {editVideoUploadMethod === 'url' && (
                  <div>
                    <input
                      type="url"
                      value={editLectureForm.videoUrl}
                      onChange={(e) => setEditLectureForm({ ...editLectureForm, videoUrl: e.target.value })}
                      placeholder="https://example.com/video.mp4"
                      required={editVideoUploadMethod === 'url'}
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                      Enter direct video URL (must end with .mp4, .webm, .ogg, .mov, etc.)
                    </p>
                  </div>
                )}

                {/* Video File Upload */}
                {editVideoUploadMethod === 'upload' && (
                  <div style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '0.75rem',
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: '#f9fafb',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    minHeight: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}>
                    {editVideoFile ? (
                      <div style={{ width: '100%' }}>
                        <video 
                          src={editVideoPreview} 
                          controls
                          style={{ 
                            width: '100%', 
                            maxHeight: '300px',
                            borderRadius: '0.5rem',
                            marginBottom: '1rem'
                          }} 
                        />
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                          <label style={{ 
                            padding: '0.5rem 1rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={handleEditVideoUpload}
                              style={{ display: 'none' }}
                            />
                            Change Video
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setEditVideoFile(null);
                              setEditVideoPreview('');
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label style={{ cursor: 'pointer', width: '100%' }}>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleEditVideoUpload}
                          style={{ display: 'none' }}
                        />
                        <svg style={{ width: '64px', height: '64px', margin: '0 auto 1rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                          Click to upload video
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          MP4, MOV, AVI, MKV, WEBM up to 100MB
                        </p>
                      </label>
                    )}
                  </div>
                )}

                {/* Upload Progress */}
                {editUploadingVideo && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Uploading...</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#3b82f6' }}>{editUploadProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${editUploadProgress}%`, 
                        height: '100%', 
                        backgroundColor: '#3b82f6',
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div style={{ 
                  backgroundColor: '#eff6ff', 
                  border: '2px solid #bfdbfe', 
                  borderRadius: '0.75rem', 
                  padding: '1rem', 
                  marginTop: '1.5rem' 
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <svg style={{ width: '20px', height: '20px', color: '#3b82f6', flexShrink: 0, marginTop: '0.125rem' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: 600, marginBottom: '0.25rem' }}>
                        Update Tips
                      </p>
                      <ul style={{ fontSize: '0.8125rem', color: '#1e3a8a', margin: '0.5rem 0 0 1rem', paddingLeft: 0, lineHeight: 1.6 }}>
                        <li>Update title, description or video</li>
                        <li>Upload new video or keep existing</li>
                        <li>Duration auto-updates with new video</li>
                        <li>Changes are saved immediately</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
              <button
                type="button"
                onClick={() => {
                  setEditingLecture(null);
                  setEditLectureForm({ title: '', description: '', videoUrl: '', thumbnail: '' });
                  setEditLectureThumbnailFile(null);
                  setEditLectureThumbnailPreview('');
                  setEditVideoFile(null);
                  setEditVideoPreview('');
                }}
                style={{
                  padding: '0.875rem 2rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingLecture || uploadingThumbnail || editUploadingVideo}
                style={{
                  padding: '0.875rem 2rem',
                  background: (updatingLecture || uploadingThumbnail || editUploadingVideo) ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: (updatingLecture || uploadingThumbnail || editUploadingVideo) ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!updatingLecture && !uploadingThumbnail && !editUploadingVideo) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.3)';
                }}
              >
                {updatingLecture ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                    Updating Lecture...
                  </>
                ) : editUploadingVideo ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                    Uploading Video...
                  </>
                ) : uploadingThumbnail ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                    Uploading Thumbnail...
                  </>
                ) : (
                  <>
                    <CheckCircle style={{ width: 20, height: 20 }} />
                    Update Lecture
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Add Lecture Page
  if (showAddLecture && showCourseDetail) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Add New Lecture
              </h1>
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>
                Course: {showCourseDetail.title}
              </p>
            </div>
            <button
              onClick={() => {
                setShowAddLecture(false);
                resetLectureForm();
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9375rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            >
              ← Back to Course
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
          <form onSubmit={handleAddLecture} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Lecture Title */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                    Lecture Title *
                  </label>
                  <input
                    type="text"
                    value={lectureForm.title}
                    onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
                    placeholder="e.g., Introduction to Variables"
                    required
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                    Description
                  </label>
                  <textarea
                    value={lectureForm.description}
                    onChange={(e) => setLectureForm({ ...lectureForm, description: e.target.value })}
                    placeholder="Describe what students will learn in this lecture..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Lecture Thumbnail */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                    Lecture Thumbnail <span style={{ color: '#9ca3af', fontWeight: 400 }}>- Optional</span>
                  </label>
                  <div style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    textAlign: 'center',
                    backgroundColor: '#f9fafb',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#4f46e5';
                    e.currentTarget.style.backgroundColor = '#f8f9ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}>
                    {lectureThumbnailPreview ? (
                      <div style={{ width: '100%' }}>
                        <img 
                          src={lectureThumbnailPreview} 
                          alt="Thumbnail Preview" 
                          style={{ 
                            width: '100%', 
                            height: '160px', 
                            objectFit: 'cover', 
                            borderRadius: '0.5rem',
                            marginBottom: '1rem'
                          }} 
                        />
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                          <label style={{ 
                            padding: '0.5rem 1rem',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLectureThumbnailUpload}
                              style={{ display: 'none' }}
                            />
                            Change Thumbnail
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setLectureThumbnailFile(null);
                              setLectureThumbnailPreview('');
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label style={{ cursor: 'pointer', width: '100%' }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLectureThumbnailUpload}
                          style={{ display: 'none' }}
                        />
                        <svg style={{ width: '48px', height: '48px', margin: '0 auto 0.75rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>
                          Click to upload thumbnail
                        </p>
                        <p style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                          JPG, PNG, WEBP up to 5MB
                        </p>
                      </label>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    💡 Tip: Upload a thumbnail or we'll use the first frame of your video
                  </p>
                </div>
              </div>

              {/* Right Column - Video Upload */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                  Video Source *
                </label>

                {/* Upload Method Toggle */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoUploadMethod('url');
                      setVideoFile(null);
                      setVideoPreview('');
                    }}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: videoUploadMethod === 'url' ? '#4f46e5' : 'white',
                      color: videoUploadMethod === 'url' ? 'white' : '#6b7280',
                      border: `2px solid ${videoUploadMethod === 'url' ? '#4f46e5' : '#e5e7eb'}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    🔗 Video URL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoUploadMethod('upload');
                      setLectureForm({ ...lectureForm, videoUrl: '' });
                    }}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: videoUploadMethod === 'upload' ? '#4f46e5' : 'white',
                      color: videoUploadMethod === 'upload' ? 'white' : '#6b7280',
                      border: `2px solid ${videoUploadMethod === 'upload' ? '#4f46e5' : '#e5e7eb'}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    📤 Upload Video
                  </button>
                </div>

                {/* Video URL Input */}
                {videoUploadMethod === 'url' && (
                  <div>
                    <input
                      type="url"
                      value={lectureForm.videoUrl}
                      onChange={(e) => setLectureForm({ ...lectureForm, videoUrl: e.target.value })}
                      placeholder="https://example.com/video.mp4"
                      required={videoUploadMethod === 'url'}
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                      Enter direct video URL (must end with .mp4, .webm, .ogg, .mov, etc.)
                    </p>
                  </div>
                )}

                {/* Video File Upload */}
                {videoUploadMethod === 'upload' && (
                  <div style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '0.75rem',
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: '#f9fafb',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    minHeight: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#4f46e5';
                    e.currentTarget.style.backgroundColor = '#f8f9ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}>
                    {videoFile ? (
                      <div style={{ width: '100%' }}>
                        <video 
                          src={videoPreview} 
                          controls
                          style={{ 
                            width: '100%', 
                            maxHeight: '300px',
                            borderRadius: '0.5rem',
                            marginBottom: '1rem'
                          }} 
                        />
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                          <label style={{ 
                            padding: '0.5rem 1rem',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={handleVideoUpload}
                              style={{ display: 'none' }}
                            />
                            Change Video
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setVideoFile(null);
                              setVideoPreview('');
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label style={{ cursor: 'pointer', width: '100%' }}>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          style={{ display: 'none' }}
                        />
                        <svg style={{ width: '64px', height: '64px', margin: '0 auto 1rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                          Click to upload video
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          MP4, MOV, AVI, MKV, WEBM up to 100MB
                        </p>
                      </label>
                    )}
                  </div>
                )}

                {/* Upload Progress */}
                {uploadingVideo && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Uploading...</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4f46e5' }}>{uploadProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${uploadProgress}%`, 
                        height: '100%', 
                        backgroundColor: '#4f46e5',
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div style={{ 
                  backgroundColor: '#eff6ff', 
                  border: '2px solid #bfdbfe', 
                  borderRadius: '0.75rem', 
                  padding: '1rem', 
                  marginTop: '1.5rem' 
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <svg style={{ width: '20px', height: '20px', color: '#3b82f6', flexShrink: 0, marginTop: '0.125rem' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: 600, marginBottom: '0.25rem' }}>
                        Video Tips
                      </p>
                      <ul style={{ fontSize: '0.8125rem', color: '#1e3a8a', margin: '0.5rem 0 0 1rem', paddingLeft: 0, lineHeight: 1.6 }}>
                        <li>Use clear, descriptive titles</li>
                        <li>Duration is auto-detected from video</li>
                        <li>Ensure good audio quality</li>
                        <li>Test video playback before saving</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
              <button
                type="button"
                onClick={() => {
                  setShowAddLecture(false);
                  resetLectureForm();
                }}
                style={{
                  padding: '0.875rem 2rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addingLecture || uploadingVideo || uploadingThumbnail}
                style={{
                  padding: '0.875rem 2rem',
                  background: (addingLecture || uploadingVideo || uploadingThumbnail) ? '#9ca3af' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: (addingLecture || uploadingVideo || uploadingThumbnail) ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!addingLecture && !uploadingVideo && !uploadingThumbnail) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.3)';
                }}
              >
                {addingLecture ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                    Adding Lecture...
                  </>
                ) : uploadingVideo ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                    Uploading Video...
                  </>
                ) : uploadingThumbnail ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                    Uploading Thumbnail...
                  </>
                ) : (
                  <>
                    <Plus style={{ width: 20, height: 20 }} />
                    Add Lecture
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // View Quiz Page
  if (viewingQuiz && showCourseDetail) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', padding: '1.75rem 2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Quiz Review
              </h1>
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>
                Course: {showCourseDetail.title}
              </p>
            </div>
            <button
              onClick={() => setViewingQuiz(null)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9375rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            >
              ← Back to Quizzes
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            {/* Quiz Info */}
            <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                {viewingQuiz.title}
              </h2>
              {viewingQuiz.description && (
                <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                  {viewingQuiz.description}
                </p>
              )}
              
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock style={{ width: 20, height: 20, color: '#f59e0b' }} />
                  <span style={{ fontSize: '0.9375rem', color: '#374151' }}>
                    <strong>{viewingQuiz.timerMinutes}</strong> minutes
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target style={{ width: 20, height: 20, color: '#f59e0b' }} />
                  <span style={{ fontSize: '0.9375rem', color: '#374151' }}>
                    <strong>{viewingQuiz.questions.length}</strong> questions
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {viewingQuiz.allowRetake ? (
                    <>
                      <CheckCircle style={{ width: 20, height: 20, color: '#10b981' }} />
                      <span style={{ fontSize: '0.9375rem', color: '#10b981', fontWeight: 600 }}>
                        Retake allowed
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle style={{ width: 20, height: 20, color: '#ef4444' }} />
                      <span style={{ fontSize: '0.9375rem', color: '#ef4444', fontWeight: 600 }}>
                        No retake
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => handleEditQuiz(viewingQuiz)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9375rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                >
                  <Edit style={{ width: 18, height: 18 }} />
                  Edit Quiz
                </button>
                <button
                  onClick={() => {
                    setDeletingQuiz(viewingQuiz);
                    setShowDeleteQuizConfirm(true);
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9375rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                >
                  <Trash2 style={{ width: 18, height: 18 }} />
                  Delete Quiz
                </button>
              </div>
            </div>

            {/* Questions */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>
                Questions & Answers
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {viewingQuiz.questions.map((question, qIndex) => (
                  <div
                    key={qIndex}
                    style={{
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      backgroundColor: '#f9fafb'
                    }}
                  >
                    {/* Question */}
                    <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        flexShrink: 0
                      }}>
                        {qIndex + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', lineHeight: 1.6 }}>
                          {question.questionText}
                        </p>
                      </div>
                    </div>

                    {/* Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginLeft: '3rem' }}>
                      {question.options.map((option, oIndex) => {
                        const isCorrect = question.correctAnswer === oIndex;
                        return (
                          <div
                            key={oIndex}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.875rem 1rem',
                              backgroundColor: isCorrect ? '#d1fae5' : 'white',
                              border: `2px solid ${isCorrect ? '#6ee7b7' : '#e5e7eb'}`,
                              borderRadius: '0.5rem',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: isCorrect ? '#10b981' : '#d1d5db',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '0.8125rem',
                              flexShrink: 0
                            }}>
                              {String.fromCharCode(65 + oIndex)}
                            </div>
                            
                            <span style={{
                              flex: 1,
                              fontSize: '0.9375rem',
                              color: '#111827'
                            }}>
                              {option}
                            </span>
                            
                            {isCorrect && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                backgroundColor: '#10b981',
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}>
                                <CheckCircle style={{ width: 14, height: 14 }} />
                                CORRECT
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteQuizConfirm && deletingQuiz && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2002,
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '450px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <AlertCircle style={{ width: 32, height: 32, color: '#dc2626' }} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                  Delete Quiz?
                </h3>
                <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: 1.6 }}>
                  Are you sure you want to delete "{deletingQuiz.title}"? This action cannot be undone and all student attempts will be lost.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => {
                    setShowDeleteQuizConfirm(false);
                    setDeletingQuiz(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    backgroundColor: 'white',
                    color: '#374151',
                    border: '2px solid #d1d5db',
                    borderRadius: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteQuiz}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                >
                  <Trash2 style={{ width: 18, height: 18 }} />
                  Delete Quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Edit Quiz Page
  if (editingQuiz && editQuizForm && showCourseDetail) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', padding: '1.75rem 2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Edit Quiz
              </h1>
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>
                Course: {showCourseDetail.title}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingQuiz(null);
                setEditQuizForm(null);
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9375rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            >
              ← Back to Quizzes
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem' }}>
          <form onSubmit={handleUpdateQuiz} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            
            {/* Quiz Details Section */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target style={{ width: 24, height: 24, color: '#3b82f6' }} />
                Quiz Details
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Quiz Title */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    value={editQuizForm.title}
                    onChange={(e) => setEditQuizForm({ ...editQuizForm, title: e.target.value })}
                    placeholder="e.g., Module 1 Assessment"
                    required
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                    Description <span style={{ color: '#9ca3af', fontWeight: 400 }}>- Optional</span>
                  </label>
                  <textarea
                    value={editQuizForm.description}
                    onChange={(e) => setEditQuizForm({ ...editQuizForm, description: e.target.value })}
                    placeholder="Brief description of what this quiz covers..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Timer & Retake */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                      Time Limit (minutes) *
                    </label>
                    <input
                      type="number"
                      value={editQuizForm.timerMinutes}
                      onChange={(e) => setEditQuizForm({ ...editQuizForm, timerMinutes: e.target.value })}
                      placeholder="30"
                      required
                      min="1"
                      max="180"
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                      Allow Retake
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '3.125rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          checked={editQuizForm.allowRetake === true}
                          onChange={() => setEditQuizForm({ ...editQuizForm, allowRetake: true })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.9375rem', color: '#374151' }}>Yes</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          checked={editQuizForm.allowRetake === false}
                          onChange={() => setEditQuizForm({ ...editQuizForm, allowRetake: false })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.9375rem', color: '#374151' }}>No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions Section */}
            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '2.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  Questions ({editQuizForm.questions.length})
                </h3>
                <button
                  type="button"
                  onClick={addEditQuestion}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(59,130,246,0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.3)';
                  }}
                >
                  <Plus style={{ width: 16, height: 16 }} />
                  Add Question
                </button>
              </div>

              {/* Questions List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {editQuizForm.questions.map((question, qIndex) => (
                  <div
                    key={qIndex}
                    style={{
                      border: `2px solid ${editExpandedQuestion === qIndex ? '#3b82f6' : '#e5e7eb'}`,
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      backgroundColor: editExpandedQuestion === qIndex ? '#eff6ff' : 'white'
                    }}
                  >
                    {/* Question Header */}
                    <div
                      onClick={() => setEditExpandedQuestion(editExpandedQuestion === qIndex ? -1 : qIndex)}
                      style={{
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        backgroundColor: editExpandedQuestion === qIndex ? '#dbeafe' : '#f9fafb',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (editExpandedQuestion !== qIndex) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (editExpandedQuestion !== qIndex) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: editExpandedQuestion === qIndex ? '#3b82f6' : '#e5e7eb',
                          color: editExpandedQuestion === qIndex ? 'white' : '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                          flexShrink: 0
                        }}>
                          {qIndex + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
                            {question.questionText || `Question ${qIndex + 1}`}
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                            {question.options.filter(opt => opt.trim()).length} options • Correct answer: Option {question.correctAnswer + 1}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {editQuizForm.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeEditQuestion(qIndex);
                            }}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                          >
                            <Trash2 style={{ width: 16, height: 16 }} />
                          </button>
                        )}
                        <ChevronRight
                          style={{
                            width: 20,
                            height: 20,
                            color: '#9ca3af',
                            transform: editExpandedQuestion === qIndex ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                          }}
                        />
                      </div>
                    </div>

                    {/* Question Content */}
                    {editExpandedQuestion === qIndex && (
                      <div style={{ padding: '1.5rem 1.25rem', backgroundColor: 'white' }}>
                        {/* Question Text */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                            Question Text *
                          </label>
                          <textarea
                            value={question.questionText}
                            onChange={(e) => updateEditQuestion(qIndex, 'questionText', e.target.value)}
                            placeholder="Enter your question here..."
                            rows={3}
                            required
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '2px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              fontSize: '0.9375rem',
                              outline: 'none',
                              transition: 'border-color 0.2s',
                              resize: 'vertical',
                              fontFamily: 'inherit',
                              boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>

                        {/* Options */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <label style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                              Answer Options * (Select correct answer)
                            </label>
                            <button
                              type="button"
                              onClick={() => addEditOption(qIndex)}
                              disabled={question.options.length >= 6}
                              style={{
                                padding: '0.375rem 0.875rem',
                                backgroundColor: question.options.length >= 6 ? '#e5e7eb' : '#dbeafe',
                                color: question.options.length >= 6 ? '#9ca3af' : '#2563eb',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontWeight: 600,
                                cursor: question.options.length >= 6 ? 'not-allowed' : 'pointer',
                                fontSize: '0.8125rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                if (question.options.length < 6) {
                                  e.currentTarget.style.backgroundColor = '#bfdbfe';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (question.options.length < 6) {
                                  e.currentTarget.style.backgroundColor = '#dbeafe';
                                }
                              }}
                            >
                              <Plus style={{ width: 14, height: 14 }} />
                              Add Option
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {question.options.map((option, oIndex) => (
                              <div
                                key={oIndex}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.75rem',
                                  padding: '0.75rem',
                                  backgroundColor: question.correctAnswer === oIndex ? '#d1fae5' : '#f9fafb',
                                  border: `2px solid ${question.correctAnswer === oIndex ? '#6ee7b7' : '#e5e7eb'}`,
                                  borderRadius: '0.5rem',
                                  transition: 'all 0.2s'
                                }}
                              >
                                {/* Radio Button */}
                                <input
                                  type="radio"
                                  name={`edit-question-${qIndex}-correct`}
                                  checked={question.correctAnswer === oIndex}
                                  onChange={() => setEditCorrectAnswer(qIndex, oIndex)}
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    cursor: 'pointer',
                                    accentColor: '#10b981',
                                    flexShrink: 0
                                  }}
                                />

                                {/* Option Label */}
                                <div style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  backgroundColor: question.correctAnswer === oIndex ? '#10b981' : '#d1d5db',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 'bold',
                                  fontSize: '0.8125rem',
                                  flexShrink: 0
                                }}>
                                  {String.fromCharCode(65 + oIndex)}
                                </div>

                                {/* Option Input */}
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateEditOption(qIndex, oIndex, e.target.value)}
                                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                  required
                                  style={{
                                    flex: 1,
                                    padding: '0.625rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.9375rem',
                                    outline: 'none',
                                    backgroundColor: 'white'
                                  }}
                                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                />

                                {/* Delete Option */}
                                {question.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeEditOption(qIndex, oIndex)}
                                    style={{
                                      padding: '0.375rem',
                                      backgroundColor: '#fee2e2',
                                      color: '#dc2626',
                                      border: 'none',
                                      borderRadius: '0.375rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s',
                                      flexShrink: 0
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <line x1="18" y1="6" x2="6" y2="18"/>
                                      <line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          {question.correctAnswer !== undefined && question.options[question.correctAnswer] && (
                            <div style={{ 
                              marginTop: '0.75rem', 
                              padding: '0.625rem 0.875rem', 
                              backgroundColor: '#d1fae5',
                              border: '1px solid #a7f3d0',
                              borderRadius: '0.375rem',
                              fontSize: '0.8125rem',
                              color: '#065f46',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <CheckCircle style={{ width: 16, height: 16, color: '#10b981' }} />
                              Correct Answer: <strong>Option {String.fromCharCode(65 + question.correctAnswer)}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
              <button
                type="button"
                onClick={() => {
                  setEditingQuiz(null);
                  setEditQuizForm(null);
                }}
                style={{
                  padding: '0.875rem 2rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingQuiz}
                style={{
                  padding: '0.875rem 2rem',
                  background: updatingQuiz ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: updatingQuiz ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!updatingQuiz) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.3)';
                }}
              >
                {updatingQuiz ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                    Updating Quiz...
                  </>
                ) : (
                  <>
                    <CheckCircle style={{ width: 20, height: 20 }} />
                    Update Quiz
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Create Quiz Page
  if (showCreateQuiz && showCourseDetail) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Create New Quiz
              </h1>
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>
                Course: {showCourseDetail.title}
              </p>
            </div>
            <button
              onClick={() => {
                setShowCreateQuiz(false);
                resetQuizForm();
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9375rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            >
              ← Back to Course
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem' }}>
          <form onSubmit={handleCreateQuiz} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            
            {/* Quiz Details Section */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target style={{ width: 24, height: 24, color: '#f59e0b' }} />
                Quiz Details
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Quiz Title */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    placeholder="e.g., Module 1 Assessment"
                    required
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                    Description <span style={{ color: '#9ca3af', fontWeight: 400 }}>- Optional</span>
                  </label>
                  <textarea
                    value={quizForm.description}
                    onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                    placeholder="Brief description of what this quiz covers..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Timer & Retake */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                      Time Limit (minutes) *
                    </label>
                    <input
                      type="number"
                      value={quizForm.timerMinutes}
                      onChange={(e) => setQuizForm({ ...quizForm, timerMinutes: e.target.value })}
                      placeholder="30"
                      required
                      min="1"
                      max="180"
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                      Allow Retake
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '3.125rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          checked={quizForm.allowRetake === true}
                          onChange={() => setQuizForm({ ...quizForm, allowRetake: true })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.9375rem', color: '#374151' }}>Yes</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          checked={quizForm.allowRetake === false}
                          onChange={() => setQuizForm({ ...quizForm, allowRetake: false })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.9375rem', color: '#374151' }}>No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions Section */}
            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '2.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  Questions ({quizForm.questions.length})
                </h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(245,158,11,0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(245,158,11,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(245,158,11,0.3)';
                  }}
                >
                  <Plus style={{ width: 16, height: 16 }} />
                  Add Question
                </button>
              </div>

              {/* Questions List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {quizForm.questions.map((question, qIndex) => (
                  <div
                    key={qIndex}
                    style={{
                      border: `2px solid ${expandedQuestion === qIndex ? '#f59e0b' : '#e5e7eb'}`,
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      backgroundColor: expandedQuestion === qIndex ? '#fffbeb' : 'white'
                    }}
                  >
                    {/* Question Header */}
                    <div
                      onClick={() => setExpandedQuestion(expandedQuestion === qIndex ? -1 : qIndex)}
                      style={{
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        backgroundColor: expandedQuestion === qIndex ? '#fef3c7' : '#f9fafb',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (expandedQuestion !== qIndex) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (expandedQuestion !== qIndex) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: expandedQuestion === qIndex ? '#f59e0b' : '#e5e7eb',
                          color: expandedQuestion === qIndex ? 'white' : '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                          flexShrink: 0
                        }}>
                          {qIndex + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
                            {question.questionText || `Question ${qIndex + 1}`}
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                            {question.options.filter(opt => opt.trim()).length} options • Correct answer: Option {question.correctAnswer + 1}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {quizForm.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeQuestion(qIndex);
                            }}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                          >
                            <Trash2 style={{ width: 16, height: 16 }} />
                          </button>
                        )}
                        <ChevronRight
                          style={{
                            width: 20,
                            height: 20,
                            color: '#9ca3af',
                            transform: expandedQuestion === qIndex ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                          }}
                        />
                      </div>
                    </div>

                    {/* Question Content */}
                    {expandedQuestion === qIndex && (
                      <div style={{ padding: '1.5rem 1.25rem', backgroundColor: 'white' }}>
                        {/* Question Text */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                            Question Text *
                          </label>
                          <textarea
                            value={question.questionText}
                            onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                            placeholder="Enter your question here..."
                            rows={3}
                            required
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '2px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              fontSize: '0.9375rem',
                              outline: 'none',
                              transition: 'border-color 0.2s',
                              resize: 'vertical',
                              fontFamily: 'inherit',
                              boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>

                        {/* Options */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <label style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                              Answer Options * (Select correct answer)
                            </label>
                            <button
                              type="button"
                              onClick={() => addOption(qIndex)}
                              disabled={question.options.length >= 6}
                              style={{
                                padding: '0.375rem 0.875rem',
                                backgroundColor: question.options.length >= 6 ? '#e5e7eb' : '#fef3c7',
                                color: question.options.length >= 6 ? '#9ca3af' : '#d97706',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontWeight: 600,
                                cursor: question.options.length >= 6 ? 'not-allowed' : 'pointer',
                                fontSize: '0.8125rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                if (question.options.length < 6) {
                                  e.currentTarget.style.backgroundColor = '#fde68a';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (question.options.length < 6) {
                                  e.currentTarget.style.backgroundColor = '#fef3c7';
                                }
                              }}
                            >
                              <Plus style={{ width: 14, height: 14 }} />
                              Add Option
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {question.options.map((option, oIndex) => (
                              <div
                                key={oIndex}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.75rem',
                                  padding: '0.75rem',
                                  backgroundColor: question.correctAnswer === oIndex ? '#d1fae5' : '#f9fafb',
                                  border: `2px solid ${question.correctAnswer === oIndex ? '#6ee7b7' : '#e5e7eb'}`,
                                  borderRadius: '0.5rem',
                                  transition: 'all 0.2s'
                                }}
                              >
                                {/* Radio Button */}
                                <input
                                  type="radio"
                                  name={`question-${qIndex}-correct`}
                                  checked={question.correctAnswer === oIndex}
                                  onChange={() => setCorrectAnswer(qIndex, oIndex)}
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    cursor: 'pointer',
                                    accentColor: '#10b981',
                                    flexShrink: 0
                                  }}
                                />

                                {/* Option Label */}
                                <div style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  backgroundColor: question.correctAnswer === oIndex ? '#10b981' : '#d1d5db',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 'bold',
                                  fontSize: '0.8125rem',
                                  flexShrink: 0
                                }}>
                                  {String.fromCharCode(65 + oIndex)}
                                </div>

                                {/* Option Input */}
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                  required
                                  style={{
                                    flex: 1,
                                    padding: '0.625rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.9375rem',
                                    outline: 'none',
                                    backgroundColor: 'white'
                                  }}
                                  onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                />

                                {/* Delete Option */}
                                {question.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeOption(qIndex, oIndex)}
                                    style={{
                                      padding: '0.375rem',
                                      backgroundColor: '#fee2e2',
                                      color: '#dc2626',
                                      border: 'none',
                                      borderRadius: '0.375rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s',
                                      flexShrink: 0
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <line x1="18" y1="6" x2="6" y2="18"/>
                                      <line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          {question.correctAnswer !== undefined && question.options[question.correctAnswer] && (
                            <div style={{ 
                              marginTop: '0.75rem', 
                              padding: '0.625rem 0.875rem', 
                              backgroundColor: '#d1fae5',
                              border: '1px solid #a7f3d0',
                              borderRadius: '0.375rem',
                              fontSize: '0.8125rem',
                              color: '#065f46',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <CheckCircle style={{ width: 16, height: 16, color: '#10b981' }} />
                              Correct Answer: <strong>Option {String.fromCharCode(65 + question.correctAnswer)}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div style={{ 
              backgroundColor: '#eff6ff', 
              border: '2px solid #bfdbfe', 
              borderRadius: '0.75rem', 
              padding: '1rem', 
              marginBottom: '2rem' 
            }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <svg style={{ width: '20px', height: '20px', color: '#3b82f6', flexShrink: 0, marginTop: '0.125rem' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Quiz Creation Tips
                  </p>
                  <ul style={{ fontSize: '0.8125rem', color: '#1e3a8a', margin: '0.5rem 0 0 1rem', paddingLeft: 0, lineHeight: 1.6 }}>
                    <li>Click on a question card to expand and edit it</li>
                    <li>Each question must have at least 2 options</li>
                    <li>Select the correct answer using radio buttons</li>
                    <li>Students will see questions in the order you create them</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
              <button
                type="button"
                onClick={() => {
                  setShowCreateQuiz(false);
                  resetQuizForm();
                }}
                style={{
                  padding: '0.875rem 2rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingQuiz}
                style={{
                  padding: '0.875rem 2rem',
                  background: creatingQuiz ? '#9ca3af' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: creatingQuiz ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(245,158,11,0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!creatingQuiz) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(245,158,11,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245,158,11,0.3)';
                }}
              >
                {creatingQuiz ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                    Creating Quiz...
                  </>
                ) : (
                  <>
                    <CheckCircle style={{ width: 20, height: 20 }} />
                    Create Quiz
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Edit Course Page
  if (isEditingCourse && editCourseData) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Edit Course
              </h1>
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>
                Update course details and thumbnail
              </p>
            </div>
            <button
              onClick={() => {
                setIsEditingCourse(false);
                setEditCourseData(null);
                setImageFile(null);
                setImagePreview('');
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9375rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            >
              ← Back to Course
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
          <form onSubmit={handleUpdateCourse} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Course Title */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={editCourseData.title}
                    onChange={(e) => setEditCourseData({ ...editCourseData, title: e.target.value })}
                    placeholder="e.g., Complete Web Development Bootcamp"
                    required
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                    Description *
                  </label>
                  <textarea
                    value={editCourseData.description}
                    onChange={(e) => setEditCourseData({ ...editCourseData, description: e.target.value })}
                    placeholder="Describe what students will learn in this course..."
                    required
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Category & Level */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                      Category *
                    </label>
                    <select
                      value={editCourseData.category}
                      onChange={(e) => setEditCourseData({ ...editCourseData, category: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none',
                        cursor: 'pointer',
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="development">Development</option>
                      <option value="design">Design</option>
                      <option value="business">Business</option>
                      <option value="marketing">Marketing</option>
                      <option value="data-science">Data Science</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                      Level *
                    </label>
                    <select
                      value={editCourseData.level}
                      onChange={(e) => setEditCourseData({ ...editCourseData, level: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none',
                        cursor: 'pointer',
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={editCourseData.price}
                    onChange={(e) => setEditCourseData({ ...editCourseData, price: e.target.value })}
                    placeholder="499"
                    required
                    min="0"
                    step="1"
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    💡 Course duration is automatically calculated from lectures and quizzes
                  </p>
                </div>

                {/* Number of Lessons & Discount */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                      Number of Lessons
                    </label>
                    <input
                      type="number"
                      value={editCourseData.lessons}
                      onChange={(e) => setEditCourseData({ ...editCourseData, lessons: e.target.value })}
                      placeholder="e.g., 50"
                      min="0"
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#10b981'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                      Discount (%) <span style={{ color: '#9ca3af', fontWeight: 400 }}>- Optional</span>
                    </label>
                    <input
                      type="number"
                      value={editCourseData.discount || ''}
                      onChange={(e) => setEditCourseData({ ...editCourseData, discount: e.target.value })}
                      placeholder="e.g., 30"
                      min="0"
                      max="100"
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#10b981'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>

                {/* Discounted Price Preview */}
                {editCourseData.discount && editCourseData.price && (
                  <div style={{ 
                    backgroundColor: '#d1fae5', 
                    border: '2px solid #86efac', 
                    borderRadius: '0.75rem', 
                    padding: '1rem', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        backgroundColor: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                          <line x1="7" y1="7" x2="7.01" y2="7"/>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8125rem', color: '#047857', fontWeight: 600, marginBottom: '0.125rem' }}>
                          Discounted Price
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ 
                            fontSize: '1rem', 
                            color: '#6b7280', 
                            textDecoration: 'line-through',
                            textDecorationThickness: '2px'
                          }}>
                            ₹{editCourseData.price}
                          </span>
                          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#047857' }}>
                            ₹{(editCourseData.price * (1 - editCourseData.discount / 100)).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ 
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '0.375rem 0.875rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                    }}>
                      {editCourseData.discount}% OFF
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Image Upload */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                  Course Thumbnail
                </label>
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '0.75rem',
                  padding: '2rem',
                  textAlign: 'center',
                  backgroundColor: '#f9fafb',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  minHeight: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.backgroundColor = '#f0fff4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}>
                  {imagePreview ? (
                    <div style={{ width: '100%' }}>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{ 
                          width: '100%', 
                          height: '300px', 
                          objectFit: 'cover', 
                          borderRadius: '0.5rem',
                          marginBottom: '1rem'
                        }} 
                      />
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                        <label style={{ 
                          padding: '0.5rem 1rem',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                          />
                          Change Image
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(editCourseData.image);
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          Reset to Original
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label style={{ cursor: 'pointer', width: '100%' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <svg style={{ width: '64px', height: '64px', margin: '0 auto 1rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                        Click to upload course thumbnail
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </label>
                  )}
                </div>

                {/* Info Box */}
                <div style={{ 
                  backgroundColor: '#f0f9ff', 
                  border: '2px solid #bae6fd', 
                  borderRadius: '0.75rem', 
                  padding: '1rem', 
                  marginTop: '1.5rem' 
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <svg style={{ width: '20px', height: '20px', color: '#0284c7', flexShrink: 0, marginTop: '0.125rem' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#0c4a6e', fontWeight: 600, marginBottom: '0.25rem' }}>
                        Update Tips
                      </p>
                      <ul style={{ fontSize: '0.8125rem', color: '#075985', margin: '0.5rem 0 0 1rem', paddingLeft: 0, lineHeight: 1.6 }}>
                        <li>Update any field you want to change</li>
                        <li>Upload new thumbnail if needed</li>
                        <li>Changes are saved immediately</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
              <button
                type="button"
                onClick={() => {
                  setIsEditingCourse(false);
                  setEditCourseData(null);
                  setImageFile(null);
                  setImagePreview('');
                }}
                style={{
                  padding: '0.875rem 2rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingCourse}
                style={{
                  padding: '0.875rem 2rem',
                  background: updatingCourse ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: updatingCourse ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!updatingCourse) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)';
                }}
              >
                {updatingCourse ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                    Updating Course...
                  </>
                ) : (
                  <>
                    <CheckCircle style={{ width: 20, height: 20 }} />
                    Update Course
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Course Detail Page
  if (showCourseDetail) {
    const course = showCourseDetail;

    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', padding: '1.5rem 2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Course Info in Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 340px', gap: '1.75rem', alignItems: 'center' }}>
              {/* Thumbnail + Duration */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <img 
                  src={course.image} 
                  alt={course.title} 
                  style={{ 
                    width: '280px', 
                    height: '175px', 
                    objectFit: 'cover', 
                    borderRadius: '0.75rem',
                    border: '3px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                  }} 
                />
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.25)', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '0.5rem', 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  backdropFilter: 'blur(10px)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '0.5rem', 
                  border: '1.5px solid rgba(255,255,255,0.3)' 
                }}>
                  <Clock style={{ width: 16, height: 16 }} />
                  {course.duration}
                </div>
              </div>

              {/* Course Details */}
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white', margin: '0 0 0.625rem 0', letterSpacing: '-0.025em' }}>
                  {course.title}
                </h2>
                <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.95)', margin: '0 0 1.25rem 0', maxWidth: '700px', lineHeight: 1.6 }}>
                  {course.description}
                </p>
                
                {/* All Course Info Badges - Professional Layout */}
                <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Rating Badge */}
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.25) 100%)',
                    padding: '0.625rem 1.125rem', 
                    borderRadius: '0.625rem', 
                    fontSize: '0.9375rem', 
                    fontWeight: 600, 
                    backdropFilter: 'blur(10px)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    border: '2px solid rgba(251, 191, 36, 0.4)',
                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.15)'
                  }}>
                    <Star style={{ width: 18, height: 18, fill: '#fbbf24', color: '#fbbf24' }} />
                    <span>{course.rating || 0} Rating</span>
                  </div>
                  
                  {/* Lessons Badge */}
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(124, 58, 237, 0.3) 100%)',
                    padding: '0.625rem 1.125rem', 
                    borderRadius: '0.625rem', 
                    fontSize: '0.9375rem', 
                    fontWeight: 600, 
                    backdropFilter: 'blur(10px)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    border: '2px solid rgba(167, 139, 250, 0.5)',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
                  }}>
                    <BookOpen style={{ width: 18, height: 18 }} />
                    <span>{course.lessons || 0} Lessons</span>
                  </div>
                  
                  {/* Category Badge */}
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.3) 100%)',
                    padding: '0.625rem 1.125rem', 
                    borderRadius: '0.625rem', 
                    fontSize: '0.9375rem', 
                    fontWeight: 600, 
                    backdropFilter: 'blur(10px)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    border: '2px solid rgba(96, 165, 250, 0.5)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                    textTransform: 'capitalize'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                    <span>{course.category}</span>
                  </div>
                  
                  {/* Level Badge */}
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.3) 100%)',
                    padding: '0.625rem 1.125rem', 
                    borderRadius: '0.625rem', 
                    fontSize: '0.9375rem', 
                    fontWeight: 600, 
                    backdropFilter: 'blur(10px)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    border: '2px solid rgba(52, 211, 153, 0.5)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    <span>{course.level}</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Price and Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {/* Professional Price Card */}
                <div style={{ 
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  padding: '1rem 1.25rem', 
                  borderRadius: '0.75rem', 
                  textAlign: 'center',
                  boxShadow: '0 6px 16px rgba(99, 102, 241, 0.25)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Decorative circles */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '-10px', 
                    right: '-10px', 
                    width: '50px', 
                    height: '50px', 
                    background: 'rgba(255,255,255,0.08)', 
                    borderRadius: '50%' 
                  }}></div>
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '-15px', 
                    left: '-15px', 
                    width: '60px', 
                    height: '60px', 
                    background: 'rgba(255,255,255,0.06)', 
                    borderRadius: '50%' 
                  }}></div>
                  
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: 700, 
                      color: 'white', 
                      marginBottom: '0.5rem', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.1em'
                    }}>
                      PRICE
                    </div>
                    
                    {course.discount && course.discount > 0 ? (
                      <>
                        <div style={{ marginBottom: '0.375rem' }}>
                          <div style={{ 
                            fontSize: '0.9375rem', 
                            fontWeight: 600, 
                            color: 'rgba(255,255,255,0.65)', 
                            textDecoration: 'line-through',
                            textDecorationThickness: '2px',
                            textDecorationColor: '#ef4444',
                            display: 'inline-block'
                          }}>
                            ₹{course.price}
                          </div>
                        </div>
                        <div style={{ 
                          fontSize: '1.875rem', 
                          fontWeight: 'bold', 
                          color: 'white', 
                          lineHeight: 1,
                          marginBottom: '0.5rem',
                          textShadow: '0 2px 6px rgba(0,0,0,0.15)'
                        }}>
                          ₹{Math.round(course.price * (1 - course.discount / 100))}
                        </div>
                        <div style={{ 
                          backgroundColor: 'rgba(239, 68, 68, 0.95)',
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.6875rem', 
                          fontWeight: 700, 
                          color: 'white',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          boxShadow: '0 2px 6px rgba(239, 68, 68, 0.35)',
                          border: '1.5px solid rgba(255,255,255,0.25)'
                        }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                            <line x1="7" y1="7" x2="7.01" y2="7"/>
                          </svg>
                          {course.discount}% OFF
                        </div>
                      </>
                    ) : (
                      <div style={{ 
                        fontSize: '1.875rem', 
                        fontWeight: 'bold', 
                        color: 'white',
                        lineHeight: 1,
                        textShadow: '0 2px 6px rgba(0,0,0,0.15)'
                      }}>
                        ₹{course.price}
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit and Delete Buttons - Side by Side */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleEditCourseClick(course)}
                    style={{
                      flex: 1,
                      padding: '0.875rem 1rem',
                      backgroundColor: 'white',
                      color: '#10b981',
                      border: '2px solid #a7f3d0',
                      borderRadius: '0.625rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.9375rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s',
                      boxShadow: '0 3px 10px rgba(16, 185, 129, 0.15)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#d1fae5';
                      e.currentTarget.style.borderColor = '#6ee7b7';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 5px 14px rgba(16,185,129,0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#a7f3d0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 3px 10px rgba(16, 185, 129, 0.15)';
                    }}
                  >
                    <Edit style={{ width: 18, height: 18 }} />
                    Edit Course
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                      flex: 1,
                      padding: '0.875rem 1rem',
                      backgroundColor: 'white',
                      color: '#dc2626',
                      border: '2px solid #fca5a5',
                      borderRadius: '0.625rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.9375rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s',
                      boxShadow: '0 3px 10px rgba(220, 38, 38, 0.15)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fee2e2';
                      e.currentTarget.style.borderColor = '#f87171';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 5px 14px rgba(220,38,38,0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#fca5a5';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 3px 10px rgba(220, 38, 38, 0.15)';
                    }}
                  >
                    <Trash2 style={{ width: 18, height: 18 }} />
                    Delete Course
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          {/* Modern Professional Tabs */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              padding: '0.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #e9ecef'
            }}>
              {/* Lectures Tab */}
              <button
                onClick={() => setActiveCourseSection('lectures')}
                style={{
                  flex: 1,
                  padding: '1rem 1.5rem',
                  background: activeCourseSection === 'lectures' 
                    ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' 
                    : 'transparent',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: activeCourseSection === 'lectures' ? 'white' : '#6b7280',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.625rem',
                  fontSize: '1rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: activeCourseSection === 'lectures' 
                    ? '0 8px 16px rgba(79,70,229,0.25), 0 4px 8px rgba(79,70,229,0.15)' 
                    : 'none',
                  transform: activeCourseSection === 'lectures' ? 'translateY(-2px)' : 'translateY(0)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (activeCourseSection !== 'lectures') {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCourseSection !== 'lectures') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {activeCourseSection === 'lectures' && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                    pointerEvents: 'none'
                  }} />
                )}
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '0.5rem',
                  background: activeCourseSection === 'lectures' 
                    ? 'rgba(255,255,255,0.2)' 
                    : 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <Play style={{ width: 18, height: 18, color: activeCourseSection === 'lectures' ? 'white' : '#7c3aed' }} />
                </div>
                <span style={{ position: 'relative', zIndex: 1 }}>Lectures</span>
              </button>

              {/* Quizzes Tab */}
              <button
                onClick={() => setActiveCourseSection('quizzes')}
                style={{
                  flex: 1,
                  padding: '1rem 1.5rem',
                  background: activeCourseSection === 'quizzes' 
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                    : 'transparent',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: activeCourseSection === 'quizzes' ? 'white' : '#6b7280',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.625rem',
                  fontSize: '1rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: activeCourseSection === 'quizzes' 
                    ? '0 8px 16px rgba(245,158,11,0.25), 0 4px 8px rgba(245,158,11,0.15)' 
                    : 'none',
                  transform: activeCourseSection === 'quizzes' ? 'translateY(-2px)' : 'translateY(0)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (activeCourseSection !== 'quizzes') {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCourseSection !== 'quizzes') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {activeCourseSection === 'quizzes' && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                    pointerEvents: 'none'
                  }} />
                )}
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '0.5rem',
                  background: activeCourseSection === 'quizzes' 
                    ? 'rgba(255,255,255,0.2)' 
                    : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <Target style={{ width: 18, height: 18, color: activeCourseSection === 'quizzes' ? 'white' : '#d97706' }} />
                </div>
                <span style={{ position: 'relative', zIndex: 1 }}>Quizzes</span>
              </button>

              {/* Enrolled Students Tab */}
              <button
                onClick={() => setActiveCourseSection('students')}
                style={{
                  flex: 1,
                  padding: '1rem 1.5rem',
                  background: activeCourseSection === 'students' 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                    : 'transparent',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: activeCourseSection === 'students' ? 'white' : '#6b7280',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.625rem',
                  fontSize: '1rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: activeCourseSection === 'students' 
                    ? '0 8px 16px rgba(16,185,129,0.25), 0 4px 8px rgba(16,185,129,0.15)' 
                    : 'none',
                  transform: activeCourseSection === 'students' ? 'translateY(-2px)' : 'translateY(0)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (activeCourseSection !== 'students') {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCourseSection !== 'students') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {activeCourseSection === 'students' && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                    pointerEvents: 'none'
                  }} />
                )}
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '0.5rem',
                  background: activeCourseSection === 'students' 
                    ? 'rgba(255,255,255,0.2)' 
                    : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <Users style={{ width: 18, height: 18, color: activeCourseSection === 'students' ? 'white' : '#059669' }} />
                </div>
                <span style={{ position: 'relative', zIndex: 1 }}>Enrolled Students</span>
              </button>
            </div>
          </div>

          {/* Content Sections */}
          {activeCourseSection === 'lectures' && (
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  Course Lectures
                </h3>
                <button
                  onClick={() => {
                    setShowAddLecture(true);
                    setActiveCourseSection('lectures');
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9375rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.3)';
                  }}
                >
                  <Plus style={{ width: 18, height: 18 }} />
                  Add Lecture
                </button>
              </div>

              {/* Lectures List */}
              {lectures.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <Play style={{ width: 64, height: 64, color: '#d1d5db', margin: '0 auto 1rem' }} />
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                    No Lectures Yet
                  </h4>
                  <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                    Start adding lectures to your course
                  </p>
                  <button
                    onClick={() => {
                      setShowAddLecture(true);
                      setActiveCourseSection('lectures');
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.9375rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
                    }}
                  >
                    <Plus style={{ width: 18, height: 18 }} />
                    Add First Lecture
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {lectures.map((lecture, index) => (
                    <div
                      key={lecture._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        backgroundColor: '#f9fafb',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#4f46e5';
                        e.currentTarget.style.backgroundColor = '#f8f9ff';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      {/* Thumbnail */}
                      <div
                        onClick={() => setPlayingVideo(lecture)}
                        style={{
                          width: '120px',
                          height: '68px',
                          borderRadius: '0.5rem',
                          overflow: 'hidden',
                          flexShrink: 0,
                          cursor: 'pointer',
                          position: 'relative',
                          backgroundColor: '#1f2937'
                        }}
                      >
                        {lecture.thumbnail ? (
                          <>
                            <img
                              src={lecture.thumbnail}
                              alt={lecture.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'rgba(0,0,0,0.3)',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)'}
                            >
                              <Play style={{ width: 32, height: 32, color: 'white', fill: 'white' }} />
                            </div>
                          </>
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#4f46e5'
                          }}>
                            <Play style={{ width: 32, height: 32, color: 'white', fill: 'white' }} />
                          </div>
                        )}
                      </div>

                      {/* Lecture Number Badge */}
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        backgroundColor: '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        flexShrink: 0
                      }}>
                        {index + 1}
                      </div>

                      {/* Lecture Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: '0 0 0.25rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lecture.title}
                        </h4>
                        {lecture.description && (
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {lecture.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#6b7280', fontSize: '0.875rem' }}>
                          <Clock style={{ width: 16, height: 16 }} />
                          {lecture.duration}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditLectureClick(lecture);
                            }}
                            style={{
                              padding: '0.625rem 0.75rem',
                              backgroundColor: '#eff6ff',
                              color: '#3b82f6',
                              border: 'none',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              gap: '0.375rem',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#dbeafe';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#eff6ff';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                            title="Edit Lecture"
                          >
                            <Edit style={{ width: 18, height: 18 }} />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingLecture(lecture);
                              setShowDeleteLectureConfirm(true);
                            }}
                            style={{
                              padding: '0.625rem 0.75rem',
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              gap: '0.375rem',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fecaca';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#fee2e2';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                            title="Delete Lecture"
                          >
                            <Trash2 style={{ width: 18, height: 18 }} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        {/* Video Player Modal */}
        {playingVideo && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2001,
              backdropFilter: 'blur(4px)',
              animation: 'fadeIn 0.2s ease-out',
              padding: '2rem'
            }}
            onClick={() => setPlayingVideo(null)}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                maxWidth: '900px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                animation: 'slideIn 0.3s ease-out'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1rem'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 'bold', 
                    color: '#111827', 
                    marginBottom: '0.25rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {playingVideo.title}
                  </h3>
                  {playingVideo.description && (
                    <p style={{ 
                      fontSize: '0.9375rem', 
                      color: '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {playingVideo.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setPlayingVideo(null)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                    marginLeft: '1rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fee2e2';
                    e.currentTarget.style.color = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  ×
                </button>
              </div>

              {/* Video Player */}
              <div style={{ 
                position: 'relative',
                backgroundColor: '#000',
                borderRadius: '0.5rem',
                overflow: 'hidden'
              }}>
                <video
                  src={playingVideo.videoUrl}
                  controls
                  autoPlay
                  style={{
                    width: '100%',
                    maxHeight: '500px',
                    display: 'block'
                  }}
                  onError={(e) => {
                    console.error('Video playback error:', e);
                    showNotification('Failed to load video. Please check the video URL.', 'error');
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Info */}
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <Clock style={{ width: 18, height: 18, color: '#4f46e5', marginRight: '0.5rem' }} />
                <span style={{
                  color: '#6b7280',
                  fontSize: '0.9375rem',
                  fontWeight: 500
                }}>
                  Duration: {playingVideo.duration}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Delete Lecture Confirmation Modal */}
        {showDeleteLectureConfirm && deletingLecture && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2002,
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '450px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <AlertCircle style={{ width: 32, height: 32, color: '#dc2626' }} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                  Delete Lecture?
                </h3>
                <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: 1.6 }}>
                  Are you sure you want to delete "{deletingLecture.title}"? This action cannot be undone.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => {
                    setShowDeleteLectureConfirm(false);
                    setDeletingLecture(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    backgroundColor: 'white',
                    color: '#374151',
                    border: '2px solid #d1d5db',
                    borderRadius: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteLecture}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }}
                >
                  <Trash2 style={{ width: 18, height: 18 }} />
                  Delete Lecture
                </button>
              </div>
            </div>
          </div>
        )}

          {activeCourseSection === 'quizzes' && (
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  Course Quizzes
                </h3>
                <button
                  onClick={() => setShowCreateQuiz(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9375rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(245,158,11,0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(245,158,11,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(245,158,11,0.3)';
                  }}
                >
                  <Plus style={{ width: 18, height: 18 }} />
                  Add Quiz
                </button>
              </div>

              {loadingQuizzes ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    border: '4px solid #f3f4f6',
                    borderTopColor: '#f59e0b',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 1rem'
                  }} />
                  <p style={{ fontSize: '1rem', color: '#6b7280' }}>Loading quizzes...</p>
                </div>
              ) : quizzes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <Target style={{ width: 64, height: 64, color: '#d1d5db', margin: '0 auto 1rem' }} />
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                    No Quizzes Yet
                  </h4>
                  <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                    Create quizzes to test your students' knowledge
                  </p>
                  <button
                    onClick={() => setShowCreateQuiz(true)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.9375rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(245,158,11,0.3)'
                    }}
                  >
                    <Plus style={{ width: 18, height: 18 }} />
                    Create First Quiz
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {quizzes.map((quiz, index) => (
                    <div
                      key={quiz._id}
                      onClick={() => handleViewQuiz(quiz)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1.25rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        backgroundColor: '#f9fafb',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#f59e0b';
                        e.currentTarget.style.backgroundColor = '#fffbeb';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      {/* Quiz Icon */}
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '0.75rem',
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Target style={{ width: 28, height: 28, color: '#f59e0b' }} />
                      </div>

                      {/* Quiz Number Badge */}
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        backgroundColor: '#f59e0b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        flexShrink: 0
                      }}>
                        {index + 1}
                      </div>

                      {/* Quiz Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: '0 0 0.375rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {quiz.title}
                        </h4>
                        {quiz.description && (
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {quiz.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: '#6b7280' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                              <line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                            {quiz.questions?.length || 0} questions
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Clock style={{ width: 14, height: 14 }} />
                            {quiz.timerMinutes} minutes
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            {quiz.allowRetake ? (
                              <>
                                <CheckCircle style={{ width: 14, height: 14, color: '#10b981' }} />
                                <span style={{ color: '#10b981' }}>Retake allowed</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle style={{ width: 14, height: 14, color: '#ef4444' }} />
                                <span style={{ color: '#ef4444' }}>No retake</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditQuiz(quiz);
                          }}
                          style={{
                            padding: '0.625rem 0.75rem',
                            backgroundColor: '#eff6ff',
                            color: '#3b82f6',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            gap: '0.375rem',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#dbeafe';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#eff6ff';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <Edit style={{ width: 16, height: 16 }} />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingQuiz(quiz);
                            setShowDeleteQuizConfirm(true);
                          }}
                          style={{
                            padding: '0.625rem 0.75rem',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            gap: '0.375rem',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fecaca';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fee2e2';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <Trash2 style={{ width: 16, height: 16 }} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeCourseSection === 'students' && (
            <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.25rem 0' }}>
                    Enrolled Students
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                    {enrolledStudents.length} {enrolledStudents.length === 1 ? 'student' : 'students'} enrolled in this course
                  </p>
                </div>
                <div style={{ 
                  padding: '0.75rem 1.25rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  fontSize: '1.25rem',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                }}>
                  {enrolledStudents.length}
                </div>
              </div>

              {loadingStudents ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    border: '4px solid #f3f4f6',
                    borderTopColor: '#4f46e5',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 1rem'
                  }} />
                  <p style={{ fontSize: '1rem', color: '#6b7280' }}>Loading students...</p>
                </div>
              ) : enrolledStudents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <Users style={{ width: 64, height: 64, color: '#d1d5db', margin: '0 auto 1rem' }} />
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                    No Students Enrolled Yet
                  </h4>
                  <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                    Students who enroll in this course will appear here
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          #
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Student Name
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Student ID
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Email
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Enrolled Date
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Progress
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrolledStudents.map((student, index) => (
                        <tr 
                          key={student._id}
                          style={{ 
                            borderBottom: '1px solid #f3f4f6',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '1rem', fontSize: '0.9375rem', color: '#6b7280', fontWeight: 600 }}>
                            {index + 1}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '1rem'
                              }}>
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827' }}>
                                  {student.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: '#eff6ff',
                              color: '#1e40af',
                              borderRadius: '0.375rem',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              fontFamily: 'monospace'
                            }}>
                              {student.userId || 'N/A'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                            {student.email}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                            {new Date(student.enrolledAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ 
                                flex: 1, 
                                height: '8px', 
                                backgroundColor: '#e5e7eb', 
                                borderRadius: '9999px',
                                overflow: 'hidden',
                                maxWidth: '100px'
                              }}>
                                <div style={{
                                  width: `${student.progress || 0}%`,
                                  height: '100%',
                                  backgroundColor: student.progress >= 100 ? '#10b981' : '#4f46e5',
                                  borderRadius: '9999px',
                                  transition: 'width 0.3s'
                                }} />
                              </div>
                              <span style={{ 
                                fontSize: '0.875rem', 
                                fontWeight: 600,
                                color: student.progress >= 100 ? '#10b981' : '#4f46e5',
                                minWidth: '45px'
                              }}>
                                {student.progress || 0}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '450px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <AlertCircle style={{ width: 32, height: 32, color: '#dc2626' }} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                  Delete Course?
                </h3>
                <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: 1.6 }}>
                  Are you sure you want to delete "{course.title}"? This action cannot be undone and all course content will be permanently removed.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deletingCourse}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    backgroundColor: 'white',
                    color: '#374151',
                    border: '2px solid #d1d5db',
                    borderRadius: '0.75rem',
                    fontWeight: 600,
                    cursor: deletingCourse ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!deletingCourse) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCourse}
                  disabled={deletingCourse}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    backgroundColor: deletingCourse ? '#fca5a5' : '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontWeight: 600,
                    cursor: deletingCourse ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!deletingCourse) {
                      e.currentTarget.style.backgroundColor = '#b91c1c';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!deletingCourse) {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                    }
                  }}
                >
                  {deletingCourse ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid white',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite'
                      }} />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 style={{ width: 18, height: 18 }} />
                      Delete Course
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Analytics Page
  if (showAnalyticsPage) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        {/* Analytics Header */}
        <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '500px', height: '500px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', transform: 'translate(30%, -30%)' }}></div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', transform: 'translate(-30%, 30%)' }}></div>
          <div style={{ maxWidth: '80rem', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
                  Analytics Dashboard
                </h1>
                <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                  View detailed insights and performance metrics
                </p>
              </div>
              <button
                onClick={() => setShowAnalyticsPage(false)}
                style={{
                  padding: '0.875rem 1.75rem',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                }}
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
          {/* Analytics Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px solid #e0e7ff', position: 'relative', overflow: 'hidden', animation: 'fadeInUp 0.4s ease-out' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)', borderRadius: '50%', transform: 'translate(40%, -40%)', opacity: 0.3 }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}>
                    <BookOpen style={{ width: 24, height: 24, color: 'white' }} />
                  </div>
                  <TrendingUp style={{ width: 20, height: 20, color: '#10b981' }} />
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
                  {stats.totalCourses}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>Total Courses</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px solid #d1fae5', position: 'relative', overflow: 'hidden', animation: 'fadeInUp 0.4s ease-out 0.1s backwards' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)', borderRadius: '50%', transform: 'translate(40%, -40%)', opacity: 0.3 }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
                    <Users style={{ width: 24, height: 24, color: 'white' }} />
                  </div>
                  <TrendingUp style={{ width: 20, height: 20, color: '#10b981' }} />
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
                  {stats.totalStudents}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>Total Students</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px solid #fef3c7', position: 'relative', overflow: 'hidden', animation: 'fadeInUp 0.4s ease-out 0.2s backwards' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)', borderRadius: '50%', transform: 'translate(40%, -40%)', opacity: 0.3 }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
                    <Star style={{ width: 24, height: 24, color: 'white' }} />
                  </div>
                  <TrendingUp style={{ width: 20, height: 20, color: '#10b981' }} />
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
                  {stats.avgRating}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>Average Rating</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px solid #dbeafe', position: 'relative', overflow: 'hidden', animation: 'fadeInUp 0.4s ease-out 0.3s backwards' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)', borderRadius: '50%', transform: 'translate(40%, -40%)', opacity: 0.3 }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
                    <DollarSign style={{ width: 24, height: 24, color: 'white' }} />
                  </div>
                  <TrendingUp style={{ width: 20, height: 20, color: '#10b981' }} />
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
                  ₹{stats.totalRevenue.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>Total Revenue</div>
              </div>
            </div>
          </div>

          {/* More Analytics Content Coming Soon */}
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '4rem 3rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', animation: 'fadeInUp 0.4s ease-out 0.4s backwards' }}>
            <BarChart style={{ width: 64, height: 64, color: '#d1d5db', margin: '0 auto 1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>
              Detailed Analytics Coming Soon
            </h3>
            <p style={{ fontSize: '1rem', color: '#6b7280' }}>
              Advanced charts, graphs, and insights will be available here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '500px', height: '500px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', transform: 'translate(30%, -30%)' }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', transform: 'translate(-30%, 30%)' }}></div>
        <div style={{ maxWidth: '80rem', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
                Instructor Dashboard
              </h1>
              <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                Welcome back, {user.name}! 👋
              </p>
            </div>
            <button
              onClick={() => setShowAnalyticsPage(true)}
              style={{
                padding: '0.875rem 1.75rem',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
              }}
            >
              <BarChart style={{ width: 20, height: 20 }} />
              Analytics
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Create Course Button */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setShowCreateCourse(true)}
            style={{
              padding: '0.875rem 1.75rem',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.3)';
            }}
          >
            <Plus style={{ width: 20, height: 20 }} />
            Create New Course
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart style={{ width: 18, height: 18 }} /> },
            { id: 'courses', label: 'My Courses', icon: <BookOpen style={{ width: 18, height: 18 }} /> },
            { id: 'students', label: 'Students', icon: <Users style={{ width: 18, height: 18 }} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : 'transparent',
                border: 'none',
                borderRadius: '0.5rem',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.9375rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(79,70,229,0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>
              Quick Overview
            </h2>
            
            {instructorCourses.length === 0 ? (
              <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '4rem 3rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', animation: 'fadeInUp 0.4s ease-out' }}>
                <BookOpen style={{ width: 64, height: 64, color: '#d1d5db', margin: '0 auto 1.5rem' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>
                  No courses yet
                </h3>
                <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                  Start creating your first course to share your knowledge with students
                </p>
                <button
                  onClick={() => setShowCreateCourse(true)}
                  style={{
                    padding: '0.875rem 1.75rem',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.3)';
                  }}
                >
                  Create Your First Course
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Recent Activity */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', animation: 'fadeInUp 0.4s ease-out' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    Recent Activity
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {instructorCourses.slice(0, 3).map((course, idx) => (
                      <div 
                        key={course.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          padding: '1.25rem', 
                          backgroundColor: '#f9fafb', 
                          borderRadius: '0.75rem',
                          border: '2px solid #e5e7eb',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                          animation: `fadeInUp 0.4s ease-out ${idx * 0.1}s backwards`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#4f46e5';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img src={course.image} alt={course.title} style={{ width: '64px', height: '48px', objectFit: 'cover', borderRadius: '0.5rem', border: '2px solid #e5e7eb' }} />
                          <div>
                            <div style={{ fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>{course.title}</div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{course.students} students enrolled</div>
                          </div>
                        </div>
                        <ChevronRight style={{ width: 20, height: 20, color: '#9ca3af' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                My Courses ({filteredCourses.length})
              </h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: 18, height: 18 }} />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ padding: '0.5rem 0.75rem 0.5rem 2.5rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', fontSize: '0.875rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: selectedCategory === cat.id ? '#4f46e5' : 'white',
                    color: selectedCategory === cat.id ? 'white' : '#374151',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    fontSize: '0.875rem'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {filteredCourses.length === 0 ? (
              <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <AlertCircle style={{ width: 48, height: 48, color: '#d1d5db', margin: '0 auto 1rem' }} />
                <p style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 500 }}>No courses found matching your criteria</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {(showAllCourses ? filteredCourses : filteredCourses.slice(0, 6)).map((course, idx) => (
                    <div
                      key={course.id}
                      onClick={() => setShowCourseDetail(course)}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '1rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        overflow: 'hidden',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                        border: '2px solid #f3f4f6',
                        animation: `fadeInUp 0.4s ease-out ${idx * 0.05}s backwards`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                        e.currentTarget.style.borderColor = '#4f46e5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                        e.currentTarget.style.borderColor = '#f3f4f6';
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <img src={course.image} alt={course.title} style={{ width: '100%', height: '12rem', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                          {course.discount > 0 ? (
                            <>
                              <div style={{ backgroundColor: '#ef4444', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, color: 'white', boxShadow: '0 2px 8px rgba(239,68,68,0.4)' }}>
                                {course.discount}% OFF
                              </div>
                              <div style={{ backgroundColor: 'white', padding: '0.375rem 0.75rem', borderRadius: '9999px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', textDecoration: 'line-through', lineHeight: 1 }}>
                                  ₹{course.price}
                                </div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4f46e5', lineHeight: 1, marginTop: '0.125rem' }}>
                                  ₹{Math.round(course.price * (1 - course.discount / 100))}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div style={{ backgroundColor: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, color: '#4f46e5' }}>
                              ₹{course.price}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                          {course.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Users style={{ width: 16, height: 16 }} />
                            <span>{course.students || 0} students</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Star style={{ width: 16, height: 16, color: '#fbbf24', fill: '#fbbf24' }} />
                            <span>{course.rating || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredCourses.length > 6 && (
                  <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button
                      onClick={() => setShowAllCourses(!showAllCourses)}
                      style={{
                        padding: '0.875rem 2rem',
                        background: showAllCourses ? '#f3f4f6' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        color: showAllCourses ? '#374151' : 'white',
                        border: showAllCourses ? '2px solid #d1d5db' : 'none',
                        borderRadius: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'all 0.2s',
                        boxShadow: showAllCourses ? '0 2px 8px rgba(0,0,0,0.08)' : '0 4px 12px rgba(79,70,229,0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = showAllCourses ? '0 4px 12px rgba(0,0,0,0.12)' : '0 6px 20px rgba(79,70,229,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = showAllCourses ? '0 2px 8px rgba(0,0,0,0.08)' : '0 4px 12px rgba(79,70,229,0.3)';
                      }}
                    >
                      {showAllCourses ? 'Show Less' : `Show More Courses (${filteredCourses.length - 6} more)`}
                      <ChevronRight style={{ 
                        width: 20, 
                        height: 20,
                        transform: showAllCourses ? 'rotate(-90deg)' : 'rotate(90deg)',
                        transition: 'transform 0.2s'
                      }} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '4rem 3rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', animation: 'fadeInUp 0.4s ease-out' }}>
            <Users style={{ width: 64, height: 64, color: '#d1d5db', margin: '0 auto 1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>
              Students Section
            </h3>
            <p style={{ fontSize: '1rem', color: '#6b7280' }}>
              Student management features coming soon
            </p>
          </div>
        )}
      </div>

      <style>
        {`
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
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </div>
  );
};

export default InstructorDashboard;