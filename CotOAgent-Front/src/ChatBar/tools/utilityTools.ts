export const executeLogMessage = (args: Record<string, unknown>, toolId?: string) => {
  console.log(args.message)
  return { success: true, message: `Logged: ${args.message}`, toolId }
}
