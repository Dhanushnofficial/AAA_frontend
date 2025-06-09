import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Style/Estimation.css';

const Estimation = () => {
  const [customers, setCustomers] = useState([]);
  const [warrantyCustomers, setWarrantyCustomers] = useState([]);
  const [nonWarrantyCustomers, setNonWarrantyCustomers] = useState([]);
  const [estimations, setEstimations] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedEstimation, setSelectedEstimation] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [showEstimationPopup, setShowEstimationPopup] = useState(false);
  const [showCompletedForm, setShowCompletedForm] = useState(false);

  const [productName, setProductName] = useState('');
  const [items, setItems] = useState([{ name: '', price: '' }]);
  const [totalAmount, setTotalAmount] = useState(0);

  const [completedAmount, setCompletedAmount] = useState(0);
  const [pickupNote, setPickupNote] = useState('You can collect your product from our service center.');
  const [dateTime, setDateTime] = useState('');

  const [activeTab, setActiveTab] = useState('warranty');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, estRes] = await Promise.all([
          axios.get('http://localhost:8000/ViewCustomer'),
          axios.get('http://localhost:8000/estimations'),
        ]);
        setCustomers(custRes.data);
        setEstimations(estRes.data);
        setWarrantyCustomers(custRes.data.filter(c => c.warranty === 'Yes'));
        setNonWarrantyCustomers(custRes.data.filter(c => c.warranty !== 'Yes'));
      } catch (err) {
        console.error('❌ Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    setTotalAmount(total);
  }, [items]);

  const handleAddItem = () => setItems([...items, { name: '', price: '' }]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const resetForm = () => {
    setItems([{ name: '', price: '' }]);
    setProductName(selectedCustomer?.products || '');
    setDateTime(new Date().toISOString().slice(0, 16));
  };

  const handleSubmit = async () => {
    if (!selectedCustomer || !productName.trim()) {
      alert('❌ Customer and product name are required.');
      return;
    }

    for (const item of items) {
      if (!item.name.trim() || !item.price || isNaN(item.price) || Number(item.price) <= 0) {
        alert('❌ All items must have a valid name and positive price.');
        return;
      }
    }

    try {
      const payload = {
        whatsappNo: selectedCustomer.whatsappNo,
        productName,
        items,
        totalAmount,
        dateTime: dateTime || new Date().toISOString().slice(0, 16),
      };

      const res = await axios.post('http://localhost:8000/send-estimation', payload);
      alert(res.data.message || 'Estimation sent successfully!');

      const estRes = await axios.get('http://localhost:8000/estimations');
      setEstimations(estRes.data);
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error('❌ Error sending estimation:', err.message);
      alert('❌ Failed to send estimation');
    }
  };

  const handleViewEstimation = (cust) => {
    const estimation = estimations.find((e) => e.whatsappNo === cust.whatsappNo);
    if (estimation) {
      setSelectedEstimation(estimation);
      setShowEstimationPopup(true);
    } else {
      alert('❌ No estimation found for this customer.');
    }
  };

  const handleOpenCompletedForm = (cust) => {
    setSelectedCustomer(cust);
    const est = estimations.find((e) => e.whatsappNo === cust.whatsappNo);
    setCompletedAmount(est ? est.totalAmount : 0);
    setPickupNote('You can collect your product from our service center.');
    setDateTime(new Date().toISOString().slice(0, 16));
    setShowCompletedForm(true);
  };
  const handleDeleteCustomer = async (id) => {
  try {
      await axios.delete(`http://localhost:8000/delete-customer/${id}`);
      alert('✅ Customer deleted successfully.');

      // Refresh customer and estimation data
      const custRes = await axios.get('http://localhost:8000/ViewCustomer');
      setCustomers(custRes.data);
      setWarrantyCustomers(custRes.data.filter(c => c.warranty === 'Yes'));
      setNonWarrantyCustomers(custRes.data.filter(c => c.warranty !== 'Yes'));

    } catch (err) {
      console.error('❌ Error deleting customer:', err);
      alert('❌ Failed to delete customer');
    }
  };


  const renderCustomerCards = (customersList) => {
    return customersList.map((cust) => (
      <div
        key={cust._id}
        className={`customerCard ${selectedCustomer?._id === cust._id ? 'selected' : ''}`}
        onClick={() => {
          setSelectedCustomer(cust);
          setProductName(cust.products || '');
          setShowForm(false);
          resetForm();
        }}
      >
        <span
    className="deleteIcon"
    onClick={(e) => {
      e.stopPropagation();
      if (window.confirm(`Are you sure you want to delete customer ${cust.name}?`)) {
        handleDeleteCustomer(cust._id);
      }
    }}
  >
    🗑️
  </span>
        <h3 className='card_h1'>{cust.name}</h3>
        <p className='card_p'><strong>Contact No:</strong> {cust.contactNo || 'N/A'}</p>
        <p className='card_p' ><strong>WhatsApp No:</strong> {cust.whatsappNo || 'N/A'}</p>
        <p className='card_p' ><strong>Warranty:</strong> {cust.warranty}</p>

        {cust.warranty === 'Yes' ? (
          <>
            <p className='card_p' ><strong>Warranty Period:</strong> {cust.warrantyPeriod || '--'}</p>
            <p className='card_p' ><strong>Company Name:</strong> {cust.workerName || '--'}</p>
          </>
        ) : (
          <p className='card_p'><strong>Worker Name:</strong> {cust.workerName || 'N/A'}</p>
        )}

        <p className='card_p' ><strong>Product Name:</strong> {cust.products || 'N/A'}</p>
        <p className='card_p' ><strong>Serial Number:</strong> {cust.serialNumber || 'N/A'}</p>
        <p className='card_p' ><strong>Problems:</strong> {cust.problems || 'N/A'}</p>

        <div style={{ display: 'flex' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCustomer(cust);
              setProductName(cust.products || '');
              setDateTime(new Date().toISOString().slice(0, 16));
              setShowForm(true);
            }}
            className="button sendButton"
          >
            Send Estimation
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenCompletedForm(cust);
            }}
            className="button completedButton"
          >
            Send Completed Message
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewEstimation(cust);
            }}
            className="button viewButton"
          >
            View Estimation
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="container">
      <h2 className="title">All Customer Data & Estimations</h2>

      <div className="tabHeader">
        <button
          className={activeTab === 'warranty' ? 'activeTab' : ''}
          onClick={() => setActiveTab('warranty')}
        >
          Warranty Customers
        </button>
        <button
          className={activeTab === 'nonwarranty' ? 'activeTab' : ''}
          onClick={() => setActiveTab('nonwarranty')}
        >
          Non-Warranty Customers
        </button>
      </div>

      <div className="tabContent">
        {activeTab === 'warranty'
          ? renderCustomerCards(warrantyCustomers)
          : renderCustomerCards(nonWarrantyCustomers)}
      </div>

      {/* Modals (same as original) */}
      {showForm && selectedCustomer && (
        <div className="modalOverlay" onClick={() => setShowForm(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>Send Estimation to {selectedCustomer.name}</h3>

            <label>Product Name:</label>
            <input className="formInput" value={productName} onChange={(e) => setProductName(e.target.value)} />

            <h4>Items:</h4>
            <div className="itemsContainer">
              {items.map((item, index) => (
                <div key={index} className="itemRow">
                  <input
                    className="itemInputName"
                    placeholder="Name"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  />
                  <input
                    className="itemInputPrice"
                    placeholder="Price"
                    type="number"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                  />
                  <span
                    className="iconButton"
                    onClick={() => {
                      const updatedItems = [...items];
                      updatedItems.splice(index, 1);
                      setItems(updatedItems);
                    }}
                  >
                    🗑️
                  </span>
                </div>
              ))}
            </div>

            <button onClick={handleAddItem} className="button sendButton" style={{ marginBottom: 20 }}>
              Add Item
            </button>
            <label>Total Amount:</label>
            <input className="formInput" type="number" value={totalAmount} readOnly />

            <label>Select Date & Time:</label>
            <input
              type="datetime-local"
              className="formInput"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />

            <div className="buttonGroup">
              <button onClick={handleSubmit} className="button completedButton">Send via WhatsApp</button>
              <button onClick={() => setShowForm(false)} className="button cancelButton">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showEstimationPopup && selectedEstimation && (
        <div className="modalOverlay" onClick={() => setShowEstimationPopup(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3 style={{fontSize:'22px', marginBottom:'12px'}}>Estimation for WhatsApp No: {selectedEstimation.whatsappNo}</h3>
            <hr style={{ marginBottom:'12px'}}/>
            <p style={{ marginBottom:'8px'}}><strong>Product Name:</strong> {selectedEstimation.productName}</p>
            <h4 style={{ marginBottom:'8px'}}>Items:</h4>
            <ul style={{ marginBottom:'12px'}}>
              {selectedEstimation.items.map((item, idx) => (
                <li key={idx}>{item.name} - ₹{item.price}</li>
              ))}
            </ul>
            <p style={{ marginBottom:'12px'}}><strong>Total:</strong> ₹{selectedEstimation.totalAmount}</p>
            <button onClick={() => setShowEstimationPopup(false)} className="button cancelButton">Close</button>
          </div>
        </div>
      )}

      {showCompletedForm && selectedCustomer && (
        <div className="modalOverlay" onClick={() => setShowCompletedForm(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>Send Completed Message to {selectedCustomer.name}</h3>
            <label>Total Amount:</label>
            <input
              type="number"
              className="formInput"
              value={completedAmount}
              onChange={(e) => setCompletedAmount(e.target.value)}
            />
            <label>Pickup Note:</label>
            <textarea
              className="formInput"
              value={pickupNote}
              onChange={(e) => setPickupNote(e.target.value)}
            />
            <label>Select Date & Time:</label>
            <input
              type="datetime-local"
              className="formInput"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
            <div className="buttonGroup">
              <button
                className="button sendButton"
                onClick={async () => {
                  try {
                    const payload = {
                      whatsappNo: selectedCustomer.whatsappNo,
                      name: selectedCustomer.name,
                      productName: selectedCustomer.products,
                      totalAmount: completedAmount,
                      pickupNote,
                      dateTime: dateTime || new Date().toISOString().slice(0, 16),
                    };

                    const res = await axios.post('http://localhost:8000/send-completed-message', payload);
                    alert(res.data.message || 'Message sent!');
                    setShowCompletedForm(false);
                  } catch (err) {
                    console.error(err);
                    alert('❌ Failed to send completed message');
                  }
                }}
              >
                Send via WhatsApp
              </button>
              <button className="button cancelButton" onClick={() => setShowCompletedForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Estimation;
