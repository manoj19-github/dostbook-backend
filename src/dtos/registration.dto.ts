import { Trim } from 'class-sanitizer';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
export class RegistrationDTO {
	@IsString()
	@Trim()
	@IsNotEmpty()
	@MinLength(4, { message: 'Name should be minimum of 4 characters' })
	name: string | undefined;
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
