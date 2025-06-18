import Header from './components/Header';
import Stories from './components/Stories';
import Feed from './components/Feed';
import Profile from './components/Profile';
import Suggestions from './components/Suggestions';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-screen-lg mx-auto pt-16 px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8 py-8">
          {/* Main content */}
          <div className="w-full lg:flex-1">
            <Stories />
            <Feed />
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-[320px] pt-4 sticky top-20">
            <Profile 
              username="beautyamy.ai"
              name="AmyLumiere"
              imageUrl="https://i.ibb.co/ymN2m0CM/20250502-0208-image.png"
            />
            <Suggestions />
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App