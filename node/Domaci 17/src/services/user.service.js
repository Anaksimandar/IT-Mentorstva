const bcrypt = require("bcrypt");
const prisma = require("../../prismaClient");
const { PrismaErrorCodes } = require("../../config/prismaStatusCodes");
const { EmailTakenError, InvalidCredentialsError } = require("../../errors/AppError");

async function register(email, password, name) {
  try {
    const hashed = await bcrypt.hash(password, 10);
    return await prisma.user.create({
      data: { email: email.trim().toLowerCase(), password: hashed, name },
    });
  } catch (err) {
    console.log(err.code);
    if (err.code === PrismaErrorCodes.UNIQUE_CONSTRAINT_FAILED) throw new EmailTakenError();
    throw err;
  }
}

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) throw new InvalidCredentialsError();
  return user;
}

module.exports = { register, login };
