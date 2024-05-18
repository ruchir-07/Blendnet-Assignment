import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


export default function GAuth() {
    
    const navigate = useNavigate();

    // extract the authToken from the URL
    useEffect(() => {
        const authToken = new URLSearchParams(window.location.search).get('authToken');
        if (authToken) {
            localStorage.setItem('auth-token', authToken);
            navigate('/');
        } else {
            navigate('/signin');
        }
    }, [])
    
    return (
        <></>
    ); 
}