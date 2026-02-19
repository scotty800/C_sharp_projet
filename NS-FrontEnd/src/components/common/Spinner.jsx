import React from 'react';
import './Spinner.css';

const Spinner = ({ size = 'md', color = 'primary', fullScreen = false }) => {
  return (
    <div className={`spinner-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className={`spinner spinner-${size} spinner-${color}`}>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
        <div className="spinner-blade"></div>
      </div>
    </div>
  );
};

export default Spinner;