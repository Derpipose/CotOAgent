const parseErrorResponse = async (response: Response): Promise<string> => {
  try {
    const error = await response.json()
    return error.error || error.message || JSON.stringify(error)
  } catch {
    return ''
  }
}

export const executeGetClosestClassesToDescription = async (
  args: Record<string, unknown>,
  toolId?: string
) => {
  const description = args.description as string
  const response = await fetch('/api/classes/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: description }),
  })

  if (!response.ok) {
    const errorDetail = await parseErrorResponse(response)
    const errorMessage = errorDetail || `Failed to get closest classes (${response.status})`
    throw new Error(errorMessage)
  }

  const data = await response.json()
  return {
    success: true,
    message: 'Closest classes retrieved successfully, call the tool how to play the classes for more details.',
    classes: data,
    toolId,
  }
}

export const executeHowToPlayClasses = async (toolId?: string) => {
  const response = await fetch('/api/classes/how-to-play', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get how to play info (${response.status})`)
  }

  const data = await response.json()
  return {
    success: true,
    message: data.content,
    toolId,
  }
}

export const executeGetClosestRacesToDescription = async (
  args: Record<string, unknown>,
  toolId?: string
) => {
  console.log('Executing get closest races to description with args:', args)
  const description = args.description as string
  const response = await fetch('/api/races/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: description }),
  })

  if (!response.ok) {
    const errorDetail = await parseErrorResponse(response)
    const errorMessage = errorDetail || `Failed to get closest races (${response.status})`
    throw new Error(errorMessage)
  }

  const data = await response.json()
  return {
    success: true,
    message: 'Closest races retrieved successfully.',
    races: data,
    toolId,
  }
}

export const executeGetStatNumbers = async (toolId?: string) => {
  const response = await fetch('/api/random/8/6', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorDetail = await parseErrorResponse(response)
    const errorMessage = errorDetail || `Failed to get random stats (${response.status})`
    throw new Error(errorMessage)
  }

  const data = await response.json()
  return {
    success: true,
    message: 'Random stats generated successfully.',
    stats: data.numbers,
    toolId,
  }
}
