import Modal from './Modal';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title = 'Confirm Action', message = 'Are you sure?', confirmLabel = 'Confirm', confirmVariant = 'btn-danger', loading = false }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm"
    footer={
      <>
        <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
        <button className={`btn ${confirmVariant}`} onClick={onConfirm} disabled={loading}>
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </>
    }>
    <p style={{ margin: 0, fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message}</p>
  </Modal>
);

export default ConfirmModal;
