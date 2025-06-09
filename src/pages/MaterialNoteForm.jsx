import React, { useState } from 'react';
import axios from 'axios';
import './Style/MaterialNoteForm.css';

const MaterialNoteForm = () => {
  const [to, setTo] = useState('');
  const [items, setItems] = useState([{ product: '', serialNumber: '' }]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { product: '', serialNumber: '' }]);
  };

  const removeItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/materialnote', { to, items });
      alert(`Submitted: ${res.data.note.uniqueNumber}`);
      setTo('');
      setItems([{ product: '', serialNumber: '' }]);
    } catch (error) {
      console.error('Submission error:', error.response?.data || error.message);
      alert(`Error submitting material note: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="material-note-form">
        <h2>📝 Submit Material Note</h2>

        <label>To:</label>
        <input
          type="text"
          placeholder="Enter Company name"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
        />

        <label>Items:</label>
        {items.map((item, index) => (
          <div key={index} className="item-row">
            <input
              type="text"
              placeholder="Product"
              value={item.product}
              onChange={(e) => handleItemChange(index, 'product', e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Serial Number"
              value={item.serialNumber}
              onChange={(e) => handleItemChange(index, 'serialNumber', e.target.value)}
              required
            />
            {items.length > 1 && (
              <button type="button" className="remove-btn" onClick={() => removeItem(index)}>
                ✖
              </button>
            )}
          </div>
        ))}
        <div style={{display:'flex', justifyContent:'space-around'}}>
          <button type="button" className="add-btn" onClick={addItem}>
            + Add Item
          </button>

          <button type="submit" className="submit-btn">
            🚀 Submit
          </button>
        </div>
        
      </form>
    </div>
  );
};

export default MaterialNoteForm;
