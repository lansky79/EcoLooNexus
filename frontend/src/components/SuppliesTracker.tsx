
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Box, LinearProgress, Divider } from '@mui/material';

const SuppliesTracker: React.FC<{ restroomId: string }> = ({ restroomId }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/supplies?restroomId=${restroomId}`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching supplies data:', error);
      }
    };

    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [restroomId]);

  const getProgressColor = (value: number) => {
    if (value < 20) return 'error';
    if (value < 50) return 'warning';
    return 'success';
  };

  const renderProgress = (name: string, value: number) => (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Typography variant="body2" color="text.secondary">{`${name}: ${value}%`}</Typography>
      <LinearProgress variant="determinate" value={value} color={getProgressColor(value)} />
    </Box>
  );

  if (!data) {
    return <Typography>加载中...</Typography>;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom component="div">
        耗材与水电
      </Typography>
      {renderProgress('1号厕纸', data.paper.toilet1)}
      {renderProgress('2号厕纸', data.paper.toilet2)}
      {renderProgress('1号洗手液', data.soap.sink1)}
      <Divider sx={{ my: 2 }}/>
      <Typography variant="subtitle2">今日用量</Typography>
      <Typography variant="body1">用水: {data.waterUsage} L</Typography>
      <Typography variant="body1">用电: {data.powerUsage} kWh</Typography>
    </Box>
  );
};

export default SuppliesTracker;
