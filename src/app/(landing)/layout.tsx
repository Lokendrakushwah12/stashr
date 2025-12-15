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
      <main className="bg-background relative z-40 mx-auto w-full">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default LandingLayout;
