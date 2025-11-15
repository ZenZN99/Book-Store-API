import jsonwebtoken from "jsonwebtoken";
export function generateToken(userId: string) {
  return jsonwebtoken.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "5d",
  });
}
