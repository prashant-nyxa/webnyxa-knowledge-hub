export type ActionResult = {
  success: boolean
  message?: string
  error?: string
}

export function actionSuccess(message: string): ActionResult {
  return { success: true, message }
}

export function actionError(error: string): ActionResult {
  return { success: false, error }
}
