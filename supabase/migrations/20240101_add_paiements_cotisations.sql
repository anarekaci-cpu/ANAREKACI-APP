-- Migration: Ajout des tables pour la gestion des paiements et cotisations
-- Date: 2024-01-01

-- 1. Mise à jour de la table membres pour ajouter les nouveaux champs
ALTER TABLE membres
ADD COLUMN IF NOT EXISTS numero_membre TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS nom TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS prenoms TEXT,
ADD COLUMN IF NOT EXISTS sexe TEXT CHECK (sexe IN ('homme', 'femme')),
ADD COLUMN IF NOT EXISTS commune_quartier TEXT,
ADD COLUMN IF NOT EXISTS type_activite TEXT;

-- Migration des données existantes: séparer nom_complet en nom et prenoms
UPDATE membres
SET 
  nom = SPLIT_PART(nom_complet, ' ', 1),
  prenoms = SUBSTRING(nom_complet FROM POSITION(' ' IN nom_complet) + 1)
WHERE nom = '' OR nom IS NULL;

-- 2. Table pour le droit d'inscription
CREATE TABLE IF NOT EXISTS droits_inscription (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  membre_id UUID REFERENCES membres(id) ON DELETE CASCADE NOT NULL,
  statut TEXT NOT NULL DEFAULT 'non_paye' CHECK (statut IN ('non_paye', 'en_attente_validation', 'paye', 'refuse')),
  montant INTEGER NOT NULL DEFAULT 2000, -- Montant par défaut en FCFA
  date_paiement TIMESTAMP WITH TIME ZONE,
  date_validation TIMESTAMP WITH TIME ZONE,
  valide_par UUID REFERENCES membres(id),
  motif_refus TEXT,
  cree_le TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table pour les cotisations mensuelles
CREATE TABLE IF NOT EXISTS cotisations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  membre_id UUID REFERENCES membres(id) ON DELETE CASCADE NOT NULL,
  annee INTEGER NOT NULL,
  mois INTEGER NOT NULL CHECK (mois BETWEEN 1 AND 12),
  statut TEXT NOT NULL DEFAULT 'non_paye' CHECK (statut IN ('non_paye', 'paye')),
  montant INTEGER NOT NULL DEFAULT 2000, -- Montant mensuel par défaut en FCFA
  date_paiement TIMESTAMP WITH TIME ZONE,
  cree_le TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(membre_id, annee, mois)
);

-- 4. Table pour l'historique des paiements
CREATE TABLE IF NOT EXISTS paiements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  membre_id UUID REFERENCES membres(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('droit_inscription', 'cotisation')),
  montant INTEGER NOT NULL,
  methode TEXT NOT NULL CHECK (methode IN ('mobile_money', 'especes', 'virement', 'autre')),
  reference TEXT,
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide', 'refuse')),
  date_paiement TIMESTAMP WITH TIME ZONE,
  date_validation TIMESTAMP WITH TIME ZONE,
  valide_par UUID REFERENCES membres(id),
  cree_le TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_droits_inscription_membre ON droits_inscription(membre_id);
CREATE INDEX IF NOT EXISTS idx_droits_inscription_statut ON droits_inscription(statut);
CREATE INDEX IF NOT EXISTS idx_cotisations_membre ON cotisations(membre_id);
CREATE INDEX IF NOT EXISTS idx_cotisations_periode ON cotisations(annee, mois);
CREATE INDEX IF NOT EXISTS idx_cotisations_statut ON cotisations(statut);
CREATE INDEX IF NOT EXISTS idx_paiements_membre ON paiements(membre_id);
CREATE INDEX IF NOT EXISTS idx_paiements_statut ON paiements(statut);

-- 6. Trigger pour créer automatiquement un droit d'inscription lors de la création d'un membre
CREATE OR REPLACE FUNCTION creer_droit_inscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO droits_inscription (membre_id, statut, montant)
  VALUES (NEW.id, 'non_paye', 10000);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_creer_droit_inscription ON membres;
CREATE TRIGGER trigger_creer_droit_inscription
AFTER INSERT ON membres
FOR EACH ROW
EXECUTE FUNCTION creer_droit_inscription();

-- 7. Trigger pour créer automatiquement les cotisations mensuelles pour l'année courante
CREATE OR REPLACE FUNCTION creer_cotisations_mensuelles()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer les cotisations pour les 12 mois de l'année courante
  INSERT INTO cotisations (membre_id, annee, mois, statut, montant)
  SELECT 
    NEW.id, 
    EXTRACT(YEAR FROM NOW())::INTEGER, 
    generate_series, 
    'non_paye',
    1000
  FROM generate_series(1, 12);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_creer_cotisations_mensuelles ON membres;
CREATE TRIGGER trigger_creer_cotisations_mensuelles
AFTER INSERT ON membres
FOR EACH ROW
EXECUTE FUNCTION creer_cotisations_mensuelles();

-- 8. Row Level Security (RLS)
ALTER TABLE droits_inscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;

-- RLS pour droits_inscription
CREATE POLICY "Les membres peuvent voir leur propre droit d'inscription"
ON droits_inscription FOR SELECT
USING (
  membre_id = (SELECT id FROM membres WHERE compte_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM membres 
    WHERE compte_id = auth.uid() 
    AND role IN ('admin', 'bureau', 'tresorier')
  )
);

CREATE POLICY "Les admins peuvent modifier les droits d'inscription"
ON droits_inscription FOR ALL
USING (EXISTS (
  SELECT 1 FROM membres 
  WHERE compte_id = auth.uid() 
  AND role IN ('admin', 'bureau', 'tresorier')
));

-- RLS pour cotisations
CREATE POLICY "Les membres peuvent voir leurs propres cotisations"
ON cotisations FOR SELECT
USING (
  membre_id = (SELECT id FROM membres WHERE compte_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM membres 
    WHERE compte_id = auth.uid() 
    AND role IN ('admin', 'bureau', 'tresorier')
  )
);

CREATE POLICY "Les admins peuvent modifier les cotisations"
ON cotisations FOR ALL
USING (EXISTS (
  SELECT 1 FROM membres 
  WHERE compte_id = auth.uid() 
  AND role IN ('admin', 'bureau', 'tresorier')
));

-- RLS pour paiements
CREATE POLICY "Les membres peuvent voir leurs propres paiements"
ON paiements FOR SELECT
USING (
  membre_id = (SELECT id FROM membres WHERE compte_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM membres 
    WHERE compte_id = auth.uid() 
    AND role IN ('admin', 'bureau', 'tresorier')
  )
);

CREATE POLICY "Les membres peuvent créer leurs propres paiements"
ON paiements FOR INSERT
WITH CHECK (
  membre_id = (SELECT id FROM membres WHERE compte_id = auth.uid())
);

CREATE POLICY "Les admins peuvent modifier les paiements"
ON paiements FOR ALL
USING (EXISTS (
  SELECT 1 FROM membres 
  WHERE compte_id = auth.uid() 
  AND role IN ('admin', 'bureau', 'tresorier')
));
