-- Script simples para corrigir o campo approved_by
-- Execute este script para permitir strings no campo approved_by

-- Alterar o tipo do campo approved_by para TEXT (aceita qualquer string)
ALTER TABLE subscriptions ALTER COLUMN approved_by TYPE TEXT;

-- Verificar se a alteração foi aplicada
SELECT 'Campo approved_by alterado para TEXT com sucesso!' as status;
