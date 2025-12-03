import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import keycloak from '../keycloak'

function About() {
  const { isAuthenticated } = useAuth()

  const handleLoginClick = () => {
    keycloak.login()
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-8 animate-slideUp">
        <h1 className="text-4xl font-bold text-blue-600 mb-5 text-center">About Chronicles of the Omuns</h1>
        
        <section className="mb-7">
          <h2 className="text-2xl text-gray-900 mb-4 pb-3 border-b-4 border-blue-600">What is CotO Agent?</h2>
          <p className="text-base text-gray-600 leading-relaxed mb-4">
            Welcome to the Chronicles of the Omuns Character Creation Assistant! This AI-powered tool 
            is designed to help you build unique and compelling characters for your adventures in the 
            Chronicles of the Omuns universe. Whether you're a seasoned adventurer or new to character 
            creation, our intelligent system will guide you through the process of building your perfect hero.
          </p>
        </section>

        <section className="mb-7">
          <h2 className="text-2xl text-gray-900 mb-5 pb-3 border-b-4 border-blue-600">Features</h2>
          <div className="grid grid-cols-1 gap-5">
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center transition-all duration-300 border-2 border-transparent hover:translate-y-[-8px] hover:shadow-lg hover:border-blue-600">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="font-bold text-gray-900 mb-3">Classes</h3>
              <p className="text-gray-700 mb-4">
                Describe the kind of character you want to play and how you envision it playing in the world. 
                Our AI will analyze your description and suggest the 5 closest existing classes that match your vision. 
                Perfect for finding that ideal class that fits your playstyle!
              </p>
              <Link to="/classes" className="text-blue-600 hover:text-blue-700 font-semibold">Explore Classes →</Link>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center transition-all duration-300 border-2 border-transparent hover:translate-y-[-8px] hover:shadow-lg hover:border-blue-600">
              <div className="text-4xl mb-3">🌍</div>
              <h3 className="font-bold text-gray-900 mb-3">Races</h3>
              <p className="text-gray-700 mb-4">
                Choose the ancestral heritage of your character. Tell us what kind of character you'd like to be, 
                and our AI will find the 5 races that best align with your vision. Each race brings unique 
                characteristics and advantages to your character.
              </p>
              <Link to="/races" className="text-blue-600 hover:text-blue-700 font-semibold">Explore Races →</Link>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center transition-all duration-300 border-2 border-transparent hover:translate-y-[-8px] hover:shadow-lg hover:border-blue-600">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-bold text-gray-900 mb-3">Spells</h3>
              <p className="text-gray-700 mb-4">
                Browse through an extensive catalog of spells available in the Chronicles of the Omuns. 
                Learn the details of each spell including their effects, mana costs, and how they can enhance 
                your character's abilities. Knowledge is power!
              </p>
              <Link to="/spells" className="text-blue-600 hover:text-blue-700 font-semibold">Browse Spells →</Link>
            </div>

          </div>
        </section>

        <section className="mb-7">
          <h2 className="text-2xl text-gray-900 mb-5 pb-3 border-b-4 border-blue-600">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
              <div>
                <h4 className="font-bold text-gray-900">Describe Your Vision</h4>
                <p className="text-gray-600">Start by describing the type of character you want to create - your playstyle, personality, and goals.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
              <div>
                <h4 className="font-bold text-gray-900">Get AI Recommendations</h4>
                <p className="text-gray-600">Our AI analyzes your description and suggests the best matching classes and races for your vision.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
              <div>
                <h4 className="font-bold text-gray-900">Explore & Choose</h4>
                <p className="text-gray-600">Browse through the recommended options and explore all available spells to complete your character sheet.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
              <div>
                <h4 className="font-bold text-gray-900">Get Approval From The DM</h4>
                <p className="text-gray-600">Pass your character off to the Dungeon Master on discord for approval before your first session.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">5</div>
              <div>
                <h4 className="font-bold text-gray-900">Create & Play</h4>
                <p className="text-gray-600">Finalize your character and prepare for your next adventure in the Chronicles of the Omuns!</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Begin?</h2>
          <p className="text-lg mb-6">Start creating your unique character today and embark on an epic journey!</p>
          {isAuthenticated ? (
            <Link to="/character-sheet" className="inline-block px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors">Create Your Character</Link>
          ) : (
            <button onClick={handleLoginClick} className="inline-block px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors">Login to Get Started</button>
          )}
        </section>
      </div>
    </div>
  )
}

export default About
