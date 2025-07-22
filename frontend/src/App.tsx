import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Paper, Grid, Toolbar, ListItemButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FeedbackIcon from '@mui/icons-material/Feedback';
import BarChartIcon from '@mui/icons-material/BarChart'; // Import for Report Center
import ConsumablesIcon from '@mui/icons-material/LocalMall'; // Import for Report Center
import FlowIcon from '@mui/icons-material/TrendingUp'; // Import for Report Center

import AlertsPanel from './components/AlertsPanel';
import EnvironmentMonitor from './components/EnvironmentMonitor';
import SuppliesTracker from './components/SuppliesTracker';
import FlowStatistics from './components/FlowStatistics';
import RestroomList from './components/RestroomList';
import FeedbackPage from './pages/FeedbackPage';
import ToiletStatusMap from './components/ToiletStatusMap';
import PersonnelList from './components/PersonnelList';
import WorkOrderList from './components/WorkOrderList';
import WorkAssessment from './components/WorkAssessment';
import ReportCenter from './components/ReportCenter'; // Import ReportCenter

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // A professional blue
    },
    background: {
      default: '#e3f2fd', // Light blue for overall background
      paper: '#ffffff', // White for cards and paper elements
    },
    text: {
      primary: '#212121', // Dark grey for primary text
      secondary: '#757575', // Medium grey for secondary text
    },
  },
});

const drawerWidth = 240;

function App() {
  const [selectedRestroomId, setSelectedRestroomId] = useState<string | null>(null);

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          <Drawer
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
              },
            }}
            variant="permanent"
            anchor="left"
          >
            <Toolbar>
              <Typography variant="h6" noWrap component="div" sx={{ my: 2 }}>
                智慧公厕管理系统
              </Typography>
            </Toolbar>
            <List>
              <ListItem component={Link} to="/">
                <ListItemButton>
                  <ListItemIcon><DashboardIcon /></ListItemIcon>
                  <ListItemText primary="仪表盘" sx={{ color: 'black', fontSize: '1.1rem' }} />
                </ListItemButton>
              </ListItem>
              <ListItem component={Link} to="/personnel">
                <ListItemButton>
                  <ListItemIcon><PeopleIcon /></ListItemIcon>
                  <ListItemText primary="人员管理" sx={{ color: 'black', fontSize: '1.1rem' }} />
                </ListItemButton>
              </ListItem>
              <ListItem component={Link} to="/workorders">
                <ListItemButton>
                  <ListItemIcon><AssignmentIcon /></ListItemIcon>
                  <ListItemText primary="工单管理" sx={{ color: 'black', fontSize: '1.1rem' }} />
                </ListItemButton>
              </ListItem>
              <ListItem component={Link} to="/assessment">
                <ListItemButton>
                  <ListItemIcon><AssessmentIcon /></ListItemIcon>
                  <ListItemText primary="工作考核" sx={{ color: 'black', fontSize: '1.1rem' }} />
                </ListItemButton>
              </ListItem>
              <ListItem component={Link} to="/feedback">
                <ListItemButton>
                  <ListItemIcon><FeedbackIcon /></ListItemIcon>
                  <ListItemText primary="公众反馈" sx={{ color: 'black', fontSize: '1.1rem' }} />
                </ListItemButton>
              </ListItem>
              <ListItem component={Link} to="/reports">
                <ListItemButton>
                  <ListItemIcon><BarChartIcon /></ListItemIcon>
                  <ListItemText primary="报表中心" sx={{ color: 'black', fontSize: '1.1rem' }} />
                </ListItemButton>
              </ListItem>
            </List>
          </Drawer>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - ${drawerWidth}px)` },
            }}
          >
            <Routes>
              <Route path="/" element={
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <RestroomList onSelectRestroom={setSelectedRestroomId} selectedRestroomId={selectedRestroomId} />
                    </Paper>
                  </Grid>
                  {selectedRestroomId && (
                    <Grid container spacing={2}> {/* New Grid container for dashboard cards */}
                      {/* 实时警报 */}
                      <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>实时警报</Typography>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 300, backgroundColor: 'background.paper' }} elevation={3}>
                          <AlertsPanel restroomId={selectedRestroomId} />
                        </Paper>
                      </Grid>

                      {/* 环境监测 */}
                      <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>环境监测</Typography>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 300, backgroundColor: 'background.paper' }} elevation={3}>
                          <EnvironmentMonitor restroomId={selectedRestroomId} />
                        </Paper>
                      </Grid>
                      {/* 耗材监控 */}
                      <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>耗材监控</Typography>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 300, backgroundColor: 'background.paper' }} elevation={3}>
                          <SuppliesTracker restroomId={selectedRestroomId} />
                        </Paper>
                      </Grid>
                      {/* 人流量统计 */}
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 350, backgroundColor: 'background.paper' }} elevation={3}>
                          <FlowStatistics restroomId={selectedRestroomId} />
                        </Paper>
                      </Grid>
                      
                      {/* 厕位状态 */}
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 350, backgroundColor: 'background.paper' }} elevation={3}>
                          <ToiletStatusMap restroomId={selectedRestroomId} />
                        </Paper>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              } />
              <Route path="/personnel" element={<PersonnelList />} />
              <Route path="/workorders" element={<WorkOrderList />} />
              <Route path="/assessment" element={<WorkAssessment />} />
              <Route path="/feedback" element={<FeedbackPage restroomId={selectedRestroomId} />} />
              <Route path="/reports" element={<ReportCenter />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;