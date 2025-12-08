export const TAG_CATEGORIES = [
    'Ville',
    'Compétences',
    'Secteur d\'activité',
    'Poste',
    'Taille d\'entreprise',
    'Entreprise',
    'Type de relation',
    'Statut',
    'Non classée'
] as const;

export type TagCategory = typeof TAG_CATEGORIES[number];
