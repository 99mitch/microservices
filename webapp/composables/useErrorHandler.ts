export function useErrorHandler() {
  const handleError = (error: any, context: string) => {
    const errorMessage = error?.response?.data?.message || error.message || 'An error occurred'
    console.error(`${context}:`, errorMessage)
    // Here you could also integrate with a notification system
    return {
      error: true,
      message: errorMessage
    }
  }

  return {
    handleError
  }
}