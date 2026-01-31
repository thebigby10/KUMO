export interface Lab {
    id: string;
    banner: string | null;
    name: string;
    description: string | null;
    section: string | null;
    subject: string | null;
    room: string | null;
    labCode: string;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
}


export interface LabType {
    id: string;
    name: string;
    section: string | null;
    subject: string | null;
    room: string | null;
    banner: string | null;
    description: string | null;
    labCode: string;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
    instructors: {
        id: string;
        labId: string;
        userEmail: string;
        role: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            password: string | null;
            avatar: string | null;
            googleId: string | null;
            isEmailVerified: boolean;
            provider: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }[];
}
