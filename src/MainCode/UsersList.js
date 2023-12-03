import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faSearch } from '@fortawesome/free-solid-svg-icons';
import './UsersList.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [temp, setTemp] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('name');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const usersPerPage = 10;

  const handleBatchDelete = () => {
    try {
      const updatedUsers = users.filter((user) => !selectedUserIds.includes(user.id));
      const usersWithAdjustedIds = updatedUsers.map((user, index) => ({ ...user, id: index + 1 }));

      setUsers(usersWithAdjustedIds);
      setSelectedUserIds([]); // Reset selected users after deletion
    } catch (error) {
      console.error('Error deleting users:', error);
    }
  };

  const handleDeleteUser = (userId) => {
    try {
      const updatedUsers = users.filter((user) => user.id !== userId);
      const usersWithAdjustedIds = updatedUsers.map((user, index) => ({ ...user, id: index + 1 }));

      setUsers(usersWithAdjustedIds);
      setSelectedUserIds([]); // Reset selected users after deletion
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };


  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };


  const handlePageChange = (newPage) => {
    const maxPages = Math.ceil(users.length / usersPerPage);
    if (newPage > 0 && newPage <= maxPages) {
      setCurrentPage(newPage);
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUserIds((prevSelectedUserIds) => {
      if (prevSelectedUserIds.includes(userId)) {
        return prevSelectedUserIds.filter((id) => id !== userId);
      } else {
        return [...prevSelectedUserIds, userId];
      }
    });
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
  };

  const handleSaveEditedUser = (editedUser) => {
    try {
      // Update the user in the state
      const updatedUsers = users.map((user) =>
        user.id === editedUser.id ? { ...user, ...editedUser } : user
      );

      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error saving edited user:', error);
    } finally {
      setEditingUser(null);
    }
  };

  const handleCloseEditModal = () => {
    setEditingUser(null);
  };

  const handleSearch = () => {
    setSearchQuery(temp);
    const columnToSearch = selectedColumn.toLowerCase();
    const filteredUsers = users.filter((user) =>
      user[columnToSearch].toLowerCase().includes(temp.toLowerCase())
    );
    setFilteredUsers(filteredUsers);
    setCurrentPage(1); // Reset current page when search is performed
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);




  const maxPages = Math.ceil((searchQuery ? filteredUsers.length : users.length) / usersPerPage);
  const pageNumbers = [];
  for (let i = Math.max(1, currentPage - 1); i <= Math.min(maxPages, currentPage + 1); i++) {
    pageNumbers.push(i);
  }
  // ...
  const startPage = Math.max(1, currentPage - 1);
  const endPage = Math.min(startPage + 2, maxPages);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = searchQuery
    ? filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
    : users.slice(indexOfFirstUser, indexOfLastUser);
    const selectedRowCount = selectedUserIds.length;

  return (
    <div className="users-list">
      <div className="batch-delete" style={{ position: 'fixed', top: 0, right: 70, padding: '20px' }}>
        <button onClick={handleBatchDelete} style={{ background: 'none', border: 'none' }}>
          <FontAwesomeIcon icon={faTrash} color="red" size="3x" />
        </button>
      </div>
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search..."
          value={temp}
          onChange={(e) => { setTemp(e.target.value) }}
        />
        <div className="filter-dropdown">
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="role">Role</option>
          </select>
          <div className="dropdown-icon">&#9660;</div>
        </div>
        <button className="search-icon" onClick={handleSearch}>
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>

      <h2>User List</h2>
      <table className="user-table">
        <thead>
          <tr className="table-heading">
            <th className="checkbox-column">Select</th>
            <th className="id-column">ID</th>
            <th className="name-column">Name</th>
            <th className="email-column">Email</th>
            <th className="role-column">Role</th>
            <th className="edit-column">Edit</th>
            <th className="delete-button-column">Delete</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr key={user.id} className={`user-entry ${selectedUserIds.includes(user.id) ? 'selected' : ''}`}>
              <td className="checkbox-column">
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(user.id)}
                  onChange={() => handleSelectUser(user.id)}
                />
              </td>
              <td className="id-column">{user.id}</td>
              <td className="name-column">
                {editingUser && editingUser.id === user.id ? (
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                ) : (
                  user.name
                )}
              </td>
              <td className="email-column">
                {editingUser && editingUser.id === user.id ? (
                  <input
                    type="text"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                ) : (
                  user.email
                )}
              </td>
              <td className="role-column">
                {editingUser && editingUser.id === user.id ? (
                  <div classname="user-entry-editing">
                  <input
                    type="text"
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  />
                  </div>
                ) : (
                  user.role
                )}
              </td>
              <td className="edit-column">
                {editingUser && editingUser.id === user.id ? (
                  <>
                    <button onClick={() => handleSaveEditedUser(editingUser)}>Save</button>
                    <button onClick={handleCloseEditModal}>Cancel</button>
                  </>
                ) : (
                  <FontAwesomeIcon icon={faEdit} color="#007bff" onClick={() => handleEditUser(user)} />
                )}
              </td>
              <td className="delete-button-column">
                <button onClick={() => handleDeleteUser(user.id)}>
                  <FontAwesomeIcon icon={faTrash} color="red" />
                </button>

              </td>

            </tr>
          ))}
        </tbody>
      </table>

      <div className="selected-rows-info">
        {selectedRowCount >= 0 && (
          <p>
            Selected {selectedRowCount} {selectedRowCount === 1 ? 'row' : 'rows'} out of {users.length}
          </p>
        )}
      </div>

      <div className='pagination-container'>
        {/* Improved Pagination */}
        <button
          className="pagination-button"
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          {"<"}
        </button>
        {Array.from({ length: endPage - startPage + 1 }, (_, index) => (
          <button
            key={startPage + index}
            className={`pagination-button ${currentPage === startPage + index ? 'active' : ''}`}
            onClick={() => handlePageChange(startPage + index)}
          >
            {startPage + index}
          </button>
        ))}
        <button
          className="pagination-button"
          onClick={() => handlePageChange(Math.min(maxPages, currentPage + 1))}
          disabled={currentUsers.length === 0 || currentPage === maxPages}
        >
          {">"}
        </button>
      </div>
    </div>
  );
};

export default UsersList;
