// AI 顾问 demo —— 训练计划数据模型 + 预设规则引擎
//
// 这个文件是 demo 的「兜底大脑」：无论真 AI（Cloudflare Worker）有没有接通，
// 它都能根据访客选择产出一张结构合理、贴合 App 真实计划形态的训练计划卡。
// 真 AI 接通时，AI 按相同的 PlanCard 结构输出，再由 coerceAIPlan 校验归一。

export type Goal = "muscle" | "fatloss" | "shape" | "strength";
export type Equipment = "gym" | "dumbbell" | "bodyweight";
export type Experience = "beginner" | "intermediate";

export interface AdvisorInput {
  goal: Goal;
  daysPerWeek: number; // 2..6
  equipment: Equipment;
  experience: Experience;
}

export interface PlanExercise {
  name: string;
  muscle: string;
  sets: number;
  reps: string; // 如 "8-12"
}

export interface PlanDay {
  title: string; // 如 "推 · 胸 / 肩 / 三头"
  exercises: PlanExercise[];
}

export interface PlanCard {
  name: string; // 计划名，如 "增肌 · 推 / 拉 / 腿"
  goalLabel: string;
  splitLabel: string;
  perWeek: number;
  days: PlanDay[];
  note: string;
  source: "ai" | "preset"; // 标记这张卡是真 AI 还是预设兜底
}

// ── 前端表单选项（demo 初版中文；i18n 阶段再双语化）──────────────────

export const GOAL_OPTIONS: { value: Goal; label: string; desc: string }[] = [
  { value: "muscle", label: "增肌", desc: "增加肌肉维度与围度" },
  { value: "fatloss", label: "减脂", desc: "降低体脂、保留肌肉" },
  { value: "shape", label: "塑形", desc: "线条紧致、体态优化" },
  { value: "strength", label: "力量", desc: "提升最大力量表现" },
];

export const EQUIPMENT_OPTIONS: { value: Equipment; label: string; desc: string }[] = [
  { value: "gym", label: "健身房", desc: "杠铃 / 器械齐全" },
  { value: "dumbbell", label: "家用哑铃", desc: "一对可调哑铃" },
  { value: "bodyweight", label: "纯徒手", desc: "无需任何器械" },
];

export const EXPERIENCE_OPTIONS: { value: Experience; label: string; desc: string }[] = [
  { value: "beginner", label: "新手", desc: "训练 1 年以内" },
  { value: "intermediate", label: "进阶", desc: "有稳定训练基础" },
];

export const MIN_DAYS = 2;
export const MAX_DAYS = 6;

// ── 动作库（按器械 → 部位）──────────────────────────────────────────

type Move = { name: string; muscle: string };
type PartKey = "chest" | "back" | "legs" | "shoulders" | "biceps" | "triceps" | "glutes" | "core";
type EquipmentDB = Record<PartKey, Move[]>;

const EXERCISE_DB: Record<Equipment, EquipmentDB> = {
  gym: {
    chest: [
      { name: "杠铃卧推", muscle: "胸大肌" },
      { name: "上斜哑铃卧推", muscle: "上胸" },
      { name: "坐姿器械夹胸", muscle: "胸大肌" },
      { name: "双杠臂屈伸", muscle: "下胸" },
    ],
    back: [
      { name: "高位下拉", muscle: "背阔肌" },
      { name: "杠铃俯身划船", muscle: "中背" },
      { name: "坐姿绳索划船", muscle: "中背" },
      { name: "直臂下拉", muscle: "背阔肌" },
    ],
    legs: [
      { name: "杠铃深蹲", muscle: "股四头肌" },
      { name: "腿举", muscle: "股四头肌" },
      { name: "罗马尼亚硬拉", muscle: "腘绳肌" },
      { name: "坐姿腿屈伸", muscle: "股四头肌" },
    ],
    shoulders: [
      { name: "坐姿哑铃推举", muscle: "三角肌前束" },
      { name: "哑铃侧平举", muscle: "三角肌中束" },
      { name: "绳索面拉", muscle: "三角肌后束" },
    ],
    biceps: [
      { name: "杠铃弯举", muscle: "肱二头肌" },
      { name: "哑铃锤式弯举", muscle: "肱肌" },
      { name: "斜托弯举", muscle: "肱二头肌" },
    ],
    triceps: [
      { name: "绳索下压", muscle: "肱三头肌" },
      { name: "仰卧臂屈伸", muscle: "肱三头肌" },
      { name: "窄距卧推", muscle: "肱三头肌" },
    ],
    glutes: [
      { name: "杠铃臀推", muscle: "臀大肌" },
      { name: "保加利亚分腿蹲", muscle: "臀 / 腿" },
      { name: "臀桥", muscle: "臀大肌" },
    ],
    core: [
      { name: "挂腿举", muscle: "腹直肌" },
      { name: "平板支撑", muscle: "核心" },
      { name: "绳索卷腹", muscle: "腹直肌" },
      { name: "俄罗斯转体", muscle: "腹斜肌" },
    ],
  },
  dumbbell: {
    chest: [
      { name: "哑铃平板卧推", muscle: "胸大肌" },
      { name: "上斜哑铃卧推", muscle: "上胸" },
      { name: "哑铃飞鸟", muscle: "胸大肌" },
    ],
    back: [
      { name: "单臂哑铃划船", muscle: "背阔肌" },
      { name: "哑铃俯身划船", muscle: "中背" },
      { name: "哑铃硬拉", muscle: "背 / 腘绳" },
      { name: "哑铃耸肩", muscle: "斜方肌" },
    ],
    legs: [
      { name: "高脚杯深蹲", muscle: "股四头肌" },
      { name: "哑铃箭步蹲", muscle: "股四 / 臀" },
      { name: "哑铃罗马尼亚硬拉", muscle: "腘绳肌" },
      { name: "哑铃深蹲", muscle: "股四头肌" },
    ],
    shoulders: [
      { name: "哑铃推举", muscle: "三角肌前束" },
      { name: "哑铃侧平举", muscle: "三角肌中束" },
      { name: "哑铃俯身飞鸟", muscle: "三角肌后束" },
    ],
    biceps: [
      { name: "哑铃交替弯举", muscle: "肱二头肌" },
      { name: "锤式弯举", muscle: "肱肌" },
      { name: "集中弯举", muscle: "肱二头肌" },
    ],
    triceps: [
      { name: "哑铃过顶臂屈伸", muscle: "肱三头肌" },
      { name: "哑铃俯身臂屈伸", muscle: "肱三头肌" },
      { name: "哑铃窄卧推", muscle: "肱三头肌" },
    ],
    glutes: [
      { name: "哑铃臀桥", muscle: "臀大肌" },
      { name: "哑铃保加利亚分腿蹲", muscle: "臀 / 腿" },
      { name: "哑铃相扑硬拉", muscle: "臀 / 腘绳" },
    ],
    core: [
      { name: "哑铃俄罗斯转体", muscle: "腹斜肌" },
      { name: "平板支撑", muscle: "核心" },
      { name: "仰卧卷腹", muscle: "腹直肌" },
    ],
  },
  bodyweight: {
    chest: [
      { name: "标准俯卧撑", muscle: "胸大肌" },
      { name: "上斜俯卧撑", muscle: "下胸" },
      { name: "钻石俯卧撑", muscle: "胸 / 三头" },
      { name: "宽距俯卧撑", muscle: "胸大肌" },
    ],
    back: [
      { name: "引体向上", muscle: "背阔肌" },
      { name: "反手引体", muscle: "背 / 二头" },
      { name: "桌下仰卧划船", muscle: "中背" },
      { name: "俯卧超人", muscle: "竖脊肌" },
    ],
    legs: [
      { name: "自重深蹲", muscle: "股四头肌" },
      { name: "箭步蹲", muscle: "股四 / 臀" },
      { name: "保加利亚分腿蹲", muscle: "臀 / 腿" },
      { name: "单腿罗马尼亚硬拉", muscle: "腘绳肌" },
    ],
    shoulders: [
      { name: "派克俯卧撑", muscle: "三角肌" },
      { name: "扶墙倒立撑", muscle: "三角肌" },
      { name: "俯卧 Y-T-W", muscle: "三角肌后束" },
    ],
    biceps: [
      { name: "窄距反手引体", muscle: "肱二头肌" },
      { name: "毛巾等长弯举", muscle: "肱二头肌" },
    ],
    triceps: [
      { name: "双杠臂屈伸", muscle: "肱三头肌" },
      { name: "钻石俯卧撑", muscle: "肱三头肌" },
      { name: "长凳反向臂屈伸", muscle: "肱三头肌" },
    ],
    glutes: [
      { name: "单腿臀桥", muscle: "臀大肌" },
      { name: "臀桥", muscle: "臀大肌" },
      { name: "俯卧后抬腿", muscle: "臀大肌" },
    ],
    core: [
      { name: "平板支撑", muscle: "核心" },
      { name: "登山者", muscle: "核心" },
      { name: "卷腹", muscle: "腹直肌" },
      { name: "俄罗斯转体", muscle: "腹斜肌" },
    ],
  },
};

// ── 训练日模板（每个 5 个槽位，新手取前 4，进阶取全部 5）──────────────

const DAY_TEMPLATES: Record<string, { label: string; slots: PartKey[] }> = {
  push: { label: "推 · 胸 / 肩 / 三头", slots: ["chest", "chest", "shoulders", "triceps", "shoulders"] },
  pushB: { label: "推 · 肩 / 胸 / 三头", slots: ["shoulders", "chest", "shoulders", "triceps", "chest"] },
  pull: { label: "拉 · 背 / 二头", slots: ["back", "back", "biceps", "back", "core"] },
  pullB: { label: "拉 · 背 / 二头 / 核心", slots: ["back", "biceps", "back", "core", "back"] },
  legs: { label: "腿 · 股四 / 臀 / 腘绳", slots: ["legs", "legs", "glutes", "legs", "core"] },
  legsB: { label: "腿 · 臀 / 腘绳 / 核心", slots: ["legs", "glutes", "legs", "core", "glutes"] },
  upperA: { label: "上肢 · 胸背肩臂", slots: ["chest", "back", "shoulders", "biceps", "triceps"] },
  upperB: { label: "上肢 · 背胸肩臂", slots: ["back", "chest", "shoulders", "triceps", "biceps"] },
  lowerA: { label: "下肢 · 腿 / 臀 / 核心", slots: ["legs", "legs", "glutes", "core", "legs"] },
  lowerB: { label: "下肢 · 臀 / 腿 / 核心", slots: ["legs", "glutes", "legs", "core", "glutes"] },
  fullA: { label: "全身 A · 胸背腿核心", slots: ["chest", "back", "legs", "shoulders", "core"] },
  fullB: { label: "全身 B · 肩腿背臂", slots: ["shoulders", "legs", "back", "biceps", "core"] },
  chestDay: { label: "胸 · 厚度与轮廓", slots: ["chest", "chest", "chest", "shoulders", "triceps"] },
  backDay: { label: "背 · 宽度与厚度", slots: ["back", "back", "back", "biceps", "core"] },
  legsDay: { label: "腿 · 力量与维度", slots: ["legs", "legs", "glutes", "legs", "core"] },
  shouldersDay: { label: "肩 · 三角肌三束", slots: ["shoulders", "shoulders", "shoulders", "triceps", "core"] },
  armsDay: { label: "臂 · 二头 / 三头", slots: ["biceps", "triceps", "biceps", "triceps", "core"] },
};

function splitForDays(days: number): string[] {
  switch (days) {
    case 2:
      return ["fullA", "fullB"];
    case 3:
      return ["push", "pull", "legs"];
    case 4:
      return ["upperA", "lowerA", "upperB", "lowerB"];
    case 5:
      return ["chestDay", "backDay", "legsDay", "shouldersDay", "armsDay"];
    case 6:
      return ["push", "pull", "legs", "pushB", "pullB", "legsB"];
    default:
      return ["push", "pull", "legs"];
  }
}

const SPLIT_LABEL: Record<number, string> = {
  2: "全身分化",
  3: "推 / 拉 / 腿",
  4: "上 / 下肢分化",
  5: "五分化",
  6: "推拉腿 ×2",
};

const GOAL_CONF: Record<Goal, { name: string; label: string; sets: number; reps: string; note: string }> = {
  muscle: {
    name: "增肌",
    label: "增肌",
    sets: 4,
    reps: "8-12",
    note: "以渐进超负荷为核心：每次训练争取比上次多 1-2 次，或加一点重量。",
  },
  strength: {
    name: "力量",
    label: "力量",
    sets: 5,
    reps: "3-6",
    note: "大重量、低次数，组间休息 2-3 分钟，动作质量永远优先于重量。",
  },
  fatloss: {
    name: "减脂",
    label: "减脂",
    sets: 3,
    reps: "12-15",
    note: "训练后加 15-25 分钟有氧；但减脂的关键仍是饮食上的热量缺口。",
  },
  shape: {
    name: "塑形",
    label: "塑形",
    sets: 3,
    reps: "12-15",
    note: "中等重量、控制离心、充分挤压目标肌群，感受发力比堆重量更重要。",
  },
};

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function buildDay(
  eqDB: EquipmentDB,
  tpl: { label: string; slots: PartKey[] },
  exCount: number,
  sets: number,
  reps: string
): PlanDay {
  const counter: Partial<Record<PartKey, number>> = {};
  const exercises: PlanExercise[] = tpl.slots.slice(0, exCount).map((part) => {
    const pool = eqDB[part];
    const used = counter[part] ?? 0;
    counter[part] = used + 1;
    const move = pool[used % pool.length];
    return { name: move.name, muscle: move.muscle, sets, reps };
  });
  return { title: tpl.label, exercises };
}

function buildNote(input: AdvisorInput): string {
  const goal = GOAL_CONF[input.goal] ?? GOAL_CONF.muscle;
  const expTip =
    input.experience === "beginner"
      ? "新手前 4 周先把动作模式练标准，重量宁轻勿重。"
      : "可在每个动作最后一组尝试递减组，提升训练强度。";
  return `${goal.note} ${expTip}`;
}

/** 预设规则引擎：永远返回一张合理的计划卡（真 AI 的兜底）。 */
export function generatePresetPlan(input: AdvisorInput): PlanCard {
  const days = clamp(input.daysPerWeek, MIN_DAYS, MAX_DAYS);
  const goal = GOAL_CONF[input.goal] ?? GOAL_CONF.muscle;
  const eqDB = EXERCISE_DB[input.equipment] ?? EXERCISE_DB.gym;
  const exCount = input.experience === "beginner" ? 4 : 5;
  const sets = Math.max(2, goal.sets + (input.experience === "beginner" ? -1 : 0));
  const splitLabel = SPLIT_LABEL[days] ?? SPLIT_LABEL[3];

  const planDays = splitForDays(days).map((key) =>
    buildDay(eqDB, DAY_TEMPLATES[key], exCount, sets, goal.reps)
  );

  return {
    name: `${goal.name} · ${splitLabel}`,
    goalLabel: goal.label,
    splitLabel,
    perWeek: days,
    days: planDays,
    note: buildNote(input),
    source: "preset",
  };
}

/** 校验并规范化输入（前端/接口共用）。非法值回退到安全默认。 */
export function normalizeInput(raw: Partial<AdvisorInput> | undefined | null): AdvisorInput {
  const goals: Goal[] = ["muscle", "fatloss", "shape", "strength"];
  const equipments: Equipment[] = ["gym", "dumbbell", "bodyweight"];
  const experiences: Experience[] = ["beginner", "intermediate"];
  return {
    goal: raw && goals.includes(raw.goal as Goal) ? (raw.goal as Goal) : "muscle",
    equipment:
      raw && equipments.includes(raw.equipment as Equipment) ? (raw.equipment as Equipment) : "gym",
    experience:
      raw && experiences.includes(raw.experience as Experience)
        ? (raw.experience as Experience)
        : "beginner",
    daysPerWeek: clamp(Number(raw?.daysPerWeek ?? 3), MIN_DAYS, MAX_DAYS),
  };
}

/**
 * 把真 AI 返回的 JSON 归一为 PlanCard。
 * 校验失败（缺字段/空数组）返回 null，让上层回退到预设卡。
 */
export function coerceAIPlan(raw: unknown, input: AdvisorInput): PlanCard | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const rawDays = Array.isArray(obj.days) ? obj.days : null;
  if (!rawDays || rawDays.length === 0) return null;

  const days: PlanDay[] = [];
  for (const d of rawDays) {
    if (!d || typeof d !== "object") continue;
    const dd = d as Record<string, unknown>;
    const rawEx = Array.isArray(dd.exercises) ? dd.exercises : [];
    const exercises: PlanExercise[] = [];
    for (const e of rawEx) {
      if (!e || typeof e !== "object") continue;
      const ee = e as Record<string, unknown>;
      const name = typeof ee.name === "string" ? ee.name.trim() : "";
      if (!name) continue;
      exercises.push({
        name: name.slice(0, 40),
        muscle: typeof ee.muscle === "string" ? ee.muscle.slice(0, 24) : "",
        sets: clamp(Number(ee.sets ?? 3), 1, 10),
        reps: typeof ee.reps === "string" ? ee.reps.slice(0, 16) : String(ee.reps ?? "8-12"),
      });
    }
    if (exercises.length === 0) continue;
    days.push({
      title: typeof dd.title === "string" ? dd.title.slice(0, 40) : "训练日",
      exercises: exercises.slice(0, 8),
    });
  }
  if (days.length === 0) return null;

  const goal = GOAL_CONF[input.goal] ?? GOAL_CONF.muscle;
  const splitLabel = SPLIT_LABEL[clamp(input.daysPerWeek, MIN_DAYS, MAX_DAYS)] ?? SPLIT_LABEL[3];
  const name = typeof obj.name === "string" && obj.name.trim() ? obj.name.trim().slice(0, 40) : `${goal.name} · ${splitLabel}`;
  const note = typeof obj.note === "string" && obj.note.trim() ? obj.note.trim().slice(0, 200) : buildNote(input);

  return {
    name,
    goalLabel: goal.label,
    splitLabel,
    perWeek: days.length,
    days: days.slice(0, MAX_DAYS),
    note,
    source: "ai",
  };
}
