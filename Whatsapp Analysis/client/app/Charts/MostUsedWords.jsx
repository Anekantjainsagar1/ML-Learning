import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const MostUsedWords = ({ data, labels }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef && chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Most Busy Users",
              data: data,
              backgroundColor: "rgba(230, 230, 250, 0.2)",
              borderColor: "rgba(230, 230, 250, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          indexAxis: "y", // Display the chart as a horizontal bar chart
          scales: {
            y: {
              ticks: {
                // Rotate y-axis ticks
                maxRotation: 0,
                minRotation: 0,
              },
            },
            x: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, labels]);

  return (
    <div ref={chartContainerRef}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default MostUsedWords;
