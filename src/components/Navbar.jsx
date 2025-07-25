import {
  Box,
  Flex,
  Text,
  VStack,
  useColorModeValue,
  Container,
  Button,
} from "@chakra-ui/react";
import {
  FiHome,
  FiUser,
  FiUsers,
  FiTrendingUp,
  FiDollarSign,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bg = useColorModeValue("white", "gray.800");

  const navItems = [
    {
      icon: FiHome,
      label: "Início",
      path: "/",
    },
    {
      icon: FiTrendingUp,
      label: "Artilheiros",
      path: "/top-scorers",
    },
    {
      icon: FiUsers,
      label: "Jogadores",
      path: "/players",
    },
    {
      icon: FiDollarSign,
      label: "Financeiro",
      path: "/financial",
    },
    {
      icon: FiUser,
      label: "Perfil",
      path: "/profile",
    },
  ];

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg={bg}
      borderTop="1px"
      borderTopColor="gray.200"
      px={{ base: 2, md: 4 }}
      py={{ base: 2, md: 3 }}
      zIndex={1000}
      boxShadow="0 -2px 8px rgba(0, 0, 0, 0.08)"
      w="100%"
    >
      <Container maxW="container.lg">
        <Flex
          justify="space-around"
          align="center"
          h={{ base: "60px", md: "64px" }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => navigate(item.path)}
                bg="transparent"
                borderRadius="lg"
                h={{ base: "56px", md: "60px" }}
                minW={{ base: "60px", md: "70px" }}
                px={{ base: 2, md: 3 }}
                _hover={{
                  bg: "primary.50",
                  transform: "translateY(-2px)",
                }}
                _active={{
                  transform: "translateY(0px)",
                }}
                transition="all 0.2s"
              >
                <VStack spacing={{ base: 1, md: 1.5 }}>
                  <Icon
                    style={{ width: 20, height: 20 }}
                    color={isActive ? "primary.900" : "gray.500"}
                  />
                  <Text
                    fontSize={{ base: "xs", md: "sm" }}
                    color={isActive ? "primary.900" : "gray.500"}
                    fontWeight={isActive ? "semibold" : "medium"}
                    lineHeight="1"
                  >
                    {item.label}
                  </Text>
                </VStack>
              </Button>
            );
          })}
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;
