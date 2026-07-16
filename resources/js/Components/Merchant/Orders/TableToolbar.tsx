import { Calendar, Filter, Download } from "lucide-react";

export default function TableToolbar() {
    return (
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Last 7 Days
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4 text-gray-400" />
                    All Status
                </button>
            </div>
            <button className="flex items-center gap-2 text-sm font-bold text-[#14433D] hover:text-[#41B9C5] transition-colors">
                <Download className="w-4 h-4" />
                Export CSV
            </button>
        </div>
    );
}
