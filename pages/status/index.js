import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <StatusContent />
    </>
  );
}

function StatusContent() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let content = "Carregando...";

  if (!isLoading && data) {
    const formattedTimestamp = new Date(data.updated_at).toLocaleString(
      "pt-br",
    );
    const databaseInfo = data.dependencies.database;

    content = `Atualizado em: ${formattedTimestamp}
    Versão do Banco de Dados: ${databaseInfo.version}
    Número Máximo de Conexões: ${databaseInfo.max_connections}
    Conexões Abertas: ${databaseInfo.opened_connections}`;
  }

  return (
    <div
      style={{
        whiteSpace: "pre-line",
      }}
    >
      {" "}
      {content}
    </div>
  );
}

export default StatusPage;
