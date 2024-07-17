import { ObjectId } from 'mongodb';

export interface UserType {
    _id: ObjectId;
    email: string;
    name: string;
    password: string;
    imageUrl: string;
    hobbies: string[];
    gender: string;
    address: string;
    phone: string; 
    createdAt: Date;
    updatedAt: Date;
}

export interface EventType {
    _id: ObjectId;
    name: string;
    description: string;
    location: string;
    mapsLocation: string;
    imageUrl: string; 
    ticket: string; 
    time: Date;
    max_participant: number;
    category: string;
    userId: ObjectId;
    price: number;
    follback: string;
    userParticipant:ObjectId[]
    createdAt: Date;
    updatedAt: Date;
}

export interface OutputEvent {
    _id: ObjectId;
    name: string;
    description: string;
    location: string;
    mapsLocation: string; 
    ticket: string; 
    time: Date;
    max_participant: number;
    category: string;
    user_detail: UserType;
    price: number;
    follback: string;
    userParticipant:ObjectId[]
    createdAt: Date;
    updatedAt: Date;
}


export interface TransactionType {
    _id?: ObjectId;
    userId: ObjectId;
    eventId: ObjectId;
    status: 'pending' | 'success' | 'failure';
    createdAt: Date;
    updatedAt: Date;
    orderId: string;
}

export interface DraftType {
    userId: ObjectId;
    eventId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface OutputDraft {
    _id: ObjectId;
    user: UserType;
    event: EventType;
    createdAt: Date;
    updatedAt: Date;
}

export interface TokenType {
    userId: string;
    email: string;
}

export interface FollowType {
    followerId: ObjectId;
    followingId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateTransactionInput {
    userId: ObjectId;
    eventId: ObjectId;
    quantity: number;
}

export interface TemplateType { // unntuk template itu sendiri
    _id: ObjectId;
    category: string;
    componentName: string;
    eventId: ObjectId;
    imageUrl: string
    createdAt: Date;
    updatedAt: Date;
}

export interface TemplateDetailType { // untuk detail template
    _id: string;
    category: string;
    componentName: string;
    eventId: string;
    createdAt: Date;
    updatedAt: Date;
    fields: string[]
    event_detail: EventType;
}

export interface TemplateUserType { //template user di profile user
    _id: string;
    createdAt: Date;
    updatedAt: Date;
    eventId: string
    templateId: string
    fields: string[]
    event_detail: EventType;
    template_detail: TemplateType;
}

export type ShowAllEvent = {
    page: number;
    per_page_or_limit: number;
    page_count_or_total_page: number;
    total_count_or_total_data: number;
    data: EventType[];
}

export interface DataTemplateType {
    _id: ObjectId;
    userId: ObjectId;
    eventId: ObjectId;
    templateId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}