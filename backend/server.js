
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const RESTROOMS_FILE = path.join(DATA_DIR, 'restrooms.json');
const ENVIRONMENT_FILE = path.join(DATA_DIR, 'environment_data.json');
const ALERTS_FILE = path.join(DATA_DIR, 'alerts_data.json');
const SUPPLIES_FILE = path.join(DATA_DIR, 'supplies_data.json');
const FLOW_FILE = path.join(DATA_DIR, 'flow_data.json');
const TOILET_STATUS_FILE = path.join(DATA_DIR, 'toilet_status_data.json');

// --- 初始化数据：从文件加载或使用默认值 ---
let restrooms = readData(RESTROOMS_FILE, []);
let environmentData = readData(ENVIRONMENT_FILE, {});
let alertsData = readData(ALERTS_FILE, {});
let suppliesData = readData(SUPPLIES_FILE, {});
let flowData = readData(FLOW_FILE, {});
let toiletStatusData = readData(TOILET_STATUS_FILE, {});

// --- API Endpoints ---

// NEW: Centralized Alerts Endpoint
app.get('/api/alerts/:restroomId', (req, res) => {
  const { restroomId } = req.params;
  const restroom = restrooms.find(r => r.id === restroomId);

  if (!restroom) {
    return res.status(404).send('Restroom not found');
  }

  const alerts = [];
  const now = new Date();

  // 1. Environment Alerts
  const envData = generateEnvironmentData();
  if (envData.isAmmoniaAlert) {
    alerts.push({
      id: `ammonia-critical-${restroomId}-${Date.now()}`,
      message: `氨气浓度严重超标 (${envData.ammonia} ppm)，请立即通风！`,
      severity: 'critical',
      timestamp: now.toISOString(),
      source: 'environment'
    });
  }
  if (envData.isH2sAlert) {
    alerts.push({
      id: `h2s-critical-${restroomId}-${Date.now()}`,
      message: `硫化氢浓度超标 (${envData.h2s} ppm)，可能存在风险。`,
      severity: 'critical',
      timestamp: now.toISOString(),
      source: 'environment'
    });
  }
  if (parseFloat(envData.temperature) > 30) { // Temperature Warning
     alerts.push({
      id: `temp-warning-${restroomId}-${Date.now()}`,
      message: `室内温度过高 (${envData.temperature}°C)，请检查空调系统。`,
      severity: 'warning',
      timestamp: now.toISOString(),
      source: 'environment'
    });
  }


  // 2. Supplies Alerts
  const suppliesData = generateSuppliesData();
  const lowPaperStalls = Object.keys(suppliesData.paper).filter(k => suppliesData.paper[k] < 20);
  if (lowPaperStalls.length > 0) {
    alerts.push({
      id: `paper-warning-${restroomId}-${Date.now()}`,
      message: `厕位 [${lowPaperStalls.join(', ')}] 厕纸余量不足，请及时补充。`,
      severity: 'warning',
      timestamp: now.toISOString(),
      source: 'supplies'
    });
  }
  const lowSoapSinks = Object.keys(suppliesData.soap).filter(k => suppliesData.soap[k] < 15);
  if (lowSoapSinks.length > 0) {
     alerts.push({
      id: `soap-warning-${restroomId}-${Date.now()}`,
      message: `洗手台 [${lowSoapSinks.join(', ')}] 洗手液余量不足，请及时补充。`,
      severity: 'warning',
      timestamp: now.toISOString(),
      source: 'supplies'
    });
  }

  // 3. Cleaning Alerts
  const cleaningStalls = [...restroom.toilets.male, ...restroom.toilets.female].filter(s => s.status === 'needs_cleaning');
  if (cleaningStalls.length > 0) {
    alerts.push({
      id: `cleaning-alert-${restroomId}-${Date.now()}`,
      message: `厕位 [${cleaningStalls.map(s => s.id).join(', ')}] 需要清洁。`,
      severity: 'warning',
      timestamp: now.toISOString(),
      source: 'toilets'
    });
  }

  // 4. Feedback-based Alerts
  const reportFeedback = feedbackData.filter(f => f.type === '上报');
  reportFeedback.forEach(fb => {
      alerts.push({
          id: `feedback-report-${fb.id}-${Date.now()}`,
          message: `公众上报: "${fb.content}"`,
          severity: 'warning',
          timestamp: now.toISOString(), // In a real app, use feedback time
          source: 'feedback'
      });
  });


  res.json(alerts);
});

app.get('/api/environment', (req, res) => {
  res.json(generateEnvironmentData());
});

app.get('/api/supplies', (req, res) => {
  res.json(generateSuppliesData());
});

app.get('/api/flow', (req, res) => {
  res.json(generateFlowData());
});

app.get('/api/restrooms/:restroomId/toilets', (req, res) => {
  const { restroomId } = req.params;
  const restroom = restrooms.find(r => r.id === restroomId);
  if (restroom) {
    res.json(restroom.toilets);
  } else {
    res.status(404).send('Restroom not found');
  }
});

app.get('/api/feedback', (req, res) => {
  res.json(feedbackData);
});

app.get('/api/restrooms', (req, res) => {
  res.json(restrooms.map(r => ({ id: r.id, name: r.name, location: r.location })));
});

app.post('/api/feedback', (req, res) => {
  const { type, content, rating } = req.body;
  const newFeedback = {
    id: feedbackData.length + 1,
    type,
    content,
    rating,
    time: '刚刚'
  };
  feedbackData.unshift(newFeedback);
  res.status(201).json(newFeedback);
});

// --- 新增：人员管理API ---
app.get('/api/personnel', (req, res) => {
  res.json(personnel);
});

app.post('/api/personnel', (req, res) => {
  const { name, role, contact } = req.body;
  if (!name || !role || !contact) {
    return res.status(400).send('Name, role, and contact are required');
  }
  const newPerson = { id: generateUniqueId('P'), name, role, contact };
  personnel.push(newPerson);
  writeData(PERSONNEL_FILE, personnel);
  res.status(201).json(newPerson);
});

app.get('/api/personnel/:id', (req, res) => {
  const { id } = req.params;
  const person = personnel.find(p => p.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).send('Personnel not found');
  }
});

app.put('/api/personnel/:id', (req, res) => {
  const { id } = req.params;
  const { name, role, contact } = req.body;
  const personIndex = personnel.findIndex(p => p.id === id);
  if (personIndex !== -1) {
    personnel[personIndex] = { ...personnel[personIndex], name, role, contact };
    writeData(PERSONNEL_FILE, personnel);
    res.json(personnel[personIndex]);
  } else {
    res.status(404).send('Personnel not found');
  }
});

app.delete('/api/personnel/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = personnel.length;
  personnel = personnel.filter(p => p.id !== id);
  if (personnel.length < initialLength) {
    writeData(PERSONNEL_FILE, personnel);
    res.status(204).send(); // No Content
  } else {
    res.status(404).send('Personnel not found');
  }
});

// --- 新增：工单管理API ---

app.post('/api/restrooms/:restroomId/toilets/:id/clean', (req, res) => {
  const { restroomId, id } = req.params;
  const restroom = restrooms.find(r => r.id === restroomId);

  if (!restroom) {
    return res.status(404).send('Restroom not found');
  }

  let stallFound = false;
  // Check male stalls
  restroom.toilets.male = restroom.toilets.male.map(stall => {
    if (stall.id === id) {
      stallFound = true;
      return { ...stall, status: 'available' };
    }
    return stall;
  });

  // Check female stalls
  if (!stallFound) {
    restroom.toilets.female = restroom.toilets.female.map(stall => {
      if (stall.id === id) {
        stallFound = true;
        return { ...stall, status: 'available' };
      }
      return stall;
    });
  }

  if (stallFound) {
    res.status(200).send('Stall cleaned successfully');
  } else {
    res.status(404).send('Stall not found');
  }
});

// --- 新增：工单管理API ---
app.get('/api/workorders', (req, res) => {
  res.json(workOrders);
});

app.post('/api/workorders', (req, res) => {
  const { restroomId, description, assignedTo, priority } = req.body;
  if (!restroomId || !description || !priority) {
    return res.status(400).send('Restroom ID, description, and priority are required');
  }
  const newWorkOrder = {
    id: generateUniqueId('WO'),
    restroomId,
    description,
    status: '待处理',
    assignedTo: assignedTo || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    priority,
  };
  workOrders.push(newWorkOrder);
  writeData(WORK_ORDERS_FILE, workOrders);
  res.status(201).json(newWorkOrder);
});

app.get('/api/workorders/:id', (req, res) => {
  const { id } = req.params;
  const workOrder = workOrders.find(wo => wo.id === id);
  if (workOrder) {
    res.json(workOrder);
  } else {
    res.status(404).send('Work Order not found');
  }
});

app.put('/api/workorders/:id', (req, res) => {
  const { id } = req.params;
  const { description, status, assignedTo, priority } = req.body;
  const workOrderIndex = workOrders.findIndex(wo => wo.id === id);
  if (workOrderIndex !== -1) {
    workOrders[workOrderIndex] = {
      ...workOrders[workOrderIndex],
      description,
      status,
      assignedTo: assignedTo || null,
      priority,
      updatedAt: new Date().toISOString(),
    };
    writeData(WORK_ORDERS_FILE, workOrders);
    res.json(workOrders[workOrderIndex]);
  } else {
    res.status(404).send('Work Order not found');
  }
});

app.delete('/api/workorders/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = workOrders.length;
  workOrders = workOrders.filter(wo => wo.id !== id);
  if (workOrders.length < initialLength) {
    writeData(WORK_ORDERS_FILE, workOrders);
    res.status(204).send(); // No Content
  } else {
    res.status(404).send('Work Order not found');
  }
});

app.put('/api/workorders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const workOrderIndex = workOrders.findIndex(wo => wo.id === id);
  if (workOrderIndex !== -1) {
    workOrders[workOrderIndex] = {
      ...workOrders[workOrderIndex],
      status,
      updatedAt: new Date().toISOString(),
    };
    writeData(WORK_ORDERS_FILE, workOrders);
    res.json(workOrders[workOrderIndex]);
  } else {
    res.status(404).send('Work Order not found');
  }
});

// --- 新增：出勤管理API ---
app.get('/api/attendance', (req, res) => {
  res.json(attendanceRecords);
});

app.post('/api/attendance', (req, res) => {
  const { personnelId, date, status, checkInTime, checkOutTime } = req.body;
  if (!personnelId || !date || !status) {
    return res.status(400).send('Personnel ID, date, and status are required');
  }
  const newRecord = {
    id: generateUniqueId('ATT'),
    personnelId,
    date,
    status,
    checkInTime: checkInTime || null,
    checkOutTime: checkOutTime || null,
  };
  attendanceRecords.push(newRecord);
  writeData(ATTENDANCE_FILE, attendanceRecords);
  res.status(201).json(newRecord);
});

app.get('/api/attendance/:id', (req, res) => {
  const { id } = req.params;
  const record = attendanceRecords.find(rec => rec.id === id);
  if (record) {
    res.json(record);
  } else {
    res.status(404).send('Attendance record not found');
  }
});

app.put('/api/attendance/:id', (req, res) => {
  const { id } = req.params;
  const { personnelId, date, status, checkInTime, checkOutTime } = req.body;
  const recordIndex = attendanceRecords.findIndex(rec => rec.id === id);
  if (recordIndex !== -1) {
    attendanceRecords[recordIndex] = {
      ...attendanceRecords[recordIndex],
      personnelId,
      date,
      status,
      checkInTime: checkInTime || null,
      checkOutTime: checkOutTime || null,
    };
    writeData(ATTENDANCE_FILE, attendanceRecords);
    res.json(attendanceRecords[recordIndex]);
  } else {
    res.status(404).send('Attendance record not found');
  }
});

app.delete('/api/attendance/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = attendanceRecords.length;
  attendanceRecords = attendanceRecords.filter(rec => rec.id !== id);
  if (attendanceRecords.length < initialLength) {
    writeData(ATTENDANCE_FILE, attendanceRecords);
    res.status(204).send(); // No Content
  } else {
    res.status(404).send('Attendance record not found');
  }
});

app.get('/api/personnel/:personnelId/attendance', (req, res) => {
  const { personnelId } = req.params;
  const records = attendanceRecords.filter(rec => rec.personnelId === personnelId);
  res.json(records);
});

// --- 新增：工作完成度管理API ---
app.get('/api/workcompletion', (req, res) => {
  res.json(workCompletionRecords);
});

app.post('/api/workcompletion', (req, res) => {
  const { workOrderId, personnelId, completionDate, notes, rating } = req.body;
  if (!workOrderId || !personnelId || !completionDate) {
    return res.status(400).send('Work Order ID, Personnel ID, and Completion Date are required');
  }
  const newRecord = {
    id: generateUniqueId('WCR'),
    workOrderId,
    personnelId,
    completionDate,
    notes: notes || null,
    rating: rating || null,
  };
  workCompletionRecords.push(newRecord);
  writeData(WORK_COMPLETION_FILE, workCompletionRecords);
  res.status(201).json(newRecord);
});

app.get('/api/workcompletion/:id', (req, res) => {
  const { id } = req.params;
  const record = workCompletionRecords.find(rec => rec.id === id);
  if (record) {
    res.json(record);
  } else {
    res.status(404).send('Work completion record not found');
  }
});

app.put('/api/workcompletion/:id', (req, res) => {
  const { id } = req.params;
  const { workOrderId, personnelId, completionDate, notes, rating } = req.body;
  const recordIndex = workCompletionRecords.findIndex(rec => rec.id === id);
  if (recordIndex !== -1) {
    workCompletionRecords[recordIndex] = {
      ...workCompletionRecords[recordIndex],
      workOrderId,
      personnelId,
      completionDate,
      notes: notes || null,
      rating: rating || null,
    };
    writeData(WORK_COMPLETION_FILE, workCompletionRecords);
    res.json(workCompletionRecords[recordIndex]);
  } else {
    res.status(404).send('Work completion record not found');
  }
});

app.delete('/api/workcompletion/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = workCompletionRecords.length;
  workCompletionRecords = workCompletionRecords.filter(rec => rec.id !== id);
  if (workCompletionRecords.length < initialLength) {
    writeData(WORK_COMPLETION_FILE, workCompletionRecords);
    res.status(204).send(); // No Content
  } else {
    res.status(404).send('Work completion record not found');
  }
});

app.get('/api/personnel/:personnelId/workcompletion', (req, res) => {
  const { personnelId } = req.params;
  const records = workCompletionRecords.filter(rec => rec.personnelId === personnelId);
  res.json(records);
});


app.listen(port, () => {
  console.log(`智慧公厕模拟数据服务器运行在 http://localhost:${port}`);
});
