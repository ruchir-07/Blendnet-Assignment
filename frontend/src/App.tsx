import * as React from 'react';
import './index.css';
import SignIn from './Components/Auth/Signin';
import SignUp from './Components/Auth/Signup';
import ForgotPassword from './Components/Auth/ForgotPassword';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import GAuth from './Components/Auth/GAuth';
import Dashboard from './Components/Dashboard/Dashboard';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgotpassword" element={<ForgotPassword />} />
                <Route path="/handler" element={<GAuth />} />
                <Route path="/" element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
    );
}
