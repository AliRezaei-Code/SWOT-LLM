import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Chat } from "@/routes/Chat";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Layout>
  );
};

export default App;
