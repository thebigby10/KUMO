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


