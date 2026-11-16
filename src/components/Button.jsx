function Button({ variant = 'primary', size, type = 'button', className = '', children, ...rest }) {
  const classes = ['btn', `btn--${variant}`, size ? `btn--${size}` : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}

export default Button;
