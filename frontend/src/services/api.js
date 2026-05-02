import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const login = (userName, password) =>
  api.post('/auth/login', { userName, password });

// ─── USER ────────────────────────────────────────────────────────────────────
export const createUser = (userDTO) => api.post('/user/add', userDTO);
export const getUserById = (userId) => api.get(`/user/${userId}`);

export const updateUser = (id, userDTO) => api.put(`/user/update/${id}`, userDTO);
export const deleteUser = (id) => api.delete(`/user/delete/${id}`);

// ─── BOOKS ───────────────────────────────────────────────────────────────────
export const getAllBooks = () => api.get('/user/books');
export const getBooksPaginated = (page = 0, size = 20) => api.get('/user/books/paginated', { params: { page, size } });
export const searchBooks = (prefix) => api.get('/user/books/search', { params: { prefix } });
export const getBooksByGenre = (genre) => api.get(`/user/books/genre/${genre}`);
export const getBookById = (id) => api.get(`/user/books/${id}`);
export const filterBooks = (params) => api.get('/user/books/filter', { params });
export const getPopularBooks = () => api.get('/user/books/popular');
export const getLatestBooks = () => api.get('/user/books/latest');
export const getRecentBooks = () => api.get('/user/books/recent'); // top 30 by ID desc — safe for dashboards

// ─── RECOMMENDATIONS ─────────────────────────────────────────────────────────
export const getRecommendations = (userId) => api.get(`/recommend/${userId}`);

// ─── ISSUED BOOKS ─────────────────────────────────────────────────────────────
export const getIssuedBooks = (userId) => api.get(`/user/issued/${userId}`);
export const calculateFine = (userId) => api.get(`/user/fine/${userId}`);
export const calculateFinePerBook = (issueId) => api.get(`/user/fine/book/${issueId}`);
export const payFine = (userId) => api.put(`/user/fine/pay/${userId}`);

// ─── FAVOURITES ───────────────────────────────────────────────────────────────
export const getFavourites = (userId) => api.get(`/user/favourites/${userId}`);
export const addFavourite = (userId, bookId) =>
  api.post('/user/favourite', null, { params: { userId, bookId } });
export const deleteFavourite = (id) => api.delete(`/user/favourite/${id}`);

// ─── WAITING LIST ─────────────────────────────────────────────────────────────
export const getWaitingList = (userId) => api.get(`/user/waiting-list/${userId}`);
export const addToWaitingList = (userId, bookId) =>
  api.post('/user/waiting-list', null, { params: { userId, bookId } });
export const removeFromWaitingList = (id) => api.delete(`/user/waiting-list/${id}`);

// ─── REVIEWS ─────────────────────────────────────────────────────────────────
export const addReview = (rating, comment, userId, bookId) =>
  api.post('/user/review', null, { params: { rating, comment, userId, bookId } });
export const updateReview = (id, reviewDTO) => api.put(`/user/review/${id}`, reviewDTO);
export const deleteReview = (id) => api.delete(`/user/review/${id}`);

// ─── LIBRARIAN ────────────────────────────────────────────────────────────────
export const addBook = (book) => api.post('/librarian/book', book);
export const updateBook = (bookId, book) => api.put(`/librarian/book/${bookId}`, book);
export const issueBook = (userId, bookId) =>
  api.post('/librarian/issue', null, { params: { userId, bookId } });
export const returnBook = (issuedBookId) => api.put(`/librarian/return/${issuedBookId}`);
export const getAllUsers = () => api.get('/user/all');
export const getLibrarianUser = (userId) => api.get(`/librarian/user/${userId}`);

// ─── ADMIN ────────────────────────────────────────────────────────────────────
export const deleteBook = (bookId) => api.delete(`/admin/book/${bookId}`);
export const deleteAllBooks = () => api.delete('/admin/books');
export const makeLibrarian = (userId) => api.put(`/admin/role/librarian/${userId}`);
export const makeAdmin = (userId) => api.put(`/admin/role/admin/${userId}`);
export const updateFineRule = (ruleId, rule) => api.put(`/admin/fine-rule/${ruleId}`, rule);
export const regenerateUserQR = (userId) => api.post(`/admin/RegenerateQR/${userId}`);
export const generateQRForAllBooks = () => api.post('/admin/GenerateForAllBooks');

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
export const getAnalyticsMostBorrowed = () => api.get('/analytics/most-borrowed');
export const getAnalyticsIssueTrends = () => api.get('/analytics/issue-trends');
export const getAnalyticsFineDefaulters = () => api.get('/analytics/fine-defaulters');
export const getAnalyticsInactiveUsers = () => api.get('/analytics/inactive-users');

export default api;
