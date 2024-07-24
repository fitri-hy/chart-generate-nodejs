const express = require('express');
const { createCanvas } = require('canvas');
const cors = require('cors');
const path = require('path');
const Chart = require('chart.js/auto');

const app = express();
const port = 3000;
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

app.get('/chart', (req, res) => {
  const {
    type = 'line',
    title = 'My Chart',
    labels = '',
    data = '',
    backgroundColor = '',
    borderColor = '',
    borderWidth = '',
    pointBackgroundColor = '',
    pointBorderColor = '',
    pointBorderWidth = '',
    pointRadius = '',
    tension = '',
    displayLegend = 'true',
    tooltipEnabled = 'true',
  } = req.query;

  const parsedLabels = labels.split(',');
  let parsedData;
  if (type === 'bubble') {
    parsedData = data.split(';').map(entry => {
      const [x, y, r] = entry.split(',').map(Number);
      return { x, y, r };
    });
  } else if (type === 'scatter') {
    parsedData = data.split(';').map(entry => {
      const [x, y] = entry.split(',').map(Number);
      return { x, y };
    });
  } else {
    parsedData = data.split(',').map(Number);
  }

  const parsedBackgroundColor = backgroundColor.split(';').map(color => color.trim());
  const parsedBorderColor = borderColor.split(';').map(color => color.trim());
  const parsedBorderWidth = borderWidth.split(',').map(Number);
  const parsedPointBackgroundColor = pointBackgroundColor.split(';').map(color => color.trim());
  const parsedPointBorderColor = pointBorderColor.split(';').map(color => color.trim());
  const parsedPointBorderWidth = pointBorderWidth.split(',').map(Number);
  const parsedPointRadius = pointRadius.split(',').map(Number);
  const parsedTension = parseFloat(tension);

  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');

  const chartConfig = {
    type: type,
    data: {
      labels: parsedLabels,
      datasets: [{
        label: title,
        data: parsedData,
        backgroundColor: parsedBackgroundColor,
        borderColor: parsedBorderColor,
        borderWidth: parsedBorderWidth,
        pointBackgroundColor: parsedPointBackgroundColor,
        pointBorderColor: parsedPointBorderColor,
        pointBorderWidth: parsedPointBorderWidth,
        pointRadius: parsedPointRadius,
        tension: type === 'line' ? parsedTension : undefined // Apply tension only for line charts
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: displayLegend === 'true'
        },
        tooltip: {
          enabled: tooltipEnabled === 'true',
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
              }
              return label;
            }
          }
        },
        customCanvasBackgroundColor: {
          color: 'lightGreen',
        }
      },
      scales: {
        x: {
          beginAtZero: true
        },
        y: {
          beginAtZero: true,
          min: 0,
          max: 100
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuad'
      }
    },
    plugins: []
  };

  new Chart(ctx, chartConfig);

  res.setHeader('Content-Type', 'image/png');
  canvas.createPNGStream().pipe(res);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});