# ⚽ Pelada Manager

Um sistema simples e eficiente para organizar e gerenciar partidas de futebol com seus amigos!

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript para interfaces
- **Vite** - Build tool rápida e moderna
- **Chakra UI** - Biblioteca de componentes para UI moderna
- **Firebase Firestore** - Banco de dados em tempo real
- **React Router DOM** - Navegação entre páginas
- **React Hook Form** - Gerenciamento de formulários
- **Date-fns** - Manipulação de datas
- **React Icons** - Ícones modernos

## 📋 Funcionalidades

- ✅ **Sistema de Login** com telefone e data de nascimento
- ✅ **Autenticação e proteção de rotas**
- ✅ **Dashboard** com estatísticas das partidas
- ✅ **Listar partidas** cadastradas
- ✅ **Cadastrar nova partida** com data, horário e local
- ✅ **Excluir partidas**
- ✅ **Visualização em tempo real** (atualizações automáticas)
- ✅ **Design responsivo** para desktop e mobile
- ✅ **Interface moderna** com Chakra UI

## 🛠️ Instalação e Configuração

### 1. Clone o repositório e instale as dependências

```bash
# Criar o projeto
yarn create vite pelada-manager --template react
cd pelada-manager

# Instalar dependências principais
yarn add @chakra-ui/react @emotion/react @emotion/styled framer-motion
yarn add firebase
yarn add react-router-dom
yarn add react-hook-form
yarn add date-fns
yarn add react-icons

# Instalar dependências de desenvolvimento
yarn add -D @types/react @types/react-dom

# Instalar todas as dependências
yarn install
```

### 2. Configurar o Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Ative o **Firestore Database**
4. Nas configurações do projeto, obtenha as credenciais de configuração
5. Atualize o arquivo `src/config/firebase.js` com suas credenciais:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-auth-domain",
  projectId: "seu-project-id",
  storageBucket: "seu-storage-bucket",
  messagingSenderId: "seu-messaging-sender-id",
  appId: "seu-app-id",
};
```

### 3. Configurar as regras do Firestore

No Firebase Console, vá em **Firestore Database > Regras** e configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Para desenvolvimento
    }
  }
}
```

> **Nota:** Para produção, configure regras de segurança adequadas.

### 4. Executar o projeto

```bash
# Modo de desenvolvimento
yarn dev

# Build para produção
yarn build

# Preview da build
yarn preview
```

## 📱 Como Usar

### Sistema de Login

- **Acesso inicial:** `/login` - Página de autenticação
- **Telefone:** Formato brasileiro (11) 99999-9999
- **Data de nascimento:** Validação de idade mínima (16 anos)
- **Cadastro automático:** Primeira vez é automática
- **Logout:** Menu do usuário na navbar

### Dashboard

- Visualize estatísticas das suas partidas
- Total de partidas, próximas partidas e partidas realizadas

### Gerenciar Partidas

- **Ver todas as partidas:** Lista organizada por data
- **Nova partida:** Formulário simples para cadastro
- **Excluir partida:** Remoção com confirmação

### Campos do Formulário

- **Local:** Nome do campo/quadra (obrigatório)
- **Endereço:** Endereço completo (opcional)
- **Data:** Data da partida (obrigatório)
- **Horário:** Hora da partida (obrigatório)
- **Observações:** Informações extras (opcional)

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Navbar.jsx      # Barra de navegação
│   └── ProtectedRoute.jsx # Proteção de rotas
├── context/            # Contextos React
│   └── AuthContext.jsx # Gerenciamento de autenticação
├── pages/              # Páginas da aplicação
│   ├── Login.jsx       # Página de login
│   ├── Home.jsx        # Dashboard principal
│   ├── Partidas.jsx    # Lista de partidas
│   └── NovaPartida.jsx # Formulário de nova partida
├── config/             # Configurações
│   └── firebase.js     # Config do Firebase
├── App.jsx             # Componente principal
└── main.jsx           # Ponto de entrada
```

## 🔐 Sistema de Autenticação

### Funcionalidades de Segurança

- **Rotas protegidas:** Páginas principais requerem login
- **Persistência:** Login mantido no localStorage
- **Validação:** Telefone e data de nascimento
- **Redirecionamento:** Login automático se já autenticado
- **Logout:** Limpeza completa da sessão

### Fluxo de Autenticação

1. Usuário acessa qualquer rota protegida
2. Redirecionado para `/login` se não autenticado
3. Preenche telefone e data de nascimento
4. Sistema valida e autentica
5. Redirecionado para página inicial

## 🔄 Banco de Dados

### Coleção: `partidas`

```javascript
{
  id: "documento-id",
  local: "Campo do Zé",
  endereco: "Rua das Flores, 123",
  data: Timestamp,
  observacoes: "Levar água",
  criadaEm: Timestamp
}
```

## 🎨 Personalização

O projeto usa **Chakra UI** que permite fácil personalização:

- **Cores:** Modifique o tema em `src/main.jsx`
- **Componentes:** Customize os componentes em `src/components/`
- **Layout:** Ajuste responsividade nos arquivos de página

## 🚀 Deploy

### Netlify

```bash
yarn build
# Faça upload da pasta dist/
```

### Vercel

```bash
yarn build
# Conecte seu repositório GitHub ao Vercel
```

### Firebase Hosting

```bash
yarn build
firebase init hosting
firebase deploy
```

## 📝 Próximas Funcionalidades

- [ ] Sistema de jogadores/participantes
- [ ] Placar das partidas
- [ ] Histórico de jogos por jogador
- [ ] Notificações de novas partidas
- [ ] Sistema de grupos/times
- [ ] Integração com Google Maps
- [ ] Autenticação com Firebase Auth
- [ ] Chat em tempo real

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido com ⚽ para os amantes do futebol!**
