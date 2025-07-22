import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Box, Button, TextField, Paper, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface Personnel {
  id: string;
  name: string;
  role: string;
  contact: string;
}

const mockPersonnelData: Personnel[] = Array.from({ length: 20 }, (_, i) => ({
  id: `p${i + 1}`,
  name: `员工 ${i + 1}`,
  role: i % 3 === 0 ? '清洁工' : (i % 3 === 1 ? '维修工' : '管理员'),
  contact: `1380000${String(i + 1).padStart(4, '0')}`,
}));

const PersonnelList: React.FC = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>(mockPersonnelData);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonRole, setNewPersonRole] = useState('');
  const [newPersonContact, setNewPersonContact] = useState('');
  const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);
  const [showForm, setShowForm] = useState(false); // 新增状态：控制表单显示隐藏

  // Simulate API calls with mock data
  const fetchPersonnel = () => {
    setPersonnel(mockPersonnelData);
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const handleAddOrUpdatePerson = async () => {
    // In a real app, this would be an API call
    if (editingPerson) {
      setPersonnel(personnel.map(p => p.id === editingPerson.id ? { ...p, name: newPersonName, role: newPersonRole, contact: newPersonContact } : p));
      setEditingPerson(null);
    } else {
      const newId = `p${personnel.length + 1}`;
      setPersonnel([...personnel, { id: newId, name: newPersonName, role: newPersonRole, contact: newPersonContact }]);
    }
    setNewPersonName('');
    setNewPersonRole('');
    setNewPersonContact('');
    setShowForm(false);
  };

  const handleDeletePerson = async (id: string) => {
    // In a real app, this would be an API call
    setPersonnel(personnel.filter(p => p.id !== id));
  };

  const handleEditClick = (person: Personnel) => {
    setEditingPerson(person);
    setNewPersonName(person.name);
    setNewPersonRole(person.role);
    setNewPersonContact(person.contact);
    setShowForm(true); // 点击编辑时显示表单
  };

  const handleAddClick = () => {
    setEditingPerson(null); // 清空编辑状态
    setNewPersonName('');
    setNewPersonRole('');
    setNewPersonContact('');
    setShowForm(true); // 显示表单
  };

  const handleCancelEdit = () => {
    setEditingPerson(null);
    setNewPersonName('');
    setNewPersonRole('');
    setNewPersonContact('');
    setShowForm(false); // 取消时隐藏表单
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>人员管理</Typography>
      <Button variant="contained" onClick={handleAddClick} sx={{ mb: 2 }}>
        添加新人员
      </Button>

      {showForm && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>{editingPerson ? '编辑人员' : '添加新人员'}</Typography>
          <TextField
            label="姓名"
            fullWidth
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="角色"
            fullWidth
            value={newPersonRole}
            onChange={(e) => setNewPersonRole(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="联系方式"
            fullWidth
            value={newPersonContact}
            onChange={(e) => setNewPersonContact(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleAddOrUpdatePerson}>
            {editingPerson ? '更新人员' : '添加人员'}
          </Button>
          <Button variant="outlined" sx={{ ml: 2 }} onClick={handleCancelEdit}>
            取消
          </Button>
        </Paper>
      )}

      <Typography variant="h6" gutterBottom>现有人员</Typography>
      <List component={Paper}>
        {personnel.map((person) => (
          <ListItem key={person.id} divider>
            <ListItemText
              primary={person.name}
              secondary={`角色: ${person.role} | 联系方式: ${person.contact}`}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(person)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeletePerson(person.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default PersonnelList;
