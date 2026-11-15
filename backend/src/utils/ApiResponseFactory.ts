export class ApiResponseFactory {
  static success(data: any, message: string = 'Success') {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, error: any = null) {
    return {
      success: false,
      message,
      error,
    };
  }
}
