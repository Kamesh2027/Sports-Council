require('dotenv').config();
const { connectToDatabase } = require('../src/config/db');
const User = require('../src/models/User');

(async () => {
  await connectToDatabase();
  const users = await User.find({
    $or: [{ name: { $exists: false } }, { name: '' }],
  });

  for (const user of users) {
    user.name = user.displayName || user.email;
    if (!user.displayName) {
      user.displayName = user.name;
    }
    await user.save();
  }

  console.log(`migrated ${users.length} users`);
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
