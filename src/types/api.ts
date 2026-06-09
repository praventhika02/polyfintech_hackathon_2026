export type ApiResponse<T> = {
  data: T;
  meta: {
    requestId: string;
    generatedAt: string;
  };
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
  };
  meta: {
    requestId: string;
    generatedAt: string;
  };
};
