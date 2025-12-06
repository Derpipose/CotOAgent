
export function getBackendUrl(): string {
  if (window.location.hostname === 'frontend' || window.location.hostname === 'cotoagent-frontend') {
    return 'http://backend:3000/api'
  }
  
  if (window.location.protocol === 'https:') {
    return `https://${window.location.hostname}/api`
  }
  return '/api'
}

