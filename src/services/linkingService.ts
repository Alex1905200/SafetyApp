import { supabase } from "../config/supabase";

// Generar código aleatorio de 6 caracteres
const generateLinkCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const linkingService = {
  async generateLinkCode(parentId: string): Promise<{ code: string | null; error: any }> {
    try {
      // Por ahora, generar código localmente (sin BD)
      const code = generateLinkCode();
      console.log("📱 Código generado:", code);
      return { code, error: null };
    } catch (error) {
      console.error("Error generating link code:", error);
      return { code: null, error };
    }
  },

  async requestLinkWithCode(
    childId: string,
    code: string
  ): Promise<{ success: boolean; parentName?: string; error: any }> {
    try {
      // Simulación - en producción buscar en BD
      console.log("📱 Solicitando vinculación con código:", code);
      return { 
        success: true, 
        parentName: "Padre/Tutor",
        error: null 
      };
    } catch (error) {
      console.error("Error requesting link:", error);
      return { success: false, error };
    }
  },

  async approveLink(parentId: string, childId: string): Promise<{ success: boolean; error: any }> {
    try {
      console.log("✅ Vinculación aprobada:", { parentId, childId });
      return { success: true, error: null };
    } catch (error) {
      console.error("Error approving link:", error);
      return { success: false, error };
    }
  },

  async rejectLink(parentId: string, childId: string): Promise<{ success: boolean; error: any }> {
    try {
      console.log("❌ Vinculación rechazada:", { parentId, childId });
      return { success: true, error: null };
    } catch (error) {
      console.error("Error rejecting link:", error);
      return { success: false, error };
    }
  },

  async getChildLinkStatus(childId: string): Promise<{
    status: "none" | "pending" | "linked";
    parent?: { id: string; name: string; email: string };
    error: any;
  }> {
    try {
      // Por ahora retornar sin vinculación
      return { status: "none", error: null };
    } catch (error) {
      console.error("Error getting link status:", error);
      return { status: "none", error };
    }
  },

  async getPendingRequests(parentId: string): Promise<{
    requests: Array<{ id: string; childId: string; childName: string; childEmail?: string; createdAt: string }>;
    error: any;
  }> {
    try {
      // Por ahora retornar vacío
      return { requests: [], error: null };
    } catch (error) {
      console.error("Error getting pending requests:", error);
      return { requests: [], error };
    }
  },

  async getLinkedChildren(parentId: string): Promise<{
    children: Array<{ id: string; name: string; email: string; linkedAt: string }>;
    error: any;
  }> {
    try {
      // Por ahora retornar vacío
      return { children: [], error: null };
    } catch (error) {
      console.error("Error getting linked children:", error);
      return { children: [], error };
    }
  },
};
