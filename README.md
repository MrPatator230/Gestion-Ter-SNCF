## Introduction : 

Voici mon projet que j'ai commencé il y a deux mois : un système de gestion de circulations des trains ! 

Ce projet peut s'installer sur Ubuntu CLI, Windows (via Laragon ou WSL Ubuntu)

## Installation Ubuntu (la plus facile)

   # Prérequis

Des tutos sont disponibles entre parenthèses pour pouvoir l'installer (pour les personnes qui ne savent pas l'installer) : 

- Node.JS et NPM (Étape 1 : https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04)
- NVM (https://idroot.us/install-nvm-ubuntu-24-04/)
- Git (https://www.digitalocean.com/community/tutorials/how-to-install-git-on-ubuntu)

# Installation

Une fois les prérequis installés, télécharger le git : 

    git clone https://github.com/MrPatator230/SNCF-Ter-Gestion

[OPTIONNEL] Renommez le dossier : 

    mv SNCF-Ter-Gestion (nom que vous voulez)

Puis ensuite ce diriger sur le dossier : 

    cd [nom de votre dossier ]
    cd SNCF-Ter-Gestion

En étant dans le dossier, on fait : 

    npm install && npm run dev


Enfin, l'url du projet s'affiche sur votre CLI.



## Installation avec Windows

#Prérequis

- Installer laragon
- Node (fichiers binaires)(installation dans laragon : https://dev.to/fullstackhardev/how-to-add-new-node-version-to-laragon-5hjh)

# Installation : 

- Télécharger le code source via Github (bouton vert)
- Glisser le contenu du dossier dans un dossier créé sur C:/laragon/www/(nom du projet)/contenu de l'app)
- Démarrer Laragon
- Ouvrir Terminal
- Aller au dossier créé précédemment:

      cd (nom du projet)
      npm install && npm run dev

- Aller sur http://localhost:3000

## CONNEXION A L'ESPACE ADMIN  :

- username : admin
- Password : admin
  
## CONTACTS :

**En cas de problèmes dans l'installation du logiciel, écrire dans le canal Issues**
