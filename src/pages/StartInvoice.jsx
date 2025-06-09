import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function UserStarts() {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const billRef = useRef();

  useEffect(() => {
  fetch('http://localhost:8000/start-entries', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(res => res.json())
    .then(data => {
      console.log('Fetched data:', data); 
      
      if (Array.isArray(data)) {
        setEntries(data);
        setFilteredEntries(data);
      } else {
        console.error('Expected an array but got:', data);
      }
    })
    .catch(err => console.error('Error fetching data:', err));
}, []);


  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = entries.filter(entry =>
      entry.whatsappNo.toLowerCase().includes(query) ||
      entry.products.toLowerCase().includes(query)
    );
    setFilteredEntries(filtered);
    setSelectedEntry(null);
  }, [searchQuery, entries]);

  const handleDownloadPDF = () => {
    const input = billRef.current;
    html2canvas(input).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [148, 210], // A5
      });
      const pdfWidth = 148;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${selectedEntry.name}.pdf`);
    });
  };


  const closePopup = () => setSelectedEntry(null);

  return (
    <div style={{ padding: '40px 20px', margin:'0px 20px'  }}>
      <h2>User Start Entries</h2>

      <input
        type="text"
        placeholder="Search by product or WhatsApp number..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ padding: '10px', width: '100%', maxWidth: '400px', marginBottom: '20px' }}
      />

      {filteredEntries.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredEntries.map((entry, index) => (
            <li
              key={index}
              onClick={() => setSelectedEntry(entry)}
              style={{
                padding: '10px',
                marginBottom: '15px',
                cursor: 'pointer',
                backgroundColor: selectedEntry?._id === entry._id ? '#f0f0f0' : '#fff',
                border: '1px solid #ccc',
              }}
            >
              <strong>{entry.name}</strong> — {entry.whatsappNo} - ( {entry.products} )
            </li>
          ))}
        </ul>
      ) : (
        <p>No matching entries found.</p>
      )}

      {selectedEntry && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff', padding: '20px',
            width: '80%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
            borderRadius: '10px', position: 'relative'
          }}>
            <span onClick={closePopup} style={{
              position: 'absolute', top: '10px', right: '15px',
              cursor: 'pointer', fontSize: '20px', fontWeight: 'bold', color: '#888'
            }}>×</span>

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


                <h1 style={{ textAlign: 'center', marginBottom:'15px' }}>AAA </h1>
                <hr style={{marginBottom:'15px'}}/>
                <h3>📝 Start Entry</h3>
                <p style={{margin:'8px 0px'}}><strong>Name:</strong> {selectedEntry.name}</p>
                <p style={{margin:'8px 0px'}}><strong>Contact No:</strong> {selectedEntry.contactNo}</p>
                <p style={{margin:'8px 0px'}} ><strong>WhatsApp No:</strong> {selectedEntry.whatsappNo}</p>
                <p style={{margin:'8px 0px'}} ><strong>Product:</strong> {selectedEntry.products}</p>
                <p style={{margin:'8px 0px'}} ><strong>Serial Number:</strong> {selectedEntry.serialNumber}</p>
                <p style={{margin:'8px 0px'}} ><strong>Problems:</strong> {selectedEntry.problems}</p>
                <p style={{margin:'8px 0px'}} ><strong>Warranty:</strong> {selectedEntry.warranty}</p>
                {selectedEntry.warranty === 'Yes' && (
                    <p style={{margin:'8px 0px'}} ><strong>Warranty Period:</strong> {selectedEntry.warrantyPeriod}</p>
                )}
                <p style={{margin:'8px 0px'}} ><strong>Worker Name:</strong> {selectedEntry.workerName}</p>
                <p style={{margin:'8px 0px'}} ><strong>Date:</strong> {new Date(selectedEntry.date).toLocaleDateString()}</p>

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


            <button onClick={handleDownloadPDF} style={{ marginTop: '20px', padding: '10px 20px' }}>
              📥 Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserStarts;
