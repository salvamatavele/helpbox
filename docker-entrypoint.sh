#!/bin/sh
set -e

echo "=========================================================="
echo "🛡️  Helpbox - A iniciar serviço em contentor Docker..."
echo "=========================================================="

# Esperar que o MariaDB esteja pronto a aceitar ligações
echo "⏳ A aguardar conectividade com a base de dados MariaDB..."
node -e '
const net = require("net");
const connectionString = process.env.DATABASE_URL || "mysql://helpbox_user:helpbox_password@mariadb:3306/helpbox_db";
try {
  const url = new URL(connectionString);
  const host = url.hostname;
  const port = parseInt(url.port || "3306", 10);
  let attempts = 0;

  function tryConnect() {
    attempts++;
    const s = net.createConnection(port, host, () => {
      console.log("✓ MariaDB acessível na porta " + port);
      s.end();
      process.exit(0);
    });
    s.on("error", () => {
      if (attempts >= 40) {
        console.error("❌ Tempo limite esgotado a aguardar pelo MariaDB (" + host + ":" + port + ")");
        process.exit(1);
      }
      setTimeout(tryConnect, 2000);
    });
  }
  tryConnect();
} catch (e) {
  console.log("Avançando verificação directa...");
  process.exit(0);
}
'

echo "🚀 A aplicar o esquema da base de dados (prisma db push)..."
npx prisma db push --accept-data-loss

echo "🌱 A executar o seed de dados (administrador e departamentos)..."
npx prisma db seed

echo "✨ Base de dados pronta com sucesso!"
echo "🌐 A iniciar servidor Helpbox Next.js na porta 3000..."
exec "$@"
