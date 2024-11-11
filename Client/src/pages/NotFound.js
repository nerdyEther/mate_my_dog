import React from 'react';
import { Link } from 'react-router-dom';
 // You can create a separate CSS file for styling

const NotFound = () => {
    return (
        <div className="notfound-container">
            <h1 className="notfound-title">404</h1>
            <p className="notfound-message">Oops! Page Not Found.</p>
            <Link to="/" className="notfound-link">
                Go Back Home
            </Link>
        </div>
    );
};

export default NotFound;
