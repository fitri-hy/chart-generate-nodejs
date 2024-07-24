const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
// const canvas = require('canvas');

module.exports = async (req, res) => {
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

    // Validasi parameter
    if (!type || !labels || !data) {
      return res.status(400).send('Missing required parameters: type, labels, and data are required.');
    }

    const parsedLabels = labels.split(',').map(label => label.trim());
    let parsedData;

    switch (type) {
      case 'bubble':
        parsedData = data.split(';').map(entry => {
          const [x, y, r] = entry.split(',').map(Number);
          return { x, y, r };
        });
        break;
      case 'scatter':
        parsedData = data.split(';').map(entry => {
          const [x, y] = entry.split(',').map(Number);
          return { x, y };
        });
        break;
      default:
        parsedData = data.split(',').map(Number);
    }

    const parsedBackgroundColor = backgroundColor.split(';').map(color => color.trim());
    const parsedBorderColor = borderColor.split(';').map(color => color.trim());
    const parsedBorderWidth = borderWidth.split(',').map(Number);
    const parsedPointBackgroundColor = pointBackgroundColor.split(';').map(color => color.trim());
    const parsedPointBorderColor = pointBorderColor.split(';').map(color => color.trim());
    const parsedPointBorderWidth = pointBorderWidth.split(',').map(Number);
    const parsedPointRadius = pointRadius.split(',').map(Number);
    const parsedTension = parseFloat(tension) || 0;

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
          tension: type === 'line' ? parsedTension : undefined
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

    // Gunakan renderToBuffer atau renderToStream
    const image = await chartJSNodeCanvas.renderToBuffer(chartConfig);
    res.setHeader('Content-Type', 'image/png');
    res.send(image);
  } catch (error) {
    console.error('Error generating chart:', error);
    res.status(500).send('Error generating chart');
  }
};
