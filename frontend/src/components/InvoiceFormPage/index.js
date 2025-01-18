import React, { useState } from "react";
import Cookies from 'js-cookie'
import { useNavigate } from "react-router-dom";
import "./index.css";

const InvoiceFormPage = () => {
  const [formData, setFormData] = useState({
    number: "",
    name: "",
    date: "",
    amount: "",
    status: "Pending",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { number, name, date, amount} = formData;
  
    if (!number || !name || !date || !amount) {
      setError("All fields are required!");
      return;
    }
  
    try {
      const token = Cookies.get("jwt_token");
      const response = await fetch("http://localhost:3000/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      console.log(response)
      if (response.ok) {
        navigate("/"); 
      } else {
        const errorData = await response.json();
        console.log(errorData)
        setError(errorData.error_msg || "Failed to add invoice");
      }
    } catch (error) {
      console.error("Error submitting invoice:", error);
      setError("An error occurred. Please try again.");
    }
  };
  

  return (
    <div className="invoice-form-container">
      <h1 className="invoice-form-title">Add Invoice</h1>
      <form onSubmit={handleSubmit} className="invoice-form">
        <input
          type="text"
          name="number"
          placeholder="Invoice Number"
          value={formData.number}
          onChange={handleChange}
          className="form-input"
        />
        <input
          type="text"
          name="name"
          placeholder="Client Name"
          value={formData.name}
          onChange={handleChange}
          className="form-input"
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="form-input"
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          className="form-input"
        />
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="form-input"
        >
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Pending">Pending</option>
        </select>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default InvoiceFormPage;
