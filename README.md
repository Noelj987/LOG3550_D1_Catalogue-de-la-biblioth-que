# Catalogue de la bibliothèque — LOG3550, devoir 1

Frontend de catalogue réalisé en HTML, CSS et JavaScript natifs, sans framework. Il permet de rechercher, filtrer, trier, ajouter et supprimer des livres. Les changements sont sauvegardés dans le stockage local du navigateur.

## Utilisation

Ouvrir `index.html` dans un navigateur récent. Aucune installation ni compilation n’est nécessaire. Les ajouts et suppressions sont conservés dans `localStorage`; le bouton **Réinitialiser les données** restaure les neuf livres initiaux.

## Organisation

- `index.html` : structure sémantique et formulaire.
- `css/styles.css` : palette, cartes adaptatives et états d’interaction.
- `js/data.js` : catalogue initial.
- `js/app.js` : affichage, recherche, filtres, tri, validation et persistance.

## Choix de conception

Les éléments `header`, `nav`, `main`, `section` et `footer` donnent un sens clair aux zones de la page.
Les technologies d’assistance peuvent ainsi mieux identifier la navigation, le contenu principal et ses sections.
Les régions et champs possèdent des noms ou des descriptions liés, ce qui facilite l’utilisation au clavier et avec un lecteur d’écran.
Les moteurs de recherche comprennent mieux une structure bien hiérarchisée, notamment les titres.
Un balisage explicite rend le code plus facile à parcourir et à maintenir.

La recherche normalise les accents et la casse avant de comparer le titre et l’auteur.
`filter` construit les résultats qui satisfont ensemble la recherche, la catégorie et la disponibilité.
`map` transforme chaque élément d’un tableau et retourne un nouveau tableau de même longueur.
`forEach` exécute une action pour chaque élément sans produire de tableau de résultats; il sert ici à créer les cartes.
Le tri est appliqué aux résultats filtrés et n’altère pas le tableau de livres d’origine.

La mise en page est mobile d’abord : une colonne sur téléphone, deux à partir de 38rem et trois à partir de 60rem. Les erreurs des champs sont associées aux contrôles et annoncées aux lecteurs d’écran. Le catalogue est construit avec le DOM et `textContent` plutôt qu’en injectant du HTML fourni par les champs.

## Vérifications et remise

- Vérifier le HTML avec le [validateur W3C](https://validator.w3.org/) et enregistrer une capture d’écran des résultats.
- Joindre trois captures de la page dans un navigateur : écran large, tablette et téléphone.

Lien du dépôt Git : **à compléter avec l’URL de votre dépôt**.
## Sources et outils d’assistance

Aucune bibliothèque ou framework externe n’est utilisé. Les seules sources de contenu du catalogue sont des exemples saisis pour ce devoir. Outils : Visual Studio Code et assistance de Copilot (assistant IA) pour la mise en œuvre et la relecture; le HTML doit encore être validé et les captures doivent être réalisées dans votre navigateur avant la remise.
