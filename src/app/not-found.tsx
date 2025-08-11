import Footer from "@/components/landing/footer";
import Navbar from "@/components/landing/navbar";
import { WarningIcon } from "@phosphor-icons/react";
import Link from "next/link";

const PageNotFound = () => {
  return (
    <>
      <Navbar />
      <div className="flex min-h-[83vh] lg:min-h-[84vh] flex-col items-center justify-center gap-12 text-center">
        <WarningIcon weight="duotone" strokeWidth={1.5} className="h-16 w-16 text-rose-600" />
        <div>
          <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Sorry, the page you are looking for does not exist.
          </p>
        </div>
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground hover:underline"
        >
          Go back to Home
        </Link>
      </div>
      <Footer />
    </>
  );
};

export default PageNotFound;
