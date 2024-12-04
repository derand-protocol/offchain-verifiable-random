import { Schema, model } from 'mongoose';

const ConfigSchema = new Schema({
  param: { type: String, unique: true },
  value: { type: String }
});

export const Config = model('Config', ConfigSchema)