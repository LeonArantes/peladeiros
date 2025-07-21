import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  HStack,
  Tag,
  TagCloseButton,
  TagLabel,
  IconButton,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import userService from "../services/userService";

const CreatePlayer = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();

  const availablePositions = [
    "Goleiro",
    "Defesa",
    "Meio-Campo",
    "Ataque",
    "Lateral",
  ];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      birthdate: "",
      is_active: true,
      is_admin: false,
      is_montly_payer: false,
      score: 100,
    },
  });

  // Função para validar telefone brasileiro (mesma do login)
  const validatePhone = (phone) => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone) || "Formato inválido. Use: (11) 99999-9999";
  };

  // Função para formatar telefone enquanto digita (mesma do login)
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

  // Função para formatar data de nascimento dd/mm/yyyy
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

  // Função para validar data de nascimento
  const validateBirthDate = (date) => {
    // Verifica se está no formato dd/mm/yyyy
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(date)) {
      return "Use o formato dd/mm/yyyy";
    }

    const [day, month, year] = date.split("/").map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();

    // Verifica se é uma data válida
    if (
      birthDate.getDate() !== day ||
      birthDate.getMonth() !== month - 1 ||
      birthDate.getFullYear() !== year
    ) {
      return "Data inválida";
    }

    if (birthDate > today) {
      return "Data de nascimento não pode ser no futuro";
    }

    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    const actualAge =
      monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (actualAge < 16) {
      return "Você deve ter pelo menos 16 anos";
    }

    if (actualAge > 100) {
      return "Data de nascimento inválida";
    }

    return true;
  };

  // Função para converter dd/mm/yyyy para YYYYMMDD
  const convertDateToYYYYMMDD = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return `${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`;
  };

  const addPosition = (position) => {
    if (!selectedPositions.includes(position)) {
      setSelectedPositions([...selectedPositions, position]);
    }
  };

  const removePosition = (position) => {
    setSelectedPositions(selectedPositions.filter((p) => p !== position));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Converter data de nascimento para YYYYMMDD e telefone para número
      const birthdate = convertDateToYYYYMMDD(data.birthdate);
      const phone = data.phone.replace(/\D/g, ""); // Remove formatação do telefone

      const userData = {
        ...data,
        phone,
        birthdate,
        playing_positions: selectedPositions,
      };

      await userService.create(userData);

      toast({
        title: "Jogador criado com sucesso!",
        description: `${data.name} foi adicionado à lista de jogadores.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Resetar formulário
      reset();
      setSelectedPositions([]);

      // Navegar para lista de jogadores após 1 segundo
      setTimeout(() => {
        navigate("/players");
      }, 1000);
    } catch (error) {
      toast({
        title: "Erro ao criar jogador",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" pb="80px">
      <Container maxW="container.md" px={4} py={6}>
        {/* Header */}
        <HStack mb={6}>
          <IconButton
            icon={<FiArrowLeft />}
            onClick={() => navigate("/players")}
            variant="ghost"
            aria-label="Voltar"
          />
          <Heading size="lg" color="gray.800">
            Criar Novo Jogador
          </Heading>
        </HStack>

        {/* Formulário */}
        <Box bg="white" p={6} borderRadius="lg" shadow="sm">
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={6} align="stretch">
              {/* Nome */}
              <FormControl isInvalid={errors.name}>
                <FormLabel>Nome Completo</FormLabel>
                <Input
                  {...register("name", {
                    required: "Nome é obrigatório",
                    minLength: {
                      value: 2,
                      message: "Nome deve ter pelo menos 2 caracteres",
                    },
                  })}
                  placeholder="Digite o nome completo"
                  size="lg"
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              {/* Telefone */}
              <FormControl isInvalid={errors.phone}>
                <FormLabel>Telefone</FormLabel>
                <Input
                  {...register("phone", {
                    required: "Telefone é obrigatório",
                    validate: validatePhone,
                    onChange: (e) => {
                      e.target.value = formatPhone(e.target.value);
                    },
                  })}
                  placeholder="(11) 99999-9999"
                  size="lg"
                />
                <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
              </FormControl>

              {/* Data de Nascimento */}
              <FormControl isInvalid={errors.birthdate}>
                <FormLabel>Data de Nascimento</FormLabel>
                <Input
                  {...register("birthdate", {
                    required: "Data de nascimento é obrigatória",
                    validate: validateBirthDate,
                    onChange: (e) => {
                      e.target.value = formatDate(e.target.value);
                    },
                  })}
                  placeholder="dd/mm/yyyy"
                  size="lg"
                  maxLength={10}
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Formato: dd/mm/yyyy (ex: 09/08/2003)
                </Text>
                <FormErrorMessage>{errors.birthdate?.message}</FormErrorMessage>
              </FormControl>

              {/* Score */}
              <FormControl>
                <FormLabel>Pontuação</FormLabel>
                <Controller
                  name="score"
                  control={control}
                  render={({ field }) => (
                    <NumberInput {...field} min={0} max={1000} size="lg">
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  )}
                />
              </FormControl>

              {/* Posições */}
              <FormControl>
                <FormLabel>Posições de Jogo</FormLabel>
                <Select
                  placeholder="Selecione uma posição"
                  size="lg"
                  onChange={(e) => {
                    if (e.target.value) {
                      addPosition(e.target.value);
                      e.target.value = "";
                    }
                  }}
                >
                  {availablePositions
                    .filter((pos) => !selectedPositions.includes(pos))
                    .map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                </Select>

                {/* Tags das posições selecionadas */}
                {selectedPositions.length > 0 && (
                  <HStack mt={3} wrap="wrap">
                    {selectedPositions.map((position) => (
                      <Tag key={position} size="md" colorScheme="blue">
                        <TagLabel>{position}</TagLabel>
                        <TagCloseButton
                          onClick={() => removePosition(position)}
                        />
                      </Tag>
                    ))}
                  </HStack>
                )}
              </FormControl>

              {/* Switches */}
              <VStack spacing={4} align="stretch">
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="is_active" mb="0" flex="1">
                    Jogador Ativo
                  </FormLabel>
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="is_active"
                        isChecked={field.value}
                        onChange={field.onChange}
                        colorScheme="green"
                        size="lg"
                      />
                    )}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="is_montly_payer" mb="0" flex="1">
                    Mensalista
                  </FormLabel>
                  <Controller
                    name="is_montly_payer"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="is_montly_payer"
                        isChecked={field.value}
                        onChange={field.onChange}
                        colorScheme="green"
                        size="lg"
                      />
                    )}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="is_admin" mb="0" flex="1">
                    Administrador
                  </FormLabel>
                  <Controller
                    name="is_admin"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="is_admin"
                        isChecked={field.value}
                        onChange={field.onChange}
                        colorScheme="green"
                        size="lg"
                      />
                    )}
                  />
                </FormControl>
              </VStack>

              {/* Botões */}
              <HStack spacing={4} pt={4}>
                <Button
                  variant="outline"
                  size="lg"
                  flex="1"
                  onClick={() => navigate("/players")}
                  isDisabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  bg="black"
                  color="white"
                  size="lg"
                  flex="1"
                  isLoading={loading}
                  loadingText="Criando..."
                  _hover={{ bg: "gray.800" }}
                >
                  Criar Jogador
                </Button>
              </HStack>
            </VStack>
          </form>
        </Box>
      </Container>
    </Box>
  );
};

export default CreatePlayer;
