# 🚀 Setup Rápido - Pelada Manager

## Comandos para Executar (NÃO executar, apenas seguir)

### 1. Criar o projeto:

```bash
yarn create vite pelada-manager --template react
cd pelada-manager
```

### 2. Instalar dependências:

```bash
# Dependências principais
yarn add @chakra-ui/react @emotion/react @emotion/styled framer-motion firebase react-router-dom react-hook-form date-fns react-icons

# Dependências de desenvolvimento
yarn add -D @types/react @types/react-dom

# Instalar tudo
yarn install
```

### 3. Configurar Firebase:

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Ative **Firestore Database**
4. Obtenha as credenciais em **Configurações do Projeto > SDK Config**
5. Atualize `src/config/firebase.js` com suas credenciais

### 4. Configurar regras do Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 5. Executar o projeto:

```bash
# Se o servidor estiver rodando, pare com Ctrl+C
# Depois execute:
yarn dev
```

## ✅ Estrutura Criada:

```
pelada-manager/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Home.jsx
│   │   ├── Partidas.jsx
│   │   └── NovaPartida.jsx
│   ├── config/
│   │   └── firebase.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── README.md
├── SETUP.md
├── vite.config.js
└── .gitignore
```

## 🔥 Funcionalidades Implementadas:

### Sistema de Autenticação

- ✅ **Página de login** com telefone e data de nascimento
- ✅ **Validação de dados** com máscaras automáticas
- ✅ **Proteção de rotas** - redireciona para login se não autenticado
- ✅ **Contexto de autenticação** para gerenciar estado do usuário
- ✅ **Persistência de login** com localStorage
- ✅ **Logout funcional** com limpeza de dados

### Gestão de Partidas

- ✅ **Dashboard** com estatísticas em tempo real
- ✅ **Listagem de partidas** com atualizações automáticas
- ✅ **Cadastro de partidas** com validação completa
- ✅ **Exclusão de partidas** com confirmação
- ✅ **Design responsivo** com Chakra UI

### Interface e UX

- ✅ **Navegação intuitiva** com React Router
- ✅ **Formulários otimizados** com React Hook Form
- ✅ **Feedback visual** com toasts e loading states
- ✅ **Menu de usuário** na navbar com informações

## 🔐 Como Funciona o Login:

### Primeiro Acesso:

1. Acesse `http://localhost:5173`
2. Será redirecionado para `/login`
3. Preencha telefone no formato `(11) 99999-9999`
4. Selecione sua data de nascimento
5. Clique em "Entrar"

### Validações Implementadas:

- **Telefone:** Formato brasileiro obrigatório
- **Data:** Idade mínima 16 anos, máximo 100 anos
- **Cadastro:** Automático no primeiro login
- **Sessão:** Mantida até logout manual

### Navegação Pós-Login:

- **Dashboard:** Estatísticas das partidas
- **Partidas:** Lista com filtros por data
- **Nova Partida:** Formulário completo
- **Menu Usuário:** Logout e informações

## 📱 Próximos Passos:

1. Substitua as credenciais do Firebase
2. **Pare o servidor anterior (Ctrl+C)**
3. Execute `yarn dev`
4. **Acesse `http://localhost:5173`**
5. **Faça login** com telefone e data de nascimento
6. Comece a cadastrar suas partidas!

## 🔧 Solução de Problemas:

### Login não funciona:

- Verifique se preencheu telefone corretamente: `(11) 99999-9999`
- Data de nascimento deve ser válida (16-100 anos)
- Limpe localStorage se necessário: `localStorage.clear()`

### Erro "localhost page can't be found":

1. Verifique se o `index.html` existe na raiz
2. Pare o servidor com `Ctrl+C`
3. Execute `yarn dev` novamente
4. Verifique se a porta 5173 não está sendo usada

### Problemas de autenticação:

- Limpe o localStorage: F12 > Application > Local Storage > Clear
- Reinstale dependências: `rm -rf node_modules && yarn install`

---

**Sistema completo com autenticação pronto para usar! ⚽**
