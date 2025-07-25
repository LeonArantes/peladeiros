import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CreateMatch from "./pages/CreateMatch";
import DetailMatch from "./pages/DetailMatch";
import Login from "./pages/Login";
import Players from "./pages/Players";
import Profile from "./pages/Profile";
import PlayerDetail from "./pages/PlayerDetail";
import CreatePlayer from "./pages/CreatePlayer";
import TopScorers from "./pages/TopScorers.jsx";
import Financial from "./pages/Financial.jsx";

function App() {
  return (
    <AuthProvider>
      <ScrollToTop>
        <Routes>
          {/* Rota pública de login */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Box minH="100vh" bg="gray.50">
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/create-match" element={<CreateMatch />} />
                    <Route path="/detail-match/:id" element={<DetailMatch />} />
                    <Route path="/players" element={<Players />} />
                    <Route path="/player/:id" element={<PlayerDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/create-player" element={<CreatePlayer />} />
                    <Route path="/top-scorers" element={<TopScorers />} />
                    <Route path="/financial" element={<Financial />} />
                    {/* Redirecionar qualquer rota desconhecida para home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Box>
              </ProtectedRoute>
            }
          />
        </Routes>
      </ScrollToTop>
    </AuthProvider>
  );
}

export default App;
