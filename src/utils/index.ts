import jwt from 'jsonwebtoken';
import { createTransport, SendMailOptions } from 'nodemailer';
import { ACCESS_TOKEN_SECRET, EMAIL_PASSWORD, EMAIL_USERNAME, REFRESH_TOKEN_SECRET } from '../../environment';
export class UtilsMain {
	static generateToken(userId: any): { accessToken: string; refreshToken: string } {
		const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
		const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
		return { accessToken, refreshToken };
	}
	static async sendMailMethod(mailOptions: SendMailOptions): Promise<boolean> {
		const transporter = createTransport({
			//@ts-ignore
			host: 'smtp.gmail.com',
			secureConnection: false, // TLS requires secureConnection to be false
			port: 465,
			secure: true,
			auth: {
				user: EMAIL_USERNAME,
				pass: EMAIL_PASSWORD
			},
			tls: {
				rejectUnAuthorized: true
			}
		});
		return new Promise((resolve, reject) => {
			transporter.sendMail(mailOptions, (error, _) => {
				if (error) return reject(false);
				return resolve(true);
			});
		});
	}
	static GetMailOptions({
		to,
		name,
		otp,
		subject,
		expirationTime
	}: {
		subject: string;
		to: string;
		name: string;
		otp: string;
		expirationTime?: number;
	}): SendMailOptions {
		const mailOptions: SendMailOptions = {
			from: process.env.EMAIL_USERNAME!,
			to,
			subject,
			html:
				`

              <h1 style="text-align:center">Dostbook</h1>
              <p style="text-align:center"> <small>Connect Safely with your friends</small></p>
              <p></p>
              <p></p>
              <p></p>
              <p style="text-align:justify">Hi ${name}, Welcome to Dostbook  </p>
              </p>
              <p style="text-align:justify"> Your One Time Password is :  ${otp}</p>
      ` + expirationTime
					? `<p style="text-align:justify;font-size:11px">This OTP will expire in ${expirationTime} seconds</p>`
					: ''
		};
		return mailOptions;
	}
	static generateOTP(otpLength: number = 6): string {
		const digits = '0123456789abcdefghijklmnopqrstuvwxyz';

		let otp: string = '';

		[...new Array(otpLength)].forEach((self, index) => {
			otp = otp + digits[Math.floor(Math.random() * digits.length)];
		});
		return otp;
	}
}
