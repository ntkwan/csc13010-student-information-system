import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    timestamps: true,
    collection: 'faculties',
})
export class Faculty extends Document {
    @Prop({ type: String, required: true, unique: true })
    name: string;
}

export const FacultySchema = SchemaFactory.createForClass(Faculty);

@Schema({
    timestamps: true,
    collection: 'statuses',
})
export class Status extends Document {
    @Prop({ type: String, required: true, unique: true })
    name: string;
}

export const StatusSchema = SchemaFactory.createForClass(Status);

@Schema({
    timestamps: true,
    collection: 'programs',
})
export class Program extends Document {
    @Prop({ type: String, required: true, unique: true })
    name: string;
}

export const ProgramSchema = SchemaFactory.createForClass(Program);
