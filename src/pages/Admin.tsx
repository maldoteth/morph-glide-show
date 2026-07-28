import { Navigate } from "react-router-dom";
import SeoHead from "@/components/SeoHead";

export default function Admin() {
  return (
    <>
      <SeoHead
        title="Admin | Pixcellor"
        description="Internal Pixcellor admin area."
        path="/admin"
        noindex
      />
      <Navigate to="/portal" replace />
    </>
  );
}
