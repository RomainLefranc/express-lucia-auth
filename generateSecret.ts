import crypto from "crypto";

console.log("Generated JWT Secret:", crypto.randomBytes(32).toString("hex"));
