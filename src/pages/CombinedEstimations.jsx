import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CombinedDataList() {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchCombinedData();
  }, []);

  const fetchCombinedData = async () => {
    try {
      const res = await axios.get('http://localhost:8000/combined-data');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch combined data:', err);
    }
  };

  const startEditing = (id, estimation) => {
    setEditingId(id);
    // Prepare form with estimation data, convert date to YYYY-MM-DD for input[type=date]
    setEditForm({
      ...estimation,
      estimationDate: estimation.estimationDate
        ? new Date(estimation.estimationDate).toISOString().slice(0, 10)
        : '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (id) => {
    try {
      // Convert estimationDate back to ISO string or Date object before sending
      const payload = {
        ...editForm,
        estimationDate: editForm.estimationDate
          ? new Date(editForm.estimationDate).toISOString()
          : null,
      };

      await axios.put(`http://localhost:8000/combined-data/${id}`, payload);
      setEditingId(null);
      fetchCombinedData();
    } catch (err) {
      console.error('Failed to update estimation:', err);
    }
  };

  const deleteEstimation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this estimation?')) return;
    try {
      await axios.delete(`http://localhost:8000/combined-data/${id}`);
      fetchCombinedData();
    } catch (err) {
      console.error('Failed to delete estimation:', err);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Combined Data List</h2>
      <table
        border="1"
        cellPadding={8}
        style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}
      >
        <thead>
          <tr>
            <th>Estimation ID</th>
            <th>Customer ID</th>
            <th>Product</th>
            <th>Estimation Date</th>
            <th>Start Date</th>
            <th>Start Details</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>
                No data found
              </td>
            </tr>
          ) : (
            data.map(({ estimation, start }) => (
              <tr key={estimation._id}>
                <td>{estimation._id}</td>
                <td>{estimation.customerId || '-'}</td>

                <td>
                  {editingId === estimation._id ? (
                    <input
                      type="text"
                      name="product"
                      value={editForm.product || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    estimation.product || '-'
                  )}
                </td>

                <td>
                  {editingId === estimation._id ? (
                    <input
                      type="date"
                      name="estimationDate"
                      value={editForm.estimationDate || ''}
                      onChange={handleInputChange}
                    />
                  ) : estimation.estimationDate ? (
                    new Date(estimation.estimationDate).toLocaleDateString()
                  ) : (
                    '-'
                  )}
                </td>

                <td>
                  {start?.startDate ? new Date(start.startDate).toLocaleDateString() : '-'}
                </td>

                <td>{start?.details || '-'}</td>

                <td>
                  {editingId === estimation._id ? (
                    <>
                      <button onClick={() => saveEdit(estimation._id)}>Save</button>{' '}
                      <button onClick={cancelEditing}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEditing(estimation._id, estimation)}>
                        Edit
                      </button>{' '}
                      <button onClick={() => deleteEstimation(estimation._id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CombinedDataList;
