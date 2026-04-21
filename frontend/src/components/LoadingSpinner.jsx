export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className="spinner-border text-primary mb-3" role="status" style={{ width: 48, height: 48, borderWidth: 4 }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted fw-medium">{text}</p>
    </div>
  );
}
