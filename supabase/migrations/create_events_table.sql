-- Table pour la gestion des événements

CREATE TABLE IF NOT EXISTS evenements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  lieu VARCHAR(255),
  date_debut TIMESTAMP WITH TIME ZONE NOT NULL,
  date_fin TIMESTAMP WITH TIME ZONE,
  type VARCHAR(50) DEFAULT 'evenement', -- 'reunion', 'assemblee', 'formation', 'evenement'
  cree_par UUID REFERENCES auth.users(id),
  cree_le TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_evenements_date_debut ON evenements(date_debut DESC);
CREATE INDEX IF NOT EXISTS idx_evenements_type ON evenements(type);
