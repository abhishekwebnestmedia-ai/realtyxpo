import React from 'react';
import './AnimatedFolder.css';

const AnimatedFolder = () => {
  return (
    <div className="animated-folder-wrapper">
      <div className="animated-folder-container">
        <div className="animated-folder">
          <div className="folder-front-side">
            <div className="folder-tip" />
            <div className="folder-cover" />
          </div>
          <div className="folder-back-side folder-cover" />
        </div>
      </div>
    </div>
  );
}

export default AnimatedFolder;