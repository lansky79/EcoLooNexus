import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Rating, Button, ButtonGroup } from '@mui/material';

interface AttendanceRecord {
  id: string;
  personnelId: string;
  date: string;
  status: '出勤' | '迟到' | '缺勤';
}

interface WorkCompletionRecord {
  id: string;
  personnelId: string;
  completionDate: string;
  rating: number | null;
}

interface Personnel {
  id: string;
  name: string;
}

// Mock Data Generation
const generateMockData = () => {
  const personnelNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
  const generatedPersonnel: Personnel[] = personnelNames.map((name, index) => ({
    id: String(index + 1),
    name: name,
  }));

  const generatedAttendance: AttendanceRecord[] = [];
  const generatedWorkCompletions: WorkCompletionRecord[] = [];
  let attendanceIdCounter = 1;
  let workCompletionIdCounter = 1;

  const startDate = new Date('2024-05-01'); // Start data from May 1st
  const endDate = new Date(); // Up to today

  generatedPersonnel.forEach(person => {
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];

      // Generate attendance
      const attendanceStatus = Math.random() < 0.8 ? '出勤' : (Math.random() < 0.5 ? '迟到' : '缺勤');
      generatedAttendance.push({
        id: `a${attendanceIdCounter++}`,
        personnelId: person.id,
        date: dateString,
        status: attendanceStatus,
      });

      // Generate work completions (randomly, not every day)
      if (Math.random() < 0.7) { // 70% chance of completing a work order on a given day
        generatedWorkCompletions.push({
          id: `w${workCompletionIdCounter++}`,
          personnelId: person.id,
          completionDate: dateString,
          rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)), // Rating between 3.0 and 5.0
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return {
    mockPersonnel: generatedPersonnel,
    mockAttendance: generatedAttendance,
    mockWorkCompletions: generatedWorkCompletions,
  };
};

const { mockPersonnel, mockAttendance, mockWorkCompletions } = generateMockData();

const WorkAssessment: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [workCompletions, setWorkCompletions] = useState<WorkCompletionRecord[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [filterType, setFilterType] = useState<'week' | 'month' | 'quarter'>('month'); // Default filter

  useEffect(() => {
    // Using mock data for now
    setAttendance(mockAttendance);
    setWorkCompletions(mockWorkCompletions);
    setPersonnel(mockPersonnel);

    // In a real application, you would fetch data from APIs:
    // const fetchData = async () => {
    //   try {
    //     const [attendanceRes, completionsRes, personnelRes] = await Promise.all([
    //       axios.get<AttendanceRecord[]>('/api/attendance'),
    //       axios.get<WorkCompletionRecord[]>('/api/workcompletion'),
    //       axios.get<Personnel[]>('/api/personnel'),
    //     ]);
    //     setAttendance(attendanceRes.data);
    //     setWorkCompletions(completionsRes.data);
    //     setPersonnel(personnelRes.data);
    //   } catch (error) {
    //     console.error('Error fetching data:', error);
    //   }
    // };
    // fetchData();
  }, []);

  const filterDataByTime = (data: (AttendanceRecord | WorkCompletionRecord)[], type: 'week' | 'month' | 'quarter') => {
    const now = new Date();
    return data.filter(item => {
      const itemDate = new Date((item as AttendanceRecord).date || (item as WorkCompletionRecord).completionDate);
      if (type === 'week') {
        const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        return itemDate >= firstDayOfWeek;
      } else if (type === 'month') {
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      } else if (type === 'quarter') {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const itemQuarter = Math.floor(itemDate.getMonth() / 3);
        return itemQuarter === currentQuarter && itemDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const getPersonnelName = (personnelId: string) => {
    const person = personnel.find(p => p.id === personnelId);
    return person ? person.name : '未知人员';
  };

  const getWorkCompletionForPersonnel = (personnelId: string) => {
    const filteredCompletions = filterDataByTime(workCompletions, filterType) as WorkCompletionRecord[];
    return filteredCompletions.filter(wc => wc.personnelId === personnelId);
  };

  const getAttendanceForPersonnel = (personnelId: string) => {
    const filteredAttendance = filterDataByTime(attendance, filterType) as AttendanceRecord[];
    return filteredAttendance.filter(a => a.personnelId === personnelId);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>工作考核</Typography>
      <ButtonGroup variant="contained" aria-label="outlined primary button group" sx={{ mb: 2 }}>
        <Button onClick={() => setFilterType('week')} disabled={filterType === 'week'}>按周</Button>
        <Button onClick={() => setFilterType('month')} disabled={filterType === 'month'}>按月</Button>
        <Button onClick={() => setFilterType('quarter')} disabled={filterType === 'quarter'}>按季度</Button>
      </ButtonGroup>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>人员</TableCell>
              <TableCell align="right">出勤天数</TableCell>
              <TableCell align="right">迟到次数</TableCell>
              <TableCell align="right">缺勤次数</TableCell>
              <TableCell align="right">完成工单数</TableCell>
              <TableCell align="right">平均评分</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {personnel.map((person) => {
              const personAttendance = getAttendanceForPersonnel(person.id);
              const personCompletions = getWorkCompletionForPersonnel(person.id);
              const averageRating = personCompletions.reduce((acc, cur) => acc + (cur.rating || 0), 0) / personCompletions.length || 0;

              return (
                <TableRow key={person.id}>
                  <TableCell component="th" scope="row">
                    {person.name}
                  </TableCell>
                  <TableCell align="right">{personAttendance.filter(a => a.status === '出勤').length}</TableCell>
                  <TableCell align="right">{personAttendance.filter(a => a.status === '迟到').length}</TableCell>
                  <TableCell align="right">{personAttendance.filter(a => a.status === '缺勤').length}</TableCell>
                  <TableCell align="right">{personCompletions.length}</TableCell>
                  <TableCell align="right">
                    <Rating value={averageRating} readOnly precision={0.5} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default WorkAssessment;
