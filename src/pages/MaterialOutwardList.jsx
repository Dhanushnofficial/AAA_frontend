import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Style/MaterialOutwardList.css';

const MaterialOutwardList = () => {
  const [outwards, setOutwards] = useState([]);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ to: '', items: [] });

  useEffect(() => {
    fetchOutwards();
  }, []);

  const fetchOutwards = async () => {
    try {
      const res = await axios.get('http://localhost:8000/materialoutward');
      setOutwards(res.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const deleteOutward = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`http://localhost:8000/materialoutward/${id}`);
      fetchOutwards();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleEdit = (data) => {
    setEditData(data._id);
    setFormData({
      to: data.to,
      items: data.items.map(item => ({ ...item }))
    });
  };

  const handleItemChange = (index, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index].replacementSerial = value;
    setFormData({ ...formData, items: updatedItems });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:8000/materialoutward/${editData}`, formData);
      setEditData(null);
      fetchOutwards();
    } catch (error) {
      console.error('Error updating:', error);
    }
  };

  return (
    <div className="list-container">
      <h2 className="text-xl font-bold mb-4">Material Outward List</h2>

      <table className="outward-table">
        <thead>
          <tr>
            <th>Outward No</th>
            <th>Unique No</th>
            <th>To</th>
            <th>Items</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {outwards.map(entry => (
            <tr key={entry._id}>
              <td>{entry.outwardNo}</td>
              <td>{entry.uniqueNumber}</td>
              <td>{entry.to}</td>
              <td>
                {entry.items.map((item, idx) => (
                  <div key={idx} className="item-block">
                    <div><strong>Product:</strong> {item.product}</div>
                    <div><strong>Serial:</strong> {item.serialNumber}</div>
                    <div><strong>Replacement:</strong> {item.replacementSerial}</div>
                    <hr />
                  </div>
                ))}
              </td>
              <td>
                <button onClick={() => handleEdit(entry)} className="edit-btn">Edit</button>
                <button onClick={() => deleteOutward(entry._id)} className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Outward Entry</h3>
            <form className="material-form" onSubmit={e => e.preventDefault()}>
              <label>
                To:
                <input
                  type="text"
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                />
              </label>

              <h4>Items:</h4>
              <table className="items-edit-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Serial Number</th>
                    <th>Replacement Serial</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.product}</td>
                      <td>{item.serialNumber}</td>
                      <td>
                        <input
                          type="text"
                          value={item.replacementSerial || ''}
                          onChange={(e) => handleItemChange(idx, e.target.value)}
                          placeholder="Enter replacement serial"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="form-buttons">
                <button type="button" onClick={handleUpdate} className="save-btn">Update</button>
                <button type="button" onClick={() => setEditData(null)} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialOutwardList;
