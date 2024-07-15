"use server";
import { ID, Query } from "node-appwrite";
import {
  APPWRITE_APPOINTMENT_COLLECTION_ID,
  APPWRITE_DATABASE_ID,
  databases,
  messaging,
} from "../appwrite.config";
import { formatDateTime, parseStringify } from "../utils";
import { Appointment } from "@/types/appwrite.types";
import { revalidatePath } from "next/cache";

export const createAppointment = async (
  appointmentData: CreateAppointmentParams
) => {
  try {
    const newAppointment = await databases.createDocument(
      APPWRITE_DATABASE_ID!,
      APPWRITE_APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointmentData
    );

    return parseStringify(newAppointment);
  } catch (error) {
    console.error("An error occurred while creating the Appointment:", error);
  }
};
export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      APPWRITE_DATABASE_ID!,
      APPWRITE_APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    return parseStringify(appointment);
  } catch (error) {
    console.error("An error occurred while getting the Appointment:", error);
  }
};

export const getRecentAppointmentList = async () => {
  try {
    const appointments = await databases.listDocuments(
      APPWRITE_DATABASE_ID!,
      APPWRITE_APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };
    const counts = (appointments.documents as Appointment[]).reduce(
      (acc, appointment) => {
        switch (appointment.status) {
          case "scheduled":
            acc.scheduledCount++;
            break;
          case "pending":
            acc.pendingCount++;
            break;
          case "cancelled":
            acc.cancelledCount++;
            break;
        }
        return acc;
      },
      initialCounts
    );
    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents,
    };
    revalidatePath("/admin");
    return parseStringify(data);
  } catch (error) {
    console.error("An error occurred while getting the Appointment:", error);
  }
};
export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );
    return parseStringify(message);
  } catch (error) {
    console.error("An error occurred while getting the Appointment:", error);
  }
};

export const updateAppointment = async ({
  userId,
  appointmentId,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    const updatedAppointment = await databases.updateDocument(
      APPWRITE_DATABASE_ID!,
      APPWRITE_APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    );
    if (!updatedAppointment) throw new Error("Appointment not found");
    // SMS Notification
    const smsMessage = `Welcome To DocTime. ${
      type === "schedule"
        ? `Your appointment is confirmed for ${
            formatDateTime(appointment.schedule!).dateTime
          } with Dr. ${appointment.primaryPhysician}`
        : `We regret to inform that your appointment for ${
            formatDateTime(appointment.schedule!).dateTime
          } is cancelled. Reason:  ${appointment.cancellationReason}`
    }.`;
    await sendSMSNotification(userId, smsMessage);
    revalidatePath("/admin");
    return parseStringify(updatedAppointment);
  } catch (error) {
    console.error("An error occurred while getting the Appointment:", error);
  }
};
