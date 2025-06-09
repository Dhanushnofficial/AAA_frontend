import React, { useEffect, useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';

const UserMaterialNotes = () => {
  const [materialNotes, setMaterialNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const billRef = useRef();

  // Fetch all material notes from backend
  useEffect(() => {
    axios.get('http://localhost:8000/materialnote')
      .then(res => setMaterialNotes(res.data))
      .catch(err => console.error('Error fetching material notes:', err));
  }, []);

  // Filter based on search input
  const filteredNotes = materialNotes.filter(note => {
    const query = searchQuery.toLowerCase();
    return (
      note.to.toLowerCase().includes(query) ||
      note.product.toLowerCase().includes(query) ||
      note.serialNumber.toLowerCase().includes(query) ||
      note.uniqueNumber.toLowerCase().includes(query)
    );
  });



  // Export selected note to PDF
  const handleDownloadPDF = () => {
    if (!billRef.current) return;
    html2canvas(billRef.current).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [148, 210],
      });
      const pdfWidth = 148;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MaterialNote_${selectedNote.uniqueNumber || '0000'}.pdf`);
    });
  };

  // Export all notes to Excel
  const handleExportAll = async () => {
  try {
    const res = await axios.get('http://localhost:8000/materialnote/export');
    // res.data is assumed to be an array of material notes

    // Flatten all notes with their items
    const flattenedData = res.data.flatMap(note => {
      // If note.items is empty or missing, still return a single row with empty product info
      if (!note.items || note.items.length === 0) {
        return [{
          'Unique Number': note.uniqueNumber || 'N/A',
          To: note.to || 'N/A',
          Date: note.date ? new Date(note.date).toLocaleDateString() : 'N/A',
          Product: '',
          'Serial Number': ''
        }];
      }
      // Map each item to a row with parent fields
      return note.items.map((item, index) => ({
        'Unique Number': note.uniqueNumber || 'N/A',
        To: note.to || 'N/A',
        Date: note.date ? new Date(note.date).toLocaleDateString() : 'N/A',
        Product: item.product || '',
        'Serial Number': item.serialNumber || ''
      }));
    });

    const ws = XLSX.utils.json_to_sheet(flattenedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MaterialNotes');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, `MaterialNotes_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (err) {
    console.error('Excel Export Error:', err);
  }
};


  // Drop the entire material notes collection
  const handleDropCollection = async () => {
    if (!window.confirm("Are you sure you want to delete all material notes? This action is irreversible.")) return;
    try {
      await axios.delete('http://localhost:8000/materialnote/drop');
      alert("Material Note collection dropped successfully!");
      setMaterialNotes([]);
    } catch (err) {
      console.error("Drop Error:", err);
      alert("Failed to drop the collection.");
    }
  };

  return (
    <div style={{ padding: '40px 20px', margin: '0px 20px' }}>
      <h2>User Material Notes</h2>

      {/* Export and Drop Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', }}>
        <button onClick={handleExportAll} style={buttonStyle('#4CAF50')}>📤 Export to Excel</button>
        <button onClick={handleDropCollection} style={buttonStyle('#f44336')}>🗑 Drop Table</button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by Unique Number, Product, Serial Number or To..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={searchInputStyle}
      />

      {/* Filtered Notes List */}
      {filteredNotes.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredNotes.map((note, index) => (
            <li
              key={index}
              onClick={() => setSelectedNote(note)}
              style={{
                padding: '10px',
                marginBottom: '5px',
                cursor: 'pointer',
                backgroundColor: selectedNote?._id === note._id ? '#f0f0f0' : '#fff',
                border: '1px solid #ccc',
              }}
            >
              <strong>{note.product}</strong> — {note.to} — {note.serialNumber}
            </li>
          ))}
        </ul>
      ) : (
        <p>No matching material notes found.</p>
      )}

      {/* Modal for PDF Preview */}
      {selectedNote && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <span onClick={() => setSelectedNote(null)} style={closeBtn}>×</span>
            <div ref={billRef} style={pdfBillStyle}>
              <div>
                <h1 style={{ textAlign: 'center' }}>AAA</h1>
                <hr style={{ margin:'12px 0px'}} />
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom:'10px' }}>
                  <h3 ><strong>To:</strong> {selectedNote.to}</h3>
                  <p >{selectedNote.date ? new Date(selectedNote.date).toLocaleDateString() : 'N/A'}</p>
                </div>
              <p style={{marginBottom:'8px'}}><strong>Unique Number:</strong> {selectedNote.uniqueNumber || 'N/A'}</p>

              {/* Items Table */}
              {selectedNote.items?.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                  <thead>
                    <tr>
                      <th style={cellStyle}>S.no</th>
                      <th style={cellStyle}>Product</th>
                      <th style={cellStyle}>Serial Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedNote.items.map((item, index) => (
                      <tr key={index}>
                        <td style={cellStyle}>{index + 1}</td>
                        <td style={cellStyle}>{item.product}</td>
                        <td style={cellStyle}>{item.serialNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              </div>

              {/* Signature Section */}
              <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between' }}>
                <Signature label="Receiver Signature" />
                <Signature label="Company Signature" />
              </div>
            </div>

            <button onClick={handleDownloadPDF} style={{ marginTop: '20px', padding: '10px 20px' }}>
              📥 Download Material Note PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Styles & Components
const buttonStyle = (bg) => ({
  padding: '10px 15px',
  backgroundColor: bg,
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  marginRight: '10px'
});

const searchInputStyle = {
  padding: '10px',
  width: '100%',
  maxWidth: '400px',
  marginBottom: '20px',
  fontSize: '16px'
};

const modalOverlay = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000
};

const modalContent = {
  backgroundColor: '#fff',
  padding: '20px',
  width: '80%',
  maxWidth: '600px',
  maxHeight: '90vh',
  overflowY: 'auto',
  borderRadius: '10px',
  position: 'relative'
};

const closeBtn = {
  position: 'absolute',
  top: '10px',
  right: '15px',
  cursor: 'pointer',
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#888'
};

const pdfBillStyle = {
  fontFamily: 'Arial',
  fontSize: '14px',
  padding: '25px',
  backgroundColor: '#fff',
  boxSizing: 'border-box',
  width: '100%',
  minHeight: '800px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const cellStyle = {
  border: '1px solid black',
  padding: '5px'
};

const Signature = ({ label }) => (
  <div>
    <p><strong>{label}</strong></p>
    <div style={{ borderTop: '1px solid #000', width: '120px', marginTop: '30px' }}></div>
  </div>
);

export default UserMaterialNotes;
