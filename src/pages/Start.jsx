import React, { useState } from 'react';
import './Style/Start.css';

const WarrantyForm = () => {
  const initialFormData = {
    name: '',
    contactNo: '',
    whatsappNo: '',
    warranty: 'Yes',
    warrantyPeriod: '',
    products: '',
    serialNumber: '',
    problems: '',
    workerName: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
const handleSubmit = async e => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');  // get token from storage
    if (!token) {
      alert('Please login first.');
      return;
    }
    const res = await fetch('http://localhost:8000/start', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`   // <-- send token here
      },
      body: JSON.stringify(formData)
    });
    const result = await res.json();
    if (res.ok) {
      alert(result.message);
      setFormData(initialFormData);
    } else {
      alert('❌ Submission failed: ' + result.message);
    }
  } catch (err) {
    alert('❌ Error submitting form');
    console.error(err);
  }
};
  return (
    <div className='form_container'>
      <form onSubmit={handleSubmit}>
        <h2 style={{textAlign:'center'}}>Add New Customer</h2>
        <input name="name" value={formData.name} placeholder="Name" required onChange={handleChange} />
        <input name="contactNo" value={formData.contactNo} placeholder="Contact Number" required onChange={handleChange} />
        <input name="whatsappNo" value={formData.whatsappNo} placeholder="WhatsApp Number" required onChange={handleChange} />

        <select name="warranty" value={formData.warranty} onChange={handleChange}>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

      {/* Warranty Period Field - only if Yes */}
      {formData.warranty === 'Yes' && (
        <>
          

      {/* Company Dropdown */}
        <select
          name="workerName"
          value={formData.workerName}
          onChange={handleChange}
          required
        >
            <option value="">Select Company</option>
            <option value="Zestpack">Zestpack</option>
            <option value="AquaSure">AquaSure</option>
            <option value="Livpure">Livpure</option>
          </select>
         
        </>
      )}

      {/* Worker Dropdown if No Warranty */}
      {formData.warranty === 'No' && (
        <select
          name="workerName"
          value={formData.workerName}
          onChange={handleChange}
          required
        >
          <option value="">Select Worker</option>
          <option value="Ravi">Ravi</option>
          <option value="Manoj">Manoj</option>
          <option value="Suresh">Suresh</option>
        </select>
      )}

        <input
        name="warrantyPeriod"         // <-- change from "model" to "warrantyPeriod"
        value={formData.warrantyPeriod}
        placeholder="Model Name"
        onChange={handleChange}
        required
      />

        <input name="products" value={formData.products} placeholder="Product Name" required onChange={handleChange} />
        <input name="serialNumber" value={formData.serialNumber} placeholder="Serial Number" required onChange={handleChange} />
        <textarea name="problems" value={formData.problems} placeholder="Describe the problem" required onChange={handleChange}></textarea>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default WarrantyForm;
