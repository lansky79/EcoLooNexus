
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Typography, Box, Grid, Paper, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

// Define types for better code quality and maintainability
type StallStatus = 'available' | 'occupied' | 'needs_cleaning';

interface Stall {
  id: number | string;
  status: StallStatus;
}

interface Restroom {
  id: number | string;
  name: string;
  location: string;
  male: Stall[];
  female: Stall[];
}

const StyledToiletStall = styled(Paper)<{ status: StallStatus }>(({ theme, status }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  height: '40px', // Further reduced height
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor:
    status === 'available' ? theme.palette.success.main :
    status === 'occupied' ? theme.palette.warning.main :
    theme.palette.error.main,
  color: theme.palette.getContrastText(
    status === 'available' ? theme.palette.success.main :
    status === 'occupied' ? theme.palette.warning.main :
    theme.palette.error.main
  ),
}));

interface ToiletStallProps {
  id: number | string;
  status: StallStatus;
  onClean: (id: number | string) => void;
}

const ToiletStall: React.FC<ToiletStallProps> = ({ id, status, onClean }) => {
  const statusText = (status: StallStatus) => {
    switch(status) {
      case 'available': return '空闲';
      case 'occupied': return '使用中';
      case 'needs_cleaning': return '需清洁';
      default: return '未知';
    }
  };

  return (
    <StyledToiletStall status={status}>
      <Typography variant="subtitle1">{statusText(status)}</Typography>
      {status === 'needs_cleaning' && (
        <Button 
          variant="contained" 
          color="primary" 
          size="small" 
          onClick={() => onClean(id)}
          sx={{ mt: 1 }} // Add some margin top
        >
          清洁
        </Button>
      )}
    </StyledToiletStall>
  );
};

const ToiletStatusMap: React.FC<{ restroomId: string }> = ({ restroomId }) => {
  const [data, setData] = useState<Restroom | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<Restroom>(`/api/restrooms/${restroomId}/toilets`);
      setData(response.data);
      setLastUpdated(new Date().toLocaleString());
    } catch (error: any) {
      console.error('Error fetching toilet status:', error);
      setError(error.message || '获取厕位状态失败');
    } finally {
      setLoading(false);
    }
  }, [restroomId, setData, setLastUpdated, setLoading, setError]);

  useEffect(() => {
    fetchData(); // Fetch data on initial render
  }, [restroomId, fetchData]);

  const handleCleanStall = async (id: number | string) => {
    try {
      await axios.post(`/api/restrooms/${restroomId}/toilets/${id}/clean`);
      fetchData(); // Refetch data to update the UI
    } catch (error) {
      console.error(`Error cleaning stall ${id}:`, error);
      setError(`清洁厕位 ${id} 失败`);
    }
  };

  if (loading) {
    return <Typography>加载中...</Typography>;
  }

  if (error) {
    return <Typography color="error">错误: {error}</Typography>;
  }

  if (!data) {
    return <Typography>暂无数据</Typography>;
  }

  return (
    <Box>
        <Typography variant="h6" gutterBottom component="div">
            {data.name} 厕位状态
        </Typography>
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="subtitle1">男厕</Typography>
                <Grid container spacing={1}>
                    {data.male.map((stall) => (
                        <Grid item xs={4} key={stall.id}>
                            <ToiletStall 
                                id={stall.id} 
                                status={stall.status} 
                                onClean={handleCleanStall}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Grid>
            <Grid item xs={12} sx={{mt: -1}}>
                <Typography variant="subtitle1">女厕</Typography>
                <Grid container spacing={1}>
                    {data.female.map((stall) => (
                        <Grid item xs={4} key={stall.id}>
                            <ToiletStall 
                                id={stall.id} 
                                status={stall.status} 
                                onClean={handleCleanStall}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </Grid>
        
        <Button 
          variant="outlined" 
          onClick={fetchData} 
          sx={{ mt: 2 }} // Add some margin top
        >
          刷新状态
        </Button>
    </Box>
  );
};

export default ToiletStatusMap;
