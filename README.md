# Etude sur l'activité électrique du cerveau

![Image](https://github.com/lowlighter/brain/blob/master/miscelleanous/imgs/alayer.png)
Projet de M1 (semestre 2)
* Interface principale
    * [A-Layer](https://github.com/lowlighter/brain/tree/master/alayer)
* Etude du marché et des casques EEG
    * Casques plus performants à prix abordable
* Reconnaissance des émotions et utilisation du casque
    * [Corrélation entre ML et EEG](https://github.com/lowlighter/brain/tree/master/emotions)
    * [Enregistrement de l'activité cérébrale](https://github.com/lowlighter/brain/tree/master/recording)
    * [Entraînement de commande cérébrales (personnalisé)](https://github.com/lowlighter/brain/tree/master/training2)
    * [Entraînement de commande cérébrales (cortex api)](https://github.com/lowlighter/brain/tree/master/training)
    * [Visualisation de l'activité d'un auto-encodeur](https://github.com/lowlighter/brain/tree/master/prediction)
* Démonstrateurs
    * [Pong](https://github.com/lowlighter/brain/tree/master/pong)
    * [Kawashima](https://github.com/lowlighter/brain/tree/master/kawashima)
    * [Brain battle (v1)](https://github.com/lowlighter/brain/tree/master/battle1)
    * Brain battle (v2)
    * [Contrôle du drone Parrot](https://github.com/lowlighter/brain/tree/master/parrot)
    * [Cube field](https://github.com/lowlighter/brain/tree/master/cubefield)
    * [Shifumi (pierre-papier-ciseaux)](https://github.com/lowlighter/brain/tree/master/shifumi)
* Divers
    * [Utilisation de l'API Cortex](https://github.com/lowlighter/brain/tree/master/miscelleanous/cortex)
    * [Scanner de casques EEG](https://github.com/lowlighter/brain/tree/master/miscelleanous/scanner)
    * [Autres](https://github.com/lowlighter/brain/tree/master/miscelleanous)


## Usage

Commencez par éditer le fichier [`alayer/index.js`](https://github.com/lowlighter/brain/blob/master/alayer/index.js#L14) afin d'y rentrer les identifiants de vos casques Emotiv INSIGHT. Le support de plus de deux casques n'est pas garantie.

Ensuite, depuis la racine du projet, exécutez la commande suivante depuis un invite de commande :
```
npm start
```
Les dépendances de chaque module seront automatiquement ajoutées et le serveur principal sera également démarré.
Ouvrez ensuite votre navigateur et rendez vous sur la page `localhost:3000`, où vous pourrez accéder à tous les démonstrateurs !

### *Notes*
*Par défaut, l'application utilise le port 3000 pour le serveur web et le port 3001 pour le serveur websockets.*

*La machine doit être équipée de **NodeJS** de **npm** ainsi que de [**Cortex UI**](https://www.emotiv.com/developer/). Certaines applications recquiert également la présence d'un environemment **Python 3** avec une suite logiciel de deep learning.*

### A propos des applications disponibles

Vous pouvez à tout moment cliquer sur les boites d'aide disposées en haut à droite de votre écran pour obtenir de l'aide sur l'application qui est affichée actuellement.

Pour utiliser le contrôle d'un drône parrot, vous devez vous connecter à son réseau.

Il est préférable d'instancier le programme de *Deep learning* en python dans une console à part plutôt que depuis l'interface web. Utiliser la commande suivante :
```
cd training2
py main.py
```

Pour démarrer un entrainement personnalisé depuis votre navigateur, tapez la commande suivante dans la console web :
```javascript
if (!ws) ws = new WebSocket("localhost:3001)
ws.send(JSON.stringify({action:"python_start", data:["neutre", "pierre", "papier", "ciseaux"]}))
```


### Usage avancée
Pour éviter de vérifier les dépendances de chaque modules vous pouvez exécuter la commande suivante pour démarrer le serveur principal.
```
node alayer
```

Il est possible de connecter le serveur principal à un serveur déjà existant (afin de partager les données des éventuels casques connectés à chacun des serveurs) en utilisant l'argument `server` suivi de l'addresse ip du serveur distant.
```
node alayer server=127.0.0.0
```

Si vous êtes développeur, pour afficher les messages d'erreurs dans la console node, vous pouvez utiliser l'argument `debug`.
```
node alayer debug=1
```

Les données envoyées par le serveur sont formattées sous la forme d'un tableau.
- Le premier élément indique l'identifiant de l'événement (`sys`, `dev`, `com`, `pow`, `met`, `fac`, `dev`, `hdw`, `inf`)
- Le second élement indique le casque qui a émis l'évenement ainsi que l'identifiant du serveur l'ayant envoyé (e.g. `"headset#F646A0472332"`). 
- Le reste constitue les données reçues. 
```javascript
ws.onmessage = event => {
   const data = JSON.parse(event.data)
   const type = d.shift()
   const headset = d.shift()
   //Exploitez ensuite le contenu de "data"
}
```

Consultez la [documentation de l'API Cortex](https://emotiv.github.io/cortex-docs/#event) pour plus d'infcormations sur les événements disponibles.

Deux nouveaux événements ont étés implémentés en plus de ceux proposés par Cortex.
- **hdw** : Hardware
```javascript
hdw[0] //Le casque 1 est connecté
hdw[1] //Le casque 2 est connecté
hdw[2] //Le drone parrot est connecté
hdw[3] //Casque de préférence*
hdw[4] //Les données du casque 1 sont reçues via un autre serveur
hdw[5] //Les données du casque 2 sont reçues via un autre serveur
hdw[6] //Le serveur distant est actif
hdw[7] //Le casque 3 est connecté
hdw[8] //Les données du casque 3 sont reçues via un autre serveur
```
- **inf** : Sortie console de l'instance python
```javascript
inf[0] //Canal de sortie `"out"` ou `"err"`
inf[1] //Sortie console

//Dans le cas d'un entrainement personnalisé :
inf[1] //Status (`"training"`, `"modeling"` ou `"prediction"`)
inf[2] //Action à entrainer ou prédite
```

# Sources et documentations

## Emotiv
* [Cortex documentation](https://emotiv.github.io/cortex-docs/)

## Expressions faciales
* [Modèles de choix discrets pour la reconnaissance des expressions faciales statiques](https://infoscience.epfl.ch/record/183003/files/ExpressionsFaciales.pdf)
* [Le Facial Action Coding System de Paul Ekman](http://www.la-communication-non-verbale.com/2013/03/facial-action-coding-system-6734.html)

## EEG
* [Bases neurophysiologiques et principes d’interprétation de l’électroencéphalogramme en réanimation](https://www.srlf.org/wp-content/uploads/2015/11/0710-Reanimation-Vol16-N6-p546_552.pdf)
* [Interprétation des signaux MEG-EEG](http://www.labos.upmc.fr/center-meg/media/meegirmf2003/BRNeurophysio.pdf)

## Casque
* [Performance of the Emotiv Epoc headset for P300-based applications](https://biomedical-engineering-online.biomedcentral.com/articles/10.1186/1475-925X-12-56)
* [Exemples de casques commercialisés](https://www.diygenius.com/hacking-your-brain-waves/)
* [DIY : MINI ARDUINO PORTABLE EEG - BRAIN WAVE MONITOR +](http://www.instructables.com/id/Mini-Arduino-Portable-EEG-Brain-Wave-Monitor-/)
* [DIY : EEG (AND ECG) CIRCUIT](http://www.instructables.com/id/DIY-EEG-and-ECG-Circuit/)

## Autres
* [Animation from blender into threejs](http://unboring.net/workflows/animation.html)
* [Create a Facial Animation Setup in Blender](https://cgi.tutsplus.com/tutorials/create-a-facial-animation-setup-in-blender-part-1--cg-32251)

# May the Force be with us...
![La force](https://github.com/lowlighter/brain/blob/master/miscelleanous/imgs/demo.png)
