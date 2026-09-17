# Site du SEC

Site statique (HTML/CSS/JS vanilla, **aucune étape de build**), bilingue FR/EN, pensé pour être maintenu par un Bureau qui change chaque année sans compétence technique particulière.

## Structure

```
/fr/, /en/          pages du site, une par langue (même arborescence des deux côtés)
/assets/css/        feuille de style unique
/assets/js/         i18n-strings.js (textes de menu/pied de page), partials.js (en-tête/pied de page),
                    blog.js, petitions.js, members.js, contact.js
/content/*.json     contenu éditable : blog.json, petitions.json, members.json
/admin/             interface d'édition no-code (Decap CMS), voir plus bas
```

Chaque billet de blog / pétition contient ses champs FR et EN dans la même entrée : impossible de publier dans une seule langue.

## Étapes restantes (à faire par vous, hors de portée d'un agent)

### 1. Créer le dépôt GitHub et activer GitHub Pages
1. Créez un dépôt GitHub (public, gratuit) et poussez ce dossier dedans.
2. Dans **Settings → Pages**, choisissez la branche `main` et le dossier `/ (root)`.
3. Le site sera servi sur `https://<votre-compte>.github.io/<repo>/`. Si vous voulez un domaine à la racine (`secetudiant.fr` par exemple, ~10€/an) et que vous préférez éviter le sous-dossier `/repo/`, configurez un domaine personnalisé dans les mêmes réglages — sinon il faudra préfixer tous les liens absolus (`/fr/...`) de ce projet par `/<repo>/`.

### 2. Formulaire de contact (Formspree)
1. Créez un compte gratuit sur [formspree.io](https://formspree.io) avec `syndicatdesetudiantsencommerce@gmail.com`.
2. Créez un formulaire, récupérez son URL (`https://formspree.io/f/xxxxxxxx`).
3. Remplacez `REPLACE_ME` dans `fr/contact.html` et `en/contact.html` (attribut `action` du `<form>`) par cette URL.

### 3. Éditeur no-code (Decap CMS)
Decap CMS a besoin d'une passerelle OAuth pour se connecter à GitHub en votre nom. Options gratuites :
- Une petite fonction serverless (ex. Cloudflare Worker gratuit) suivant [ce guide officiel](https://decapcms.org/docs/backends-overview/#github-backend).
- Ou un proxy public déjà existant, si vous en trouvez un maintenu (à vérifier avant de faire confiance à un tiers avec vos identifiants).

Une fois la passerelle en place, remplacez `REPLACE_ME/REPLACE_ME` dans `admin/config.yml` par `<votre-compte>/<nom-du-repo>` et ajoutez les champs `auth_endpoint`/`base_url` requis par votre passerelle.

Dites-moi si vous voulez que je génère un script d'installation pas-à-pas (`/wizard`) pour cette étape le moment venu.

### 4. Configurer une pétition (Google Forms + Sheets)
Pour **chaque** pétition :
1. Créez un Google Form avec 3 questions : nom, e-mail, "Je souhaite rester anonyme" (case à cocher).
2. Dans le formulaire, ouvrez le code source de la page (ou utilisez un outil comme "Form ID extractor") pour récupérer :
   - l'URL d'action (se termine par `/formResponse`),
   - le nom `entry.XXXXXXX` de chaque champ.
3. Liez le formulaire à une feuille Google Sheets (réponses), puis **Fichier → Partager → Publier sur le web**, format **CSV**, et copiez le lien obtenu.
4. Dans `/admin`, créez ou éditez la pétition et collez ces informations dans les champs prévus (`google_form_action`, `entry_name`, `entry_email`, `entry_anonymous`, `sheet_csv_url`).

Tant que ces champs sont vides, le site affiche "Compteur bientôt disponible" et un message clair au lieu de planter — vous pouvez publier une pétition sans backend configuré et le finaliser plus tard.

### 5. Immatriculation
Les mentions légales indiquent "association en cours de déclaration". Une fois le récépissé de la préfecture et le numéro RNA obtenus, mettez à jour `fr/legal-notice.html` et `en/legal-notice.html`.

## Développement local

Aucun outil requis. Pour prévisualiser avec les bons chemins absolus (`/fr/...`), servez le dossier avec n'importe quel serveur statique, par exemple (PowerShell, sans dépendance) :

```powershell
$http = [System.Net.HttpListener]::new()
$http.Prefixes.Add("http://localhost:8080/")
$http.Start()
```

(voir le script `scripts/dev-server.ps1` si présent, ou demandez à votre agent de le relancer).

## Ce qui a été délibérément laissé simple

- Pas de framework, pas de bundler : zéro dépendance à mettre à jour, zéro build qui peut casser.
- Le contenu (blog/pétitions/membres) est dans des fichiers JSON à la racine de `content/`, lisibles et modifiables à la main si besoin, même sans passer par `/admin`.
