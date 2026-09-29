import { PropsWithChildren } from "react";
import Navbar from "@/Components/Global/Navbar";
import Footer from "@/Components/Global/Footer";
import { Toaster } from "react-hot-toast";

export default function StorefrontLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            <Toaster position="top-center" reverseOrder={false} />
            <Navbar />
            <main className="w-full">{children}</main>
            <Footer />
        </div>
    );
}
