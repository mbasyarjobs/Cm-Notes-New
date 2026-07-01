import { Instagram, Globe, MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer id="app-footer" className="border-t border-gray-200 dark:border-white/5 bg-white/50 dark:bg-[#0c0c0e] backdrop-blur-sm py-6 mt-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-500 dark:text-slate-400 font-medium">
          &copy; 2026 <span className="text-emerald-500 font-semibold">M Khoirul Basyar</span>. All Rights Reserved.
        </div>
        
        <div className="flex items-center gap-5">
          <a
            id="social-tiktok"
            href="https://tiktok.com/@username"
            target="_blank"
            referrerPolicy="no-referrer"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 font-medium transition-colors duration-150"
            title="TikTok"
          >
            <MessageSquare size={16} />
            <span className="hidden sm:inline">TikTok</span>
          </a>
          
          <a
            id="social-instagram"
            href="https://instagram.com/username"
            target="_blank"
            referrerPolicy="no-referrer"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-pink-500 dark:text-slate-400 dark:hover:text-pink-400 font-medium transition-colors duration-150"
            title="Instagram"
          >
            <Instagram size={16} />
            <span className="hidden sm:inline">Instagram</span>
          </a>
          
          <a
            id="social-website"
            href="https://example.com"
            target="_blank"
            referrerPolicy="no-referrer"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white dark:text-slate-400 dark:hover:text-white font-medium transition-colors duration-150"
            title="Website Pribadi"
          >
            <Globe size={16} />
            <span className="hidden sm:inline">Website</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
