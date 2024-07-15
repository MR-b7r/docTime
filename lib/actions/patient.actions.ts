"use server";

import { ID, Query } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_PATIENT_COLLECTION_ID,
  NEXT_PUBLIC_APPWRITE_ENDPOINT,
  NEXT_PUBLIC_APPWRITE_PROJECT,
  NEXT_PUBLIC_BUCKET_ID,
  storage,
  databases,
  users,
} from "../appwrite.config";
import { parseStringify } from "../utils";

export const createUser = async (user: CreateUserParams) => {
  try {
    const newuser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name
    );

    return parseStringify(newuser);
  } catch (error: any) {
    if (error && error?.code === 409) {
      const existingUser = await users.list([
        Query.equal("email", [user.email]),
      ]);

      return existingUser.users[0];
    }
    console.error(error);
  }
};
export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);

    return parseStringify(user);
  } catch (error: any) {
    console.error("An error occurred while getting the user:", error);
  }
};

// GET PATIENT
export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      APPWRITE_DATABASE_ID!,
      APPWRITE_PATIENT_COLLECTION_ID!,
      [Query.equal("userId", [userId])]
    );
    return parseStringify(patients.documents[0]);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the patient details:",
      error
    );
  }
};
export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    let file;
    if (identificationDocument) {
      const inputFile =
        identificationDocument &&
        InputFile.fromBuffer(
          identificationDocument?.get("blobFile") as Blob,
          identificationDocument?.get("fileName") as string
        );

      file = await storage.createFile(
        NEXT_PUBLIC_BUCKET_ID!,
        ID.unique(),
        inputFile
      );
    }

    const newPatient = await databases.createDocument(
      APPWRITE_DATABASE_ID!,
      APPWRITE_PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentId: file?.$id ? file.$id : null,
        identificationDocumentUrl: file?.$id
          ? `${NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${NEXT_PUBLIC_BUCKET_ID}/files/${file.$id}/view??project=${NEXT_PUBLIC_APPWRITE_PROJECT}`
          : null,
        ...patient,
      }
    );

    return parseStringify(newPatient);
  } catch (error: any) {
    console.error("An error occurred while creating a new patient:", error);
  }
};
