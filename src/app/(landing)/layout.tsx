import Footer from "@/components/landing/footer";
import Navbar from "@/components/landing/navbar";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const LandingLayout = ({ children }: Props) => {
  return (
    <>
      <Navbar />
      <main className="relative z-40 mx-auto w-full bg-[#f6f6f6] dark:bg-[#101010]">{children}</main>
      <Footer />
    </>
  );
};

export default LandingLayout;
