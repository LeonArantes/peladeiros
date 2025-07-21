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

const Home = () => {
  const [matchs, setMatchs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        <Spinner size="xl" color="green.500" />
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" pb="80px">
      <Container maxW="container.xl" px={4} py={6}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack w="100%" justifyContent="space-between" alignItems="center">
            <Box>
              <Heading size="xl" color="gray.800" mb={0}>
                Início
              </Heading>
              <Text color="gray.600" fontSize="md">
                Gerencie e participe das partidas de futebol
              </Text>
            </Box>

            <Button
              bg="black"
              color="white"
              size="lg"
              borderRadius="full"
              p={0}
              m={0}
              justifyContent="center"
              alignItems="center"
              _hover={{
                bg: "gray.800",
              }}
              onClick={() => navigate("/create-match")}
            >
              <FiPlus />
            </Button>
          </HStack>

          {/* Lista de Partidas */}
          <VStack spacing={4} align="stretch">
            {matchs.length === 0 ? (
              <Card bg={cardBg} borderRadius="2xl" boxShadow="sm">
                <CardBody p={8} textAlign="center">
                  <Text color="gray.500" fontSize="lg">
                    Nenhuma partida cadastrada
                  </Text>
                  <Text color="gray.400" fontSize="sm" mt={2}>
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
