// Team collaboration and project management
import { db } from "../lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from "firebase/firestore";

export interface Project {
  id: string;
  name: string;
  description: string;
  owner: string;
  members: ProjectMember[];
  status: "active" | "completed" | "archived";
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  location?: string;
  goals: string[];
  progress: number;
}

export interface ProjectMember {
  userId: string;
  username: string;
  role: "owner" | "admin" | "contributor" | "viewer";
  joinedAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo?: string;
  status: "todo" | "in_progress" | "review" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
  tags: string[];
}

export interface Comment {
  id: string;
  projectId: string;
  taskId?: string;
  userId: string;
  username: string;
  content: string;
  createdAt: Date;
  edited: boolean;
  attachments?: string[];
}

export interface Activity {
  id: string;
  projectId: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  timestamp: Date;
}

// Create a new project
export async function createProject(
  userId: string,
  username: string,
  projectData: Omit<
    Project,
    "id" | "members" | "createdAt" | "updatedAt" | "progress"
  >,
): Promise<Project> {
  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const project: Project = {
    ...projectData,
    id: projectId,
    members: [
      {
        userId,
        username,
        role: "owner",
        joinedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    progress: 0,
  };

  await setDoc(doc(db, "projects", projectId), {
    ...project,
    createdAt: Timestamp.fromDate(project.createdAt),
    updatedAt: Timestamp.fromDate(project.updatedAt),
  });

  await logActivity(
    projectId,
    userId,
    username,
    "created_project",
    `Created project "${project.name}"`,
  );

  return project;
}

// Add member to project
export async function addProjectMember(
  projectId: string,
  member: Omit<ProjectMember, "joinedAt">,
  addedBy: { userId: string; username: string },
): Promise<void> {
  const projectRef = doc(db, "projects", projectId);

  await updateDoc(projectRef, {
    members: arrayUnion({
      ...member,
      joinedAt: Timestamp.now(),
    }),
    updatedAt: Timestamp.now(),
  });

  await logActivity(
    projectId,
    addedBy.userId,
    addedBy.username,
    "added_member",
    `Added ${member.username} as ${member.role}`,
  );
}

// Remove member from project
export async function removeProjectMember(
  projectId: string,
  userId: string,
  removedBy: { userId: string; username: string },
): Promise<void> {
  const projectRef = doc(db, "projects", projectId);
  const projectDoc = await getDoc(projectRef);

  if (!projectDoc.exists()) {
    throw new Error("Project not found");
  }

  const project = projectDoc.data() as Project;
  const member = project.members.find((m) => m.userId === userId);

  if (!member) {
    throw new Error("Member not found");
  }

  await updateDoc(projectRef, {
    members: arrayRemove(member),
    updatedAt: Timestamp.now(),
  });

  await logActivity(
    projectId,
    removedBy.userId,
    removedBy.username,
    "removed_member",
    `Removed ${member.username} from project`,
  );
}

// Create task
export async function createTask(
  projectId: string,
  taskData: Omit<Task, "id" | "createdAt">,
  createdBy: { userId: string; username: string },
): Promise<Task> {
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const task: Task = {
    ...taskData,
    id: taskId,
    createdAt: new Date(),
  };

  await setDoc(doc(db, "tasks", taskId), {
    ...task,
    createdAt: Timestamp.fromDate(task.createdAt),
    dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
  });

  await logActivity(
    projectId,
    createdBy.userId,
    createdBy.username,
    "created_task",
    `Created task "${task.title}"`,
  );

  return task;
}

// Update task status
export async function updateTaskStatus(
  projectId: string,
  taskId: string,
  status: Task["status"],
  updatedBy: { userId: string; username: string },
): Promise<void> {
  const taskRef = doc(db, "tasks", taskId);
  const updates: any = {
    status,
  };

  if (status === "completed") {
    updates.completedAt = Timestamp.now();
  }

  await updateDoc(taskRef, updates);

  await logActivity(
    projectId,
    updatedBy.userId,
    updatedBy.username,
    "updated_task",
    `Changed task status to "${status}"`,
  );
}

// Add comment
export async function addComment(
  projectId: string,
  commentData: Omit<Comment, "id" | "createdAt" | "edited">,
  author: { userId: string; username: string },
): Promise<Comment> {
  const commentId = `comment_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const comment: Comment = {
    ...commentData,
    id: commentId,
    userId: author.userId,
    username: author.username,
    createdAt: new Date(),
    edited: false,
  };

  await setDoc(doc(db, "comments", commentId), {
    ...comment,
    createdAt: Timestamp.fromDate(comment.createdAt),
  });

  await logActivity(
    projectId,
    author.userId,
    author.username,
    "added_comment",
    `Added a comment`,
  );

  return comment;
}

// Log activity
async function logActivity(
  projectId: string,
  userId: string,
  username: string,
  action: string,
  details: string,
): Promise<void> {
  const activityId = `activity_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const activity: Activity = {
    id: activityId,
    projectId,
    userId,
    username,
    action,
    details,
    timestamp: new Date(),
  };

  await setDoc(doc(db, "activities", activityId), {
    ...activity,
    timestamp: Timestamp.fromDate(activity.timestamp),
  });
}

// Calculate project progress
export function calculateProjectProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  return Math.round((completedTasks / tasks.length) * 100);
}

// Get project statistics
export function getProjectStatistics(tasks: Task[], members: ProjectMember[]) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in_progress",
  ).length;
  const overdueTasks = tasks.filter(
    (t) =>
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed",
  ).length;

  const tasksByPriority = {
    urgent: tasks.filter((t) => t.priority === "urgent").length,
    high: tasks.filter((t) => t.priority === "high").length,
    medium: tasks.filter((t) => t.priority === "medium").length,
    low: tasks.filter((t) => t.priority === "low").length,
  };

  const memberContributions = members.map((member) => ({
    userId: member.userId,
    username: member.username,
    assignedTasks: tasks.filter((t) => t.assignedTo === member.userId).length,
    completedTasks: tasks.filter(
      (t) => t.assignedTo === member.userId && t.status === "completed",
    ).length,
  }));

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    completionRate:
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    tasksByPriority,
    memberContributions,
    totalMembers: members.length,
  };
}
