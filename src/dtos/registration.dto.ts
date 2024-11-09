import { Trim } from 'class-sanitizer';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
export class RegistrationDTO {
	@IsString()
	@Trim()
	@IsNotEmpty()
	@MinLength(4, { message: 'Name should be minimum of 4 characters' })
	name: string | undefined;
	@Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/gm, {
		message: 'Email address is not valid'
	})
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
