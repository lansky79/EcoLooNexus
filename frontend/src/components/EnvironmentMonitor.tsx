
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Box, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const MetricBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: '100%',
}));

const AlertBox = styled(MetricBox)(({ theme }) => ({
    backgroundColor: theme.palette.error.dark,
    color: theme.palette.getContrastText(theme.palette.error.dark),
}));

const EnvironmentMonitor: React.FC<{ restroomId: string }> = ({ restroomId }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/environment?restroomId=${restroomId}`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching environment data:', error);
      }
    };

    const interval = setInterval(fetchData, 2000); // 模拟实时刷新
    return () => clearInterval(interval);
  }, [restroomId]);

  if (!data) {
    return <Typography>加载中...</Typography>;
  }

  const renderMetric = (title: string, value: string, unit: string, isAlert: boolean = false) => {
    const BoxComponent = isAlert ? AlertBox : MetricBox;
    return (
        <Grid item xs={6} sm={4}>
            <BoxComponent>
                <Typography variant="caption">{title}</Typography>
                <Typography variant="body2">{value}{unit}</Typography>
            </BoxComponent>
        </Grid>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
            {renderMetric('温度', data.temperature, '°C')}
            {renderMetric('湿度', data.humidity, '%')}
            {renderMetric('PM2.5', data.pm25, 'µg/m³')}
            {renderMetric('氨气', data.ammonia, 'ppm', data.isAmmoniaAlert)}
            {renderMetric('硫化氢', data.h2s, 'ppm', data.isH2sAlert)}
        </Grid>
    </Box>
  );
};

export default EnvironmentMonitor;
