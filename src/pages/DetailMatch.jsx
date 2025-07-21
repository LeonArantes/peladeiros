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
          <Spinner size="xl" color="black" />
          <Text>Carregando detalhes da partida...</Text>
        </VStack>
      </Center>
    );
  }

  if (!match) {
    return (
      <Center minH="100vh">
        <Text>Partida não encontrada</Text>
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
    <Box minH="100vh" bg="gray.50" pb="80px">
      <Container maxW="container.xl" px={4} py={6}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <HStack justify="space-between" align="center" wrap="wrap">
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton
                  icon={<FiArrowLeft />}
                  aria-label="Voltar"
                  onClick={() => navigate("/")}
                />
                <VStack align="start" spacing={1}>
                  <Heading size="lg" color="gray.800">
                    {match.local}
                  </Heading>
                  <Text color="gray.600">{formatDate(match.date)}</Text>
                </VStack>
              </Box>
              {/* Indicador de partida finalizada */}
              {match.status === "Finalizada" && (
                <Badge
                  colorScheme="orange"
                  variant="solid"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="sm"
                >
                  🏁 Partida Finalizada
                </Badge>
              )}
            </HStack>
          </Box>

          {/* Informações da partida */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4} wrap="wrap">
                  <HStack spacing={2}>
                    <FiMapPin color="gray.500" />
                    <Text fontSize="sm" color="gray.700">
                      {match.local || "Endereço não informado"}
                    </Text>
                  </HStack>

                  <HStack spacing={2}>
                    <FiUsers color="gray.500" />
                    <Text fontSize="sm" color="gray.700">
                      Máximo {match.max_players} jogadores
                    </Text>
                  </HStack>

                  <HStack spacing={2}>
                    <FiClock color="gray.500" />
                    <Badge
                      colorScheme={
                        match.status === "Ativa"
                          ? "green"
                          : match.status === "Finalizada"
                          ? "orange"
                          : "gray"
                      }
                    >
                      {match.status || "Em andamento"}
                    </Badge>
                  </HStack>
                </HStack>

                {match.observacoes && (
                  <Box>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Observações:
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      {match.observacoes}
                    </Text>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Seções com Tabs */}
          <Card borderRadius="md" boxShadow="sm" p={0}>
            <CardBody p={4}>
              <Tabs variant={"soft-rounded"} colorScheme="blackAlpha">
                <TabList>
                  <Tab aria-label="Partida" flex={1}>
                    Detalhes da Partida
                  </Tab>
                  <Tab aria-label="Escalação" flex={1}>
                    Divisão do Time
                  </Tab>
                  <Tab aria-label="Confirmados" flex={1}>
                    Lista de Confirmados
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel id="match" px={0}>
                    <MatchDetails
                      match={match}
                      division={division}
                      onMatchUpdate={handleMatchUpdate}
                    />
                  </TabPanel>
                  <TabPanel id="scale" px={0}>
                    <TeamDivision
                      match={match}
                      attendanceList={attendanceList}
                    />
                  </TabPanel>

                  <TabPanel id="confirmed" px={0}>
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
