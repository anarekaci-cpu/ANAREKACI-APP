-- Tables pour le système de messagerie interne

-- Table conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titre VARCHAR(255),
  cree_par UUID REFERENCES auth.users(id),
  cree_le TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modifie_le TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table conversation_participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  membre_id UUID REFERENCES membres(id) ON DELETE CASCADE,
  ajoute_le TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, membre_id)
);

-- Table messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  envoye_par UUID REFERENCES membres(id),
  contenu TEXT NOT NULL,
  date_envoi TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lu BOOLEAN DEFAULT FALSE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_envoye_par ON messages(envoye_par);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_membre ON conversation_participants(membre_id);
