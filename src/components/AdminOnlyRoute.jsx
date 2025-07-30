import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Center, Spinner, VStack, Text, Icon, Button } from "@chakra-ui/react";
import { FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const AdminOnlyRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="green.500" />
      </Center>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver autenticado mas não for admin, mostrar página de acesso negado
  if (!isAdmin()) {
    return (
      <Center minH="100vh" bg="gray.50">
        <VStack spacing={6} textAlign="center" p={8}>
          <Icon as={FiLock} boxSize={16} color="gray.400" />
          <VStack spacing={2}>
            <Text fontSize="2xl" fontWeight="bold" color="gray.700">
              Acesso Restrito
            </Text>
            <Text fontSize="lg" color="gray.500">
              Esta página é acessível apenas para administradores
            </Text>
          </VStack>
          <Button
            colorScheme="primary"
            onClick={() => navigate("/")}
            size="lg"
            borderRadius="lg"
          >
            Voltar ao Início
          </Button>
        </VStack>
      </Center>
    );
  }

  return children;
};

export default AdminOnlyRoute;
