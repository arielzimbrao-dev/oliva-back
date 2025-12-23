import * as bcrypt from 'bcryptjs';
import * as CryptoJS from 'crypto-js';
import * as dotenv from 'dotenv';
dotenv.config();
export class cryptoUtils {
  public static encryptPasswordFront(text: string) {
    return CryptoJS.AES.encrypt(text, process.env.FE_PWD_AUTH || '').toString();
  }

  public static decryptoPasswordFront(password: string) {
    return CryptoJS.AES.decrypt(
      password,
      process.env.FE_PWD_AUTH || '',
    ).toString(CryptoJS.enc.Utf8);
  }

  public static async compare(
    password: string,
    hash: string,
  ): Promise<boolean> {
    const passwordDecrypto = this.decryptoPasswordFront(password);
    console.log(cryptoUtils.hash(passwordDecrypto));
    return bcrypt.compare(passwordDecrypto, hash);
  }

  public static hash(text: string): Promise<string> {
    return bcrypt.hash(text, 10);
  }

  public static preSavePassword(password: string) {
    const passwordDecrypto = this.decryptoPasswordFront(password);
    return this.hash(passwordDecrypto);
  }

  public static createMD5(text: string) {
    return CryptoJS.MD5(text).toString();
  }
}
