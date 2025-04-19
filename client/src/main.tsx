import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { GameProvider } from "./context/GameContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

const Main = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <App />
      </GameProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<Main />);
