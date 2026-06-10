import Link from "next/link";
import Navbar from "@/components/Navbar";
import FadeIn from "@/components/FadeIn";
import { supabaseAdmin } from "@/lib/supabase";

async function getUpdates() {
  try {
    const { data } = await supabaseAdmin
      .from("website_updates")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    return data || [];
  } catch {
    return [];
  }
}

function formatDate(d: string | null) {
  if (!d) return "";
  const date = new Date(d);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

export const dynamic = "force-dynamic";

function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; color: string }> = {
    "app-update": { label: "App 更新", color: "bg-accent-soft text-accent" },
    photo: { label: "照片", color: "bg-brown-warm/8 text-brown-warm" },
    thought: { label: "产品感想", color: "bg-brown-light/20 text-brown-mid" },
  };
  const { label, color } = config[type] || { label: type, color: "bg-brown-light/20 text-brown-mid" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.72rem] font-semibold ${color}`}>
      {label}
    </span>
  );
}

export default async function UpdatesPage() {
  const dbUpdates = await getUpdates();
  const hasData = dbUpdates.length > 0;

  const fallbackUpdates = [
    {
      type: "app-update" as const,
      date: "2025.06.10",
      version: "v2.4.0",
      title: "AI 教练语音交互正式上线",
      changelog: [
        { text: "训练中可通过语音与 AI 教练对话，获取实时指导", highlight: true },
        { text: "支持中文和英文两种语言", highlight: false },
        { text: "智能识别组间休息时机，主动提供动作建议", highlight: false },
        { text: "修复了训练计划在特定情况下不刷新的问题", highlight: false },
      ],
      why: "健身时双手通常不空闲——要么握着杠铃，要么在擦汗。文字交互的摩擦太大了。我们观察到很多用户在组间休息时才会看手机，所以把 AI 反馈的最佳时机设定在这个节点。语音让交互变得自然，就像旁边站着一个教练。",
      photos: [] as string[],
      content: "",
    },
    {
      type: "photo" as const,
      date: "2025.06.08",
      title: "周末在健身房的实测",
      content: "周末在健身房实际测试了语音交互的最终版本。发现在嘈杂环境下识别率还是有点受影响，但 AirPods 麦克风的效果好很多。另外组间休息时 Watch 震动提醒 + 语音反馈的组合体验很好，比预期的自然。",
      photos: ["语音交互测试", "Watch 端配合"],
      changelog: [],
      why: "",
      version: "",
    },
    {
      type: "thought" as const,
      date: "2025.06.06",
      title: "关于\"时机感\"的一些体会",
      content: "做 AI 教练这个功能让我深刻意识到，技术能力再强，如果介入的时机不对，用户感受就会很差。\n\n这就像现实中的教练——你在发力的时候他突然说话，会吓你一跳；但你刚放下杠铃、正在喘气的时候给一句\"这组做得不错，下一组可以加 2.5kg\"，就会觉得很有帮助。\n\n产品的\"时机感\"，可能比功能本身更重要。",
      changelog: [],
      why: "",
      photos: [],
      version: "",
    },
    {
      type: "app-update" as const,
      date: "2025.05.25",
      version: "v2.3.0",
      title: "身体准备度算法优化",
      changelog: [
        { text: "重新校准 HRV 和训练负荷的权重模型", highlight: true },
        { text: "新增「恢复建议」卡片", highlight: false },
        { text: "准备度低时自动推荐轻量训练方案", highlight: false },
        { text: "优化了 Apple Watch 数据同步速度", highlight: false },
      ],
      why: "收到很多用户反馈说准备度评分偏保守——明明感觉状态不错，但分数显示\"一般\"。分析后发现是 HRV 权重过高导致的。实际上很多人即使 HRV 波动，只要睡眠充足且没有过度训练，身体状态其实不差。所以我们调低了 HRV 的单一权重，加入了更多综合指标。",
      photos: [],
      content: "",
    },
  ];

  const updates = hasData
    ? dbUpdates.map((u) => ({
        type: u.type,
        date: formatDate(u.published_at),
        version: u.version || "",
        title: u.title,
        changelog: u.changelog || [],
        why: u.why || "",
        photos: u.photos || [],
        content: u.content || "",
      }))
    : fallbackUpdates;

  return (
    <>
      <Navbar />

      <header className="pt-35 pb-15 text-center max-w-[800px] mx-auto px-6">
        <h1 className="text-[clamp(2.5rem,5vw,3.5rem)] mb-4 tracking-tight">动态</h1>
        <p className="text-lg text-brown-muted max-w-[520px] mx-auto">
          App 更新记录、产品感想、以及日常的照片和灵感碎片。
        </p>
      </header>

      <section className="max-w-[900px] mx-auto px-6 md:px-15 pb-30">
        {updates.map((item, i) => (
          <FadeIn key={i}>
            <article className="mb-14 pb-14 border-b border-brown-light/12 last:border-b-0 last:mb-0 last:pb-0">
              <div className="flex items-center gap-3 mb-4">
                <TypeBadge type={item.type} />
                <span className="text-xs text-brown-light">{item.date}</span>
              </div>

              {item.type === "app-update" && item.version && (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brown-deep text-white rounded-full text-xs font-semibold mb-4">
                  {item.version}
                </div>
              )}

              <h2 className="font-serif text-2xl text-brown-deep mb-3 leading-snug">{item.title}</h2>

              {item.type === "app-update" && item.changelog?.length > 0 && (
                <ul className="list-none flex flex-col gap-2.5 mb-5">
                  {item.changelog.map((change: { text: string; highlight: boolean }, j: number) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-brown-mid leading-relaxed">
                      <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${change.highlight ? "bg-accent" : "bg-brown-light"}`} />
                      {change.text}
                    </li>
                  ))}
                </ul>
              )}

              {item.type === "app-update" && item.why && (
                <div className="p-5 bg-bg-alt border-l-3 border-brown-light rounded-r-xl mb-5">
                  <div className="text-xs font-semibold text-brown-warm tracking-wide uppercase mb-2">为什么做这个</div>
                  <p className="text-sm text-brown-muted leading-relaxed">{item.why}</p>
                </div>
              )}

              {item.type === "photo" && item.photos?.length > 0 && (
                <div className={`grid gap-3 mb-5 ${item.photos.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {item.photos.map((photo: string, j: number) => {
                    const isUrl = photo.startsWith("http");
                    return (
                      <div key={j} className="aspect-[4/3] bg-gradient-to-br from-surface to-brown-light/40 rounded-xl flex items-center justify-center text-brown-light relative overflow-hidden">
                        {isUrl ? (
                          <img src={photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                            <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-brown-deep/70 backdrop-blur-sm text-white text-[0.7rem] rounded-md">
                              {photo}
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {(item.type === "photo" || item.type === "thought") && item.content && (
                <p className="text-sm text-brown-muted leading-relaxed whitespace-pre-line">{item.content}</p>
              )}

              {item.type === "app-update" && (
                <Link
                  href="/#product"
                  className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-bg-alt border border-brown-light/20 rounded-full no-underline text-brown-deep text-sm font-medium hover:bg-surface hover:translate-x-1 transition-all"
                >
                  查看产品详情
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              )}
            </article>
          </FadeIn>
        ))}
      </section>

      <footer className="px-6 md:px-15 py-10 border-t border-brown-light/15 flex flex-col md:flex-row justify-between items-center text-xs text-brown-light gap-3">
        <span>&copy; 2025 DAY 1 Team</span>
        <Link href="/" className="text-brown-mid no-underline hover:text-brown-deep transition-colors">← 返回首页</Link>
      </footer>
    </>
  );
}
