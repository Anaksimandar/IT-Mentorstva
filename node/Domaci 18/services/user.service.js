const bcrypt = require("bcrypt");
const prisma = require("../prismaClient.js");
const { PrismaErrorCodes } = require("../config/prismaStatusCodes");
const { EmailTakenError, InvalidCredentialsError } = require("../errors/AppError");

async function register(email, password, name) {
  try {
    const hashed = await bcrypt.hash(password, 10);
    return await prisma.user.create({
      data: { email: email.trim().toLowerCase(), password: hashed, name },
      select: { email: true, name: true },
    });
  } catch (err) {
    console.log(err.code);
    if (err.code === PrismaErrorCodes.UNIQUE_CONSTRAINT_FAILED) throw new EmailTakenError();
    throw err;
  }
}

async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { email: true, name: true, password: true, id: true },
  });
  console.log("User found:", user);
  const ok = user && (await bcrypt.compare(password, user.password));
  console.log("Login attempt:", { email, ok });
  if (!ok) throw new InvalidCredentialsError();
  return user;
}

async function getAllUsers() {
  return await prisma.user.findMany({
    select: {
      email: true,
      name: true,
    },
  });
}

module.exports = { register, login, getAllUsers };
