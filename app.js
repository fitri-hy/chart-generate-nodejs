const express = require('express');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const cors = require('cors');
const path = require('path');

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

app.get('/chart', async (req, res) => {
  try {
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

    // Validate inputs
    if (!type || !labels || !data) {
      return res.status(400).send('Invalid parameters');
    }

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

    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 800, height: 600 });

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

    const image = await chartJSNodeCanvas.renderToBuffer(chartConfig);
    res.setHeader('Content-Type', 'image/png');
    res.send(image);
  } catch (error) {
    console.error('Error generating chart:', error);
    res.status(500).send('Error generating chart');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
