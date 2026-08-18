'use client'

import * as React from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Warning } from '@phosphor-icons/react'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: React.ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={loading}>
        {cancelText}
      </Button>
      <Button variant={variant} onClick={onConfirm} disabled={loading}>
        {loading ? 'Memproses...' : confirmText}
      </Button>
    </>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" footer={footer}>
      <div className="flex flex-col items-center text-center">
        {variant === 'danger' && (
          <div className="mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-12 sm:w-12">
            <Warning weight="duotone" className="h-8 w-8 text-red-600 sm:h-6 sm:w-6" aria-hidden="true" />
          </div>
        )}
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
    </Modal>
  )
}
