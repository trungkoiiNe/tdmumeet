import { z } from "zod";
import { Meeting, Team } from "../types";

// Error handling utilities for the app
export class AppError extends Error {
  constructor(
    message: string,
    public code: "auth" | "permission" | "validation" | "network" | "unknown",
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Meeting schema for validation
export const meetingSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().trim().min(1, { message: "Meeting title is required" }),
    description: z.string().optional(),
    startTime: z.number().refine((val) => val > Date.now(), {
      message: "Meeting cannot be scheduled in the past",
    }),
    endTime: z.number(),
    teamId: z.string(),
    createdBy: z.string(),
    participants: z.array(z.string()),
    isRecurring: z.boolean().optional(),
    meetingLink: z.string().optional(),
    recurrencePattern: z
      .object({
        frequency: z.enum(["daily", "weekly", "monthly"]),
        interval: z.number().positive(),
        endDate: z.number().optional(),
      })
      .optional(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "Meeting end time must be after start time",
    path: ["endTime"],
  });

// Partial meeting schema for validation with some fields optional
export const partialMeetingSchema = meetingSchema.partial();

// Message schema for validation
export const messageSchema = z
  .string()
  .trim()
  .min(1, { message: "Message cannot be empty" })
  .max(1000, { message: "Message is too long (maximum 1000 characters)" });

// User schema for validation
export const userSchema = z.object({
  uid: z.string(),
  displayName: z.string().nullable(),
  email: z.string().email().nullable(),
  photoURL: z.string().optional(),
  role: z.enum(["admin", "user"]).optional(),
});

// Team schema for validation
export const teamSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, { message: "Team name is required" }),
  description: z.string(),
  isPublic: z.boolean(),
  createdBy: z.string(),
  members: z.array(z.string()),
  inviteCode: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// TeamChat schema for validation
export const teamChatSchema = z.object({
  id: z.string().optional(),
  teamId: z.string(),
  senderId: z.string(),
  message: messageSchema,
  timestamp: z.number(),
  attachments: z
    .array(
      z.object({
        type: z.enum(["image", "file"]),
        url: z.string(),
        name: z.string(),
        size: z.number().optional(),
        mimeType: z.string().optional(),
      })
    )
    .optional(),
  replyTo: z
    .object({
      messageId: z.string(),
      preview: z.string(),
    })
    .optional(),
  reactions: z.record(z.string(), z.array(z.string())).optional(),
});

// Utility function to validate data with Zod and convert errors to AppError
export const validateWithZod = <T>(schema: z.ZodType<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      throw new AppError(errorMessage, "validation", error.errors);
    }
    throw new AppError("Validation error", "validation", error);
  }
};

// Backward compatibility functions
export const validateMeeting = (meeting: Partial<Meeting>): boolean => {
  validateWithZod(partialMeetingSchema, meeting);
  return true;
};

export const validateMessage = (message: string): boolean => {
  validateWithZod(messageSchema, message);
  return true;
};

export const validateTeamAccess = (userId: string, team: Team): boolean => {
  if (!team.members.includes(userId)) {
    throw new AppError("You do not have access to this team", "permission");
  }
  return true;
};

// Type exports for TypeScript integration
export type MeetingInput = z.infer<typeof meetingSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type TeamInput = z.infer<typeof teamSchema>;
export type TeamChatInput = z.infer<typeof teamChatSchema>;
