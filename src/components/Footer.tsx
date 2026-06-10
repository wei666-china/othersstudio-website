import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";

async function getSocialLinks() {
  try {
    const { data } = await supabaseAdmin
      .from("website_settings")
      .select("value")
      .eq("key", "social")
      .single();
    return data?.value || null;
  } catch {
    return null;
  }
}

export default async function Footer() {
  const social = await getSocialLinks() || {
    twitter: "",
    github: "",
    email: "",
    app_store: "",
    custom_links: [],
  };

  return (
    <footer className="border-t border-brown-light/15 px-6 md:px-15 pt-20 pb-10">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-15">
        <div>
          <h3 className="font-serif text-2xl text-brown-deep mb-3">DAY 1</h3>
          <p className="text-sm text-brown-muted leading-relaxed max-w-[300px]">
            记录思考，构建产品。<br />
            每一天都是新的 Day 1。
          </p>
        </div>

        <div>
          <h4 className="font-sans text-xs font-semibold tracking-wider uppercase text-brown-deep mb-5">
            内容
          </h4>
          <Link href="/thoughts" className="block text-sm text-brown-muted no-underline mb-2.5 hover:text-brown-deep transition-colors">
            思考与思路
          </Link>
          <Link href="/updates" className="block text-sm text-brown-muted no-underline mb-2.5 hover:text-brown-deep transition-colors">
            动态更新
          </Link>
        </div>

        <div>
          <h4 className="font-sans text-xs font-semibold tracking-wider uppercase text-brown-deep mb-5">
            产品
          </h4>
          <Link href="/#product" className="block text-sm text-brown-muted no-underline mb-2.5 hover:text-brown-deep transition-colors">
            DAY 1 App
          </Link>
          {social.app_store && (
            <a href={social.app_store} target="_blank" rel="noopener noreferrer" className="block text-sm text-brown-muted no-underline mb-2.5 hover:text-brown-deep transition-colors">
              App Store
            </a>
          )}
        </div>

        <div>
          <h4 className="font-sans text-xs font-semibold tracking-wider uppercase text-brown-deep mb-5">
            联系
          </h4>
          {social.twitter && (
            <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="block text-sm text-brown-muted no-underline mb-2.5 hover:text-brown-deep transition-colors">
              Twitter / X
            </a>
          )}
          {social.github && (
            <a href={social.github} target="_blank" rel="noopener noreferrer" className="block text-sm text-brown-muted no-underline mb-2.5 hover:text-brown-deep transition-colors">
              GitHub
            </a>
          )}
          {social.email && (
            <a href={`mailto:${social.email}`} className="block text-sm text-brown-muted no-underline mb-2.5 hover:text-brown-deep transition-colors">
              {social.email}
            </a>
          )}
          {social.custom_links?.map((link: { label: string; url: string }, i: number) => (
            link.url && (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-brown-muted no-underline mb-2.5 hover:text-brown-deep transition-colors">
                {link.label || link.url}
              </a>
            )
          ))}
          {!social.twitter && !social.github && !social.email && (
            <>
              <span className="block text-sm text-brown-light mb-2.5">Twitter / X</span>
              <span className="block text-sm text-brown-light mb-2.5">GitHub</span>
              <span className="block text-sm text-brown-light mb-2.5">邮箱</span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto mt-15 pt-6 border-t border-brown-light/10 flex flex-col md:flex-row justify-between items-center text-xs text-brown-light gap-3">
        <span>&copy; 2025 DAY 1 Team. All rights reserved.</span>
        <span>Built with care.</span>
      </div>
    </footer>
  );
}
