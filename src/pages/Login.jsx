import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Heading,
  Text,
  VStack,
  useToast,
  Container,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const toast = useToast();
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  if (!isLoading && isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  // Função para validar telefone brasileiro
  const validatePhone = (phone) => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone) || "Formato inválido. Use: (11) 99999-9999";
  };

  // Função para formatar data enquanto digita (dd/mm/yyyy)
  const formatDate = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Aplica a máscara dd/mm/yyyy
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(
        4,
        8
      )}`;
    }
  };

  // Função para validar data de nascimento no formato dd/mm/yyyy
  const validateBirthDate = (dateString) => {
    // Verificar formato dd/mm/yyyy
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(dateString)) {
      return "Formato inválido. Use: dd/mm/yyyy";
    }

    // Extrair dia, mês e ano
    const [day, month, year] = dateString.split("/").map(Number);

    // Validar se é uma data válida
    const date = new Date(year, month - 1, day);

    if (
      date.getDate() !== day ||
      date.getMonth() !== month - 1 ||
      date.getFullYear() !== year
    ) {
      return "Data inválida";
    }

    // Validar idade
    const today = new Date();
    const age = today.getFullYear() - year;
    const monthDiff = today.getMonth() - (month - 1);
    const dayDiff = today.getDate() - day;

    if (date > today) {
      return "Data de nascimento não pode ser no futuro";
    }

    // Calcular idade exata
    let finalAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      finalAge--;
    }

    if (finalAge < 16) {
      return "Você deve ter pelo menos 16 anos";
    }

    if (finalAge > 100) {
      return "Data de nascimento inválida";
    }

    return true;
  };

  // Função para converter data dd/mm/yyyy para formato do backend
  const convertDateToBackendFormat = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // Função para formatar telefone enquanto digita
  const formatPhone = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Aplica a máscara (11) 99999-9999
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
        7,
        11
      )}`;
    }
  };

  const onSubmit = async (data) => {
    setIsSubmittingForm(true);

    try {
      const userData = {
        telefone: data.telefone,
        dataNascimento: convertDateToBackendFormat(data.dataNascimento),
      };

      // Usar o contexto de autenticação com await para aguardar o resultado

      await login(userData, () => {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao Pelada Manager",
          status: "success",
          duration: 2000,
          position: "top",
          isClosable: true,
        });
        navigate("/");
      });
    } catch (error) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro no login",
        description: error.message || "Verifique seus dados e tente novamente",
        status: "error",
        position: "top",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center">
        <Container maxW="md">
          <Card maxW="md" mx="auto" boxShadow="xl" borderRadius="2xl">
            <CardBody p={8} textAlign="center">
              <Text>Carregando...</Text>
            </CardBody>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center">
      <Container maxW="md">
        <Card maxW="md" mx="auto" boxShadow="xl" borderRadius="2xl">
          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              <Box textAlign="center">
                <Heading as="h1" size="xl" color="gray.800" mb={2}>
                  Entrar
                </Heading>
                <Text color="gray.500" fontSize="md">
                  Entre com seu telefone e data de nascimento
                </Text>
              </Box>

              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack spacing={6} align="stretch">
                  <FormControl isInvalid={errors.telefone}>
                    <FormLabel color="gray.700" fontWeight="semibold">
                      Telefone
                    </FormLabel>
                    <Input
                      placeholder="(11) 99999-9999"
                      size="lg"
                      bg="white"
                      border="1px"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{
                        borderColor: "green.500",
                        boxShadow: "0 0 0 1px #38A169",
                      }}
                      {...register("telefone", {
                        required: "Telefone é obrigatório",
                        validate: validatePhone,
                        onChange: (e) => {
                          e.target.value = formatPhone(e.target.value);
                        },
                      })}
                      maxLength={15}
                    />
                    <FormErrorMessage>
                      {errors.telefone && errors.telefone.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.dataNascimento}>
                    <FormLabel color="gray.700" fontWeight="semibold">
                      Data de Nascimento
                    </FormLabel>
                    <Input
                      type="text"
                      placeholder="dd/mm/yyyy"
                      size="lg"
                      bg="white"
                      border="1px"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{
                        borderColor: "green.500",
                        boxShadow: "0 0 0 1px #38A169",
                      }}
                      {...register("dataNascimento", {
                        required: "Data de nascimento é obrigatória",
                        validate: validateBirthDate,
                        onChange: (e) => {
                          e.target.value = formatDate(e.target.value);
                        },
                      })}
                      maxLength={10}
                    />
                    <FormErrorMessage>
                      {errors.dataNascimento && errors.dataNascimento.message}
                    </FormErrorMessage>
                  </FormControl>

                  <Button
                    type="submit"
                    size="lg"
                    bg="black"
                    color="white"
                    _hover={{ bg: "gray.800" }}
                    _active={{ bg: "gray.900" }}
                    isLoading={isSubmittingForm || isSubmitting}
                    loadingText="Entrando..."
                    borderRadius="lg"
                    fontWeight="semibold"
                    mt={4}
                  >
                    Entrar
                  </Button>
                </VStack>
              </form>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
