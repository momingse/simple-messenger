import { withAuth } from "next-auth/middleware";
import { chain } from "./app/middleware/chain";
import { withAuthMiddleware } from "./app/middleware/withAuthMiddleware";

export default chain([withAuthMiddleware]);

export const config = {
  matcher: ["/users/:path*", "/conversations/:path*"],
};
