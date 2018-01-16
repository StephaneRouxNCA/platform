/* Copyright 2017 Apinf Oy
  This file is covered by the EUPL license.
  You may obtain a copy of the licence at
  https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */
import moment from 'moment';

Template.drawChart.onRendered(function () {
  // const selector = this.selector;
  const querySelector = `#${this.data.query}`;
  // get document element
  const canvas = document.querySelector(querySelector);
  // Realize chart
  this.chart = new Chart(canvas.getContext('2d'), {
    // The type of chart
    type: 'line',

    // Data for displaying chart
    data: {
      labels: ["2"],
      datasets: [
        {
          backgroundColor: '#e3f2fc',
          borderColor: '#3886d4',
          borderWidth: 2,
          data: [1],
          pointRadius: 0,
          pointHoverRadius: 3,
        },
      ],
    },

    // Configuration options
    options: {
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10
        }
      },
      scales: {
        xAxes: [{
          display: false,
        }],
        yAxes: [{
          display: false,
        }],

      },
      legend: {
        display: false,
      },
      elements: {
        line: {
          tension: 0, // disables bezier curves
        },
      },
      animation: {
        duration: 0, // general animation time
      },
      hover: {
        animationDuration: 0, // duration of animations when hovering an item
      },
      responsiveAnimationDuration: 0, // animation duration after a resize
    },
  });

  this.autorun(() => {
    const aggregatedData = Template.currentData().aggregatedData;

    console.log(aggregatedData)
    if (aggregatedData) {
      aggregatedData.forEach(dataset => {
        const date = moment(dataset.key).format('DD/MM');

        this.chart.data.labels.push(date);
        this.chart.data.datasets[0].data.push(dataset.doc_count);
      });

      this.chart.update();
    }
  });
});
