"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { AlertCircle, CheckCircle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const defaultIcons = {
    destructive: <AlertCircle className="w-4 h-4" />,
    default: <CheckCircle className="w-4 h-4" />
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, icon, variant, ...props }) {
        const toastIcon = icon ?? defaultIcons[variant as keyof typeof defaultIcons] ?? defaultIcons.default;
        
        return (
          <Toast key={id} variant={variant} icon={toastIcon} {...props}>
            <div>
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                  {action}
              </div>
            )}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
