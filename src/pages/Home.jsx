import {
  Box,
  Heading,
  Text,
  Container,
  VStack,
  Card,
  CardBody,
  HStack,
  Button,
  useColorModeValue,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import MatchCard from "../components/MatchCard";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const [matchs, setMatchs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const cardBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    const q = query(collection(db, "match"), orderBy("date", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matchsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMatchs(matchsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleViewDetails = (match) => {
    navigate(`/detail-match/${match.id}`);
  };

  if (loading) {
    return (
      <Center h="200px">
        <Spinner size="xl" color="primary.900" />
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" pb={{ base: "24", md: "80px" }}>
      <Container
        maxW={{
          base: "full",
          sm: "container.sm",
          md: "container.md",
          lg: "container.xl",
        }}
        px={{ base: 4, md: 6 }}
        py={{ base: 4, md: 6 }}
      >
        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
          {/* Header */}
          <HStack
            w="100%"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box flex="1" mr={{ base: 3, md: 4 }}>
              <Heading
                size={{ base: "lg", md: "xl" }}
                color="primary.900"
                mb={{ base: 1, md: 2 }}
                lineHeight="shorter"
              >
                Início
              </Heading>
            </Box>

            {isAdmin && (
              <Button
                bg="primary.900"
                color="white"
                size={{ base: "md", md: "lg" }}
                borderRadius="full"
                w={{ base: "48px", md: "56px" }}
                h={{ base: "48px", md: "56px" }}
                minW="auto"
                p={0}
                display="flex"
                justifyContent="center"
                alignItems="center"
                _hover={{
                  bg: "primary.800",
                  transform: "scale(1.05)",
                }}
                _active={{
                  transform: "scale(0.95)",
                }}
                transition="all 0.2s"
                onClick={() => navigate("/create-match")}
              >
                <FiPlus size={{ base: 20, md: 24 }} />
              </Button>
            )}
          </HStack>

          {/* Lista de Partidas */}
          <VStack spacing={{ base: 3, md: 4 }} align="stretch">
            {matchs.length === 0 ? (
              <Card
                bg={cardBg}
                borderRadius="lg"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.200"
              >
                <CardBody p={{ base: 6, md: 8 }} textAlign="center">
                  <Text
                    color="gray.500"
                    fontSize={{ base: "md", md: "lg" }}
                    fontWeight="medium"
                  >
                    Nenhuma partida cadastrada
                  </Text>
                  <Text
                    color="gray.400"
                    fontSize={{ base: "xs", md: "sm" }}
                    mt={2}
                  >
                    Crie sua primeira partida para começar!
                  </Text>
                </CardBody>
              </Card>
            ) : (
              matchs.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onViewDetails={handleViewDetails}
                />
              ))
            )}
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default Home;
