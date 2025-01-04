'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Toast, ToastViewport, ToastProvider as ToastProviderUI, ToastTitle, ToastDescription } from "@/components/ui/toast"

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
}

interface ToastContextType {
  showToast: (title: string, description?: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((title: string, description?: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, title, description, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastProviderUI>
        {children}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            variant={toast.type === 'error' ? 'destructive' : 'default'}
          >
            <div className="grid gap-1">
              <ToastTitle>{toast.title}</ToastTitle>
              {toast.description && (
                <ToastDescription>{toast.description}</ToastDescription>
              )}
            </div>
          </Toast>
        ))}
        <ToastViewport />
      </ToastProviderUI>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
} 