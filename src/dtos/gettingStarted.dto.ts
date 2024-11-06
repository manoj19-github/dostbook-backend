import { Trim } from 'class-sanitizer';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
export class GettingStartedDTO {
	@IsString()
	@Matches(/^(\+\d{1,3}[- ]?)?\d{10}$/gm, {
		message: 'Phone number is not valid'
	})
	@IsNotEmpty()
	@Trim()
	phoneNumber: string | undefined;
}
