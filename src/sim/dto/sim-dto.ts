import { IsNotEmpty } from "class-validator";

export class UploadSimDto {
  @IsNotEmpty()
  imsi: string;

  @IsNotEmpty()
  iccid: string;

  @IsNotEmpty()
  msisdn: string;

  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  lpa: string;

  @IsNotEmpty()
  account: string;
}
