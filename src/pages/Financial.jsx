import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Grid,
  GridItem,
  Badge,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Switch,
  useToast,
  Flex,
  Divider,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  Icon,
  Checkbox,
  CheckboxGroup,
  Stack,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import {
  FiDollarSign,
  FiPlus,
  FiMinus,
  FiTrendingUp,
  FiTrendingDown,
  // FiWallet,
  FiCalendar,
  FiUser,
  FiCheck,
  FiX,
  FiClock,
  FiFilter,
  FiDivideCircle,
  FiUsers,
  FiSettings,
  FiTrash2,
} from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import { financialService } from "../services";
import { userService } from "../services";
import { useAuth } from "../context/AuthContext";

// Mock data removido - agora utilizamos dados reais do Firebase

export default function Financial() {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const userIsAdmin = isAdmin();

  // Estados para dados reais do Firebase
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // Todas as transações para cálculos
  const [allPlayers, setAllPlayers] = useState([]);
  const [monthlyPayments, setMonthlyPayments] = useState([]);
  const [monthlyFeeValue, setMonthlyFeeValue] = useState(30);
  const [loading, setLoading] = useState(true);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [mensalistasLoading, setMensalistasLoading] = useState(false);

  // Estados para paginação de transações
  const [transactionsPagination, setTransactionsPagination] = useState({
    hasNextPage: false,
    lastDoc: null,
    loadingMore: false,
  });

  // Estados para modal de confirmação de remoção
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const cancelRef = useRef();

  // Obter mês atual no formato YYYY-MM
  const getCurrentMonth = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    // Se estamos em 2025, usar o mês atual, senão usar janeiro de 2025
    if (now.getFullYear() === 2026) {
      return currentMonth;
    } else {
      return "2026-01"; // Default para janeiro de 2025 se não estivermos em 2025
    }
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // Carregar dados iniciais
  useEffect(() => {
    const initializeData = async () => {
      await loadFinancialData();
      await loadMonthlyPayments();
      await loadAllTransactionsForStats(); // Carregar todas as transações para cálculos
    };
    initializeData();
  }, []);

  // Recarregar mensalidades quando o mês selecionado mudar
  useEffect(() => {
    loadMonthlyPayments();
  }, [selectedMonth]);

  // Debug: Verificar dados quando carregados
  useEffect(() => {
    if (!loading && allPlayers.length > 0) {
      console.log("=== DADOS CARREGADOS ===");
      console.log("Total jogadores:", allPlayers.length);
      console.log(
        "Jogadores mensalistas:",
        allPlayers.filter((p) => p.is_montly_payer === true)
      );
      console.log("Estrutura do primeiro jogador:", allPlayers[0]);
      console.log("Mês selecionado:", selectedMonth);
      console.log("Mensalidades do mês:", monthlyPayments);
      console.log("=======================");
    }
  }, [loading, allPlayers, monthlyPayments, selectedMonth]);

  // Função para carregar dados financeiros
  const loadFinancialData = async () => {
    try {
      setLoading(true);

      // Carregar dados em paralelo
      const [transactionsResult, playersData] = await Promise.all([
        financialService.getTransactionsPaginated(10), // Carregar apenas 10 primeiras para interface
        userService.findAll(),
      ]);

      setTransactions(transactionsResult.transactions);
      setTransactionsPagination({
        hasNextPage: transactionsResult.hasNextPage,
        lastDoc: transactionsResult.lastDoc,
        loadingMore: false,
      });
      setAllPlayers(playersData);

      console.log("Dados financeiros carregados:", {
        transactionsData: transactionsResult.transactions.length,
        hasNextPage: transactionsResult.hasNextPage,
        playersData: playersData.length,
      });
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para calcular estatísticas com todas as transações
  const loadAllTransactionsForStats = async () => {
    try {
      // Carregar TODAS as transações para cálculo correto dos stats
      const allTransactionsResult =
        await financialService.getTransactionsPaginated(1000);
      setAllTransactions(allTransactionsResult.transactions);
    } catch (error) {
      console.error("Erro ao carregar todas as transações:", error);
      setAllTransactions([]);
    }
  };

  // Carregar mais transações
  const loadMoreTransactions = async () => {
    if (
      !transactionsPagination.hasNextPage ||
      transactionsPagination.loadingMore
    ) {
      return;
    }

    try {
      setTransactionsPagination((prev) => ({ ...prev, loadingMore: true }));

      console.log("Carregando mais transações...");

      const result = await financialService.getTransactionsPaginated(
        10,
        transactionsPagination.lastDoc
      );

      // Adicionar novas transações ao final da lista existente
      setTransactions((prevTransactions) => [
        ...prevTransactions,
        ...result.transactions,
      ]);

      setTransactionsPagination({
        hasNextPage: result.hasNextPage,
        lastDoc: result.lastDoc,
        loadingMore: false,
      });

      console.log(
        `${result.transactions.length} transações adicionais carregadas`
      );
    } catch (error) {
      console.error("Erro ao carregar mais transações:", error);
      toast({
        title: "Erro ao carregar mais transações",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });

      setTransactionsPagination((prev) => ({ ...prev, loadingMore: false }));
    }
  };

  // Função para carregar mensalidades do mês selecionado
  const loadMonthlyPayments = async () => {
    try {
      const monthlyFeesData = await financialService.getMonthlyFeesByMonth(
        selectedMonth
      );
      setMonthlyPayments(monthlyFeesData);

      console.log(
        `Mensalidades carregadas para ${selectedMonth}:`,
        monthlyFeesData.length
      );
    } catch (error) {
      console.error("Erro ao carregar mensalidades:", error);
      toast({
        title: "Erro ao carregar mensalidades",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Modals
  const {
    isOpen: isTransactionOpen,
    onOpen: onTransactionOpen,
    onClose: onTransactionClose,
  } = useDisclosure();
  const {
    isOpen: isMensalistasOpen,
    onOpen: onMensalistasOpen,
    onClose: onMensalistasClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onClose: onDeleteConfirmClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteTransactionOpen,
    onOpen: onDeleteTransactionOpen,
    onClose: onDeleteTransactionClose,
  } = useDisclosure();

  // Forms
  const {
    register: registerTransaction,
    handleSubmit: handleSubmitTransaction,
    control: controlTransaction,
    reset: resetTransaction,
    watch: watchTransaction,
    formState: { errors: errorsTransaction },
  } = useForm();

  const {
    register: registerMensalistas,
    handleSubmit: handleSubmitMensalistas,
    control: controlMensalistas,
    reset: resetMensalistas,
    setValue: setValueMensalistas,
    watch: watchMensalistas,
    formState: { errors: errorsMensalistas },
  } = useForm();

  const transactionType = watchTransaction("type");
  const watchedMonthReference = watchMensalistas("monthReference");

  // Limpar seleções quando o mês de referência mudar
  useEffect(() => {
    if (watchedMonthReference && watchedMonthReference !== selectedMonth) {
      setValueMensalistas("selectedPlayers", []);
    }
  }, [watchedMonthReference, setValueMensalistas, selectedMonth]);

  // Obter jogadores mensalistas (campo correto é is_montly_payer)
  const mensalistas = allPlayers.filter(
    (player) => player.is_montly_payer === true
  );

  // Calcular saldo e estatísticas usando dados reais
  const calculateStats = () => {
    // Verificar se há dados carregados
    if (allTransactions.length === 0) {
      return {
        totalEntradas: 0,
        totalSaidas: 0,
        saldoAtual: 0,
        jogadoresPagos: monthlyPayments.filter((p) => p.is_paid === true)
          .length,
        jogadoresPendentes: monthlyPayments.filter((p) => p.is_paid === false)
          .length,
      };
    }

    const totalEntradas = allTransactions
      .filter((t) => t.type === "entrada")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalSaidas = allTransactions
      .filter((t) => t.type === "saida")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const saldoAtual = totalEntradas - totalSaidas;

    const jogadoresPagos = monthlyPayments.filter(
      (p) => p.is_paid === true
    ).length;
    const jogadoresPendentes = monthlyPayments.filter(
      (p) => p.is_paid === false
    ).length;

    return {
      totalEntradas,
      totalSaidas,
      saldoAtual,
      jogadoresPagos,
      jogadoresPendentes,
    };
  };

  const stats = calculateStats();

  // Debug: Log dos dados para verificar (apenas quando houver dados)
  if (allPlayers.length > 0 && !loading) {
    console.log("Debug Financial - Dados carregados:", {
      allPlayers: allPlayers.length,
      mensalistas: mensalistas.length,
      monthlyPayments: monthlyPayments.length,
      selectedMonth,
    });
  }

  // Obter todos os meses de 2025
  const getAvailableMonths = () => {
    const months = [];
    for (let i = 1; i <= 12; i++) {
      const monthStr = `2026-${String(i).padStart(2, "0")}`;
      months.push(monthStr);
    }
    return months;
  };

  // Obter pagamentos do mês selecionado
  const getCurrentMonthPayments = () => {
    return monthlyPayments; // Já filtrados por mês no loadMonthlyPayments
  };

  // Adicionar transação usando o service
  const onSubmitTransaction = async (data) => {
    try {
      setTransactionLoading(true);

      const transactionData = {
        type: data.type,
        amount: parseFloat(data.amount),
        description: data.description,
        category: data.category,
        // TODO: Adicionar created_by quando tivermos contexto de usuário logado
      };

      console.log("Criando transação:", transactionData);

      // Criar transação no Firebase
      const newTransaction = await financialService.createTransaction(
        transactionData
      );

      // Recarregar todos os dados financeiros para atualizar os valores
      await loadFinancialData();
      await loadAllTransactionsForStats(); // Recarregar todas as transações

      resetTransaction();
      onTransactionClose();

      toast({
        title: "Transação adicionada!",
        description: `${data.type === "entrada" ? "Entrada" : "Saída"} de R$ ${
          data.amount
        } registrada com sucesso.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      toast({
        title: "Erro ao criar transação",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setTransactionLoading(false);
    }
  };

  // Associar jogadores como mensalistas do mês específico usando o service
  const onSubmitMensalistas = async (data) => {
    try {
      setMensalistasLoading(true);

      const selectedPlayerIds = data.selectedPlayers || [];
      const newMonthlyFee = parseFloat(data.monthlyFee);
      const monthReference = data.monthReference;

      console.log("onSubmitMensalistas - dados recebidos:", {
        selectedPlayerIds,
        newMonthlyFee,
        monthReference,
        formData: data,
      });

      if (selectedPlayerIds.length === 0) {
        throw new Error("Selecione pelo menos um jogador");
      }

      // Atualizar valor da mensalidade
      setMonthlyFeeValue(newMonthlyFee);

      // Preparar dados dos jogadores selecionados
      const playersData = selectedPlayerIds.map((playerId) => {
        const player = allPlayers.find(
          (p) => String(p.id) === String(playerId)
        );
        console.log("Preparando dados do jogador:", {
          playerId,
          playerIdType: typeof playerId,
          foundPlayer: player,
          playerName: player?.name || player?.display_name,
        });

        return {
          id: playerId,
          name: player?.name || player?.display_name || `Jogador ${playerId}`,
        };
      });

      console.log("Criando mensalidades em lote:", {
        playersData,
        monthReference,
        feeValue: newMonthlyFee,
      });

      // Criar mensalidades usando o service
      const result = await financialService.createBulkMonthlyFees(
        playersData,
        monthReference,
        newMonthlyFee
        // TODO: Adicionar created_by quando tivermos contexto de usuário logado
      );

      console.log("Resultado da criação em lote:", result);

      // Recarregar todos os dados financeiros para atualizar os valores
      await Promise.all([
        loadFinancialData(), // Recarregar dados completos incluindo transações
        loadMonthlyPayments(), // Recarregar mensalidades
        loadAllTransactionsForStats(), // Recarregar todas as transações
      ]);

      resetMensalistas();
      onMensalistasClose();

      const successCount = result.createdFees.length;
      const errorCount = result.errors.length;

      if (successCount > 0) {
        toast({
          title: "Mensalistas adicionados!",
          description: `${successCount} mensalista(s) adicionado(s) para ${formatMonthName(
            monthReference
          )}.${errorCount > 0 ? ` ${errorCount} erro(s) encontrado(s).` : ""}`,
          status: errorCount > 0 ? "warning" : "success",
          duration: 5000,
          isClosable: true,
        });
      }

      if (errorCount > 0) {
        console.warn("Erros ao criar mensalidades:", result.errors);
      }
    } catch (error) {
      console.error("Erro ao criar mensalidades:", error);
      toast({
        title: "Erro ao criar mensalidades",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setMensalistasLoading(false);
    }
  };

  // Abrir modal de mensalistas com mês pré-selecionado
  const handleOpenMensalistasModal = () => {
    resetMensalistas({
      monthReference: selectedMonth,
      monthlyFee: monthlyFeeValue,
      selectedPlayers: [],
    });
    onMensalistasOpen();
  };

  // Selecionar todos os mensalistas disponíveis
  const handleSelectAllPlayers = () => {
    const monthRef = watchMensalistas("monthReference") || selectedMonth;
    const availablePlayers = getAvailableMensalistasForMonth(monthRef);
    const allPlayerIds = availablePlayers.map((player) => player.id.toString());

    // Usar setValue para atualizar apenas o campo selectedPlayers
    setValueMensalistas("selectedPlayers", allPlayerIds);
  };

  // Desmarcar todos os mensalistas
  const handleDeselectAllPlayers = () => {
    setValueMensalistas("selectedPlayers", []);
  };

  // Obter mensalistas que ainda não estão no mês selecionado
  const getAvailableMensalistasForMonth = (monthRef = selectedMonth) => {
    const mensalistasWithFlag = allPlayers.filter(
      (player) => player.is_montly_payer === true
    );

    // Normalizar IDs para string para comparação
    const mensalistasInMonth = monthlyPayments.map((p) => String(p.player_id));

    const availablePlayers = mensalistasWithFlag.filter(
      (player) => !mensalistasInMonth.includes(String(player.id))
    );

    // Debug: verificar dados com mais detalhes
    console.log("Debug getAvailableMensalistasForMonth:", {
      monthRef,
      allPlayersCount: allPlayers.length,
      mensalistasWithFlagCount: mensalistasWithFlag.length,
      monthlyPaymentsCount: monthlyPayments.length,
      mensalistasWithFlag: mensalistasWithFlag.map((p) => ({
        id: p.id,
        idType: typeof p.id,
        name: p.name || p.display_name,
        is_montly_payer: p.is_montly_payer,
      })),
      monthlyPaymentsPlayerIds: monthlyPayments.map((p) => ({
        player_id: p.player_id,
        idType: typeof p.player_id,
        player_name: p.player_name,
      })),
      mensalistasInMonth,
      availablePlayersCount: availablePlayers.length,
    });

    return availablePlayers;
  };

  // Marcar pagamento da mensalidade usando o service
  const handlePaymentToggle = async (paymentId, isPaid) => {
    try {
      console.log("Alterando status de pagamento:", { paymentId, isPaid });

      // Usar o service para atualizar o status
      const result = await financialService.updateMonthlyFeePaymentStatus(
        paymentId,
        isPaid,
        {
          // TODO: Adicionar created_by quando tivermos contexto de usuário logado
        }
      );

      // Recarregar todos os dados financeiros para atualizar os valores
      await Promise.all([
        loadFinancialData(), // Recarregar dados completos incluindo transações
        loadMonthlyPayments(), // Recarregar mensalidades
        loadAllTransactionsForStats(), // Recarregar todas as transações
      ]);

      const payment = monthlyPayments.find((p) => p.id === paymentId);
      const playerName = payment?.player_name || "Jogador";

      if (isPaid) {
        toast({
          title: "Pagamento registrado!",
          description: `Mensalidade de ${playerName} foi adicionada ao caixa.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Pagamento removido!",
          description: `Mensalidade de ${playerName} foi desmarcada.`,
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Erro ao alterar status de pagamento:", error);
      toast({
        title: "Erro ao alterar pagamento",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });

      // Recarregar dados para reverter mudanças visuais
      await loadMonthlyPayments();
    }
  };

  // Remover mensalista de um mês específico
  const handleRemoveMonthlyFee = async (monthlyFeeId, playerName) => {
    // Armazenar dados da mensalidade e abrir modal de confirmação
    setPaymentToDelete({ id: monthlyFeeId, playerName });
    onDeleteConfirmOpen();
  };

  // Confirmar remoção do mensalista
  const confirmRemoveMonthlyFee = async () => {
    if (!paymentToDelete) return;

    try {
      setDeleteLoading(true);

      console.log("Removendo mensalista:", paymentToDelete);

      // Usar o service para remover a taxa mensal
      await financialService.deleteMonthlyFee(paymentToDelete.id);

      // Recarregar todos os dados financeiros para atualizar os valores
      await Promise.all([
        loadFinancialData(), // Recarregar dados completos incluindo transações
        loadMonthlyPayments(), // Recarregar mensalidades
        loadAllTransactionsForStats(), // Recarregar todas as transações
      ]);

      // Fechar modal e limpar estado
      onDeleteConfirmClose();
      setPaymentToDelete(null);

      toast({
        title: "Mensalista removido!",
        description: `${paymentToDelete.playerName} foi removido da lista de mensalistas deste mês.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Erro ao remover mensalista:", error);
      toast({
        title: "Erro ao remover mensalista",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Cancelar remoção do mensalista
  const cancelRemoveMonthlyFee = () => {
    onDeleteConfirmClose();
    setPaymentToDelete(null);
  };

  // Remover transação
  const handleRemoveTransaction = (transaction) => {
    // Verificar se é transação de mensalidade
    if (transaction.category === "mensalidade") {
      toast({
        title: "Ação não permitida",
        description:
          "Transações de mensalidade só podem ser removidas pela aba de Mensalidades.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // Armazenar dados da transação e abrir modal de confirmação
    setTransactionToDelete(transaction);
    onDeleteTransactionOpen();
  };

  // Confirmar remoção da transação
  const confirmRemoveTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      setDeleteLoading(true);

      console.log("Removendo transação:", transactionToDelete);

      // Usar o service para remover a transação
      await financialService.deleteTransaction(transactionToDelete.id);

      // Recarregar todos os dados financeiros para atualizar os valores
      await loadFinancialData();
      await loadAllTransactionsForStats(); // Recarregar todas as transações

      // Fechar modal e limpar estado
      onDeleteTransactionClose();
      setTransactionToDelete(null);

      toast({
        title: "Transação removida!",
        description: `Transação "${transactionToDelete.description}" foi removida com sucesso.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Erro ao remover transação:", error);
      toast({
        title: "Erro ao remover transação",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Cancelar remoção da transação
  const cancelRemoveTransaction = () => {
    onDeleteTransactionClose();
    setTransactionToDelete(null);
  };

  // Formatar nome do mês
  const formatMonthName = (monthStr) => {
    try {
      const [year, month] = monthStr.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      console.error("Erro ao formatar nome do mês:", error);
      return monthStr;
    }
  };

  // Componente de Card de Estatística Minimalista
  const StatsCard = ({ stats, players }) => (
    <VStack spacing={{ base: 3, md: 4 }} mb={{ base: 4, md: 6 }}>
      {/* Card Principal - Saldo Atual */}
      <Card
        borderRadius="lg"
        boxShadow="sm"
        border="2px solid"
        borderColor={stats.saldoAtual >= 0 ? "green.200" : "red.200"}
        bg={stats.saldoAtual >= 0 ? "green.50" : "red.50"}
        w="full"
      >
        <CardBody p={{ base: 4, md: 5 }} textAlign="center">
          <VStack spacing={{ base: 2, md: 3 }}>
            <Box
              p={2}
              borderRadius="lg"
              bg={stats.saldoAtual >= 0 ? "green.100" : "red.100"}
              color={stats.saldoAtual >= 0 ? "green.600" : "red.600"}
            >
              <Icon as={FiDollarSign} size={20} />
            </Box>
            <Text
              fontSize={{ base: "xs", md: "sm" }}
              color="gray.600"
              fontWeight="medium"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              Saldo Atual
            </Text>
            <Text
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="bold"
              color={stats.saldoAtual >= 0 ? "green.600" : "red.600"}
              lineHeight="none"
            >
              R$ {stats.saldoAtual.toFixed(2)}
            </Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Cards Entradas e Saídas - Compactos */}
      <Grid templateColumns="repeat(2, 1fr)" gap={{ base: 3, md: 4 }} w="full">
        {/* Total Entradas */}
        <Card
          borderRadius="lg"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
          bg="white"
        >
          <CardBody p={{ base: 3, md: 4 }} textAlign="center">
            <VStack spacing={2}>
              <Box p={1} borderRadius="md" bg="green.100" color="green.600">
                <Icon as={FiPlus} size={14} />
              </Box>
              <Text
                fontSize={{ base: "xs", md: "sm" }}
                color="gray.600"
                fontWeight="medium"
              >
                Entradas
              </Text>
              <Text
                fontSize={{ base: "sm", md: "md" }}
                fontWeight="bold"
                color="green.600"
              >
                R$ {stats.totalEntradas.toFixed(2)}
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Total Saídas */}
        <Card
          borderRadius="lg"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
          bg="white"
        >
          <CardBody p={{ base: 3, md: 4 }} textAlign="center">
            <VStack spacing={2}>
              <Box p={1} borderRadius="md" bg="red.100" color="red.600">
                <Icon as={FiMinus} size={14} />
              </Box>
              <Text
                fontSize={{ base: "xs", md: "sm" }}
                color="gray.600"
                fontWeight="medium"
              >
                Saídas
              </Text>
              <Text
                fontSize={{ base: "sm", md: "md" }}
                fontWeight="bold"
                color="red.600"
              >
                R$ {stats.totalSaidas.toFixed(2)}
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Grid>
    </VStack>
  );

  // Componente de Transação
  const TransactionItem = ({ transaction }) => (
    <HStack
      p={{ base: 3, md: 4 }}
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      boxShadow="sm"
      justify="space-between"
      spacing={{ base: 3, md: 4 }}
    >
      <VStack align="start" spacing={1} flex={1} minW={0}>
        <Text
          fontSize={{ base: "sm", md: "md" }}
          fontWeight="semibold"
          color="primary.900"
          noOfLines={1}
        >
          {transaction.description}
        </Text>
        <HStack spacing={2} flexWrap="wrap">
          <Badge
            colorScheme={transaction.type === "entrada" ? "green" : "red"}
            variant="subtle"
            fontSize="xs"
            borderRadius="md"
          >
            {transaction.category}
          </Badge>
          <Text fontSize="xs" color="gray.500">
            {new Date(transaction.date).toLocaleDateString("pt-BR")}
          </Text>
          {transaction.player_name && (
            <Text fontSize="xs" color="gray.500">
              {transaction.player_name}
            </Text>
          )}
        </HStack>
      </VStack>

      <HStack spacing={2} flexShrink={0} align="center">
        {/* Valor da Transação */}
        <Text
          fontSize={{ base: "md", md: "lg" }}
          fontWeight="bold"
          color={transaction.type === "entrada" ? "green.500" : "red.500"}
        >
          {transaction.type === "entrada" ? "+" : "-"}R${" "}
          {transaction.amount.toFixed(2)}
        </Text>

        {/* Botão de Delete - apenas para transações não-mensalidade e apenas para admins */}
        {userIsAdmin && transaction.category !== "mensalidade" && (
          <IconButton
            icon={<FiTrash2 />}
            size="sm"
            variant="ghost"
            colorScheme="red"
            aria-label="Remover transação"
            title="Remover transação"
            onClick={() => handleRemoveTransaction(transaction)}
            _hover={{
              bg: "red.50",
              color: "red.600",
            }}
            _active={{
              bg: "red.100",
            }}
          />
        )}
      </HStack>
    </HStack>
  );

  // Componente de Jogador
  const PlayerItem = ({ player }) => (
    <HStack
      p={{ base: 3, md: 4 }}
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      boxShadow="sm"
      justify="space-between"
      spacing={{ base: 3, md: 4 }}
    >
      <HStack spacing={{ base: 2, md: 3 }} flex={1} minW={0}>
        <Box
          p={2}
          borderRadius="lg"
          bg={player.is_montly_payer ? "green.100" : "gray.100"}
          color={player.is_montly_payer ? "green.600" : "gray.600"}
          flexShrink={0}
        >
          <Icon as={player.is_montly_payer ? FiCheck : FiUser} size={16} />
        </Box>
        <VStack align="start" spacing={0} flex={1} minW={0}>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="semibold"
            color="primary.900"
            noOfLines={1}
          >
            {player.name || player.display_name || "Nome não disponível"}
          </Text>
          <HStack spacing={2} flexWrap="wrap">
            <Badge
              colorScheme={player.is_montly_payer ? "green" : "gray"}
              variant="subtle"
              fontSize="xs"
              borderRadius="md"
            >
              {player.is_montly_payer ? "Mensalista" : "Não-mensalista"}
            </Badge>
            {player.is_montly_payer && (
              <Text fontSize="xs" color="gray.500">
                Valor: R$ {monthlyFeeValue.toFixed(2)}
              </Text>
            )}
          </HStack>
        </VStack>
      </HStack>
    </HStack>
  );

  // Componente de Pagamento Mensal
  const MonthlyPaymentItem = ({ payment }) => (
    <HStack
      p={{ base: 3, md: 4 }}
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      boxShadow="sm"
      justify="space-between"
      spacing={{ base: 3, md: 4 }}
    >
      <HStack spacing={{ base: 2, md: 3 }} flex={1} minW={0}>
        <Box
          p={2}
          borderRadius="lg"
          bg={payment.is_paid ? "green.100" : "orange.100"}
          color={payment.is_paid ? "green.600" : "orange.600"}
          flexShrink={0}
        >
          <Icon as={payment.is_paid ? FiCheck : FiClock} size={16} />
        </Box>
        <VStack align="start" spacing={0} flex={1} minW={0}>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="semibold"
            color="primary.900"
            noOfLines={1}
          >
            {payment.player_name}
          </Text>
          <HStack spacing={2} flexWrap="wrap">
            <Badge
              colorScheme={payment.is_paid ? "green" : "orange"}
              variant="subtle"
              fontSize="xs"
              borderRadius="md"
            >
              {payment.is_paid ? "Pago" : "Pendente"}
            </Badge>
            <Text fontSize="xs" color="gray.500">
              Valor: R$ {payment.fee_value.toFixed(2)}
            </Text>
            {payment.paid_date && (
              <Text fontSize="xs" color="gray.500">
                Pago em:{" "}
                {new Date(payment.paid_date).toLocaleDateString("pt-BR")}
              </Text>
            )}
          </HStack>
        </VStack>
      </HStack>
      <HStack spacing={2} flexShrink={0} align="center">
        {/* Switch de Pagamento - apenas para admins */}
        {userIsAdmin && (
          <Switch
            size="md"
            colorScheme="green"
            isChecked={payment.is_paid}
            onChange={(e) => handlePaymentToggle(payment.id, e.target.checked)}
          />
        )}

        {/* Botão de Delete - apenas para admins */}
        {userIsAdmin && (
          <IconButton
            icon={<FiTrash2 />}
            size="sm"
            variant="ghost"
            colorScheme="red"
            aria-label="Remover mensalista"
            title="Remover mensalista deste mês"
            onClick={() =>
              handleRemoveMonthlyFee(payment.id, payment.player_name)
            }
            _hover={{
              bg: "red.50",
              color: "red.600",
            }}
            _active={{
              bg: "red.100",
            }}
          />
        )}
      </HStack>
    </HStack>
  );

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
        {/* Header */}
        <Flex
          justify="space-between"
          align={{ base: "center", md: "center" }}
          mb={{ base: 4, md: 6 }}
          direction={{ base: "row", md: "row" }}
          gap={{ base: 3, md: 0 }}
        >
          <VStack align="start" spacing={0}>
            <HStack spacing={3}>
              {/* <FiDollarSign size={28} color="#38A169" /> */}
              <Heading
                size={{ base: "lg", md: "xl" }}
                color="primary.900"
                lineHeight="shorter"
              >
                Finanças
              </Heading>
            </HStack>
            <Text
              color="gray.600"
              fontSize={{ base: "sm", md: "md" }}
              lineHeight="base"
            >
              Gestão financeira da pelada
            </Text>
          </VStack>

          {userIsAdmin && (
            <Button
              leftIcon={<FiPlus size={16} />}
              bg="primary.900"
              color="white"
              size={{ base: "sm", md: "md" }}
              borderRadius="lg"
              onClick={onTransactionOpen}
              _hover={{ bg: "primary.800" }}
            >
              Nova Transação
            </Button>
          )}
        </Flex>

        {/* Cards de Estatísticas */}
        <StatsCard stats={stats} players={allPlayers} />

        {/* Tabs */}
        <Tabs variant="soft-rounded" colorScheme="primary">
          <TabList mb={{ base: 4, md: 6 }}>
            <Tab
              fontSize={{ base: "sm", md: "md" }}
              _selected={{ bg: "primary.900", color: "white" }}
            >
              Transações
            </Tab>
            <Tab
              fontSize={{ base: "sm", md: "md" }}
              _selected={{ bg: "primary.900", color: "white" }}
            >
              Mensalidades
            </Tab>
          </TabList>

          <TabPanels>
            {/* Aba Transações */}
            <TabPanel p={0}>
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                {loading ? (
                  <Center py={12}>
                    <Spinner size="xl" color="primary.900" />
                  </Center>
                ) : transactions.length === 0 ? (
                  <Center py={12}>
                    <VStack spacing={4}>
                      <FiDollarSign size={48} color="gray.400" />
                      <VStack spacing={2}>
                        <Text
                          fontSize={{ base: "md", md: "lg" }}
                          fontWeight="medium"
                          color="gray.600"
                        >
                          Nenhuma transação encontrada
                        </Text>
                        <Text
                          fontSize={{ base: "sm", md: "md" }}
                          color="gray.500"
                          textAlign="center"
                        >
                          Adicione sua primeira transação para começar
                        </Text>
                      </VStack>
                    </VStack>
                  </Center>
                ) : (
                  <>
                    {/* Lista de transações */}
                    {transactions.map((transaction) => (
                      <TransactionItem
                        key={transaction.id}
                        transaction={transaction}
                      />
                    ))}

                    {/* Botão Carregar mais */}
                    {transactionsPagination.hasNextPage && (
                      <Center py={4}>
                        <Button
                          variant="outline"
                          borderColor="primary.200"
                          color="primary.900"
                          onClick={loadMoreTransactions}
                          isLoading={transactionsPagination.loadingMore}
                          loadingText="Carregando..."
                          _hover={{
                            bg: "primary.50",
                            borderColor: "primary.300",
                          }}
                          borderRadius="lg"
                          size={{ base: "sm", md: "md" }}
                        >
                          Carregar mais transações
                        </Button>
                      </Center>
                    )}
                  </>
                )}
              </VStack>
            </TabPanel>

            {/* Aba Mensalidades */}
            <TabPanel p={0}>
              <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                {/* Header com seletor de mês */}
                <HStack
                  justify="space-between"
                  align="center"
                  flexWrap="wrap"
                  gap={3}
                >
                  <VStack align="start" spacing={0}>
                    <Heading size="md" color="primary.900">
                      Pagamentos Mensais
                    </Heading>
                    <Text fontSize={{ base: "sm", md: "md" }} color="gray.600">
                      Gerencie os pagamentos mensais dos jogadores
                    </Text>
                  </VStack>

                  <HStack spacing={3} w="full">
                    <Select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      maxW="200px"
                      size={{ base: "sm", md: "md" }}
                      borderRadius="lg"
                      _focus={{
                        borderColor: "primary.900",
                        boxShadow: "0 0 0 1px primary.900",
                      }}
                    >
                      {getAvailableMonths().map((month) => (
                        <option key={month} value={month}>
                          {formatMonthName(month)}
                        </option>
                      ))}
                    </Select>

                    {userIsAdmin && (
                      <Button
                        leftIcon={<FiUsers size={16} />}
                        bg="primary.900"
                        color="white"
                        size={{ base: "sm", md: "md" }}
                        borderRadius="lg"
                        onClick={handleOpenMensalistasModal}
                        _hover={{ bg: "primary.800" }}
                        flex={1}
                      >
                        Adicionar
                      </Button>
                    )}
                  </HStack>
                </HStack>

                <Divider />

                {/* Lista de pagamentos do mês */}
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between" align="center">
                    <Text
                      fontSize={{ base: "md", md: "lg" }}
                      fontWeight="semibold"
                      color="primary.900"
                    >
                      {formatMonthName(selectedMonth)}
                    </Text>
                    <Badge
                      colorScheme="blue"
                      variant="subtle"
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="lg"
                    >
                      {
                        getCurrentMonthPayments().filter((p) => p.is_paid)
                          .length
                      }{" "}
                      de {getCurrentMonthPayments().length} pagos
                    </Badge>
                  </HStack>

                  {getCurrentMonthPayments().length === 0 ? (
                    <Center py={12}>
                      <VStack spacing={4}>
                        <FiCalendar size={48} color="gray.400" />
                        <VStack spacing={2}>
                          <Text
                            fontSize={{ base: "md", md: "lg" }}
                            fontWeight="medium"
                            color="gray.600"
                          >
                            Nenhum pagamento encontrado para este mês
                          </Text>
                          <Text
                            fontSize={{ base: "sm", md: "md" }}
                            color="gray.500"
                            textAlign="center"
                          >
                            Adicione mensalistas para que os pagamentos apareçam
                            aqui
                          </Text>
                        </VStack>
                      </VStack>
                    </Center>
                  ) : (
                    getCurrentMonthPayments().map((payment) => (
                      <MonthlyPaymentItem key={payment.id} payment={payment} />
                    ))
                  )}
                </VStack>

                <Divider />

                {/* Informações adicionais */}
                <Card
                  borderRadius="lg"
                  boxShadow="sm"
                  border="1px solid"
                  borderColor="gray.200"
                  bg="blue.50"
                >
                  <CardBody p={{ base: 4, md: 6 }}>
                    <VStack spacing={3} align="start">
                      <HStack spacing={2}>
                        <Icon as={FiDollarSign} size={16} color="blue.600" />
                        <Text
                          fontSize={{ base: "sm", md: "md" }}
                          fontWeight="semibold"
                          color="blue.800"
                        >
                          Resumo Financeiro do Mês
                        </Text>
                      </HStack>

                      <Grid
                        templateColumns="repeat(auto-fit, minmax(150px, 1fr))"
                        gap={4}
                        w="full"
                      >
                        <VStack align="start" spacing={1}>
                          <Text
                            fontSize="xs"
                            color="gray.600"
                            textTransform="uppercase"
                            letterSpacing="wide"
                          >
                            Total Esperado
                          </Text>
                          <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color="blue.600"
                          >
                            R${" "}
                            {getCurrentMonthPayments()
                              .reduce((sum, p) => sum + (p.fee_value || 0), 0)
                              .toFixed(2)}
                          </Text>
                        </VStack>

                        <VStack align="start" spacing={1}>
                          <Text
                            fontSize="xs"
                            color="gray.600"
                            textTransform="uppercase"
                            letterSpacing="wide"
                          >
                            Total Recebido
                          </Text>
                          <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color="green.600"
                          >
                            R${" "}
                            {getCurrentMonthPayments()
                              .filter((p) => p.is_paid)
                              .reduce((sum, p) => sum + (p.fee_value || 0), 0)
                              .toFixed(2)}
                          </Text>
                        </VStack>

                        <VStack align="start" spacing={1}>
                          <Text
                            fontSize="xs"
                            color="gray.600"
                            textTransform="uppercase"
                            letterSpacing="wide"
                          >
                            Pendente
                          </Text>
                          <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color="orange.600"
                          >
                            R${" "}
                            {getCurrentMonthPayments()
                              .filter((p) => !p.is_paid)
                              .reduce((sum, p) => sum + (p.fee_value || 0), 0)
                              .toFixed(2)}
                          </Text>
                        </VStack>
                      </Grid>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Modal Nova Transação */}
        <Modal
          isOpen={isTransactionOpen}
          onClose={onTransactionClose}
          isCentered
        >
          <ModalOverlay />
          <ModalContent mx={4} borderRadius="lg">
            <ModalHeader color="primary.900">Nova Transação</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <form onSubmit={handleSubmitTransaction(onSubmitTransaction)}>
                <VStack spacing={4} align="stretch">
                  {/* Tipo */}
                  <FormControl isInvalid={errorsTransaction.type}>
                    <FormLabel color="primary.900" fontWeight="semibold">
                      Tipo
                    </FormLabel>
                    <Select
                      placeholder="Selecione o tipo"
                      borderRadius="lg"
                      _focus={{
                        borderColor: "primary.900",
                        boxShadow: "0 0 0 1px primary.900",
                      }}
                      {...registerTransaction("type", {
                        required: "Tipo é obrigatório",
                      })}
                    >
                      <option value="entrada">Entrada</option>
                      <option value="saida">Saída</option>
                    </Select>
                  </FormControl>

                  {/* Valor */}
                  <FormControl isInvalid={errorsTransaction.amount}>
                    <FormLabel color="primary.900" fontWeight="semibold">
                      Valor (R$)
                    </FormLabel>
                    <Controller
                      name="amount"
                      control={controlTransaction}
                      rules={{
                        required: "Valor é obrigatório",
                        min: {
                          value: 0.01,
                          message: "Valor deve ser maior que zero",
                        },
                      }}
                      render={({ field }) => (
                        <NumberInput {...field} min={0} precision={2}>
                          <NumberInputField
                            borderRadius="lg"
                            _focus={{
                              borderColor: "primary.900",
                              boxShadow: "0 0 0 1px primary.900",
                            }}
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      )}
                    />
                  </FormControl>

                  {/* Categoria */}
                  <FormControl isInvalid={errorsTransaction.category}>
                    <FormLabel color="primary.900" fontWeight="semibold">
                      Categoria
                    </FormLabel>
                    <Select
                      placeholder="Selecione a categoria"
                      borderRadius="lg"
                      _focus={{
                        borderColor: "primary.900",
                        boxShadow: "0 0 0 1px primary.900",
                      }}
                      {...registerTransaction("category", {
                        required: "Categoria é obrigatória",
                      })}
                    >
                      {transactionType === "entrada" ? (
                        <>
                          <option value="mensalidade">Mensalidade</option>
                          <option value="inscricao">Taxa de Inscrição</option>
                          <option value="patrocinio">Patrocínio</option>
                          <option value="outros">Outros</option>
                        </>
                      ) : (
                        <>
                          <option value="equipamentos">Equipamentos</option>
                          <option value="arbitragem">Arbitragem</option>
                          <option value="campo">Aluguel de Campo</option>
                          <option value="premios">Prêmios</option>
                          <option value="outros">Outros</option>
                        </>
                      )}
                    </Select>
                  </FormControl>

                  {/* Descrição */}
                  <FormControl>
                    <FormLabel color="primary.900" fontWeight="semibold">
                      Descrição (opcional)
                    </FormLabel>
                    <Textarea
                      placeholder="Descreva a transação..."
                      borderRadius="lg"
                      _focus={{
                        borderColor: "primary.900",
                        boxShadow: "0 0 0 1px primary.900",
                      }}
                      {...registerTransaction("description")}
                    />
                  </FormControl>
                </VStack>
              </form>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="outline"
                mr={3}
                onClick={onTransactionClose}
                borderRadius="lg"
                flex={1}
                disabled={transactionLoading}
              >
                Cancelar
              </Button>
              <Button
                bg="primary.900"
                color="white"
                onClick={handleSubmitTransaction(onSubmitTransaction)}
                borderRadius="lg"
                flex={1}
                _hover={{ bg: "primary.800" }}
                isLoading={transactionLoading}
                loadingText="Salvando..."
              >
                Salvar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Adicionar Mensalistas */}
        <Modal
          isOpen={isMensalistasOpen}
          onClose={onMensalistasClose}
          isCentered
          size="xl"
        >
          <ModalOverlay />
          <ModalContent mx={4} borderRadius="lg">
            <ModalHeader color="primary.900">
              Adicionar Mensalistas ao Mês
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <form onSubmit={handleSubmitMensalistas(onSubmitMensalistas)}>
                <VStack spacing={4} align="stretch">
                  {/* Valor da Mensalidade */}
                  <FormControl isInvalid={errorsMensalistas.monthlyFee}>
                    <FormLabel color="primary.900" fontWeight="semibold">
                      Valor da Mensalidade (R$)
                    </FormLabel>
                    <Controller
                      name="monthlyFee"
                      control={controlMensalistas}
                      defaultValue={monthlyFeeValue}
                      rules={{
                        required: "Valor é obrigatório",
                        min: {
                          value: 0.01,
                          message: "Valor deve ser maior que zero",
                        },
                      }}
                      render={({ field }) => (
                        <NumberInput {...field} min={0} precision={2}>
                          <NumberInputField
                            borderRadius="lg"
                            _focus={{
                              borderColor: "primary.900",
                              boxShadow: "0 0 0 1px primary.900",
                            }}
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      )}
                    />
                  </FormControl>

                  {/* Mês de Referência */}
                  <FormControl isInvalid={errorsMensalistas.monthReference}>
                    <FormLabel color="primary.900" fontWeight="semibold">
                      Mês de Referência
                    </FormLabel>
                    <Controller
                      name="monthReference"
                      control={controlMensalistas}
                      rules={{
                        required: "Mês de referência é obrigatório",
                      }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Selecione o mês"
                          borderRadius="lg"
                          _focus={{
                            borderColor: "primary.900",
                            boxShadow: "0 0 0 1px primary.900",
                          }}
                        >
                          {getAvailableMonths().map((month) => (
                            <option key={month} value={month}>
                              {formatMonthName(month)}
                            </option>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>

                  {/* Jogadores para serem mensalistas */}
                  <FormControl>
                    <HStack justify="space-between" align="center" mb={0}>
                      <FormLabel
                        color="primary.900"
                        fontWeight="semibold"
                        mb={0}
                      >
                        Mensalistas para o mês selecionado
                      </FormLabel>
                    </HStack>
                    <Text fontSize="sm" color="gray.600" mb={3}>
                      Selecione os jogadores mensalistas que devem ter pagamento
                      registrado para este mês
                    </Text>
                    {(() => {
                      const monthRef =
                        watchMensalistas("monthReference") || selectedMonth;
                      const availablePlayers =
                        getAvailableMensalistasForMonth(monthRef);

                      // Debug específico do modal
                      console.log("Modal Debug:", {
                        monthRef,
                        availablePlayersCount: availablePlayers.length,
                        allPlayersTotal: allPlayers.length,
                        mensalistasTotal: allPlayers.filter(
                          (p) => p.is_montly_payer === true
                        ).length,
                        monthlyPaymentsForThisMonth: monthlyPayments.length,
                        watchedMonth: watchMensalistas("monthReference"),
                      });

                      if (availablePlayers.length === 0) {
                        return (
                          <Center py={6}>
                            <VStack spacing={2}>
                              <Text
                                color="gray.500"
                                fontSize="sm"
                                textAlign="center"
                              >
                                {allPlayers.filter(
                                  (p) => p.is_montly_payer === true
                                ).length === 0
                                  ? "Nenhum jogador está marcado como mensalista no sistema"
                                  : "Todos os jogadores mensalistas já estão registrados para este mês"}
                              </Text>
                              <Text
                                color="gray.400"
                                fontSize="xs"
                                textAlign="center"
                              >
                                {allPlayers.filter(
                                  (p) => p.is_montly_payer === true
                                ).length === 0
                                  ? "Configure jogadores como mensalistas em seus perfis"
                                  : "Mude o mês de referência ou adicione novos jogadores mensalistas"}
                              </Text>
                            </VStack>
                          </Center>
                        );
                      }

                      return (
                        <VStack spacing={3} align="stretch">
                          {/* Botões Selecionar/Desmarcar Todos */}
                          <HStack spacing={2}>
                            <Button
                              size="xs"
                              variant="outline"
                              borderColor="primary.200"
                              color="primary.900"
                              borderRadius="md"
                              onClick={handleSelectAllPlayers}
                              _hover={{ bg: "primary.50" }}
                              isDisabled={mensalistasLoading}
                            >
                              Selecionar Todos
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              borderColor="primary.200"
                              color="primary.900"
                              borderRadius="md"
                              onClick={handleDeselectAllPlayers}
                              _hover={{ bg: "primary.50" }}
                              isDisabled={mensalistasLoading}
                            >
                              Desmarcar Todos
                            </Button>
                          </HStack>

                          {/* Lista de Jogadores */}
                          <Controller
                            name="selectedPlayers"
                            control={controlMensalistas}
                            defaultValue={[]}
                            render={({ field }) => (
                              <CheckboxGroup
                                value={field.value}
                                onChange={field.onChange}
                                isDisabled={mensalistasLoading}
                              >
                                <Stack spacing={2}>
                                  {availablePlayers.map((player) => (
                                    <Checkbox
                                      key={player.id}
                                      value={player.id.toString()}
                                      colorScheme="primary"
                                      isDisabled={mensalistasLoading}
                                    >
                                      <Text fontSize="sm" color="primary.900">
                                        {player.name ||
                                          player.display_name ||
                                          `Jogador ${player.id}`}
                                      </Text>
                                    </Checkbox>
                                  ))}
                                </Stack>
                              </CheckboxGroup>
                            )}
                          />
                        </VStack>
                      );
                    })()}
                  </FormControl>
                </VStack>
              </form>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="outline"
                mr={3}
                onClick={onMensalistasClose}
                borderRadius="lg"
                flex={1}
                isDisabled={mensalistasLoading}
              >
                Cancelar
              </Button>
              <Button
                bg="primary.900"
                color="white"
                onClick={handleSubmitMensalistas(onSubmitMensalistas)}
                borderRadius="lg"
                flex={1}
                _hover={{ bg: "primary.800" }}
                isLoading={mensalistasLoading}
                loadingText="Salvando..."
              >
                Salvar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de Confirmação de Remoção */}
        <AlertDialog
          isOpen={isDeleteConfirmOpen}
          onClose={onDeleteConfirmClose}
          leastDestructiveRef={cancelRef}
          isCentered
        >
          <AlertDialogOverlay>
            <AlertDialogContent mx={4} borderRadius="lg">
              <AlertDialogHeader
                fontSize="lg"
                fontWeight="bold"
                color="primary.900"
              >
                Confirmar Remoção
              </AlertDialogHeader>

              <AlertDialogBody>
                <VStack spacing={3} align="start">
                  <Text>
                    Tem certeza que deseja remover{" "}
                    <Text as="span" fontWeight="semibold" color="primary.900">
                      {paymentToDelete?.playerName || "este jogador"}
                    </Text>{" "}
                    da lista de mensalistas deste mês?
                  </Text>

                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="semibold">
                        Esta ação irá:
                      </Text>
                      <Text fontSize="sm">• Remover o mensalista do mês</Text>
                      <Text fontSize="sm">
                        • Remover a transação de pagamento (se houver)
                      </Text>
                      <Text fontSize="sm" color="red.600" fontWeight="semibold">
                        Esta ação não pode ser desfeita.
                      </Text>
                    </VStack>
                  </Alert>
                </VStack>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={cancelRemoveMonthlyFee}
                  mr={3}
                  variant="outline"
                  borderRadius="lg"
                  isDisabled={deleteLoading}
                >
                  Cancelar
                </Button>
                <Button
                  colorScheme="red"
                  onClick={confirmRemoveMonthlyFee}
                  isLoading={deleteLoading}
                  loadingText="Removendo..."
                  borderRadius="lg"
                >
                  Remover
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        {/* Modal de Confirmação de Remoção de Transação */}
        <AlertDialog
          isOpen={isDeleteTransactionOpen}
          onClose={onDeleteTransactionClose}
          leastDestructiveRef={cancelRef}
          isCentered
        >
          <AlertDialogOverlay>
            <AlertDialogContent mx={4} borderRadius="lg">
              <AlertDialogHeader
                fontSize="lg"
                fontWeight="bold"
                color="primary.900"
              >
                Confirmar Remoção
              </AlertDialogHeader>

              <AlertDialogBody>
                <VStack spacing={3} align="start">
                  <Text>
                    Tem certeza que deseja remover a transação:{" "}
                    <Text as="span" fontWeight="semibold" color="primary.900">
                      "{transactionToDelete?.description}"
                    </Text>{" "}
                    (R$ {transactionToDelete?.amount.toFixed(2)})?
                  </Text>

                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="semibold">
                        Esta ação irá:
                      </Text>
                      <Text fontSize="sm">• Remover a transação</Text>
                      <Text fontSize="sm" color="red.600" fontWeight="semibold">
                        Esta ação não pode ser desfeita.
                      </Text>
                    </VStack>
                  </Alert>
                </VStack>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={cancelRemoveTransaction}
                  mr={3}
                  variant="outline"
                  borderRadius="lg"
                  isDisabled={deleteLoading}
                >
                  Cancelar
                </Button>
                <Button
                  colorScheme="red"
                  onClick={confirmRemoveTransaction}
                  isLoading={deleteLoading}
                  loadingText="Removendo..."
                  borderRadius="lg"
                >
                  Remover
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </Box>
  );
}
