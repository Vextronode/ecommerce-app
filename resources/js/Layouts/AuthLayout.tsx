import { PropsWithChildren, useLayoutEffect, useRef } from "react";
import { usePage } from "@inertiajs/react";
// eslint-disable-next-line react-doctor/use-lazy-motion
import { motion, useAnimation } from "framer-motion";
import AuthBranding from "@/Components/AuthBranding";

const WaveEdge = ({ side }: { side: "right" | "left" }) => (
    <div
        className="absolute top-0 bottom-0 w-14 xl:w-16 text-brand-blue pointer-events-none"
        style={
            side === "right"
                ? { left: "calc(100% - 1px)" }
                : { right: "calc(100% - 1px)", transform: "scaleX(-1)" }
        }
    >
        <svg
            viewBox="0 0 100 1000"
            preserveAspectRatio="none"
            className="w-full h-full fill-current"
        >
            <path d="M 0,0 L 55,0 C 72,36 85,64 85,100 C 85,173 25,227 25,300 C 25,373 85,427 85,500 C 85,573 25,627 25,700 C 25,773 85,827 85,900 C 85,936 72,964 55,1000 L 0,1000 Z" />
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
        <div className="relative w-full min-h-screen overflow-hidden bg-bg-main">
            {/* Desktop Two-Column View with Animated Sliding Wave Panel (Visible on lg and larger) */}
            <div className="hidden lg:flex relative w-full h-screen">
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
                    {/* Left Column */}
                    <div
                        className={`w-1/2 h-full flex items-center ${
                            isLogin
                                ? "justify-center px-6 lg:px-10"
                                : "justify-center xl:justify-end pr-20 xl:pr-28 pl-6 lg:pl-10"
                        } py-6 overflow-y-auto`}
                    >
                        {isLogin ? (
                            <AuthBranding type="login" />
                        ) : (
                            <div className="w-full max-w-[390px] xl:max-w-[440px] my-auto">
                                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-7 xl:p-8">
                                    {children}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div
                        className={`w-1/2 h-full flex items-center ${
                            isLogin
                                ? "justify-center xl:justify-start pl-20 xl:pl-28 pr-6 lg:pr-10"
                                : "justify-center px-6 lg:px-10"
                        } py-6 overflow-y-auto`}
                    >
                        {isLogin ? (
                            <div className="w-full max-w-[390px] xl:max-w-[440px] my-auto">
                                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-7 xl:p-8">
                                    {children}
                                </div>
                            </div>
                        ) : (
                            <AuthBranding type="register" />
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Mobile & Tablet Clean Stacked View (< 1024px, avoids wave collision on narrow viewports) */}
            <div className="lg:hidden flex flex-col min-h-screen bg-bg-main">
                <div className="bg-brand-blue flex items-center justify-center py-8 sm:py-10 px-6 relative">
                    <AuthBranding type={isLogin ? "login" : "register"} />
                </div>
                <svg
                    viewBox="0 0 1440 80"
                    preserveAspectRatio="none"
                    className="w-full h-8 block bg-bg-main -mt-px text-brand-blue"
                >
                    <path
                        d="M0,0 C360,60 1080,-20 1440,40 L1440,0 L0,0 Z"
                        fill="currentColor"
                    />
                </svg>

                <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
