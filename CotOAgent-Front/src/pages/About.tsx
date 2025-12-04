import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import keycloak from '../keycloak'
import { ContentCard } from '../components/ContentCard'

function About() {
  const { isAuthenticated } = useAuth()

  const handleLoginClick = () => {
    keycloak.login()
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">About Chronicles of the Omuns</h1>
      <p className="text-lg text-gray-600 mb-8">Learn more about our AI-powered character creation assistant</p>
      
      <ContentCard variant="elevated">
        <section className="mb-8">
          <h2 className="section-header">What is CotO Agent?</h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Welcome to the Chronicles of the Omuns Character Creation Assistant! This AI-powered tool 
            is designed to help you build unique and compelling characters for your adventures in the 
            Chronicles of the Omuns universe. Whether you're a seasoned adventurer or new to character 
            creation, our intelligent system will guide you through the process of building your perfect hero.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="section-header">Features</h2>
          <div className="grid-responsive">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3 className="feature-title">Classes</h3>
              <p className="feature-description">
                Describe the kind of character you want to play and how you envision it playing in the world. 
                Our AI will analyze your description and suggest the 5 closest existing classes that match your vision. 
                Perfect for finding that ideal class that fits your playstyle!
              </p>
              <Link to="/classes" className="feature-link">Explore Classes →</Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3 className="feature-title">Races</h3>
              <p className="feature-description">
                Choose the ancestral heritage of your character. Tell us what kind of character you'd like to be, 
                and our AI will find the 5 races that best align with your vision. Each race brings unique 
                characteristics and advantages to your character.
              </p>
              <Link to="/races" className="feature-link">Explore Races →</Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3 className="feature-title">Spells</h3>
              <p className="feature-description">
                Browse through an extensive catalog of spells available in the Chronicles of the Omuns. 
                Learn the details of each spell including their effects, mana costs, and how they can enhance 
                your character's abilities. Knowledge is power!
              </p>
              <Link to="/spells" className="feature-link">Browse Spells →</Link>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="section-header">How It Works</h2>
          <div className="step-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4 className="step-title">Describe Your Vision</h4>
                <p className="step-description">Start by describing the type of character you want to create - your playstyle, personality, and goals.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4 className="step-title">Get AI Recommendations</h4>
                <p className="step-description">Our AI analyzes your description and suggests the best matching classes and races for your vision.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4 className="step-title">Explore & Choose</h4>
                <p className="step-description">Browse through the recommended options and explore all available spells to complete your character sheet.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4 className="step-title">Get Approval From The DM</h4>
                <p className="step-description">Pass your character off to the Dungeon Master on discord for approval before your first session.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">5</div>
              <div className="step-content">
                <h4 className="step-title">Create & Play</h4>
                <p className="step-description">Finalize your character and prepare for your next adventure in the Chronicles of the Omuns!</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-primary rounded-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Begin?</h2>
          <p className="text-lg mb-6">Start creating your unique character today and embark on an epic journey!</p>
          {isAuthenticated ? (
            <Link to="/character-sheet" className="link-as-btn-white">Create Your Character</Link>
          ) : (
            <button onClick={handleLoginClick} className="link-as-btn-white">Login to Get Started</button>
          )}
        </section>
      </ContentCard>
    </div>
  )
}

export default About
