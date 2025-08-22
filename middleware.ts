import { NextResponse } from "next/server";
import { refreshTokenIfNeeded } from "./lib/mls-session";

const resoMiddleware = async () => {
  try {
    // Attempt to refresh the token if needed
    const tokenData = await refreshTokenIfNeeded();
    if (tokenData) {
      // If successful, add the token to the request headers
      const response = NextResponse.next();
      response.headers.set(
        "Authorization",
        `${tokenData.token_type} ${tokenData.access_token}`,
      );
      return response;
    } else {
      throw new Error("Failed to fetch token");
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("Error in resoMiddleware:", error);
    } else {
      return NextResponse.json(
        { message: "Something went wrong" },
        { status: 500 },
      );
    }
  }
};

export const middleware = async () => {
  return await resoMiddleware();
};

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
