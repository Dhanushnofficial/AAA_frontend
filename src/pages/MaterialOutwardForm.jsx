import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './Style/MaterialOutwardForm.css';

function MaterialOutwardForm() {
  const [uniqueNumber, setUniqueNumber] = useState('');
  const [materialNotes, setMaterialNotes] = useState([]);
  const [items, setItems] = useState([]);
  const [to, setTo] = useState('');

  useEffect(() => {
    async function fetchNotes() {
      const res = await fetch('http://localhost:8000/materialnote');
      const data = await res.json();
      setMaterialNotes(data);
    }
    fetchNotes();
  }, []);

  const options = materialNotes.map(note => ({
    value: note.uniqueNumber,
    label: note.uniqueNumber
  }));

  const handleUniqueNumberChange = (selectedOption) => {
    if (!selectedOption) {
      setUniqueNumber('');
      setTo('');
      setItems([]);
      return;
    }
    const value = selectedOption.value;
    setUniqueNumber(value);

    const note = materialNotes.find(n => n.uniqueNumber === value);
    if (note) {
      setTo(note.to || '');
      const filledItems = (note.items || []).map(item => ({
        product: item.product || '',
        serialNumber: item.serialNumber || '',
        replacementSerial: ''  // user fills this
      }));
      setItems(filledItems);
    }
  };

  const handleReplacementChange = (index, value) => {
    const newItems = [...items];
    newItems[index].replacementSerial = value;
    setItems(newItems);
  };

 

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!uniqueNumber) {
    alert('Please select a Material Note number.');
    return;
  }

  // Validate all replacementSerial fields are filled
  if (items.some(item => !item.replacementSerial)) {
    alert('Please fill all Replacement Serial Numbers.');
    return;
  }

  try {
    const response = await fetch('http://localhost:8000/materialoutward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uniqueNumber,
        to,
        items,
      }),
    });

    const data = await response.json();

    if (data.success) {
      alert(`Material Outward saved with Number: ${data.outwardNumber}`);
      // Reset form
      setUniqueNumber('');
      setTo('');
      setItems([]);
    } else {
      alert('Failed to save material outward: ' + data.message);
    }
  } catch (err) {
    alert('Error submitting form: ' + err.message);
  }
};

  return (
    <div className="outward-container">
      <h2>Create Material Outward</h2>
      <form className="outward-form" onSubmit={handleSubmit}>
        <label>Material Note Number:</label>
        <Select
          options={options}
          onChange={handleUniqueNumberChange}
          placeholder="Select or search Unique Number..."
          isClearable
          value={options.find(o => o.value === uniqueNumber) || null}
        />

        <label>To:</label>
        <input type="text" value={to} readOnly />

        {items.map((item, index) => (
          <div key={index} className="form-row">
            <input type="text" value={item.product} readOnly placeholder="Product" />
            <input type="text" value={item.serialNumber} readOnly placeholder="Serial Number" />
            <input
              type="text"
              placeholder="Replacement Serial Number"
              value={item.replacementSerial}
              onChange={(e) => handleReplacementChange(index, e.target.value)}
              required
            />
            <button type="button" onClick={() => removeItem(index)}>❌</button>
          </div>
        ))}

        <div className="button-group">
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}

export default MaterialOutwardForm;
