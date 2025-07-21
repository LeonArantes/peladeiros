import {
  Box,
  Flex,
  Heading,
  IconButton,
  Text,
  HStack,
  VStack,
  useColorModeValue,
  Container,
} from "@chakra-ui/react";
import {
  FiHome,
  FiBell,
  FiUser,
  FiPlus,
  FiLogOut,
  FiUserX,
  FiShieldOff,
  FiUsers,
  FiInbox,
  FiTrendingUp,
  FiDollarSign,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <>
      {/* Header */}
      <Box
        bg={bg}
        borderBottom="1px"
        borderBottomColor={borderColor}
        px={4}
        py={4}
      >
        <Container maxW="container.xl">
          <Flex align="center" justify="space-between">
            <HStack spacing={3}>
              <Box
                w={10}
                h={10}
                bg="black"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="white" fontSize="lg" fontWeight="bold">
                  ⚽
                </Text>
              </Box>
              <Heading as="h1" size="lg" color="gray.800">
                Peladeiros
              </Heading>
            </HStack>

            <IconButton
              icon={<FiLogOut />}
              variant="ghost"
              size="lg"
              aria-label="Notificações"
              position="relative"
              onClick={() => logout()}
            />
          </Flex>
        </Container>
      </Box>

      {/* Bottom Navigation */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg={bg}
        borderTop="1px"
        borderTopColor={borderColor}
        px={4}
        py={3}
        zIndex={1000}
      >
        <Container maxW="container.xl">
          <Flex justify="space-around" align="center">
            <VStack spacing={1}>
              <IconButton
                icon={<FiHome />}
                variant="ghost"
                size="sm"
                aria-label="Início"
                onClick={() => navigate("/")}
                color={location.pathname === "/" ? "gray.800" : "gray.600"}
              />
              <Text
                fontSize="xs"
                color={location.pathname === "/" ? "gray.800" : "gray.600"}
                fontWeight={location.pathname === "/" ? "medium" : "normal"}
              >
                Início
              </Text>
            </VStack>
            <VStack spacing={1}>
              <IconButton
                icon={<FiTrendingUp />}
                variant="ghost"
                size="sm"
                aria-label="Artilheiros"
                onClick={() => navigate("/top-scorers")}
                color={
                  location.pathname === "/top-scorers" ? "gray.800" : "gray.600"
                }
              />
              <Text
                fontSize="xs"
                color={
                  location.pathname === "/top-scorers" ? "gray.800" : "gray.600"
                }
                fontWeight={
                  location.pathname === "/top-scorers" ? "medium" : "normal"
                }
              >
                Artilheiros
              </Text>
            </VStack>

            <VStack spacing={1}>
              <IconButton
                icon={<FiUsers />}
                variant="ghost"
                size="sm"
                aria-label="Jogadores"
                onClick={() => navigate("/players")}
                color={
                  location.pathname === "/players" ? "gray.800" : "gray.600"
                }
              />
              <Text
                fontSize="xs"
                color={
                  location.pathname === "/players" ? "gray.800" : "gray.600"
                }
                fontWeight={
                  location.pathname === "/players" ? "medium" : "normal"
                }
              >
                Jogadores
              </Text>
            </VStack>

            <VStack spacing={1}>
              <IconButton
                icon={<FiDollarSign />}
                variant="ghost"
                size="sm"
                aria-label="Financeiro"
                onClick={() => navigate("/financial")}
                color={
                  location.pathname === "/financial" ? "gray.800" : "gray.600"
                }
              />
              <Text
                fontSize="xs"
                color={
                  location.pathname === "/financial" ? "gray.800" : "gray.600"
                }
                fontWeight={
                  location.pathname === "/financial" ? "medium" : "normal"
                }
              >
                Financeiro
              </Text>
            </VStack>

            <VStack spacing={1}>
              <IconButton
                icon={<FiInbox />}
                variant="ghost"
                size="sm"
                aria-label="Perfil"
                onClick={() => navigate("/profile")}
                color={
                  location.pathname === "/profile" ? "gray.800" : "gray.600"
                }
              />
              <Text
                fontSize="xs"
                color={
                  location.pathname === "/profile" ? "gray.800" : "gray.600"
                }
                fontWeight={
                  location.pathname === "/profile" ? "medium" : "normal"
                }
              >
                Perfil
              </Text>
            </VStack>
          </Flex>
        </Container>
      </Box>
    </>
  );
};

export default Navbar;
