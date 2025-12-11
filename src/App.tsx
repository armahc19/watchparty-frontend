import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import {ProtectedRoute} from './components/ProtectedRoute';
import Host from './pages/Host';
//import WatchPartyRoom from './pages/WatchPartyRoom';
import PartyMovie from './pages/PartyMovie';
import PartyMusic from './pages/PartyMusic';
import SelectActivity from './pages/SelectActivity';
import MovieNightRoom from './pages/movie';
import MusicPartyRoom from  './pages/Music';
import { AuthProvider } from './contexts/AuthContext';
import Join from './pages/Join';
import LandingPage from './pages/LandingPage';
import Subscribe from './pages/Subscribe';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import WelcomeScreen from './pages/AdPage';


function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path='/' element={<LandingPage />} />
        <Route path='/subscribe' element={<Subscribe />} />
        <Route path='/admin' element={
            <AdminPanel />
        } />
        <Route path='/admin-login' element={
            <AdminLogin />
        } />

        <Route path='/welcome' element={
            <WelcomeScreen />
        } />
        
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        {/* Protect other private routes too */}

        <Route 
          path="/host" 
          element={
            <ProtectedRoute>
              <Host />
            </ProtectedRoute>
          }
        />
        <Route
          path="/party/:roomId"           // ← change :partyId → :roomId
          element={
            <ProtectedRoute>
              <PartyMovie />
            </ProtectedRoute>
          }
        />

    {/*    <Route
          path="/music/:roomId"           // ← change :partyId → :roomId
          element={
            <ProtectedRoute>
              <PartyMusic />
            </ProtectedRoute>
          }
        />*/}

        <Route
          path="/select-activity"
          element={
            <ProtectedRoute>
              <SelectActivity />
            </ProtectedRoute>
          }
          />

        <Route
          path="host/free/:roomId"
          element={
            <ProtectedRoute>
              <MovieNightRoom />
            </ProtectedRoute>
          }
          />

        {/* <Route
          path="host/music/:roomId"
          element={
            <ProtectedRoute>
              <MusicPartyRoom />
            </ProtectedRoute>
          }
          />*/}

          <Route
          path='/join'
          element={
            <ProtectedRoute>
              <Join />
            </ProtectedRoute>
          }
          />

      
          
       
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;