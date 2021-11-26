export const userTypes = {
  customer: "customer",
  merchant: "merchant",
};

export const pageSize = 20;

export const statusCodes = {
  missingInfo: 400,
  noDataAvailable: 403,
  pageNotFound: 404,
  ok: 200,
  created: 201,
  invalidDataSent: 422,
  somethingWentWrong: 500,
  unauthorized: 401,
  databaseError: 502,
};

export const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const mobileRegex = /^[0-9]{10}$/;
