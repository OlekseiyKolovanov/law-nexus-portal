import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Leadership from "./pages/Leadership";
import Laws from "./pages/Laws";
import LegalSchool from "./pages/LegalSchool";
import Tenders from "./pages/Tenders";
import Lawyers from "./pages/Lawyers";
import Enterprises from "./pages/Enterprises";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/leadership" element={<Leadership />} />
          <Route path="/laws" element={<Laws />} />
          <Route path="/legal-school" element={<LegalSchool />} />
          <Route path="/tenders" element={<Tenders />} />
          <Route path="/lawyers" element={<Lawyers />} />
          <Route path="/enterprises" element={<Enterprises />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
