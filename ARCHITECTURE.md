# Arquitetura do Sistema - Pelada Manager

## 🎯 Refatoração seguindo Princípios SOLID

Este projeto foi refatorado para seguir os **princípios SOLID**, tornando o código mais maintível, testável e extensível.

## 📁 Estrutura de Diretórios

```
src/
├── services/           # Serviços com responsabilidades únicas
│   ├── userService.js     # Gerenciamento de usuários
│   ├── attendanceService.js # Gerenciamento de lista de presença
│   ├── storageService.js   # Gerenciamento de localStorage
│   └── index.js           # Índice central dos serviços
├── hooks/             # Hooks customizados
│   └── useAttendance.js   # Hook para lista de presença
├── components/        # Componentes UI
├── context/          # Contextos React
└── pages/           # Páginas da aplicação
```

## 🔧 Princípios SOLID Aplicados

### 1. **Single Responsibility Principle (SRP)**

Cada classe/serviço tem uma única responsabilidade:

- **`UserService`**: Gerencia apenas operações relacionadas aos usuários
- **`AttendanceService`**: Gerencia apenas a lista de presença
- **`StorageService`**: Gerencia apenas o armazenamento local
- **`useAttendance`**: Hook que gerencia apenas estado da lista de presença

### 2. **Open/Closed Principle (OCP)**

Os serviços são abertos para extensão, fechados para modificação:

```javascript
// Fácil de estender sem modificar código existente
class UserService {
  // Métodos base existentes...

  // Novas funcionalidades podem ser adicionadas facilmente
  async updateUserScore(userId, score) {
    // Nova funcionalidade sem modificar código existente
  }
}
```

### 3. **Liskov Substitution Principle (LSP)**

Objetos podem ser substituídos por suas abstrações:

```javascript
// Todas as implementações seguem a mesma interface
const userService = new UserService();
const mockUserService = new MockUserService(); // Para testes

// Ambos podem ser usados da mesma forma
userService.findById(id);
mockUserService.findById(id);
```

### 4. **Interface Segregation Principle (ISP)**

Interfaces específicas ao invés de uma interface geral:

```javascript
// Ao invés de um serviço gigante "AppService"
// Temos serviços específicos para cada responsabilidade
import { userService, attendanceService, storageService } from "../services";
```

### 5. **Dependency Inversion Principle (DIP)**

Dependemos de abstrações, não de implementações concretas:

```javascript
// AuthContext depende da abstração userService
import userService from "../services/userService";

// Hook depende da abstração attendanceService
import attendanceService from "../services/attendanceService";
```

## 🏗️ Arquitetura em Camadas

### **Camada de Serviços (Services Layer)**

Responsável pela lógica de negócio e comunicação com Firebase:

```javascript
// userService.js - Gerencia operações de usuário
class UserService {
  async findByPhoneAndBirthdate(phone, birthdate) {}
  isMonthlyPayer(user) {}
  isAdmin(user) {}
}

// attendanceService.js - Gerencia lista de presença
class AttendanceService {
  async addUserToMatch(matchId, userId) {}
  async removeUserFromMatch(matchId, userId) {}
  observeMatchAttendance(matchId, callback) {}
}
```

### **Camada de Hooks (Hooks Layer)**

Responsável por gerenciar estado e conectar UI com serviços:

```javascript
// useAttendance.js - Hook para lista de presença
export const useAttendance = (matchId, maxPlayers) => {
  // Lógica de estado
  // Conecta com attendanceService
  // Retorna estado e ações para UI
};
```

### **Camada de Componentes (UI Layer)**

Responsável apenas por renderização e interação do usuário:

```jsx
// ConfirmedPlayersList.jsx - Componente "burro"
const ConfirmedPlayersList = ({ matchId, maxPlayers }) => {
  const { attendanceList, joinMatch, leaveMatch } = useAttendance(
    matchId,
    maxPlayers
  );

  // Apenas renderiza UI e chama ações do hook
  return <div>...</div>;
};
```

## 🔄 Fluxo de Dados

```
UI Component → Hook → Service → Firebase
     ↑                           ↓
     ←         ←        ←         ←
```

1. **Componente** chama ação do hook
2. **Hook** chama método do serviço
3. **Serviço** executa operação no Firebase
4. **Firebase** retorna dados
5. **Serviço** processa dados
6. **Hook** atualiza estado
7. **Componente** re-renderiza automaticamente

## 📊 Coleções Firebase

### **users** (Collection existente)

```javascript
{
  id: "4AlBTFroG9kTjxKLRwct",
  birthdate: 20030809,
  is_active: true,
  is_admin: true,
  name: "Leon Arantes",
  phone: 32988731832,
  playing_positions: ["Middle"],
  is_montly_payer: true,
  score: 100
}
```

### **match** (Collection existente)

```javascript
{
  id: "PHeJtO9wWT4YlkID1gnz",
  created_at: Timestamp,
  current_players: 1,
  date: Timestamp,
  final_score: {teamBlack: 0, teamWhite: 0},
  local: "Gardens",
  max_players: 14,
  players_per_team: 7,
  registration_start_date: Timestamp,
  status: "Finalizado"
}
```

### **attendance_list** (Collection nova)

```javascript
{
  id: "doc_id",
  matchId: "PHeJtO9wWT4YlkID1gnz",
  userId: "4AlBTFroG9kTjxKLRwct",
  position: 1,
  isMonthlyPayer: true,
  joinedAt: Timestamp
}
```

## 🎯 Benefícios da Refatoração

### ✅ **Manutenibilidade**

- Código organizado em responsabilidades únicas
- Fácil localização de bugs
- Alterações isoladas não afetam outros módulos

### ✅ **Testabilidade**

- Serviços podem ser testados independentemente
- Mocks fáceis de criar para testes unitários
- Hooks podem ser testados isoladamente

### ✅ **Reutilização**

- Serviços podem ser usados em qualquer parte da app
- Hooks podem ser reutilizados em diferentes componentes
- Lógica de negócio separada da UI

### ✅ **Extensibilidade**

- Novos serviços podem ser adicionados facilmente
- Funcionalidades podem ser estendidas sem quebrar código existente
- Padrão consistente para novos desenvolvimentos

## 🚀 Como Usar

### **Importar Serviços**

```javascript
import { userService, attendanceService } from "../services";

// Usar métodos dos serviços
const user = await userService.findById(userId);
await attendanceService.addUserToMatch(matchId, userId);
```

### **Usar Hooks**

```javascript
import { useAttendance } from "../hooks/useAttendance";

const { attendanceList, joinMatch, loading } = useAttendance(matchId, 14);
```

### **Criar Novos Serviços**

Siga o padrão existente:

```javascript
class NewService {
  constructor() {
    this.collectionName = "collection_name";
  }

  async someMethod() {
    // Implementação
  }
}

export const newService = new NewService();
export default newService;
```

---

Esta arquitetura garante que o código seja **fácil de manter**, **testar** e **estender** conforme o projeto cresce! 🎉
