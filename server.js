// server.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// In-memory database simulation
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 }
];

let posts = [
  { id: 1, title: 'First Post', content: 'Hello World!', userId: 1 },
  { id: 2, title: 'Second Post', content: 'Node.js is awesome', userId: 2 }
];

// Helper function to generate IDs
const generateId = (array) => array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;

// USERS ENDPOINTS

// GET all users
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: users,
    total: users.length
  });
});

// GET user by ID
app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user
  });
});

// POST create new user - Multiple validation scenarios
app.post('/api/users', (req, res) => {
  const { name, email, age } = req.body;

  // Required field validation
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: 'Name and email are required'
    });
  }

  // Age boundary validation
  if (age && (age < 0 || age > 120)) {
    return res.status(400).json({
      success: false,
      error: 'Age must be between 0 and 120'
    });
  }

  // Email uniqueness validation
  if (users.find(u => u.email === email)) {
    return res.status(409).json({
      success: false,
      error: 'Email already exists'
    });
  }

  const newUser = {
    id: generateId(users),
    name,
    email,
    age: age || null
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    data: newUser
  });
});

// PUT update user
app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, age } = req.body;

  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Cross-field validation: email uniqueness across other users
  if (email && users.find(u => u.email === email && u.id !== id)) {
    return res.status(409).json({
      success: false,
      error: 'Email already exists'
    });
  }

  // Age boundary validation
  if (age && (age < 0 || age > 120)) {
    return res.status(400).json({
      success: false,
      error: 'Age must be between 0 and 120'
    });
  }

  // Update user
  users[userIndex] = {
    ...users[userIndex],
    ...(name && { name }),
    ...(email && { email }),
    ...(age !== undefined && { age })
  };

  res.json({
    success: true,
    data: users[userIndex]
  });
});

// DELETE user with cascading validation
app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  const deletedUser = users.splice(userIndex, 1)[0];

  // Cascade delete: remove user's posts
  posts = posts.filter(p => p.userId !== id);

  res.json({
    success: true,
    data: deletedUser
  });
});

// POSTS ENDPOINTS

// GET all posts with relationship validation
app.get('/api/posts', (req, res) => {
  const postsWithUsers = posts.map(post => {
    const user = users.find(u => u.id === post.userId);
    return {
      ...post,
      author: user ? user.name : 'Unknown'
    };
  });

  res.json({
    success: true,
    data: postsWithUsers,
    total: postsWithUsers.length
  });
});

// GET posts by user ID
app.get('/api/users/:id/posts', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  const userPosts = posts.filter(p => p.userId === userId);

  res.json({
    success: true,
    data: userPosts,
    total: userPosts.length
  });
});

// POST create new post with foreign key validation
app.post('/api/posts', (req, res) => {
  const { title, content, userId } = req.body;

  if (!title || !content || !userId) {
    return res.status(400).json({
      success: false,
      error: 'Title, content, and userId are required'
    });
  }

  // Foreign key validation
  const user = users.find(u => u.id === parseInt(userId));
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  const newPost = {
    id: generateId(posts),
    title,
    content,
    userId: parseInt(userId)
  };

  posts.push(newPost);

  res.status(201).json({
    success: true,
    data: newPost
  });
});

// SEARCH ENDPOINT - Query parameter validation
app.get('/api/search', (req, res) => {
  const { q, type = 'users' } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      error: 'Query parameter "q" is required'
    });
  }

  let results = [];

  if (type === 'users') {
    results = users.filter(u =>
      u.name.toLowerCase().includes(q.toLowerCase()) ||
      u.email.toLowerCase().includes(q.toLowerCase())
    );
  } else if (type === 'posts') {
    results = posts.filter(p =>
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      p.content.toLowerCase().includes(q.toLowerCase())
    );
  }

  res.json({
    success: true,
    data: results,
    query: q,
    type,
    total: results.length
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`   GET    /api/users`);
  console.log(`   GET    /api/users/:id`);
  console.log(`   POST   /api/users`);
  console.log(`   PUT    /api/users/:id`);
  console.log(`   DELETE /api/users/:id`);
  console.log(`   GET    /api/posts`);
  console.log(`   GET    /api/users/:id/posts`);
  console.log(`   POST   /api/posts`);
  console.log(`   GET    /api/search?q=term&type=users`);
});

module.exports = app;

