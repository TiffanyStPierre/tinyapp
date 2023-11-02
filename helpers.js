const getUserIdFromEmail = function(email, database) {
  let foundUserId = null;
  for (const userId in database) {
    if (database[userId].email === email) {
      foundUserId = database[userId].id;
    }
  }

  return foundUserId;
};

module.exports = { getUserIdFromEmail };