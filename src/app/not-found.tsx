import Footer from "@/components/landing/footer";
import Navbar from "@/components/landing/navbar";
import { Button } from "@/components/ui/button";
import { SadSquare } from "@solar-icons/react-perf/category/style/BoldDuotone";
import Link from "next/link";

const PageNotFound = () => {
  return (
    <>
      <Navbar />
      <div className="flex min-h-[83vh] flex-col items-center justify-center gap-12 text-center lg:min-h-[80vh]">
        <SadSquare className="h-16 w-16 text-rose-600/50" />
        <div>
          <h1 className="text-4xl font-medium tracking-tighter">
            404 - Page Not Found
          </h1>
          <p className="text-muted-foreground mt-4 text-lg tracking-tight">
            Sorry, the page you are looking for does not exist.
          </p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href="/">Go back to Home</Link>
        </Button>
      </div>
      <Footer />
    </>
  );
};

export default PageNotFound;
