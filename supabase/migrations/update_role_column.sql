-- Mettre à jour le champ role pour accepter les nouvelles valeurs

-- D'abord, vérifier si le type enum existe, sinon le créer
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membre_role') THEN
        CREATE TYPE membre_role AS ENUM ('membre', 'tresorier', 'secretaire', 'bureau', 'admin');
    END IF;
END $$;

-- Désactiver RLS temporairement
ALTER TABLE membres DISABLE ROW LEVEL SECURITY;

-- Supprimer la politique qui dépend de la colonne role
DROP POLICY IF EXISTS membre_modifie_sa_fiche ON membres;

-- Supprimer la contrainte CHECK existante si elle existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_role_valid' 
        AND conrelid = 'membres'::regclass
    ) THEN
        ALTER TABLE membres DROP CONSTRAINT check_role_valid;
    END IF;
END $$;

-- Supprimer la valeur par défaut existante
ALTER TABLE membres ALTER COLUMN role DROP DEFAULT;

-- Modifier la colonne role pour utiliser le nouveau type
ALTER TABLE membres 
ALTER COLUMN role TYPE membre_role 
USING role::text::membre_role;

-- Définir la nouvelle valeur par défaut
ALTER TABLE membres 
ALTER COLUMN role SET DEFAULT 'membre';

-- Ajouter une contrainte CHECK pour s'assurer que seules ces valeurs sont acceptées
ALTER TABLE membres 
ADD CONSTRAINT check_role_valid 
CHECK (role IN ('membre', 'tresorier', 'secretaire', 'bureau', 'admin'));

-- Recréer la politique RLS avec le nouveau type
CREATE POLICY membre_modifie_sa_fiche ON membres
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = compte_id)
  WITH CHECK (auth.uid() = compte_id);

-- Réactiver RLS
ALTER TABLE membres ENABLE ROW LEVEL SECURITY;
