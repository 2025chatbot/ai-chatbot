import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AddQna from './pages/AddQna';
import NoInfo from './pages/NoInfo';
import Admin from './pages/Admin';
import Company from "./pages/Company";
import CompanyList from "./pages/CompanyList";
import CreateCompany from "./pages/CreateCompany";
import Home from "./pages/Home";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateCompany />} />
            <Route path="/companies" element={<CompanyList />} />
            <Route path="/company/:companyname" element={<Company />} />
            <Route path="/addqna/:name" element={<AddQna />} />
            <Route path="/noinfo/:company" element={<NoInfo />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<div style={{ padding: '2rem' }}>잘못된 접근입니다.</div>} />
        </Routes>
    );
};

export default App;
