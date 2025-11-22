import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import keycloak from '../keycloak'
import '../css/about.css'

function About() {
  const { isAuthenticated } = useAuth()

  const handleLoginClick = () => {
    keycloak.login()
  }

  return (
    <div className="about-container">
      <div className="about-content">
        <h1 className="about-title">About Chronicles of the Omuns</h1>
        
        <section className="about-section">
          <h2>What is CotO Agent?</h2>
          <p>
            Welcome to the Chronicles of the Omuns Character Creation Assistant! This AI-powered tool 
            is designed to help you build unique and compelling characters for your adventures in the 
            Chronicles of the Omuns universe. Whether you're a seasoned adventurer or new to character 
            creation, our intelligent system will guide you through the process of building your perfect hero.
          </p>
        </section>

        <section className="features-section">
          <h2>Features</h2>
          <div className="features-grid">
            
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Classes</h3>
              <p>
                Describe the kind of character you want to play and how you envision it playing in the world. 
                Our AI will analyze your description and suggest the 5 closest existing classes that match your vision. 
                Perfect for finding that ideal class that fits your playstyle!
              </p>
              <Link to="/classes" className="feature-link">Explore Classes →</Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Races</h3>
              <p>
                Choose the ancestral heritage of your character. Tell us what kind of character you'd like to be, 
                and our AI will find the 5 races that best align with your vision. Each race brings unique 
                characteristics and advantages to your character.
              </p>
              <Link to="/races" className="feature-link">Explore Races →</Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3>Spells</h3>
              <p>
                Browse through an extensive catalog of spells available in the Chronicles of the Omuns. 
                Learn the details of each spell including their effects, mana costs, and how they can enhance 
                your character's abilities. Knowledge is power!
              </p>
              <Link to="/spells" className="feature-link">Browse Spells →</Link>
            </div>

          </div>
        </section>

        <section className="about-section">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Describe Your Vision</h4>
              <p>Start by describing the type of character you want to create - your playstyle, personality, and goals.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Get AI Recommendations</h4>
              <p>Our AI analyzes your description and suggests the best matching classes and races for your vision.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Explore & Choose</h4>
              <p>Browse through the recommended options and explore all available spells to complete your character sheet.</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>Get Approval From The DM</h4>
              <p>Pass your character off to the Dungeon Master on discord for approval before your first session.</p>
            </div>
            <div className="step">
              <div className="step-number">5</div>
              <h4>Create & Play</h4>
              <p>Finalize your character and prepare for your next adventure in the Chronicles of the Omuns!</p>
            </div>
          </div>
        </section>

        <section className="about-section cta-section">
          <h2>Ready to Begin?</h2>
          <p>Start creating your unique character today and embark on an epic journey!</p>
          {isAuthenticated ? (
            <Link to="/character-sheet" className="btn btn-primary">Create Your Character</Link>
          ) : (
            <button onClick={handleLoginClick} className="btn btn-primary">Login to Get Started</button>
          )}
        </section>
      </div>
    </div>
  )
}

export default About
