import React from 'react';
import './ui.css';

export const Button = ({ children, variant = 'secondary', ...props }: any) => (
  <button className={`ui-button ui-button-${variant}`} {...props}>
    {children}
  </button>
);

export const Card = ({ children, title, ...props }: any) => (
  <div className="ui-card" {...props}>
    {title && <h3 style={{ margin: '0 0 1rem 0' }}>{title}</h3>}
    {children}
  </div>
);

export const Input = ({ label, ...props }: any) => (
  <div className="stack">
    {label && <label>{label}</label>}
    <input className="ui-input" {...props} />
  </div>
);

export const Table = ({ headers = [], data = [] }: any) => (
  <table className="ui-table">
    <thead>
      <tr>
        {Array.isArray(headers) && headers.map((h: string) => <th key={h}>{h}</th>)}
      </tr>
    </thead>
    <tbody>
      {Array.isArray(data) && data.map((row: any, i: number) => (
        <tr key={i}>
          {Object.values(row).map((val: any, j: number) => <td key={j}>{val}</td>)}
        </tr>
      ))}
    </tbody>
  </table>
);

export const Sidebar = ({ children }: any) => (
  <aside className="ui-sidebar">
    {children}
  </aside>
);

export const Navbar = ({ brand, children }: any) => (
  <nav className="ui-navbar">
    <div style={{ fontWeight: 'bold', marginRight: 'auto' }}>{brand}</div>
    <div className="row">{children}</div>
  </nav>
);

export const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="ui-modal-overlay" onClick={onClose}>
      <div className="ui-modal-content" onClick={e => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Chart = ({ data = [] }: any) => (
  <div className="ui-chart">
    {Array.isArray(data) && data.map((val: number, i: number) => (
      <div 
        key={i} 
        className="ui-chart-bar" 
        style={{ height: `${val}%` }} 
      />
    ))}
    {(!data || data.length === 0) && <div className="text-muted p-4">No data available</div>}
  </div>
);
