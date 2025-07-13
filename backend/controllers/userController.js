const User = require('../model/users');

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('username greenCoins email carbonFootprintSaved')
      .sort({ greenCoins: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leaderboard', error: err.message });
  }
};
