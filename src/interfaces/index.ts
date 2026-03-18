export interface IUser {
    id: string
    email: string
    name : string | null
    password ?: string
    is_active? : boolean
    department? : string | null
    resume_data : IResumeData | null
    role : "user" | "admin"
}

export interface IDocumenttrans {
    id: string;
    document_code: string;
    document_date : Date;
    document_group: string;
    department : string;
    docfile : string;
    note : string;
    document_usr : string;
    document_url: string;
    created_at: string;
    updated_at: string;
}

export interface IDocumentGroup {
  id: string;
  name: string;
  description: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface IDepartment {
  id: string;
  name: string;
  description: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface IResumeData {
    personal_info : {
        fullname : string
        email : string
        phone : string
        address : string
        summary : string
        linkedInUrl : string
        githubUrl : string
        professionalTitle : string
    }
    education : {
        institution : string
        degree : string
        fieldOfStudy : string
        startDate : string
        endDate : string
    }[]
    experience : {
        jobtitle : string
        company : string
        location : string
        startDate : string
        endDate : string
        description : string
    }[]
    skills : {
        name : string
        level : number
    }
    
}

