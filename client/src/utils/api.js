import axios from 'axios';


// allow override from environment so port can be configured for dev/prod
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
console.log('API_URL:', API_URL);


export const loginUser = async (loginData) => {
  const response = await axios.post(`${API_URL}/users/login`, loginData);
  return response.data;
};

export const signupUser = async (userData) => {
  const response = await axios.post(`${API_URL}/users`, userData);
  return response.data;
};

export const updateUserPreferences = async (userId, preferences) => {
  const response = await axios.put(`${API_URL}/users/${userId}`, preferences);
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await axios.get(`${API_URL}/users/${userId}`);
  return response.data;
};

export const generateMealPlan = async (userId, additionalInstructions = '') => {
  const response = await axios.post(`${API_URL}/meals/generate`, { 
    userId, 
    additionalInstructions 
  });
  return response.data;
};


export const getUserMealPlans = async (userId) => {
  const response = await axios.get(`${API_URL}/meals/user/${userId}`);
  return response.data;
};

export const getUserMealHistory = async (userId) => {
  const response = await axios.get(`${API_URL}/meals/history/${userId}`);
  return response.data;
};

export const deleteMealPlan = async (planId) => {
  const response = await axios.delete(`${API_URL}/meals/plan/${planId}`);
  return response.data;
};

export const getChatbotResponse = async (message, history = [], userPreferences = null) => {
  const response = await axios.post(`${API_URL}/chatbot/message`, { 
    message, 
    history,
    userPreferences 
  });
  return response.data;
};
export const generateWorkOutPlan = async (UserId,formData) => {
  const response = await axios.post(`${API_URL}/workouts/create`, {
    UserId,
    formData
  })
  console.log(response.data)
  return response.data
}
export const getWorkoutPlans = async (UserId) => {
  const response = await axios.get(`${API_URL}/workouts/${UserId}`)
  return response.data
}
export const deleteWorkoutPlan = async (planID) => {
  const response = await axios.delete(`${API_URL}/workouts/${planID}`,{
    planID
  })
  return response.data
}

// metrics & goals
export const logMetric = async (userId, type, value, date) => {
  const body = { userId, type, value };
  if (date) body.date = date;
  const response = await axios.post(`${API_URL}/metrics/log`, body);
  return response.data;
};

export const getMetrics = async (userId, start, end) => {
  const params = {};
  if (start) params.start = start;
  if (end) params.end = end;
  const response = await axios.get(`${API_URL}/metrics/${userId}`, { params });
  return response.data;
};

export const getGoals = async (userId) => {
  const response = await axios.get(`${API_URL}/goals/${userId}`);
  return response.data;
};

export const updateGoals = async (userId, goals) => {
  const response = await axios.put(`${API_URL}/goals/${userId}`, goals);
  return response.data;
};

export const getAnalysis = async (userId, days) => {
  const params = {};
  if (days) params.days = days;
  const response = await axios.get(`${API_URL}/analytics/${userId}`, { params });
  return response.data;
};
