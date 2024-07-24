const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const AppError = require("../utils/appError");

const SECRET_KEY = process.env.JWT_SECRET_KEY || "default";
const EXPIRES_IN = process.env.EXPIRES_IN || "3600";

async function authenticateUser(email, password) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (user && isPasswordValid) {
    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role
    }, SECRET_KEY, { expiresIn: Number(EXPIRES_IN)});

    delete user.password;
    
    return { user, token };
  }

  throw new AppError("E-mail ou senha inválida!", 401);
}

module.exports = {
  authenticateUser
};