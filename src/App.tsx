import { BrowserRouter } from 'react-router-dom';
import { AnimatedRoutes } from './components/AnimatedRoutes';
import Logo from './components/Logo';
import CustomCursor from './components/CustomCursor';
import Navigation from './components/Navigation';
import { LenisProvider } from './components/LenisProvider';
import { LanguageProvider } from './LanguageContext';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <LenisProvider>
          <CustomCursor />
          <Logo />
          <Navigation />
          <AnimatedRoutes />
        </LenisProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
