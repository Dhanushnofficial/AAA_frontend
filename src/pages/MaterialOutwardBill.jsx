import React, { useEffect, useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';

function UserMaterialOutward() {
  const [materialOutwards, setMaterialOutwards] = useState([]);
  const [selectedOutward, setSelectedOutward] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const billRef = useRef();

  // Fetch material outwards
  useEffect(() => {
    fetchMaterialOutwards();
  }, []);

  const fetchMaterialOutwards = () => {
    axios.get('http://localhost:8000/materialOutward')
      .then(res => setMaterialOutwards(res.data))
      .catch(err => console.error('Error fetching material outwards:', err));
  };

  // Filter notes by search query
  const filteredOutwards = materialOutwards.filter(outward => {
    const query = searchQuery.toLowerCase();
    const matchesItems = outward.items.some(
      item =>
        item.product.toLowerCase().includes(query) ||
        item.serialNumber.toLowerCase().includes(query) ||
        (item.replacementSerial && item.replacementSerial.toLowerCase().includes(query))
    );

    return (
      outward.to.toLowerCase().includes(query) ||
      outward.uniqueNumber.toLowerCase().includes(query) ||
      String(outward.outwardNo).includes(query) ||
      matchesItems
    );
  });

  // PDF download
  const handleDownloadPDF = () => {
    if (!billRef.current) return;
    html2canvas(billRef.current).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [148, 210], // A5 size
      });
      const pdfWidth = 148;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MaterialOutward_${selectedOutward.outwardNo || '0000'}.pdf`);
    });
  };

  // Excel export for all data
  const handleDownloadExcel = () => {
    if (materialOutwards.length === 0) return alert("No data available to export.");

    // Flatten data for Excel export
    const data = [];
    materialOutwards.forEach(outward => {
      if (outward.items && outward.items.length > 0) {
        outward.items.forEach((item, index) => {
          data.push({
            'Outward No': outward.outwardNo || '',
            'Unique Number': outward.uniqueNumber || '',
            'To': outward.to || '',
            'Date': outward.date ? new Date(outward.date).toLocaleDateString() : '',
            'S.No': index + 1,
            'Product': item.product,
            'Serial Number': item.serialNumber,
            'Replacement Serial Number': item.replacementSerial || '-',
          });
        });
      } else {
        data.push({
          'Outward No': outward.outwardNo || '',
          'Unique Number': outward.uniqueNumber || '',
          'To': outward.to || '',
          'Date': outward.date ? new Date(outward.date).toLocaleDateString() : '',
          'S.No': '',
          'Product': '',
          'Serial Number': '',
          'Replacement Serial Number': '',
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Material Outwards');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `MaterialOutwards_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Drop entire material outward collection
  const handleDropCollection = async () => {
    if (!window.confirm("Are you sure you want to delete all material outwards? This action cannot be undone.")) return;

    try {
      await axios.delete('http://localhost:8000/materialOutward/drop');
      alert("Material Outward collection dropped successfully!");
      setMaterialOutwards([]);
      setSelectedOutward(null);
    } catch (err) {
      console.error("Drop collection error:", err);
      alert("Failed to drop the collection.");
    }
  };

  return (
    <div style={{ padding: '40px 20px', margin: '0px 20px' }}>
      <h2>User Material Outwards</h2>

      {/* Buttons for Excel Export and Drop Table */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', marginBottom: '20px' }}>
        <button onClick={handleDownloadExcel} style={buttonStyle('#4CAF50')}>📤 Export to Excel</button>
        <button onClick={handleDropCollection} style={buttonStyle('#f44336')}>🗑 Drop Table</button>
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by Outward No, Unique Number, Product, Serial Number or To..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          padding: '10px',
          width: '100%',
          maxWidth: '400px',
          marginBottom: '20px',
          fontSize: '16px'
        }}
      />

      {/* List of filtered material outwards */}
      {filteredOutwards.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredOutwards.map((outward, index) => (
            <li
              key={index}
              onClick={() => setSelectedOutward(outward)}
              style={{
                padding: '10px',
                marginBottom: '5px',
                cursor: 'pointer',
                backgroundColor: selectedOutward?._id === outward._id ? '#f0f0f0' : '#fff',
                border: '1px solid #ccc',
              }}
            >
              {outward.to} - {outward.uniqueNumber}
            </li>
          ))}
        </ul>
      ) : (
        <p>No matching material outwards found.</p>
      )}

      {/* PDF Preview Modal */}
      {selectedOutward && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              width: '80%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '10px',
              position: 'relative'
            }}
          >
            <span
              onClick={() => setSelectedOutward(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                cursor: 'pointer',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#888'
              }}
            >
              ×
            </span>

            <div
              ref={billRef}
              style={{
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
              }}
            >
              <div>
                <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>AAA</h1>
                <hr style={{ marginBottom: '15px' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3><strong>To:</strong> {selectedOutward.to}</h3>
                  <p>{selectedOutward.date ? new Date(selectedOutward.date).toLocaleDateString() : 'N/A'}</p>
                </div>

                <p style={{ margin: '8px 0' }}>
                  <strong>Outward No:</strong> {selectedOutward.outwardNo || 'N/A'}
                </p>
                <p style={{ margin: '8px 0' }}>
                  <strong>Unique Number:</strong> {selectedOutward.uniqueNumber || 'N/A'}
                </p>

                {selectedOutward.items && selectedOutward.items.length > 0 && (
                  <div>
                    <strong>Items:</strong>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                      <thead>
                        <tr>
                          <th style={{ border: '1px solid black', padding: '5px' }}>S.no</th>
                          <th style={{ border: '1px solid black', padding: '5px' }}>Product</th>
                          <th style={{ border: '1px solid black', padding: '5px' }}>Serial Number</th>
                          <th style={{ border: '1px solid black', padding: '5px' }}>Replacement Serial Number</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOutward.items.map((item, index) => (
                          <tr key={index}>
                            <td style={{ border: '1px solid black', padding: '5px' }}>{index + 1}</td>
                            <td style={{ border: '1px solid black', padding: '5px' }}>{item.product}</td>
                            <td style={{ border: '1px solid black', padding: '5px' }}>{item.serialNumber}</td>
                            <td style={{ border: '1px solid black', padding: '5px' }}>{item.replacementSerial || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p><strong>Receiver Signature</strong></p>
                  <div style={{ borderTop: '1px solid #000', width: '120px', marginTop: '30px' }}></div>
                </div>
                <div>
                  <p><strong>Company Signature</strong></p>
                  <div style={{ borderTop: '1px solid #000', width: '120px', marginTop: '30px' }}></div>
                </div>
              </div>
            </div>

            <button onClick={handleDownloadPDF} style={{ marginTop: '20px', padding: '10px 20px' }}>
              📥 Download Material Outward PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Button style helper
const buttonStyle = (bg) => ({
  padding: '10px 15px',
  backgroundColor: bg,
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
});

export default UserMaterialOutward;
