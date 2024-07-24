// app.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const chartHandler = require('./chart');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.domain = req.headers.host;
  next();
});

app.get('/', (req, res) => {
  res.render('index', { domain: req.domain });
});

// Gunakan handler dari chart.js
app.get('/chart', chartHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
