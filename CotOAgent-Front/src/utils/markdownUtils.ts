import { marked } from 'marked'
import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'a',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
]

/**
 * Renders markdown to sanitized HTML
 * @param markdown - The markdown string to render
 * @returns Sanitized HTML string
 */
export const renderMarkdown = (markdown: string): string => {
  const html = marked(markdown) as string
  return DOMPurify.sanitize(html, { ALLOWED_TAGS })
}
