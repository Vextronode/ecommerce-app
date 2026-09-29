import { PropsWithChildren, useLayoutEffect, useRef } from "react";
import { usePage } from "@inertiajs/react";
// eslint-disable-next-line react-doctor/use-lazy-motion
import { motion, useAnimation } from "framer-motion";
import AuthBranding from "@/Components/AuthBranding";

const WaveEdge = ({ side }: { side: "right" | "left" }) => (
    <div
        className="absolute top-0 bottom-0 w-25 text-brand-blue"
        style={
            side === "right"
                ? { right: "-99px" }
                : { left: "-99px", transform: "scaleX(-1)" }
        }
    >
        <svg
            viewBox="0 0 100 1000"
            preserveAspectRatio="none"
            className="w-full h-full fill-current"
        >
            <path d="M0,0 L0,1000 C 0,950 100,925 100,850 C 100,775 30,750 30,675 C 30,600 90,575 90,500 C 90,425 20,400 20,325 C 20,250 100,225 100,150 C 100,75 0,50 0,0 Z" />
        </svg>
    </div>
);

export default function AuthLayout({ children }: PropsWithChildren) {
    const { url } = usePage();
    const isLogin = url === "/login";

    const panelControls = useAnimation();
    const contentControls = useAnimation();
    const prevIsLogin = useRef(isLogin);

    useLayoutEffect(() => {
        if (prevIsLogin.current === isLogin) return;
        prevIsLogin.current = isLogin;

        contentControls.set({ opacity: 0 });

        async function runAnimation() {
            // Step 1: Animate the blue panel across
            await panelControls.start({
                left: isLogin ? "0%" : "50%",
                transition: { duration: 0.65, ease: [0.65, 0, 0.35, 1] },
            });
            // Step 2: Fade the new content in
            await contentControls.start({
                opacity: 1,
                transition: { duration: 0.3, ease: "easeOut" },
            });
        }

        runAnimation();
    }, [isLogin, panelControls, contentControls]);

    return (
        <div className="relative w-full min-h-screen overflow-hidden bg-[#F0F2F5]">
            <div className="hidden md:flex relative w-full h-screen">
                <motion.div
                    className="absolute top-0 bottom-0 z-0"
                    initial={{
                        // eslint-disable-next-line react-doctor/no-layout-property-animation
                        left: isLogin ? "0%" : "50%",
                        // eslint-disable-next-line react-doctor/no-layout-property-animation
                        width: "50%",
                    }}
                    animate={panelControls}
                >
                    <div className="absolute inset-0 bg-brand-blue" />
                    <WaveEdge side="right" />
                    <WaveEdge side="left" />
                </motion.div>

                <motion.div
                    className="relative z-10 w-full h-full flex"
                    initial={{ opacity: 1 }}
                    animate={contentControls}
                >
                    <div className="w-1/2 h-full flex items-center justify-center px-8 lg:px-14">
                        {isLogin ? (
                            <AuthBranding type="login" />
                        ) : (
                            <div className="w-full max-w-xl">
                                <div className="bg-[#F0F2F5] rounded-4xl shadow-[0_20px_60px_rgba(0,0,0,0.10)] border border-white/80 p-10 lg:p-14">
                                    {children}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-1/2 h-full flex items-center justify-center px-8 lg:px-14">
                        {isLogin ? (
                            <div className="w-full max-w-xl">
                                <div className="bg-[#F0F2F5] rounded-4xl shadow-[0_20px_60px_rgba(0,0,0,0.10)] border border-white/80 p-10 lg:p-14">
                                    {children}
                                </div>
                            </div>
                        ) : (
                            <AuthBranding type="register" />
                        )}
                    </div>
                </motion.div>
            </div>

            <div className="md:hidden flex flex-col min-h-screen">
                <div className="bg-brand-blue flex items-center justify-center py-14 px-6">
                    <AuthBranding type={isLogin ? "login" : "register"} />
                </div>
                <svg
                    viewBox="0 0 1440 80"
                    preserveAspectRatio="none"
                    className="w-full h-8 block bg-[#F0F2F5] -mt-px"
                >
                    <path
                        d="M0,0 C360,60 1080,-20 1440,40 L1440,0 L0,0 Z"
                        fill="var(--color-blue-primary)"
                    />
                </svg>

                <div className="flex-1 flex items-start justify-center px-6 py-8 overflow-y-auto bg-[#F0F2F5]">
                    <div className="w-full max-w-md">{children}</div>
                </div>
            </div>
        </div>
    );
}
