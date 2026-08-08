export default function AuthBranding({ type = "login" }: { type?: "login" | "register" }) {
    return (
        <div className="w-full flex flex-col items-center justify-center p-4 h-full">
            <h1
                className="text-center font-bold text-5xl sm:text-6xl md:text-7xl tracking-tight select-none relative z-10 shrink-0"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
                <span className="text-[#4FD1C5]">Cibenda</span>
                <span className="text-white">Mart</span>
            </h1>
        </div>
    );
}
