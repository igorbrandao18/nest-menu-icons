-- Primeiro adiciona a coluna como nullable
ALTER TABLE "menu_icons" ADD COLUMN "importPath" TEXT;

-- Atualiza os registros existentes baseado no prefixo do ícone
UPDATE "menu_icons" 
SET "importPath" = 
  CASE 
    WHEN "icon" LIKE 'Md%' THEN 'react-icons/md'
    WHEN "icon" LIKE 'Fa%' THEN 'react-icons/fa'
    WHEN "icon" LIKE 'Bs%' THEN 'react-icons/bs'
    ELSE 'react-icons/md'  -- valor padrão caso não encontre um prefixo conhecido
  END;

-- Torna a coluna NOT NULL após atualizar os dados
ALTER TABLE "menu_icons" ALTER COLUMN "importPath" SET NOT NULL; 