import { Schema, model } from 'mongoose';
import validator from 'validator';

export interface IUserSchema extends Document {
	name: string;
	email: string;
	phoneNumber: string;
	isSpam: boolean;
	isFraudCount: number;
	isEmailVerified: boolean;
}
export const UserSchema: Schema<IUserSchema> = new Schema(
	{
		name: {
			type: String,
			required: [true, 'Please provide a name'],
			minlength: 3,
			maxlength: 50,
			trim: true
		},
		email: {
			type: String,
			required: [true, 'Please provide an email'],
			unique: true,
			validate: [validator.isEmail, 'Please provide a valid email']
		},
		isEmailVerified: {
			type: Boolean,
			default: false
		},
		phoneNumber: {
			type: String,
			required: [true, 'Please provide a phone number'],
			unique: true,
			validate: [validator.isMobilePhone, 'Please provide a valid phone number'],
			index: 1
		},
		isSpam: {
			type: Boolean,
			default: false
		},
		isFraudCount: {
			type: Number,
			default: 0
		}
	},
	{ timestamps: true }
);

UserSchema.methods = {
	chckSpanStatus: async function (password: string) {
		if (this.isFraudCount >= 10) this.isSpam = true;
	}
};
const UserModel = model('User', UserSchema);
export default UserModel;
