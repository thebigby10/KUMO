export interface LabType {
    id: string;
    name: string;
    section: string;
    subject: string;
    room: string;
    banner: string | null;
    description: string | null;
    labCode: string;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
    instructors: {
        id: string;
        labId: string;
        userEmail: string;
        role: string;
        user: {
            id: string;
            email: string;
            name: string;
            password: string | null;
            avatar: string | null;
            googleId: string | null;
            isEmailVerified: boolean;
            provider: string;
            createdAt: string;
            updatedAt: string;
        };
    }[];
}
