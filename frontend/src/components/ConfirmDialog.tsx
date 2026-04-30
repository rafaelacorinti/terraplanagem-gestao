import Modal from './Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
}

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', danger = false }: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 text-sm">{message}</p>
      <div className="flex justify-end gap-2 mt-6">
        <button onClick={onClose} className="btn-secondary">Cancelar</button>
        <button onClick={() => { onConfirm(); onClose() }} className={danger ? 'btn-danger' : 'btn-primary'}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
