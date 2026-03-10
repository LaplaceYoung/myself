import HeroSection from '../components/HeroSection';
import WritingsSection from '../components/WritingsSection';
import CurationsSection from '../components/CurationsSection';
import ProjectsSection from '../components/ProjectsSection';
import AboutSection from '../components/AboutSection';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <main>
            <div id="hero">
                <HeroSection />
            </div>
            <AboutSection />
            <div id="projects">
                <ProjectsSection />
            </div>
            <div id="writings">
                <WritingsSection />
            </div>
            <div id="curations">
                <CurationsSection />
            </div>
            <Footer />
        </main>
    );
};

export default Home;
