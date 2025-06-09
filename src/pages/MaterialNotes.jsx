import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Style/MaterialNotes.css';

const MaterialNotes = () => {
  const [notes, setNotes] = useState([]);
  const [editNoteId, setEditNoteId] = useState(null);
  const [editItems, setEditItems] = useState([]);
  const [editTo, setEditTo] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await axios.get('http://localhost:8000/materialnote');
      setNotes(res.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const deleteNote = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this note?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/materialnote/${id}`);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleEditNote = (note) => {
    setEditNoteId(note._id);
    setEditTo(note.to || '');
    setEditItems(note.items.map(item => ({ ...item })));
    setShowModal(true);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...editItems];
    updatedItems[index][field] = value;
    setEditItems(updatedItems);
  };

  const handleAddItem = () => {
    setEditItems([...editItems, { product: '', serialNumber: '' }]);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:8000/materialnote/${editNoteId}`, {
        to: editTo,
        items: editItems,
      });

      setEditNoteId(null);
      setEditItems([]);
      setEditTo('');
      setShowModal(false);
      fetchNotes();
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  return (
    <div className="material-notes-container">
      <h2 className="material-notes-heading">Material Notes</h2>

      <table className="material-notes-table">
        <thead>
          <tr>
            <th>Unique Number</th>
            <th>To</th>
            <th>Items (Product & Serial Number)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {notes.map((note) => (
            <tr key={note._id}>
              <td>{note.uniqueNumber}</td>
              <td>{note.to}</td>
              <td>
                {note.items.map((item, index) => (
                  <div key={index} style={{ marginBottom: '0.5rem' }}>
                    <strong>📦 {item.product}</strong><br />
                    🔢 {item.serialNumber}
                  </div>
                ))}
              </td>
              <td>
                <button
                  onClick={() => handleEditNote(note)}
                  className="material-note-edit-btn"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteNote(note._id)}
                  className="material-note-delete-btn"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Material Note</h3>

            <form className="material-form">

              <label>
                To:
                <input
                  type="text"
                  value={editTo}
                  onChange={(e) => setEditTo(e.target.value)}
                />
              </label>

              <h4 className="mt-3">Items:</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Product</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Serial Number</th>
                  </tr>
                </thead>
                <tbody>
                  {editItems.map((item, index) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        <input
                          type="text"
                          value={item.product}
                          onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                          style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                        />
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        <input
                          type="text"
                          value={item.serialNumber}
                          onChange={(e) => handleItemChange(index, 'serialNumber', e.target.value)}
                          style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                type="button"
                onClick={handleAddItem}
                className="material-note-additem-btn"
                style={{ marginTop: '10px', marginBottom: '10px' }}
              >
                ➕ Add Item
              </button>

              <div className="modal-buttons">
                <button type="button" onClick={handleUpdate} className="material-note-update-btn">
                  Update All
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="modal-cancel-btn">
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialNotes;
