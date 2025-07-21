import { Box, Flex, Image, Text, VStack } from "@chakra-ui/react";
import TeamBlack from "../assets/images/team_black.jpg";
import TeamWhite from "../assets/images/team_white.jpg";

export default function MatchScoreCard({ score, showTitle = true }) {
  const blackScore = score?.team_black ?? 0;
  const whiteScore = score?.team_white ?? 0;

  return (
    <Box bg="white" borderRadius="xl" p={4} border="1px" borderColor="gray.200">
      {showTitle && (
        <Text fontSize="sm" color="gray.500" textAlign="center" mb={3}>
          Resultado Final
        </Text>
      )}

      <Flex justify="center" align="center" gap={10}>
        <VStack spacing={1} w={"12%"}>
          <Image
            src={TeamBlack}
            alt="Team Black"
            w={"100%"}
            objectFit="contain"
          />
        </VStack>
        <VStack spacing={1} w={"12%"}>
          <Image
            src={TeamWhite}
            alt="Team White"
            w={"100%"}
            objectFit="contain"
          />
        </VStack>
      </Flex>
      <Flex justify="center" align="center" gap={7}>
        <VStack spacing={1}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            {blackScore}
          </Text>
        </VStack>

        <Text fontSize="xl" color="gray.400" fontWeight="bold">
          ×
        </Text>

        <VStack spacing={1}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            {whiteScore}
          </Text>
        </VStack>
      </Flex>

      {/* Indicador quando não há gols */}
      {blackScore === 0 && whiteScore === 0 && (
        <Text fontSize="xs" color="gray.400" textAlign="center" mt={2}>
          Nenhum gol registrado
        </Text>
      )}
    </Box>
  );
}
