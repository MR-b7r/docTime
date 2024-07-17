import { DataTable } from "@/components/table/DataTable";
import StatCard from "@/components/StatCard";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { columns } from "@/components/table/columns";

const Admin = async () => {
  const appointments = await getRecentAppointmentList();

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <Link className="cursor-pointer" href={"/"}>
          <Image
            src="/assets/icons/logo-full.svg"
            height={32}
            width={162}
            alt="logo"
            className="h-8 w-fit"
          />
        </Link>
        <div className="flex items-center gap-2">
          <p className="text-14-semibold">Admin Dashboard</p>
          <Image
            src="/assets/images/admin.png"
            width={32}
            height={32}
            className="size-8"
            alt="logo"
          />
        </div>
      </header>

      <main className="admin-main">
        <section className="w-full space-y-4">
          <h1 className="header">Welcome Admin</h1>
          <p className="text-dark-700">
            Start the day with managing new appointments
          </p>
        </section>

        <section className="admin-stat">
          <StatCard
            type={"appointments"}
            count={appointments.scheduledCount}
            label={"Scheduled appointment"}
            icon={"/assets/icons/appointments.svg"}
          />
          <StatCard
            type={"pending"}
            count={appointments.pendingCount}
            label={"Pending appointment"}
            icon={"/assets/icons/pending.svg"}
          />
          <StatCard
            type={"cancelled"}
            count={appointments.cancelledCount}
            label={"Cancelled appointment"}
            icon={"/assets/icons/cancelled.svg"}
          />
        </section>
        <DataTable columns={columns} data={appointments.documents} />
      </main>
    </div>
  );
};

export default Admin;
