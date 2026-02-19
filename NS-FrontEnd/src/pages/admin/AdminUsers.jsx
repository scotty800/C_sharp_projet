import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usersApi } from '../../api/users';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const data = await usersApi.getAllUsers();
    setUsers(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="admin-users-page"
    >
      <div className="container">
        <h1>Gestion des utilisateurs</h1>
        {/* Liste des utilisateurs */}
      </div>
    </motion.div>
  );
};

export default AdminUsers;