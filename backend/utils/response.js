export const success = (res, data, message = 'Success', status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data
  });
};

export const failure = (res, message = 'Error', status = 400) => {
  return res.status(status).json({
    success: false,
    message
  });
};
