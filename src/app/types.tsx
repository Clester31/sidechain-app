export type Song = {
    id: string;
    title: string;
    description: string;
    audioUrl: string;
    imageUrl: string;
    uploadedBy: string; 
    uploaderId: string; 
    uploadDate: Date;
    tags: [];
    comments: [];
    likes: []
    reposts: []
}

export type UserInfo = {
    username: string;
    email: string;
    profileImage: string;
    profileBanner: string;
    songs: string[];
    likes: string[];
    reposts: string[];
    allContent: string[];
    bio: string[];
    links: { url: string; name: string }[];
}

export type comment = { 
    userId: string;
    content: string;
    date: string;
}