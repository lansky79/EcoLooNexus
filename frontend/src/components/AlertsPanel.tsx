
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Box, Paper, List, ListItem, ListItemText, ListItemIcon, Chip } from '@mui/material';
import { Warning, Error, NotificationsActive, CleaningServices, ReportProblem } from '@mui/icons-material'; // Added new icons

interface Alert {
  id: string;
  message: string;
  severity: 'warning' | 'critical';
  timestamp: string;
  source: 'environment' | 'supplies' | 'toilets' | 'feedback'; // Added source
}

interface AlertsPanelProps {
  restroomId: string;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ restroomId }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (!restroomId) return;

    const fetchAlerts = async () => {
      try {
        const response = await axios.get(`/api/alerts/${restroomId}`);
        setAlerts(response.data);
      } catch (error) {
        console.error('Error fetching alerts:', error);
        // Optionally, set an error state to display in the UI
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000); // Fetch alerts every 15 seconds

    return () => clearInterval(interval);
  }, [restroomId]);

  const getSeverityProps = (severity: 'warning' | 'critical') => {
    if (severity === 'critical') {
      return { color: 'error' as const, icon: <Error /> };
    }
    // Default to warning for any other case
    return { color: 'warning' as const, icon: <Warning /> };
  };

  // Optional: Get an icon based on the alert source for more visual context
  const getSourceIcon = (source: string) => {
      switch(source) {
          case 'toilets':
              return <CleaningServices />; 
          case 'feedback':
              return <ReportProblem />;
          default:
              return null; // Or a default icon
      }
  }

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', maxHeight: 400, overflowY: 'auto' }}>
      <Box sx={{ flexGrow: 1 }}>
        {alerts.length > 0 ? (
          <List disablePadding>
            {alerts.map((alert) => {
              const severityProps = getSeverityProps(alert.severity);
              const sourceIcon = getSourceIcon(alert.source);
              return (
                <ListItem key={alert.id} sx={{ py: 0.5, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {React.cloneElement(severityProps.icon, { color: severityProps.color })}
                  </ListItemIcon>
                  <ListItemText 
                    primary={alert.message}
                    secondary={`时间: ${new Date(alert.timestamp).toLocaleTimeString()}`}
                  />
                   <Chip label={alert.severity === 'critical' ? '严重' : '警告'} color={severityProps.color} size="small" />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
            一切正常，暂无警报。
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default AlertsPanel;
