type ErrorHandlerOptions = {
  toast?: boolean
  rethrow?: boolean
}

export const useErrorHandler = () => {
  const toast = useToast()

  const handleError = (
    title: string,
    description: string,
    error?: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const { toast: showToast = true, rethrow = false } = options

    console.error(`[${title}]`, description, error)

    if (showToast) {
      toast.add({
        title,
        description,
        color: 'error' as const,
        icon: 'i-lucide-alert-circle'
      })
    }

    if (rethrow) throw error
  }

  return { handleError }
}
