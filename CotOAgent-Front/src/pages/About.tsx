import { Link } from 'react-router-dom'

function About() {
  return (
    <div>
      <h1>About Page</h1>
      <p>This is the about page for CotOAgent.</p>
      <Link to="/">Go back to Home</Link>
    </div>
  )
}

export default About
