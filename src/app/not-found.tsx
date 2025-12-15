import Footer from "@/components/landing/footer";
import Navbar from "@/components/landing/navbar";
import { SadSquare } from "@solar-icons/react-perf/category/style/BoldDuotone";
import Link from "next/link";

const PageNotFound = () => {
  return (
    <>
      <Navbar />
      <div className="flex min-h-[83vh] flex-col items-center justify-center gap-12 text-center lg:min-h-[84vh]">
        <SadSquare className="h-16 w-16 text-rose-600/50" />
        <div>
          <h1 className="text-4xl font-semibold">404 - Page Not Found</h1>
          <p className="text-muted-foreground mt-4 text-lg">
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
