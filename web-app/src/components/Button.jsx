import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({ children, variant = 'primary', onClick, className = '', ...props }) => {
  return (
    <button
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'outline', 'light']),
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default Button;
