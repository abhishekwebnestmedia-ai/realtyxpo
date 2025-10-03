import React from 'react';
import './AnimatedFolder.css';

const AnimatedFolder = ({ containerColor, tipColor, coverColor }) => {
  const containerStyle = containerColor ? {
    background: containerColor
  } : {};
  
  const tipStyle = tipColor ? {
    background: tipColor
  } : {};
  
  const coverStyle = coverColor ? {
    background: coverColor
  } : {};

  return (
    <div className="animated-folder-wrapper">
      <div className="animated-folder-container" >
        <div className="animated-folder">
          <div className="folder-front-side">
            <div className="folder-tip" style={tipStyle} />
            <div className="folder-cover" style={coverStyle} />
          </div>
          <div className="folder-back-side folder-cover" style={coverStyle} />
        </div>
      </div>
    </div>
  );
}

export default AnimatedFolder;