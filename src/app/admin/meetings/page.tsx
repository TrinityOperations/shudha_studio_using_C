import type { Metadata } from "next";

import { MeetingStatusForm } from "@/components/admin/meeting-status-form";
import { PageContainer } from "@/components/public/page-container";
import { requireAdmin } from "@/lib/auth/server";
import { getMeetingRequests } from "@/lib/meetings";
import { meetingStatuses, type MeetingStatus } from "@/types/meetings";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { translate } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Meeting requests | Admin | Shudha Studio",
  description: "Manage Shudha Studio meeting requests.",
};

export default async function AdminMeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const status = meetingStatuses.includes(params.status as MeetingStatus)
    ? (params.status as MeetingStatus)
    : undefined;
  const requests = await getMeetingRequests(status);
  const language = await getPreferredLanguage();

  return (
    <main className="min-h-screen bg-slate-100 py-10">
      <PageContainer>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-rose-700 uppercase">
              {translate(language, "administration")}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {translate(language, "meetingRequests")}
            </h1>
          </div>
          <a className="font-semibold text-rose-700 hover:underline" href="/admin">
            {translate(language, "backToAdmin")}
          </a>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <a
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            href="/admin/meetings"
          >
            {translate(language, "all")}
          </a>
          {meetingStatuses.map((option) => (
            <a
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm capitalize"
              href={`/admin/meetings?status=${option}`}
              key={option}
            >
              {option}
            </a>
          ))}
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {requests.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">{translate(language, "customer")}</th>
                    <th className="px-4 py-3">
                      {translate(language, "preferredTime")}
                    </th>
                    <th className="px-4 py-3">
                      {translate(language, "messageOptional")}
                    </th>
                    <th className="px-4 py-3">{translate(language, "status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-4 py-4 align-top">
                        <p className="font-semibold text-slate-950">{request.name}</p>
                        <p className="mt-1 text-slate-600">{request.phone}</p>
                        {request.email ? (
                          <p className="text-slate-600">{request.email}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 align-top whitespace-nowrap text-slate-700">
                        {new Date(request.preferred_at).toLocaleString()}
                      </td>
                      <td className="max-w-xs px-4 py-4 align-top text-slate-600">
                        {request.message || "—"}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <MeetingStatusForm id={request.id} status={request.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-10 text-center text-slate-600">
              {translate(language, "noMeetingRequests")}
            </p>
          )}
        </section>
      </PageContainer>
    </main>
  );
}
