
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FlowStatistics: React.FC<{ restroomId: string }> = ({ restroomId }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/flow?restroomId=${restroomId}`);
        const chartData = response.data.timeLabels.map((time: string, index: number) => ({
            time,
            male: response.data.male[index],
            female: response.data.female[index],
        }));
        setData(chartData);
      } catch (error) {
        console.error('Error fetching flow data:', error);
      }
    };

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [restroomId]);

  if (!data) {
    return <Typography>加载中...</Typography>;
  }

  return (
    <Box sx={{ height: 300 }}>
        <Typography variant="h6" gutterBottom component="div">
            今日人流量统计 (人次)
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="male" name="男厕" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="female" name="女厕" stroke="#82ca9d" />
            </LineChart>
        </ResponsiveContainer>
    </Box>
  );
};

export default FlowStatistics;
