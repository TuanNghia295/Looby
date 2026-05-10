export const userInfo = (req, res) => {
  try {
    const user = req.user; // get userinfo from middlware

    return res.status(200).json({ message: user });
  } catch (error) {
    console.error('Error when call userInfo', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const test = async (req, res) => {
  return res.status(200).json({ message: 'ok' });
};
