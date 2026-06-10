import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 md:px-15 pt-30 pb-20 relative overflow-hidden">
        <div className="absolute -top-50 -right-50 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(201,168,140,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-25 -left-37 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(201,168,140,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-5 py-2 bg-surface rounded-full text-xs font-medium text-brown-muted mb-10 border border-brown-light/30">
          <span className="w-1.5 h-1.5 rounded-full bg-brown-warm" />
          正在构建中
        </div>

        <h1 className="text-[clamp(3rem,7vw,5.5rem)] font-bold mb-6 tracking-tighter text-brown-deep">
          Think Different,<br />
          Build <span className="italic text-brown-warm">Day One</span>
        </h1>

        <p className="text-lg text-brown-muted max-w-[600px] mb-12 font-light leading-relaxed">
          我们相信好的产品来自独立思考。这里记录着我们的思路、产品逻辑和每一个 DAY 1 的故事。
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            href="/thoughts"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brown-deep text-white rounded-full text-sm font-medium no-underline shadow-[0_4px_16px_rgba(61,43,31,0.2)] hover:bg-brown-warm hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(61,43,31,0.25)] transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            阅读思考
          </Link>
          <Link
            href="#product"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-transparent text-brown-deep border-[1.5px] border-brown-light rounded-full text-sm font-medium no-underline hover:border-brown-deep hover:bg-brown-deep/3 hover:-translate-y-0.5 transition-all"
          >
            了解产品
          </Link>
        </div>
      </section>

      {/* Thoughts Preview */}
      <section className="bg-bg-alt py-30 px-6 md:px-15" id="thoughts-preview">
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-semibold tracking-[3px] uppercase text-brown-muted mb-4">Latest Thoughts</span>
          <h2 className="text-[clamp(2rem,4vw,3rem)] mb-4">最新思考</h2>
          <p className="text-base text-brown-muted max-w-[560px] mx-auto">
            关于产品、设计与生活的独立思考，以及 DAY 1 功能背后的落地逻辑。
          </p>
        </div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
          <FadeIn className="lg:row-span-2">
            <Link href="/thoughts" className="block bg-white rounded-2xl overflow-hidden border border-brown-light/20 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(61,43,31,0.1)] transition-all no-underline text-inherit">
              <div className="w-full aspect-[16/12] bg-gradient-to-br from-surface to-brown-light/30 flex items-center justify-center text-brown-light">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              </div>
              <div className="p-7 pb-8">
                <span className="inline-block px-3 py-1 bg-accent-soft text-accent rounded-full text-xs font-semibold mb-3">产品思考</span>
                <h3 className="text-xl lg:text-2xl mb-3 leading-snug">为什么我们选择用 AI 重新定义健身记录</h3>
                <p className="text-sm text-brown-muted leading-relaxed line-clamp-3">
                  传统健身 App 的问题在于它们只是电子化了纸质记录。我们认为，真正的突破在于让 AI 理解你的训练语境，而不是让你适应软件的逻辑。这篇文章记录了 DAY 1 产品核心理念的形成过程...
                </p>
                <div className="mt-5 pt-4 border-t border-brown-light/15 flex justify-between text-xs text-brown-light">
                  <span>2025 年 6 月 8 日</span>
                  <span>12 分钟阅读</span>
                </div>
              </div>
            </Link>
          </FadeIn>

          <FadeIn>
            <Link href="/thoughts" className="block bg-white rounded-2xl overflow-hidden border border-brown-light/20 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(61,43,31,0.1)] transition-all no-underline text-inherit">
              <div className="w-full aspect-[16/10] bg-gradient-to-br from-surface to-brown-light/30 flex items-center justify-center text-brown-light">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <div className="p-7">
                <span className="inline-block px-3 py-1 bg-accent-soft text-accent rounded-full text-xs font-semibold mb-3">功能逻辑</span>
                <h3 className="text-lg mb-3 leading-snug">「身体准备度」功能的设计逻辑</h3>
                <p className="text-sm text-brown-muted leading-relaxed line-clamp-3">
                  如何将 HRV、睡眠、训练负荷等多维度数据融合成一个直观的准备度评分...
                </p>
                <div className="mt-5 pt-4 border-t border-brown-light/15 flex justify-between text-xs text-brown-light">
                  <span>2025 年 6 月 5 日</span>
                  <span>8 分钟阅读</span>
                </div>
              </div>
            </Link>
          </FadeIn>

          <FadeIn>
            <Link href="/thoughts" className="block bg-white rounded-2xl overflow-hidden border border-brown-light/20 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(61,43,31,0.1)] transition-all no-underline text-inherit">
              <div className="w-full aspect-[16/10] bg-gradient-to-br from-surface to-brown-light/30 flex items-center justify-center text-brown-light">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div className="p-7">
                <span className="inline-block px-3 py-1 bg-accent-soft text-accent rounded-full text-xs font-semibold mb-3">个人思考</span>
                <h3 className="text-lg mb-3 leading-snug">独立开发者的产品观：少即是多</h3>
                <p className="text-sm text-brown-muted leading-relaxed line-clamp-3">
                  在资源有限的情况下，如何做减法比做加法更重要。分享我的一些产品取舍心得...
                </p>
                <div className="mt-5 pt-4 border-t border-brown-light/15 flex justify-between text-xs text-brown-light">
                  <span>2025 年 5 月 28 日</span>
                  <span>6 分钟阅读</span>
                </div>
              </div>
            </Link>
          </FadeIn>
        </div>

        <div className="text-center mt-12">
          <Link href="/thoughts" className="inline-flex items-center gap-1.5 text-sm font-medium text-brown-deep no-underline hover:gap-2.5 transition-all">
            查看全部思考
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* Ornament */}
      <div className="flex items-center justify-center gap-4 py-15">
        <div className="w-15 h-px bg-brown-light" />
        <div className="w-1.5 h-1.5 rounded-full bg-brown-warm" />
        <div className="w-15 h-px bg-brown-light" />
      </div>

      {/* Updates Preview */}
      <section className="max-w-[900px] mx-auto px-6 md:px-15 pb-30" id="updates-preview">
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-semibold tracking-[3px] uppercase text-brown-muted mb-4">Recent Updates</span>
          <h2 className="text-[clamp(2rem,4vw,3rem)] mb-4">最新动态</h2>
          <p className="text-base text-brown-muted max-w-[560px] mx-auto">
            App 更新记录、产品感想，以及我们的日常。
          </p>
        </div>

        <div className="relative pl-10 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1.5px] before:bg-gradient-to-b before:from-brown-light before:to-transparent">
          {[
            { date: "2025.06.10", title: "v2.4 上线 — AI 教练语音交互", text: "训练过程中可以通过语音与 AI 教练对话。为什么要做这个功能？因为健身时双手不空闲，文字交互的摩擦太大了。", hasLink: true },
            { date: "2025.06.06", title: "完成了语音交互原型测试", text: "在健身房实测了几组，发现反馈时机很关键——太早显得唐突，太晚失去指导意义。最终确定在组间休息时主动反馈。", hasLink: false },
            { date: "2025.05.25", title: "v2.3 上线 — 身体准备度算法优化", text: "重新校准了 HRV 和训练负荷的权重模型。用户反馈说之前的评分偏保守，调整后更贴合真实感受。", hasLink: true },
          ].map((item, i) => (
            <FadeIn key={i}>
              <Link
                href="/updates"
                className="relative block mb-12 p-7 bg-white rounded-xl border border-brown-light/15 no-underline text-inherit hover:shadow-[0_8px_24px_rgba(61,43,31,0.08)] hover:translate-x-1 transition-all before:content-[''] before:absolute before:-left-12 before:top-9 before:w-2.5 before:h-2.5 before:rounded-full before:bg-brown-warm before:border-[3px] before:border-bg before:shadow-[0_0_0_2px_var(--color-brown-light)]"
              >
                <div className="text-xs text-brown-light font-medium tracking-wide mb-2">{item.date}</div>
                <div className="text-lg font-serif text-brown-deep mb-2">{item.title}</div>
                <p className="text-sm text-brown-muted leading-relaxed">{item.text}</p>
                {item.hasLink && (
                  <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-brown-deep">
                    查看产品详情 →
                  </span>
                )}
              </Link>
            </FadeIn>
          ))}
        </div>

        <div className="text-center">
          <Link href="/updates" className="inline-flex items-center gap-1.5 text-sm font-medium text-brown-deep no-underline hover:gap-2.5 transition-all">
            查看全部动态
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* Product Section */}
      <section className="bg-brown-deep py-30 px-6 md:px-15 text-white" id="product">
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-semibold tracking-[3px] uppercase text-brown-light mb-4">Our Product</span>
          <h2 className="text-[clamp(2rem,4vw,3rem)] mb-4 text-white">DAY 1 — 你的智能健身伙伴</h2>
          <p className="text-base text-white/60 max-w-[560px] mx-auto">
            用 AI 重新定义训练记录与恢复管理，让每一天都是最好的 Day 1。
          </p>
        </div>

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="lg:pr-10">
            <h3 className="font-serif text-3xl text-white mb-5">
              不只是记录，<br />更是理解
            </h3>
            <p className="text-white/65 text-base leading-relaxed mb-8">
              DAY 1 结合 Apple Health 数据和 AI 分析，帮你了解身体状态，智能规划训练，并在你需要时提供个性化的教练建议。
            </p>
            <ul className="list-none flex flex-col gap-4">
              {[
                "AI 实时教练 — 训练中的智能语音指导",
                "身体准备度 — 基于 HRV/睡眠的每日状态评估",
                "智能训练计划 — 根据恢复情况动态调整",
                "Apple Watch 联动 — 手腕上的训练助手",
                "训练数据分析 — 可视化你的进步轨迹",
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-white/80 text-sm">
                  <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full aspect-[3/4] bg-gradient-to-br from-white/5 to-white/2 rounded-2xl border border-white/8 flex items-center justify-center relative overflow-hidden">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white/15"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>
          </div>
        </div>
      </section>

      {/* Code Section */}
      <section className="bg-bg-alt py-30 px-6 md:px-15" id="code">
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-semibold tracking-[3px] uppercase text-brown-muted mb-4">Under The Hood</span>
          <h2 className="text-[clamp(2rem,4vw,3rem)] mb-4">技术展示</h2>
          <p className="text-base text-brown-muted max-w-[560px] mx-auto">
            DAY 1 背后的一些核心代码片段，展示我们的技术实现方式。
          </p>
        </div>

        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          <FadeIn>
            <div className="bg-[#1E1510] rounded-2xl overflow-hidden border border-brown-light/15">
              <div className="px-6 py-4 flex items-center justify-between border-b border-brown-light/10">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                  <span className="w-2.5 h-2.5 rounded-full bg-brown-light/30" />
                  <span className="w-2.5 h-2.5 rounded-full bg-brown-light/30" />
                </div>
                <span className="font-mono text-xs text-brown-light/60">ReadinessEngine.swift</span>
              </div>
              <div className="p-6 font-mono text-xs leading-7 text-bg/80 overflow-x-auto">
                <div><span className="text-brown-light/40 italic">// 身体准备度计算核心</span></div>
                <div><span className="text-[#E8A87C]">struct</span> <span className="text-[#D4A574]">ReadinessEngine</span> {"{"}</div>
                <div>&nbsp;&nbsp;<span className="text-[#E8A87C]">func</span> <span className="text-[#F0DCC8]">calculate</span>(</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;hrv: <span className="text-[#D4A574]">Double</span>,</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;sleepQuality: <span className="text-[#D4A574]">Double</span>,</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;trainingLoad: <span className="text-[#D4A574]">Double</span></div>
                <div>&nbsp;&nbsp;) -&gt; <span className="text-[#D4A574]">ReadinessScore</span> {"{"}</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#E8A87C]">let</span> recovery = hrv * <span className="text-[#C9A88C]">0.4</span></div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ sleepQuality * <span className="text-[#C9A88C]">0.35</span></div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (<span className="text-[#C9A88C]">1.0</span> - trainingLoad) * <span className="text-[#C9A88C]">0.25</span></div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#E8A87C]">return</span> ReadinessScore(</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;value: recovery,</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;level: recovery &gt; <span className="text-[#C9A88C]">0.7</span> ? .ready : .moderate</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;)</div>
                <div>&nbsp;&nbsp;{"}"}</div>
                <div>{"}"}</div>
              </div>
            </div>
          </FadeIn>

          <FadeIn className="flex flex-col justify-center gap-6">
            <h3 className="text-3xl">开放透明的<br />技术实现</h3>
            <p className="text-base text-brown-muted leading-relaxed">
              我们相信技术应该是透明的。这里展示 DAY 1 的部分核心逻辑，包括准备度算法、AI 交互引擎等关键模块的实现方式。
            </p>
            <p className="text-base text-brown-muted leading-relaxed">
              这些代码片段面向团队内部和对技术感兴趣的用户，帮助大家理解 DAY 1 &ldquo;为什么这样工作&rdquo;。
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface rounded-lg text-xs text-brown-muted w-fit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              功能性展示 · 非完整源码
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-30 px-6 md:px-15" id="team">
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-semibold tracking-[3px] uppercase text-brown-muted mb-4">The Team</span>
          <h2 className="text-[clamp(2rem,4vw,3rem)] mb-4">我们的团队</h2>
          <p className="text-base text-brown-muted max-w-[560px] mx-auto">
            一群热爱健身和技术的人，致力于让训练变得更智能。
          </p>
        </div>

        <div className="max-w-[1000px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            { initial: "L", name: "创始人", role: "产品 & 设计", bio: "独立开发者，热爱用技术解决真实问题。相信好的产品来自对生活的细致观察。" },
            { initial: "A", name: "成员 A", role: "iOS 开发", bio: "Swift 爱好者，专注于流畅的用户体验和性能优化。让每一帧都丝滑如初。" },
            { initial: "B", name: "成员 B", role: "AI & 后端", bio: "机器学习工程师，负责 AI 教练和智能推荐算法。让数据有温度。" },
          ].map((member) => (
            <FadeIn key={member.initial}>
              <div className="text-center p-10 bg-white rounded-2xl border border-brown-light/15 hover:-translate-y-1.5 hover:shadow-[0_16px_48px_rgba(61,43,31,0.1)] transition-all">
                <div className="w-25 h-25 rounded-full bg-gradient-to-br from-surface to-brown-light mx-auto mb-5 flex items-center justify-center text-3xl text-white border-3 border-white shadow-sm">
                  {member.initial}
                </div>
                <div className="font-serif text-lg text-brown-deep mb-1">{member.name}</div>
                <div className="text-xs text-brown-warm font-medium mb-3">{member.role}</div>
                <p className="text-sm text-brown-muted leading-relaxed">{member.bio}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
