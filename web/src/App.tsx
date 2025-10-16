import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/routes/Dashboard";
import { DraftWorkspace } from "@/routes/DraftWorkspace";
import { Telemetry } from "@/routes/Telemetry";
import { DailyRuns } from "@/routes/DailyRuns";
import { Records } from "@/routes/Records";
import { Templates } from "@/routes/Templates";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/draft" element={<DraftWorkspace />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/telemetry" element={<Telemetry />} />
        <Route path="/daily-runs" element={<DailyRuns />} />
        <Route path="/records" element={<Records />} />
      </Routes>
    </Layout>
  );
};

export default App;
