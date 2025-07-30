# 🤖 ChatBot RH - Frontend

> Application Next.js moderne pour chatbot RH avec intégration Antibia et communication temps réel

[![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC)](https://tailwindcss.com/)

## 📋 Description

ChatBot RH est une application frontend moderne développée avec **Next.js 15** et **React 19**, conçue pour faciliter les interactions RH via une interface conversationnelle intelligente. L'application s'intègre avec le système RH **Antibia** et utilise l'**API OpenRouter** pour générer des réponses dynamiques basées sur l'intelligence artificielle.

## ✨ Fonctionnalités principales

### 🎯 Chat IA
- Interface conversationnelle intuitive
- Intégration API OpenRouter pour l'IA
- Système de feedback (👍/👎)
- Historique des conversations
- Support mobile optimisé

### 👥 Gestion RH (Antibia)
- **Profil employé** - Consultation des informations personnelles
- **Gestion des congés** - Demandes et suivi des congés
- **Bulletins de paie** - Accès aux fiches de paie
- **Formations** - Catalogue et inscriptions
- **Actions rapides** - Raccourcis pour les tâches courantes

### 🔧 Fonctionnalités techniques
- **Authentification** sécurisée avec localStorage
- **Communication temps réel** via Socket.IO
- **Interface responsive** (desktop/mobile)
- **Système de notifications** intégré
- **Validation des données** avec Zod

## 🏗️ Architecture

### Stack technique
```
🚀 Framework      : Next.js 15.1.0
⚛️  UI Library     : React 19.1.0
📘 Language       : TypeScript 5.8.3
🎨 Styling        : Tailwind CSS 3.4.17
🔌 WebSocket      : Socket.IO Client 4.8.1
🌐 HTTP Client    : Axios 1.11.0
📝 Forms          : React Hook Form 7.61.1
✅ Validation     : Zod 4.0.10
```

### Structure du projet
```
chatbot-rh-frontend/
├── 📁 src/
│   ├── 📁 components/          # Composants React
│   │   ├── ChatBotEnhanced.tsx # Composant principal
│   │   ├── 📁 hr/             # Composants RH spécialisés
│   │   ├── 📁 mobile/         # Interface mobile
│   │   └── 📁 ui/             # Composants UI réutilisables
│   ├── App.tsx                # Point d'entrée principal
│   └── index.css              # Styles globaux
├── 📁 hooks/                  # Hooks personnalisés
│   ├── useAuth.ts             # Gestion authentification
│   ├── useSocket.ts           # Communication temps réel
│   ├── useAntibia.ts          # Intégration Antibia
│   ├── useLeaves.ts           # Gestion des congés
│   ├── useHealthCheck.ts      # Vérification santé
│   └── useRateLimit.ts        # Limitation de taux
├── 📁 utils/                  # Utilitaires
├── 📁 types/                  # Types TypeScript
└── 📁 pages/                  # Pages Next.js
```

### Hooks personnalisés

L'application utilise une architecture modulaire avec des hooks spécialisés :

- **`useAuth`** - Gestion de l'authentification utilisateur
- **`useSocket`** - Communication WebSocket temps réel
- **`useAntibia`** - Intégration avec le système RH Antibia
- **`useLeaves`** - Gestion spécialisée des congés
- **`useHealthCheck`** - Monitoring de la santé du système
- **`useRateLimit`** - Contrôle de la limitation de taux

## 🚀 Installation et démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone <repository-url>
cd chatbot-rh-frontend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés API
```

### Variables d'environnement
```env
# API Configuration
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_key
NEXT_PUBLIC_ANTIBIA_API_URL=your_antibia_url
NEXT_PUBLIC_SOCKET_URL=your_socket_server_url

# Application Configuration
NEXT_PUBLIC_APP_NAME=ChatBot RH
NEXT_PUBLIC_COMPANY_NAME=Votre Entreprise
```

### Démarrage
```bash
# Mode développement
npm run dev

# Build de production
npm run build
npm start

# Linting
npm run lint
```

L'application sera accessible sur `http://localhost:3000`

## 🎨 Interface utilisateur

### Desktop
- Interface chat principale avec sidebar
- Panneau d'actions rapides RH
- Système de notifications
- Mode minimisé/maximisé

### Mobile
- Interface optimisée tactile
- Navigation simplifiée
- Mode plein écran
- Gestes intuitifs

## 🔧 Configuration

### ESLint
Configuration stricte avec règles Next.js et TypeScript

### TypeScript
Configuration stricte pour une meilleure qualité de code

### Tailwind CSS
Utilitaires CSS pour un design cohérent et responsive

## 📱 Responsive Design

L'application s'adapte automatiquement :
- **Desktop** : Interface complète avec sidebar
- **Tablet** : Interface adaptée tactile
- **Mobile** : Interface optimisée mobile

## 🔒 Sécurité

- Authentification sécurisée
- Validation des données côté client
- Sanitisation des entrées utilisateur
- Gestion sécurisée des tokens

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence privée - voir le fichier [LICENSE](LICENSE) pour plus de détails.
