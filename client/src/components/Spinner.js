import React from 'react';

const Spinner = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 24, md: 40, lg: 64 };
  const px = sizes[size] || sizes.md;

  return (
    <div className="spinner-wrap">
      <svg
        width={px}
        height={px}
        viewBox="0 0 50 50"
        className="spinner-svg"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="80 40"
          className="spinner-circle"
        />
      </svg>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default Spinner;
