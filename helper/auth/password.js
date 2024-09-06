const bcrypt = require("bcryptjs");

async function hashPassword(password) {
  const saltRounds = 10;

  const hashedPassword = new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, function (error, hash) {
      if (error) reject(error);
      resolve(hash);
    });
  });

  return hashedPassword;
}

async function validatePassword(password, hashed) {
  return bcrypt.compareSync(password, hashed);
}

module.exports = { hashPassword, validatePassword };
