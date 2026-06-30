# 📅 Sistema de Agendamentos e Disponibilidade

Este projeto consiste em uma aplicação WEB completa para gerenciamento de agendamentos de atendimentos e controle de disponibilidade de agenda. A solução foi desenvolvida dividindo as responsabilidades em uma arquitetura Cliente-Servidor (Decoupled Monorepo) e implementa um sistema de controle de acesso baseado em perfis (RBAC - Role-Based Access Control).

## 🚀 Tecnologias Utilizadas

### Backend (API)

- **PHP 8+** utilizando o framework **Laravel** (Garante estrutura MVC organizada e de fácil manutenção).

- **Laravel Sanctum** para autenticação baseada em tokens (Stateless Auth).

- **PostgreSQL** como sistema de gerenciamento de banco de dados relacional.

### Frontend (Web)

- **React** com **TypeScript** (Tipagem estática para maior segurança e redução de bugs).

- **Vite** como ferramenta de build rápida e performática.

- **Tailwind CSS** para estilização utilitária, garantindo um design responsivo, limpo e com foco em usabilidade.

- **React Router Dom** para gerenciamento de rotas e barreiras de proteção (Router Guards).

- **Axios** para consumo de dados da API.

## 🛠️ Como Rodar o Projeto Localmente

### Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:

- **PHP** (versão 8.1 ou superior)

- **Composer** (Gerenciador de dependências PHP)

- **Node.js** & **NPM**

- Servidor **PostgreSQL** ativo e rodando

### 1\. Configuração do Backend (API)

1.  Pelo terminal do seu sistema, navegue até a pasta do backend: cd scheduler-api

2.  Instale todas as dependências do ecossistema PHP:

```bash
composer install
```

3.  Crie o arquivo de variáveis de ambiente espelhando o arquivo de exemplo:

```bash
cp .env.example .env
```

4.  Abra o arquivo .env recém-criado no seu editor de código e configure as credenciais de acesso ao seu banco de dados PostgreSQL local:

```bash
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=scheduler_db
DB_USERNAME=SEU_USUARIO_POSTGRES DB_PASSWORD=SUA_SENHA_POSTGRES
```

5.  Gere a chave única de criptografia da aplicação:

```bash
php artisan key:generate
```

6.  Execute as migrações para estruturar as tabelas do banco de dados e rodar o seeder que cria o usuário administrador inicial:

```bash
php artisan migrate --seed
```

7.  Inicie o servidor embutido de desenvolvimento do Laravel:

```bash
php artisan serve
```

_O backend estará acessível e pronto em: http://localhost:8000_

### 2\. Configuração do Frontend (Web)

1.  Abra uma nova janela do seu terminal (deixando o servidor do backend rodando) e navegue até a pasta do frontend:

```bash
cd scheduler-web
```

2.  Instale as dependências locais do projeto React:

```bash
npm install
```

3.  Inicialize o servidor de desenvolvimento do Vite:

```bash
npm run dev
```

_O frontend estará rodando e pronto para acesso em: http://localhost:5173_

## 🔐 Credenciais para Testes

Para validar as regras de permissão de acesso e os comportamentos distintos entre perfis (Administrador vs. Atendente), o banco de dados é populado automaticamente com o seguinte usuário root:

- **E-mail:** admin@admin.com

- **Senha:** 12345678
