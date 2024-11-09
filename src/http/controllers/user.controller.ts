import { NextFunction, Request, Response } from 'express';
import { SendMailOptions } from 'nodemailer';
import otpMasterModel, { OTPMasterEnum } from '../../schema/otpMaster.schema';
import UserModel from '../../schema/user.schema';
import { UtilsMain } from '../../utils';
import { HttpException } from '../exceptions/http.exceptions';

export class UserController {
	static async generateOTPForLogin(req: Request, response: Response, next: NextFunction) {
		try {
			const { email } = req.body;
			const isUserExists = await UserModel.findOne({ email });
			if (!isUserExists) throw new HttpException(400, 'User not found');
			if (!isUserExists.isEmailVerified) throw new HttpException(400, 'User not registered');
			const loginOTP = UtilsMain.generateOTP();
			const mailOptions: SendMailOptions = UtilsMain.GetMailOptions({
				subject: `Dostbook OTP login`,
				to: isUserExists.email,
				expirationTime: 180,
				name: isUserExists.name,
				otp: loginOTP
			});
			UtilsMain.sendMailMethod(mailOptions)
				.then(async (res) => {
					await otpMasterModel.create({ otp: loginOTP, userId: isUserExists._id, genarateTime: Date.now(), type: OTPMasterEnum.userlogin });
					return response.status(200).json({ message: 'OTP sent successfully' });
				})
				.catch(() => {
					throw new HttpException(400, 'Something went wrong');
				});
		} catch (error) {
			next(error);
		}
	}
	static async verifyOTPForLogin(req: Request, response: Response, next: NextFunction) {
		try {
			const { otp, email } = req.body;

			const isUserExists = await UserModel.findOne({ email });
			if (!isUserExists) throw new HttpException(400, 'User not found');
			const otpMaster = await otpMasterModel.findOne({
				otpVal: otp.toLowerCase(),
				userId: isUserExists._id,
				type: OTPMasterEnum.userlogin
			});
			if (!otpMaster) throw new HttpException(400, 'OTP not found');
			if (Date.now() - otpMaster.genarateTime.getTime() > 3 * 60 * 1000) throw new HttpException(400, 'OTP expired');
			await otpMasterModel.deleteOne({ _id: otpMaster._id });
			await UserModel.updateOne({ _id: isUserExists._id }, { $set: { isEmailVerified: true } });
			const { accessToken, refreshToken } = UtilsMain.generateToken(isUserExists._id);
			response.status(200).json({ accessToken, refreshToken, user: isUserExists });
		} catch (error) {
			next(error);
		}
	}
	static async gettingStarted(req: Request, response: Response, next: NextFunction) {
		try {

			const { phoneNumber } = req.body;
			const isUserExists = await UserModel.findOne({ phoneNumber });
			if (isUserExists && isUserExists.isEmailVerified)
				return response.status(200).json({ message: 'User already exists', navigateTo: 'LoginScreen' });
			if (isUserExists && !isUserExists.isEmailVerified) {
				await UserModel.deleteOne({ _id: isUserExists._id });
			}
			return response.status(200).json({ message: `User does'nt exists`, navigateTo: 'RegisterScreen' });
		} catch (error) {

			next(error);
		}
	}

	static async registerHandler(req: Request, response: Response, next: NextFunction) {
		let session: any;
		try {
			session = await UserModel.startSession();
			session.startTransaction();
			const { phoneNumber, name, email } = req.body;

			const opts = { session };
			const isUserExists = await UserModel.findOne({ phoneNumber });
			if (isUserExists) throw new HttpException(400, 'User already exists');
			const newUser = await new UserModel({ phoneNumber, name, email }).save(opts);
			const loginOTP = UtilsMain.generateOTP();

			const mailOptions: SendMailOptions = UtilsMain.GetMailOptions({
				subject: `Dostbook OTP login`,
				to: email,
				expirationTime: 60,
				name: name,
				otp: loginOTP.toLowerCase()
			});
			UtilsMain.sendMailMethod(mailOptions)
				.then(async (res) => {
					await otpMasterModel.create({
						otpVal: loginOTP.toLowerCase(),
						userId: newUser._id,
						genarateTime: Date.now(),
						type: OTPMasterEnum.userlogin
					});
					await session.commitTransaction();
					session.endSession();
					return response.status(200).json({ message: 'REgistration successfull, an OTP sent successfully in your email address' });
				})
				.catch((error: any) => {
					throw new HttpException(400, 'Something went wrong');
				});
		} catch (error) {
			if (session) {
				await session.abortTransaction();
				session.endSession();
			}

			next(error);
		}
	}
	static async getUserByPhoneNumber(req: Request, response: Response, next: NextFunction) {
		try {
			const { phoneNumber } = req.params;
			const user = await UserModel.findOne({ phoneNumber });
			if (!user) throw new HttpException(400, 'User not found');
			response.status(200).json(user);
		} catch (error) {
			next(error);
		}
	}
	static async getUserById(req: Request, response: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const user = await UserModel.findById(id);
			if (!user) throw new HttpException(400, 'User not found');
			response.status(200).json(user);
		} catch (error) {
			next(error);
		}
	}
	static async reportFraud(req: Request, response: Response, next: NextFunction) {
		try {
			const { phoneNumber } = req.params;
			const user = await UserModel.findOne({ phoneNumber });
			if (!user) throw new HttpException(400, 'User not found');
			user.isFraudCount += 1;
			await user.save();
			return response.status(200).json(user);
		} catch (error) {
			next(error);
		}
	}
	static async getFraudUsers(req: Request, response: Response, next: NextFunction) {
		try {
			const users = await UserModel.find({ isFraudCount: { $gt: 0 } });
			return response.status(200).json(users);
		} catch (error) {
			next(error);
		}
	}
	static async addMultipleUsers(req: Request, response: Response, next: NextFunction) {
		try {
			const users = req.body;
			if (!Array.isArray(users)) throw new HttpException(400, 'Invalid request');
			const phoneNumbers = users.map((user) => user.phoneNumber);
			const isUserExists = await UserModel.find({ phoneNumber: { $in: phoneNumbers } }).select('phoneNumber');
			const existingPhoneNumbers = new Set(isUserExists.map((self) => self.phoneNumber));
			const operations = users
				.filter((self) => !existingPhoneNumbers.has(self.phoneNumber))
				.map((mUser) => ({
					updateOne: {
						filter: { phoneNumber: mUser.phoneNumber },
						update: { $set: mUser },
						upsert: true
					}
				}));
			if (operations.length === 0) return response.status(200).json({ message: 'All users already exists' });

			const result = await UserModel.collection.bulkWrite(operations);
			return response.status(200).json(result);
		} catch (error) {
			next(error);
		}
	}
}
