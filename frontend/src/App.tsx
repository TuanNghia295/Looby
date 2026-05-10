import { BrowserRouter, Route, Routes } from 'react-router';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ChatAppPage from './pages/ChatAppPage';
import { Toaster } from 'sonner';
import { useDarkMode } from './hooks/useDarkMode';
import { DarkModeToggle } from './components/dark-mode-toggle';

function App() {
  useDarkMode();

  return (
    <>
      <div className="absolute top-6 right-6">
        <DarkModeToggle />
      </div>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          {/* pubic routes */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* private routes */}
          <Route path="/" element={<ChatAppPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
