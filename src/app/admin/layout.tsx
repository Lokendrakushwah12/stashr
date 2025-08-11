import Footer from "@/components/landing/footer";
import Navbar from "@/components/landing/navbar";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: Props) => {
  return (
    <>
      <Navbar />
      <main className="relative z-40 mx-auto w-full">{children}</main>
      <Footer />
    </>
  );
};

export default AdminLayout;
