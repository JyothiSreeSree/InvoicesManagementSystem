import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./index.css";

const HomePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const onClickLogout = () => {
    Cookies.remove("jwt_token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = Cookies.get("jwt_token");
        const response = await fetch("http://localhost:3000/api/invoices", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setInvoices(data);
        } 
      } catch (err) {
        setError("Error fetching invoices.");
      }
    };

    fetchInvoices();
  }, []);

  const handleDeleteInvoice = async (id) => {
    const token = Cookies.get("jwt_token");
    try {
      const response = await fetch(`http://localhost:3000/api/invoices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
      } else {
        console.error("Failed to delete invoice.");
      }
    } catch (err) {
      console.error("Error deleting invoice:", err);
    }
  };


  const handleAddInvoice = () => {
    navigate("/invoice-form");
  };

  return (
    <div>
      <div className="button-container">
        <button type="button" className="logout-desktop-btn" onClick={onClickLogout}>
          Logout
        </button>
      </div>
      <div className="home-page-container">
        <h1 className="home-page-title">Invoices</h1>
        <button onClick={handleAddInvoice} className="add-invoice-button">
          Add Invoice
        </button>
        {error && <p className="error-message">{error}</p>}
        {invoices.length > 0 ? (
          <ul className="invoice-list">
            {invoices.map((invoice) => (
              <li key={invoice.id} className="invoice-item">
                <p>
                  <strong>Invoice :</strong> {invoice.number}
                </p>
                <p>
                  <strong>Client:</strong> {invoice.name}
                </p>
                <p>
                  <strong>Date:</strong> {invoice.date}
                </p>
                <p>
                  <strong>Amount:</strong> ${invoice.amount}
                </p>
                <p>
                  <strong>Status:</strong> {invoice.status}
                </p>
                <button className="add-invoice-button" onClick={() => handleDeleteInvoice(invoice.id)}>Delete</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-invoices-message">No invoices available.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
