const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./app/config/db')
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Debugging: kiểm tra route borrow có hoạt động không
console.log('Loading /api/borrow routes...');

app.get('/', (req, res) => {
  res.send('Server đang chạy...');
});

app.use("/books", express.static(path.join(__dirname, "public/books")));

// Routes
app.use('/api/auth', require('./app/routes/auth'));
app.use('/api/books', require('./app/routes/books'));
app.use('/api/nhanvien', require('./app/routes/nvRoutes'));
app.use('/api/borrows', require('./app/routes/borrows'));
app.use('/api/publishers', require('./app/routes/publishers'));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client_frontend/build'));
  app.use('/admin', express.static('server_frontend/build'));

  app.get('/admin/*', (req, res) => {
    res.sendFile(
        path.resolve(__dirname, 'server_frontend', 'build', 'index.html'));
  });

  app.get('*', (req, res) => {
    res.sendFile(
        path.resolve(__dirname, 'client_frontend', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);