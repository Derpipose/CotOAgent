/**
 * Get the backend URL based on the current environment
 * - In Docker dev: uses the backend service name
 * - In local dev: uses relative paths to leverage Vite proxy
 * - In production: uses HTTPS with the same hostname
 */
export function getBackendUrl(): string {
  // In Docker dev, use the backend service name
  if (window.location.hostname === 'frontend' || window.location.hostname === 'cotoagent-frontend') {
    return 'http://backend:3000/api'
  }
  
  // In production, use HTTPS with the same hostname
  if (window.location.protocol === 'https:') {
    return `https://${window.location.hostname}/api`
  }
  
  // Local development: use relative paths to leverage Vite proxy
  // The Vite dev server will proxy /api calls to the backend
  return '/api'
}

