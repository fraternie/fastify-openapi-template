import { model, Schema } from 'mongoose';
import { IType } from '../utils/api-types';

const BaseSchema: Schema = new Schema({
  type: { type: String, required: true },
});

export default model<IType>('Base', BaseSchema);
