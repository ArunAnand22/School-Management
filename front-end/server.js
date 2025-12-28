const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom middleware to handle /api prefix
server.use((req, res, next) => {
  // Remove /api prefix from the request path
  if (req.path.startsWith('/api/')) {
    req.url = req.url.replace('/api', '');
  }
  next();
});

// Custom route for login
server.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Find user in the users array
  const users = router.db.get('users').value();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({
      success: true,
      message: 'Login successful',
      token: `mock-token-${user.id}-${Date.now()}`,
      user: {
        id: user.id.toString(),
        username: user.username,
        role: user.role || 'user'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }
});

// Use json-server router
server.use('/api', router);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});








