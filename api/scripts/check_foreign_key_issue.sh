#!/bin/bash

# Script para diagnosticar o problema de chave estrangeira
# Executar: bash check_foreign_key_issue.sh

echo "=== Diagnóstico de Foreign Key - Tabela configuracoes ==="
echo

# Verificar se MySQL está disponível
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL não está instalado ou não está no PATH"
    exit 1
fi

echo "1. Verificando tabelas existentes:"
mysql -u root -p -e "
SELECT table_name
FROM information_schema.tables
WHERE table_schema = DATABASE()
AND table_name IN ('user', 'users', 'configuracoes');
" 2>/dev/null || echo "⚠️  Não foi possível conectar ao MySQL"

echo
echo "2. Verificando estrutura da tabela user/users:"
mysql -u root -p -e "
SHOW CREATE TABLE user;
" 2>/dev/null || mysql -u root -p -e "
SHOW CREATE TABLE users;
" 2>/dev/null || echo "⚠️  Nenhuma tabela 'user' ou 'users' encontrada"

echo
echo "3. Verificando engines e charset:"
mysql -u root -p -e "
SHOW VARIABLES LIKE 'default_storage_engine';
SHOW VARIABLES LIKE 'character_set_database';
" 2>/dev/null || echo "⚠️  Não foi possível verificar configurações"

echo
echo "4. Verificando se há dados que violariam a constraint:"
mysql -u root -p -e "
SELECT COUNT(*) as total_users FROM user;
" 2>/dev/null || echo "⚠️  Não foi possível contar usuários"

echo
echo "=== Sugestões de Solução ==="
echo "• Verifique se a tabela user/users existe e tem uma coluna 'id'"
echo "• Certifique-se de que ambas as tabelas usam o mesmo engine (InnoDB)"
echo "• Verifique se os charset são compatíveis"
echo "• Execute a migration sem a constraint primeiro, depois adicione manualmente"
echo
echo "Para executar a migration sem constraint:"
echo "mysql -u root -p < /Users/danielcarvalho/Projetos/indiqxclub/api/scripts/create_configuracoes_table_final.sql"
