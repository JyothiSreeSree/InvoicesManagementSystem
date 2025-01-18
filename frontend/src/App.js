import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import InvoiceFormPage from "./components/InvoiceFormPage";

const App = () => {
  const jwtToken = Cookies.get("jwt_token");
  console.log(jwtToken)

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={jwtToken ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/invoice-form"
          element={jwtToken ? <InvoiceFormPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
