import { supabase } from "../config/supabase";

type FamilyRole = "admin" | "member";

export const familyService = {
  async createFamilyGroup(name: string, createdBy: string) {
    try {
      const { data, error } = await (supabase as any)
        .from("family_groups")
        .insert({
          name,
          created_by: createdBy,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        await this.addFamilyMember(data.id, createdBy, "admin");
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error creating family group:", error);
      return { data: null, error };
    }
  },

  async addFamilyMember(
    groupId: string,
    userId: string,
    role: FamilyRole = "member",
  ) {
    try {
      const { data, error } = await supabase
        .from("family_members")
        .insert({
          group_id: groupId,
          user_id: userId,
          role,
          is_active: true,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error adding family member:", error);
      return { data: null, error };
    }
  },

  async getUserGroups(userId: string) {
    try {
      const { data, error } = await supabase
        .from("family_members")
        .select(
          `
          *,
          family_groups (*)
        `,
        )
        .eq("user_id", userId)
        .eq("is_active", true);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error getting user groups:", error);
      return { data: null, error };
    }
  },

  async getGroupMembers(groupId: string) {
    try {
      const { data, error } = await supabase
        .from("family_members")
        .select(
          `
          *,
          profiles (*)
        `,
        )
        .eq("group_id", groupId)
        .eq("is_active", true);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error getting group members:", error);
      return { data: null, error };
    }
  },

  async removeFamilyMember(groupId: string, userId: string) {
    try {
      const { data, error } = await (supabase as any)
        .from("family_members")
        .update({ is_active: false })
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error removing family member:", error);
      return { data: null, error };
    }
  },
};
