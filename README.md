# ChatBot IA avec Next.js

Ce projet est un chatbot IA élégant et fonctionnel développé avec Next.js, React et TypeScript. Il utilise l'API OpenRouter pour générer des réponses dynamiques basées sur l'intelligence artificielle.

## Fonctionnalités

- Interface utilisateur moderne avec React et CSS
- Intégration de l'API OpenRouter pour les réponses IA
- Gestion de l'état avec les hooks React (useState, useEffect, useRef)
- Design responsive et accessible
- Gestion des erreurs d'API
- Historique des conversations

## Migration de Vite vers Next.js

Ce projet a été migré de Vite vers Next.js pour bénéficier des fonctionnalités avancées de Next.js telles que le rendu côté serveur, le routage intégré et l'optimisation automatique.

## Technologies utilisées

- Next.js 15
- React 19
- TypeScript
- CSS (avec Google Fonts et Material Symbols)

## Installation

1. Clonez le dépôt
2. Installez les dépendances : `npm install`
3. Configurez les variables d'environnement (voir section ci-dessous)
4. Démarrez le serveur de développement : `npm run dev`

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
NEXT_PUBLIC_API_KEY=votre_cle_api_openrouter
NEXT_PUBLIC_API_URL=https://openrouter.ai/api/v1/chat/completions
NEXT_PUBLIC_MODEL_NAME=le_nom_du_modèle_à_utiliser
```

## Utilisation

1. Ouvrez l'application dans votre navigateur
2. Cliquez sur l'icône du chatbot pour ouvrir la fenêtre de discussion
3. Tapez votre message dans le champ de saisie
4. Le chatbot répondra avec une réponse générée par IA

## Structure du projet

- `pages/` : Pages Next.js
- `src/components/` : Composants React réutilisables
- `src/assets/` : Ressources statiques
- `src/` : Fichiers principaux de l'application

## Déploiement

Pour créer une version de production :

```bash
npm run build
```

Pour démarrer le serveur de production :

```bash
npm start
```

## Projet digne d'un portfolio

Ce chatbot est un excellent ajout à votre portfolio, démontrant vos compétences en React, Next.js, TypeScript, intégration d'API et design d'interface utilisateur.