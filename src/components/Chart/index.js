import { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import TimeframeSelector from "../TimeframeSelector";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import download from "downloadjs";
import { toPng } from "html-to-image";
import "./index.css";

const timeframeOptionsList = [
  {
    id: uuidv4(),
    display_text: "daily",
  },
  {
    id: uuidv4(),
    display_text: "weekly",
  },
  {
    id: uuidv4(),
    display_text: "monthly",
  },
];

const Chart = () => {
  const [data, setData] = useState([]);
  const [timeframe, setTimeframe] = useState(timeframeOptionsList[0].id);
  const chartRef = useRef(null);

  useEffect(() => {
    fetch("../../data.json")
      .then((response) => response.json())
      .then((data) => setData(data));
  }, []);

  const handleTimeframeChange = (id) => {
    setTimeframe(id);
  };

  const getMonthlyData = () => {
    const monthlyData = [];
    let currentMonthData = [];
    let currentMonth = null;

    data.forEach((item) => {
      const itemDate = new Date(item.timestamp);
      const itemMonth = itemDate.getMonth() + 1; // Month is 0 based index in Js

      if (currentMonth === null) {
        currentMonth = itemMonth;
      }

      if (currentMonth === itemMonth) {
        currentMonthData.push(item);
      } else {
        monthlyData.push({
          timestamp: currentMonthData[0].timestamp, // Using start of the month timestamp
          value: calculateMonthlyAggregate(currentMonthData),
        });
        currentMonth = itemMonth;
        currentMonthData = [item];
      }
    });

    // Add the last month
    if (currentMonthData.length > 0) {
      monthlyData.push({
        timestamp: currentMonthData[0].timestamp, // Using start of the month timestamp
        value: calculateMonthlyAggregate(currentMonthData),
      });
    }

    return monthlyData;
  };

  const calculateMonthlyAggregate = (data) => {
    const sum = data.reduce((sum, item) => sum + item.value, 0);
    return sum / data.length;
  };

  const getWeeklyData = () => {
    const weeklyData = [];
    let currentWeekData = [];
    let currentWeek = null;

    data.forEach((item) => {
      const itemDate = new Date(item.timestamp);
      const itemWeek = getWeekNumber(itemDate);

      if (currentWeek === null) {
        currentWeek = itemWeek;
      }

      if (currentWeek === itemWeek) {
        currentWeekData.push(item);
      } else {
        weeklyData.push({
          timestamp: currentWeekData[0].timestamp, // Using start of the week timestamp
          value: calculateWeeklyAggregate(currentWeekData),
        });
        currentWeek = itemWeek;
        currentWeekData = [item];
      }
    });

    // Add the last week
    if (currentWeekData.length > 0) {
      weeklyData.push({
        timestamp: currentWeekData[0].timestamp, // Using start of the week timestamp
        value: calculateWeeklyAggregate(currentWeekData),
      });
    }

    return weeklyData;
  };

  // Helper function to get week number
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const calculateWeeklyAggregate = (data) => {
    return data.reduce((sum, item) => sum + item.value, 0);
  };

  const getDailyData = () => {
    return data;
  };

  const getFilteredData = () => {
    switch (timeframe) {
      case timeframeOptionsList[0].id:
        return getDailyData();
      case timeframeOptionsList[1].id:
        return getWeeklyData();
      case timeframeOptionsList[2].id:
        return getMonthlyData();
      default:
        return data;
    }
  };

  const filteredData = getFilteredData();

  const handleClick = (data) => {
    alert(`Timestamp: ${data.timestamp}, Value: ${data.value}`);
  };

  const handleExport = () => {
    if (!chartRef.current) return;

    toPng(chartRef.current)
      .then((dataUrl) => {
        download(dataUrl, "chart.png"); //we can Change 'chart.png' to 'chart.jpg' for JPG export
      })
      .catch((error) => {
        console.error("Error exporting chart:", error);
      });
  };

  console.log(data);

  return (
    <div className="chart-container">
      <h1 className="chart-title">Data Chart</h1>
      <ul className="timeframe-container">
        {timeframeOptionsList.map((item) => (
          <TimeframeSelector
            key={item.id}
            activeOptionId={timeframe}
            timeframeOptionDetails={item}
            handleTimeframeChange={handleTimeframeChange}
          />
        ))}
      </ul>
      <div className="export-image-container">
        <h1 className="export-image-heading" htmlFor="timeframe">
          Export Chart:{" "}
        </h1>
        <button className="export-btn" onClick={handleExport}>
          Export as PNG
        </button>{" "}
      </div>
      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={filteredData}
            onClick={(e) => handleClick(e.activePayload[0].payload)}
          >
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <CartesianGrid stroke="#f5f5f5" />
            <Line type="monotone" dataKey="value" stroke="#ff7300" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Chart;
