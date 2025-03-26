import { Link } from 'react-router-dom';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import PopularTours from '../components/landing/PopularTours';

const Landing = () => {
  return (
    <main>
      <Hero />
      <Features />
      <PopularTours />
      <div className="text-center py-12">
        <Link
          to="/tours"
          className="inline-block bg-primary hover:bg-secondary text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200"
        >
          Explore All Tours
        </Link>
      </div>
    </main>
  );
};

export default Landing; 