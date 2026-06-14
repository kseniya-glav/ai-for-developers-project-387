import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { EventTypesPage } from "@/pages/EventTypesPage";
import { BookingsPage } from "@/pages/BookingsPage";
import { OwnerPage } from "@/pages/OwnerPage";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<EventTypesPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/owner" element={<OwnerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
