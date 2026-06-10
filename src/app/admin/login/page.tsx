"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-[#3D2B1F] mb-2">DAY 1</h1>
          <p className="text-sm text-[#A08060]">管理后台</p>
        </div>

        <form action={formAction} className="bg-white rounded-2xl p-8 shadow-sm border border-[#C9A88C]/15">
          <label className="block text-xs font-medium text-[#6B4E3D] mb-2">
            管理密码
          </label>
          <input
            type="password"
            name="password"
            required
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-[#C9A88C]/20 bg-[#FAF6F1] text-[#3D2B1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/20 focus:border-[#5C3D2E]/40 transition-all"
            placeholder="输入密码..."
          />

          {state?.error && (
            <p className="mt-3 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-5 w-full py-3 bg-[#3D2B1F] text-white text-sm font-medium rounded-xl hover:bg-[#5C3D2E] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "登录中..." : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}
