import { Project } from "../models/Project";

export type ProjectRole = "owner" | "admin" | "member" | "none";

export const getUserProjectRole = (project: any, userId: string): ProjectRole => {
  const ownerId = typeof project.owner === "object" && project.owner?._id ? String(project.owner._id) : String(project.owner);
  if (ownerId === String(userId)) return "owner";

  const roleEntry = (project.memberRoles ?? []).find((item: any) => String(item.user) === String(userId));
  if (roleEntry?.role === "admin") return "admin";
  if (roleEntry?.role === "member") return "member";

  const isMember = (project.members ?? []).some((member: any) => {
    const memberId = typeof member === "object" && member?._id ? String(member._id) : String(member);
    return memberId === String(userId);
  });
  if (isMember) return "member";

  return "none";
};

export const findProjectForMember = async (projectId: string, userId: string): Promise<any | null> => {
  return Project.findOne({ _id: projectId, members: userId });
};
