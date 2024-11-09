import { Trim } from 'class-sanitizer';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
export class LoginDTO {
	@IsEmail({}, { message: 'Provided Email is not valid' })
	@IsNotEmpty()
	@Trim()
	email: string | undefined;
	@Matches(/^(\+\d{1,3}[- ]?)?\d{10}$/gm, {
		message: 'Phone number is not valid'
	})
	@IsString()
	@IsNotEmpty()
	@Trim()
	phoneNumber: string | undefined;
}

export class VerifyOTP {
	@IsNotEmpty()
	@Trim()
	@Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/gm, {
		message: 'Email address is not valid'
	})
	email: string | undefined;
	@IsString()
	@IsNotEmpty()
	@Trim()
	otp: string | undefined;
}
