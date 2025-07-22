import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

interface Restroom {
  id: number | string;
  name: string;
  location: string;
}

const RestroomList: React.FC<{ onSelectRestroom: (id: string) => void; selectedRestroomId: string | null }> = ({ onSelectRestroom, selectedRestroomId }) => {
  const [restrooms, setRestrooms] = useState<Restroom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestrooms = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<Restroom[]>('/api/restrooms');
        setRestrooms(response.data);
        if (response.data.length > 0 && !selectedRestroomId) {
          onSelectRestroom(response.data[0].id.toString()); // Select the first restroom by default if none is selected
        }
      } catch (err: any) {
        console.error('Error fetching restrooms:', err);
        setError(err.message || '获取公厕列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchRestrooms();
  }, [onSelectRestroom, selectedRestroomId]);

  const handleChange = (event: any) => {
    onSelectRestroom(event.target.value as string);
  };

  if (loading) {
    return <Typography>加载公厕列表...</Typography>;
  }

  if (error) {
    return <Typography color="error">错误: {error}</Typography>;
  }

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="restroom-select-label">选择公厕</InputLabel>
        <Select
          labelId="restroom-select-label"
          id="restroom-select"
          value={selectedRestroomId || ''}
          label="选择公厕"
          onChange={handleChange}
        >
          {restrooms.map((restroom) => (
            <MenuItem key={restroom.id} value={restroom.id.toString()}>
              {restroom.name} - {restroom.location}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default RestroomList;
