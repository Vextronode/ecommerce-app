import React from "react";

export default function OrderStatus() {
    return (
        <div className="bg-white rounded-3xl p-6 border border-[#41B9C5]/30 shadow-sm flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-5">
                Order Status
            </h3>

            <div className="space-y-4 flex-1">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
                        <span className="text-sm text-gray-600 font-medium">
                            Pending
                        </span>
                    </div>
                    <span className="text-sm font-bold text-[#004F54]">45</span>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#41B9C5]"></div>
                        <span className="text-sm text-gray-600 font-medium">
                            Processing
                        </span>
                    </div>
                    <span className="text-sm font-bold text-[#004F54]">
                        120
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                        <span className="text-sm text-gray-600 font-medium">
                            Shipped
                        </span>
                    </div>
                    <span className="text-sm font-bold text-[#004F54]">32</span>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#004F54]"></div>
                        <span className="text-sm text-gray-600 font-medium">
                            Completed
                        </span>
                    </div>
                    <span className="text-sm font-bold text-[#004F54]">
                        1,248
                    </span>
                </div>
            </div>

            <div className="w-full h-2 flex rounded-full overflow-hidden mt-6 bg-gray-100">
                <div
                    className="bg-gray-400 h-full"
                    style={{ width: "5%" }}
                ></div>
                <div
                    className="bg-[#41B9C5] h-full"
                    style={{ width: "15%" }}
                ></div>
                <div
                    className="bg-blue-400 h-full"
                    style={{ width: "10%" }}
                ></div>
                <div
                    className="bg-[#004F54] h-full"
                    style={{ width: "70%" }}
                ></div>
            </div>
        </div>
    );
}
