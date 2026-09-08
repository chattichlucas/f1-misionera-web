import Link from "next/link";
import { getDict } from "@/lib/i18n-server";

export default async function NotFound() {
  const d = await getDict();
  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-2 text-3xl font-extrabold">{d.pages.notFoundTitle}</h1>
      <Link href="/" className="btn btn-primary mt-6">
        {d.pages.backHome}
      </Link>
    </div>
  );
}
