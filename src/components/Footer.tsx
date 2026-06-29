import Link from "next/link";
import { getServerT } from "@/i18n/server";
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
  const [social, t] = await Promise.all([
    getSocialLinks(),
    getServerT(),
  ]);
  const links = social || {
    twitter: "",
    github: "",
    email: "",
    app_store: "",
    custom_links: [],
  };

  return (
    <footer className="border-t border-border px-6 md:px-15 pt-20 pb-10 bg-bg-alt">
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 md:gap-12">
        <div className="col-span-2 md:col-span-1">
          <h3 className="font-serif text-2xl text-text mb-3">
            DAY<span className="text-[1.15em] ml-0.5">1</span>
          </h3>
          <p className="text-sm text-text-muted leading-relaxed max-w-[300px]">
            {t("footer.tagline")}
          </p>
        </div>

        <div>
          <h4 className="font-sans text-xs font-semibold tracking-wider uppercase text-text mb-5">
            {t("footer.col.content")}
          </h4>
          <Link href="/thoughts" className="block text-sm text-text-muted no-underline mb-2.5 hover:text-text transition-colors">
            {t("footer.link.thoughts")}
          </Link>
          <Link href="/updates" className="block text-sm text-text-muted no-underline mb-2.5 hover:text-text transition-colors">
            {t("footer.link.updates")}
          </Link>
        </div>

        <div>
          <h4 className="font-sans text-xs font-semibold tracking-wider uppercase text-text mb-5">
            {t("footer.col.product")}
          </h4>
          <Link href="/#product" className="block text-sm text-text-muted no-underline mb-2.5 hover:text-text transition-colors">
            DAY 1 App
          </Link>
          {links.app_store && (
            <a href={links.app_store} target="_blank" rel="noopener noreferrer" className="block text-sm text-text-muted no-underline mb-2.5 hover:text-text transition-colors">
              App Store
            </a>
          )}
        </div>

        <div>
          <h4 className="font-sans text-xs font-semibold tracking-wider uppercase text-text mb-5">
            {t("footer.col.contact")}
          </h4>
          {links.twitter && (
            <a href={links.twitter} target="_blank" rel="noopener noreferrer" className="block text-sm text-text-muted no-underline mb-2.5 hover:text-text transition-colors">
              Twitter / X
            </a>
          )}
          {links.github && (
            <a href={links.github} target="_blank" rel="noopener noreferrer" className="block text-sm text-text-muted no-underline mb-2.5 hover:text-text transition-colors">
              GitHub
            </a>
          )}
          {links.email && (
            <a href={`mailto:${links.email}`} className="block text-sm text-text-muted no-underline mb-2.5 hover:text-text transition-colors">
              {links.email}
            </a>
          )}
          {links.custom_links?.map((link: { label: string; url: string }, i: number) => (
            link.url && (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-text-muted no-underline mb-2.5 hover:text-text transition-colors">
                {link.label || link.url}
              </a>
            )
          ))}
          {!links.twitter && !links.github && !links.email && (
            <>
              <span className="block text-sm text-text-soft mb-2.5">Twitter / X</span>
              <span className="block text-sm text-text-soft mb-2.5">GitHub</span>
              <span className="block text-sm text-text-soft mb-2.5">{t("footer.link.email")}</span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto mt-16 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center text-xs text-text-soft gap-3">
        <span>&copy; 2025 DAY 1 Team. {t("footer.rights")}</span>
        <span>{t("footer.built")}</span>
      </div>
    </footer>
  );
}
