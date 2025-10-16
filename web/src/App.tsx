import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/routes/Dashboard";
import { DraftWorkspace } from "@/routes/DraftWorkspace";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/draft" element={<DraftWorkspace />} />
      </Routes>
    </Layout>
  );
};

export default App;
