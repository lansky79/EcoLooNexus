import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Box, Button, TextField, Paper, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface WorkOrder {
  id: string;
  restroomId: string;
  description: string;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  priority: string;
}

interface Personnel {
  id: string;
  name: string;
  role: string;
}

const WorkOrderList: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [newWorkOrderRestroomId, setNewWorkOrderRestroomId] = useState('');
  const [newWorkOrderDescription, setNewWorkOrderDescription] = useState('');
  const [newWorkOrderAssignedTo, setNewWorkOrderAssignedTo] = useState<string | null>(null);
  const [newWorkOrderPriority, setNewWorkOrderPriority] = useState('');
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [showForm, setShowForm] = useState(false); // 新增状态：控制表单显示隐藏

  const fetchWorkOrders = async () => {
    try {
      const response = await axios.get<WorkOrder[]>('/api/workorders');
      setWorkOrders(response.data);
    } catch (error) {
      console.error('Error fetching work orders:', error);
    }
  };

  const fetchPersonnel = async () => {
    try {
      const response = await axios.get<Personnel[]>('/api/personnel');
      setPersonnel(response.data);
    } catch (error) {
      console.error('Error fetching personnel:', error);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
    fetchPersonnel();
  }, []);

  const handleAddOrUpdateWorkOrder = async () => {
    try {
      if (editingWorkOrder) {
        await axios.put(`/api/workorders/${editingWorkOrder.id}`, {
          restroomId: newWorkOrderRestroomId,
          description: newWorkOrderDescription,
          assignedTo: newWorkOrderAssignedTo,
          priority: newWorkOrderPriority,
          status: editingWorkOrder.status, // Keep current status during edit
        });
        setEditingWorkOrder(null);
      } else {
        await axios.post('/api/workorders', {
          restroomId: newWorkOrderRestroomId,
          description: newWorkOrderDescription,
          assignedTo: newWorkOrderAssignedTo,
          priority: newWorkOrderPriority,
        });
      }
      setNewWorkOrderRestroomId('');
      setNewWorkOrderDescription('');
      setNewWorkOrderAssignedTo(null);
      setNewWorkOrderPriority('');
      setShowForm(false); // 提交后隐藏表单
      fetchWorkOrders();
    } catch (error) {
      console.error('Error adding/updating work order:', error);
    }
  };

  const handleDeleteWorkOrder = async (id: string) => {
    try {
      await axios.delete(`/api/workorders/${id}`);
      fetchWorkOrders();
    } catch (error) {
      console.error('Error deleting work order:', error);
    }
  };

  const handleEditClick = (workOrder: WorkOrder) => {
    setEditingWorkOrder(workOrder);
    setNewWorkOrderRestroomId(workOrder.restroomId);
    setNewWorkOrderDescription(workOrder.description);
    setNewWorkOrderAssignedTo(workOrder.assignedTo);
    setNewWorkOrderPriority(workOrder.priority);
    setShowForm(true); // 点击编辑时显示表单
  };

  const handleAddClick = () => {
    setEditingWorkOrder(null); // 清空编辑状态
    setNewWorkOrderRestroomId('');
    setNewWorkOrderDescription('');
    setNewWorkOrderAssignedTo(null);
    setNewWorkOrderPriority('');
    setShowForm(true); // 显示表单
  };

  const handleCancelEdit = () => {
    setEditingWorkOrder(null);
    setNewWorkOrderRestroomId('');
    setNewWorkOrderDescription('');
    setNewWorkOrderAssignedTo(null);
    setNewWorkOrderPriority('');
    setShowForm(false); // 取消时隐藏表单
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await axios.put(`/api/workorders/${id}/status`, { status: newStatus });
      fetchWorkOrders();
    } catch (error) {
      console.error('Error updating work order status:', error);
    }
  };

  const getPersonnelName = (personnelId: string | null) => {
    const person = personnel.find(p => p.id === personnelId);
    return person ? person.name : '未指派';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>工单管理</Typography>
      <Button variant="contained" onClick={handleAddClick} sx={{ mb: 2 }}>
        创建新工单
      </Button>

      {showForm && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>{editingWorkOrder ? '编辑工单' : '创建新工单'}</Typography>
          <TextField
            label="公厕ID"
            fullWidth
            value={newWorkOrderRestroomId}
            onChange={(e) => setNewWorkOrderRestroomId(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="描述"
            fullWidth
            multiline
            rows={3}
            value={newWorkOrderDescription}
            onChange={(e) => setNewWorkOrderDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>指派给</InputLabel>
            <Select
              value={newWorkOrderAssignedTo || ''}
              onChange={(e) => setNewWorkOrderAssignedTo(e.target.value as string)}
              label="指派给"
            >
              <MenuItem value="">未指派</MenuItem>
              {personnel.map((person) => (
                <MenuItem key={person.id} value={person.id}>
                  {person.name} ({person.role})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>优先级</InputLabel>
            <Select
              value={newWorkOrderPriority}
              onChange={(e) => setNewWorkOrderPriority(e.target.value as string)}
              label="优先级"
            >
              <MenuItem value="低">低</MenuItem>
              <MenuItem value="中">中</MenuItem>
              <MenuItem value="高">高</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleAddOrUpdateWorkOrder}>
            {editingWorkOrder ? '更新工单' : '创建工单'}
          </Button>
          <Button variant="outlined" sx={{ ml: 2 }} onClick={handleCancelEdit}>
            取消
          </Button>
        </Paper>
      )}

      <Typography variant="h6" gutterBottom>所有工单</Typography>
      <List component={Paper}>
        {workOrders.map((order) => (
          <ListItem key={order.id} divider>
            <ListItemText
              primary={`工单ID: ${order.id} | 公厕: ${order.restroomId} | 描述: ${order.description}`}
              secondary={
                <>
                  <Typography component="span" variant="body2" color="text.primary">
                    状态: {order.status} | 指派给: {getPersonnelName(order.assignedTo)} | 优先级: {order.priority}
                  </Typography>
                  <br />
                  <Typography component="span" variant="body2" color="text.secondary">
                    创建时间: {new Date(order.createdAt).toLocaleString()} | 更新时间: {new Date(order.updatedAt).toLocaleString()}
                  </Typography>
                </>
              }
            />
            <ListItemSecondaryAction>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 1 }}>
                <InputLabel>状态</InputLabel>
                <Select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value as string)}
                  label="状态"
                >
                  <MenuItem value="待处理">待处理</MenuItem>
                  <MenuItem value="处理中">处理中</MenuItem>
                  <MenuItem value="已完成">已完成</MenuItem>
                  <MenuItem value="已取消">已取消</MenuItem>
                </Select>
              </FormControl>
              <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(order)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteWorkOrder(order.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default WorkOrderList;
