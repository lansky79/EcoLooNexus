import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Box, List, ListItem, ListItemText, Divider, Chip, Container, Paper } from '@mui/material';

interface FeedbackPageProps {
  restroomId: string | null;
}

const mockFeedbackData = Array.from({ length: 20 }, (_, i) => ({
  id: `f${i + 1}`,
  content: `这是来自用户的反馈内容 ${i + 1}。${i % 3 === 0 ? '厕所很干净！' : (i % 3 === 1 ? '洗手液没了。' : '灯坏了。')}`,
  type: i % 2 === 0 ? '评价' : '投诉',
  rating: i % 2 === 0 ? parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)) : null,
  time: `2024-07-${String(i + 1).padStart(2, '0')} 1${i % 10}:30`,
}));

const FeedbackPage: React.FC<FeedbackPageProps> = ({ restroomId }) => {
  const [feedback, setFeedback] = useState<any[]>(mockFeedbackData);

  useEffect(() => {
    // Simulate fetching data
    if (restroomId) {
      setFeedback(mockFeedbackData);
    }
  }, [restroomId]);

  if (!restroomId) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" align="center">请先在仪表盘选择一个公厕以查看反馈。</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom component="div">
            公众互动与反馈
        </Typography>
        <List sx={{ maxHeight: 600, overflow: 'auto' }}>
            {feedback.map((item, index) => (
                <React.Fragment key={item.id}>
                    <ListItem alignItems="flex-start">
                        <ListItemText
                            primary={
                                <Typography component="span" variant="body2" color="text.primary">
                                    {item.content}
                                </Typography>
                            }
                            secondary={
                                <>
                                    <Chip 
                                        label={item.type} 
                                        size="small" 
                                        color={item.type === '评价' ? 'primary' : 'warning'} 
                                        sx={{mr: 1}} 
                                    />
                                    {item.rating && `评分: ${item.rating}/5 - `}
                                    {item.time}
                                </>
                            }
                        />
                    </ListItem>
                    {index < feedback.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
            ))}
        </List>
      </Paper>
    </Container>
  );
};

export default FeedbackPage;
