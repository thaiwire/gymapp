'use server'

import { createSupabaseServerClient } from "@/config/supabase-server-config";
import { IDocumentTrans } from "@/interfaces";

export const addNewDoc = async (payload : any) => {
    try {
       const {data,error}  =await createSupabaseServerClient.from("document_trans")
       .insert([payload]);

       if (error) {
        throw new Error(error.message);
       }
         return {
            success : true,
            message : "Document added successfully",
         }

    } catch (error) {
        return {
            success : false,
            error : (error as Error).message
        }
    }
}

export const getAllDoc = async () => {
    try {
        const { data, error } = await createSupabaseServerClient.from("document_trans")
        .select("*").order("document_date", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        return {
            success: false,
            error: (error as Error).message
        };

    }
}

export const EditDocById = async (id : string, payload : any) => {
    try {
        const { data, error } = await createSupabaseServerClient.from("document_trans")
        .update(payload)
        .eq("id", id);

        if (error) {
            throw new Error(error.message);
        }

        return {
            success: true,
            message: "Document updated successfully"
        };

    } catch (error) {
        return {
            success : false,
            error : (error as Error).message
        }
    }
}

export const getDocById = async (id : string) => {
    try {
        const { data, error } = await createSupabaseServerClient.from("document_trans")
        .select("*")
        .eq("id", id);       

        if (error) {
            throw new Error(error.message);
        }

        return {
            success: true,
            data: data
        };

    } catch (error) {
        return {
            success : false,
            error : (error as Error).message
        }
    }
}

export const deleteDocById = async (id : string) => {
    try {
        const { data, error } = await createSupabaseServerClient.from("document_trans")
        .delete()
        .eq("id", id);

        if (error) {
            throw new Error(error.message);
        }

        return {
            success: true,
            message: "Document deleted successfully"
        };


    } catch (error) {
        return {
            success : false,
            error : (error as Error).message
        }
    }
}
