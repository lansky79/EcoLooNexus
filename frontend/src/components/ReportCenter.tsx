import React from 'react';
import { Box, Typography, Paper, Grid, Button, Stack } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import ConsumablesIcon from '@mui/icons-material/LocalMall'; // Example icon for consumables
import FlowIcon from '@mui/icons-material/TrendingUp'; // Example icon for flow

const ReportCenter: React.FC = () => {

  const handleGenerateReport = (reportType: string) => {
    alert(`生成 ${reportType} 报表... (实际操作会调用后端API)`);
    // In a real application, this would trigger a backend process
  };

  const handleDownloadReport = (reportType: string, fileName: string) => {
    alert(`下载 ${reportType} 报表: ${fileName}.xlsx`);
    // Simulate a file download
    const mockData = `Mock Excel data for ${reportType}`;
    const blob = new Blob([mockData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const ReportCard: React.FC<{ title: string; description: string; icon: React.ReactNode; fileName: string }> = 
    ({ title, description, icon, fileName }) => (
    <Grid item xs={12} md={6}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          {icon}
          {title}
        </Typography>
        <Typography variant="body2" sx={{ flexGrow: 1 }}>{description}</Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => handleGenerateReport(title)}
            size="small"
          >
            生成报表
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => handleDownloadReport(title, fileName)}
            size="small"
          >
            下载报表
          </Button>
        </Stack>
      </Paper>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>报表中心</Typography>
      
      <Grid container spacing={3}>
        <ReportCard 
          title="公厕管理报表" 
          description="这里将展示公厕运营相关的统计数据和图表，如清洁频率、故障率等。" 
          icon={<BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />}
          fileName="公厕管理报表"
        />
        <ReportCard 
          title="人员管理报表" 
          description="这里将展示人员绩效、考勤、工单完成情况等相关统计数据和图表。" 
          icon={<PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />}
          fileName="人员管理报表"
        />
        <ReportCard 
          title="耗材使用报表" 
          description="这里将展示各类耗材（如纸巾、洗手液）的消耗量、库存预警等数据。" 
          icon={<ConsumablesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />}
          fileName="耗材使用报表"
        />
        <ReportCard 
          title="人流量统计报表" 
          description="这里将展示公厕每日、每周、每月的人流量趋势和高峰时段分析。" 
          icon={<FlowIcon sx={{ mr: 1, verticalAlign: 'middle' }} />}
          fileName="人流量统计报表"
        />
      </Grid>
    </Box>
  );
};

export default ReportCenter;
