import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function UserEstimations() {
  const [combinedData, setCombinedData] = useState([]);
  const [estimations, setEstimations] = useState([]);
  const [filteredEstimations, setFilteredEstimations] = useState([]);
  const [selectedEstimation, setSelectedEstimation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const billRef = useRef();

  useEffect(() => {
    fetch('http://localhost:8000/combined-estimations')
      .then(res => res.json())
      .then(data => {
        setCombinedData(data);

        const flatEstimations = [];
        data.forEach(entry => {
          if (entry.completedMessages && Array.isArray(entry.completedMessages)) {
            entry.completedMessages.forEach(msg => {
              flatEstimations.push({
                ...msg,
                name: entry.name || 'N/A',
                _id: msg._id || Math.random().toString(36).substr(2, 9), // fallback id
              });
            });
          }
        });

        setEstimations(flatEstimations);
        setFilteredEstimations(flatEstimations);
      })
      .catch(err => console.error('Error fetching combined estimations:', err));
  }, []);

  const exportToExcel = async () => {
    try {
      const res = await fetch('http://localhost:8000/combined-estimations-excel');
      if (!res.ok) throw new Error('Failed to fetch data for Excel');
      const data = await res.json();

      const flatData = [];
      data.forEach(entry => {
        if (entry.completedMessages && Array.isArray(entry.completedMessages)) {
          entry.completedMessages.forEach(msg => {
            flatData.push({
              name: entry.name || 'N/A',
              whatsappNo: msg.whatsappNo || 'N/A',
              productName: msg.productName || 'N/A',
              invoiceNumber: msg.invoiceNumber || 'N/A',
              date: msg.date ? new Date(msg.date).toLocaleDateString() : 'N/A',
              totalAmount: msg.totalAmount || 0,
            });
          });
        }
      });

      const worksheet = XLSX.utils.json_to_sheet(flatData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Estimations');

      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'Estimations.xlsx');
    } catch (error) {
      alert('Error exporting Excel: ' + error.message);
    }
  };

  const dropTable = async () => {
    if (!window.confirm('Are you sure you want to drop the estimations table? This cannot be undone.')) return;

    try {
      const res = await fetch('http://localhost:8000/drop-estimations', {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to drop table');
      alert('Estimations table dropped successfully.');

      setCombinedData([]);
      setEstimations([]);
      setFilteredEstimations([]);
      setSelectedEstimation(null);
    } catch (error) {
      alert('Error dropping table: ' + error.message);
    }
  };

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = estimations.filter(est =>
      (est.whatsappNo || '').toLowerCase().includes(query) ||
      (est.productName || '').toLowerCase().includes(query) ||
      (est.name || '').toLowerCase().includes(query)
    );
    setFilteredEstimations(filtered);
    setSelectedEstimation(null);
  }, [searchQuery, estimations]);

  const getName = () => {
    if (!selectedEstimation) return 'N/A';
    return selectedEstimation.name || 'N/A';
  };

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
      pdf.save(`Invoice_${selectedEstimation.invoiceNumber || '0000'}.pdf`);
    });
  };

  const closePopup = () => {
    setSelectedEstimation(null);
  };

  return (
    <div style={{ padding: '40px 20px', margin: '0px 20px' }}>
      <h2>User Estimation Bills</h2>
      <div style={{ marginBottom: '20px', display:'flex'}}>
        <button
          onClick={exportToExcel}
          style={{ marginRight: '15px', padding: '10px 20px', cursor: 'pointer' }}
        >
          📊 Export All to Excel
        </button>
        <button
          onClick={dropTable}
          style={{ backgroundColor: '#f44336', color: 'white', padding: '10px 20px', cursor: 'pointer' }}
        >
          🗑️ Drop Estimations Table
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by name, product name or WhatsApp number..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          padding: '10px',
          width: '100%',
          maxWidth: '400px',
          marginBottom: '20px',
          fontSize: '16px',
        }}
      />

      {filteredEstimations.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredEstimations.map((estimation) => (
            <li
              key={estimation._id}
              onClick={() => setSelectedEstimation(estimation)}
              style={{
                padding: '10px',
                marginBottom: '5px',
                cursor: 'pointer',
                backgroundColor: selectedEstimation?._id === estimation._id ? '#f0f0f0' : '#fff',
                border: '1px solid #ccc',
              }}
            >
              <strong>{estimation.productName || 'N/A'}</strong> — {estimation.name || 'N/A'} — {estimation.whatsappNo || 'N/A'}
            </li>
          ))}
        </ul>
      ) : (
        <p>No matching estimations found.</p>
      )}

      {selectedEstimation && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
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
              position: 'relative',
            }}
          >
            <span
              onClick={closePopup}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                cursor: 'pointer',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#888',
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
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>AAA</h1>
                <hr style={{ marginBottom: '15px' }} />
                <h3>🧾 Bill</h3>
                <p style={{ margin: '8px 0px' }}>
                  <strong>Receipt No:</strong> {selectedEstimation.invoiceNumber || 'N/A'}
                </p>
                <p style={{ margin: '8px 0px' }}>
                  <strong>Name:</strong> {getName()}
                </p>
                <p style={{ margin: '8px 0px' }}>
                  <strong>WhatsApp No:</strong> {selectedEstimation.whatsappNo || 'N/A'}
                </p>
                <p style={{ margin: '8px 0px' }}>
                  <strong>Product Name:</strong> {selectedEstimation.productName || 'N/A'}
                </p>
                <p style={{ margin: '8px 0px' }}>
                  <strong>Date:</strong>{' '}
                  {selectedEstimation.date ? new Date(selectedEstimation.date).toLocaleDateString() : 'N/A'}
                </p>

                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid black', padding: '8px' }}>Item Name</th>
                      <th style={{ border: '1px solid black', padding: '8px' }}>Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEstimation.items && selectedEstimation.items.length > 0 ? (
                      selectedEstimation.items.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ border: '1px solid black', padding: '8px' }}>{item.name}</td>
                          <td style={{ border: '1px solid black', padding: '8px' }}>{item.price}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                          No items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Total Amount</td>
                      <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>
                        ₹{selectedEstimation.totalAmount || '0'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p><strong>User Signature</strong></p>
                  <div style={{ borderTop: '1px solid #000', width: '120px', marginTop: '30px' }}></div>
                </div>
                <div>
                  <p><strong>Company Signature</strong></p>
                  <div style={{ borderTop: '1px solid #000', width: '120px', marginTop: '30px' }}></div>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadPDF}
              style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
            >
              📥 Download Bill as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserEstimations;
