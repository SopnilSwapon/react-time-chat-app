import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "10d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true, // <-- MUST BE TRUE on Render (HTTPS)
    sameSite: "none", // <-- ALLOW cross-site cookies
    maxAge: 10 * 24 * 60 * 60 * 1000,
  });

  return token;
};
