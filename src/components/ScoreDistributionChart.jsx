import { useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsBellcurve from 'highcharts/modules/histogram-bellcurve';
import HighchartsMore from 'highcharts/highcharts-more';
import { COLORS } from '../design-tokens.js';

// Initialize modules
if (typeof Highcharts === 'object') {
  const initMore = typeof HighchartsMore === 'function' ? HighchartsMore : HighchartsMore.default;
  const initBellcurve = typeof HighchartsBellcurve === 'function' ? HighchartsBellcurve : HighchartsBellcurve.default;
  
  if (typeof initMore === 'function') initMore(Highcharts);
  if (typeof initBellcurve === 'function') initBellcurve(Highcharts);
}

export default function ScoreDistributionChart({ comments }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!comments || comments.length === 0 || !chartRef.current) return;

    const scores = comments
      .map(c => c.score || c.karma || 0)
      .filter(s => typeof s === 'number' && !isNaN(s));

    if (scores.length === 0) return;

    const average = scores.reduce((a, b) => a + b, 0) / scores.length;

    const chart = Highcharts.chart(chartRef.current, {
      chart: {
        backgroundColor: 'transparent',
        height: 250
      },
      title: {
        text: null
      },
      credits: {
        enabled: false
      },
      xAxis: [{
        title: {
          text: 'Karma Score',
          style: { color: '#666' }
        },
        gridLineColor: 'rgba(255, 255, 255, 0.05)',
        lineColor: '#333',
        tickColor: '#333',
        labels: {
          style: { color: '#999' }
        },
        plotLines: [{
          color: '#4A90E2',
          width: 2,
          value: average,
          zIndex: 5,
          label: {
            text: `Avg: ${average.toFixed(1)}`,
            align: 'center',
            style: {
              color: '#4A90E2',
              fontWeight: 'bold',
              fontSize: '11px'
            },
            y: -5
          }
        }]
      }],
      yAxis: [{
        title: {
          text: 'Probability Density',
          style: { color: '#666' }
        },
        gridLineColor: 'rgba(255, 255, 255, 0.05)',
        lineColor: '#333',
        labels: {
          style: { color: '#999' }
        }
      }, {
        visible: false,
        min: -1,
        max: 1
      }],
      legend: {
        enabled: false
      },
      series: [{
        name: 'Distribution',
        type: 'bellcurve',
        data: scores,
        color: COLORS.DATA_1,
        fillOpacity: 0.6,
        zIndex: -1
      }, {
        name: 'Scores',
        type: 'scatter',
        data: scores.map(x => [x, 0]),
        yAxis: 1,
        marker: {
          radius: 2,
          fillColor: COLORS.DATA_1,
          fillOpacity: 0.3
        },
        jitter: {
          y: 1
        },
        enableMouseTracking: false
      }],
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: COLORS.DATA_1,
        style: {
          color: '#fff'
        }
      }
    });

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, [comments]);

  if (!comments || comments.length === 0) {
    return <div className="distribution-empty">No data</div>;
  }

  const scores = comments
    .map(c => c.score || c.karma || 0)
    .filter(s => typeof s === 'number' && !isNaN(s));

  if (scores.length === 0) {
    return <div className="distribution-empty">No score data</div>;
  }

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />;
}
