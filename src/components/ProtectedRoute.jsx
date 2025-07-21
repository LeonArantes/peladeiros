import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Center, Spinner } from "@chakra-ui/react";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="green.500" />
      </Center>
    );
  }

  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
