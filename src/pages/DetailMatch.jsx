import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Center,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiClock,
  FiArrowLeft,
} from "react-icons/fi";
import ConfirmedPlayersList from "../components/ConfirmedPlayersList";
import TeamDivision from "../components/TeamDivision";
import MatchDetails from "../components/MatchDetails";
import { useAttendance } from "../hooks/useAttendance";
import { useTeamDivision } from "../hooks/useTeamDivision";

const DetailMatch = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const { attendanceList } = useAttendance(id);
  const { division } = useTeamDivision(match, attendanceList);
  const navigate = useNavigate();

  // Função para atualizar a partida quando o status muda
  const handleMatchUpdate = (updatedMatch) => {
    setMatch(updatedMatch);
  };

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        if (!id) {
          toast({
            title: "Erro",
            description: "ID da partida não encontrado",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        const matchDoc = await getDoc(doc(db, "match", id));

        if (matchDoc.exists()) {
          setMatch({
            id: matchDoc.id,
            ...matchDoc.data(),
          });
        } else {
          toast({
            title: "Partida não encontrada",
            description: "A partida solicitada não existe",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar partida:", error);
        toast({
          title: "Erro ao carregar partida",
          description: "Não foi possível carregar os dados da partida.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMatch();
    }
  }, [id, toast]);

  if (loading) {
    return (
      <Center minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="primary.900" />
          <Text color="gray.600">Carregando detalhes da partida...</Text>
        </VStack>
      </Center>
    );
  }

  if (!match) {
    return (
      <Center minH="100vh">
        <Text color="gray.600">Partida não encontrada</Text>
      </Center>
    );
  }

  // Formatar data
  const formatDate = (timestamp) => {
    if (!timestamp) return "Data não informada";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };

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
          <Box>
            <HStack
              justify="space-between"
              align={{ base: "flex-start", md: "center" }}
              wrap="wrap"
              spacing={{ base: 3, md: 4 }}
            >
              <Flex align="center" gap={{ base: 2, md: 3 }} flex={1} minW={0}>
                <IconButton
                  icon={<FiArrowLeft size={18} />}
                  aria-label="Voltar"
                  size={{ base: "sm", md: "md" }}
                  bg="primary.900"
                  color="white"
                  borderRadius="lg"
                  _hover={{
                    bg: "primary.800",
                  }}
                  onClick={() => navigate("/")}
                />
                <VStack align="start" spacing={1} flex={1} minW={0}>
                  <Heading
                    size={{ base: "md", md: "lg" }}
                    color="primary.900"
                    noOfLines={1}
                  >
                    {match.local}
                  </Heading>
                  <Text
                    color="gray.600"
                    fontSize={{ base: "xs", md: "sm" }}
                    noOfLines={1}
                  >
                    {formatDate(match.date)}
                  </Text>
                </VStack>
              </Flex>

              {/* Indicador de partida finalizada */}
              {match.status === "Finalizada" && (
                <Badge
                  colorScheme="orange"
                  variant="solid"
                  px={{ base: 2, md: 3 }}
                  py={1}
                  borderRadius="full"
                  fontSize={{ base: "xs", md: "sm" }}
                >
                  🏁 Finalizada
                </Badge>
              )}
            </HStack>
          </Box>

          {/* Informações da partida */}
          <Card
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <CardBody p={{ base: 4, md: 6 }}>
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                <Box
                  display="grid"
                  gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                  gap={{ base: 3, md: 4 }}
                >
                  <HStack spacing={2}>
                    <FiMapPin
                      style={{ width: 16, height: 16 }}
                      color="primary.900"
                    />
                    <Text
                      fontSize={{ base: "sm", md: "md" }}
                      color="gray.700"
                      fontWeight="medium"
                      noOfLines={1}
                    >
                      {match.local || "Endereço não informado"}
                    </Text>
                  </HStack>

                  <HStack spacing={2}>
                    <FiUsers
                      style={{ width: 16, height: 16 }}
                      color="primary.900"
                    />
                    <Text
                      fontSize={{ base: "sm", md: "md" }}
                      color="gray.700"
                      fontWeight="medium"
                    >
                      Máximo {match.max_players} jogadores
                    </Text>
                  </HStack>

                  <HStack spacing={2}>
                    <FiClock
                      style={{ width: 16, height: 16 }}
                      color="primary.900"
                    />
                    <Badge
                      colorScheme={
                        match.status === "Ativa"
                          ? "green"
                          : match.status === "Finalizada"
                          ? "orange"
                          : "gray"
                      }
                      fontSize="xs"
                      px={2}
                      py={0.5}
                      borderRadius="md"
                    >
                      {match.status || "Em andamento"}
                    </Badge>
                  </HStack>
                </Box>

                {match.observacoes && (
                  <Box
                    bg="gray.50"
                    borderRadius="md"
                    p={{ base: 3, md: 4 }}
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      fontWeight="semibold"
                      mb={1}
                    >
                      Observações:
                    </Text>
                    <Text
                      fontSize={{ base: "sm", md: "md" }}
                      color="gray.700"
                      lineHeight="relaxed"
                    >
                      {match.observacoes}
                    </Text>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Seções com Tabs */}
          <Card
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
            p={0}
          >
            <CardBody p={{ base: 3, md: 4 }}>
              <Tabs variant="soft-rounded" colorScheme="blackAlpha">
                <TabList
                  gap={{ base: 1, md: 2 }}
                  flexWrap="wrap"
                  justifyContent={{ base: "center", md: "flex-start" }}
                >
                  <Tab
                    flex={{ base: "1", md: "auto" }}
                    fontSize={{ base: "xs", md: "sm" }}
                    px={{ base: 2, md: 4 }}
                    py={{ base: 2, md: 2 }}
                    borderRadius="lg"
                    _selected={{
                      bg: "primary.900",
                      color: "white",
                    }}
                  >
                    Detalhes
                  </Tab>
                  <Tab
                    flex={{ base: "1", md: "auto" }}
                    fontSize={{ base: "xs", md: "sm" }}
                    px={{ base: 2, md: 4 }}
                    py={{ base: 2, md: 2 }}
                    borderRadius="lg"
                    _selected={{
                      bg: "primary.900",
                      color: "white",
                    }}
                  >
                    Divisão
                  </Tab>
                  <Tab
                    flex={{ base: "1", md: "auto" }}
                    fontSize={{ base: "xs", md: "sm" }}
                    px={{ base: 2, md: 4 }}
                    py={{ base: 2, md: 2 }}
                    borderRadius="lg"
                    _selected={{
                      bg: "primary.900",
                      color: "white",
                    }}
                  >
                    Confirmados
                  </Tab>
                </TabList>
                <TabPanels mt={{ base: 3, md: 4 }}>
                  <TabPanel px={0} py={0}>
                    <MatchDetails
                      match={match}
                      division={division}
                      onMatchUpdate={handleMatchUpdate}
                    />
                  </TabPanel>
                  <TabPanel px={0} py={0}>
                    <TeamDivision
                      match={match}
                      attendanceList={attendanceList}
                    />
                  </TabPanel>
                  <TabPanel px={0} py={0}>
                    <ConfirmedPlayersList match={match} />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default DetailMatch;
