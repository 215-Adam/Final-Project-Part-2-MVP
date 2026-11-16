/** Generic surface used across pages; content is passed as children. */
function Card({ title, actions, children, className = '', as: Tag = 'section' }) {
  return (
    <Tag className={`card ${className}`}>
      {(title || actions) && (
        <div className="card__header">
          {title && <h2 className="card__title">{title}</h2>}
          {actions && <div className="card__actions">{actions}</div>}
        </div>
      )}
      <div className="card__body">{children}</div>
    </Tag>
  );
}

export default Card;
